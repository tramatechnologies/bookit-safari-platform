import React, { useState } from 'react';
import { Bus } from 'lucide-react';

export type SeatLayoutType = 'layout1' | 'layout2';

export interface Seat {
  id: string; // e.g., "A1", "A2", "M5"
  row: string; // e.g., "A", "B", "M"
  number: number; // e.g., 1, 2, 3, 4, 5
  available: boolean;
  selected: boolean;
}

interface SeatLayoutProps {
  layoutType: SeatLayoutType;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number[]; // Array of seat numbers that are booked
  selectedSeats: string[]; // Array of seat IDs like ["A1", "B2"]
  onSeatClick: (seatId: string, seatNumber: number) => void;
  maxSelections?: number;
}

// Export function to get seat number from seat ID
export const getSeatNumberFromId = (seatId: string, layoutType: SeatLayoutType, totalSeats: number): number => {
  const seatIdToNumber = new Map<string, number>();
  let seatNumber = 1;

  if (layoutType === 'layout1') {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
    for (let i = 0; i < rows.length - 1 && seatNumber <= totalSeats; i++) {
      const row = rows[i];
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}2`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}1`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}3`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}4`, seatNumber++);
    }
    const row = 'M';
    for (let i = 5; i >= 1 && seatNumber <= totalSeats; i--) {
      seatIdToNumber.set(`${row}${i}`, seatNumber++);
    }
  } else {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    for (let i = 0; i < rows.length - 1 && seatNumber <= totalSeats; i++) {
      const row = rows[i];
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}4`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}3`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}6`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}5`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}2`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}1`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}8`, seatNumber++);
      if (seatNumber <= totalSeats) seatIdToNumber.set(`${row}7`, seatNumber++);
    }
    const row = 'N';
    for (let i = 5; i >= 1 && seatNumber <= totalSeats; i--) {
      seatIdToNumber.set(`${row}${i}`, seatNumber++);
    }
  }

  return seatIdToNumber.get(seatId) || 0;
};

// Layout 1: Rows A-M with 2-2 configuration, Row M with 5 seats at back
const generateLayout1 = (totalSeats: number): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  let seatNumber = 1;

  // Rows A-L: 2-2 configuration (4 seats per row)
  for (let i = 0; i < rows.length - 1 && seatNumber <= totalSeats; i++) {
    const row = rows[i];
    // Right side: A2, A1
    if (seatNumber <= totalSeats) seats.push({ id: `${row}2`, row, number: seatNumber++, available: true, selected: false });
    if (seatNumber <= totalSeats) seats.push({ id: `${row}1`, row, number: seatNumber++, available: true, selected: false });
    // Aisle
    // Left side: A3, A4
    if (seatNumber <= totalSeats) seats.push({ id: `${row}3`, row, number: seatNumber++, available: true, selected: false });
    if (seatNumber <= totalSeats) seats.push({ id: `${row}4`, row, number: seatNumber++, available: true, selected: false });
  }

  // Row M: 5 seats at back (M5, M4, M3, M2, M1)
  if (seatNumber <= totalSeats) {
    const row = 'M';
    for (let i = 5; i >= 1 && seatNumber <= totalSeats; i--) {
      seats.push({ id: `${row}${i}`, row, number: seatNumber++, available: true, selected: false });
    }
  }

  return seats;
};

// Layout 2: Rows A-N with 2-2-2-2 configuration (8 seats per row), Row N with 5 seats at back
const generateLayout2 = (totalSeats: number): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  let seatNumber = 1;

  // Rows A-M: 2-2-2-2 configuration (8 seats per row)
  // Left outer: A4, A3 | Left inner: A6, A5 | Right inner: A2, A1 | Right outer: A8, A7
  for (let i = 0; i < rows.length - 1 && seatNumber <= totalSeats; i++) {
    const row = rows[i];
    // Left outer: A4, A3
    if (seatNumber <= totalSeats) seats.push({ id: `${row}4`, row, number: seatNumber++, available: true, selected: false });
    if (seatNumber <= totalSeats) seats.push({ id: `${row}3`, row, number: seatNumber++, available: true, selected: false });
    // Left inner: A6, A5
    if (seatNumber <= totalSeats) seats.push({ id: `${row}6`, row, number: seatNumber++, available: true, selected: false });
    if (seatNumber <= totalSeats) seats.push({ id: `${row}5`, row, number: seatNumber++, available: true, selected: false });
    // Right inner: A2, A1
    if (seatNumber <= totalSeats) seats.push({ id: `${row}2`, row, number: seatNumber++, available: true, selected: false });
    if (seatNumber <= totalSeats) seats.push({ id: `${row}1`, row, number: seatNumber++, available: true, selected: false });
    // Right outer: A8, A7
    if (seatNumber <= totalSeats) seats.push({ id: `${row}8`, row, number: seatNumber++, available: true, selected: false });
    if (seatNumber <= totalSeats) seats.push({ id: `${row}7`, row, number: seatNumber++, available: true, selected: false });
  }

  // Row N: 5 seats at back (N5, N4, N3, N2, N1)
  if (seatNumber <= totalSeats) {
    const row = 'N';
    for (let i = 5; i >= 1 && seatNumber <= totalSeats; i--) {
      seats.push({ id: `${row}${i}`, row, number: seatNumber++, available: true, selected: false });
    }
  }

  return seats;
};

export const SeatLayout: React.FC<SeatLayoutProps> = ({
  layoutType,
  totalSeats,
  availableSeats,
  bookedSeats,
  selectedSeats,
  onSeatClick,
  maxSelections = 5,
}) => {
  // Generate seats based on layout type
  const allSeats = layoutType === 'layout1' ? generateLayout1(totalSeats) : generateLayout2(totalSeats);

  // Update seat availability and selection status
  // A seat is available if it's not booked and the total available seats count allows it
  const seats = allSeats.map((seat) => ({
    ...seat,
    available: !bookedSeats.includes(seat.number) && seat.number <= totalSeats,
    selected: selectedSeats.includes(seat.id),
  }));

  // Group seats by row for rendering
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const rows = Object.keys(seatsByRow).sort();

  const handleSeatClick = (seat: Seat) => {
    if (!seat.available) return;
    if (seat.selected) {
      onSeatClick(seat.id, seat.number);
    } else {
      if (selectedSeats.length < maxSelections) {
        onSeatClick(seat.id, seat.number);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Driver/Steering Wheel Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Bus className="w-6 h-6 text-primary rotate-180" />
        </div>
      </div>

      {/* Seat Map */}
      <div className="space-y-3">
        {rows.map((row) => {
          const rowSeats = seatsByRow[row];
          const isLastRow = row === rows[rows.length - 1];
          const isBackRow = (layoutType === 'layout1' && row === 'M') || (layoutType === 'layout2' && row === 'N');

          return (
            <div key={row} className="flex items-center gap-2">
              {/* Row Label */}
              <div className="w-8 text-sm font-medium text-muted-foreground text-center">{row}</div>

              {/* Seats */}
              <div className={`flex gap-2 ${isBackRow ? 'justify-center' : 'justify-between'} flex-1`}>
                {isBackRow ? (
                  // Back row: 5 seats in a row
                  <div className="flex gap-2">
                    {rowSeats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => handleSeatClick(seat)}
                        disabled={!seat.available}
                        className={`
                          w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-medium
                          transition-all
                          ${
                            seat.selected
                              ? 'border-red-500 bg-red-500 text-white'
                              : seat.available
                              ? 'border-gray-300 bg-gray-100 hover:border-primary hover:bg-primary/10 text-gray-700'
                              : 'border-gray-400 bg-gray-300 opacity-50 cursor-not-allowed text-gray-500'
                          }
                        `}
                        title={seat.available ? `Seat ${seat.id}` : 'Unavailable'}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                ) : (
                  // Regular rows: 2-2 or 2-2-2-2 configuration
                  <>
                    {/* Left side */}
                    <div className="flex gap-2">
                      {layoutType === 'layout1' ? (
                        // Layout 1: Left side has A3, A4
                        rowSeats.filter((s) => ['3', '4'].includes(s.id.slice(1))).map((seat) => (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={!seat.available}
                            className={`
                              w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-medium
                              transition-all
                              ${
                                seat.selected
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : seat.available
                                  ? 'border-gray-300 bg-gray-100 hover:border-primary hover:bg-primary/10 text-gray-700'
                                  : 'border-gray-400 bg-gray-300 opacity-50 cursor-not-allowed text-gray-500'
                              }
                            `}
                            title={seat.available ? `Seat ${seat.id}` : 'Unavailable'}
                          >
                            {seat.number}
                          </button>
                        ))
                      ) : (
                        // Layout 2: Left side has A4, A3, A6, A5
                        rowSeats.filter((s) => ['4', '3', '6', '5'].includes(s.id.slice(1))).map((seat) => (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={!seat.available}
                            className={`
                              w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-medium
                              transition-all
                              ${
                                seat.selected
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : seat.available
                                  ? 'border-gray-300 bg-gray-100 hover:border-primary hover:bg-primary/10 text-gray-700'
                                  : 'border-gray-400 bg-gray-300 opacity-50 cursor-not-allowed text-gray-500'
                              }
                            `}
                            title={seat.available ? `Seat ${seat.id}` : 'Unavailable'}
                          >
                            {seat.number}
                          </button>
                        ))
                      )}
                    </div>

                    {/* Aisle */}
                    <div className="w-8" />

                    {/* Right side */}
                    <div className="flex gap-2">
                      {layoutType === 'layout1' ? (
                        // Layout 1: Right side has A2, A1
                        rowSeats.filter((s) => ['1', '2'].includes(s.id.slice(1))).map((seat) => (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={!seat.available}
                            className={`
                              w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-medium
                              transition-all
                              ${
                                seat.selected
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : seat.available
                                  ? 'border-gray-300 bg-gray-100 hover:border-primary hover:bg-primary/10 text-gray-700'
                                  : 'border-gray-400 bg-gray-300 opacity-50 cursor-not-allowed text-gray-500'
                              }
                            `}
                            title={seat.available ? `Seat ${seat.id}` : 'Unavailable'}
                          >
                            {seat.number}
                          </button>
                        ))
                      ) : (
                        // Layout 2: Right side has A2, A1, A8, A7
                        rowSeats.filter((s) => ['2', '1', '8', '7'].includes(s.id.slice(1))).map((seat) => (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={!seat.available}
                            className={`
                              w-10 h-10 rounded border-2 flex items-center justify-center text-xs font-medium
                              transition-all
                              ${
                                seat.selected
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : seat.available
                                  ? 'border-gray-300 bg-gray-100 hover:border-primary hover:bg-primary/10 text-gray-700'
                                  : 'border-gray-400 bg-gray-300 opacity-50 cursor-not-allowed text-gray-500'
                              }
                            `}
                            title={seat.available ? `Seat ${seat.id}` : 'Unavailable'}
                          >
                            {seat.number}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

