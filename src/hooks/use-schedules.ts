import { useQuery } from '@tanstack/react-query';
import { schedulesApi, type SearchFilters } from '@/lib/api/schedules';
import { format } from 'date-fns';

export const useSearchSchedules = (filters: SearchFilters) => {
  // If no date is provided, use tomorrow
  const defaultDate = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const filtersWithDefaults = {
    ...filters,
    date: filters.date || defaultDate,
  };

  return useQuery({
    queryKey: ['schedules', 'search', filtersWithDefaults],
    queryFn: () => schedulesApi.searchSchedules(filtersWithDefaults),
    // Enable query if we have a date (always true now since we set a default)
    enabled: !!filtersWithDefaults.date,
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

