import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

export interface ScheduleWithDetails extends Schedule {
  route: {
    id: string;
    departure_region: { id: string; name: string; code: string } | null;
    destination_region: { id: string; name: string; code: string } | null;
    departure_terminal: string | null;
    arrival_terminal: string | null;
    duration_hours: number | null;
    distance_km: number | null;
  } | null;
  bus: {
    id: string;
    bus_number: string;
    plate_number: string;
    bus_type: string | null;
    total_seats: number;
    amenities: string[] | null;
  } | null;
  operator: {
    id: string;
    company_name: string;
    status: string;
  } | null;
}

export interface SearchFilters {
  fromRegionId?: string;
  toRegionId?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  busType?: string;
}

export const schedulesApi = {
  // Search schedules
  async searchSchedules(filters: SearchFilters): Promise<ScheduleWithDetails[]> {
    let query = supabase
      .from('schedules')
      .select(`
        *,
        route:routes(
          id,
          departure_region:regions!routes_departure_region_id_fkey(id, name, code),
          destination_region:regions!routes_destination_region_id_fkey(id, name, code),
          departure_terminal,
          arrival_terminal,
          duration_hours,
          distance_km,
          operator_id,
          operator:bus_operators!routes_operator_id_fkey(id, company_name, status)
        ),
        bus:buses(
          id,
          bus_number,
          plate_number,
          bus_type,
          total_seats,
          amenities
        )
      `)
      .eq('is_active', true)
      .gte('departure_date', filters.date || new Date().toISOString().split('T')[0]);

    // Filter by route regions
    if (filters.fromRegionId || filters.toRegionId) {
      // First, get routes that match the region criteria and have approved operators
      const routeQuery = supabase
        .from('routes')
        .select(`
          id,
          operator:bus_operators!routes_operator_id_fkey(
            id,
            status
          )
        `)
        .eq('is_active', true);

      if (filters.fromRegionId) {
        routeQuery.eq('departure_region_id', filters.fromRegionId);
      }
      if (filters.toRegionId) {
        routeQuery.eq('destination_region_id', filters.toRegionId);
      }

      const { data: routes } = await routeQuery;
      
      // Filter to only include routes from approved operators
      const routeIds = routes
        ?.filter((r) => r.operator && (r.operator as any).status === 'approved')
        .map((r) => r.id) || [];
      
      if (routeIds.length > 0) {
        query = query.in('route_id', routeIds);
      } else {
        // No routes match, return empty
        return [];
      }
    } else {
      // If no region filters, still filter by approved operators
      // Get all routes from approved operators
      const { data: approvedRoutes } = await supabase
        .from('routes')
        .select(`
          id,
          operator:bus_operators!routes_operator_id_fkey(
            id,
            status
          )
        `)
        .eq('is_active', true);

      const approvedRouteIds = approvedRoutes
        ?.filter((r) => r.operator && (r.operator as any).status === 'approved')
        .map((r) => r.id) || [];

      if (approvedRouteIds.length > 0) {
        query = query.in('route_id', approvedRouteIds);
      } else {
        return [];
      }
    }

    // Filter by price
    if (filters.minPrice) {
      query = query.gte('price_tzs', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price_tzs', filters.maxPrice);
    }

    // Filter by bus type (if needed, would need to join with buses)
    if (filters.busType) {
      // This would require a more complex query
      // For now, we'll filter in the application layer
    }

    const { data, error } = await query.order('departure_time', { ascending: true });

    if (error) throw error;

    // Filter by bus type if specified and ensure only approved operators
    let results = (data || []) as ScheduleWithDetails[];
    
    // Filter to only include schedules from approved operators
    results = results.filter((schedule) => {
      const operator = schedule.route?.operator as any;
      return operator && operator.status === 'approved';
    });
    
    if (filters.busType) {
      results = results.filter(
        (schedule) => schedule.bus?.bus_type?.toLowerCase() === filters.busType?.toLowerCase()
      );
    }

    return results;
  },

  // Get schedule by ID
  async getScheduleById(scheduleId: string): Promise<ScheduleWithDetails | null> {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        route:routes(
          id,
          departure_region:regions!routes_departure_region_id_fkey(id, name, code),
          destination_region:regions!routes_destination_region_id_fkey(id, name, code),
          departure_terminal,
          arrival_terminal,
          duration_hours,
          distance_km,
          operator_id,
          operator:bus_operators!routes_operator_id_fkey(id, company_name, status)
        ),
        bus:buses(
          id,
          bus_number,
          plate_number,
          bus_type,
          total_seats,
          amenities
        )
      `)
      .eq('id', scheduleId)
      .single();

    if (error) throw error;
    return data as ScheduleWithDetails | null;
  },

  // Get available seats for a schedule
  async getAvailableSeats(scheduleId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_available_seats', {
      p_schedule_id: scheduleId,
    });

    if (error) throw error;
    return data || 0;
  },
};

