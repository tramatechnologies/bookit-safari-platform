import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, User, FileText, CheckCircle, Users, Clock, Award, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { operatorInterestSchema } from '@/lib/validations/operator';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const OperatorRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    description: '',
    licenseNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate with Zod
    const result = operatorInterestSchema.safeParse(formData);

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
      // Submit operator interest form (no authentication required)
      const { data, error } = await supabase
        .from('operator_interest')
        .insert({
          company_name: formData.companyName,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          address: formData.address,
          description: formData.description,
          license_number: formData.licenseNumber,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: 'Interest Submitted!',
        description: 'Thank you for your interest. Our team will contact you soon.',
      });
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit your interest. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 border border-border text-center">
              <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-teal" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Interest Submitted!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest in joining BookitSafari as a bus operator. Our team has received your information and will contact you soon.
              </p>
              <div className="bg-muted/50 rounded-lg p-6 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>What's next?</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Our admin team will review your information within 2-3 business days</li>
                  <li>• We'll contact you at <strong>{formData.contactEmail}</strong> or <strong>{formData.contactPhone}</strong></li>
                  <li>• We'll discuss partnership terms and requirements</li>
                  <li>• Upon agreement, our admin will create your operator account</li>
                  <li>• You'll then receive access to the operator dashboard</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="teal" asChild>
                  <Link to="/">Go to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-teal/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Express Interest as Bus Operator
            </h1>
            <p className="text-lg text-muted-foreground">
              Interested in joining BookitSafari? Submit your information and our team will contact you to discuss partnership opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    How Operator Registration Works
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Operators cannot self-register. After you submit this form, our admin team will review your information and contact you. 
                    Upon agreement, our admin will create your operator account and grant you access to the operator dashboard.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter your bus company name"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    if (errors.companyName) setErrors({ ...errors, companyName: '' });
                  }}
                  className={errors.companyName ? 'border-destructive' : ''}
                  required
                  disabled={loading}
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive mt-1">{errors.companyName}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Your Full Name"
                    value={formData.contactName}
                    onChange={(e) => {
                      setFormData({ ...formData, contactName: e.target.value });
                      if (errors.contactName) setErrors({ ...errors, contactName: '' });
                    }}
                    className={errors.contactName ? 'border-destructive' : ''}
                    required
                    disabled={loading}
                  />
                  {errors.contactName && (
                    <p className="text-xs text-destructive mt-1">{errors.contactName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter Your Email Address"
                    value={formData.contactEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, contactEmail: e.target.value });
                      if (errors.contactEmail) setErrors({ ...errors, contactEmail: '' });
                    }}
                    className={errors.contactEmail ? 'border-destructive' : ''}
                    required
                    disabled={loading}
                  />
                  {errors.contactEmail && (
                    <p className="text-xs text-destructive mt-1">{errors.contactEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Phone *
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter Your Phone Number"
                    value={formData.contactPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, contactPhone: e.target.value });
                      if (errors.contactPhone) setErrors({ ...errors, contactPhone: '' });
                    }}
                    className={errors.contactPhone ? 'border-destructive' : ''}
                    required
                    disabled={loading}
                  />
                  {errors.contactPhone && (
                    <p className="text-xs text-destructive mt-1">{errors.contactPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    License Number *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter Your License Number"
                    value={formData.licenseNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, licenseNumber: e.target.value });
                      if (errors.licenseNumber) setErrors({ ...errors, licenseNumber: '' });
                    }}
                    className={errors.licenseNumber ? 'border-destructive' : ''}
                    required
                    disabled={loading}
                  />
                  {errors.licenseNumber && (
                    <p className="text-xs text-destructive mt-1">{errors.licenseNumber}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Business Address *
                </label>
                <Input
                  type="text"
                  placeholder="Enter Your Business Address"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: '' });
                  }}
                  className={errors.address ? 'border-destructive' : ''}
                  required
                  disabled={loading}
                />
                {errors.address && (
                  <p className="text-xs text-destructive mt-1">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Company Description
                </label>
                <Textarea
                  placeholder="Enter Your Company Description (Optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Review Process:</strong> Your interest will be reviewed by our admin team within 2-3 business days. 
                  We'll contact you to discuss partnership terms and requirements. Once an agreement is reached, our admin will create your operator account.
                </p>
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
                    Submitting...
                  </>
                ) : (
                  'Submit Interest'
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-teal/5 to-amber/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
              Benefits of Joining BookitSafari
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <Users className="w-8 h-8 text-teal mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Reach More Customers</h3>
                <p className="text-sm text-muted-foreground">
                  Access thousands of travelers looking to book bus tickets across Tanzania.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <Clock className="w-8 h-8 text-teal mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Easy Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage routes, schedules, and bookings from one convenient dashboard.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <Award className="w-8 h-8 text-teal mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Get paid securely through our integrated payment system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OperatorRegister;

