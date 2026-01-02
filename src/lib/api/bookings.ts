import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

export interface BookingWithSchedule extends Booking {
  schedule: {
    id: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string | null;
    price_tzs: number;
    route: {
      id: string;
      departure_region: { name: string; code: string } | null;
      destination_region: { name: string; code: string } | null;
      departure_terminal: string | null;
      arrival_terminal: string | null;
      operator: {
        company_name: string;
        logo_url: string | null;
      } | null;
    } | null;
    bus: {
      id: string;
      bus_number: string;
      bus_type: string | null;
      amenities: string[] | null;
    } | null;
  } | null;
  payments?: Array<{
    id: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount_tzs: number;
    payment_method: string;
    paid_at: string | null;
  }>;
}

export const bookingsApi = {
  // Get user's bookings
  async getUserBookings(userId: string): Promise<BookingWithSchedule[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedule:schedules(
          id,
          departure_date,
          departure_time,
          arrival_time,
          price_tzs,
          route:routes(
            id,
            departure_region:regions!routes_departure_region_id_fkey(name, code),
            destination_region:regions!routes_destination_region_id_fkey(name, code),
            departure_terminal,
            arrival_terminal,
            operator:bus_operators(
              company_name,
              logo_url
            )
          ),
          bus:buses(
            id,
            bus_number,
            plate_number,
            bus_type,
            amenities
          )
        ),
        payments(
          id,
          status,
          amount_tzs,
          payment_method,
          paid_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BookingWithSchedule[];
  },

  // Get booking by ID
  async getBookingById(bookingId: string, userId: string): Promise<BookingWithSchedule | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedule:schedules(
          id,
          departure_date,
          departure_time,
          arrival_time,
          price_tzs,
          route:routes(
            id,
            departure_region:regions!routes_departure_region_id_fkey(name, code),
            destination_region:regions!routes_destination_region_id_fkey(name, code),
            departure_terminal,
            arrival_terminal,
            operator:bus_operators(
              company_name,
              logo_url
            )
          ),
          bus:buses(
            id,
            bus_number,
            plate_number,
            bus_type,
            amenities
          )
        ),
        payments(
          id,
          status,
          amount_tzs,
          payment_method,
          paid_at
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as BookingWithSchedule | null;
  },

  // Create booking
  async createBooking(booking: BookingInsert & { passengers?: Array<{
    seat_number: number;
    name: string;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    category: 'adult' | 'student' | 'child';
    age?: number;
    phone?: string;
    email?: string;
  }> }): Promise<Booking> {
    const { passengers, ...bookingData } = booking;
    
    // Create booking first
    const { data: bookingResult, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) throw bookingError;
    if (!bookingResult) throw new Error('Failed to create booking');

    // Create passenger records if provided
    if (passengers && passengers.length > 0) {
      const passengerRecords = passengers.map((p) => ({
        booking_id: bookingResult.id,
        seat_number: p.seat_number,
        name: p.name,
        gender: p.gender,
        category: p.category,
        age: p.age || null,
        phone: p.phone || null,
        email: p.email || null,
      }));

      const { error: passengersError } = await supabase
        .from('passengers')
        .insert(passengerRecords);

      if (passengersError) {
        // If passenger creation fails, try to delete the booking
        await supabase.from('bookings').delete().eq('id', bookingResult.id);
        throw passengersError;
      }
    }

    return bookingResult;
  },

  // Cancel booking
  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<void> {
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', userId);

    if (bookingError) throw bookingError;

    // Create cancellation record
    const { error: cancelError } = await supabase
      .from('cancellations')
      .insert({
        booking_id: bookingId,
        cancelled_by: userId,
        reason: reason || null,
      });

    if (cancelError) throw cancelError;

    // Send cancellation email
    try {
      await supabase.functions.invoke('send-booking-email', {
        body: {
          booking_id: bookingId,
          type: 'cancellation',
        },
      });
    } catch (emailError) {
      // Only log in development
      if (typeof window !== 'undefined' && import.meta.env.DEV) {
        console.error('Failed to send cancellation email:', emailError);
      }
      // Don't fail cancellation if email fails
    }
  },
};

