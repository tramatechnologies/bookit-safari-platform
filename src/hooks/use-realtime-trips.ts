import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface TripUpdate {
  trip_id: string;
  schedule_id: string;
  available_seats: number;
  status: string;
}

export const useRealtimeTrips = (scheduleIds?: string[]) => {
  const queryClient = useQueryClient();
  const [activeSubscriptions, setActiveSubscriptions] = useState<RealtimeChannel[]>([]);
  const [tripUpdates, setTripUpdates] = useState<Record<string, TripUpdate>>({});

  useEffect(() => {
    if (!scheduleIds || scheduleIds.length === 0) {
      return;
    }

    // Subscribe to trips table changes
    const tripsChannel = supabase
      .channel('trips-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `schedule_id=in.(${scheduleIds.join(',')})`,
        },
        (payload) => {
          const trip = payload.new as any;
          
          if (trip) {
            setTripUpdates((prev) => ({
              ...prev,
              [trip.id]: {
                trip_id: trip.id,
                schedule_id: trip.schedule_id,
                available_seats: trip.available_seats,
                status: trip.status,
              },
            }));

            // Invalidate trip queries to refresh UI
            queryClient.invalidateQueries({
              queryKey: ['trips-by-schedule', trip.schedule_id],
            });
            queryClient.invalidateQueries({
              queryKey: ['trips-statistics'],
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Trips realtime subscription ${status}`);
      });

    // Subscribe to bookings changes for indirect trip updates
    const bookingsChannel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          // Invalidate all trip-related queries when bookings change
          queryClient.invalidateQueries({
            queryKey: ['trips'],
          });
          queryClient.invalidateQueries({
            queryKey: ['trips-statistics'],
          });
        }
      )
      .subscribe((status) => {
        console.log(`Bookings realtime subscription ${status}`);
      });

    setActiveSubscriptions([tripsChannel, bookingsChannel]);

    // Cleanup subscriptions on unmount
    return () => {
      activeSubscriptions.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [scheduleIds, queryClient]);

  // Unsubscribe when component unmounts
  useEffect(() => {
    return () => {
      activeSubscriptions.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [activeSubscriptions]);

  return { tripUpdates, activeSubscriptions };
};

/**
 * Hook to subscribe to a single schedule's trips in real-time
 */
export const useRealtimeScheduleTrips = (scheduleId?: string) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!scheduleId) {
      setIsConnected(false);
      return;
    }

    const channel = supabase
      .channel(`trips-schedule-${scheduleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `schedule_id=eq.${scheduleId}`,
        },
        (payload) => {
          // Refresh trip data when changes occur
          queryClient.invalidateQueries({
            queryKey: ['trips-by-schedule', scheduleId],
          });
          queryClient.invalidateQueries({
            queryKey: ['trips-statistics'],
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log(`Schedule trips realtime ${status}`);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scheduleId, queryClient]);

  return { isConnected };
};
