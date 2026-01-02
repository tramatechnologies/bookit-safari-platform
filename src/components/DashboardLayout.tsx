import { ReactNode, useState, useEffect } from 'react';
import { Calendar, Ticket, User, Search, LogOut, Home, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'bookitsafari-sidebar-collapsed';

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Load sidebar state from localStorage on mount
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved === 'true';
  });

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Fetch user profile
  const { data: profile } = useQuery({
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

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Toggle Button - Outside Sidebar */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 z-50 h-10 w-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
          isCollapsed ? 'left-24' : 'left-[17rem]'
        } bg-card border border-border hover:bg-muted`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-5 w-5 text-foreground" />
        ) : (
          <PanelLeftClose className="h-5 w-5 text-foreground" />
        )}
      </Button>

      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-card border-r border-border flex flex-col fixed h-screen transition-all duration-300 z-40`}>
        {/* Logo */}
        <div className={`p-6 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <Link to="/" className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <img 
              src="/images/logo.png" 
              alt="BookitSafari Logo" 
              className="h-8 w-auto object-contain"
            />
            {!isCollapsed && (
              <span className="font-display text-lg font-bold text-foreground">
                Bookit<span className="text-amber">Safari</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors group relative ${
              isActive('/dashboard')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title={isCollapsed ? 'Dashboard' : ''}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Dashboard
              </span>
            )}
          </Link>
          <Link
            to="/bookings"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors group relative ${
              isActive('/bookings')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title={isCollapsed ? 'My Bookings' : ''}
          >
            <Ticket className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>My Bookings</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                My Bookings
              </span>
            )}
          </Link>
          <Link
            to="/search"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors group relative ${
              isActive('/search')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title={isCollapsed ? 'Book a Trip' : ''}
          >
            <Search className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Book a Trip</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Book a Trip
              </span>
            )}
          </Link>
          <Link
            to="/profile"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors group relative ${
              isActive('/profile')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title={isCollapsed ? 'Profile' : ''}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Profile</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Profile
              </span>
            )}
          </Link>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} gap-3 h-auto p-3`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                )}
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
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} pt-16`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

