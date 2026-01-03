import { useState, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Schedule } from '@/types';

interface TerminalSelectionSectionProps {
  schedule: Schedule;
  boardingPoint: string;
  dropOffPoint: string;
  onBoardingPointChange: (point: string) => void;
  onDropOffPointChange: (point: string) => void;
}

export const TerminalSelectionSection = memo(({
  schedule,
  boardingPoint,
  dropOffPoint,
  onBoardingPointChange,
  onDropOffPointChange,
}: TerminalSelectionSectionProps) => {
  const departureTerminal = schedule?.route?.departure_terminal || null;
  const arrivalTerminal = schedule?.route?.arrival_terminal || null;

  const boardingOptions: string[] = departureTerminal ? [departureTerminal] : [];
  const dropOffOptions: string[] = arrivalTerminal ? [arrivalTerminal] : [];

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="font-display text-2xl font-bold mb-4">Select Terminals</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="boarding">BOARDING POINT</Label>
          <Select value={boardingPoint} onValueChange={onBoardingPointChange}>
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
          <Select value={dropOffPoint} onValueChange={onDropOffPointChange}>
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
  );
});
