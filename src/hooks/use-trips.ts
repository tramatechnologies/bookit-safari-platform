import { useMutation, useQuery } from '@tanstack/react-query';
import { tripsApi, type TripWithScheduleDetails, type TripGenerationResult } from '@/lib/api/trips';

// Generate trips from schedules
export const useGenerateTripsFromSchedules = () => {
  return useMutation({
    mutationFn: ({ daysAhead, scheduleId }: { daysAhead?: number; scheduleId?: string }) =>
      tripsApi.generateTripsFromSchedules(daysAhead, scheduleId),
  });
};

// Generate recurring trips for all schedules
export const useGenerateRecurringTrips = () => {
  return useMutation({
    mutationFn: ({ daysAhead }: { daysAhead?: number }) =>
      tripsApi.generateRecurringTrips(daysAhead),
  });
};

// Get trips by date range
export const useTripsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['trips', 'dateRange', startDate, endDate],
    queryFn: () => tripsApi.getTripsByDateRange(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get upcoming trips for a specific schedule
export const useUpcomingTripsForSchedule = (scheduleId: string, daysAhead: number = 7) => {
  return useQuery({
    queryKey: ['trips', 'schedule', scheduleId, daysAhead],
    queryFn: () => tripsApi.getUpcomingTripsForSchedule(scheduleId, daysAhead),
    enabled: !!scheduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get trip by ID
export const useTrip = (tripId: string) => {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getTripById(tripId),
    enabled: !!tripId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update trip status
export const useUpdateTripStatus = () => {
  return useMutation({
    mutationFn: ({ tripId, status }: { tripId: string; status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' }) =>
      tripsApi.updateTripStatus(tripId, status),
  });
};

// Update trip available seats
export const useUpdateTripAvailableSeats = () => {
  return useMutation({
    mutationFn: ({ tripId, availableSeats }: { tripId: string; availableSeats: number }) =>
      tripsApi.updateTripAvailableSeats(tripId, availableSeats),
  });
};

// Get trip statistics
export const useTripStatistics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['trips', 'statistics', startDate, endDate],
    queryFn: () => tripsApi.getTripStatistics(startDate, endDate),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
