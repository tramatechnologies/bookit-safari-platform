import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Trip = Database['public']['Tables']['trips']['Row'];

export interface TripWithScheduleDetails extends Trip {
  schedule?: {
    id: string;
    route_id: string | null;
    bus_id: string | null;
    departure_date: string;
    departure_time: string | null;
    arrival_time: string | null;
    price_tzs: number | null;
    route?: {
      id: string;
      departure_region?: { name: string } | null;
      destination_region?: { name: string } | null;
      departure_terminal: string | null;
      arrival_terminal: string | null;
    } | null;
    bus?: {
      id: string;
      plate_number: string;
      bus_type: string | null;
      total_seats: number;
    } | null;
  } | null;
}

export interface TripGenerationResult {
  generated_trip_id: string;
  schedule_id: string;
  trip_date: string;
  available_seats: number;
  status: string;
}

export const tripsApi = {
  // Generate trips from schedules for upcoming dates
  async generateTripsFromSchedules(
    daysAhead: number = 30,
    scheduleId?: string
  ): Promise<TripGenerationResult[]> {
    const { data, error } = await (supabase.rpc as any)(
      'generate_trips_from_schedules',
      {
        p_days_ahead: daysAhead,
        p_schedule_id: scheduleId || null,
      }
    );

    if (error) throw error;
    return (data as TripGenerationResult[]) || [];
  },

  // Generate recurring trips for all schedules
  async generateRecurringTrips(daysAhead: number = 30): Promise<any> {
    const { data, error } = await (supabase.rpc as any)(
      'generate_recurring_trips',
      {
        p_days_ahead: daysAhead,
      }
    );

    if (error) throw error;
    return data?.[0] || null;
  },

  // Get trips for a specific date range
  async getTripsByDateRange(startDate: string, endDate: string): Promise<TripWithScheduleDetails[]> {
    const { data, error } = await (supabase
      .from('trips') as any)
      .select(
        `
        *,
        schedule:schedule_id(*)
      `
      )
      .gte('trip_date', startDate)
      .lte('trip_date', endDate)
      .order('trip_date', { ascending: true });

    if (error) throw error;
    return (data as TripWithScheduleDetails[]) || [];
  },

  // Get upcoming trips for a specific schedule
  async getUpcomingTripsForSchedule(scheduleId: string, daysAhead: number = 7): Promise<TripWithScheduleDetails[]> {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await (supabase
      .from('trips') as any)
      .select(
        `
        *,
        schedule:schedule_id(*)
      `
      )
      .eq('schedule_id', scheduleId)
      .gte('trip_date', startDate)
      .lte('trip_date', endDate)
      .order('trip_date', { ascending: true });

    if (error) throw error;
    return (data as TripWithScheduleDetails[]) || [];
  },

  // Get trip by ID
  async getTripById(tripId: string): Promise<TripWithScheduleDetails | null> {
    const { data, error } = await (supabase
      .from('trips') as any)
      .select(
        `
        *,
        schedule:schedule_id(*)
      `
      )
      .eq('id', tripId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Trip not found
      }
      throw error;
    }
    return data as TripWithScheduleDetails;
  },

  // Update trip status
  async updateTripStatus(tripId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .update({ status })
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update available seats for a trip
  async updateTripAvailableSeats(tripId: string, availableSeats: number): Promise<Trip> {
    const { data, error } = await supabase
      .from('trips')
      .update({ available_seats: availableSeats })
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get trip statistics
  async getTripStatistics(startDate?: string, endDate?: string): Promise<any> {
    let query = supabase
      .from('trips')
      .select('id, trip_date, status, available_seats', { count: 'exact' });

    if (startDate) {
      query = query.gte('trip_date', startDate);
    }
    if (endDate) {
      query = query.lte('trip_date', endDate);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    const stats = {
      total_trips: count || 0,
      by_status: {} as Record<string, number>,
      by_date: {} as Record<string, number>,
    };

    if (data) {
      data.forEach((trip) => {
        // Count by status
        stats.by_status[trip.status] = (stats.by_status[trip.status] || 0) + 1;
        
        // Count by date
        stats.by_date[trip.trip_date] = (stats.by_date[trip.trip_date] || 0) + 1;
      });
    }

    return stats;
  },
};
