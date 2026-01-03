# Operator Testing Guide - BookIT Safari

## Overview

The platform has been seeded with **6 fully operational bus operators** across different regions of Tanzania. Each operator has buses, routes, and schedules ready for testing. This guide shows you how to access and test all the operator functionalities.

---

## Quick Start: Test Operator Account

### Option 1: Use the Seeded Test Account (Existing)

**Account Details:**
- **Email:** dndubussa@gmail.com
- **Operator:** Kilimanjaro Express (Approved Status)
- **Company Email:** info@kilimanjaroexpress.co.tz
- **Status:** ✅ Approved
- **Location:** Ubungo Bus Terminal, Dar es Salaam

### Option 2: Register a New Operator Account

1. Go to **Header Navigation** → Click **"Find Buses"** → **"Become a Partner"** (or navigate to `/partner`)
2. Fill in the operator registration form:
   - **Company Name:** Your test company name
   - **Contact Email:** your-test-email@example.com
   - **Contact Phone:** +255712345678
   - **License Number:** TEST-2025-001
   - **Address:** Your test location
   - **Description:** Test bus operator for platform functionality

3. Submit form (status starts as **Pending**)
4. Admin approval needed for full access

---

## Available Test Operators

All 6 operators below are **already seeded** and **approved** for testing:

### 1. **Kilimanjaro Express** 🚌 (Dar-based)
- **Status:** ✅ Approved
- **Email:** info@kilimanjaroexpress.co.tz
- **Phone:** +255712345678
- **License:** LIC-2024-KE-001
- **Buses:** 3 (different layouts and amenities)
- **Routes:** 2 (Dar↔Arusha, Dar↔Mwanza, Dar↔Dodoma)
- **Schedules:** 3 active trips
- **Commission Rate:** 10%

**Buses:**
- KE-001 (T123 ABC): Luxury, 57 seats, Standard Layout
- KE-002 (T124 DEF): Luxury, 53 seats, Compact Layout
- KE-003 (T125 GHI): Semi Luxury, 56 seats

**Amenities:** USB Charging, TV, AC, Refreshments, Toilet, WiFi

---

### 2. **Scandinavian Express** 🚌 (Arusha-based)
- **Status:** ✅ Approved
- **Email:** contact@scandinavianexpress.co.tz
- **Phone:** +255765432109
- **License:** LIC-2024-SE-001
- **Buses:** 2 (different capacities)
- **Routes:** 2 (Arusha↔Dar, Arusha↔Moshi, Arusha↔Mwanza)
- **Schedules:** 3 active trips
- **Commission Rate:** 10%

**Buses:**
- SE-001 (T456 JKL): Luxury, 53 seats, Compact Layout
- SE-002 (T457 MNO): Semi Luxury, 57 seats, Standard Layout

**Amenities:** USB Charging, AC, Refreshments, WiFi

---

### 3. **Safari Star Coaches** 🚌 (Mwanza-based)
- **Status:** ✅ Approved
- **Email:** bookings@safaristarchcoaches.co.tz
- **Phone:** +255754567890
- **License:** LIC-2024-SSC-001
- **Buses:** 2
- **Routes:** 2 (Mwanza↔Dar, Mwanza↔Dodoma)
- **Schedules:** 2 active trips
- **Commission Rate:** 10%

**Buses:**
- SSC-001 (T789 PQR): Standard, 56 seats
- SSC-002 (T790 STU): Standard, 57 seats

**Amenities:** AC, Refreshments

---

### 4. **Coastal Routes Ltd** 🚌 (Dodoma-based)
- **Status:** ✅ Approved
- **Email:** info@coastalroutes.co.tz
- **Phone:** +255789123456
- **License:** LIC-2024-CR-001
- **Buses:** 1
- **Routes:** 2 (Dodoma↔Dar, Dodoma↔Arusha)
- **Schedules:** 2 active trips
- **Commission Rate:** 10%

**Buses:**
- CR-001 (T901 VWX): Luxury, 57 seats, Standard Layout

**Amenities:** USB Charging, AC, Refreshments, WiFi

---

### 5. **Kilimanjaro Peak Shuttles** 🚌 (Kilimanjaro-based)
- **Status:** ✅ Approved
- **Email:** reservations@peakshuttles.co.tz
- **Phone:** +255712890123
- **License:** LIC-2024-KPS-001
- **Buses:** 1
- **Routes:** 2 (Moshi↔Arusha, Moshi↔Dar)
- **Schedules:** 2 active trips
- **Commission Rate:** 10%

**Buses:**
- KPS-001 (T234 YZA): Luxury, 53 seats, Compact Layout

**Amenities:** USB Charging, TV, AC, Refreshments, Toilet, WiFi

---

### 6. **Safari Express** 🚌 (Additional Operator - High Volume)
- **Status:** ✅ Approved
- **Email:** info@safariexpress.co.tz
- **Phone:** +255765432100
- **License:** LIC-2024-SE-002
- **Buses:** 3
- **Routes:** 6 (Multiple region combinations)
- **Schedules:** 270 active trips (Great for bulk testing!)
- **Commission Rate:** 10%

---

## Header Navigation Testing

Test all the links mentioned in your request:

### 1. **Find Buses** (Hero Section CTA)
- **URL:** `/search`
- **Test:** 
  - Enter departure region: "Dar es Salaam"
  - Enter destination region: "Arusha"
  - Select date: Tomorrow or any future date
  - Click "Search"
  - You should see buses from **Kilimanjaro Express** and **Scandinavian Express**

### 2. **Routes** (Navigation Menu)
- **URL:** `/routes`
- **Test:**
  - See all available routes from all operators
  - Verify route information:
    - Departure/Arrival terminals
    - Distance in kilometers
    - Estimated duration
    - Operating operator
  - Click on any route to see more details

### 3. **Operators** (Navigation Menu)
- **URL:** `/operators`
- **Test:**
  - View all 6 approved operators
  - See operator details:
    - Company name
    - Logo
    - Description
    - Contact information
    - Number of buses and routes
    - Commission rate
  - Click on operator to view their buses and routes

---

## Testing Scenarios

### Scenario 1: Search & Book a Bus
1. Go to **"Find Buses"** in header
2. Search: Dar → Arusha (Tomorrow)
3. You'll see buses from:
   - **Kilimanjaro Express** (2 trips at 08:00 & 14:00)
   - **Scandinavian Express** (1 trip at 07:00)
4. Click on any bus to see seat layout
5. Select seats and complete booking flow

**Expected Data:**
- Kilimanjaro Express KE-001: 57 seats available, TZS 45,000
- Kilimanjaro Express KE-002: 53 seats available, TZS 50,000
- Scandinavian Express SE-001: 53 seats available, TZS 48,000

---

### Scenario 2: Browse Available Routes
1. Navigate to **"Routes"** in header/navigation
2. View all 10 available routes:
   - 3 routes by **Kilimanjaro Express**
   - 3 routes by **Scandinavian Express**
   - 2 routes by **Safari Star Coaches**
   - 2 routes by **Coastal Routes Ltd**
   - 2 routes by **Kilimanjaro Peak Shuttles**
   - 6 routes by **Safari Express**

**Test Each Route:**
- Verify correct terminals
- Check distance and duration
- Confirm operator information
- Check "is_active" status

---

### Scenario 3: Explore All Operators
1. Navigate to **"Operators"** in header
2. View all 6 approved operators
3. For each operator, verify:
   - Company name and logo
   - Contact email and phone
   - License number
   - Address/location
   - Number of buses
   - Number of routes
   - Commission rate

4. Click on operator card to see:
   - All their buses
   - All their routes
   - Available schedules
   - Contact information

---

### Scenario 4: Test Different Seat Layouts
The seeded buses have different layouts for testing:

**Layout 1 (Standard - 2-2 with aisles):**
- Buses: KE-001 (57 seats), KE-003 (56 seats), SE-002 (57 seats), CR-001 (57 seats)
- Pattern: 2 seats, aisle, 2 seats on each side, plus back 5 seats
- **Test:** Book seats A1, A3 to test aisle separation

**Layout 2 (Compact - 4-4):**
- Buses: KE-002 (53 seats), SE-001 (53 seats), KPS-001 (53 seats)
- Pattern: 4 seats on each side, plus special back section
- **Test:** Book seats to test compact seating

---

## Database Information

### Current Data Stats
- **Total Operators:** 6 (all approved)
- **Total Buses:** 12 (across all operators)
- **Total Routes:** 20 (covering various region combinations)
- **Total Schedules:** 284 (active trips for booking)
- **Regions Covered:** Dar es Salaam, Arusha, Mwanza, Dodoma, Kilimanjaro

### Key Tables
- `bus_operators` - All operator information
- `buses` - Bus details with seat layouts
- `routes` - Route information
- `schedules` - Specific trips and availability
- `bookings` - Test bookings (empty for new testing)
- `passengers` - Passenger details

---

## Common Testing Queries

### Find All Routes for an Operator
```sql
SELECT r.*, bo.company_name
FROM routes r
JOIN bus_operators bo ON r.operator_id = bo.id
WHERE bo.company_name = 'Kilimanjaro Express';
```

### Find Available Schedules Tomorrow
```sql
SELECT s.*, r.departure_terminal, r.arrival_terminal, bo.company_name
FROM schedules s
JOIN routes r ON s.route_id = r.id
JOIN bus_operators bo ON r.operator_id = bo.id
WHERE s.departure_date = CURRENT_DATE + INTERVAL '1 day'
AND s.is_active = true
ORDER BY bo.company_name, s.departure_time;
```

### Find Buses for Specific Operator
```sql
SELECT b.*, bo.company_name
FROM buses b
JOIN bus_operators bo ON b.operator_id = bo.id
WHERE bo.company_name = 'Kilimanjaro Express'
AND b.is_active = true;
```

---

## Troubleshooting

### Issue: Routes not showing in search
- **Check:** Search dates are future dates (CURRENT_DATE + days)
- **Check:** Schedules have `is_active = true`
- **Check:** Selected regions have routes between them

### Issue: Operator not showing
- **Check:** Operator status is "approved"
- **Check:** Operator has at least one active bus and route

### Issue: Seats not displaying correctly
- **Check:** `seat_layout_config` is valid JSON
- **Check:** Bus has `is_active = true`
- **Check:** Schedule has `available_seats > 0`

---

## Next Steps for Testing

1. ✅ **View all operators** - Navigate to `/operators` page
2. ✅ **Browse routes** - Check `/routes` page for all available routes
3. ✅ **Search for buses** - Use "Find Buses" to search specific routes
4. ✅ **Complete a booking** - Test full booking flow
5. ✅ **Check Dashboard** - View operator dashboard if authenticated
6. ✅ **Test admin functions** - If admin access available

---

## Important Links

- **Search Page:** `/search`
- **Routes Page:** `/routes`
- **Operators Page:** `/operators`
- **Operator Register:** `/partner`
- **Operator Dashboard:** `/operator/dashboard` (requires login)
- **Admin Dashboard:** `/admin/dashboard` (requires admin role)

---

## Contact & Support

For issues or questions about the test data:
- Check the seed.sql file for complete data
- Review the database schema in Supabase dashboard
- Contact the development team for schema changes

---

**Last Updated:** January 3, 2026  
**Test Environment:** Development/Staging  
**Data Status:** ✅ Fully Seeded and Operational
