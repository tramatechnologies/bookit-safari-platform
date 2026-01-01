# Sample Data for Booking Flow Testing

## Overview

Sample data has been created to test the complete booking flow from search to payment confirmation.

## Created Data

### 1. Bus Operator
- **Company**: Safari Express
- **License**: LIC-2024-001
- **Status**: Approved
- **Commission Rate**: 10%
- **Contact**: info@safariexpress.co.tz, +255 744 123 456

### 2. Buses (3 buses)
- **BUS-001** (T 123 ABC): Luxury, 45 seats, WiFi, AC, USB, Reclining Seats, Entertainment
- **BUS-002** (T 456 DEF): Semi-Luxury, 50 seats, AC, USB
- **BUS-003** (T 789 GHI): Standard, 45 seats, AC

### 3. Routes (6 routes from Dar es Salaam)
1. **Dar es Salaam → Arusha**
   - Distance: 550 km
   - Duration: 8.5 hours
   - Terminal: Ubungo Bus Terminal → Arusha Bus Station

2. **Dar es Salaam → Mwanza**
   - Distance: 1100 km
   - Duration: 12 hours
   - Terminal: Ubungo Bus Terminal → Mwanza Central Bus Station

3. **Dar es Salaam → Dodoma**
   - Distance: 450 km
   - Duration: 6 hours
   - Terminal: Ubungo Bus Terminal → Dodoma Bus Terminal

4. **Dar es Salaam → Mbeya**
   - Distance: 850 km
   - Duration: 10.5 hours
   - Terminal: Ubungo Bus Terminal → Mbeya Bus Station

5. **Dar es Salaam → Tanga**
   - Distance: 350 km
   - Duration: 5 hours
   - Terminal: Ubungo Bus Terminal → Tanga Bus Station

6. **Dar es Salaam → Kilimanjaro (Moshi)**
   - Distance: 520 km
   - Duration: 8 hours
   - Terminal: Ubungo Bus Terminal → Moshi Bus Station

### 4. Schedules
- **30 days** of schedules created (from today onwards)
- **Multiple departures per day** for popular routes
- **Different bus types** and prices
- **All schedules are active** and have available seats

## Sample Schedule Details

### Dar es Salaam → Arusha
- **Morning (6:00 AM)**: Luxury bus, TZS 45,000, 45 seats
- **Afternoon (2:00 PM)**: Semi-Luxury bus, TZS 40,000, 50 seats
- **Evening (8:00 PM)**: Standard bus, TZS 38,000, 45 seats

### Dar es Salaam → Mwanza
- **Daily (7:00 AM)**: Luxury bus, TZS 65,000, 45 seats

### Dar es Salaam → Dodoma
- **Morning (8:00 AM)**: Semi-Luxury bus, TZS 35,000, 50 seats
- **Afternoon (3:00 PM)**: Standard bus, TZS 35,000, 45 seats

### Dar es Salaam → Mbeya
- **Daily (9:00 AM)**: Luxury bus, TZS 55,000, 45 seats

### Dar es Salaam → Tanga
- **Daily (10:00 AM)**: Semi-Luxury bus, TZS 30,000, 50 seats

### Dar es Salaam → Kilimanjaro
- **Daily (11:00 AM)**: Luxury bus, TZS 42,000, 45 seats

## Testing the Booking Flow

### Step 1: Search for Routes
1. Go to homepage
2. Select **From**: Dar es Salaam
3. Select **To**: Arusha (or any other destination)
4. Select **Date**: Today or any date in the next 30 days
5. Click "Search Buses"

### Step 2: View Search Results
- You should see multiple bus options
- Different departure times
- Different prices
- Different bus types (Luxury, Semi-Luxury, Standard)
- Available seats shown

### Step 3: Select a Bus
1. Click on a bus option
2. You'll be redirected to `/booking/[schedule-id]`
3. Seat selection page will load

### Step 4: Select Seats
1. Click on available seats (green)
2. Selected seats turn blue
3. Maximum 5 seats per booking
4. Total price updates automatically

### Step 5: Enter Passenger Details
1. Fill in passenger name
2. Enter phone number
3. Enter email (optional, pre-filled if logged in)
4. Click "Continue to Payment"

### Step 6: Payment
1. Review booking details
2. Select payment method (ClickPesa)
3. Enter mobile number
4. Initiate payment
5. Complete payment on mobile money

### Step 7: Booking Confirmation
1. After successful payment
2. Redirected to confirmation page
3. Booking reference displayed
4. QR code generated
5. Email confirmation sent

## Test Scenarios

### Scenario 1: Single Seat Booking
- Search: Dar es Salaam → Arusha, Tomorrow
- Select: Morning departure (6:00 AM)
- Select: 1 seat
- Price: TZS 45,000
- Complete booking

### Scenario 2: Multiple Seats Booking
- Search: Dar es Salaam → Dodoma, Tomorrow
- Select: Morning departure (8:00 AM)
- Select: 3 seats
- Price: TZS 105,000 (3 × 35,000)
- Complete booking

### Scenario 3: Different Bus Types
- Search: Dar es Salaam → Arusha, Tomorrow
- Compare: Luxury (TZS 45,000) vs Standard (TZS 38,000)
- Select different bus types
- See amenities difference

### Scenario 4: Long Distance Route
- Search: Dar es Salaam → Mwanza, Tomorrow
- Select: 7:00 AM departure
- Price: TZS 65,000
- Duration: 12 hours
- Complete booking

## Data Verification

To verify the sample data was created:

```sql
-- Check operator
SELECT * FROM public.bus_operators WHERE license_number = 'LIC-2024-001';

-- Check buses
SELECT * FROM public.buses WHERE operator_id = (
  SELECT id FROM public.bus_operators WHERE license_number = 'LIC-2024-001'
);

-- Check routes
SELECT 
  r.*,
  dep.name as departure_region,
  arr.name as arrival_region
FROM public.routes r
JOIN public.regions dep ON r.departure_region_id = dep.id
JOIN public.regions arr ON r.destination_region_id = arr.id
WHERE r.operator_id = (
  SELECT id FROM public.bus_operators WHERE license_number = 'LIC-2024-001'
);

-- Check schedules for next 7 days
SELECT 
  s.departure_date,
  s.departure_time,
  s.price_tzs,
  s.available_seats,
  b.bus_type,
  dep.name as from_region,
  arr.name as to_region
FROM public.schedules s
JOIN public.routes r ON s.route_id = r.id
JOIN public.regions dep ON r.departure_region_id = dep.id
JOIN public.regions arr ON r.destination_region_id = arr.id
JOIN public.buses b ON s.bus_id = b.id
WHERE s.departure_date >= CURRENT_DATE
  AND s.departure_date <= CURRENT_DATE + INTERVAL '7 days'
  AND s.is_active = true
ORDER BY s.departure_date, s.departure_time
LIMIT 50;
```

## Notes

- All schedules are created for the **next 30 days**
- All seats are **available** (no bookings yet)
- All schedules are **active**
- Prices are in **Tanzanian Shillings (TZS)**
- Times are in **24-hour format**

## Next Steps

1. Test the search functionality
2. Test seat selection
3. Test booking creation
4. Test payment flow
5. Test booking confirmation
6. Test email notifications

---

**Last Updated**: January 2026

