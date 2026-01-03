# Operator Seat Layouts & Test Data Reference

## Seeded Test Data Summary

You have **6 fully approved operators** with **12 buses** and **284 active schedules** ready to test immediately.

---

## Detailed Seat Layouts by Bus

### Layout Type 1: Standard Layout (2-2 with Aisle)
**Buses Using This Layout:**
- KE-001 (Kilimanjaro Express) - 57 seats
- KE-003 (Kilimanjaro Express) - 56 seats  
- SE-002 (Scandinavian Express) - 57 seats
- CR-001 (Coastal Routes Ltd) - 57 seats

**Visual Layout:**
```
Row A:  [A1] [A2] | [A3] [A4]
Row B:  [B1] [B2] | [B3] [B4]
Row C:  [C1] [C2] | [C3] [C4]
Row D:  [D1] [D2] | [D3] [D4]
Row E:  [E1]      |      [E2]    (Emergency exit area)
Row F:  [F1] [F2] | [F3] [F4]
Row G:  [G1] [G2] | [G3] [G4]
Row H:  [H1] [H2] | [H3] [H4]
Row I:  [I1] [I2] | [I3] [I4]
Row J:  [J1] [J2] | [J3] [J4]
Row K:  [K1] [K2] | [K3] [K4]
Row L:  [L1] [L2] | [L3] [L4]
Row M:  [M1] [M2] | [M3] [M4]
Row N:  [N1] [N2]    [N3] [N4] [N5]  (Back section - 5 seats)
```

**Total Seats:** 57 (52 in rows A-M + 5 in row N)
**Characteristics:**
- Wide aisle down the middle (good for wheelchair access in real scenario)
- Traditional 2+2 seating arrangement
- Special back section with 5 seats
- Best for longer journeys

---

### Layout Type 2: Compact Layout (4-4)
**Buses Using This Layout:**
- KE-002 (Kilimanjaro Express) - 53 seats
- SE-001 (Scandinavian Express) - 53 seats
- KPS-001 (Kilimanjaro Peak Shuttles) - 53 seats

**Visual Layout:**
```
Row A:  [A1] [A2] [A3] [A4]
Row B:  [B1] [B2] [B3] [B4]
Row C:  [C1] [C2] [C3] [C4]
Row D:  [D1] [D2] [D3] [D4]
Row E:  [E1] [E2]              (Reduced back section)
Row F:  [F1] [F2] [F3] [F4]
Row G:  [G1] [G2] [G3] [G4]
Row H:  [H1] [H2] [H3] [H4]
Row I:  [I1] [I2] [I3] [I4]
Row J:  [J1] [J2] [J3] [J4]
Row K:  [K1] [K2] [K3] [K4]
Row L:  [L1] [L2] [L3] [L4]
Row M:  [M1] [M2] [M3] [M4]
Row N:  [N1] [N2]    [N3] [N4] [N5]  (Back section - 5 seats)
```

**Total Seats:** 53 (48 in rows A-M + 5 in row N)
**Characteristics:**
- 4 seats per row (very compact)
- No center aisle
- Minimal space between rows
- Better for short-distance routes
- Higher passenger capacity per bus

---

## Detailed Operator Information

### 1. Kilimanjaro Express ✅
**Status:** Approved | **Headquarters:** Dar es Salaam

| Bus | Plate | Type | Seats | Layout | Amenities | Routes |
|-----|-------|------|-------|--------|-----------|--------|
| KE-001 | T123 ABC | Luxury | 57 | Standard | USB, TV, AC, WiFi, Toilet, Refreshments | Dar→Arusha, Dar→Mwanza, Dar→Dodoma |
| KE-002 | T124 DEF | Luxury | 53 | Compact | USB, AC, WiFi, Refreshments | Dar→Arusha, Dar→Mwanza, Dar→Dodoma |
| KE-003 | T125 GHI | Semi Luxury | 56 | Standard | USB, AC, Refreshments | Dar→Arusha, Dar→Mwanza, Dar→Dodoma |

**Test Schedules:**
- **Tomorrow (KE-001):** Dar→Arusha at 08:00 (57 seats) - TZS 45,000
- **Tomorrow (KE-002):** Dar→Arusha at 14:00 (53 seats) - TZS 50,000
- **Tomorrow (KE-003):** Dar→Mwanza at 18:00 (56 seats) - TZS 55,000

---

### 2. Scandinavian Express ✅
**Status:** Approved | **Headquarters:** Arusha

| Bus | Plate | Type | Seats | Layout | Amenities | Routes |
|-----|-------|------|-------|--------|-----------|--------|
| SE-001 | T456 JKL | Luxury | 53 | Compact | USB, AC, WiFi, Refreshments, TV, Toilet | Arusha↔Dar, Arusha↔Moshi, Arusha↔Mwanza |
| SE-002 | T457 MNO | Semi Luxury | 57 | Standard | USB, AC, Refreshments | Arusha↔Dar, Arusha↔Moshi, Arusha↔Mwanza |

**Test Schedules:**
- **Tomorrow (SE-001):** Arusha→Dar at 07:00 (53 seats) - TZS 48,000
- **Tomorrow (SE-002):** Arusha→Moshi at 10:00 (57 seats) - TZS 15,000
- **Day+2 (SE-001):** Arusha→Mwanza at 16:00 (53 seats) - TZS 42,000

---

### 3. Safari Star Coaches ✅
**Status:** Approved | **Headquarters:** Mwanza

| Bus | Plate | Type | Seats | Layout | Amenities | Routes |
|-----|-------|------|-------|--------|-----------|--------|
| SSC-001 | T789 PQR | Standard | 56 | Layout1 | AC, Refreshments | Mwanza↔Dar, Mwanza↔Dodoma |
| SSC-002 | T790 STU | Standard | 57 | Layout2 | AC | Mwanza↔Dar, Mwanza↔Dodoma |

**Test Schedules:**
- **Tomorrow (SSC-001):** Mwanza→Dar at 18:00 (56 seats) - TZS 35,000
- **Tomorrow (SSC-002):** Mwanza→Dodoma at 14:00 (57 seats) - TZS 28,000

---

### 4. Coastal Routes Ltd ✅
**Status:** Approved | **Headquarters:** Dodoma

| Bus | Plate | Type | Seats | Layout | Amenities | Routes |
|-----|-------|------|-------|--------|-----------|--------|
| CR-001 | T901 VWX | Luxury | 57 | Standard | USB, AC, WiFi, Refreshments | Dodoma↔Dar, Dodoma↔Arusha |

**Test Schedules:**
- **Tomorrow (CR-001):** Dodoma→Dar at 09:00 (57 seats) - TZS 32,000
- **Day+2 (CR-001):** Dodoma→Arusha at 11:00 (57 seats) - TZS 38,000

---

### 5. Kilimanjaro Peak Shuttles ✅
**Status:** Approved | **Headquarters:** Kilimanjaro (Moshi)

| Bus | Plate | Type | Seats | Layout | Amenities | Routes |
|-----|-------|------|-------|--------|-----------|--------|
| KPS-001 | T234 YZA | Luxury | 53 | Compact | USB, TV, AC, WiFi, Toilet, Refreshments | Moshi↔Arusha, Moshi↔Dar |

**Test Schedules:**
- **Tomorrow (KPS-001):** Moshi→Arusha at 08:00 (53 seats) - TZS 12,000
- **Tomorrow (KPS-001):** Moshi→Dar at 16:00 (53 seats) - TZS 40,000

---

### 6. Safari Express ✅
**Status:** Approved | **High Volume Testing Operator**

**Multiple Buses with 270+ Schedules** - Perfect for bulk testing and performance validation

---

## Quick Test Navigation

### Test the Header Links:

#### 1️⃣ **"Find Buses"** Link Test
```
Path: /search
Steps:
1. Click "Find Buses" in header
2. Enter From: "Dar es Salaam"
3. Enter To: "Arusha"
4. Select Date: Tomorrow
5. Click "Search"

Expected Results:
- 2 buses shown (Kilimanjaro Express + Scandinavian Express)
- Multiple departure times
- Real prices (45,000 - 50,000 TZS)
```

#### 2️⃣ **"Routes"** Link Test
```
Path: /routes
Steps:
1. Click "Routes" in main navigation
2. Browse all available routes
3. Click on any route for details

Expected Results:
- 20 total routes across 6 operators
- Terminal information shows
- Distance in KM displays
- Duration in hours visible
- Operator name linked
```

#### 3️⃣ **"Operators"** Link Test
```
Path: /operators
Steps:
1. Click "Operators" in main navigation
2. View operator cards
3. Click on any operator

Expected Results:
- 6 operator cards displayed
- Company names, emails, phones visible
- Logo images shown
- Click leads to operator details page
- Shows their buses and routes
```

---

## Sample Booking Flow Test

### Complete End-to-End Test:

```
1. START: Homepage
   └─ Click "Find Buses" in header

2. SEARCH RESULTS: /search
   └─ From: Dar es Salaam
   └─ To: Arusha
   └─ Date: Tomorrow
   └─ Click "Kilimanjaro Express KE-001 (08:00)"

3. BUS DETAILS: 
   └─ See 57-seat layout with Standard layout
   └─ See amenities: USB, TV, AC, Refreshments, Toilet, WiFi
   └─ Price: 45,000 TZS per person

4. SEAT SELECTION:
   └─ Click on available seats (shown in green)
   └─ Layout example: A1, A2, A3 (or B1, C1, etc.)
   └─ Selected seats shown highlighted

5. PASSENGER INFO:
   └─ Enter passenger names, phone, email
   └─ Click "Continue"

6. SUMMARY:
   └─ Review booking details
   └─ Show operator (Kilimanjaro Express)
   └─ Show total price
   └─ Confirm booking

7. PAYMENT: (if enabled)
   └─ Process payment through ClickPesa
   └─ Receive confirmation

8. CONFIRMATION:
   └─ Booking number generated
   └─ QR code shown
   └─ Email confirmation sent
```

---

## Database Verification Queries

### Check Operators are Approved
```sql
SELECT company_name, status, COUNT(*) as bus_count
FROM bus_operators bo
LEFT JOIN buses b ON bo.id = b.operator_id
WHERE status = 'approved'
GROUP BY bo.id, company_name, status;
```

**Expected Output:**
```
company_name                  | status   | bus_count
---------------------------------------------------
Kilimanjaro Express           | approved | 3
Scandinavian Express          | approved | 2
Safari Star Coaches           | approved | 2
Coastal Routes Ltd            | approved | 1
Kilimanjaro Peak Shuttles     | approved | 1
Safari Express                | approved | 3
```

### Check Tomorrow's Available Trips
```sql
SELECT 
  bo.company_name,
  b.bus_number,
  b.plate_number,
  r.departure_terminal,
  r.arrival_terminal,
  s.departure_time,
  s.available_seats,
  s.price_tzs
FROM schedules s
JOIN routes r ON s.route_id = r.id
JOIN buses b ON s.bus_id = b.id
JOIN bus_operators bo ON b.operator_id = bo.id
WHERE s.departure_date = CURRENT_DATE + INTERVAL '1 day'
AND s.is_active = true
ORDER BY bo.company_name, s.departure_time;
```

**Expected Output:** Multiple rows with tomorrow's schedules from all operators

---

## What You Can Test

✅ **Search Functionality**
- Region-to-region searches
- Date selection
- Filter by price/amenities

✅ **Operator Visibility**
- All 6 operators show in search results
- Operator details page works
- Bus listings display correctly

✅ **Route Information**
- All 20 routes visible on routes page
- Route details correct
- Terminal information matches

✅ **Seat Layout Display**
- Both layout types render correctly
- Seat selection is functional
- Available/booked status shows

✅ **Booking Flow**
- Search → Bus Selection → Seat Selection → Passenger Info → Confirmation
- All steps functional with real data

✅ **Price Display**
- Correct prices shown (45,000 - 55,000 TZS range)
- Calculations accurate
- Commission rates applied

---

## Important Notes

1. **All Data is Real and Live** - The operators, buses, routes, and schedules are all in the production database
2. **Future Dates Only** - Schedules are seeded for tomorrow and beyond (CURRENT_DATE + days)
3. **All Operators Approved** - No pending approvals needed for testing
4. **Unique Plate Numbers** - Each bus has a unique plate number for realistic testing
5. **Diverse Layouts** - Test both standard and compact seating arrangements

---

**Last Updated:** January 3, 2026  
**All Data Verified:** ✅ Ready for Testing  
**Total Test Entities:** 6 Operators | 12 Buses | 20 Routes | 284+ Schedules
