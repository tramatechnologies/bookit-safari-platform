import React from 'react';
import { Bus } from 'lucide-react';

export type SeatLayoutType = 'layout1' | 'layout2';

export interface Seat {
  id: string; // e.g., "A1", "A2", "M5"
  row: string; // e.g., "A", "B", "M"
  column: number; // e.g., 1, 2, 3, 4, 5
  seatNumber: number; // Sequential seat number for booking
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
  const seats = layoutType === 'layout1' ? generateLayout1(totalSeats) : generateLayout2(totalSeats);
  const seat = seats.find(s => s.id === seatId);
  return seat?.seatNumber || 0;
};

/**
 * Layout 1: Standard bus with door on left side
 * - Left side (columns 3, 4): Rows A-E, then gap for door (F, G missing), then H-M
 * - Right side (columns 1, 2): Continuous from A to N
 * - Back row N: 5 seats (N5, N4, N3, N2, N1)
 * 
 * Visual:
 *          [Driver]
 * Row A:  [A4][A3]  |aisle|  [A2][A1]
 * Row B:  [B4][B3]  |aisle|  [B2][B1]
 * ...
 * Row E:  [E4][E3]  |aisle|  [E2][E1]
 * Row F:  [  ][  ]  |aisle|  [F2][F1]  <- Door on left
 * Row G:  [  ][  ]  |aisle|  [G2][G1]  <- Door on left
 * Row H:  [H4][H3]  |aisle|  [H2][H1]
 * ...
 * Row N:  [N5][N4][N3][N2][N1]  <- Back row with 5 seats
 */
const generateLayout1 = (totalSeats: number): Seat[] => {
  const seats: Seat[] = [];
  let seatNumber = 1;

  // Rows with left side seats (A-E, H-M)
  const rowsWithLeftSeats = ['A', 'B', 'C', 'D', 'E', 'H', 'I', 'J', 'K', 'L', 'M'];
  // Rows without left side seats (door area: F, G)
  const rowsWithoutLeftSeats = ['F', 'G'];
  // All regular rows in order
  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  // Generate seats row by row, left to right
  for (const row of allRows) {
    if (seatNumber > totalSeats) break;

    const hasLeftSeats = rowsWithLeftSeats.includes(row);

    // Left side: column 4 (window), column 3 (aisle)
    if (hasLeftSeats) {
      if (seatNumber <= totalSeats) {
        seats.push({ id: `${row}4`, row, column: 4, seatNumber: seatNumber++, available: true, selected: false });
      }
      if (seatNumber <= totalSeats) {
        seats.push({ id: `${row}3`, row, column: 3, seatNumber: seatNumber++, available: true, selected: false });
      }
    }

    // Right side: column 2 (aisle), column 1 (window)
    if (seatNumber <= totalSeats) {
      seats.push({ id: `${row}2`, row, column: 2, seatNumber: seatNumber++, available: true, selected: false });
    }
    if (seatNumber <= totalSeats) {
      seats.push({ id: `${row}1`, row, column: 1, seatNumber: seatNumber++, available: true, selected: false });
    }
  }

  // Back row N: 5 seats (N5, N4, N3, N2, N1) - left to right
  const backRow = 'N';
  for (let col = 5; col >= 1 && seatNumber <= totalSeats; col--) {
    seats.push({ id: `${backRow}${col}`, row: backRow, column: col, seatNumber: seatNumber++, available: true, selected: false });
  }

  return seats;
};

/**
 * Layout 2: Standard 2-2 bus without door gap
 * - Left side (columns 3, 4): All rows A-M
 * - Right side (columns 1, 2): All rows A-M
 * - Back row N: 5 seats (N5, N4, N3, N2, N1)
 */
const generateLayout2 = (totalSeats: number): Seat[] => {
  const seats: Seat[] = [];
  let seatNumber = 1;

  const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  // Generate seats row by row, left to right
  for (const row of allRows) {
    if (seatNumber > totalSeats) break;

    // Left side: column 4 (window), column 3 (aisle)
    if (seatNumber <= totalSeats) {
      seats.push({ id: `${row}4`, row, column: 4, seatNumber: seatNumber++, available: true, selected: false });
    }
    if (seatNumber <= totalSeats) {
      seats.push({ id: `${row}3`, row, column: 3, seatNumber: seatNumber++, available: true, selected: false });
    }

    // Right side: column 2 (aisle), column 1 (window)
    if (seatNumber <= totalSeats) {
      seats.push({ id: `${row}2`, row, column: 2, seatNumber: seatNumber++, available: true, selected: false });
    }
    if (seatNumber <= totalSeats) {
      seats.push({ id: `${row}1`, row, column: 1, seatNumber: seatNumber++, available: true, selected: false });
    }
  }

  // Back row N: 5 seats (N5, N4, N3, N2, N1) - left to right
  const backRow = 'N';
  for (let col = 5; col >= 1 && seatNumber <= totalSeats; col--) {
    seats.push({ id: `${backRow}${col}`, row: backRow, column: col, seatNumber: seatNumber++, available: true, selected: false });
  }

  return seats;
};

// Get the row structure for rendering
interface RowStructure {
  row: string;
  leftSeats: Seat[];
  rightSeats: Seat[];
  isBackRow: boolean;
}

const getRowStructure = (seats: Seat[], layoutType: SeatLayoutType): RowStructure[] => {
  const rowMap = new Map<string, Seat[]>();
  
  seats.forEach(seat => {
    if (!rowMap.has(seat.row)) {
      rowMap.set(seat.row, []);
    }
    rowMap.get(seat.row)!.push(seat);
  });

  const allRows = layoutType === 'layout1' 
    ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']
    : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

  const structures: RowStructure[] = [];

  for (const row of allRows) {
    const rowSeats = rowMap.get(row) || [];
    if (rowSeats.length === 0) continue;

    const isBackRow = row === 'N';
    
    if (isBackRow) {
      // Back row: all seats in one group, sorted by column descending (5,4,3,2,1)
      structures.push({
        row,
        leftSeats: rowSeats.sort((a, b) => b.column - a.column),
        rightSeats: [],
        isBackRow: true,
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
  // Generate seats based on layout type
  const allSeats = layoutType === 'layout1' ? generateLayout1(totalSeats) : generateLayout2(totalSeats);

  // Update seat availability and selection status
  const seats = allSeats.map((seat) => ({
    ...seat,
    available: !bookedSeats.includes(seat.seatNumber),
    selected: selectedSeats.includes(seat.id),
  }));

  // Get row structure for rendering
  const rowStructures = getRowStructure(seats, layoutType);

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
        w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold
        transition-all duration-200 relative
        ${
          seat.selected
            ? 'border-red-500 bg-red-500 text-white shadow-lg scale-105'
            : seat.available
            ? 'border-gray-300 bg-white hover:border-teal hover:bg-teal/10 text-gray-700 shadow-sm'
            : 'border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed'
        }
      `}
      title={seat.available ? `Seat ${seat.id} (No. ${seat.seatNumber})` : `Seat ${seat.id} - Booked`}
    >
      {seat.id}
    </button>
  );

  const renderEmptySlot = (key: string) => (
    <div key={key} className="w-10 h-10" />
  );

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Driver Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
          <Bus className="w-7 h-7 text-gray-500" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-gray-300 bg-white" />
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-red-500 bg-red-500" />
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-gray-300 bg-gray-200" />
          <span className="text-gray-600">Booked</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
        <div className="space-y-2">
          {rowStructures.map((structure) => (
            <div key={structure.row} className="flex items-center justify-center gap-1">
              {/* Row Label */}
              <div className="w-6 text-xs font-medium text-gray-400 text-right">
                {structure.row}
              </div>

              {structure.isBackRow ? (
                // Back row: 5 seats centered
                <div className="flex gap-1 justify-center flex-1">
                  {structure.leftSeats.map(renderSeat)}
                </div>
              ) : (
                // Regular row: left side, aisle, right side
                <div className="flex gap-1 items-center flex-1">
                  {/* Left side (columns 4, 3) */}
                  <div className="flex gap-1">
                    {structure.leftSeats.length > 0 ? (
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
                  <div className="w-6 flex-shrink-0" />

                  {/* Right side (columns 2, 1) */}
                  <div className="flex gap-1">
                    {structure.rightSeats.map(renderSeat)}
                  </div>
                </div>
              )}

              {/* Row Label (right side) */}
              <div className="w-6 text-xs font-medium text-gray-400 text-left">
                {structure.row}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Selected: <span className="font-bold text-red-500">{selectedSeats.length}</span> / {maxSelections} seats
        </p>
        {selectedSeats.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Seats: {selectedSeats.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};
