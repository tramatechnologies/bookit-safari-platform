import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MapPin, Edit, Trash2, Loader2, AlertCircle, Clock, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRegions } from '@/hooks/use-regions';
import { supabase } from '@/integrations/supabase/client';

interface Route {
  id: string;
  departure_region_id: string;
  destination_region_id: string;
  departure_terminal: string | null;
  arrival_terminal: string | null;
  duration_hours: number | null;
  distance_km: number | null;
  is_active: boolean;
}

const OperatorRoutes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: regions } = useRegions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    departure_region_id: '',
    destination_region_id: '',
    departure_terminal: '',
    arrival_terminal: '',
    duration_hours: '',
    distance_km: '',
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
  const { data: routes, isLoading } = useQuery({
    queryKey: ['operator-routes', operatorId],
    queryFn: async () => {
      if (!operatorId) return [];
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Route[];
    },
    enabled: !!operatorId,
  });

  // Create/Update route mutation
  const routeMutation = useMutation({
    mutationFn: async (routeData: typeof formData) => {
      if (!operatorId) throw new Error('Operator ID not found');

      const routePayload = {
        operator_id: operatorId,
        departure_region_id: routeData.departure_region_id,
        destination_region_id: routeData.destination_region_id,
        departure_terminal: routeData.departure_terminal || null,
        arrival_terminal: routeData.arrival_terminal || null,
        duration_hours: routeData.duration_hours ? parseFloat(routeData.duration_hours) : null,
        distance_km: routeData.distance_km ? parseFloat(routeData.distance_km) : null,
        is_active: true,
      };

      if (editingRoute) {
        const { data, error } = await supabase
          .from('routes')
          .update(routePayload)
          .eq('id', editingRoute.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('routes')
          .insert(routePayload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-routes', operatorId] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingRoute ? 'Route Updated' : 'Route Added',
        description: editingRoute
          ? 'Route information has been updated successfully.'
          : 'New route has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save route information.',
        variant: 'destructive',
      });
    },
  });

  // Delete route mutation
  const deleteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase
        .from('routes')
        .update({ is_active: false })
        .eq('id', routeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-routes', operatorId] });
      toast({
        title: 'Route Deactivated',
        description: 'Route has been deactivated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate route.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      departure_region_id: '',
      destination_region_id: '',
      departure_terminal: '',
      arrival_terminal: '',
      duration_hours: '',
      distance_km: '',
    });
    setEditingRoute(null);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      departure_region_id: route.departure_region_id,
      destination_region_id: route.destination_region_id,
      departure_terminal: route.departure_terminal || '',
      arrival_terminal: route.arrival_terminal || '',
      duration_hours: route.duration_hours?.toString() || '',
      distance_km: route.distance_km?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.departure_region_id || !formData.destination_region_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select both departure and destination regions.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.departure_region_id === formData.destination_region_id) {
      toast({
        title: 'Validation Error',
        description: 'Departure and destination regions must be different.',
        variant: 'destructive',
      });
      return;
    }

    routeMutation.mutate(formData);
  };

  const getRegionName = (regionId: string) => {
    return regions?.find(r => r.id === regionId)?.name || 'Unknown';
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
              <h1 className="text-3xl font-bold mb-2">Manage Routes</h1>
              <p className="text-muted-foreground">
                Create and manage your bus routes
              </p>
            </div>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </div>

          {/* Routes List */}
          {routes && routes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-teal/20 flex items-center justify-center">
                      <Route className="w-6 h-6 text-teal" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(route)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to deactivate this route?')) {
                            deleteMutation.mutate(route.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-teal mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">From</p>
                        <p className="font-semibold">
                          {getRegionName(route.departure_region_id)}
                        </p>
                        {route.departure_terminal && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {route.departure_terminal}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">To</p>
                        <p className="font-semibold">
                          {getRegionName(route.destination_region_id)}
                        </p>
                        {route.arrival_terminal && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {route.arrival_terminal}
                          </p>
                        )}
                      </div>
                    </div>

                    {route.duration_hours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {Math.floor(route.duration_hours)}h {Math.round((route.duration_hours % 1) * 60)}m
                        </span>
                      </div>
                    )}

                    {route.distance_km && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Distance: </span>
                        <span className="font-medium">{route.distance_km} km</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                No routes found. Add your first route to get started.
              </AlertDescription>
            </Alert>
          )}

          {/* Add/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRoute ? 'Edit Route' : 'Add New Route'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure_region">Departure Region *</Label>
                    <Select
                      value={formData.departure_region_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, departure_region_id: value })
                      }
                      required
                    >
                      <SelectTrigger id="departure_region">
                        <SelectValue placeholder="Select departure region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions?.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination_region">Destination Region *</Label>
                    <Select
                      value={formData.destination_region_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, destination_region_id: value })
                      }
                      required
                    >
                      <SelectTrigger id="destination_region">
                        <SelectValue placeholder="Select destination region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions?.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departure_terminal">Departure Terminal</Label>
                    <Input
                      id="departure_terminal"
                      value={formData.departure_terminal}
                      onChange={(e) =>
                        setFormData({ ...formData, departure_terminal: e.target.value })
                      }
                      placeholder="e.g., Ubungo Bus Terminal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival_terminal">Arrival Terminal</Label>
                    <Input
                      id="arrival_terminal"
                      value={formData.arrival_terminal}
                      onChange={(e) =>
                        setFormData({ ...formData, arrival_terminal: e.target.value })
                      }
                      placeholder="e.g., Arusha Bus Station"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_hours">Duration (hours)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.duration_hours}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_hours: e.target.value })
                      }
                      placeholder="e.g., 8.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance_km">Distance (km)</Label>
                    <Input
                      id="distance_km"
                      type="number"
                      min="0"
                      value={formData.distance_km}
                      onChange={(e) =>
                        setFormData({ ...formData, distance_km: e.target.value })
                      }
                      placeholder="e.g., 600"
                    />
                  </div>
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
                  <Button type="submit" disabled={routeMutation.isPending}>
                    {routeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingRoute ? 'Update Route' : 'Add Route'
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

export default OperatorRoutes;

