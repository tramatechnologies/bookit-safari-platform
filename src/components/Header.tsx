import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('Error signing out:', error);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/images/logo.png" 
              alt="BookitSafari Logo" 
              className="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity"
              loading="eager"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-display text-xl font-bold text-foreground">
              Bookit<span className="text-amber">Safari</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/search" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Find Buses
            </Link>
            <Link 
              to="/routes" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Routes
            </Link>
            <Link 
              to="/operators" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Operators
            </Link>
            <Link 
              to="/help" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Help
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 min-w-[200px] justify-end">
            {!loading && user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/bookings">
                    Bookings
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile">
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : !loading ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="teal" size="sm" asChild>
                  <Link to="/auth?mode=register">Get Started</Link>
                </Button>
              </>
            ) : (
              // Loading state - maintain layout
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 bg-muted animate-pulse rounded" />
                <div className="w-24 h-8 bg-muted animate-pulse rounded" />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link 
              to="/" 
              className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/search" 
              className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Buses
            </Link>
            <Link 
              to="/routes" 
              className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Routes
            </Link>
            <Link 
              to="/operators" 
              className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Operators
            </Link>
            <Link 
              to="/help" 
              className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
              {!loading && user ? (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/bookings" onClick={() => setMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      Profile
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : !loading ? (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="teal" asChild>
                    <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
