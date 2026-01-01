import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if this is a redirect from Supabase after email verification
      // Supabase handles verification automatically when user clicks email link
      // The token is in URL hash (#access_token=...), Supabase processes it automatically
      
      // Check if user is already verified (Supabase auto-verifies on redirect)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Get redirect URL from query params, default to dashboard
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
        return;
      }

      // Check URL hash for Supabase tokens (password reset, etc.)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type') || searchParams.get('type');
      
      if (type === 'recovery') {
        // For password reset, redirect to reset password page
        // Supabase will handle the token automatically via URL hash
        navigate('/auth/reset');
        return;
      }

      // If no token and user not verified, show error
      const token = searchParams.get('token') || hashParams.get('access_token');
      if (!token && !session?.user?.email_confirmed_at) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      // If we have a token, try to verify manually (fallback)
      if (token && type !== 'recovery') {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            if (error.message.includes('expired') || error.message.includes('invalid')) {
              setStatus('expired');
              setMessage('This verification link has expired or is invalid. Please request a new one.');
            } else {
              setStatus('error');
              setMessage(error.message || 'Failed to verify email. Please try again.');
            }
          } else if (data) {
            setStatus('success');
            setMessage('Your email has been verified successfully!');
            
            const redirectTo = searchParams.get('redirect') || '/dashboard';
            setTimeout(() => {
              navigate(redirectTo);
            }, 2000);
          }
        } catch (error: any) {
          setStatus('error');
          setMessage(error.message || 'An error occurred during verification.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  // If user is already verified and logged in, show success and redirect
  useEffect(() => {
    if (user?.email_confirmed_at && status === 'loading') {
      setStatus('success');
      setMessage('Your email is already verified!');
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
    }
  }, [user, status, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <img 
            src="/images/logo.png" 
            alt="BookitSafari Logo" 
            className="h-12 w-auto object-contain"
          />
          <span className="font-display text-2xl font-bold text-foreground">
            Bookit<span className="text-amber">Safari</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {status === 'loading' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Mail className="w-8 h-8 text-teal" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Verifying Your Email
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-teal" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Email Verified!
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button 
                  variant="teal" 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    const redirectTo = searchParams.get('redirect') || '/dashboard';
                    navigate(redirectTo);
                  }}
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {!user && (
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Verification Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link to="/auth">
                  <Button variant="teal" size="lg" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-amber" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Link Expired
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>What to do:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Check your email for a new verification link</li>
                  <li>• Request a new verification email from the sign-in page</li>
                  <li>• Make sure you're using the most recent email</li>
                </ul>
              </div>
              <div className="space-y-3">
                <Link to="/auth">
                  <Button variant="teal" size="lg" className="w-full">
                    Go to Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button variant="outline" className="w-full">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

