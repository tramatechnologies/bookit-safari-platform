import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Bus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
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
import { AmenitiesSelector } from '@/components/AmenitiesSelector';
import { SeatLayoutConfigurator, type SeatLayoutRow } from '@/components/SeatLayoutConfigurator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { SeatLayoutType } from '@/components/SeatLayout';

interface Bus {
  id: string;
  bus_number: string;
  plate_number: string;
  bus_type: string | null;
  total_seats: number;
  amenities: string[] | null;
  seat_layout: string | null;
  seat_layout_config: SeatLayoutRow[] | null;
  is_active: boolean;
}

const OperatorBuses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  // Seat counts per layout type
  const LAYOUT_SEAT_COUNTS: Record<SeatLayoutType, number> = {
    layout1: 53, // 2-2 with door gap, 5 back seats
    layout2: 57, // 2-2 no gap, 5 back seats
  };

  const [formData, setFormData] = useState({
    bus_number: '',
    plate_number: '',
    bus_type: '',
    total_seats: 53,
    amenities: [] as string[],
    seat_layout: 'layout1' as SeatLayoutType,
    seat_layout_config: null as SeatLayoutRow[] | null,
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

  // Fetch buses
  const { data: buses, isLoading } = useQuery({
    queryKey: ['operator-buses', operatorId],
    queryFn: async () => {
      if (!operatorId) return [];
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Bus[];
    },
    enabled: !!operatorId,
  });

  // Create/Update bus mutation
  const busMutation = useMutation({
    mutationFn: async (busData: typeof formData) => {
      if (!operatorId) throw new Error('Operator ID not found');

      const busPayload = {
        operator_id: operatorId,
        bus_number: busData.bus_number,
        plate_number: busData.plate_number,
        bus_type: busData.bus_type || null,
        total_seats: busData.total_seats,
        amenities: busData.amenities.length > 0 ? busData.amenities : null,
        seat_layout: busData.seat_layout,
        seat_layout_config: busData.seat_layout_config,
        is_active: true,
      };

      if (editingBus) {
        const { data, error } = await supabase
          .from('buses')
          .update(busPayload)
          .eq('id', editingBus.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('buses')
          .insert(busPayload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-buses', operatorId] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingBus ? 'Bus Updated' : 'Bus Added',
        description: editingBus
          ? 'Bus information has been updated successfully.'
          : 'New bus has been added to your fleet.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bus information.',
        variant: 'destructive',
      });
    },
  });

  // Delete bus mutation
  const deleteMutation = useMutation({
    mutationFn: async (busId: string) => {
      const { error } = await supabase
        .from('buses')
        .update({ is_active: false })
        .eq('id', busId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-buses', operatorId] });
      toast({
        title: 'Bus Deactivated',
        description: 'Bus has been deactivated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate bus.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      bus_number: '',
      plate_number: '',
      bus_type: '',
      total_seats: 53,
      amenities: [],
      seat_layout: 'layout1',
      seat_layout_config: null,
    });
    setEditingBus(null);
  };

  const handleEdit = (bus: Bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      plate_number: bus.plate_number,
      bus_type: bus.bus_type || '',
      total_seats: bus.total_seats,
      amenities: bus.amenities || [],
      seat_layout: (bus.seat_layout as SeatLayoutType) || 'layout1',
      seat_layout_config: bus.seat_layout_config || null,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    busMutation.mutate(formData);
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
              <h1 className="text-3xl font-bold mb-2">Manage Buses</h1>
              <p className="text-muted-foreground">
                Add and manage your bus fleet
              </p>
            </div>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Bus
            </Button>
          </div>

          {/* Buses List */}
          {buses && buses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-teal/20 flex items-center justify-center">
                      <Bus className="w-6 h-6 text-teal" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(bus)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to deactivate this bus?')) {
                            deleteMutation.mutate(bus.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">
                    Bus {bus.bus_number}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 font-mono">
                    {bus.plate_number}
                  </p>
                  
                  {bus.bus_type && (
                    <Badge variant="secondary" className="mb-2">
                      {bus.bus_type}
                    </Badge>
                  )}

                  <div className="space-y-2 mt-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Seats: </span>
                      <span className="font-medium">{bus.total_seats}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Layout: </span>
                      <span className="font-medium capitalize">
                        {bus.seat_layout_config ? '📋 Custom' : bus.seat_layout || 'layout1'}
                      </span>
                    </div>
                    {bus.amenities && bus.amenities.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Amenities: </span>
                        <span className="font-medium">
                          {bus.amenities.slice(0, 2).join(', ')}
                          {bus.amenities.length > 2 && ` +${bus.amenities.length - 2}`}
                        </span>
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
                No buses found. Add your first bus to get started.
              </AlertDescription>
            </Alert>
          )}

          {/* Add/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bus_number">Bus Number *</Label>
                    <Input
                      id="bus_number"
                      value={formData.bus_number}
                      onChange={(e) =>
                        setFormData({ ...formData, bus_number: e.target.value })
                      }
                      placeholder="e.g., BUS-001"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plate_number">Plate Number *</Label>
                    <Input
                      id="plate_number"
                      value={formData.plate_number}
                      onChange={(e) =>
                        setFormData({ ...formData, plate_number: e.target.value })
                      }
                      placeholder="e.g., T123 ABC"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bus_type">Bus Type *</Label>
                    <Select
                      value={formData.bus_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bus_type: value })
                      }
                      required
                    >
                      <SelectTrigger id="bus_type">
                        <SelectValue placeholder="Select bus type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Luxury">Luxury</SelectItem>
                        <SelectItem value="Semi Luxury">Semi Luxury</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_seats">Total Seats *</Label>
                    <Input
                      id="total_seats"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.total_seats}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_seats: parseInt(e.target.value) || 45,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seat_layout">Seat Layout *</Label>
                  <Select
                    value={formData.seat_layout}
                    onValueChange={(value) => {
                      const layout = value as SeatLayoutType;
                      setFormData({
                        ...formData,
                        seat_layout: layout,
                        total_seats: LAYOUT_SEAT_COUNTS[layout],
                      });
                    }}
                    required
                  >
                    <SelectTrigger id="seat_layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="layout1">
                        Layout 1 - 53 seats (2-2 with door gap)
                      </SelectItem>
                      <SelectItem value="layout2">
                        Layout 2 - 57 seats (2-2 full rows)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selected layout has {LAYOUT_SEAT_COUNTS[formData.seat_layout]} seats
                  </p>
                </div>

                <AmenitiesSelector
                  value={formData.amenities}
                  onChange={(amenities) =>
                    setFormData({ ...formData, amenities })
                  }
                />

                <div className="space-y-2">
                  <Label>Seat Layout Configuration</Label>
                  <SeatLayoutConfigurator
                    value={formData.seat_layout_config}
                    onChange={(config) =>
                      setFormData({ ...formData, seat_layout_config: config })
                    }
                    totalSeats={formData.total_seats}
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
                  <Button type="submit" disabled={busMutation.isPending}>
                    {busMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingBus ? 'Update Bus' : 'Add Bus'
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

export default OperatorBuses;

