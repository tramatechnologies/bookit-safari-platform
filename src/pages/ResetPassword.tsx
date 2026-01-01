import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for password reset token in URL hash
    // Supabase handles this automatically, but we need to ensure the session is established
    const handlePasswordReset = async () => {
      // Check if there's a token in the URL hash (Supabase handles this)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (accessToken && type === 'recovery') {
        // Token is present, Supabase will handle the session
        // We just need to wait a moment for the session to be established
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            toast({
              title: 'Invalid Link',
              description: 'This password reset link is invalid or expired. Please request a new one.',
              variant: 'destructive',
            });
            navigate('/forgot-password');
          }
        }, 1000);
      } else if (!user) {
        // No token and no user - redirect to forgot password
        toast({
          title: 'Session Required',
          description: 'Please use the password reset link from your email.',
          variant: 'destructive',
        });
        navigate('/forgot-password');
      }
    };

    handlePasswordReset();
  }, [user, navigate, toast]);

  const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate password
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      const fieldErrors: Record<string, string> = {};
      passwordResult.error.errors.forEach((err) => {
        fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      toast({
        title: 'Validation Error',
        description: 'Please check the password requirements.',
        variant: 'destructive',
      });
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Password Updated!',
        description: 'Your password has been successfully updated.',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-teal" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Password Updated!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Button 
              variant="teal" 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Set New Password
            </h1>
            <p className="text-muted-foreground">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Your New Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`pl-12 pr-12 ${errors.password ? 'border-destructive' : ''}`}
                  required
                  minLength={8}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Your New Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`pl-12 pr-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  required
                  minLength={8}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel - Image/Brand */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Lock className="w-12 h-12 text-amber" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Secure Your Account
          </h2>
          <p className="text-primary-foreground/70">
            Choose a strong password to keep your account safe and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

