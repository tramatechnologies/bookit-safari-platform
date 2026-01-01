import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { useAuth } from './use-auth';

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingsApi.getUserBookings(user!.id),
    enabled: !!user,
  });
};

export const useBooking = (bookingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['booking', bookingId, user?.id],
    queryFn: () => bookingsApi.getBookingById(bookingId, user!.id),
    enabled: !!user && !!bookingId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      bookingsApi.cancelBooking(bookingId, user!.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
    },
  });
};

