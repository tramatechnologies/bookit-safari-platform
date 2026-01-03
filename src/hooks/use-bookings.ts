import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cachedBookingsApi } from '@/lib/api/cached-bookings';
import { useAuth } from './use-auth';

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const bookings = await cachedBookingsApi.getUserBookings(user!.id);
      // Filter out cancelled bookings from the query result
      return bookings.filter((booking: any) => booking.status !== 'cancelled');
    },
    enabled: !!user,
  });
};

export const useBooking = (bookingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['booking', bookingId, user?.id],
    queryFn: () => cachedBookingsApi.getBookingById(bookingId, user!.id),
    enabled: !!user && !!bookingId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: cachedBookingsApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      console.log('🔵 Starting cancellation for booking:', bookingId);
      try {
        const result = await cachedBookingsApi.cancelBooking(bookingId, user!.id, reason);
        console.log('✅ Cancellation successful:', result);
        return result;
      } catch (error) {
        console.error('❌ Cancellation failed:', error);
        throw error;
      }
    },
    onSuccess: (_, { bookingId }) => {
      console.log('🟢 onSuccess callback triggered for:', bookingId);
      // Update cached data immediately with optimistic update
      if (user?.id) {
        queryClient.setQueryData(['bookings', user.id], (oldData: any) => {
          if (!oldData) return oldData;
          const updated = oldData.map((booking: any) =>
            booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
          );
          console.log('📝 Cache updated, cancelled booking:', updated.find((b: any) => b.id === bookingId));
          return updated;
        });
      }
      // Refetch after a short delay to ensure backend has processed the change
      setTimeout(() => {
        console.log('🔄 Starting refetch after 500ms');
        queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
      }, 500);
    },
    onError: (error) => {
      console.error('💥 Mutation error:', error);
    },
  });
};

