import { useState } from 'react';
import { Calendar, Ticket, User, Search, Loader2, LogOut, Settings, Home, MapPin, Clock, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const PassengerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Fetch user profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        if (import.meta.env.DEV) {
          console.error('Error fetching profile:', error);
        }
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch booking stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['passenger-stats', user?.id, selectedPeriod],
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      let startDate: Date;

      switch (selectedPeriod) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, status, created_at, total_price_tzs, total_amount_tzs')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching bookings:', error);
        }
        return { totalBookings: 0, confirmedBookings: 0, totalSpent: 0 };
      }

      const totalBookings = bookings?.length || 0;
      const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
      const totalSpent = bookings?.reduce((sum, b) => {
        const amount = Number((b as any).total_price_tzs || (b as any).total_amount_tzs || 0);
        return sum + amount;
      }, 0) || 0;

      return { totalBookings, confirmedBookings, totalSpent };
    },
    enabled: !!user,
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['recent-bookings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          schedule:schedules(
            *,
            route:routes(
              *,
              departure_region:regions!routes_departure_region_id_fkey(name),
              destination_region:regions!routes_destination_region_id_fkey(name)
            ),
            bus:buses(
              *,
              operator:bus_operators(company_name)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching recent bookings:', error);
        }
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error signing out:', error);
      }
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loadingProfile || loadingStats) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-screen">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/images/logo.png" 
                alt="BookitSafari Logo" 
                className="h-8 w-auto object-contain"
              />
              <span className="font-display text-lg font-bold text-foreground">
                Bookit<span className="text-amber">Safari</span>
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/bookings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Ticket className="w-5 h-5" />
              My Bookings
            </Link>
            <Link
              to="/search"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Search className="w-5 h-5" />
              Book a Trip
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Top Bar */}
          <header className="bg-card border-b border-border sticky top-0 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/search')}>
                  <Search className="w-4 h-4 mr-2" />
                  Book Trip
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6">
            {/* Period Filter */}
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant={selectedPeriod === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('today')}
              >
                Today
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                This Week
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                This Month
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-teal/20 flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-teal" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p className="text-3xl font-bold">{stats?.totalBookings || 0}</p>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
                <p className="text-3xl font-bold">{stats?.confirmedBookings || 0}</p>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-amber/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-amber">TZS</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-3xl font-bold">
                  {stats?.totalSpent ? new Intl.NumberFormat('en-TZ').format(stats.totalSpent) : '0'}
                </p>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Bookings</h2>
                <Link to="/bookings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              
              {loadingBookings ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentBookings.map((booking: any) => {
                    const schedule = booking.schedule;
                    const route = schedule?.route;
                    const bus = schedule?.bus;
                    const operator = bus?.operator;
                    const departureRegion = route?.departure_region;
                    const destinationRegion = route?.destination_region;
                    
                    const totalAmount = Number(
                      (booking as any).total_price_tzs || 
                      (booking as any).total_amount_tzs || 
                      0
                    );

                    return (
                      <Link
                        key={booking.id}
                        to={`/booking/${booking.id}/confirmation`}
                        className="block p-6 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold">
                                  {departureRegion?.name || 'N/A'} → {destinationRegion?.name || 'N/A'}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'confirmed'
                                    ? 'bg-green/20 text-green'
                                    : booking.status === 'pending'
                                    ? 'bg-amber/20 text-amber'
                                    : 'bg-red/20 text-red'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Bus className="w-4 h-4" />
                                <span>{operator?.company_name || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Booking #{booking.booking_number || booking.id.substring(0, 8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              TZS {new Intl.NumberFormat('en-TZ').format(totalAmount)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start exploring and book your first trip!
                  </p>
                  <Button onClick={() => navigate('/search')} size="lg">
                    <Search className="w-4 h-4 mr-2" />
                    Search for Trips
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default PassengerDashboard;
