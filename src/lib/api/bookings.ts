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
    } | null;
    bus: {
      id: string;
      bus_number: string;
      bus_type: string | null;
      amenities: string[] | null;
    } | null;
  } | null;
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
            arrival_terminal
          ),
          bus:buses(
            id,
            bus_number,
            bus_type,
            amenities
          )
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
            arrival_terminal
          ),
          bus:buses(
            id,
            bus_number,
            bus_type,
            amenities
          )
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as BookingWithSchedule | null;
  },

  // Create booking
  async createBooking(booking: BookingInsert): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data;
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

