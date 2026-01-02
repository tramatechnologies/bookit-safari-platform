import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useBooking } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { paymentSchema } from '@/lib/validations/payment';
import { z } from 'zod';
import { validateUuid } from '@/lib/validations/uuid';
import { formatPaymentError } from '@/lib/utils/error-messages';

const Payment = () => {
  const { bookingId: rawBookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Validate UUID from URL
  const bookingId = validateUuid(rawBookingId);
  
  const { data: booking, isLoading } = useBooking(bookingId || '');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shouldPoll, setShouldPoll] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.phone) {
      setPhoneNumber(user.user_metadata.phone);
    }
  }, [user]);

  // Poll for payment status when shouldPoll is true
  useEffect(() => {
    if (!shouldPoll || !booking || paymentStatus === 'success' || paymentStatus === 'failed') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        // Check booking status to see if payment was completed
        const { data: updatedBooking } = await supabase
          .from('bookings')
          .select('status, payments(status)')
          .eq('id', booking.id)
          .single();

        if (updatedBooking?.status === 'confirmed') {
          setShouldPoll(false);
          setPaymentStatus('success');
          toast({
            title: 'Payment successful!',
            description: 'Your booking has been confirmed.',
          });

          // Redirect to confirmation page after 2 seconds
          setTimeout(() => {
            navigate(`/booking/${booking.id}/confirmation`);
          }, 2000);
        } else if (updatedBooking?.payments?.[0]?.status === 'failed') {
          setShouldPoll(false);
          setPaymentStatus('failed');
          toast({
            title: 'Payment failed',
            description: 'The payment was not completed. Please try again.',
            variant: 'destructive',
          });
          setProcessing(false);
        }
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('Payment status check error:', error);
        }
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    const timeoutId = setTimeout(() => {
      setShouldPoll(false);
      if (paymentStatus === 'processing') {
        toast({
          title: 'Payment pending',
          description: 'Your payment is still being processed. You will receive a confirmation email once completed.',
        });
        setProcessing(false);
      }
    }, 5 * 60 * 1000);

    // Cleanup function
    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
    };
  }, [shouldPoll, booking, paymentStatus, navigate, toast]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking || !user) return;

    setErrors({});

    // Validate with Zod
    const result = paymentSchema.safeParse({
      paymentMethod,
      phoneNumber: phoneNumber || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: 'Validation Error',
        description: 'Please check the form and fix the errors.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    setPaymentStatus('processing');

    try {
      // Initiate payment via secure edge function (prevents amount manipulation)
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('initiate-payment', {
        body: {
          booking_id: booking.id,
          payment_method: paymentMethod,
          phone_number: phoneNumber || undefined,
        },
      });

      if (paymentError) throw paymentError;

      if (!paymentData?.success || !paymentData?.payment_id) {
        throw new Error(paymentData?.error || 'Failed to initiate payment');
      }

      // Payment initiated successfully
      setPaymentStatus('processing');
      
      // Show success message with instructions
      toast({
        title: 'Payment Request Sent',
        description: paymentData.message || 'Please check your phone and enter your PIN to complete the payment.',
      });

      // Start polling for payment status (useEffect will handle cleanup)
      setShouldPoll(true);
    } catch (error: any) {
      setPaymentStatus('failed');
      setProcessing(false);
      const formattedError = formatPaymentError(error);
      toast({
        title: formattedError.title,
        description: formattedError.description,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h3 className="font-semibold text-destructive mb-1">Booking not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The booking you're looking for doesn't exist.
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if booking is already confirmed
  if (booking.status === 'confirmed') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-teal/10 border border-teal/20 rounded-lg p-6">
            <h3 className="font-semibold text-teal mb-1">Booking Already Confirmed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This booking has already been paid and confirmed.
            </p>
            <Button variant="teal" onClick={() => navigate(`/booking/${booking.id}/confirmation`)}>
              View Confirmation
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check for existing completed payment
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (!bookingId || !user) return;
      
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status')
        .eq('booking_id', bookingId)
        .eq('status', 'completed')
        .maybeSingle();

      if (existingPayment) {
        toast({
          title: 'Payment already completed',
          description: 'This booking has already been paid.',
        });
        navigate(`/booking/${booking.id}/confirmation`);
      }
    };

    checkExistingPayment();
  }, [bookingId, user, booking, navigate, toast]);

  // Handle both field names for compatibility (database uses total_amount_tzs)
  const totalAmount = Number((booking as any).total_price_tzs || (booking as any).total_amount_tzs || 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {paymentStatus === 'success' ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-teal" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your booking has been confirmed. Redirecting to confirmation page...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-display text-2xl font-bold mb-6">Payment Method</h2>

                  <form onSubmit={handlePayment} className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="mpesa" id="mpesa" />
                        <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5" />
                            <div>
                              <p className="font-medium">M-Pesa</p>
                              <p className="text-sm text-muted-foreground">Mobile Money</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="tigopesa" id="tigopesa" />
                        <Label htmlFor="tigopesa" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Tigo Pesa</p>
                              <p className="text-sm text-muted-foreground">Mobile Money</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="airtel" id="airtel" />
                        <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Airtel Money</p>
                              <p className="text-sm text-muted-foreground">Mobile Money</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="clickpesa" id="clickpesa" />
                        <Label htmlFor="clickpesa" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5" />
                            <div>
                              <p className="font-medium">ClickPesa</p>
                              <p className="text-sm text-muted-foreground">Card Payment</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {(paymentMethod === 'mpesa' || paymentMethod === 'tigopesa' || paymentMethod === 'airtel') && (
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter Your Phone Number"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          You will receive a payment prompt on this number
                        </p>
                      </div>
                    )}

                    {paymentStatus === 'failed' && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Payment failed</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Please try again or use a different payment method.
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="teal"
                      size="lg"
                      className="w-full"
                      disabled={processing || paymentStatus === 'processing'}
                    >
                      {processing || paymentStatus === 'processing' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay {formatPrice(totalAmount)}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Booking Number</span>
                      <span className="font-mono text-xs">{booking.booking_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-medium">{booking.total_seats}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-2xl text-teal">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Secure payment processing</p>
                    <p>• Instant booking confirmation</p>
                    <p>• 24/7 customer support</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Payment;

