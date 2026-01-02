import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2, AlertCircle, ChevronDown, Users, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SeatLayout, type SeatLayoutType, getSeatNumberFromId } from '@/components/SeatLayout';
import { BookingSummary } from '@/components/BookingSummary';
import { PassengerForm, type PassengerInfo } from '@/components/PassengerForm';
import { useSchedule, useAvailableSeats, useBookedSeats } from '@/hooks/use-schedules';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createBookingSchema } from '@/lib/validations/booking';
import { validateUuid } from '@/lib/validations/uuid';
import { formatBookingError } from '@/lib/utils/error-messages';

const Booking = () => {
  const { scheduleId: rawScheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Validate UUID from URL
  const scheduleId = validateUuid(rawScheduleId);
  
  const { data: schedule, isLoading: loadingSchedule } = useSchedule(scheduleId || '');
  const { data: availableSeats = 0 } = useAvailableSeats(scheduleId || '');
  
  // Extract departure date as a primitive string (strings are stable primitives)
  const departureDate = schedule?.departure_date ?? '';
  const { data: bookedSeats = [] } = useBookedSeats(scheduleId || '', departureDate);
  const createBooking = useCreateBooking();

  const [numberOfPassengers, setNumberOfPassengers] = useState<number>(1);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]); // Seat IDs like ["A1", "B2"]
  const [boardingPoint, setBoardingPoint] = useState<string>('');
  const [dropOffPoint, setDropOffPoint] = useState<string>('');
  const [passengers, setPassengers] = useState<Record<string, PassengerInfo>>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  
  // Legacy passenger info for backward compatibility (primary contact)
  const [passengerInfo, setPassengerInfo] = useState(() => ({
    name: '',
    phone: '',
    email: user?.email || '',
  }));

  // Extract stable values for dependencies
  const departureTerminal = schedule?.route?.departure_terminal || null;
  const arrivalTerminal = schedule?.route?.arrival_terminal || null;
  const seatLayout = schedule?.bus?.seat_layout || 'layout1';
  const busTotalSeats = schedule?.bus?.total_seats || 0;
  const schedulePrice = Number(schedule?.price_tzs) || 0;

  // Get bus layout type
  const seatLayoutType: SeatLayoutType = (seatLayout as SeatLayoutType);

  // Convert seat IDs to seat numbers for booking (calculate directly - no memoization to avoid dependency issues)
  const selectedSeatNumbers = selectedSeatIds
    .map(id => getSeatNumberFromId(id, seatLayoutType, busTotalSeats))
    .filter(n => n > 0);

  const totalPrice = selectedSeatNumbers.length * schedulePrice;

  // Get terminal options for boarding and drop-off (calculate directly to avoid dependency issues)
  const boardingOptions: string[] = departureTerminal ? [departureTerminal] : [];
  const dropOffOptions: string[] = arrivalTerminal ? [arrivalTerminal] : [];

  const handleSeatClick = useCallback((seatId: string, seatNumber: number) => {
    setSelectedSeatIds((prevIds) => {
      if (prevIds.includes(seatId)) {
        // Deselect seat
        const newIds = [...prevIds.filter((id) => id !== seatId)];
        // Remove passenger info for deselected seat
        setPassengers((prev) => {
          const newPassengers = { ...prev };
          delete newPassengers[seatId];
          return newPassengers;
        });
        return newIds;
      } else {
        // Prevent duplicate seat selection
        if (prevIds.includes(seatId)) {
          return prevIds;
        }
        if (prevIds.length < numberOfPassengers) {
          // Initialize passenger info for new seat
          setPassengers((prev) => {
            if (!prev[seatId]) {
              return {
                ...prev,
                [seatId]: {
                  name: '',
                  gender: '',
                  category: '',
                  phone: prevIds.length === 0 ? passengerInfo.phone : undefined,
                  email: prevIds.length === 0 ? passengerInfo.email : undefined,
                },
              };
            }
            return prev;
          });
          return [...prevIds, seatId];
        } else {
          toast({
            title: 'Seat Limit Reached',
            description: `You can only select ${numberOfPassengers} seat${numberOfPassengers > 1 ? 's' : ''} for ${numberOfPassengers} passenger${numberOfPassengers > 1 ? 's' : ''}.`,
            variant: 'destructive',
          });
          return [...prevIds];
        }
      }
    });
  }, [numberOfPassengers, passengerInfo.phone, passengerInfo.email, toast]);

  const handlePassengerChange = (seatId: string, passenger: PassengerInfo) => {
    setPassengers((prev) => ({
      ...prev,
      [seatId]: passenger,
    }));
    // Update primary contact info if it's the first passenger (check outside setter to avoid closure issues)
    // Use a ref-like pattern by checking the current selectedSeatIds
    if (selectedSeatIds.length > 0 && selectedSeatIds[0] === seatId) {
      setPassengerInfo({
        name: passenger.name,
        phone: passenger.phone || '',
        email: passenger.email || '',
      });
    }
  };

  // Reset seat selection when passenger count changes
  const handlePassengerCountChange = (count: number) => {
    setNumberOfPassengers(count);
    // Clear selections if new count is less than current selections
    if (count < selectedSeatIds.length) {
      setSelectedSeatIds([]);
      // Clear passenger info for removed seats
      const newPassengers: Record<string, PassengerInfo> = {};
      selectedSeatIds.slice(0, count).forEach((seatId) => {
        if (passengers[seatId]) {
          newPassengers[seatId] = passengers[seatId];
        }
      });
      setPassengers(newPassengers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (selectedSeatNumbers.length === 0) {
      toast({
        title: 'No Seats Selected',
        description: 'Please select at least one seat.',
        variant: 'destructive',
      });
      return;
    }

    // Validate seat count matches passenger count
    if (selectedSeatNumbers.length !== numberOfPassengers) {
      toast({
        title: 'Seat Count Mismatch',
        description: `You selected ${selectedSeatNumbers.length} seat${selectedSeatNumbers.length > 1 ? 's' : ''} but have ${numberOfPassengers} passenger${numberOfPassengers > 1 ? 's' : ''}. Please select ${numberOfPassengers} seat${numberOfPassengers > 1 ? 's' : ''}.`,
        variant: 'destructive',
      });
      return;
    }

    if (!scheduleId || !user) return;

    // Validate all passengers have required information
    const passengerErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    selectedSeatIds.forEach((seatId) => {
      const passenger = passengers[seatId];
      const seatErrors: Record<string, string> = {};

      if (!passenger) {
        seatErrors.name = 'Passenger information is required';
        hasErrors = true;
      } else {
        if (!passenger.name || passenger.name.length < 2) {
          seatErrors.name = 'Name must be at least 2 characters';
          hasErrors = true;
        }
        if (!passenger.gender) {
          seatErrors.gender = 'Please select a gender';
          hasErrors = true;
        }
        if (!passenger.category) {
          seatErrors.category = 'Please select a category';
          hasErrors = true;
        }
        if (passenger.category === 'child' && (!passenger.age || passenger.age < 0 || passenger.age > 17)) {
          seatErrors.age = 'Age is required for children (0-17 years)';
          hasErrors = true;
        }
        if (selectedSeatIds[0] === seatId && (!passenger.phone || !passenger.phone.match(/^\+?[0-9]{10,15}$/))) {
          seatErrors.phone = 'Please enter a valid phone number';
          hasErrors = true;
        }
        if (selectedSeatIds[0] === seatId && passenger.email && !passenger.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          seatErrors.email = 'Please enter a valid email address';
          hasErrors = true;
        }
      }

      if (Object.keys(seatErrors).length > 0) {
        passengerErrors[seatId] = seatErrors;
      }
    });

    if (hasErrors) {
      setErrors(passengerErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required passenger information.',
        variant: 'destructive',
      });
      return;
    }

    // Validate with Zod (using first passenger as primary contact)
    const primaryPassenger = passengers[selectedSeatIds[0]];
    const passengerList = selectedSeatIds.map((seatId) => {
      const p = passengers[seatId];
      return {
        name: p.name,
        gender: p.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
        category: p.category as 'adult' | 'student' | 'child',
        age: p.age,
        phone: p.phone,
        email: p.email,
      };
    });

    const result = createBookingSchema.safeParse({
      scheduleId,
      passengerName: primaryPassenger.name,
      passengerPhone: primaryPassenger.phone || '',
      passengerEmail: primaryPassenger.email || '',
      seatNumbers: selectedSeatNumbers,
      passengers: passengerList,
    });

    if (!result.success) {
      const fieldErrors: Record<string, Record<string, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          const path = err.path;
          if (path[0] === 'passengers' && path.length > 1 && typeof path[1] === 'number') {
            const seatIndex = path[1];
            const seatId = selectedSeatIds[seatIndex];
            if (seatId) {
              if (!fieldErrors[seatId]) fieldErrors[seatId] = {};
              const field = path[2]?.toString() || 'name';
              fieldErrors[seatId][field] = err.message;
            }
          }
        }
      });
      setErrors(fieldErrors);
      toast({
        title: 'Validation Error',
        description: 'Please check the form and correct the errors.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Prepare passenger data
      const passengerData = selectedSeatIds.map((seatId, index) => {
        const passenger = passengers[seatId];
        return {
          seat_number: selectedSeatNumbers[index],
          name: passenger.name,
          gender: passenger.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say',
          category: passenger.category as 'adult' | 'student' | 'child',
          age: passenger.age,
          phone: index === 0 ? passenger.phone : undefined, // Only first passenger needs phone
          email: index === 0 ? passenger.email : undefined, // Only first passenger needs email
        };
      });

      const booking = await createBooking.mutateAsync({
        schedule_id: scheduleId,
        user_id: user.id,
        passenger_name: primaryPassenger.name,
        passenger_phone: primaryPassenger.phone || '',
        passenger_email: primaryPassenger.email || null,
        seat_numbers: selectedSeatNumbers,
        total_seats: selectedSeatNumbers.length,
        total_price_tzs: totalPrice,
        status: 'pending',
        boarding_point: boardingPoint || null,
        drop_off_point: dropOffPoint || null,
        passengers: passengerData,
      } as any); // Type assertion needed until types are regenerated

      toast({
        title: 'Booking Created!',
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
              <h3 className="font-semibold text-destructive mb-1">Kitambulisho Kisichokuwa Sahihi</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kitambulisho cha ratiba kwenye URL sio sahihi.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Rudi Nyumbani
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
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="h-10 bg-muted animate-pulse rounded w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded w-48" />
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="h-64 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded w-40" />
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded w-full" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-10 bg-muted animate-pulse rounded w-full mt-4" />
              </div>
            </div>
          </div>
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
              <h3 className="font-semibold text-destructive mb-1">Schedule Not Found</h3>
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
              {/* Operator & Bus Information */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-bold mb-4">Company & Bus Information</h2>
                <div className="space-y-4">
                  {/* Operator Info */}
                  {schedule.route?.operator && (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      {(schedule.route.operator as any).logo_url ? (
                        <img
                          src={(schedule.route.operator as any).logo_url}
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

                  {/* Bus Information */}
                  {schedule.bus && (
                    <div className="space-y-3">
                      {schedule.bus.plate_number && (
                        <div className="flex items-center gap-3">
                          <Bus className="w-5 h-5 text-amber" />
                          <div>
                            <p className="text-sm text-muted-foreground">License Plate</p>
                            <p className="font-mono font-semibold text-lg">{schedule.bus.plate_number}</p>
                          </div>
                        </div>
                      )}
                      {schedule.bus.bus_type && (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Bus Type</p>
                            <span className="inline-block px-3 py-1 bg-teal/20 text-teal rounded text-sm font-medium mt-1">
                              {schedule.bus.bus_type}
                            </span>
                          </div>
                        </div>
                      )}
                      {schedule.bus.amenities && schedule.bus.amenities.length > 0 && (
                        <div className="flex items-start gap-3 pt-2">
                          <div className="w-5 h-5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                            <div className="flex flex-wrap gap-2">
                              {schedule.bus.amenities.map((amenity, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-muted border border-border rounded-full text-xs text-foreground"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Seat Selection */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">SELECT YOUR SEAT</h2>
                  <div className="text-sm text-muted-foreground">
                    {availableSeats} seats available
                  </div>
                </div>

                {/* Passenger Count Selector */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="passenger_count" className="text-sm font-medium mb-2 block">
                    Number of Passengers *
                  </Label>
                  <Select
                    value={numberOfPassengers.toString()}
                    onValueChange={(value) => handlePassengerCountChange(parseInt(value))}
                  >
                    <SelectTrigger id="passenger_count" className="w-full max-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.min(10, availableSeats) }, (_, i) => i + 1).map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} {count === 1 ? 'Passenger' : 'Passengers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select {numberOfPassengers} seat{numberOfPassengers > 1 ? 's' : ''} for {numberOfPassengers} passenger{numberOfPassengers > 1 ? 's' : ''}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {selectedSeatIds.length === 0
                    ? `Click on ${numberOfPassengers} seat${numberOfPassengers > 1 ? 's' : ''} to select ${numberOfPassengers === 1 ? 'it' : 'them'}`
                    : selectedSeatIds.length < numberOfPassengers
                    ? `Select ${numberOfPassengers - selectedSeatIds.length} more seat${numberOfPassengers - selectedSeatIds.length > 1 ? 's' : ''}`
                    : 'All seats selected. You can click on a seat again to deselect it.'}
                </p>

                {/* Seat Map */}
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex items-center gap-6 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-gray-300 bg-white" />
                      <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-green-500 bg-green-500" />
                      <span className="text-muted-foreground">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-red-500 bg-red-500 opacity-75" />
                      <span className="text-muted-foreground">Unavailable</span>
                    </div>
                  </div>

                  {/* Bus Layout */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <SeatLayout
                      layoutType={seatLayoutType}
                      totalSeats={busTotalSeats}
                      availableSeats={availableSeats}
                      bookedSeats={bookedSeats}
                      selectedSeats={selectedSeatIds}
                      onSeatClick={handleSeatClick}
                      maxSelections={numberOfPassengers}
                    />
                  </div>

                  {selectedSeatIds.length > 0 && (
                    <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm font-medium mb-2">SEAT SELECTION</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Seats selected: {selectedSeatIds.length} / {numberOfPassengers}
                        {selectedSeatIds.length < numberOfPassengers && (
                          <span className="text-amber-600 ml-2">
                            (Select {numberOfPassengers - selectedSeatIds.length} more seat{numberOfPassengers - selectedSeatIds.length > 1 ? 's' : ''})
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeatIds.map((seatId) => (
                          <span
                            key={seatId}
                            className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium"
                          >
                            Seat {seatId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boarding and Drop-off Points */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-2xl font-bold mb-4">Select Terminals</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="boarding">BOARDING POINT</Label>
                    <Select value={boardingPoint} onValueChange={setBoardingPoint}>
                      <SelectTrigger id="boarding" className="w-full">
                        <SelectValue placeholder="Select boarding point" />
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </SelectTrigger>
                      <SelectContent>
                        {boardingOptions.length > 0 ? (
                          boardingOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={schedule.route?.departure_terminal || ''} disabled>
                            {schedule.route?.departure_terminal || 'No terminals available'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dropoff">DROP-OFF POINT</Label>
                    <Select value={dropOffPoint} onValueChange={setDropOffPoint}>
                      <SelectTrigger id="dropoff" className="w-full">
                        <SelectValue placeholder="Select drop-off point" />
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropOffOptions.length > 0 ? (
                          dropOffOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={schedule.route?.arrival_terminal || ''} disabled>
                            {schedule.route?.arrival_terminal || 'No terminals available'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              {selectedSeatIds.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-display text-2xl font-bold mb-4">Passenger Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Please provide details for each passenger. The first passenger's contact information will be used for booking confirmation.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {selectedSeatIds.filter((seatId, index, self) => self.indexOf(seatId) === index).map((seatId, index) => (
                      <PassengerForm
                        key={`${seatId}-${index}`}
                        passengerNumber={index + 1}
                        seatId={seatId}
                        passenger={passengers[seatId] || {
                          name: '',
                          gender: '',
                          category: '',
                          phone: index === 0 ? passengerInfo.phone : undefined,
                          email: index === 0 ? passengerInfo.email : undefined,
                        }}
                        onChange={(passenger) => handlePassengerChange(seatId, passenger)}
                        canRemove={selectedSeatIds.length > 1 && index > 0}
                        errors={errors[seatId] || {}}
                      />
                    ))}

                  <Button
                    type="submit"
                    variant="teal"
                    size="lg"
                    className="w-full"
                    disabled={createBooking.isPending || selectedSeatNumbers.length === 0}
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
              )}
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingSummary
                  schedule={schedule as any}
                  selectedSeats={selectedSeatIds}
                  passengerInfo={passengerInfo}
                  boardingPoint={boardingPoint}
                  dropOffPoint={dropOffPoint}
                />
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
