import React from 'react';
import { Bus } from 'lucide-react';

export type SeatLayoutType = 'layout1' | 'layout2';

export interface Seat {
  id: string; // e.g., "A1", "A2", "N5"
  row: string; // e.g., "A", "B", "N"
  column: number; // e.g., 1, 2, 3, 4, 5
  seatNumber: number; // Sequential seat number for booking
  exists: boolean; // Whether this seat exists in the bus
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
  const seats = layoutType === 'layout1' ? generateLayout1() : generateLayout2();
  const seat = seats.find(s => s.id === seatId);
  return seat?.seatNumber || 0;
};

/**
 * Layout 1: Standard bus with door on left side
 * - Left side (columns 3, 4): Rows A-E, then gap for door (F, G missing), then H-M
 * - Right side (columns 1, 2): Continuous from A to M
 * - Back row N: 5 seats (N5, N4, N3, N2, N1)
 * 
 * Total: 53 seats max
 */
const generateLayout1 = (): Seat[] => {
  const seats: Seat[] = [];
  let seatNumber = 1;

  // Rows with left side seats (A-E, H-M)
  const rowsWithLeftSeats = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'J', 'K', 'L', 'M'];
  // All regular rows in order
  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  // Generate seats row by row, left to right
  for (const row of allRows) {
    const hasLeftSeats = rowsWithLeftSeats.includes(row);

    // Left side: column 4 (window), column 3 (aisle)
    if (hasLeftSeats) {
      seats.push({ id: `${row}4`, row, column: 4, seatNumber: seatNumber++, exists: true, available: true, selected: false });
      seats.push({ id: `${row}3`, row, column: 3, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    }

    // Right side: column 2 (aisle), column 1 (window)
    seats.push({ id: `${row}2`, row, column: 2, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    seats.push({ id: `${row}1`, row, column: 1, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  // Back row N: 5 seats (N5, N4, N3, N2, N1) - left to right
  const backRow = 'N';
  for (let col = 5; col >= 1; col--) {
    seats.push({ id: `${backRow}${col}`, row: backRow, column: col, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  return seats;
};

/**
 * Layout 2: Standard 2-2 bus without door gap
 * - Left side (columns 3, 4): All rows A-M
 * - Right side (columns 1, 2): All rows A-M
 * - Back row N: 5 seats (N5, N4, N3, N2, N1)
 * 
 * Total: 57 seats max
 */
const generateLayout2 = (): Seat[] => {
  const seats: Seat[] = [];
  let seatNumber = 1;

  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  // Generate seats row by row, left to right
  for (const row of allRows) {
    // Left side: column 4 (window), column 3 (aisle)
    seats.push({ id: `${row}4`, row, column: 4, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    seats.push({ id: `${row}3`, row, column: 3, seatNumber: seatNumber++, exists: true, available: true, selected: false });

    // Right side: column 2 (aisle), column 1 (window)
    seats.push({ id: `${row}2`, row, column: 2, seatNumber: seatNumber++, exists: true, available: true, selected: false });
    seats.push({ id: `${row}1`, row, column: 1, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  // Back row N: 5 seats (N5, N4, N3, N2, N1) - left to right
  const backRow = 'N';
  for (let col = 5; col >= 1; col--) {
    seats.push({ id: `${backRow}${col}`, row: backRow, column: col, seatNumber: seatNumber++, exists: true, available: true, selected: false });
  }

  return seats;
};

// Get the row structure for rendering
interface RowStructure {
  row: string;
  leftSeats: Seat[];
  rightSeats: Seat[];
  isBackRow: boolean;
  hasLeftSide: boolean;
}

const getRowStructure = (seats: Seat[], layoutType: SeatLayoutType): RowStructure[] => {
  const rowMap = new Map<string, Seat[]>();
  
  seats.forEach(seat => {
    if (!rowMap.has(seat.row)) {
      rowMap.set(seat.row, []);
    }
    rowMap.get(seat.row)!.push(seat);
  });

  // Rows without left side for layout1 (door area)
  const rowsWithoutLeftSeats = layoutType === 'layout1' ? ['F', 'G'] : [];

  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const structures: RowStructure[] = [];

  for (const row of allRows) {
    const rowSeats = rowMap.get(row) || [];
    if (rowSeats.length === 0) continue;

    const isBackRow = row === 'N';
    const hasLeftSide = !rowsWithoutLeftSeats.includes(row);
    
    if (isBackRow) {
      // Back row: all seats in one group, sorted by column descending (5,4,3,2,1)
      structures.push({
        row,
        leftSeats: rowSeats.sort((a, b) => b.column - a.column),
        rightSeats: [],
        isBackRow: true,
        hasLeftSide: true,
      });
    } else {
      // Regular row: left side (columns 3, 4), right side (columns 1, 2)
      const leftSeats = rowSeats.filter(s => s.column >= 3).sort((a, b) => b.column - a.column);
      const rightSeats = rowSeats.filter(s => s.column <= 2).sort((a, b) => b.column - a.column);
      
      structures.push({
        row,
        leftSeats,
        rightSeats,
        isBackRow: false,
        hasLeftSide,
      });
    }
  }

  return structures;
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
  // Generate full layout structure
  const allSeats = layoutType === 'layout1' ? generateLayout1() : generateLayout2();

  // Update seat availability and selection status
  // Seats beyond totalSeats don't exist, booked seats are unavailable
  const seats = allSeats.map((seat) => ({
    ...seat,
    exists: seat.seatNumber <= totalSeats,
    available: seat.seatNumber <= totalSeats && !bookedSeats.includes(seat.seatNumber),
    selected: selectedSeats.includes(seat.id),
  }));

  // Get row structure for rendering (only include existing seats)
  const existingSeats = seats.filter(s => s.exists);
  const rowStructures = getRowStructure(existingSeats, layoutType);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.available) return;
    if (seat.selected) {
      onSeatClick(seat.id, seat.seatNumber);
    } else {
      if (selectedSeats.length < maxSelections) {
        onSeatClick(seat.id, seat.seatNumber);
      }
    }
  };

  const renderSeat = (seat: Seat) => (
    <button
      key={seat.id}
      type="button"
      onClick={() => handleSeatClick(seat)}
      disabled={!seat.available}
      className={`
        w-11 h-11 rounded-lg border-2 flex items-center justify-center text-xs font-bold
        transition-all duration-200
        ${
          seat.selected
            ? 'border-red-500 bg-red-500 text-white shadow-lg scale-105'
            : seat.available
            ? 'border-gray-200 bg-white hover:border-teal hover:bg-teal/5 text-gray-600'
            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
        }
      `}
      title={seat.available ? `Seat ${seat.id}` : `Seat ${seat.id} - Booked`}
    >
      {seat.id}
    </button>
  );

  const renderEmptySlot = (key: string) => (
    <div key={key} className="w-11 h-11" />
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Driver Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <Bus className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Seat Map */}
      <div className="space-y-2">
        {rowStructures.map((structure) => (
          <div key={structure.row} className="flex items-center justify-center">
            {/* Row Label Left */}
            <div className="w-6 text-xs font-medium text-gray-400 text-center flex-shrink-0">
              {structure.row}
            </div>

            {structure.isBackRow ? (
              // Back row: 5 seats centered
              <div className="flex gap-1.5 justify-center flex-1 px-2">
                {structure.leftSeats.map(renderSeat)}
              </div>
            ) : (
              // Regular row: left side, aisle, right side
              <div className="flex items-center flex-1 justify-center">
                {/* Left side (columns 4, 3) */}
                <div className="flex gap-1.5">
                  {structure.hasLeftSide && structure.leftSeats.length > 0 ? (
                    structure.leftSeats.map(renderSeat)
                  ) : (
                    // Empty slots for door area
                    <>
                      {renderEmptySlot(`${structure.row}-empty-4`)}
                      {renderEmptySlot(`${structure.row}-empty-3`)}
                    </>
                  )}
                </div>

                {/* Aisle */}
                <div className="w-8 flex-shrink-0" />

                {/* Right side (columns 2, 1) */}
                <div className="flex gap-1.5">
                  {structure.rightSeats.map(renderSeat)}
                </div>
              </div>
            )}

            {/* Row Label Right */}
            <div className="w-6 text-xs font-medium text-gray-400 text-center flex-shrink-0">
              {structure.row}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border border-gray-200 bg-white" />
          <span className="text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border-2 border-red-500 bg-red-500" />
          <span className="text-gray-500">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border border-gray-200 bg-gray-100" />
          <span className="text-gray-500">Booked</span>
        </div>
      </div>

      {/* Selection Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Selected: <span className="font-bold text-red-500">{selectedSeats.length}</span> / {maxSelections} seats
        {selectedSeats.length > 0 && (
          <span className="text-xs text-gray-400 ml-2">
            ({selectedSeats.join(', ')})
          </span>
        )}
      </div>
    </div>
  );
};
