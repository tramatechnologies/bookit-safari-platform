import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const EmailVerificationWaiting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      
      // Check if email is already verified
      if (user.email_confirmed_at) {
        navigate('/');
        return;
      }

      // Poll for email verification
      const checkVerification = async () => {
        setChecking(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          navigate('/');
        }
        setChecking(false);
      };

      // Check immediately
      checkVerification();

      // Poll every 5 seconds
      const interval = setInterval(checkVerification, 5000);

      return () => clearInterval(interval);
    } else {
      // If no user, redirect to auth
      navigate('/auth?mode=register');
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      alert('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      alert(error.message || 'Failed to resend email. Please try again.');
    }
  };

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
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-teal" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <strong>{email}</strong>
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>What's next?</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-teal mt-1">•</span>
                  <span>Check your inbox (and spam folder) for an email from BookitSafari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal mt-1">•</span>
                  <span>Click the verification link in the email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal mt-1">•</span>
                  <span>You'll be automatically redirected once verified</span>
                </li>
              </ul>
            </div>

            {checking && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking verification status...</span>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleResendEmail}
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>
              <Link to="/auth">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationWaiting;

