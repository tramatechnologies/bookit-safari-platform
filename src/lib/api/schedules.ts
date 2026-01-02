import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

export interface ScheduleWithDetails extends Schedule {
  route: {
    id: string;
    departure_region_id: string | null;
    destination_region_id: string | null;
    departure_region: { id: string; name: string; code: string } | null;
    destination_region: { id: string; name: string; code: string } | null;
    departure_terminal: string | null;
    arrival_terminal: string | null;
    duration_hours: number | null;
    distance_km: number | null;
    operator_id: string | null;
    operator?: { id: string; company_name: string; status: string } | null;
  } | null;
  bus: {
    id: string;
    plate_number: string;
    bus_type: string | null;
    total_seats: number;
    amenities: string[] | null;
    seat_layout?: string | null;
  } | null;
  operator: {
    id: string;
    company_name: string;
    status: string;
    logo_url?: string | null;
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
    // Use database function to bypass RLS issues with PostgREST
    const { data: schedules, error } = await supabase.rpc('get_active_schedules', {
      p_departure_date: filters.date || new Date().toISOString().split('T')[0],
      p_min_price: filters.minPrice || null,
      p_max_price: filters.maxPrice || null,
      p_departure_region_id: filters.fromRegionId || null,
      p_destination_region_id: filters.toRegionId || null,
    });

    if (error) throw error;
    if (!schedules || schedules.length === 0) return [];

    // Extract route and bus IDs
    const routeIds = [...new Set(schedules.map((s) => s.route_id).filter(Boolean) as string[])];
    const busIds = [...new Set(schedules.map((s) => s.bus_id).filter(Boolean) as string[])];

    // Fetch routes separately using database function to bypass RLS issues
    let routes: any[] = [];
    if (routeIds.length > 0) {
      const { data: routesData, error: routesError } = await supabase.rpc('get_routes_by_ids', {
        p_route_ids: routeIds,
      });
      if (routesError) {
        console.error('Error fetching routes:', routesError);
        // Fallback to empty array
      } else {
        routes = routesData || [];
      }
    }

    // Fetch buses separately using database function to bypass RLS issues
    let buses: any[] = [];
    if (busIds.length > 0) {
      const { data: busesData, error: busesError } = await supabase.rpc('get_buses_by_ids', {
        p_bus_ids: busIds,
      });
      if (busesError) {
        console.error('Error fetching buses:', busesError);
        // Fallback to empty array
      } else {
        buses = busesData || [];
      }
    }

    // Create maps for quick lookup
    const routesMap = new Map(routes?.map((r) => [r.id, r]) || []);
    const busesMap = new Map(buses?.map((b) => [b.id, b]) || []);

    // Combine schedules with routes and buses
    let results = schedules.map((schedule) => {
      const route = schedule.route_id ? routesMap.get(schedule.route_id) : null;
      const bus = schedule.bus_id ? busesMap.get(schedule.bus_id) : null;
      
      return {
        ...schedule,
        route: route ? {
          id: route.id,
          departure_region_id: route.departure_region_id,
          destination_region_id: route.destination_region_id,
          departure_terminal: route.departure_terminal,
          arrival_terminal: route.arrival_terminal,
          duration_hours: route.duration_hours,
          distance_km: route.distance_km,
          operator_id: route.operator_id,
          departure_region: null, // Will be populated later
          destination_region: null, // Will be populated later
        } : null,
        bus: bus ? {
          id: bus.id,
          plate_number: bus.plate_number,
          bus_type: bus.bus_type,
          total_seats: bus.total_seats,
          amenities: bus.amenities,
          seat_layout: bus.seat_layout || null,
        } : null,
      } as ScheduleWithDetails;
    });

    // Get operator IDs from routes and check which are approved
    const operatorIds = [...new Set(
      results
        .map((s) => s.route?.operator_id)
        .filter(Boolean) as string[]
    )];
    
    if (operatorIds.length > 0) {
      // Query operators by IDs using database function to bypass RLS issues
      let operators: any[] = [];
      const { data: operatorsData, error: operatorsError } = await supabase.rpc('get_bus_operators_by_ids', {
        p_operator_ids: operatorIds,
      });
      if (operatorsError) {
        console.error('Error fetching operators:', operatorsError);
        // Fallback to empty array
      } else {
        operators = operatorsData || [];
      }
      
      const approvedOperatorIds = operators
        .filter((op) => op.status === 'approved')
        .map((op) => op.id);
      
      // Filter to only include schedules from approved operators
      results = results.filter((schedule) => {
        const operatorId = schedule.route?.operator_id;
        return operatorId && approvedOperatorIds.includes(operatorId);
      });
      
      // Add operator information to results
      results = results.map((schedule) => {
        const operatorId = schedule.route?.operator_id;
        const operator = operators?.find((op) => op.id === operatorId);
        return {
          ...schedule,
          route: schedule.route ? {
            ...schedule.route,
            operator: operator ? {
              id: operator.id,
              company_name: operator.company_name,
              status: operator.status,
              logo_url: operator.logo_url || null,
            } : null,
          } : null,
          operator: operator ? {
            id: operator.id,
            company_name: operator.company_name,
            status: operator.status,
            logo_url: operator.logo_url || null,
          } : null,
        } as ScheduleWithDetails;
      });
    } else {
      // No operators found, return empty
      return [];
    }
    
    // Get region IDs and fetch regions separately
    const regionIds = [...new Set(
      results
        .flatMap((s) => [
          s.route?.departure_region_id,
          s.route?.destination_region_id,
        ])
        .filter(Boolean) as string[]
    )];
    
    let regionsMap = new Map<string, { id: string; name: string; code: string }>();
    if (regionIds.length > 0) {
      const { data: regions } = await supabase
        .from('regions')
        .select('id, name, code')
        .in('id', regionIds);
      
      if (regions) {
        regions.forEach((r) => {
          regionsMap.set(r.id, r);
        });
      }
    }
    
    // Add region information to results
    results = results.map((schedule) => {
      const route = schedule.route;
      if (!route) return schedule;
      
      const departureRegion = route.departure_region_id
        ? regionsMap.get(route.departure_region_id)
        : null;
      const destinationRegion = route.destination_region_id
        ? regionsMap.get(route.destination_region_id)
        : null;
      
      return {
        ...schedule,
        route: {
          ...route,
          departure_region: departureRegion,
          destination_region: destinationRegion,
        },
      } as ScheduleWithDetails;
    });
    
    // Filter by route regions if specified (application layer filtering)
    if (filters.fromRegionId || filters.toRegionId) {
      results = results.filter((schedule) => {
        const route = schedule.route;
        if (!route) return false;
        
        if (filters.fromRegionId) {
          const departureRegionId = route.departure_region?.id || route.departure_region_id;
          if (departureRegionId !== filters.fromRegionId) return false;
        }
        
        if (filters.toRegionId) {
          const destinationRegionId = route.destination_region?.id || route.destination_region_id;
          if (destinationRegionId !== filters.toRegionId) return false;
        }
        
        return true;
      });
    }
    
    if (filters.busType) {
      results = results.filter(
        (schedule) => schedule.bus?.bus_type?.toLowerCase() === filters.busType?.toLowerCase()
      );
    }

    return results;
  },

  // Get schedule by ID
  async getScheduleById(scheduleId: string): Promise<ScheduleWithDetails | null> {
    // Use database function to get schedule by ID
    const { data: scheduleData, error: scheduleError } = await supabase.rpc('get_schedule_by_id', {
      p_schedule_id: scheduleId,
    });

    if (scheduleError) throw scheduleError;
    
    // Get the schedule (should be single result)
    const schedule = scheduleData?.[0];
    if (!schedule) return null;

    // Fetch route, bus, regions, and operator separately
    const routeId = schedule.route_id;
    const busId = schedule.bus_id;

    if (!routeId || !busId) return null;

    // Fetch route, bus, and operator in parallel
    const [routeRes, busRes] = await Promise.all([
      supabase.rpc('get_routes_by_ids', { p_route_ids: [routeId] }),
      supabase.rpc('get_buses_by_ids', { p_bus_ids: [busId] }),
    ]);

    const route = routeRes.data?.[0] || null;
    const bus = busRes.data?.[0] || null;

    if (!route || !bus) return null;

    // Get region IDs and fetch regions
    const regionIds = [
      route.departure_region_id,
      route.destination_region_id,
    ].filter(Boolean) as string[];

    let regionsMap = new Map<string, { id: string; name: string; code: string }>();
    if (regionIds.length > 0) {
      const { data: regions } = await supabase
        .from('regions')
        .select('id, name, code')
        .in('id', regionIds);
      
      if (regions) {
        regions.forEach((r) => {
          regionsMap.set(r.id, r);
        });
      }
    }

    // Get operator
    const operatorId = route.operator_id;
    let operator = null;
    if (operatorId) {
      const { data: operators } = await supabase.rpc('get_bus_operators_by_ids', {
        p_operator_ids: [operatorId],
      });
      operator = operators?.[0] || null;
    }

    // Combine all data
    return {
      ...schedule,
      route: {
        ...route,
        departure_region: route.departure_region_id ? regionsMap.get(route.departure_region_id) || null : null,
        destination_region: route.destination_region_id ? regionsMap.get(route.destination_region_id) || null : null,
        operator: operator ? {
          id: operator.id,
          company_name: operator.company_name,
          status: operator.status,
          logo_url: operator.logo_url || null,
        } : null,
      },
      bus: bus ? {
        ...bus,
        seat_layout: bus.seat_layout || null,
      } : null,
      operator: operator ? {
        id: operator.id,
        company_name: operator.company_name,
        status: operator.status,
        logo_url: operator.logo_url || null,
      } : null,
    } as ScheduleWithDetails;
  },

  // Get available seats for a schedule
  async getAvailableSeats(scheduleId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_available_seats', {
      p_schedule_id: scheduleId,
    });

    if (error) throw error;
    return data || 0;
  },

  // Get booked seat numbers for a schedule on a specific date
  async getBookedSeats(scheduleId: string, departureDate: string): Promise<number[]> {
    const { data, error } = await supabase.rpc('get_booked_seats', {
      p_schedule_id: scheduleId,
      p_departure_date: departureDate,
    });

    if (error) throw error;
    return data || [];
  },
};

