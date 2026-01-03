import React, { useState } from 'react';
import { Bus } from 'lucide-react';

// Type exports for backward compatibility
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

// Utility function for backward compatibility
export const getSeatNumberFromId = (seatId: string, layoutType: SeatLayoutType, totalSeats: number): number => {
  // Convert seat ID like "A1" to a seat number
  const row = seatId.charCodeAt(0) - 65; // A=0, B=1, etc.
  const col = parseInt(seatId.slice(1));
  
  // Calculate seat number based on layout
  let seatNumber = 0;
  
  if (layoutType === 'layout1') {
    // For layout1: rows A-M have variable columns, row N has 5
    for (let r = 0; r < row; r++) {
      if (r < 4 || r >= 7) { // Rows A-D and H-M have 4 seats
        seatNumber += 4;
      } else if (r === 4) { // Row E has 2 seats
        seatNumber += 2;
      } else if (r === 5 || r === 6) { // Rows F-G have 4 seats
        seatNumber += 4;
      }
    }
    // Add column offset for current row
    if (row < 4 || row >= 7) { // Rows A-D, H-M
      seatNumber += (5 - col);
    } else if (row === 4) { // Row E
      seatNumber += (3 - col);
    } else { // Rows F-G
      seatNumber += (5 - col);
    }
  } else {
    // For layout2: all regular rows have 4 seats, row N has 5
    for (let r = 0; r < row; r++) {
      if (r < 13) {
        seatNumber += 4;
      }
    }
    seatNumber += (5 - col);
  }
  
  return Math.min(seatNumber, totalSeats);
};

interface SeatLayoutRow {
  row: string;
  seats: (string | null)[];
}

interface SeatLayoutProps {
  layoutType?: SeatLayoutType;
  totalSeats: number;
  availableSeats?: number;
  bookedSeats: number[];
  selectedSeats: string[];
  onSeatClick: (seatId: string, seatNumber: number) => void;
  maxSelections?: number;
  seatLayoutConfig?: SeatLayoutRow[] | null; // New prop for custom layouts
}

// Wrapper component that adapts old interface to new visual component
export const SeatLayout: React.FC<SeatLayoutProps> = ({
  layoutType,
  totalSeats,
  bookedSeats,
  selectedSeats,
  onSeatClick,
  maxSelections = 5,
  seatLayoutConfig,
}) => {
  // Use custom layout config if provided, otherwise use default layout
  const seatLayout: SeatLayoutRow[] = seatLayoutConfig || [
    { row: '1', seats: ['A3', 'A4', null, 'A2', 'A1'] },
    { row: '2', seats: ['B3', 'B4', null, 'B2', 'B1'] },
    { row: '3', seats: ['C3', 'C4', null, 'C2', 'C1'] },
    { row: '4', seats: ['D3', 'D4', null, 'D2', 'D1'] },
    { row: '5', seats: [null, null, null, 'E2', 'E1'] },
    { row: '6', seats: ['F3', 'F4', null, 'F2', 'F1'] },
    { row: '7', seats: ['G3', 'G4', null, 'G2', 'G1'] },
    { row: '8', seats: ['H3', 'H4', null, 'H2', 'H1'] },
    { row: '9', seats: ['I3', 'I4', null, 'I2', 'I1'] },
    { row: '10', seats: ['J3', 'J4', null, 'J2', 'J1'] },
    { row: '11', seats: ['K3', 'K4', null, 'K2', 'K1'] },
    { row: '12', seats: ['L3', 'L4', null, 'L2', 'L1'] },
    { row: '13', seats: ['M3', 'M4', null, 'M2', 'M1'] },
    { row: '14', seats: ['N5', 'N4', 'N3', 'N2', 'N1'] }
  ];

  // Convert selected seat IDs to seat numbers to check if booked
  const selectedSeatNumbers = selectedSeats.map(id => getSeatNumberFromId(id, layoutType || 'layout1', totalSeats));
  const bookedSeatIds = new Set(
    seatLayout
      .flatMap(row => row.seats.filter(Boolean))
      .filter(seatId => {
        const seatNumber = getSeatNumberFromId(seatId as string, layoutType || 'layout1', totalSeats);
        return bookedSeats.includes(seatNumber);
      })
  );

  const toggleSeat = (seatId: string) => {
    if (!seatId || bookedSeatIds.has(seatId)) return;
    
    const seatNumber = getSeatNumberFromId(seatId, layoutType || 'layout1', totalSeats);
    if (seatNumber > 0) {
      onSeatClick(seatId, seatNumber);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Seats</h2>
          <p className="text-gray-600">Total Seats Available: {totalSeats}</p>
        </div>

        {/* Seat Map */}
        <div className="space-y-3 mb-6">
          {seatLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center items-center gap-2">
              {row.seats.map((seat, seatIndex) => (
                <React.Fragment key={seatIndex}>
                  {seat ? (
                    <button
                      onClick={() => toggleSeat(seat)}
                      disabled={bookedSeatIds.has(seat)}
                      className={`
                        w-12 h-12 rounded-lg font-semibold text-sm
                        transition-all duration-200 transform
                        ${selectedSeats.includes(seat)
                          ? 'bg-green-500 text-white shadow-lg hover:scale-105'
                          : bookedSeatIds.has(seat)
                          ? 'bg-red-500 text-white cursor-not-allowed opacity-60'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                        }
                      `}
                      title={
                        bookedSeatIds.has(seat)
                          ? `Seat ${seat} - Booked`
                          : selectedSeats.includes(seat)
                          ? `Seat ${seat} - Selected`
                          : `Seat ${seat}`
                      }
                    >
                      {seat}
                    </button>
                  ) : (
                    <div className="w-12 h-12" />
                  )}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-gray-600">Booked</span>
          </div>
        </div>

        {/* Selection count */}
        <div className="text-center text-sm text-gray-600">
          Selected: <span className="font-bold text-green-500">{selectedSeats.length}</span> / {maxSelections}
        </div>
      </div>
    </div>
  );
};

const BusSeatLayout = () => {
  return (
    <SeatLayout
      layoutType="layout1"
      totalSeats={60}
      availableSeats={60}
      bookedSeats={[]}
      selectedSeats={[]}
      onSeatClick={() => {}}
      maxSelections={5}
    />
  );
};

export default BusSeatLayout;
