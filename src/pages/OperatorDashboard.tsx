import { useState } from 'react';
import { Bus, Calendar, TrendingUp, Users, Plus, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RealtimeSeatAvailability } from '@/components/RealtimeSeatAvailability';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const OperatorDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Get operator ID
  const { data: operatorId } = useQuery({
    queryKey: ['operator-id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.rpc('get_user_operator_id', {
        _user_id: user.id,
      });
      return data;
    },
    enabled: !!user,
  });

  // Fetch operator stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['operator-stats', operatorId, selectedPeriod],
    queryFn: async () => {
      if (!operatorId) return null;

      const today = new Date();
      let startDate = new Date();

      if (selectedPeriod === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (selectedPeriod === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else {
        startDate.setMonth(today.getMonth() - 1);
      }

      // Get routes for this operator using database function
      const { data: routesData, error: routesError } = await supabase.rpc('get_operator_routes', {
        p_operator_id: operatorId,
      });

      if (routesError) {
        console.error('Error fetching routes:', routesError);
        return {
          bookings: 0,
          revenue: 0,
          buses: 0,
          schedules: 0,
        };
      }

      const routeIds = routesData?.map((r: any) => r.id) || [];

      if (routeIds.length === 0) {
        return {
          bookings: 0,
          revenue: 0,
          buses: 0,
          schedules: 0,
        };
      }

      // Get schedules for these routes using database function
      const { data: schedulesData, error: schedulesError } = await supabase.rpc('get_operator_schedules_by_routes', {
        p_route_ids: routeIds,
      });

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        return {
          bookings: 0,
          revenue: 0,
          buses: 0,
          schedules: 0,
        };
      }

      const scheduleIds = schedulesData?.map((s: any) => s.id) || [];

      // Get booking IDs for these schedules
      const { data: bookingIdsData } = await supabase.rpc('get_booking_ids_for_schedules', {
        p_schedule_ids: scheduleIds,
      });

      const bookingIds = bookingIdsData?.map((b: any) => b.id) || [];

      const [bookingsCount, revenueData, busesCount] = await Promise.all([
        scheduleIds.length > 0
          ? supabase.rpc('get_bookings_count_for_schedules', {
              p_schedule_ids: scheduleIds,
              p_start_date: startDate.toISOString(),
            })
          : Promise.resolve({ data: 0, error: null }),
        bookingIds.length > 0
          ? supabase.rpc('get_payments_for_bookings', {
              p_booking_ids: bookingIds,
              p_start_date: startDate.toISOString(),
            })
          : Promise.resolve({ data: [], error: null }),
        supabase.rpc('get_operator_buses_count', {
          p_operator_id: operatorId,
        }),
      ]);

      const totalRevenue = revenueData.data?.reduce(
        (sum: number, payment: any) => sum + Number(payment.amount_tzs || 0),
        0
      ) || 0;

      return {
        bookings: bookingsCount.data || 0,
        revenue: totalRevenue,
        buses: busesCount.data || 0,
        schedules: scheduleIds.length,
      };
    },
    enabled: !!operatorId,
  });

  // Fetch operator's schedules for real-time seat availability
  const { data: operatorSchedules } = useQuery({
    queryKey: ['operator-schedules-dashboard', operatorId],
    queryFn: async () => {
      if (!operatorId) return [];

      const { data: routesData } = await supabase.rpc('get_operator_routes', {
        p_operator_id: operatorId,
      });

      if (!routesData || routesData.length === 0) return [];

      const routeIds = routesData.map((r: any) => r.id);

      const { data: schedulesData } = await supabase
        .from('schedules')
        .select('id')
        .in('route_id', routeIds)
        .eq('is_active', true);

      return schedulesData?.map((s: any) => s.id) || [];
    },
    enabled: !!operatorId,
  });

  if (loadingStats) {
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

  if (!operatorId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 pt-24">
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">Not an Operator</h3>
            <p className="text-muted-foreground mb-6">
              You need to register as a bus operator to access this dashboard.
            </p>
            <Button variant="teal" asChild>
              <Link to="/operator/register">Register as Operator</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 pt-20 sm:pt-24">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Operator Dashboard</h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Manage your buses, routes, and bookings
              </p>
            </div>
            <Button variant="teal" size="sm" asChild className="h-10 sm:h-9 w-full sm:w-auto flex-shrink-0">
              <Link to="/operator/schedules/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Link>
            </Button>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-teal" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats?.bookings || 0}</p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold line-clamp-1">
                {new Intl.NumberFormat('sw-TZ', {
                  style: 'currency',
                  currency: 'TZS',
                  minimumFractionDigits: 0,
                }).format(stats?.revenue || 0)}
              </p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber/20 flex items-center justify-center flex-shrink-0">
                  <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-amber" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Buses</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats?.buses || 0}</p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Schedules</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats?.schedules || 0}</p>
            </div>
          </div>

          {/* Real-time Seat Availability */}
          {operatorSchedules && operatorSchedules.length > 0 && (
            <div className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-teal flex-shrink-0" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Real-Time Seat Availability</h2>
              </div>
              <RealtimeSeatAvailability scheduleIds={operatorSchedules} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Link
              to="/operator/buses"
              className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
            >
              <Bus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3 text-teal" />
              <h3 className="font-semibold text-sm sm:text-base mb-1">Manage Buses</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Add and manage your fleet</p>
            </Link>

            <Link
              to="/operator/routes"
              className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
            >
              <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3 text-amber" />
              <h3 className="font-semibold text-sm sm:text-base mb-1">Manage Routes</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Create and edit routes</p>
            </Link>

            <Link
              to="/operator/schedules"
              className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
            >
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3 text-green-500" />
              <h3 className="font-semibold text-sm sm:text-base mb-1">Manage Schedules</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Create trips & manage schedules</p>
            </Link>

            <Link
              to="/operator/bookings"
              className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
            >
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mb-2 sm:mb-3 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base mb-1">View Bookings</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">See all your bookings</p>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default OperatorDashboard;

