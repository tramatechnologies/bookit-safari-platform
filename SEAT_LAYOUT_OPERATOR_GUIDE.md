# Operator Seat Layout Configuration - Step-by-Step Guide

## For Operators: How to Configure Seat Layouts

### Step 1: Go to Manage Buses Page
- Navigate to the **Manage Buses** section
- You'll see your existing buses in a grid layout

### Step 2: Add a New Bus or Edit Existing Bus
**For New Bus:**
- Click the **+ Add Bus** button

**For Existing Bus:**
- Click the **Edit (pencil)** icon on the bus card

### Step 3: Fill Bus Details
Enter the basic information:
- **Bus Number**: e.g., "BUS-001"
- **Plate Number**: e.g., "T123 ABC"
- **Bus Type**: Select from Luxury, Semi Luxury, Standard
- **Total Seats**: Auto-set based on layout, but can be adjusted

### Step 4: Select Amenities (Optional)
Choose which amenities this bus has:
- WiFi
- USB Charging
- AC/Heating
- Reclining Seats
- etc.

### Step 5: Choose Seat Layout Configuration
Scroll down to the **"Seat Layout Configuration"** section.

You'll see two tabs:
- **"Choose Preset"** - Select from ready-made layouts
- **"Preview"** - See how the layout looks

#### Available Presets:

**1. Standard 14-Row (57 seats)** 🟢 RECOMMENDED
```
Layout: All rows 2-2 configuration with middle gap
Special Cases:
  - Row E: Only 2 seats (driver side gap)
  - Row N: 5 seats at the back (middle gap)
  
Visual:
  A1 A2 | A3 A4
  B1 B2 | B3 B4
  ...
  E1    |    E2   ← Only 2 seats
  ...
  N1 N2 | N3 N4 N5 ← 5 seats
```

**2. Compact 14-Row (53 seats)**
```
Layout: All rows without middle gap
Special Cases:
  - Row E: Only 2 seats (no gap)
  - Row N: 5 seats at the back (middle gap)
  
Visual:
  A1 A2 A3 A4
  B1 B2 B3 B4
  ...
  E1 E2         ← Only 2 seats
  ...
  N1 N2 | N3 N4 N5 ← 5 seats
```

**3. Full 14-Row (56 seats)**
```
Layout: All rows with 4 seats each, no gaps
Special Cases:
  - Row N: 5 seats at the back (middle gap)
  
Visual:
  A1 A2 A3 A4
  B1 B2 B3 B4
  ...
  N1 N2 | N3 N4 N5 ← 5 seats
```

### Step 6: Preview the Layout
Click the **"Preview"** tab to see:
- How the seat layout actually looks
- The exact seat map that passengers will see
- Total seat count

### Step 7: Save Your Configuration
- Click **"Add Bus"** (for new bus) or **"Update Bus"** (for existing)
- The layout is now saved!

---

## For Passengers: Booking a Seat

### Step 1: Search for a Route
1. Go to the booking page
2. Select your travel date and route
3. Click "Search Schedules"

### Step 2: Select a Schedule
- Choose your preferred schedule
- Click on the bus to proceed

### Step 3: View the Seat Map
**The seat map will now show exactly what the operator configured!**

Examples:
```
If operator chose "Standard":
  A1 A2 [gap] A3 A4
  B1 B2 [gap] B3 B4
  ...

If operator chose "Compact":
  A1 A2 A3 A4
  B1 B2 B3 B4
  ...

If operator chose "Full":
  A1 A2 A3 A4
  B1 B2 B3 B4
  ...
```

### Step 4: Select Seats
- **Available seats** (gray): Click to select
- **Booked seats** (red): Already taken
- **Your selected seats** (green): You chose these

### Step 5: Complete Booking
- Confirm your selection
- Complete payment
- Done! ✓

---

## Understanding the Layout Colors

When booking, passengers see:

| Color | Meaning | Action |
|-------|---------|--------|
| 🟫 Gray | Available | Click to select |
| 🟩 Green | Your selection | Highlight on selection |
| 🟥 Red | Booked | Cannot select |
| ⚫ Black outline | Seat number | Regular seat |

---

## Examples of Real Layouts

### Example 1: Standard Layout (57 seats)
```
Row A:  □A1 □A2    □A3 □A4
Row B:  □B1 □B2    □B3 □B4
Row C:  □C1 □C2    □C3 □C4
Row D:  □D1 □D2    □D3 □D4
Row E:  □E1        □E2       ← Only 2 seats!
Row F:  □F1 □F2    □F3 □F4
...
Row N:  □N1 □N2    □N3 □N4 □N5  ← 5 seats at back!

Total: 57 seats
Note: Empty space represents the aisle/door
```

### Example 2: Compact Layout (53 seats)
```
Row A:  □A1 □A2 □A3 □A4
Row B:  □B1 □B2 □B3 □B4
Row C:  □C1 □C2 □C3 □C4
Row D:  □D1 □D2 □D3 □D4
Row E:  □E1 □E2           ← Only 2 seats!
Row F:  □F1 □F2 □F3 □F4
...
Row N:  □N1 □N2    □N3 □N4 □N5  ← 5 seats at back!

Total: 53 seats
Note: More space per row (no middle gap)
```

### Example 3: Full Layout (56 seats)
```
Row A:  □A1 □A2 □A3 □A4
Row B:  □B1 □B2 □B3 □B4
Row C:  □C1 □C2 □C3 □C4
Row D:  □D1 □D2 □D3 □D4
Row E:  □E1 □E2 □E3 □E4
Row F:  □F1 □F2 □F3 □F4
...
Row N:  □N1 □N2    □N3 □N4 □N5  ← 5 seats at back!

Total: 56 seats
Note: Maximum capacity with all 4-seat rows
```

---

## Common Scenarios

### Scenario 1: Operator Wants Maximum Comfort
**Best Choice: Standard Layout (57 seats)**
- Good balance between capacity and comfort
- Aisles for passenger movement
- Standard industry configuration

### Scenario 2: Operator Wants Maximum Revenue
**Best Choice: Full Layout (56 seats)**
- Almost full capacity (56 vs 57 in standard)
- Minimal aisles
- Note: Only slightly less than standard

### Scenario 3: Operator Wants Flexibility
**Best Choice: Compact Layout (53 seats)**
- 53 seats still good capacity
- More legroom between rows
- Easier for passengers to move around

---

## Frequently Asked Questions

**Q: Can I create a completely custom layout?**
A: Currently, you can choose from 3 presets. Custom layouts coming in future updates.

**Q: Can I change the layout after creating the bus?**
A: Yes! Click Edit on the bus and select a different layout.

**Q: Will existing bookings be affected if I change the layout?**
A: No. Once a passenger books a seat, their reservation is protected.

**Q: What if a passenger's booked seat no longer exists in the new layout?**
A: This is prevented by validation - you'll see a warning if layouts would conflict.

**Q: Why are rows E and N different?**
A: Row E has only 2 seats because of the emergency exit on one side.
Row N has 5 seats because it's at the back with more space.

**Q: Can passengers choose between layouts?**
A: No. Each bus has one layout that all passengers see when booking.

**Q: Is the layout set permanently?**
A: No, you can always edit the bus and change to a different layout.

---

## Visual Comparison

```
┌─────────────────────────────────────────────────────┐
│          LAYOUT COMPARISON                          │
├──────────────────────────────────────┬──────────────┤
│ Feature              │ Standard │ Compact │ Full     │
├──────────────────────┼──────────┼─────────┼──────────┤
│ Total Seats          │    57    │   53    │   56     │
│ Aisle Width          │ Medium   │ Wider   │ Narrow   │
│ Passenger Comfort    │ Good     │ Best    │ Good     │
│ Revenue Potential    │ High     │ Medium  │ Highest  │
│ Standard Config      │ Yes      │ No      │ No       │
│ E Row Seats          │    2     │    2    │    4     │
│ N Row Seats          │    5     │    5    │    5     │
│ Middle Gap Rows A-D  │   Yes    │   No    │   No     │
└──────────────────────┴──────────┴─────────┴──────────┘
```

---

## Support

If you need help:
1. Check the documentation: `SEAT_LAYOUT_OPERATOR_CONFIG.md`
2. Review the implementation: `SEAT_LAYOUT_IMPLEMENTATION_SUMMARY.md`
3. Contact support with your bus number

---

**Last Updated**: January 3, 2026
**Version**: 1.0
**Status**: Production Ready ✅
