import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { profileSchema } from '@/lib/validations/profile';
import { formatProfileError } from '@/lib/utils/error-messages';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [originalProfile, setOriginalProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      const initialProfile = {
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
      };
      setProfile(initialProfile);
      setOriginalProfile(initialProfile);

      // Fetch profile from database for latest data
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          const fetchedProfile = {
            full_name: data.full_name || '',
            email: user.email || '',
            phone: data.phone || '',
          };
          setProfile(fetchedProfile);
          setOriginalProfile(fetchedProfile);
        }
      };

      fetchProfile();
    }
  }, [user]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});
    setLoading(true);

    // Validate with Zod
    const result = profileSchema.safeParse({
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone || '',
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

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Use id instead of user_id
          full_name: profile.full_name,
          phone: profile.phone || null,
        });

      if (profileError) throw profileError;

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
        },
      });

      if (updateError) throw updateError;

      setSaveSuccess(true);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      const formattedError = formatProfileError(error);
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
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6 max-w-4xl">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-lg px-4 py-2">
                <CheckCircle className="w-5 h-5 text-teal" />
                <span className="text-sm font-medium text-teal">Changes saved</span>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => {
                      setProfile({ ...profile, full_name: e.target.value });
                      if (errors.full_name) setErrors({ ...errors, full_name: '' });
                    }}
                    className={`pl-10 ${errors.full_name ? 'border-destructive' : ''}`}
                    required
                    disabled={loading}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive mt-1">{errors.full_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="pl-10"
                    required
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Allow only digits, +, and spaces
                      value = value.replace(/[^\d+\s]/g, '');
                      setProfile({ ...profile, phone: value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                    placeholder="Enter your phone number"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Examples: +255712345678, 255712345678, or 0712345678
                  </p>
                  {errors.phone && (
                    <p className="text-xs text-destructive mt-1">{errors.phone}</p>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Profile;

