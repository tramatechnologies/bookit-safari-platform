import { CreditCard, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { PassengerForm, type PassengerInfo } from '@/components/PassengerForm';

interface PassengerFormSectionProps {
  selectedSeatIds: string[];
  passengers: Record<string, PassengerInfo>;
  passengerInfo: { name: string; phone: string; email: string };
  errors: Record<string, Record<string, string>>;
  isSubmitting: boolean;
  onPassengerChange: (seatId: string, passenger: PassengerInfo) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PassengerFormSection = memo(({
  selectedSeatIds,
  passengers,
  passengerInfo,
  errors,
  isSubmitting,
  onPassengerChange,
  onSubmit,
}: PassengerFormSectionProps) => {
  if (selectedSeatIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="font-display text-2xl font-bold mb-4">Passenger Information</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Please provide details for each passenger. The first passenger's contact information will be used for booking confirmation.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        {Array.from(new Set(selectedSeatIds)).map((seatId, index) => (
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
            onChange={(passenger) => onPassengerChange(seatId, passenger)}
            canRemove={Array.from(new Set(selectedSeatIds)).length > 1 && index > 0}
            errors={errors[seatId] || {}}
          />
        ))}

        <Button
          type="submit"
          variant="teal"
          size="lg"
          className="w-full"
          disabled={isSubmitting || selectedSeatIds.length === 0}
        >
          {isSubmitting ? (
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
  );
});
