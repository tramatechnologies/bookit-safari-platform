import { Calendar, Clock, MapPin, Users, CreditCard, User, Phone, Mail, Bus } from 'lucide-react';
import { formatPrice } from '@/lib/constants';

interface BookingSummaryProps {
  schedule: {
    departure_date: string;
    departure_time: string;
    arrival_time?: string | null;
    price_tzs: number;
    route?: {
      departure_region?: { name: string } | null;
      destination_region?: { name: string } | null;
      departure_terminal?: string | null;
      arrival_terminal?: string | null;
      duration_hours?: number | null;
    } | null;
    bus?: {
      bus_number: string;
      plate_number?: string;
      bus_type?: string | null;
      amenities?: string[] | null;
    } | null;
    operator?: {
      company_name: string;
      logo_url?: string | null;
      status?: string;
    } | null;
  };
  selectedSeats: string[]; // Seat IDs like ["A1", "B2"]
  passengerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  boardingPoint?: string;
  dropOffPoint?: string;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  schedule,
  selectedSeats,
  passengerInfo,
  boardingPoint,
  dropOffPoint,
}) => {
  const totalPrice = selectedSeats.length * Number(schedule.price_tzs);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      <h3 className="font-display text-xl font-bold mb-4">Muhtasari wa Rejista</h3>

      {/* Trip Details */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-teal mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Kutoka</p>
            <p className="font-semibold">
              {schedule.route?.departure_region?.name || 'N/A'}
            </p>
            {boardingPoint && (
              <p className="text-sm text-muted-foreground mt-1">
                Kituo: {boardingPoint}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-amber mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Kwenda</p>
            <p className="font-semibold">
              {schedule.route?.destination_region?.name || 'N/A'}
            </p>
            {dropOffPoint && (
              <p className="text-sm text-muted-foreground mt-1">
                Kituo: {dropOffPoint}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Tarehe</p>
            <p className="font-semibold">
              {new Date(schedule.departure_date).toLocaleDateString('sw-TZ', {
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
            <p className="text-sm text-muted-foreground">Muda wa Kuondoka</p>
            <p className="font-semibold">{schedule.departure_time.substring(0, 5)}</p>
          </div>
        </div>

        {schedule.route?.duration_hours && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Muda wa Safari</p>
              <p className="font-semibold">
                {Math.floor(schedule.route.duration_hours)}h {Math.round((schedule.route.duration_hours % 1) * 60)}m
              </p>
            </div>
          </div>
        )}

        {schedule.bus && (
          <div className="flex items-start gap-3 p-3 bg-amber/10 rounded-lg border border-amber/20">
            <Bus className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Basi Lako</p>
              {schedule.bus.plate_number && (
                <p className="font-bold text-lg font-mono">
                  {schedule.bus.plate_number}
                </p>
              )}
              {schedule.bus.bus_type && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-teal/20 text-teal rounded text-xs font-medium">
                    {schedule.bus.bus_type}
                  </span>
                </div>
              )}
              {schedule.bus.amenities && schedule.bus.amenities.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1.5">Vifaa:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {schedule.bus.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-background border border-border rounded text-xs text-muted-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {schedule.operator && (
          <div className="flex items-center gap-3">
            {schedule.operator.logo_url ? (
              <img
                src={schedule.operator.logo_url}
                alt={schedule.operator.company_name || 'Operator logo'}
                className="w-10 h-10 rounded-lg object-cover border border-border"
              />
            ) : (
              <Users className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{schedule.operator.company_name}</p>
                {schedule.operator.status === 'approved' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 text-green-600 rounded text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Seats */}
      <div className="border-t border-border pt-4">
        <h4 className="font-semibold mb-3">Vitanda Vilivyochaguliwa</h4>
        <div className="flex flex-wrap gap-2">
          {selectedSeats.length > 0 ? (
            selectedSeats.map((seatId) => (
              <span
                key={seatId}
                className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium"
              >
                Kiti {seatId}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Hakuna vitanda vilivyochaguliwa</p>
          )}
        </div>
      </div>

      {/* Passenger Information */}
      <div className="border-t border-border pt-4">
        <h4 className="font-semibold mb-3">Taarifa za Abiria</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Jina:</span>
            <span className="font-medium">{passengerInfo.name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Simu:</span>
            <span className="font-medium">{passengerInfo.phone || 'N/A'}</span>
          </div>
          {passengerInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Barua pepe:</span>
              <span className="font-medium">{passengerInfo.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Price Summary */}
      <div className="border-t border-border pt-4">
        <h4 className="font-semibold mb-3">Muhtasari wa Bei</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Vitanda ({selectedSeats.length})
            </span>
            <span className="font-medium">
              {formatPrice(selectedSeats.length * Number(schedule.price_tzs))}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold">Jumla</span>
            <span className="font-bold text-2xl text-teal">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="border-t border-border pt-4">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Malipo kwa njia ya simu au kadi</p>
          <p>• Uthibitisho wa rejista utatuma kwa SMS/Barua pepe</p>
          <p>• Kufuta rejista kuruhusiwa hadi saa 24 kabla ya kuondoka</p>
        </div>
      </div>
    </div>
  );
};

