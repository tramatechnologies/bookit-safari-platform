# Test Operator Data Summary

## Operator Information

### Safari Express
- **Company Name**: Safari Express
- **Email**: info@safariexpress.co.tz
- **Phone**: +255 744 123 456
- **Status**: ✅ Approved
- **Commission Rate**: 10%
- **Created**: 2026-01-01

---

## Buses (3 Total)

1. **BUS-001**
   - Type: Luxury
   - Total Seats: 45

2. **BUS-002**
   - Type: Semi-Luxury
   - Total Seats: 50

3. **BUS-003**
   - Type: Standard
   - Total Seats: 45

---

## Routes (6 Total)

All routes depart from **Dar es Salaam**:

1. **Dar es Salaam → Mbeya**
   - Distance: 850 km

2. **Dar es Salaam → Tanga**
   - Distance: 350 km

3. **Dar es Salaam → Kilimanjaro**
   - Distance: 520 km

4. **Dar es Salaam → Arusha**
   - Distance: 550 km

5. **Dar es Salaam → Mwanza**
   - Distance: 1,100 km

6. **Dar es Salaam → Dodoma**
   - Distance: 450 km

---

## Schedules

- **Total Schedules**: 270 schedules
- **Sample Schedule**: 
  - Route: Dar es Salaam → Mbeya
  - Bus: BUS-001 (Luxury, 45 seats)
  - Departure Time: 09:00
  - Arrival Time: 19:30
  - Price: TZS 55,000
  - Available Seats: 45

---

## Summary

✅ **1 Operator** (Safari Express - Approved)
✅ **3 Buses** (Luxury, Semi-Luxury, Standard)
✅ **6 Routes** (All from Dar es Salaam to major cities)
✅ **270 Schedules** (Available for booking)

The operator is **approved** and should be visible on the `/operators` page and available for booking.

---

## Testing the Booking Flow

You can test the complete booking flow with:

1. **Search for a trip**: 
   - From: Dar es Salaam
   - To: Any of the 6 destinations (Mbeya, Tanga, Kilimanjaro, Arusha, Mwanza, Dodoma)
   - Date: Any future date

2. **Select a schedule** from Safari Express

3. **Complete booking** with seat selection

4. **Process payment** via ClickPesa

---

## Notes

- All routes originate from Dar es Salaam
- The operator has schedules for multiple dates
- Commission rate is set to 10%
- Operator status is "approved" so it should be visible to all users

