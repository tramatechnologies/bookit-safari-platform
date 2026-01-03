# Operator Seat Layout Configuration System

## Overview
Operators can now configure custom seat layouts for their buses. Once configured, passengers will see the exact seat map that the operator chose when booking tickets.

## How It Works

### For Operators
1. Navigate to **Manage Buses** page
2. Click **Add Bus** or **Edit** an existing bus
3. In the dialog, scroll down to **Seat Layout Configuration**
4. Choose a preset layout or customize one:
   - **Standard 14-Row (57 seats)** - Default layout with door gap (E row has 2 seats, N row has 5 seats)
   - **Compact 14-Row (53 seats)** - All 4-seat rows except E (2 seats) and N (5 seats), no gaps
   - **Full 14-Row (56 seats)** - All rows have 4 seats plus N row with 5 seats, no gaps
5. Preview the layout in the **Preview** tab
6. Click **Add Bus** or **Update Bus** to save

### For Passengers
1. Navigate to **Book a Seat**
2. Select a schedule
3. The seat map displayed will match exactly what the operator configured
4. Booked seats appear in red, available seats in gray, selected seats in green

## Database Structure

### buses Table
```sql
seat_layout_config JSONB -- Custom layout configuration (nullable)
```

### Seat Layout Config Format
```json
[
  {
    "row": "A",
    "seats": ["A1", "A2", null, "A3", "A4"]  -- null represents gaps/no seat
  },
  {
    "row": "E",
    "seats": ["E1", null, null, null, "E2"]  -- Special case: 2 seats with gap
  },
  {
    "row": "N",
    "seats": ["N1", "N2", null, "N3", "N4", "N5"]  -- Back row: 5 seats
  }
]
```

## Components

### SeatLayoutConfigurator.tsx
- **Location**: `src/components/SeatLayoutConfigurator.tsx`
- **Purpose**: UI for operators to select and preview seat layouts
- **Features**:
  - Preset layout selection with visual cards
  - Live preview of selected layout
  - Seat count validation
  - Support for custom configurations

**Props**:
```typescript
interface SeatLayoutConfiguratorProps {
  value: SeatLayoutRow[] | null;           // Current config
  onChange: (config: SeatLayoutRow[] | null) => void;  // Update handler
  totalSeats: number;                      // Validate against total seats
}
```

### OperatorBuses.tsx
- **Location**: `src/pages/OperatorBuses.tsx`
- **Changes**:
  - Added `seat_layout_config` field to Bus interface
  - Integrated `SeatLayoutConfigurator` into bus edit/create dialog
  - Added "🗒 Custom" indicator for buses with custom layouts
  - Saves layout config when creating/updating buses

### Booking.tsx
- **Location**: `src/pages/Booking.tsx`
- **Changes**:
  - Passes `seatLayoutConfig` prop to `<SeatLayout>` component (line 580)
  - Source: `schedule?.bus?.seat_layout_config`
  - Falls back to default layout if not configured

### SeatLayout.tsx
- **Location**: `src/components/SeatLayout.tsx`
- **Features**:
  - Accepts optional `seatLayoutConfig` prop
  - Uses custom layout if provided
  - Falls back to default 14-row layout if not configured
  - Full backward compatibility with existing code

## Preset Layouts

### Preset 1: Standard 14-Row (57 seats)
- Rows A-D, F-M: 4 seats with middle gap (e.g., "A1 A2 | A3 A4")
- Row E: 2 seats with full gap (driver side) ("E1 | | | E2")
- Row N: 5 seats with middle gap ("N1 N2 | N3 N4 N5")
- Total: 57 seats

### Preset 2: Compact 14-Row (53 seats)
- Rows A-D, F-M: 4 seats (no gaps)
- Row E: 2 seats only (no gap)
- Row N: 5 seats (with middle gap)
- Total: 53 seats

### Preset 3: Full 14-Row (56 seats)
- Rows A-M: 4 seats each (no gaps)
- Row N: 5 seats (with middle gap)
- Total: 56 seats

## Data Flow

```
Operator Creates/Edits Bus
    ↓
OperatorBuses.tsx Dialog Opens
    ↓
SeatLayoutConfigurator Shows Presets
    ↓
Operator Selects Layout
    ↓
Config Saved to buses.seat_layout_config
    ↓
Passenger Books Ticket
    ↓
Booking.tsx Fetches Schedule
    ↓
SeatLayout Component Receives Config
    ↓
Correct Seat Map Displays to Passenger
```

## Migration

The database migration `add_seat_layout_config_to_buses` has been applied:
```sql
ALTER TABLE buses ADD COLUMN seat_layout_config JSONB;
CREATE INDEX idx_buses_seat_layout_config ON buses USING GIN (seat_layout_config);
```

## Backward Compatibility

✅ **Fully backward compatible**
- Buses without custom layouts use the default 14-row layout
- Existing code continues to work without modification
- `seat_layout_config` is optional (nullable)

## Testing

### Manual Testing Checklist
- [ ] Operator creates a bus with Preset 1 layout
- [ ] Operator creates a bus with Preset 2 layout
- [ ] Operator creates a bus with Preset 3 layout
- [ ] Operator edits a bus and changes its layout
- [ ] Passenger books on bus with custom layout - sees correct seat map
- [ ] Passenger books on bus without layout - sees default layout
- [ ] Booked seats display correctly in custom layouts
- [ ] Selected seats show in green in custom layouts

## Future Enhancements

1. **Custom Layout Builder** - Allow operators to define completely custom layouts without presets
2. **Layout Templates** - Save and reuse custom layouts across multiple buses
3. **Layout Visualization Tool** - Drag-and-drop interface to design seat layouts
4. **Analytics** - Show which seats are most/least booked for each layout
5. **Dynamic Pricing** - Different prices based on seat location/row type

## Support

For issues or questions about the seat layout configuration system, please refer to:
- [API Documentation](API_DOCUMENTATION.md)
- [Developer Reference](DEVELOPER_REFERENCE.md)
