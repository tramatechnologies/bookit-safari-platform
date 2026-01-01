import { useState } from 'react';
import { Bus, Calendar, TrendingUp, Users, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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

      // Get routes for this operator
      const { data: routes } = await supabase
        .from('routes')
        .select('id')
        .eq('operator_id', operatorId);

      const routeIds = routes?.map((r) => r.id) || [];

      if (routeIds.length === 0) {
        return {
          bookings: 0,
          revenue: 0,
          buses: 0,
          schedules: 0,
        };
      }

      // Get schedules for these routes
      const { data: schedules } = await supabase
        .from('schedules')
        .select('id')
        .in('route_id', routeIds);

      const scheduleIds = schedules?.map((s) => s.id) || [];

      const [bookingsRes, revenueRes, busesRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .in('schedule_id', scheduleIds)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('payments')
          .select('amount_tzs')
          .eq('status', 'completed')
          .gte('created_at', startDate.toISOString())
          .in(
            'booking_id',
            scheduleIds.length > 0
              ? (
                  await supabase
                    .from('bookings')
                    .select('id')
                    .in('schedule_id', scheduleIds)
                ).data?.map((b) => b.id) || []
              : []
          ),
        supabase
          .from('buses')
          .select('id', { count: 'exact', head: true })
          .eq('operator_id', operatorId),
      ]);

      const totalRevenue = revenueRes.data?.reduce(
        (sum, payment) => sum + Number(payment.amount_tzs),
        0
      ) || 0;

      return {
        bookings: bookingsRes.count || 0,
        revenue: totalRevenue,
        buses: busesRes.count || 0,
        schedules: scheduleIds.length,
      };
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

        <div className="container mx-auto px-4 py-12 pt-24">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">Operator Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your buses, routes, and bookings
              </p>
            </div>
            <Button variant="teal" asChild>
              <Link to="/operator/schedules/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Link>
            </Button>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-6">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Bookings</p>
              <p className="text-3xl font-bold">{stats?.bookings || 0}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('sw-TZ', {
                  style: 'currency',
                  currency: 'TZS',
                  minimumFractionDigits: 0,
                }).format(stats?.revenue || 0)}
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber/20 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-amber" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Buses</p>
              <p className="text-3xl font-bold">{stats?.buses || 0}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Schedules</p>
              <p className="text-3xl font-bold">{stats?.schedules || 0}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/operator/buses"
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <Bus className="w-8 h-8 mb-3 text-teal" />
              <h3 className="font-semibold mb-1">Manage Buses</h3>
              <p className="text-sm text-muted-foreground">Add and manage your fleet</p>
            </Link>

            <Link
              to="/operator/routes"
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <Users className="w-8 h-8 mb-3 text-amber" />
              <h3 className="font-semibold mb-1">Manage Routes</h3>
              <p className="text-sm text-muted-foreground">Create and edit routes</p>
            </Link>

            <Link
              to="/operator/bookings"
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <Calendar className="w-8 h-8 mb-3 text-primary" />
              <h3 className="font-semibold mb-1">View Bookings</h3>
              <p className="text-sm text-muted-foreground">See all your bookings</p>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default OperatorDashboard;

