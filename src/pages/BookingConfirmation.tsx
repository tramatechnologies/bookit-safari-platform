import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, MapPin, Clock, Users, ArrowRight, Bus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useBooking } from '@/hooks/use-bookings';
import { formatPrice } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { validateUuid } from '@/lib/validations/uuid';
import { generateETicketPDF } from '@/lib/utils/e-ticket';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const BookingConfirmation = () => {
  const { bookingId: rawBookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  
  // Validate UUID from URL
  const bookingId = validateUuid(rawBookingId);
  
  const { data: booking, isLoading } = useBooking(bookingId || '');

  // Redirect if invalid UUID
  if (rawBookingId && !bookingId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Invalid Booking ID</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The booking ID in the URL is invalid.
              </p>
              <Button variant="outline" onClick={() => navigate('/bookings')}>
                View My Bookings
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 pt-24 max-w-4xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-muted animate-pulse mx-auto mb-4" />
            <div className="h-8 bg-muted animate-pulse rounded w-64 mx-auto mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto" />
          </div>
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="space-y-4">
              <div className="h-6 bg-muted animate-pulse rounded w-48" />
              <div className="h-4 bg-muted animate-pulse rounded w-32" />
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded w-24" />
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
                <div className="space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded w-24" />
                  <div className="h-4 bg-muted animate-pulse rounded w-full" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
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
            <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const schedule = booking.schedule;
  // Handle both field names for compatibility (database uses total_amount_tzs)
  const totalAmount = Number((booking as any).total_price_tzs || (booking as any).total_amount_tzs || 0);

  // Check if payment is completed
  const payment = booking.payments?.[0];
  const isPaymentCompleted = payment?.status === 'completed';
  const hasPayment = booking.payments && booking.payments.length > 0;

  const handleDownloadTicket = async () => {
    if (!isPaymentCompleted) {
      toast({
        title: 'Payment Required',
        description: 'Please complete payment before downloading your ticket.',
        variant: 'destructive',
      });
      return;
    }
    if (!booking || !schedule) return;

    setIsGeneratingTicket(true);
    try {
      await generateETicketPDF(
        {
          id: booking.id,
          booking_number: booking.booking_number,
          passenger_name: booking.passenger_name,
          passenger_phone: booking.passenger_phone,
          passenger_email: booking.passenger_email,
          seat_numbers: booking.seat_numbers,
          total_amount_tzs: totalAmount,
          status: booking.status,
          created_at: booking.created_at,
        },
        {
          departure_date: schedule.departure_date || '',
          departure_time: schedule.departure_time || '',
          arrival_time: schedule.arrival_time,
          route: schedule.route,
          bus: schedule.bus,
        }
      );
      toast({
        title: 'Ticket Downloaded',
        description: 'Your e-ticket has been downloaded successfully.',
      });
    } catch (error: any) {
      console.error('Error generating ticket:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to generate ticket. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-12 pt-24 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-teal" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your booking has been successfully confirmed. Details have been sent to your email.
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-card rounded-2xl border border-border p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Booking Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Booking Number: <span className="font-mono font-semibold">{booking.booking_number}</span>
                </p>
              </div>
              <div className="px-4 py-2 bg-teal/10 rounded-lg">
                <span className="text-sm font-semibold text-teal uppercase">
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Trip Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-3">Trip Information</h3>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-semibold">
                      {schedule?.route?.departure_region?.name || 'N/A'}
                    </p>
                    {schedule?.route?.departure_terminal && (
                      <p className="text-sm text-muted-foreground">
                        {schedule.route.departure_terminal}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-semibold">
                      {schedule?.route?.destination_region?.name || 'N/A'}
                    </p>
                    {schedule?.route?.arrival_terminal && (
                      <p className="text-sm text-muted-foreground">
                        {schedule.route.arrival_terminal}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {schedule?.departure_date
                        ? new Date(schedule.departure_date).toLocaleDateString('en-TZ', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Departure Time</p>
                    <p className="font-semibold">
                      {schedule?.departure_time?.substring(0, 5) || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Operator & Bus Information */}
                {schedule?.route?.operator && (
                  <div className="flex items-center gap-3 p-4 bg-teal/10 rounded-lg border border-teal/20 mb-4">
                    {schedule.route.operator.logo_url ? (
                      <img
                        src={schedule.route.operator.logo_url}
                        alt={schedule.route.operator.company_name || 'Operator logo'}
                        className="w-12 h-12 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-teal/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-teal" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">
                          {schedule.route.operator.company_name}
                        </p>
                        {schedule.route.operator.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-600 rounded text-xs font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bus Information - Prominently Displayed */}
                {schedule?.bus && (
                  <div className="flex items-start gap-3 p-4 bg-amber/10 rounded-lg border border-amber/20">
                    <Bus className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber mb-1">Your Bus Information</p>
                      {schedule.bus.plate_number && (
                        <p className="font-bold text-lg font-mono">
                          {schedule.bus.plate_number}
                        </p>
                      )}
                      {schedule.bus.bus_type && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {schedule.bus.bus_type}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Passenger & Seat Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-3">Passenger Details</h3>
                
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{booking.passenger_name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{booking.passenger_phone}</p>
                </div>

                {booking.passenger_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{booking.passenger_email}</p>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {booking.seat_numbers.map((seat) => (
                        <span
                          key={seat}
                          className="px-3 py-1 bg-teal/10 text-teal rounded-full text-sm font-medium"
                        >
                          Seat {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-3xl font-bold text-teal">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/bookings">
                View All Bookings
              </Link>
            </Button>
            <Button variant="teal" className="flex-1" asChild>
              <Link to="/">
                Book Another Trip
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1"
              onClick={handleDownloadTicket}
              disabled={isGeneratingTicket || !isPaymentCompleted}
              title={!hasPayment ? 'Payment pending' : !isPaymentCompleted ? 'Payment not completed' : 'Download your e-ticket'}
            >
              {isGeneratingTicket ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : !isPaymentCompleted ? (
                <>
                  <Download className="w-4 h-4 mr-2 opacity-50" />
                  Payment Required
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Ticket
                </>
              )}
            </Button>
          </div>

          {/* Bus Information Card - Prominent */}
          {schedule?.bus && (
            <div className="mt-8 bg-gradient-to-r from-amber/20 to-teal/20 rounded-2xl border-2 border-amber/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber/20 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-amber" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your Bus Details</h3>
                  <p className="text-sm text-muted-foreground">Look for this bus at the terminal</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {schedule.bus.plate_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plate Number</p>
                    <p className="text-2xl font-bold font-mono text-foreground">
                      {schedule.bus.plate_number}
                    </p>
                  </div>
                )}
                {schedule.bus.bus_type && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bus Type</p>
                    <p className="text-xl font-semibold text-foreground">
                      {schedule.bus.bus_type}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Important Information */}
          <div className="mt-8 bg-muted/30 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Important Information</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Please arrive at the terminal at least 30 minutes before departure</li>
              <li>• Look for plate number <strong className="text-foreground font-mono">{schedule?.bus?.plate_number || 'as shown above'}</strong> at the terminal</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Cancellation is allowed up to 24 hours before departure</li>
              <li>• Booking confirmation has been sent to your email and phone</li>
            </ul>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default BookingConfirmation;

