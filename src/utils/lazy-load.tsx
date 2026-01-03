import { lazy, Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LazyLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4">
        <Loader2 className="w-8 h-8" />
      </div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const FallbackLoader = ({ error, retry }: { error?: Error; retry?: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-semibold text-destructive mb-2">Failed to load</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || 'An error occurred while loading the page.'}
      </p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  </div>
);

export const lazyLoad = <T extends Record<string, unknown>>(importFunc: () => Promise<T>, componentName: keyof T = 'default' as keyof T) => {
  return lazy(async () => {
    try {
      const module = await importFunc();
      return { default: module[componentName] as React.ComponentType<any> };
    } catch (error) {
      console.error(`Error loading component:`, error);
      // Return a fallback component that allows retry
      const RetryComponent = (props: any) => {
        const [retryCount, setRetryCount] = useState(0);
        
        const handleRetry = () => {
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            // Force reload by changing key
            window.location.reload();
          }
        };

        return <FallbackLoader error={error as Error} retry={handleRetry} />;
      };
      
      return { default: RetryComponent };
    }
  });
};

// Lazy load pages
export const LazyIndex = lazyLoad(() => import('@/pages/Index'));
export const LazyAuth = lazyLoad(() => import('@/pages/Auth'));
export const LazyAuthCallback = lazyLoad(() => import('@/pages/AuthCallback'));
export const LazyVerifyEmail = lazyLoad(() => import('@/pages/VerifyEmail'));
export const LazyEmailVerificationWaiting = lazyLoad(() => import('@/pages/EmailVerificationWaiting'));
export const LazyForgotPassword = lazyLoad(() => import('@/pages/ForgotPassword'));
export const LazyResetPassword = lazyLoad(() => import('@/pages/ResetPassword'));
export const LazySearchResults = lazyLoad(() => import('@/pages/SearchResults'));
export const LazyBooking = lazyLoad(() => import('@/pages/Booking'));
export const LazyPayment = lazyLoad(() => import('@/pages/Payment'));
export const LazyBookingConfirmation = lazyLoad(() => import('@/pages/BookingConfirmation'));
export const LazyMyBookings = lazyLoad(() => import('@/pages/MyBookings'));
export const LazyProfile = lazyLoad(() => import('@/pages/Profile'));
export const LazyPassengerDashboard = lazyLoad(() => import('@/pages/PassengerDashboard'));
export const LazyAdminDashboard = lazyLoad(() => import('@/pages/AdminDashboard'));
export const LazyAdminOperators = lazyLoad(() => import('@/pages/AdminOperators'));
export const LazyAdminCommissions = lazyLoad(() => import('@/pages/AdminCommissions'));
export const LazyOperatorDashboard = lazyLoad(() => import('@/pages/OperatorDashboard'));
export const LazyOperatorBuses = lazyLoad(() => import('@/pages/OperatorBuses'));
export const LazyOperatorRoutes = lazyLoad(() => import('@/pages/OperatorRoutes'));
export const LazyOperatorBookings = lazyLoad(() => import('@/pages/OperatorBookings'));
export const LazyOperatorSchedules = lazyLoad(() => import('@/pages/OperatorSchedules'));
export const LazyRoutes = lazyLoad(() => import('@/pages/Routes'));
export const LazyOperators = lazyLoad(() => import('@/pages/Operators'));
export const LazyHelp = lazyLoad(() => import('@/pages/Help'));
export const LazyAbout = lazyLoad(() => import('@/pages/About'));
export const LazyOperatorRegister = lazyLoad(() => import('@/pages/OperatorRegister'));
export const LazyPartner = lazyLoad(() => import('@/pages/Partner'));
export const LazyAdvertise = lazyLoad(() => import('@/pages/Advertise'));
export const LazyPrivacy = lazyLoad(() => import('@/pages/Privacy'));
export const LazyTerms = lazyLoad(() => import('@/pages/Terms'));
export const LazyNotFound = lazyLoad(() => import('@/pages/NotFound'));

// Lazy load components
export const LazySeatLayout = lazyLoad(() => import('@/components/SeatLayout'));
export const LazyBookingSummary = lazyLoad(() => import('@/components/BookingSummary'));
export const LazyPassengerForm = lazyLoad(() => import('@/components/PassengerForm'));
export const LazySearchForm = lazyLoad(() => import('@/components/SearchForm'));

// Suspense wrapper with fallback
export const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LazyLoader />}>
    {children}
  </Suspense>
);