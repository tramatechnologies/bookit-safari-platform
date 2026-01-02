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
    let mounted = true;

    const verifyEmail = async () => {
      try {
        // Check URL hash for Supabase auth tokens (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Handle errors from hash
        if (error) {
          if (mounted) {
            setStatus('error');
            setMessage(errorDescription || 'Verification failed. Please try again.');
          }
          return;
        }

        // Handle password recovery
        if (type === 'recovery') {
          if (mounted) {
            navigate('/auth/reset', { replace: true });
          }
          return;
        }

        // If we have tokens in the hash, Supabase client should auto-process them
        // Wait a moment for Supabase to process the hash
        if (accessToken || refreshToken) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check for token_hash in query params (PKCE flow)
        const tokenHash = searchParams.get('token_hash');
        const tokenType = searchParams.get('type') as 'email' | 'recovery' | 'magiclink' | null;

        // Try PKCE flow if token_hash is present
        if (tokenHash && tokenType) {
          try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: tokenType,
            });

            if (verifyError) {
              if (mounted) {
                if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
                  setStatus('expired');
                  setMessage('This verification link has expired or is invalid. Please request a new one.');
                } else {
                  setStatus('error');
                  setMessage(verifyError.message || 'Failed to verify email. Please try again.');
                }
              }
              return;
            }

            if (data?.user && mounted) {
              setStatus('success');
              setMessage('Your email has been verified successfully!');
              const redirectTo = searchParams.get('redirect') || '/dashboard';
              setTimeout(() => {
                navigate(redirectTo, { replace: true });
              }, 2000);
              return;
            }
          } catch (err: any) {
            if (mounted) {
              setStatus('error');
              setMessage(err.message || 'An error occurred during verification.');
            }
            return;
          }
        }

        // Check current session (for implicit flow where Supabase auto-processes hash)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          if (mounted) {
            setStatus('error');
            setMessage('Failed to check session. Please try again.');
          }
          return;
        }

        // If session exists and email is verified
        if (session?.user?.email_confirmed_at) {
          if (mounted) {
            setStatus('success');
            setMessage('Your email has been verified successfully!');
            const redirectTo = searchParams.get('redirect') || '/dashboard';
            setTimeout(() => {
              navigate(redirectTo, { replace: true });
            }, 2000);
          }
          return;
        }

        // If we have access_token in hash but no session yet, wait a bit more
        if (accessToken && !session) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (retrySession?.user?.email_confirmed_at && mounted) {
            setStatus('success');
            setMessage('Your email has been verified successfully!');
            const redirectTo = searchParams.get('redirect') || '/dashboard';
            setTimeout(() => {
              navigate(redirectTo, { replace: true });
            }, 2000);
            return;
          }
        }

        // No valid verification found
        if (mounted) {
          setStatus('error');
          setMessage('Invalid verification link. Please check your email and try again, or request a new verification email.');
        }
      } catch (err: any) {
        if (mounted) {
          setStatus('error');
          setMessage(err.message || 'An unexpected error occurred. Please try again.');
        }
      }
    };

    verifyEmail();

    return () => {
      mounted = false;
    };
  }, [searchParams, navigate]);

  // Listen for auth state changes (Supabase might establish session asynchronously)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && status === 'loading') {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, [status, navigate, searchParams]);

  // If user is already verified and logged in, show success and redirect
  useEffect(() => {
    if (user?.email_confirmed_at && status === 'loading') {
      setStatus('success');
      setMessage('Your email is already verified!');
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
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
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>What to do:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Make sure you're using the most recent verification email</li>
                  <li>• Check your spam/junk folder</li>
                  <li>• Request a new verification email if needed</li>
                </ul>
              </div>
              <div className="space-y-3">
                {user?.email && (
                  <Button 
                    variant="teal" 
                    size="lg" 
                    className="w-full"
                    onClick={async () => {
                      try {
                        const redirectUrl = import.meta.env.PROD 
                          ? 'https://bookitsafari.com/auth/verify?redirect=/dashboard'
                          : `${window.location.origin}/auth/verify?redirect=/dashboard`;
                        
                        const { error } = await supabase.auth.resend({
                          type: 'signup',
                          email: user.email!,
                          options: {
                            emailRedirectTo: redirectUrl,
                          },
                        });

                        if (error) {
                          setMessage(`Failed to resend email: ${error.message}`);
                        } else {
                          setMessage('Verification email sent! Please check your inbox.');
                          setStatus('loading');
                        }
                      } catch (err: any) {
                        setMessage(`Failed to resend email: ${err.message}`);
                      }
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </Button>
                )}
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
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

