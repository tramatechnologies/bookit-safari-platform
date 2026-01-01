import { useState } from 'react';
import { BarChart3, Users, Bus, Calendar, TrendingUp, AlertCircle, DollarSign, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      if (error) return false;
      return data || false;
    },
    enabled: !!user,
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats', selectedPeriod],
    queryFn: async () => {
      const today = new Date();
      let startDate = new Date();

      if (selectedPeriod === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (selectedPeriod === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else {
        startDate.setMonth(today.getMonth() - 1);
      }

      const [bookingsRes, usersRes, operatorsRes, revenueRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('bus_operators')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('commissions')
          .select('commission_amount_tzs')
          .gte('created_at', startDate.toISOString()),
      ]);

      const totalRevenue = revenueRes.data?.reduce(
        (sum, commission) => sum + Number(commission.commission_amount_tzs),
        0
      ) || 0;

      return {
        bookings: bookingsRes.count || 0,
        users: usersRes.count || 0,
        operators: operatorsRes.count || 0,
        revenue: totalRevenue,
      };
    },
    enabled: isAdmin,
  });

  if (checkingRole || loadingStats) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 pt-24">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <AlertCircle className="w-5 h-5 text-destructive mb-2" />
            <h3 className="font-semibold text-destructive mb-1">Access Denied</h3>
            <p className="text-sm text-muted-foreground">
              You don't have permission to access this page.
            </p>
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
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of platform statistics and management
            </p>
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
              <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
              <p className="text-3xl font-bold">{stats?.bookings || 0}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">New Users</p>
              <p className="text-3xl font-bold">{stats?.users || 0}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber/20 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-amber" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">New Operators</p>
              <p className="text-3xl font-bold">{stats?.operators || 0}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Commission Revenue</p>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('sw-TZ', {
                  style: 'currency',
                  currency: 'TZS',
                  minimumFractionDigits: 0,
                }).format(stats?.revenue || 0)}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link to="/admin/operators" className="p-4 border rounded-lg hover:bg-muted transition-colors text-left">
                <Percent className="w-5 h-5 mb-2 text-teal" />
                <p className="font-medium">Manage Operators</p>
                <p className="text-sm text-muted-foreground">Set commission rates</p>
              </Link>
              <Link to="/admin/commissions" className="p-4 border rounded-lg hover:bg-muted transition-colors text-left">
                <DollarSign className="w-5 h-5 mb-2 text-green-500" />
                <p className="font-medium">View Commissions</p>
                <p className="text-sm text-muted-foreground">Commission tracking</p>
              </Link>
              <button className="p-4 border rounded-lg hover:bg-muted transition-colors text-left">
                <Users className="w-5 h-5 mb-2" />
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-muted-foreground">User management</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-muted transition-colors text-left">
                <BarChart3 className="w-5 h-5 mb-2" />
                <p className="font-medium">View Reports</p>
                <p className="text-sm text-muted-foreground">Analytics and insights</p>
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;

