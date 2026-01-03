import { useState, useCallback, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SeatLayout, type SeatLayoutType, getSeatNumberFromId } from '@/components/SeatLayout';
import { useToast } from '@/hooks/use-toast';
import type { Schedule } from '@/types';

interface SeatSelectionSectionProps {
  schedule: Schedule;
  numberOfPassengers: number;
  selectedSeatIds: string[];
  availableSeats: number;
  bookedSeats: number[];
  onSeatClick: (seatId: string, seatNumber: number) => void;
  onPassengerCountChange: (count: number) => void;
}

export const SeatSelectionSection = memo(({
  schedule,
  numberOfPassengers,
  selectedSeatIds,
  availableSeats,
  bookedSeats,
  onSeatClick,
  onPassengerCountChange,
}: SeatSelectionSectionProps) => {
  const { toast } = useToast();
  const seatLayout = schedule.bus?.seat_layout || 'layout1';
  const busTotalSeats = schedule.bus?.total_seats || 0;
  const seatLayoutType: SeatLayoutType = (seatLayout as SeatLayoutType);

  return (
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
          onValueChange={(value) => onPassengerCountChange(parseInt(value))}
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
            onSeatClick={onSeatClick}
            maxSelections={numberOfPassengers}
            seatLayoutConfig={(schedule?.bus as any)?.seat_layout_config}
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
  );
});
