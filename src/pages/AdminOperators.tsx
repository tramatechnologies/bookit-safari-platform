import { useState } from 'react';
import { Building2, Percent, Edit, Save, X, CheckCircle, AlertCircle, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/constants';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';

interface Operator {
  id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  license_number: string | null;
  status: 'pending' | 'approved' | 'suspended';
  commission_rate: number;
  created_at: string;
}

const AdminOperators = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState<string>('');

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

  // Fetch operators
  const { data: operators, isLoading } = useQuery({
    queryKey: ['admin-operators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bus_operators')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Operator[];
    },
    enabled: isAdmin,
  });

  // Update commission rate mutation
  const updateCommissionMutation = useMutation({
    mutationFn: async ({ operatorId, rate }: { operatorId: string; rate: number }) => {
      const { error } = await supabase
        .from('bus_operators')
        .update({ commission_rate: rate })
        .eq('id', operatorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
      setEditingId(null);
      toast({
        title: 'Commission Rate Updated',
        description: 'The commission rate has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update commission rate.',
        variant: 'destructive',
      });
    },
  });

  // Update operator status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ operatorId, status }: { operatorId: string; status: 'pending' | 'approved' | 'suspended' }) => {
      const { error } = await supabase
        .from('bus_operators')
        .update({ status })
        .eq('id', operatorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
      toast({
        title: 'Status Updated',
        description: 'Operator status has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update status.',
        variant: 'destructive',
      });
    },
  });

  const filteredOperators = operators?.filter(op =>
    op.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.company_email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (operator: Operator) => {
    setEditingId(operator.id);
    setCommissionRate(operator.commission_rate.toString());
  };

  const handleSave = (operatorId: string) => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: 'Invalid Rate',
        description: 'Commission rate must be between 0 and 100.',
        variant: 'destructive',
      });
      return;
    }
    updateCommissionMutation.mutate({ operatorId, rate });
  };

  const handleCancel = () => {
    setEditingId(null);
    setCommissionRate('');
  };

  if (checkingRole || isLoading) {
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
            <h1 className="font-display text-4xl font-bold mb-2">Manage Operators</h1>
            <p className="text-muted-foreground">
              Set commission rates and manage operator accounts
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          {/* Operators Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredOperators.length > 0 ? (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Operator</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Commission Rate</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOperators.map((operator) => (
                      <tr key={operator.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-teal" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{operator.company_name}</p>
                              {operator.license_number && (
                                <p className="text-xs text-muted-foreground">License: {operator.license_number}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-foreground">{operator.company_email}</p>
                            <p className="text-muted-foreground">{operator.company_phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={operator.status}
                            onChange={(e) => updateStatusMutation.mutate({
                              operatorId: operator.id,
                              status: e.target.value as 'pending' | 'approved' | 'suspended'
                            })}
                            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {editingId === operator.id ? (
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={commissionRate}
                                  onChange={(e) => setCommissionRate(e.target.value)}
                                  className="w-24 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                              </div>
                              <Button
                                size="sm"
                                variant="teal"
                                onClick={() => handleSave(operator.id)}
                                disabled={updateCommissionMutation.isPending}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{operator.commission_rate}%</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(operator)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {operator.status === 'approved' && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {operator.status === 'pending' && (
                              <AlertCircle className="w-5 h-5 text-amber" />
                            )}
                            {operator.status === 'suspended' && (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No operators found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'No operators registered yet'}
              </p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminOperators;

