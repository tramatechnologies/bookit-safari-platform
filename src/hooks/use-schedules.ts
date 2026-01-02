import { useQuery } from '@tanstack/react-query';
import { schedulesApi, type SearchFilters } from '@/lib/api/schedules';

export const useSearchSchedules = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['schedules', 'search', filters],
    queryFn: () => schedulesApi.searchSchedules(filters),
    enabled: !!(filters.fromRegionId && filters.toRegionId && filters.date),
  });
};

export const useSchedule = (scheduleId: string) => {
  return useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => schedulesApi.getScheduleById(scheduleId),
    enabled: !!scheduleId,
  });
};

export const useAvailableSeats = (scheduleId: string) => {
  return useQuery({
    queryKey: ['schedule', scheduleId, 'available-seats'],
    queryFn: () => schedulesApi.getAvailableSeats(scheduleId),
    enabled: !!scheduleId,
  });
};

export const useBookedSeats = (scheduleId: string, departureDate: string) => {
  return useQuery({
    queryKey: ['schedule', scheduleId, 'booked-seats', departureDate],
    queryFn: () => schedulesApi.getBookedSeats(scheduleId, departureDate),
    enabled: !!(scheduleId && departureDate),
  });
};

