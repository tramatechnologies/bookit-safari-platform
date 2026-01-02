import React from 'react';
import { Bus } from 'lucide-react';

export type SeatLayoutType = 'layout1' | 'layout2';

export interface Seat {
  id: string;
  row: string;
  column: number;
  seatNumber: number;
  exists: boolean;
  available: boolean;
  selected: boolean;
}

interface SeatLayoutProps {
  layoutType: SeatLayoutType;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number[];
  selectedSeats: string[];
  onSeatClick: (seatId: string, seatNumber: number) => void;
  maxSelections?: number;
}

export const getSeatNumberFromId = (seatId: string, layoutType: SeatLayoutType, totalSeats: number): number => {
  const seats = layoutType === 'layout1' ? generateLayout1() : generateLayout2();
  const seat = seats.find(s => s.id === seatId);
  return seat?.seatNumber || 0;
};

const generateLayout1 = (): Seat[] => {
  const seats: Seat[] = [];
  let seatNumber = 1;
  const rowsWithLeftSeats = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'J', 'K', 'L', 'M'];
  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  for (const row of allRows) {
    const hasLeftSeats = rowsWithLeftSeats.includes(row);
    if (hasLeftSeats) {
      seats.push({ id: `${row}4`, row, column: 4, seatNumber: seatNumber++, exists: true, available: true, selected: false });
      seats.push({ id: `${row}3`, row, column: 3, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    }
    seats.push({ id: `${row}2`, row, column: 2, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    seats.push({ id: `${row}1`, row, column: 1, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  for (let col = 5; col >= 1; col--) {
    seats.push({ id: `N${col}`, row: 'N', column: col, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  return seats;
};

const generateLayout2 = (): Seat[] => {
  const seats: Seat[] = [];
  let seatNumber = 1;
  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  for (const row of allRows) {
    seats.push({ id: `${row}4`, row, column: 4, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    seats.push({ id: `${row}3`, row, column: 3, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    seats.push({ id: `${row}2`, row, column: 2, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    seats.push({ id: `${row}1`, row, column: 1, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  for (let col = 5; col >= 1; col--) {
    seats.push({ id: `N${col}`, row: 'N', column: col, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  return seats;
};

export const SeatLayout: React.FC<SeatLayoutProps> = ({
  layoutType,
  totalSeats,
  bookedSeats,
  selectedSeats,
  onSeatClick,
  maxSelections = 5,
}) => {
  const allSeats = layoutType === 'layout1' ? generateLayout1() : generateLayout2();
  const rowsWithoutLeftSeats = layoutType === 'layout1' ? ['F', 'G'] : [];

  const seats = allSeats.map((seat) => ({
    ...seat,
    exists: seat.seatNumber <= totalSeats,
    available: seat.seatNumber <= totalSeats && !bookedSeats.includes(seat.seatNumber),
    selected: selectedSeats.includes(seat.id),
  }));

  const seatsByRow = seats.reduce((acc, seat) => {
    if (!seat.exists) return acc;
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const visibleRows = allRows.filter(row => seatsByRow[row]?.length > 0);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.available) return;
    if (seat.selected || selectedSeats.length < maxSelections) {
      onSeatClick(seat.id, seat.seatNumber);
    }
  };

  const SeatButton: React.FC<{ seat: Seat }> = ({ seat }) => (
    <button
      type="button"
      onClick={() => handleSeatClick(seat)}
      disabled={!seat.available}
      className={`
        w-8 h-8 rounded border text-[10px] font-semibold
        transition-all duration-150 flex items-center justify-center
        ${seat.selected
          ? 'bg-red-500 border-red-500 text-white shadow-md'
          : seat.available
          ? 'bg-white border-gray-300 text-gray-700 hover:border-teal-500 hover:bg-teal-50'
          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
        }
      `}
      title={seat.available ? `Seat ${seat.id}` : `Seat ${seat.id} - Booked`}
    >
      {seat.id}
    </button>
  );

  const EmptySlot = () => <div className="w-8 h-8" />;

  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Driver */}
      <div className="flex justify-center mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
          <Bus className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Seats */}
      <div className="space-y-0.5">
        {visibleRows.map((rowLetter) => {
          const rowSeats = seatsByRow[rowLetter] || [];
          const isBackRow = rowLetter === 'N';
          const hasLeftSide = !rowsWithoutLeftSeats.includes(rowLetter);

          if (isBackRow) {
            // Back row: 5 seats centered, ensure they fit
            const sortedSeats = [...rowSeats].sort((a, b) => b.column - a.column);
            return (
              <div key={rowLetter} className="flex items-center justify-center">
                <div className="w-4 text-[10px] text-gray-400 text-center">{rowLetter}</div>
                <div className="flex gap-0.5 justify-center max-w-[220px]">
                  {sortedSeats.map(seat => <SeatButton key={seat.id} seat={seat} />)}
                </div>
                <div className="w-4 text-[10px] text-gray-400 text-center">{rowLetter}</div>
              </div>
            );
          }

          // Regular row
          const leftSeats = rowSeats.filter(s => s.column >= 3).sort((a, b) => b.column - a.column);
          const rightSeats = rowSeats.filter(s => s.column <= 2).sort((a, b) => b.column - a.column);

          return (
            <div key={rowLetter} className="flex items-center justify-center">
              <div className="w-4 text-[10px] text-gray-400 text-center">{rowLetter}</div>
              <div className="flex items-center justify-center">
                {/* Left side - fixed width */}
                <div className="flex gap-0.5 w-[68px] justify-end">
                  {hasLeftSide && leftSeats.length > 0 ? (
                    leftSeats.map(seat => <SeatButton key={seat.id} seat={seat} />)
                  ) : (
                    <>
                      <EmptySlot />
                      <EmptySlot />
                    </>
                  )}
                </div>
                
                {/* Aisle */}
                <div className="w-4" />
                
                {/* Right side - fixed width */}
                <div className="flex gap-0.5 w-[68px]">
                  {rightSeats.map(seat => <SeatButton key={seat.id} seat={seat} />)}
                </div>
              </div>
              <div className="w-4 text-[10px] text-gray-400 text-center">{rowLetter}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-3 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-gray-300 bg-white" />
          <span className="text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-gray-500">Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
          <span className="text-gray-500">Booked</span>
        </div>
      </div>

      {/* Selection count */}
      <div className="mt-2 text-center text-xs text-gray-600">
        Selected: <span className="font-bold text-red-500">{selectedSeats.length}</span> / {maxSelections}
      </div>
    </div>
  );
};
