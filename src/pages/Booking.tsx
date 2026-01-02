import { useState, useMemo } from 'react';
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
  const departureDate = schedule?.departure_date || '';
  const { data: bookedSeats = [] } = useBookedSeats(scheduleId || '', departureDate);
  const createBooking = useCreateBooking();

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]); // Seat IDs like ["A1", "B2"]
  const [boardingPoint, setBoardingPoint] = useState<string>('');
  const [dropOffPoint, setDropOffPoint] = useState<string>('');
  const [passengerInfo, setPassengerInfo] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get bus layout type
  const seatLayoutType: SeatLayoutType = (schedule?.bus?.seat_layout as SeatLayoutType) || 'layout1';

  // Store seat numbers along with IDs
  const [seatIdToNumberMap, setSeatIdToNumberMap] = useState<Map<string, number>>(new Map());

  // Define these before useMemo to avoid initialization order issues
  const totalSeats = schedule?.bus?.total_seats || 0;
  const pricePerSeat = Number(schedule?.price_tzs) || 0;

  // Convert seat IDs to seat numbers for booking
  const selectedSeatNumbers = useMemo(() => {
    return selectedSeatIds
      .map(id => seatIdToNumberMap.get(id) || getSeatNumberFromId(id, seatLayoutType, totalSeats))
      .filter(n => n > 0);
  }, [selectedSeatIds, seatIdToNumberMap, seatLayoutType, totalSeats]);

  const totalPrice = selectedSeatNumbers.length * pricePerSeat;

  // Get terminal options for boarding and drop-off
  const boardingOptions = useMemo(() => {
    const options: string[] = [];
    if (schedule?.route?.departure_terminal) {
      options.push(schedule.route.departure_terminal);
    }
    // Add more terminals if available (could be from a terminals table)
    return options;
  }, [schedule?.route?.departure_terminal]);

  const dropOffOptions = useMemo(() => {
    const options: string[] = [];
    if (schedule?.route?.arrival_terminal) {
      options.push(schedule.route.arrival_terminal);
    }
    // Add more terminals if available
    return options;
  }, [schedule?.route?.arrival_terminal]);

  const handleSeatClick = (seatId: string, seatNumber: number) => {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seatId));
      const newMap = new Map(seatIdToNumberMap);
      newMap.delete(seatId);
      setSeatIdToNumberMap(newMap);
    } else {
      if (selectedSeatIds.length < 5) {
        setSelectedSeatIds([...selectedSeatIds, seatId]);
        const newMap = new Map(seatIdToNumberMap);
        newMap.set(seatId, seatNumber);
        setSeatIdToNumberMap(newMap);
      } else {
        toast({
          title: 'Kikomo cha Vitanda',
          description: 'Unaweza kuchagua hadi vitanda 5 kwa rejista moja.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (selectedSeatNumbers.length === 0) {
      toast({
        title: 'Hakuna Vitanda Vilivyochaguliwa',
        description: 'Tafadhali chagua angalau kiti kimoja.',
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
      seatNumbers: selectedSeatNumbers,
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
        title: 'Hitilafu ya Uthibitishaji',
        description: 'Tafadhali angalia fomu na sahihisha makosa.',
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
        seat_numbers: selectedSeatNumbers,
        total_seats: selectedSeatNumbers.length,
        total_price_tzs: totalPrice,
        status: 'pending',
        boarding_point: boardingPoint || null,
        drop_off_point: dropOffPoint || null,
      } as any); // Type assertion needed until types are regenerated

      toast({
        title: 'Rejista Imetengenezwa!',
        description: 'Unaelekezwa kwenye malipo...',
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
              <h3 className="font-semibold text-destructive mb-1">Ratiba Haipatikani</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ratiba unayoitafuta haipo au haipatikani tena.
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
            Rudi kwenye Utafutaji
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Operator & Bus Information */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-bold mb-4">Taarifa za Kampuni na Basi</h2>
                <div className="space-y-4">
                  {/* Operator Info */}
                  {schedule.route?.operator && (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
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

                  {/* Bus Information */}
                  {schedule.bus && (
                    <div className="space-y-3">
                      {schedule.bus.plate_number && (
                        <div className="flex items-center gap-3">
                          <Bus className="w-5 h-5 text-amber" />
                          <div>
                            <p className="text-sm text-muted-foreground">Namba ya Leseni</p>
                            <p className="font-mono font-semibold text-lg">{schedule.bus.plate_number}</p>
                          </div>
                        </div>
                      )}
                      {schedule.bus.bus_type && (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Aina ya Basi</p>
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
                            <p className="text-sm text-muted-foreground mb-2">Vifaa</p>
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
                  <h2 className="font-display text-2xl font-bold">CHAGUA KITI CHAKO</h2>
                  <div className="text-sm text-muted-foreground">
                    Vitanda {availableSeats} vinapatikana
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Chagua kiti kwa kubonyeza alama ya kiti unachohitaji
                </p>

                {/* Seat Map */}
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex items-center gap-6 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-2 border-gray-300 bg-gray-100" />
                      <span className="text-muted-foreground">Kilichopo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-2 border-red-500 bg-red-500" />
                      <span className="text-muted-foreground">Kilichochaguliwa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-2 border-gray-400 bg-gray-300 opacity-50" />
                      <span className="text-muted-foreground">Kisichopatikana</span>
                    </div>
                  </div>

                  {/* Bus Layout */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <SeatLayout
                      layoutType={seatLayoutType}
                      totalSeats={totalSeats}
                      availableSeats={availableSeats}
                      bookedSeats={bookedSeats}
                      selectedSeats={selectedSeatIds}
                      onSeatClick={handleSeatClick}
                      maxSelections={5}
                    />
                  </div>

                  {selectedSeatIds.length > 0 && (
                    <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
                      <p className="text-sm font-medium mb-2">UCHAGUZ WA KITI</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Kiti kilichochaguliwa: {selectedSeatIds.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeatIds.map((seatId) => (
                          <span
                            key={seatId}
                            className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium"
                          >
                            Kiti {seatId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boarding and Drop-off Points */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-2xl font-bold mb-4">Chagua Vituo</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="boarding">KITUO UTAKAPOPANDA BASI</Label>
                    <Select value={boardingPoint} onValueChange={setBoardingPoint}>
                      <SelectTrigger id="boarding" className="w-full">
                        <SelectValue placeholder="Chagua kituo cha basi" />
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
                            {schedule.route?.departure_terminal || 'Hakuna vituo vinavyopatikana'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dropoff">KITUO CHA KUSHUKIA</Label>
                    <Select value={dropOffPoint} onValueChange={setDropOffPoint}>
                      <SelectTrigger id="dropoff" className="w-full">
                        <SelectValue placeholder="Chagua kituo" />
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
                            {schedule.route?.arrival_terminal || 'Hakuna vituo vinavyopatikana'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-2xl font-bold mb-4">Taarifa za Abiria</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Jina Kamili *</Label>
                    <Input
                      id="name"
                      value={passengerInfo.name}
                      onChange={(e) =>
                        setPassengerInfo({ ...passengerInfo, name: e.target.value })
                      }
                      placeholder="Ingiza Jina Lako Kamili"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Namba ya Simu *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={passengerInfo.phone}
                      onChange={(e) => {
                        setPassengerInfo({ ...passengerInfo, phone: e.target.value });
                        if (errors.passengerPhone) setErrors({ ...errors, passengerPhone: '' });
                      }}
                      className={errors.passengerPhone ? 'border-destructive' : ''}
                      placeholder="Ingiza Namba ya Simu Yako"
                      required
                      disabled={createBooking.isPending}
                    />
                    {errors.passengerPhone && (
                      <p className="text-xs text-destructive mt-1">{errors.passengerPhone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Barua Pepe (Si Lazima)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={passengerInfo.email}
                      onChange={(e) => {
                        setPassengerInfo({ ...passengerInfo, email: e.target.value });
                        if (errors.passengerEmail) setErrors({ ...errors, passengerEmail: '' });
                      }}
                      className={errors.passengerEmail ? 'border-destructive' : ''}
                      placeholder="Ingiza Anwani ya Barua Pepe Yako (Si Lazima)"
                      disabled={createBooking.isPending}
                    />
                    {errors.passengerEmail && (
                      <p className="text-xs text-destructive mt-1">{errors.passengerEmail}</p>
                    )}
                  </div>

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
                        Inachakata...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Endelea kwenye Malipo
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingSummary
                  schedule={schedule}
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
