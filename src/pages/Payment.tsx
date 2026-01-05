import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.phone) {
      setPhoneNumber(user.user_metadata.phone);
    }
  }, [user]);

  // Poll for payment status with exponential backoff
  useEffect(() => {
    if (!shouldPoll || !booking || paymentStatus === 'success' || paymentStatus === 'failed') {
      return;
    }

    let pollCount = 0;
    const maxPollCount = 100; // ~5 minutes with exponential backoff
    
    const pollPaymentStatus = async () => {
      try {
        pollCount++;
        
        // Check payment status directly (most reliable indicator)
        const { data: payments, error: paymentError } = await supabase
          .from('payments')
          .select('id, status, payment_method')
          .eq('booking_id', booking.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (paymentError) {
          if (import.meta.env.DEV) {
            console.error('Payment status check error:', paymentError);
          }
          return; // Retry on next poll
        }

        const latestPayment = payments?.[0];

        // Check if payment was completed
        if (latestPayment?.status === 'completed') {
          // Payment successful - also check booking is confirmed
          const { data: updatedBooking } = await supabase
            .from('bookings')
            .select('status')
            .eq('id', booking.id)
            .single();

          if (updatedBooking?.status === 'confirmed') {
            setShouldPoll(false);
            setPaymentStatus('success');
            setLastError(null);
            toast({
              title: 'Payment successful!',
              description: 'Your booking has been confirmed.',
            });

            // Redirect after 2 seconds
            setTimeout(() => {
              navigate(`/booking/${booking.id}/confirmation`);
            }, 2000);
            return;
          }
        }

        // Check if payment was marked as failed
        if (latestPayment?.status === 'failed' || latestPayment?.status === 'cancelled') {
          setShouldPoll(false);
          setPaymentStatus('failed');
          setLastError('Payment was not completed. Please try again.');
          toast({
            title: 'Payment failed',
            description: 'The payment was not completed. Please try again.',
            variant: 'destructive',
          });
          setProcessing(false);
          return;
        }

        // Log polling status
        if (import.meta.env.DEV) {
          console.log(`[Poll ${pollCount}] Payment status: ${latestPayment?.status || 'pending'}`);
        }

        // Continue polling if still processing
        if (pollCount >= maxPollCount) {
          // Timeout after ~5 minutes
          setShouldPoll(false);
          setPaymentStatus('failed');
          setLastError('Payment confirmation timeout. Please check your phone or try again.');
          toast({
            title: 'Payment pending',
            description: 'Your payment is taking longer than expected. You will receive a confirmation email once completed.',
          });
          setProcessing(false);
        }
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('Payment polling error:', error);
        }
      }
    };

    // Exponential backoff: start at 2s, max 10s
    const getInterval = (count: number) => {
      const baseInterval = 2000;
      const maxInterval = 10000;
      const interval = baseInterval * Math.pow(1.5, Math.floor(count / 10));
      return Math.min(interval, maxInterval);
    };

    // Initial poll immediately
    pollPaymentStatus();

    // Set up polling with exponential backoff
    const pollInterval = setInterval(() => {
      const interval = getInterval(pollCount);
      setTimeout(pollPaymentStatus, interval);
    }, getInterval(pollCount));

    // Cleanup
    return () => {
      clearInterval(pollInterval);
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
      // The Supabase SDK automatically includes the Authorization header for authenticated users
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('initiate-payment', {
        body: {
          booking_id: booking.id,
          payment_method: paymentMethod,
          phone_number: phoneNumber || undefined,
        },
      });

      if (paymentError) {
        // Extract error message from various possible response structures
        let errorMessage = paymentError.message || 'Payment initiation failed';
        
        // If error is a JSON response with nested error info
        if (paymentError?.context?.error) {
          errorMessage = paymentError.context.error;
        }
        
        throw new Error(errorMessage);
      }

      if (!paymentData?.success || !paymentData?.payment_id) {
        throw new Error(paymentData?.error || 'Failed to initiate payment');
      }

      // Payment initiated successfully
      setPaymentStatus('processing');
      setPaymentId(paymentData.payment_id);
      setRetryCount(0);
      setLastError(null);
      
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
      
      // Debug log for development
      if (import.meta.env.DEV) {
        console.error('[Payment] Full error:', error);
      }
      
      // Extract the actual error message from edge function response
      let errorMessage = error?.message || 'Payment failed. Please try again.';
      
      // Format with our error formatter
      const formattedError = formatPaymentError({ message: errorMessage });
      let displayMessage = formattedError.description;
      
      // Add recovery suggestions
      if (errorMessage?.includes('Network') || error?.status === 0) {
        displayMessage += '\n\nTip: Check your internet connection and try again.';
      } else if (error?.status === 400) {
        displayMessage += '\n\nTip: Please check your phone number format.';
      } else if (error?.status === 429) {
        displayMessage += '\n\nTip: Too many attempts. Please wait a moment before trying again.';
      }
      
      setLastError(displayMessage);
      
      toast({
        title: formattedError.title,
        description: displayMessage,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 pt-24 max-w-4xl">
          <div className="text-center mb-8">
            <div className="h-8 bg-muted animate-pulse rounded w-64 mx-auto mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto" />
          </div>
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="space-y-6">
              <div className="h-6 bg-muted animate-pulse rounded w-48" />
              <div className="h-32 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded w-full" />
            </div>
          </div>
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



  // Handle both field names for compatibility (database uses total_amount_tzs)
  const totalAmount = Number((booking as any).total_price_tzs || (booking as any).total_amount_tzs || 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24 md:pt-28 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 sm:mb-6 h-10 sm:h-11"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {paymentStatus === 'success' ? (
            <div className="bg-card rounded-lg sm:rounded-2xl border border-border p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-teal" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Your booking has been confirmed. Redirecting to confirmation page...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg sm:rounded-2xl border border-border p-4 sm:p-6">
                  <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Payment Method</h2>

                  <form onSubmit={handlePayment} className="space-y-4 sm:space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {/* M-Pesa */}
                      <div className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[60px] sm:min-h-auto ${
                        paymentMethod === 'mpesa' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}>
                        <RadioGroupItem value="mpesa" id="mpesa" className="flex-shrink-0" />
                        <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-4">
                            <img 
                              src="/images/M-Pesa.png" 
                              alt="M-Pesa" 
                              className="w-12 h-12 object-contain"
                            />
                            <div>
                              <p className="font-medium">M-Pesa</p>
                              <p className="text-sm text-muted-foreground">Mobile Money</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      {/* Tigo Pesa */}
                      <div className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[60px] sm:min-h-auto ${
                        paymentMethod === 'tigopesa' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}>
                        <RadioGroupItem value="tigopesa" id="tigopesa" className="flex-shrink-0" />
                        <Label htmlFor="tigopesa" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <img 
                              src="/images/Mixx By Yas.jpg" 
                              alt="Tigo Pesa" 
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm sm:text-base">Tigo Pesa</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">Mobile Money</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      {/* Airtel Money */}
                      <div className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[60px] sm:min-h-auto ${
                        paymentMethod === 'airtel' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}>
                        <RadioGroupItem value="airtel" id="airtel" className="flex-shrink-0" />
                        <Label htmlFor="airtel" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <img 
                              src="/images/AIrtel Money.jpg" 
                              alt="Airtel Money" 
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm sm:text-base">Airtel Money</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">Mobile Money</p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      {/* HaloPesa */}
                      <div className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all min-h-[60px] sm:min-h-auto ${
                        paymentMethod === 'halopesa' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}>
                        <RadioGroupItem value="halopesa" id="halopesa" className="flex-shrink-0" />
                        <Label htmlFor="halopesa" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <img 
                              src="/images/Halopesa.png" 
                              alt="HaloPesa" 
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm sm:text-base">HaloPesa</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">Mobile Money</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {(paymentMethod === 'mpesa' || paymentMethod === 'tigopesa' || paymentMethod === 'airtel' || paymentMethod === 'halopesa') && (
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Allow only digits, +, and spaces
                            value = value.replace(/[^\d+\s]/g, '');
                            setPhoneNumber(value);
                          }}
                          placeholder="Enter your phone number"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your phone number. Examples: +255712345678, 255712345678, or 0712345678. You will receive a payment prompt on this number
                        </p>
                      </div>
                    )}

                    {paymentStatus === 'failed' && lastError && (
                      <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div>
                            {lastError.split('\n\n').map((section, idx) => (
                              <div key={idx} className={idx > 0 ? 'mt-3 pt-3 border-t border-destructive/20' : ''}>
                                {section.split('\n').map((line, lineIdx) => (
                                  <p 
                                    key={lineIdx}
                                    className={`${
                                      lineIdx === 0 
                                        ? 'text-sm font-semibold text-destructive' 
                                        : 'text-xs text-muted-foreground mt-1'
                                    }`}
                                  >
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
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
                      ) : paymentStatus === 'failed' ? (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Retry Payment
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
                      <span className="font-mono text-xs">{booking.booking_reference}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-medium">{booking.seat_numbers?.length || 0}</span>
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

