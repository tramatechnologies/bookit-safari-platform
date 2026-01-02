import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase handles the OAuth callback automatically
        // We need to wait for the session to be established and ensure profile exists
        const checkSession = async () => {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            setStatus('error');
            setMessage(sessionError.message || 'Failed to complete sign in. Please try again.');
            return;
          }

          if (session?.user) {
            // Ensure profile exists (database trigger should create it, but we'll verify)
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            // If profile doesn't exist, create it with Google data
            if (profileError && profileError.code === 'PGRST116') {
              const fullName = session.user.user_metadata?.full_name || 
                              session.user.user_metadata?.name || 
                              session.user.email?.split('@')[0] || 
                              'User';
              const avatarUrl = session.user.user_metadata?.avatar_url || 
                              session.user.user_metadata?.picture || 
                              null;

              const { error: createError } = await supabase
                .from('profiles')
                .insert({
                  user_id: session.user.id,
                  full_name: fullName,
                  avatar_url: avatarUrl,
                });

              if (createError) {
                // Only log in development
                if (import.meta.env.DEV) {
                  console.error('Error creating profile:', createError);
                }
              }
            } else if (profile && !profile.full_name && session.user.user_metadata?.name) {
              // Update profile with Google name if missing
              await supabase
                .from('profiles')
                .update({
                  full_name: session.user.user_metadata.name,
                  avatar_url: session.user.user_metadata.picture || profile.avatar_url,
                })
                .eq('user_id', session.user.id);
            }

            // Check if email is verified (Google OAuth emails are pre-verified)
            if (session.user.email_confirmed_at) {
              setStatus('success');
              setMessage('Successfully signed in!');
              setTimeout(() => {
                navigate('/');
              }, 1500);
            } else {
              // For new Google sign-ups, redirect to email verification page
              setStatus('success');
              setMessage('Please verify your email to continue.');
              setTimeout(() => {
                navigate('/auth/verify');
              }, 1500);
            }
          } else {
            setStatus('error');
            setMessage('Failed to complete sign in. Please try again.');
          }
        };

        // Wait a bit for Supabase to process the callback
        setTimeout(checkSession, 1000);
      } catch (error: any) {
        const formattedError = formatAuthError(error);
        setStatus('error');
        setMessage(formattedError.description);
      }
    };

    handleCallback();
  }, [navigate]);

  // If user is already set, handle accordingly
  useEffect(() => {
    if (user) {
      // Check if email is verified
      if (user.email_confirmed_at) {
        setStatus('success');
        setMessage('Successfully signed in!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('success');
        setMessage('Please verify your email to continue.');
        setTimeout(() => {
          navigate('/auth/verify-waiting');
        }, 1500);
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Completing Sign In
              </h1>
              <p className="text-muted-foreground">
                Please wait while we complete your sign in...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-teal" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Success!
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting you now...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                Sign In Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <Button 
                variant="teal" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                Back to Sign In
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

