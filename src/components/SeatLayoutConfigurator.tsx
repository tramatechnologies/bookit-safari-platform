import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import SeatLayout from '@/components/SeatLayout';

export interface SeatLayoutRow {
  row: string;
  seats: (string | null)[];
}

interface SeatLayoutConfiguratorProps {
  value: SeatLayoutRow[] | null;
  onChange: (config: SeatLayoutRow[] | null) => void;
  totalSeats: number;
}

// Preset layouts for operators to choose from
const LAYOUT_PRESETS: Record<string, { name: string; description: string; config: SeatLayoutRow[] }> = {
  preset1: {
    name: 'Standard 14-Row (57 seats)',
    description: 'All rows with 4 seats except last row with 5',
    config: [
      { row: 'A', seats: ['A1', 'A2', null, 'A3', 'A4'] },
      { row: 'B', seats: ['B1', 'B2', null, 'B3', 'B4'] },
      { row: 'C', seats: ['C1', 'C2', null, 'C3', 'C4'] },
      { row: 'D', seats: ['D1', 'D2', null, 'D3', 'D4'] },
      { row: 'E', seats: ['E1', null, null, null, 'E2'] }, // 2 seats with gap
      { row: 'F', seats: ['F1', 'F2', null, 'F3', 'F4'] },
      { row: 'G', seats: ['G1', 'G2', null, 'G3', 'G4'] },
      { row: 'H', seats: ['H1', 'H2', null, 'H3', 'H4'] },
      { row: 'I', seats: ['I1', 'I2', null, 'I3', 'I4'] },
      { row: 'J', seats: ['J1', 'J2', null, 'J3', 'J4'] },
      { row: 'K', seats: ['K1', 'K2', null, 'K3', 'K4'] },
      { row: 'L', seats: ['L1', 'L2', null, 'L3', 'L4'] },
      { row: 'M', seats: ['M1', 'M2', null, 'M3', 'M4'] },
      { row: 'N', seats: ['N1', 'N2', null, 'N3', 'N4', 'N5'] }, // 5 seats
    ],
  },
  preset2: {
    name: 'Compact 14-Row (53 seats)',
    description: 'All rows with 4 seats except last row with 5 (no middle gap)',
    config: [
      { row: 'A', seats: ['A1', 'A2', 'A3', 'A4'] },
      { row: 'B', seats: ['B1', 'B2', 'B3', 'B4'] },
      { row: 'C', seats: ['C1', 'C2', 'C3', 'C4'] },
      { row: 'D', seats: ['D1', 'D2', 'D3', 'D4'] },
      { row: 'E', seats: ['E1', 'E2'] }, // 2 seats only
      { row: 'F', seats: ['F1', 'F2', 'F3', 'F4'] },
      { row: 'G', seats: ['G1', 'G2', 'G3', 'G4'] },
      { row: 'H', seats: ['H1', 'H2', 'H3', 'H4'] },
      { row: 'I', seats: ['I1', 'I2', 'I3', 'I4'] },
      { row: 'J', seats: ['J1', 'J2', 'J3', 'J4'] },
      { row: 'K', seats: ['K1', 'K2', 'K3', 'K4'] },
      { row: 'L', seats: ['L1', 'L2', 'L3', 'L4'] },
      { row: 'M', seats: ['M1', 'M2', 'M3', 'M4'] },
      { row: 'N', seats: ['N1', 'N2', 'N3', 'N4', 'N5'] }, // 5 seats
    ],
  },
  preset3: {
    name: 'Full 14-Row (56 seats)',
    description: 'All rows with 4 seats except last with 5 (no gaps)',
    config: [
      { row: 'A', seats: ['A1', 'A2', 'A3', 'A4'] },
      { row: 'B', seats: ['B1', 'B2', 'B3', 'B4'] },
      { row: 'C', seats: ['C1', 'C2', 'C3', 'C4'] },
      { row: 'D', seats: ['D1', 'D2', 'D3', 'D4'] },
      { row: 'E', seats: ['E1', 'E2', 'E3', 'E4'] },
      { row: 'F', seats: ['F1', 'F2', 'F3', 'F4'] },
      { row: 'G', seats: ['G1', 'G2', 'G3', 'G4'] },
      { row: 'H', seats: ['H1', 'H2', 'H3', 'H4'] },
      { row: 'I', seats: ['I1', 'I2', 'I3', 'I4'] },
      { row: 'J', seats: ['J1', 'J2', 'J3', 'J4'] },
      { row: 'K', seats: ['K1', 'K2', 'K3', 'K4'] },
      { row: 'L', seats: ['L1', 'L2', 'L3', 'L4'] },
      { row: 'M', seats: ['M1', 'M2', 'M3', 'M4'] },
      { row: 'N', seats: ['N1', 'N2', 'N3', 'N4', 'N5'] }, // 5 seats
    ],
  },
};

export const SeatLayoutConfigurator = ({
  value,
  onChange,
  totalSeats,
}: SeatLayoutConfiguratorProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('preset1');
  const [customConfig, setCustomConfig] = useState<SeatLayoutRow[]>(
    value || LAYOUT_PRESETS.preset1.config
  );

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = LAYOUT_PRESETS[presetKey];
    setCustomConfig(preset.config);
    onChange(preset.config);
  };

  const calculateTotalSeats = (config: SeatLayoutRow[]): number => {
    return config.reduce((sum, row) => {
      return sum + row.seats.filter(seat => seat !== null).length;
    }, 0);
  };

  const currentTotalSeats = calculateTotalSeats(customConfig);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Choose Preset</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid gap-3">
            {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  selectedPreset === key
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'hover:border-green-300'
                }`}
                onClick={() => handlePresetSelect(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                      <CardDescription>{preset.description}</CardDescription>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <span className="font-semibold text-primary">
                        {calculateTotalSeats(preset.config)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Preview</CardTitle>
              <CardDescription>
                Total seats: <span className="font-semibold">{currentTotalSeats}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted/30 p-4 overflow-auto max-h-96">
                <SeatLayout
                  totalSeats={currentTotalSeats}
                  bookedSeats={[]}
                  selectedSeats={[]}
                  onSeatClick={() => {}}
                  seatLayoutConfig={customConfig}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-900 dark:text-blue-100">
            Selected Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{LAYOUT_PRESETS[selectedPreset].name}</strong>
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Total Seats: <span className="font-semibold">{currentTotalSeats}</span>
            </p>
            {currentTotalSeats !== totalSeats && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                ⚠️ Layout has {currentTotalSeats} seats, but you set {totalSeats}. Please adjust total seats above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
