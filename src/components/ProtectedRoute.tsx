import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute = ({ children, requireEmailVerification = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

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
    // Show verification message but allow access
    // The component can show a banner or message about email verification
    return (
      <>
        <div className="bg-amber/10 border-b border-amber/20 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber" />
              <p className="text-sm text-foreground">
                Please verify your email address to access all features. Check your inbox for the verification link.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const redirectUrl = import.meta.env.PROD 
                    ? 'https://bookitsafari.com/auth/verify?redirect=/dashboard'
                    : `${window.location.origin}/auth/verify?redirect=/dashboard`;
                  
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: user.email!,
                    options: { emailRedirectTo: redirectUrl },
                  });

                  if (error) {
                    toast({
                      title: 'Error',
                      description: 'Failed to resend verification email. Please try again.',
                      variant: 'destructive',
                    });
                  } else {
                    toast({
                      title: 'Email sent!',
                      description: 'Verification email sent. Please check your inbox.',
                    });
                  }
                } catch (err) {
                  toast({
                    title: 'Error',
                    description: 'Failed to resend verification email. Please try again.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              Resend Email
            </Button>
          </div>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
};

