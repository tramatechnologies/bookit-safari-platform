import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, MapPin, Calendar, CreditCard, User, Phone, Mail, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSchedule, useAvailableSeats } from '@/hooks/use-schedules';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { createBookingSchema } from '@/lib/validations/booking';
import { validateUuid } from '@/lib/validations/uuid';

const Booking = () => {
  const { scheduleId: rawScheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Validate UUID from URL
  const scheduleId = validateUuid(rawScheduleId);
  
  const { data: schedule, isLoading: loadingSchedule } = useSchedule(scheduleId || '');
  const { data: availableSeats = 0 } = useAvailableSeats(scheduleId || '');
  const createBooking = useCreateBooking();

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerInfo, setPassengerInfo] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSeats = schedule?.bus?.total_seats || 0;
  const pricePerSeat = Number(schedule?.price_tzs) || 0;
  const totalPrice = selectedSeats.length * pricePerSeat;

  // Generate seat layout (assuming standard bus with 2-2 or 2-3 configuration)
  const generateSeatLayout = () => {
    const seats: Array<{ number: number; available: boolean; selected: boolean }> = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        number: i,
        available: i <= availableSeats, // Simplified - in real app, check against booked seats
        selected: selectedSeats.includes(i),
      });
    }
    return seats;
  };

  const handleSeatClick = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length < 5) { // Limit to 5 seats per booking
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        toast({
          title: 'Maximum seats',
          description: 'You can select up to 5 seats per booking.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (selectedSeats.length === 0) {
      toast({
        title: 'No seats selected',
        description: 'Please select at least one seat.',
        variant: 'destructive',
      });
      return;
    }

    if (!scheduleId || !user) return;

    // Validate with Zod
    const result = createBookingSchema.safeParse({
      scheduleId,
      passengerName: passengerInfo.name,
      passengerPhone: passengerInfo.phone,
      passengerEmail: passengerInfo.email || '',
      seatNumbers: selectedSeats,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          const field = err.path[0].toString();
          fieldErrors[field] = err.message;
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

    try {
      const booking = await createBooking.mutateAsync({
        schedule_id: scheduleId,
        user_id: user.id,
        passenger_name: passengerInfo.name,
        passenger_phone: passengerInfo.phone,
        passenger_email: passengerInfo.email || null,
        seat_numbers: selectedSeats,
        total_seats: selectedSeats.length,
        total_amount_tzs: totalPrice, // Database uses total_amount_tzs
        status: 'pending',
      });

      toast({
        title: 'Booking created!',
        description: 'Redirecting to payment...',
      });

      navigate(`/booking/${booking.id}/payment`);
    } catch (error: any) {
      const formattedError = formatBookingError(error);
      toast({
        title: formattedError.title,
        description: formattedError.description,
        variant: 'destructive',
      });
    }
  };

  // Redirect if invalid UUID
  if (rawScheduleId && !scheduleId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Invalid Schedule ID</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The schedule ID in the URL is invalid.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadingSchedule) {
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

  if (!schedule) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Schedule not found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The schedule you're looking for doesn't exist or is no longer available.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const seats = generateSeatLayout();
  const seatsPerRow = 4; // 2-2 configuration
  const rows = Math.ceil(totalSeats / seatsPerRow);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Summary */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-2xl font-bold mb-4">Trip Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal" />
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-semibold">
                        {schedule.route?.departure_region?.name || 'N/A'}
                      </p>
                      {schedule.route?.departure_terminal && (
                        <p className="text-sm text-muted-foreground">
                          {schedule.route.departure_terminal}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-amber" />
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="font-semibold">
                        {schedule.route?.destination_region?.name || 'N/A'}
                      </p>
                      {schedule.route?.arrival_terminal && (
                        <p className="text-sm text-muted-foreground">
                          {schedule.route.arrival_terminal}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {new Date(schedule.departure_date).toLocaleDateString('en-TZ', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Departure Time</p>
                      <p className="font-semibold">{schedule.departure_time.substring(0, 5)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Operator</p>
                      <p className="font-semibold">
                        {schedule.route?.operator?.company_name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Bus Information */}
                  {schedule.bus && (
                    <div className="flex items-center gap-3 p-3 bg-amber/10 rounded-lg border border-amber/20">
                      <Bus className="w-5 h-5 text-amber" />
                      <div>
                        <p className="text-sm text-muted-foreground">Your Bus</p>
                        <p className="font-bold text-lg">
                          Bus {schedule.bus.bus_number || 'N/A'}
                        </p>
                        {schedule.bus.plate_number && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Plate: {schedule.bus.plate_number}
                          </p>
                        )}
                        {schedule.bus.bus_type && (
                          <p className="text-xs text-muted-foreground">
                            {schedule.bus.bus_type}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seat Selection */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">Select Seats</h2>
                  <div className="text-sm text-muted-foreground">
                    {availableSeats} seats available
                  </div>
                </div>

                {/* Seat Map */}
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex items-center gap-6 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-2 border-border bg-background" />
                      <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-2 border-teal bg-teal/20" />
                      <span className="text-muted-foreground">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-2 border-border bg-muted opacity-50" />
                      <span className="text-muted-foreground">Occupied</span>
                    </div>
                  </div>

                  {/* Bus Layout */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <div className="text-center mb-4 text-sm font-medium text-muted-foreground">
                      Driver
                    </div>
                    <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                      {seats.map((seat) => (
                        <button
                          key={seat.number}
                          type="button"
                          onClick={() => handleSeatClick(seat.number)}
                          disabled={!seat.available}
                          className={`
                            w-12 h-12 rounded border-2 flex items-center justify-center font-medium text-sm
                            transition-all
                            ${
                              seat.selected
                                ? 'border-teal bg-teal/20 text-teal'
                                : seat.available
                                ? 'border-border bg-background hover:border-primary hover:bg-primary/5'
                                : 'border-border bg-muted opacity-50 cursor-not-allowed'
                            }
                          `}
                        >
                          {seat.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedSeats.length > 0 && (
                    <div className="mt-4 p-4 bg-teal/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">Selected Seats:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map((seat) => (
                          <span
                            key={seat}
                            className="px-3 py-1 bg-teal text-teal-foreground rounded-full text-sm font-medium"
                          >
                            Seat {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Passenger Information */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-2xl font-bold mb-4">Passenger Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        value={passengerInfo.name}
                        onChange={(e) =>
                          setPassengerInfo({ ...passengerInfo, name: e.target.value })
                        }
                        className="pl-10"
                        placeholder="Enter Your Full Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={passengerInfo.phone}
                        onChange={(e) => {
                          setPassengerInfo({ ...passengerInfo, phone: e.target.value });
                          if (errors.passengerPhone) setErrors({ ...errors, passengerPhone: '' });
                        }}
                        className={`pl-10 ${errors.passengerPhone ? 'border-destructive' : ''}`}
                        placeholder="Enter Your Phone Number"
                        required
                        disabled={createBooking.isPending}
                      />
                      {errors.passengerPhone && (
                        <p className="text-xs text-destructive mt-1">{errors.passengerPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={passengerInfo.email}
                        onChange={(e) => {
                          setPassengerInfo({ ...passengerInfo, email: e.target.value });
                          if (errors.passengerEmail) setErrors({ ...errors, passengerEmail: '' });
                        }}
                        className={`pl-10 ${errors.passengerEmail ? 'border-destructive' : ''}`}
                        placeholder="Enter Your Email Address (Optional)"
                        disabled={createBooking.isPending}
                      />
                      {errors.passengerEmail && (
                        <p className="text-xs text-destructive mt-1">{errors.passengerEmail}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="teal"
                    size="lg"
                    className="w-full"
                    disabled={createBooking.isPending || selectedSeats.length === 0}
                  >
                    {createBooking.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar - Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h3 className="font-display text-xl font-bold mb-4">Price Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seats ({selectedSeats.length})</span>
                    <span className="font-medium">
                      {selectedSeats.length > 0
                        ? formatPrice(pricePerSeat * selectedSeats.length)
                        : formatPrice(0)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-2xl text-teal">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Payment via mobile money or card</p>
                  <p>• Booking confirmation sent via SMS/Email</p>
                  <p>• Cancellation allowed up to 24h before departure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Booking;

