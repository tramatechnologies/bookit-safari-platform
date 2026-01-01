import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Filter, Download, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/constants';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle } from 'lucide-react';

interface Commission {
  id: string;
  booking_id: string;
  operator_id: string;
  payment_id: string | null;
  booking_amount_tzs: number;
  commission_rate: number;
  commission_amount_tzs: number;
  operator_amount_tzs: number;
  status: 'pending' | 'paid' | 'refunded';
  paid_at: string | null;
  created_at: string;
  operator: {
    company_name: string;
  } | null;
  booking: {
    booking_number: string;
    passenger_name: string;
  } | null;
}

const AdminCommissions = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all');

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

  // Calculate date range
  const getDateRange = () => {
    if (selectedPeriod === 'all') return null;
    
    const today = new Date();
    let startDate = new Date();
    
    if (selectedPeriod === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (selectedPeriod === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate.setMonth(today.getMonth() - 1);
    }
    
    return startDate.toISOString();
  };

  // Fetch commissions
  const { data: commissions, isLoading } = useQuery({
    queryKey: ['admin-commissions', selectedPeriod, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('commissions')
        .select(`
          *,
          operator:bus_operators(company_name),
          booking:bookings(booking_number, passenger_name)
        `)
        .order('created_at', { ascending: false });

      const dateRange = getDateRange();
      if (dateRange) {
        query = query.gte('created_at', dateRange);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Commission[];
    },
    enabled: isAdmin,
  });

  // Calculate totals
  const totals = commissions?.reduce(
    (acc, comm) => ({
      totalBookings: acc.totalBookings + 1,
      totalRevenue: acc.totalRevenue + Number(comm.commission_amount_tzs),
      totalOperatorAmount: acc.totalOperatorAmount + Number(comm.operator_amount_tzs),
      totalBookingAmount: acc.totalBookingAmount + Number(comm.booking_amount_tzs),
    }),
    { totalBookings: 0, totalRevenue: 0, totalOperatorAmount: 0, totalBookingAmount: 0 }
  ) || { totalBookings: 0, totalRevenue: 0, totalOperatorAmount: 0, totalBookingAmount: 0 };

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
            <h1 className="font-display text-4xl font-bold mb-2">Commission Management</h1>
            <p className="text-muted-foreground">
              Track and manage commissions from operator bookings
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
              <p className="text-3xl font-bold">{totals.totalBookings}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">{formatPrice(totals.totalRevenue)}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Operator Payout</p>
              <p className="text-3xl font-bold">{formatPrice(totals.totalOperatorAmount)}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-amber" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Booking Value</p>
              <p className="text-3xl font-bold">{formatPrice(totals.totalBookingAmount)}</p>
            </div>
          </div>

          {/* Commissions Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
            </div>
          ) : commissions && commissions.length > 0 ? (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Booking</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Operator</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Booking Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Commission Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Commission</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Operator Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-semibold text-foreground">
                              {commission.booking?.booking_number || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {commission.booking?.passenger_name || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-foreground">
                            {commission.operator?.company_name || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">
                            {formatPrice(Number(commission.booking_amount_tzs))}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-teal/10 text-teal text-sm font-medium">
                            {commission.commission_rate}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-green-600">
                            {formatPrice(Number(commission.commission_amount_tzs))}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-blue-600">
                            {formatPrice(Number(commission.operator_amount_tzs))}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            commission.status === 'paid' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : commission.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(commission.created_at).toLocaleDateString('en-TZ', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No commissions found</h3>
              <p className="text-muted-foreground">
                Commissions will appear here once bookings are completed and payments are processed.
              </p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminCommissions;

