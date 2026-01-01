import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in AND email is verified
  useEffect(() => {
    if (user) {
      // Check if email is confirmed
      if (user.email_confirmed_at) {
        const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        // If not verified, redirect to verification waiting page
        navigate('/auth/verify-waiting', { replace: true });
      }
    }
  }, [user, navigate, location]);

  useEffect(() => {
    setIsRegister(searchParams.get('mode') === 'register');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isRegister) {
        // Validate with Zod
        const result = signUpSchema.safeParse({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          toast({
            title: 'Validation Error',
            description: 'Please check the form and fix the errors.',
            variant: 'destructive',
          });
          return;
        }

        const { data, error: signUpError } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (signUpError) {
          // Check if user already exists
          const errorMsg = signUpError.message?.toLowerCase() || '';
          if (errorMsg.includes('already') || 
              errorMsg.includes('exists') ||
              errorMsg.includes('registered') ||
              signUpError.status === 422) {
            throw {
              ...signUpError,
              message: 'An account with this email already exists. Please sign in instead.',
              isExistingUser: true,
            };
          }
          throw signUpError;
        }

        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account before continuing.',
        });
        
        // Redirect to email verification waiting page
        navigate('/auth/verify-waiting');
      } else {
        // Validate with Zod
        const result = signInSchema.safeParse({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          toast({
            title: 'Validation Error',
            description: 'Please check the form and fix the errors.',
            variant: 'destructive',
          });
          return;
        }

        const { data, error: signInError } = await signIn(formData.email, formData.password);
        
        if (signInError) {
          // Provide user-friendly error messages
          const errorMsg = signInError.message?.toLowerCase() || '';
          const errorCode = signInError.status || signInError.code;
          
          // Check for deleted account
          if (errorMsg.includes('user not found') ||
              errorMsg.includes('user does not exist') ||
              errorMsg.includes('account not found') ||
              errorCode === 404) {
            throw {
              ...signInError,
              message: 'No account found with this email address. The account may have been deleted. Please sign up for a new account.',
              isDeletedAccount: true,
            };
          } else if (errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
            throw {
              ...signInError,
              message: 'Invalid email or password. Please check your credentials and try again.',
            };
          }
          throw signInError;
        }

        // Check if email is verified
        if (data?.user?.email_confirmed_at) {
          toast({
            title: 'Welcome back!',
            description: 'You have been signed in successfully.',
          });
          const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        } else {
          toast({
            title: 'Email verification required',
            description: 'Please verify your email address to continue.',
            variant: 'destructive',
          });
          navigate('/auth/verify-waiting');
        }
      }
    } catch (error: any) {
      // Handle specific authentication errors with user-friendly messages
      let errorTitle = 'Authentication Error';
      let errorDescription = 'An error occurred. Please try again.';
      let showSwitchMode = false;

      if (error?.message) {
        const errorMessage = error.message.toLowerCase();
        const errorCode = error.status || error.code;

        if (isRegister) {
          // Signup errors
          if (error.isExistingUser ||
              errorMessage.includes('already registered') || 
              errorMessage.includes('user already exists') ||
              errorMessage.includes('email address is already in use') ||
              errorMessage.includes('already exists') ||
              errorCode === 422) {
            errorTitle = 'Account Already Exists';
            errorDescription = 'An account with this email already exists. Please sign in instead or reset your password if you\'ve forgotten it.';
            showSwitchMode = true;
          } else if (errorMessage.includes('password') && errorMessage.includes('weak')) {
            errorTitle = 'Weak Password';
            errorDescription = 'Password is too weak. Please use a stronger password with at least 8 characters.';
          } else if (errorMessage.includes('email')) {
            errorTitle = 'Invalid Email';
            errorDescription = 'Please enter a valid email address.';
          } else {
            errorDescription = error.message;
          }
        } else {
          // Signin errors
          if (error.isDeletedAccount ||
              errorMessage.includes('user not found') ||
              errorMessage.includes('user does not exist') ||
              errorMessage.includes('account not found') ||
              errorMessage.includes('user has been deleted') ||
              errorMessage.includes('account may have been deleted') ||
              errorCode === 404) {
            errorTitle = 'Account Not Found';
            errorDescription = 'No account found with this email address. The account may have been deleted. Please sign up for a new account if you want to continue.';
            showSwitchMode = true; // Suggest signing up
          } else if (errorMessage.includes('invalid login credentials') ||
              errorMessage.includes('invalid password') ||
              errorMessage.includes('wrong password') ||
              errorCode === 400) {
            errorTitle = 'Invalid Credentials';
            errorDescription = 'The email or password you entered is incorrect. Please try again or reset your password if you\'ve forgotten it.';
          } else if (errorMessage.includes('email not confirmed') ||
                     errorMessage.includes('email not verified')) {
            errorTitle = 'Email Not Verified';
            errorDescription = 'Please verify your email address before signing in. Check your inbox for the verification link.';
          } else if (errorMessage.includes('too many requests') ||
                     errorMessage.includes('rate limit')) {
            errorTitle = 'Too Many Attempts';
            errorDescription = 'Too many login attempts. Please wait a few minutes before trying again.';
          } else if (errorMessage.includes('user is disabled') ||
                     errorMessage.includes('account disabled') ||
                     errorMessage.includes('account suspended')) {
            errorTitle = 'Account Disabled';
            errorDescription = 'Your account has been disabled. Please contact support for assistance.';
          } else {
            errorDescription = error.message;
          }
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
        duration: 5000, // Show for 5 seconds to give users time to read
      });

      // If user already exists during signup, suggest switching to sign in
      if (showSwitchMode && isRegister) {
        setTimeout(() => {
          setIsRegister(false);
          toast({
            title: 'Switched to Sign In',
            description: 'We\'ve switched you to the sign in form. Enter your password to continue.',
            duration: 3000,
          });
        }, 2000);
      }
      
      // If account was deleted during signin, suggest switching to sign up
      if (showSwitchMode && !isRegister && error.isDeletedAccount) {
        setTimeout(() => {
          setIsRegister(true);
          toast({
            title: 'Switched to Sign Up',
            description: 'We\'ve switched you to the sign up form. Create a new account to continue.',
            duration: 3000,
          });
        }, 2000);
      }
        setTimeout(() => {
          setIsRegister(false);
        }, 2000);
      }
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
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
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
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {isRegister 
                ? 'Start booking bus tickets across Tanzania' 
                : 'Sign in to access your bookings and travel history'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter Your Full Name"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    className={`pl-12 ${errors.fullName ? 'border-destructive' : ''}`}
                    required
                    disabled={loading}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter Your Email Address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`pl-12 ${errors.email ? 'border-destructive' : ''}`}
                  required
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                {!isRegister && (
                  <Link to="/forgot-password" className="text-sm text-teal hover:text-teal-dark transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
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
              {isRegister && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              )}
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
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={async () => {
              try {
                setLoading(true);
                const { data, error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                      access_type: 'offline',
                      prompt: 'consent',
                    },
                  },
                });
                if (error) throw error;
                // Don't set loading to false here - user will be redirected
              } catch (error: any) {
                toast({
                  title: 'Authentication Error',
                  description: error.message || 'Failed to sign in with Google. Please try again.',
                  variant: 'destructive',
                });
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          {/* Switch Mode */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="font-semibold text-teal hover:text-teal-dark transition-colors"
            >
              {isRegister ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Image/Brand */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm p-4">
            <img 
              src="/images/logo.png" 
              alt="BookitSafari Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Your Journey Starts Here
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Connect with over 100 trusted bus operators across all 31 regions of Tanzania. 
            Book safely, travel comfortably.
          </p>
          <div className="flex justify-center gap-6 text-primary-foreground/80">
            <div>
              <p className="text-2xl font-bold text-amber">50K+</p>
              <p className="text-sm">Travelers</p>
            </div>
            <div className="w-px bg-primary-foreground/20" />
            <div>
              <p className="text-2xl font-bold text-amber">100+</p>
              <p className="text-sm">Operators</p>
            </div>
            <div className="w-px bg-primary-foreground/20" />
            <div>
              <p className="text-2xl font-bold text-amber">31</p>
              <p className="text-sm">Regions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
