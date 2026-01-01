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
      // Supabase handles email verification automatically when user clicks the link
      // The session is established via URL hash (#access_token=...)
      // We need to wait a moment for Supabase to process the hash and establish the session
      
      // Wait a bit for Supabase to process the URL hash
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if session is established (Supabase auto-processes hash)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Check URL hash for type (password reset, etc.)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type') || searchParams.get('type');
      
      if (type === 'recovery') {
        // For password reset, redirect to reset password page
        navigate('/auth/reset');
        return;
      }

      // Check if email is verified
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

      // If no session and no hash, check for token in query params (PKCE flow)
      const token = searchParams.get('token_hash') || searchParams.get('token');
      if (token && !session) {
        try {
          // Try to verify with token (PKCE flow)
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
        return;
      }

      // If we get here, no session and no token - invalid link
      if (!session && !token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
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

