import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { formatAuthError } from '@/lib/utils/error-messages';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email
    const emailSchema = z.string().email('Please enter a valid email address');
    const result = emailSchema.safeParse(email);

    if (!result.success) {
      setError(result.error.errors[0].message);
      setLoading(false);
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await resetPassword(email);
      setEmailSent(true);
      toast({
        title: 'Password reset email sent!',
        description: 'Please check your email for instructions to reset your password.',
      });
    } catch (error: any) {
      const formattedError = formatAuthError(error);
      toast({
        title: formattedError.title,
        description: formattedError.description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md mx-auto">
          {/* Back Link */}
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img 
              src="/images/logo.png" 
              alt="BookitSafari Logo" 
              className="h-12 w-auto object-contain"
            />
            <span className="font-display text-2xl font-bold text-foreground">
              Bookit<span className="text-amber">Safari</span>
            </span>
          </Link>

          {!emailSent ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Reset Your Password
                </h1>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter Your Email Address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className={`pl-12 ${error ? 'border-destructive' : ''}`}
                      required
                      disabled={loading}
                    />
                    {error && (
                      <p className="text-xs text-destructive mt-1">{error}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="teal" 
                  size="lg" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-teal" />
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground mb-8">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>What's next?</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <span className="text-teal mt-1">•</span>
                      <span>Check your inbox (and spam folder)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal mt-1">•</span>
                      <span>Click the reset link in the email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal mt-1">•</span>
                      <span>Create your new password</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Send Another Email
                  </Button>
                  <Link to="/auth">
                    <Button variant="ghost" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Image/Brand */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Mail className="w-12 h-12 text-amber" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Secure Account Recovery
          </h2>
          <p className="text-primary-foreground/70">
            Your account security is our priority. We'll help you regain access safely and securely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

