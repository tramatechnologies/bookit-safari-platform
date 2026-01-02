import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowRight, X, Loader2, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useBookings, useCancelBooking } from '@/hooks/use-bookings';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { formatApiError } from '@/lib/utils/error-messages';
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
  const { data: bookings, isLoading } = useBookings();
  const cancelBooking = useCancelBooking();
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    try {
      await cancelBooking.mutateAsync({ bookingId: bookingToCancel });
      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been cancelled successfully.',
      });
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your bus bookings
            </p>
          </div>

          {!bookings || bookings.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't made any bookings. Start by searching for a trip!
              </p>
              <Button variant="teal" asChild>
                <Link to="/">
                  Search for Buses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const schedule = booking.schedule;
                // Use total_price_tzs (correct column name)
                const totalAmount = Number((booking as any).total_price_tzs || 0);
                const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

                return (
                  <div
                    key={booking.id}
                    className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Booking Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-display text-xl font-bold">
                                Booking #{booking.booking_number}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                  booking.status === 'confirmed'
                                    ? 'bg-teal/10 text-teal'
                                    : booking.status === 'cancelled'
                                    ? 'bg-destructive/10 text-destructive'
                                    : booking.status === 'completed'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Booked on{' '}
                              {new Date(booking.created_at).toLocaleDateString('en-TZ', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-teal mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Route</p>
                              <p className="font-semibold">
                                {schedule?.route?.departure_region?.name || 'N/A'}{' '}
                                <ArrowRight className="w-4 h-4 inline mx-1" />{' '}
                                {schedule?.route?.destination_region?.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Date & Time</p>
                              <p className="font-semibold">
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

                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Seats</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {booking.seat_numbers.map((seat) => (
                                  <span
                                    key={seat}
                                    className="px-2 py-0.5 bg-teal/10 text-teal rounded text-xs font-medium"
                                  >
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="font-bold text-lg text-teal">
                              {formatPrice(totalAmount)}
                            </p>
                          </div>

                          {/* Bus Information */}
                          {schedule?.bus && (
                            <div className="flex items-start gap-3 md:col-span-2 p-3 bg-amber/10 rounded-lg border border-amber/20">
                              <Bus className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Your Bus</p>
                                <p className="font-semibold">
                                  Bus {schedule.bus.bus_number || 'N/A'}
                                  {schedule.bus.plate_number && (
                                    <span className="text-sm text-muted-foreground ml-2 font-mono">
                                      ({schedule.bus.plate_number})
                                    </span>
                                  )}
                                </p>
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
                      <div className="flex flex-col gap-2 lg:w-48">
                        {booking.status === 'confirmed' && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/booking/${booking.id}/confirmation`}>
                              View Details
                            </Link>
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(booking.id)}
                            disabled={cancelBooking.isPending}
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
                You may be eligible for a refund based on the cancellation policy.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
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

