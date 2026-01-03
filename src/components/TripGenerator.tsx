import { useState } from 'react';
import { useGenerateTripsFromSchedules, useGenerateRecurringTrips } from '@/hooks/use-trips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface TripGeneratorProps {
  scheduleId?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const TripGenerator = ({
  scheduleId,
  onSuccess,
  onError,
}: TripGeneratorProps) => {
  const [daysAhead, setDaysAhead] = useState('30');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const generateTripsForSchedule = useGenerateTripsFromSchedules();
  const generateRecurringTrips = useGenerateRecurringTrips();

  const handleGenerateForSchedule = async () => {
    if (!scheduleId) {
      onError?.('No schedule selected');
      return;
    }

    try {
      const result = await generateTripsForSchedule.mutateAsync({
        daysAhead: parseInt(daysAhead),
        scheduleId,
      });

      const message = `Generated ${result.length} trips for this schedule`;
      onSuccess?.(message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate trips';
      onError?.(message);
    }
  };

  const handleGenerateRecurring = async () => {
    try {
      const result = await generateRecurringTrips.mutateAsync({
        daysAhead: parseInt(daysAhead),
      });

      const message = `Generated ${result.generated_trips} total trips (${result.trip_date_range})`;
      onSuccess?.(message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate trips';
      onError?.(message);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Trip Generation</h3>
        <p className="text-sm text-muted-foreground">
          Automatically create trips from schedules for upcoming dates
        </p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 p-3 bg-teal/10 border border-teal/30 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
          <p className="text-sm text-teal">Trips generated successfully!</p>
        </div>
      )}

      {/* Days Ahead Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Generate trips for the next N days
        </label>
        <Input
          type="number"
          min="1"
          max="365"
          value={daysAhead}
          onChange={(e) => setDaysAhead(e.target.value)}
          className="w-full"
          placeholder="30"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Trips will be created for dates from today up to {parseInt(daysAhead)} days ahead
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {scheduleId && (
          <Button
            onClick={handleGenerateForSchedule}
            disabled={
              generateTripsForSchedule.isPending ||
              !daysAhead ||
              parseInt(daysAhead) < 1
            }
            className="w-full"
            variant="teal"
          >
            {generateTripsForSchedule.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Generate for This Schedule
          </Button>
        )}

        <Button
          onClick={handleGenerateRecurring}
          disabled={
            generateRecurringTrips.isPending || !daysAhead || parseInt(daysAhead) < 1
          }
          className="w-full"
          variant="outline"
        >
          {generateRecurringTrips.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Generate for All Schedules
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-amber/5 border border-amber/20 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1 ml-0">
            <li>• Trips are created from active schedules</li>
            <li>• Duplicate trips (same date) are automatically skipped</li>
            <li>• Available seats equal the bus total capacity</li>
            <li>• Trip status defaults to "scheduled"</li>
          </ul>
        </div>
      </div>

      {/* Error Message */}
      {(generateTripsForSchedule.error || generateRecurringTrips.error) && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            {generateTripsForSchedule.error?.message ||
              generateRecurringTrips.error?.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default TripGenerator;
