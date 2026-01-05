import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Clock, Users, ArrowRight, X, Loader2, Bus, Download, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useBookings, useCancelBooking } from '@/hooks/use-bookings';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { formatApiError } from '@/lib/utils/error-messages';
import { generateETicketPDF } from '@/lib/utils/e-ticket';
import { BookingCardSkeleton, Skeleton } from '@/components/SkeletonLoader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MyBookings = () => {
  const { t } = useTranslation();
  const { data: bookings, isLoading } = useBookings();
  const cancelBooking = useCancelBooking();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [generatingTicketId, setGeneratingTicketId] = useState<string | null>(null);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    try {
      await cancelBooking.mutateAsync({ bookingId: bookingToCancel });
      
      // Small delay to ensure UI updates
      setTimeout(() => {
        toast({
          title: 'Booking cancelled',
          description: 'Your booking has been cancelled successfully.',
        });
      }, 100);
      
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    } catch (error: any) {
      const formattedError = formatApiError(error);
      toast({
        title: formattedError.title,
        description: formattedError.description,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadTicket = async (booking: any) => {
    if (!booking || !booking.schedule) return;

    // Check if payment is completed
    const payment = booking.payments?.[0];
    const isPaymentCompleted = payment?.status === 'completed';

    if (!isPaymentCompleted) {
      toast({
        title: 'Payment Required',
        description: 'Please complete payment before downloading your ticket.',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingTicketId(booking.id);
    try {
      const totalAmount = Number(booking.total_price_tzs || booking.total_amount_tzs || 0);
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
          departure_date: booking.schedule.departure_date || '',
          departure_time: booking.schedule.departure_time || '',
          arrival_time: booking.schedule.arrival_time,
          route: booking.schedule.route,
          bus: booking.schedule.bus,
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
      setGeneratingTicketId(null);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="mb-6 sm:mb-8">
              <Skeleton variant="text" className="w-40 h-7 sm:h-8 mb-2" />
              <Skeleton variant="text" className="w-48 sm:w-64 h-3 sm:h-4" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <BookingCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">My Bookings</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              View and manage your bus bookings
            </p>
          </div>

          {!bookings || bookings.length === 0 ? (
            <div className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-6 sm:p-8 md:p-12 text-center">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="font-semibold text-lg sm:text-xl mb-2">No bookings yet</h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6">
                You haven't made any bookings. Start by searching for a trip!
              </p>
              <Button variant="teal" size="sm" asChild>
                <Link to="/">
                  Search for Buses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {bookings.map((booking) => {
                const schedule = booking.schedule;
                // Use total_price_tzs (correct column name)
                const totalAmount = Number((booking as any).total_price_tzs || 0);
                // Only allow cancellation for bookings with unpaid/incomplete payments (pending status)
                const canCancel = booking.status === 'pending';

                return (
                  <div
                    key={booking.id}
                    className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl border border-border p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-5 md:gap-6">
                      {/* Booking Info */}
                      <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                              <h3 className="font-display text-base sm:text-lg md:text-xl font-bold">
                                Booking #{booking.booking_number}
                              </h3>
                              <span
                                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold uppercase flex-shrink-0 ${
                                  booking.status === 'confirmed' && booking.payments?.[0]?.status === 'completed'
                                    ? 'bg-teal/10 text-teal'
                                    : booking.status === 'cancelled'
                                    ? 'bg-destructive/10 text-destructive'
                                    : booking.status === 'completed'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-amber/10 text-amber'
                                }`}
                              >
                                {booking.status === 'confirmed' && !booking.payments?.[0]?.status === 'completed'
                                  ? 'pending payment'
                                  : booking.status}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Booked on{' '}
                              {new Date(booking.created_at).toLocaleDateString('en-TZ', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-muted-foreground">Route</p>
                              <p className="font-semibold text-sm sm:text-base break-words">
                                {schedule?.route?.departure_region?.name || 'N/A'}{' '}
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 inline mx-0.5 sm:mx-1" />{' '}
                                {schedule?.route?.destination_region?.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 sm:gap-3">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-muted-foreground">Date & Time</p>
                              <p className="font-semibold text-sm sm:text-base">
                                {schedule?.departure_date
                                  ? new Date(schedule.departure_date).toLocaleDateString('en-TZ', {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'N/A'}{' '}
                                at {schedule?.departure_time?.substring(0, 5) || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 sm:gap-3">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">Seats</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {booking.seat_numbers.map((seat) => (
                                  <span
                                    key={seat}
                                    className="px-2 py-0.5 bg-teal/10 text-teal rounded text-xs font-medium flex-shrink-0"
                                  >
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-bold text-base sm:text-lg text-teal">
                              {formatPrice(totalAmount)}
                            </p>
                          </div>

                          {/* Operator Information */}
                          {schedule?.route?.operator && (
                            <div className="flex items-center gap-2 sm:col-span-2 p-2 sm:p-3 bg-teal/10 rounded-lg border border-teal/20">
                              {schedule.route.operator.logo_url ? (
                                <img
                                  src={schedule.route.operator.logo_url}
                                  alt={schedule.route.operator.company_name || 'Operator logo'}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-border flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
                                  <Users className="w-4 h-4 text-teal" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <p className="text-xs sm:text-sm font-semibold truncate">
                                    {schedule.route.operator.company_name}
                                  </p>
                                  {schedule.route.operator.status === 'approved' && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 text-green-600 rounded text-xs font-medium flex-shrink-0">
                                      <span className="w-1 h-1 bg-green-500 rounded-full" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Bus Information */}
                          {schedule?.bus && (
                            <div className="flex items-start gap-2 sm:gap-3 sm:col-span-2 p-2 sm:p-3 bg-amber/10 rounded-lg border border-amber/20">
                              <Bus className="w-4 h-4 sm:w-5 sm:h-5 text-amber mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Your Bus</p>
                                {schedule.bus.plate_number && (
                                  <p className="font-semibold font-mono text-sm">
                                    {schedule.bus.plate_number}
                                  </p>
                                )}
                                {schedule.bus.bus_type && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {schedule.bus.bus_type}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:w-auto">
                        {booking.status === 'confirmed' && (
                          <>
                            <Button variant="outline" size="sm" asChild className="h-10 sm:h-9">
                              <Link to={`/booking/${booking.id}/confirmation`}>
                                View Details
                              </Link>
                            </Button>
                            {(() => {
                              const payment = booking.payments?.[0];
                              const isPaymentCompleted = payment?.status === 'completed';
                              const hasPayment = booking.payments && booking.payments.length > 0;
                              
                              return isPaymentCompleted ? (
                                <Button
                                  variant="teal-outline"
                                  size="sm"
                                  onClick={() => handleDownloadTicket(booking)}
                                  disabled={generatingTicketId === booking.id}
                                  title="Download your e-ticket"
                                  className="h-10 sm:h-9"
                                >
                                  {generatingTicketId === booking.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="w-4 h-4 mr-2" />
                                      Download Ticket
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="teal"
                                  size="sm"
                                  asChild
                                  title="Complete payment to confirm booking"
                                  className="h-10 sm:h-9"
                                >
                                  <Link to={`/payment/${booking.id}`}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay Now
                                  </Link>
                                </Button>
                              );
                            })()}
                          </>
                        )}
                        {canCancel && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(booking.id)}
                            disabled={cancelBooking.isPending}
                            className="h-10 sm:h-9"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
                You may be eligible for a refund based on the cancellation policy.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MyBookings;

