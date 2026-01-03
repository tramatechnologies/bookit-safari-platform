import { useEffect, useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, AlertCircle, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeTrips } from '@/hooks/use-realtime-trips';

interface Trip {
  id: string;
  schedule_id: string;
  trip_date: string;
  available_seats: number;
  status: string;
}

interface SeatAvailabilityProps {
  scheduleIds?: string[];
  className?: string;
}

const RealtimeSeatAvailabilityComponent = ({
  scheduleIds = [],
  className = '',
}: SeatAvailabilityProps) => {
  const [displayTrips, setDisplayTrips] = useState<Trip[]>([]);
  const [totalAvailableSeats, setTotalAvailableSeats] = useState(0);

  // Fetch trips for schedules
  const { data: allTrips, isLoading } = useQuery({
    queryKey: ['trips-availability', scheduleIds],
    queryFn: async () => {
      if (!scheduleIds || scheduleIds.length === 0) return [];

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .in('schedule_id', scheduleIds)
        .gte('trip_date', new Date().toISOString().split('T')[0])
        .order('trip_date', { ascending: true })
        .limit(10); // Show latest 10 trips

      if (error) throw error;
      return data as Trip[];
    },
    enabled: scheduleIds.length > 0,
  });

  // Subscribe to real-time updates
  const { tripUpdates } = useRealtimeTrips(scheduleIds);

  // Update display when trips or real-time updates change
  useEffect(() => {
    if (allTrips) {
      const updatedTrips = allTrips.map((trip) => ({
        ...trip,
        available_seats: tripUpdates[trip.id]?.available_seats ?? trip.available_seats,
        status: tripUpdates[trip.id]?.status ?? trip.status,
      }));
      setDisplayTrips(updatedTrips);

      const total = updatedTrips.reduce(
        (sum, trip) => sum + trip.available_seats,
        0
      );
      setTotalAvailableSeats(total);
    }
  }, [allTrips, tripUpdates]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <p className="text-muted-foreground">Loading seat availability...</p>
      </div>
    );
  }

  if (displayTrips.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">No trips available</p>
      </div>
    );
  }

  // Categorize trips by seat availability
  const highAvailability = displayTrips.filter((t) => t.available_seats >= 20);
  const mediumAvailability = displayTrips.filter(
    (t) => t.available_seats >= 10 && t.available_seats < 20
  );
  const lowAvailability = displayTrips.filter((t) => t.available_seats < 10);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-teal/10 to-primary/10 rounded-lg p-4 border border-teal/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Available Seats</p>
            <p className="text-3xl font-bold text-teal">{totalAvailableSeats}</p>
          </div>
          <Zap className="w-8 h-8 text-teal opacity-50" />
        </div>
      </div>

      {/* High Availability */}
      {highAvailability.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Available Now ({highAvailability.length})
          </h4>
          <div className="space-y-2">
            {highAvailability.map((trip) => (
              <TripCard key={trip.id} trip={trip} variant="available" />
            ))}
          </div>
        </div>
      )}

      {/* Medium Availability */}
      {mediumAvailability.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            Limited Availability ({mediumAvailability.length})
          </h4>
          <div className="space-y-2">
            {mediumAvailability.map((trip) => (
              <TripCard key={trip.id} trip={trip} variant="limited" />
            ))}
          </div>
        </div>
      )}

      {/* Low Availability */}
      {lowAvailability.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Filling Up Fast ({lowAvailability.length})
          </h4>
          <div className="space-y-2">
            {lowAvailability.map((trip) => (
              <TripCard key={trip.id} trip={trip} variant="low" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TripCardProps {
  trip: Trip;
  variant?: 'available' | 'limited' | 'low';
}

const TripCard = ({
  trip,
  variant = 'available',
}: TripCardProps) => {
  const dateStr = new Date(trip.trip_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

  const bgColor = {
    available: 'bg-green-50 border-green-200',
    limited: 'bg-amber-50 border-amber-200',
    low: 'bg-red-50 border-red-200',
  }[variant];

  const textColor = {
    available: 'text-green-700',
    limited: 'text-amber-700',
    low: 'text-red-700',
  }[variant];

  const badgeVariant = {
    available: 'default',
    limited: 'secondary',
    low: 'destructive',
  }[variant];

  const icon = {
    available: null,
    limited: <AlertCircle className="w-4 h-4" />,
    low: <TrendingDown className="w-4 h-4" />,
  }[variant];

  return (
    <div className={`rounded-lg border p-3 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-medium text-sm ${textColor}`}>{dateStr}</p>
          <p className="text-xs text-muted-foreground">Trip {trip.id.slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`font-bold text-lg ${textColor}`}>
              {trip.available_seats}
            </p>
            <p className="text-xs text-muted-foreground">seats</p>
          </div>
          {icon ? (
            <div className={`p-1 rounded ${textColor}`}>
              {icon}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export const RealtimeSeatAvailability = memo(RealtimeSeatAvailabilityComponent);