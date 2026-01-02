import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, Users, Loader2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

interface Booking {
  id: string;
  booking_number: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string | null;
  seat_numbers: number[];
  total_seats: number;
  total_price_tzs: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  boarding_point: string | null;
  drop_off_point: string | null;
  created_at: string;
  schedule: {
    id: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string | null;
    price_tzs: number;
    route: {
      id: string;
      departure_region: { name: string } | null;
      destination_region: { name: string } | null;
      departure_terminal: string | null;
      arrival_terminal: string | null;
    } | null;
    bus: {
      id: string;
      bus_number: string;
      plate_number: string;
      bus_type: string | null;
    } | null;
  } | null;
}

const OperatorBookings = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get operator ID
  const { data: operatorId } = useQuery({
    queryKey: ['operator-id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.rpc('get_user_operator_id', {
        _user_id: user.id,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get operator routes
  const { data: routeIds } = useQuery({
    queryKey: ['operator-route-ids', operatorId],
    queryFn: async () => {
      if (!operatorId) return [];
      const { data, error } = await supabase.rpc('get_operator_routes', {
        p_operator_id: operatorId,
      });
      if (error) throw error;
      return data?.map((r: any) => r.id) || [];
    },
    enabled: !!operatorId,
  });

  // Get schedules for operator routes
  const { data: scheduleIds } = useQuery({
    queryKey: ['operator-schedule-ids', routeIds],
    queryFn: async () => {
      if (!routeIds || routeIds.length === 0) return [];
      const { data, error } = await supabase.rpc('get_operator_schedules_by_routes', {
        p_route_ids: routeIds,
      });
      if (error) throw error;
      return data?.map((s: any) => s.id) || [];
    },
    enabled: !!routeIds && routeIds.length > 0,
  });

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['operator-bookings', scheduleIds, statusFilter],
    queryFn: async () => {
      if (!scheduleIds || scheduleIds.length === 0) return [];

      let query = supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          passenger_name,
          passenger_phone,
          passenger_email,
          seat_numbers,
          total_seats,
          total_price_tzs,
          status,
          boarding_point,
          drop_off_point,
          created_at,
          schedule_id
        `)
        .in('schedule_id', scheduleIds)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch schedule details for each booking
      const bookingsWithDetails = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: scheduleData } = await supabase
            .from('schedules')
            .select(`
              id,
              departure_date,
              departure_time,
              arrival_time,
              price_tzs,
              route_id,
              bus_id
            `)
            .eq('id', booking.schedule_id)
            .single();

          if (!scheduleData) return null;

          // Get route details
          const { data: routeData } = await supabase.rpc('get_routes_by_ids', {
            p_route_ids: [scheduleData.route_id],
          });
          const route = routeData?.[0];

          // Get bus details
          const { data: busData } = await supabase.rpc('get_buses_by_ids', {
            p_bus_ids: [scheduleData.bus_id],
          });
          const bus = busData?.[0];

          // Get regions
          let departureRegion = null;
          let destinationRegion = null;
          if (route) {
            const { data: regions } = await supabase
              .from('regions')
              .select('id, name')
              .in('id', [route.departure_region_id, route.destination_region_id].filter(Boolean));
            
            departureRegion = regions?.find(r => r.id === route.departure_region_id);
            destinationRegion = regions?.find(r => r.id === route.destination_region_id);
          }

          return {
            ...booking,
            schedule: {
              ...scheduleData,
              route: route ? {
                ...route,
                departure_region: departureRegion,
                destination_region: destinationRegion,
              } : null,
              bus,
            },
          } as Booking;
        })
      );

      return bookingsWithDetails.filter(Boolean) as Booking[];
    },
    enabled: !!scheduleIds && scheduleIds.length > 0,
  });

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch =
      booking.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger_phone.includes(searchTerm) ||
      booking.booking_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all bookings for your routes
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by passenger name, phone, or booking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No bookings have been made for your routes yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {booking.passenger_name}
                            </h3>
                            <Badge
                              className={`${getStatusColor(booking.status)} text-white`}
                            >
                              {booking.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            Booking: {booking.booking_number}
                          </p>
                        </div>
                      </div>

                      {booking.schedule && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-teal mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-muted-foreground">From</p>
                              <p className="font-medium">
                                {booking.schedule.route?.departure_region?.name || 'N/A'}
                              </p>
                              {booking.boarding_point && (
                                <p className="text-xs text-muted-foreground">
                                  {booking.boarding_point}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-amber mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-muted-foreground">To</p>
                              <p className="font-medium">
                                {booking.schedule.route?.destination_region?.name || 'N/A'}
                              </p>
                              {booking.drop_off_point && (
                                <p className="text-xs text-muted-foreground">
                                  {booking.drop_off_point}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Date</p>
                              <p className="font-medium">
                                {new Date(booking.schedule.departure_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Time</p>
                              <p className="font-medium">
                                {booking.schedule.departure_time.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Seats: </span>
                          <span className="font-medium">
                            {booking.seat_numbers.join(', ')}
                          </span>
                        </div>
                        {booking.schedule?.bus && (
                          <div>
                            <span className="text-muted-foreground">Bus: </span>
                            <span className="font-medium">
                              {booking.schedule.bus.bus_number}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Phone: </span>
                          <span className="font-medium">{booking.passenger_phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-teal">
                          {formatPrice(booking.total_price_tzs)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default OperatorBookings;

