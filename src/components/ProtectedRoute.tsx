import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute = ({ children, requireEmailVerification = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // User not authenticated or account may have been deleted
    // Redirect to login with return path and show message
    return <Navigate to="/auth" state={{ from: location, message: 'Please sign in to access this page' }} replace />;
  }

  // Check email verification if required
  if (requireEmailVerification && !user.email_confirmed_at) {
    // Redirect to email verification waiting page
    return <Navigate to="/auth/verify-waiting" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

