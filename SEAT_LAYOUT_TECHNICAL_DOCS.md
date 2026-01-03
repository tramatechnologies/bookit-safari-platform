# Seat Layout Configuration - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OperatorBuses.tsx              Booking.tsx                │
│  ┌──────────────────┐           ┌──────────────────┐       │
│  │ Bus Management   │           │ Passenger View   │       │
│  │ Dialog with      │           │ Uses custom      │       │
│  │ Configurator     │           │ layout from DB   │       │
│  └────────┬─────────┘           └────────┬─────────┘       │
│           │                               │                │
│  ┌────────▼───────────────────────────────▼────────┐       │
│  │    SeatLayoutConfigurator.tsx                    │       │
│  │    - Shows 3 preset layouts                     │       │
│  │    - Preview with SeatLayout component          │       │
│  │    - Returns SeatLayoutRow[]                    │       │
│  └────────┬────────────────────────────────────────┘       │
│           │                                                 │
│  ┌────────▼──────────────────────────────────────┐         │
│  │    SeatLayout.tsx                             │         │
│  │    - Accepts seatLayoutConfig prop            │         │
│  │    - Renders custom layout if provided        │         │
│  │    - Falls back to default 14-row layout      │         │
│  └────────┬──────────────────────────────────────┘         │
│           │                                                 │
├─────────────────────────────────────────────────────────────┤
│                    Supabase (Backend)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               PostgreSQL                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  buses table                                         │  │
│  │  ├─ id                                              │  │
│  │  ├─ bus_number                                      │  │
│  │  ├─ total_seats                                     │  │
│  │  ├─ seat_layout_config ← JSONB (NEW)               │  │
│  │  └─ [other fields]                                 │  │
│  │                                                      │  │
│  │  Indexes:                                           │  │
│  │  ├─ idx_buses_operator_id                          │  │
│  │  ├─ idx_buses_seat_layout_config (GIN)  ← NEW      │  │
│  │  └─ [other indexes]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### TypeScript Interfaces

```typescript
// From SeatLayoutConfigurator.tsx
interface SeatLayoutRow {
  row: string;                    // "A", "B", ..., "N"
  seats: (string | null)[];       // ["A1", "A2", null, "A3", "A4"]
}

// From OperatorBuses.tsx
interface Bus {
  id: string;
  bus_number: string;
  plate_number: string;
  bus_type: string | null;
  total_seats: number;
  amenities: string[] | null;
  seat_layout: string | null;
  seat_layout_config: SeatLayoutRow[] | null;  // ← NEW FIELD
  is_active: boolean;
}

// From SeatLayout.tsx
interface SeatLayoutProps {
  layoutType?: SeatLayoutType;
  totalSeats: number;
  availableSeats?: number[];
  bookedSeats: number[];
  selectedSeats: string[];
  onSeatClick: (seatId: string, seatNumber: number) => void;
  maxSelections?: number;
  seatLayoutConfig?: SeatLayoutRow[] | null;  // ← NEW PROP
}
```

### Database Schema

#### buses table
```sql
Column                Type          Constraints      Index
──────────────────────────────────────────────────────────────
id                   UUID          PRIMARY KEY
operator_id          UUID          NOT NULL, FK
bus_number           VARCHAR(50)   NOT NULL
plate_number         VARCHAR(50)   NOT NULL
bus_type             VARCHAR(50)   
total_seats          INTEGER       NOT NULL
amenities            TEXT[]        
seat_layout          VARCHAR(50)   
seat_layout_config   JSONB         ← NEW COLUMN      GIN Index
is_active            BOOLEAN       DEFAULT true
created_at           TIMESTAMP     
updated_at           TIMESTAMP     
──────────────────────────────────────────────────────────────
```

#### Migration SQL
```sql
-- File: supabase/migrations/add_seat_layout_config_to_buses.sql

ALTER TABLE buses 
ADD COLUMN seat_layout_config JSONB;

COMMENT ON COLUMN buses.seat_layout_config IS 
  'JSON array defining custom seat layout. Each element: 
   {"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]}. 
   Null values represent gaps/no seats. If null, default 14-row layout used.';

CREATE INDEX idx_buses_seat_layout_config 
ON buses USING GIN (seat_layout_config);
```

## Data Flow & Lifecycle

### 1. Operator Creates/Edits Bus

```
┌─────────────────────────────────────────┐
│ OperatorBuses.tsx                       │
│ - Operator clicks Add/Edit               │
│ - Dialog opens with form                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ SeatLayoutConfigurator                  │
│ - Shows 3 preset layout options          │
│ - Operator selects one                   │
│ - Preview displays layout                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Operator clicks "Add/Update Bus"         │
│ - Form data collected                    │
│ - seat_layout_config = selected config   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Supabase insert/update operation         │
│ - buses.seat_layout_config ← config JSON │
│ - Database saves JSONB                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Success!                                 │
│ - Toast notification shown               │
│ - Bus list refreshed                     │
│ - "Custom" badge shown on card           │
└─────────────────────────────────────────┘
```

### 2. Passenger Books Seats

```
┌─────────────────────────────────────────┐
│ Passenger searches route                │
│ - Selects schedule                      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Booking.tsx loads                       │
│ - Fetches schedule with bus data        │
│ - schedule.bus.seat_layout_config ← DB  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ <SeatLayout /> component rendered        │
│ - Receives seatLayoutConfig prop         │
│ - If config exists: use custom layout    │
│ - If null: use default 14-row layout     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Passenger sees correct seat map         │
│ - Visual matches operator's choice      │
│ - Can select available seats            │
│ - Booked seats shown in red             │
│ - Selection shows in green              │
└─────────────────────────────────────────┘
```

## Component Reference

### SeatLayoutConfigurator.tsx

**Location**: `src/components/SeatLayoutConfigurator.tsx`

**Purpose**: Allows operators to select and preview seat layouts

**Props**:
```typescript
interface SeatLayoutConfiguratorProps {
  value: SeatLayoutRow[] | null;
  onChange: (config: SeatLayoutRow[] | null) => void;
  totalSeats: number;
}
```

**Key Functions**:
```typescript
// Calculate total seats from config
const calculateTotalSeats = (config: SeatLayoutRow[]): number
  
// Handle preset selection
const handlePresetSelect = (presetKey: string): void

// Presets available
LAYOUT_PRESETS = {
  preset1: { name, description, config },
  preset2: { name, description, config },
  preset3: { name, description, config },
}
```

**UI Structure**:
- Tabs: "Choose Preset" | "Preview"
- Preset selection with info cards
- Preview with actual SeatLayout component
- Validation info box

### SeatLayout.tsx (Updated)

**Changes Made**:
```typescript
// NEW PROP
seatLayoutConfig?: SeatLayoutRow[] | null;

// NEW UTILITY
function getSeatNumberFromId(seatId: string, config?: SeatLayoutRow[]): number

// COMPONENT LOGIC
if (seatLayoutConfig) {
  // Use custom layout
  renderCustomLayout(seatLayoutConfig)
} else {
  // Use default layout
  renderDefaultLayout()
}
```

**Backward Compatibility**: ✅ Fully maintained
- If `seatLayoutConfig` not provided, uses default
- All existing code continues to work

### OperatorBuses.tsx (Updated)

**Changes Made**:
1. **Import**: Added `SeatLayoutConfigurator` and `SeatLayoutRow` type
2. **State**: Added `seat_layout_config` to form data
3. **Database**: Includes config in save payload
4. **UI**: 
   - Shows "🗒 Custom" badge for custom layouts
   - Renders `<SeatLayoutConfigurator>` in dialog
5. **Handler**: `handleEdit()` restores config when editing

### Booking.tsx (Updated)

**Changes Made**:
```tsx
<SeatLayout
  layoutType={seatLayoutType}
  totalSeats={busTotalSeats}
  availableSeats={availableSeats}
  bookedSeats={bookedSeats}
  selectedSeats={selectedSeatIds}
  onSeatClick={handleSeatClick}
  maxSelections={numberOfPassengers}
  seatLayoutConfig={(schedule?.bus as any)?.seat_layout_config}  // ← NEW
/>
```

**Type Safety**: Cast to `any` temporarily due to Supabase type generation limits

---

## Preset Layouts Details

### Preset 1: Standard 14-Row (57 seats)

```json
[
  {"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]},
  {"row": "B", "seats": ["B1", "B2", null, "B3", "B4"]},
  {"row": "C", "seats": ["C1", "C2", null, "C3", "C4"]},
  {"row": "D", "seats": ["D1", "D2", null, "D3", "D4"]},
  {"row": "E", "seats": ["E1", null, null, null, "E2"]},
  {"row": "F", "seats": ["F1", "F2", null, "F3", "F4"]},
  {"row": "G", "seats": ["G1", "G2", null, "G3", "G4"]},
  {"row": "H", "seats": ["H1", "H2", null, "H3", "H4"]},
  {"row": "I", "seats": ["I1", "I2", null, "I3", "I4"]},
  {"row": "J", "seats": ["J1", "J2", null, "J3", "J4"]},
  {"row": "K", "seats": ["K1", "K2", null, "K3", "K4"]},
  {"row": "L", "seats": ["L1", "L2", null, "L3", "L4"]},
  {"row": "M", "seats": ["M1", "M2", null, "M3", "M4"]},
  {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}
]
```

**Characteristics**:
- Middle gap in all rows (aisle)
- Row E: 2 seats (emergency exit accommodation)
- Row N: 5 seats
- Total: 57 seats
- Industry standard configuration

### Preset 2: Compact 14-Row (53 seats)

```json
[
  {"row": "A", "seats": ["A1", "A2", "A3", "A4"]},
  {"row": "B", "seats": ["B1", "B2", "B3", "B4"]},
  {"row": "C", "seats": ["C1", "C2", "C3", "C4"]},
  {"row": "D", "seats": ["D1", "D2", "D3", "D4"]},
  {"row": "E", "seats": ["E1", "E2"]},
  {"row": "F", "seats": ["F1", "F2", "F3", "F4"]},
  {"row": "G", "seats": ["G1", "G2", "G3", "G4"]},
  {"row": "H", "seats": ["H1", "H2", "H3", "H4"]},
  {"row": "I", "seats": ["I1", "I2", "I3", "I4"]},
  {"row": "J", "seats": ["J1", "J2", "J3", "J4"]},
  {"row": "K", "seats": ["K1", "K2", "K3", "K4"]},
  {"row": "L", "seats": ["L1", "L2", "L3", "L4"]},
  {"row": "M", "seats": ["M1", "M2", "M3", "M4"]},
  {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}
]
```

**Characteristics**:
- No middle gaps (wider rows)
- Row E: 2 seats only
- Row N: 5 seats with middle gap
- Total: 53 seats
- Spacious configuration

### Preset 3: Full 14-Row (56 seats)

```json
[
  {"row": "A", "seats": ["A1", "A2", "A3", "A4"]},
  {"row": "B", "seats": ["B1", "B2", "B3", "B4"]},
  {"row": "C", "seats": ["C1", "C2", "C3", "C4"]},
  {"row": "D", "seats": ["D1", "D2", "D3", "D4"]},
  {"row": "E", "seats": ["E1", "E2", "E3", "E4"]},
  {"row": "F", "seats": ["F1", "F2", "F3", "F4"]},
  {"row": "G", "seats": ["G1", "G2", "G3", "G4"]},
  {"row": "H", "seats": ["H1", "H2", "H3", "H4"]},
  {"row": "I", "seats": ["I1", "I2", "I3", "I4"]},
  {"row": "J", "seats": ["J1", "J2", "J3", "J4"]},
  {"row": "K", "seats": ["K1", "K2", "K3", "K4"]},
  {"row": "L", "seats": ["L1", "L2", "L3", "L4"]},
  {"row": "M", "seats": ["M1", "M2", "M3", "M4"]},
  {"row": "N", "seats": ["N1", "N2", null, "N3", "N4", "N5"]}
]
```

**Characteristics**:
- No gaps except back row
- Row E: Full 4 seats
- Row N: 5 seats with middle gap
- Total: 56 seats
- Maximum capacity (except Standard which has 57)

---

## Query Examples

### Get Bus with Layout Config

```sql
SELECT 
  id,
  bus_number,
  total_seats,
  seat_layout_config
FROM buses
WHERE id = '550e8400-e29b-41d4-a716-446655440000'
```

**Result**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "bus_number": "BUS-001",
  "total_seats": 57,
  "seat_layout_config": [
    {"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]},
    ...
  ]
}
```

### Search Buses by Operator with Layout

```sql
SELECT 
  id,
  bus_number,
  CASE WHEN seat_layout_config IS NOT NULL 
    THEN 'custom' 
    ELSE 'default' 
  END as layout_type,
  total_seats
FROM buses
WHERE operator_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY created_at DESC
```

### Find All Buses with Custom Layouts

```sql
SELECT 
  id,
  bus_number,
  operator_id,
  jsonb_array_length(seat_layout_config) as num_rows,
  total_seats
FROM buses
WHERE seat_layout_config IS NOT NULL
```

---

## Performance Considerations

### Index Strategy
```sql
-- GIN index on JSONB column for efficient queries
CREATE INDEX idx_buses_seat_layout_config 
ON buses USING GIN (seat_layout_config);
```

**Use Cases**:
- Search buses with custom layouts: `WHERE seat_layout_config IS NOT NULL`
- Filter by layout structure: `WHERE seat_layout_config @> '...'` (contains)

### Query Performance
- **Default layout lookup**: O(1) - null check
- **Custom layout lookup**: O(log n) - indexed JSONB search
- **Full scan**: O(n) - baseline for all operations

### Optimization Tips
1. Always use GIN index for seat_layout_config queries
2. Cache layout config on frontend to avoid repeated API calls
3. Validate config size: typical ~2KB per bus
4. Use pagination when fetching multiple buses

---

## Error Handling

### Validation

```typescript
// In SeatLayoutConfigurator
if (currentTotalSeats !== totalSeats) {
  showWarning("Layout seat count doesn't match total seats")
}

// In OperatorBuses mutation
if (busData.seat_layout_config) {
  validateLayoutConfig(busData.seat_layout_config)
}
```

### Fallback Strategy

```typescript
// In SeatLayout component
const config = seatLayoutConfig ?? DEFAULT_LAYOUT
// If config invalid or null, always fall back to default
```

### User Feedback

- ✅ Success toast: "Bus Added/Updated Successfully"
- ⚠️ Warning: "Layout seat count doesn't match"
- ❌ Error toast: "Failed to save bus information"

---

## Testing Strategy

### Unit Tests (Recommended)

```typescript
// Test SeatLayoutConfigurator
- Render presets correctly
- Calculate total seats from config
- Handle preset selection
- Preview renders correctly

// Test SeatLayout
- Render custom layout when provided
- Render default layout when config null
- Handle null seats (gaps) correctly
- Calculate seat numbers properly
```

### Integration Tests (Recommended)

```typescript
- Operator creates bus with custom layout
- Config saves to database
- Passenger loads schedule and sees custom layout
- Default layout displays for buses without config
- Edit bus and change layout
```

### Manual Testing Checklist

- [ ] Operator creates bus with each preset
- [ ] Passenger sees correct layout when booking
- [ ] Layout renders without gaps (null seats hidden)
- [ ] Booked seats show correctly
- [ ] Edit bus preserves layout config
- [ ] Delete bus (soft delete) doesn't affect others

---

## Troubleshooting

### Issue: Layouts not displaying correctly

**Diagnosis**:
```sql
SELECT seat_layout_config FROM buses WHERE id = '...' \gx
-- Check JSON structure is valid
```

**Solution**:
- Verify JSONB structure matches `SeatLayoutRow[]` type
- Check for null values in seats array
- Ensure row property exists for each element

### Issue: SeatLayout component shows default instead of custom

**Check**:
1. Is `seatLayoutConfig` prop being passed?
2. Is database value not null?
3. Is component receiving the prop?

**Debug**:
```tsx
console.log('Config:', seatLayoutConfig) // In SeatLayout
console.log('Bus:', schedule?.bus) // In Booking
```

### Issue: Total seats mismatch warning

**Solution**:
- Ensure `total_seats` matches layout seat count
- Update both fields together
- Use preset totals: Std=57, Compact=53, Full=56

---

## Future Enhancements

### Short Term (v1.1)
- [ ] Layout preview in operator dashboard
- [ ] Duplicate layout across buses
- [ ] Export/import configurations

### Medium Term (v1.2)
- [ ] Custom layout builder (drag-drop UI)
- [ ] Layout templates library
- [ ] Layout analytics (popular seats)

### Long Term (v2.0)
- [ ] Dynamic pricing by seat location
- [ ] 3D layout visualization
- [ ] Integration with seat upgrades
- [ ] Multi-language layout names

---

## API Reference

### Create/Update Bus

```http
POST /api/buses
Content-Type: application/json

{
  "bus_number": "BUS-001",
  "plate_number": "T123 ABC",
  "bus_type": "Luxury",
  "total_seats": 57,
  "amenities": ["WiFi", "USB Charging"],
  "seat_layout_config": [
    {"row": "A", "seats": ["A1", "A2", null, "A3", "A4"]},
    ...
  ]
}
```

### Get Bus with Layout

```http
GET /api/buses/{busId}

Response:
{
  "id": "...",
  "bus_number": "BUS-001",
  "seat_layout_config": [...],
  ...
}
```

---

## Related Documentation

- [Operator Guide](SEAT_LAYOUT_OPERATOR_GUIDE.md)
- [Implementation Summary](SEAT_LAYOUT_IMPLEMENTATION_SUMMARY.md)
- [Configuration Reference](SEAT_LAYOUT_OPERATOR_CONFIG.md)

---

**Last Updated**: January 3, 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
