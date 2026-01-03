import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Edit, Trash2, Loader2, AlertCircle, Clock, Bus, MapPin, TrendingDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeScheduleTrips } from '@/hooks/use-realtime-trips';
import { formatPrice } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';

interface Schedule {
  id: string;
  route_id: string;
  bus_id: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string | null;
  price_tzs: number;
  available_seats: number;
  is_active: boolean;
}

interface Trip {
  id: string;
  schedule_id: string;
  trip_date: string;
  available_seats: number;
  status: string;
  created_at: string;
}

const OperatorSchedules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedScheduleForTrips, setSelectedScheduleForTrips] = useState<string | null>(null);
  const [tripGenerationDays, setTripGenerationDays] = useState('30');
  const [formData, setFormData] = useState({
    route_id: '',
    bus_id: '',
    departure_date: '',
    departure_time: '',
    arrival_time: '',
    price_tzs: '',
    available_seats: '',
  });

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

  // Fetch routes
  const { data: routes } = useQuery({
    queryKey: ['operator-routes', operatorId],
    queryFn: async () => {
      if (!operatorId) return [];
      const { data, error } = await supabase.rpc('get_operator_routes', {
        p_operator_id: operatorId,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!operatorId,
  });

  // Fetch buses
  const { data: buses } = useQuery({
    queryKey: ['operator-buses', operatorId],
    queryFn: async () => {
      if (!operatorId) return [];
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .eq('operator_id', operatorId)
        .eq('is_active', true)
        .order('bus_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!operatorId,
  });

  // Fetch schedules
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['operator-schedules', operatorId],
    queryFn: async () => {
      if (!operatorId || !routes || routes.length === 0) return [];
      
      const routeIds = routes.map((r: any) => r.id);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .in('route_id', routeIds)
        .order('departure_date', { ascending: false })
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      return data as Schedule[];
    },
    enabled: !!operatorId && !!routes,
  });

  // Fetch trips for selected schedule
  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips-by-schedule', selectedScheduleForTrips],
    queryFn: async () => {
      if (!selectedScheduleForTrips) return [];
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('schedule_id', selectedScheduleForTrips)
        .gte('trip_date', new Date().toISOString().split('T')[0])
        .order('trip_date', { ascending: true });
      
      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!selectedScheduleForTrips,
  });

  // Real-time subscription for trips
  const { isConnected: isRealtimeConnected } = useRealtimeScheduleTrips(selectedScheduleForTrips);

  // Create/Update schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: async (scheduleData: typeof formData) => {
      if (!operatorId) throw new Error('Operator ID not found');

      const schedulePayload = {
        route_id: scheduleData.route_id,
        bus_id: scheduleData.bus_id,
        departure_date: scheduleData.departure_date,
        departure_time: scheduleData.departure_time,
        arrival_time: scheduleData.arrival_time || null,
        price_tzs: parseFloat(scheduleData.price_tzs),
        available_seats: parseInt(scheduleData.available_seats) || 0,
        is_active: true,
      };

      if (editingSchedule) {
        const { data, error } = await supabase
          .from('schedules')
          .update(schedulePayload)
          .eq('id', editingSchedule.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('schedules')
          .insert(schedulePayload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-schedules', operatorId] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingSchedule ? 'Schedule Updated' : 'Schedule Added',
        description: editingSchedule
          ? 'Schedule has been updated successfully.'
          : 'New schedule has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save schedule.',
        variant: 'destructive',
      });
    },
  });

  // Delete schedule mutation
  const deleteMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase
        .from('schedules')
        .update({ is_active: false })
        .eq('id', scheduleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-schedules', operatorId] });
      toast({
        title: 'Schedule Deactivated',
        description: 'Schedule has been deactivated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate schedule.',
        variant: 'destructive',
      });
    },
  });

  // Generate trips mutation
  const generateTripsMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const days = parseInt(tripGenerationDays) || 30;
      const { data, error } = await supabase.rpc('generate_trips_from_schedules', {
        p_days_ahead: days,
        p_schedule_id: scheduleId,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips-by-schedule', selectedScheduleForTrips] });
      const tripCount = Array.isArray(data) ? data.length : 0;
      toast({
        title: 'Trips Generated',
        description: `Successfully generated ${tripCount} trips for the next ${tripGenerationDays} days.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate trips.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      route_id: '',
      bus_id: '',
      departure_date: '',
      departure_time: '',
      arrival_time: '',
      price_tzs: '',
      available_seats: '',
    });
    setEditingSchedule(null);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      route_id: schedule.route_id,
      bus_id: schedule.bus_id,
      departure_date: schedule.departure_date,
      departure_time: schedule.departure_time.substring(0, 5),
      arrival_time: schedule.arrival_time?.substring(0, 5) || '',
      price_tzs: schedule.price_tzs.toString(),
      available_seats: schedule.available_seats.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleMutation.mutate(formData);
  };

  const getRouteName = (routeId: string) => {
    const route = routes?.find((r: any) => r.id === routeId);
    if (!route) return 'Unknown Route';
    // We'd need to fetch region names, but for now just return route ID
    return `Route ${routeId.substring(0, 8)}`;
  };

  const getBusName = (busId: string) => {
    const bus = buses?.find((b: any) => b.id === busId);
    return bus ? `Bus ${bus.bus_number}` : 'Unknown Bus';
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Schedules</h1>
              <p className="text-muted-foreground">
                Create and manage your bus schedules
              </p>
            </div>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </div>

          {/* Schedules List */}
          {schedules && schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => {
                const totalTripsForSchedule = trips?.filter(t => t.schedule_id === schedule.id).length || 0;
                const isScheduleSelected = selectedScheduleForTrips === schedule.id;
                
                return (
                  <div key={schedule.id}>
                    <div
                      className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedScheduleForTrips(isScheduleSelected ? null : schedule.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {new Date(schedule.departure_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getRouteName(schedule.route_id)} • {getBusName(schedule.bus_id)}
                            </p>
                          </div>
                          {isRealtimeConnected && isScheduleSelected && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                              <Zap className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Live</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(schedule);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to deactivate this schedule?')) {
                                deleteMutation.mutate(schedule.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Departure</p>
                            <p className="font-medium">{schedule.departure_time.substring(0, 5)}</p>
                          </div>
                        </div>

                        {schedule.arrival_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Arrival</p>
                              <p className="font-medium">{schedule.arrival_time.substring(0, 5)}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Seats</p>
                            <p className="font-medium">{schedule.available_seats}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium text-teal">
                            {formatPrice(schedule.price_tzs)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Trips Generated</p>
                          <p className="font-medium text-primary">{totalTripsForSchedule}</p>
                        </div>
                      </div>
                    </div>

                    {/* Trips for this schedule */}
                    {isScheduleSelected && (
                      <div className="bg-muted/30 rounded-2xl border border-border p-6 mt-2 ml-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold">Generated Trips</h4>
                            {tripsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateTripsMutation.mutate(schedule.id)}
                            disabled={generateTripsMutation.isPending}
                          >
                            {generateTripsMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Generate More Trips
                              </>
                            )}
                          </Button>
                        </div>

                        {trips && trips.length > 0 ? (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {trips.map((trip) => (
                              <div
                                key={trip.id}
                                className="flex items-center justify-between bg-card rounded-lg p-3 border border-border/50"
                              >
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {new Date(trip.trip_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Available Seats</p>
                                    <p className="font-semibold text-sm">{trip.available_seats}</p>
                                  </div>
                                  <Badge
                                    variant={trip.status === 'scheduled' ? 'default' : 'secondary'}
                                  >
                                    {trip.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No trips generated yet. Click "Generate More Trips" to create trips for upcoming dates.
                          </p>
                        )}

                        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                          <label className="text-sm font-medium">
                            Generate trips for how many days ahead?
                          </label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              value={tripGenerationDays}
                              onChange={(e) => setTripGenerationDays(e.target.value)}
                              className="max-w-xs"
                            />
                            <span className="text-xs text-muted-foreground flex items-center">days</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                No schedules found. Add your first schedule to get started.
              </AlertDescription>
            </Alert>
          )}

          {/* Add/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="route_id">Route *</Label>
                    <Select
                      value={formData.route_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, route_id: value })
                      }
                      required
                    >
                      <SelectTrigger id="route_id">
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes?.map((route: any) => (
                          <SelectItem key={route.id} value={route.id}>
                            Route {route.id.substring(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bus_id">Bus *</Label>
                    <Select
                      value={formData.bus_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bus_id: value })
                      }
                      required
                    >
                      <SelectTrigger id="bus_id">
                        <SelectValue placeholder="Select bus" />
                      </SelectTrigger>
                      <SelectContent>
                        {buses?.map((bus: any) => (
                          <SelectItem key={bus.id} value={bus.id}>
                            Bus {bus.bus_number} ({bus.plate_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure_date">Departure Date *</Label>
                    <Input
                      id="departure_date"
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) =>
                        setFormData({ ...formData, departure_date: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departure_time">Departure Time *</Label>
                    <Input
                      id="departure_time"
                      type="time"
                      value={formData.departure_time}
                      onChange={(e) =>
                        setFormData({ ...formData, departure_time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrival_time">Arrival Time</Label>
                    <Input
                      id="arrival_time"
                      type="time"
                      value={formData.arrival_time}
                      onChange={(e) =>
                        setFormData({ ...formData, arrival_time: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_tzs">Price (TZS) *</Label>
                    <Input
                      id="price_tzs"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.price_tzs}
                      onChange={(e) =>
                        setFormData({ ...formData, price_tzs: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_seats">Available Seats *</Label>
                  <Input
                    id="available_seats"
                    type="number"
                    min="0"
                    value={formData.available_seats}
                    onChange={(e) =>
                      setFormData({ ...formData, available_seats: e.target.value })
                    }
                    required
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={scheduleMutation.isPending}>
                    {scheduleMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingSchedule ? 'Update Schedule' : 'Add Schedule'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default OperatorSchedules;

