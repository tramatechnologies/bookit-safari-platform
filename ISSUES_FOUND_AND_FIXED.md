# Issues Found and Fixed

## Date: January 2026

## Critical Issues Fixed

### 1. ✅ **Memory Leak in Payment Polling** (CRITICAL)
**File**: `src/pages/Payment.tsx`

**Issue**: 
- `setInterval` was created inside `handlePayment` function without proper cleanup
- If user navigated away or component unmounted, the interval would continue running forever
- Caused memory leaks and unnecessary API calls

**Fix**:
- Moved polling logic to a `useEffect` hook with proper cleanup
- Added `shouldPoll` state to control when polling should occur
- Properly clears intervals and timeouts when component unmounts
- Added `isMounted` checks to prevent state updates after unmount

**Severity**: CRITICAL (Memory leak, performance issue)

---

### 2. ✅ **Booking Number Not Generated** (CRITICAL)
**File**: `supabase/migrations/fix_booking_number_generation.sql`

**Issue**:
- `booking_number` column is required (NOT NULL) but no default value
- Frontend doesn't provide `booking_number` when creating bookings
- Would cause booking creation to fail with database constraint violation

**Fix**:
- Created `generate_booking_number()` function to generate unique booking numbers
- Created `set_booking_number()` trigger function
- Added `set_booking_number_trigger` BEFORE INSERT trigger
- Automatically generates `BOOKIT-YYMMDD-XXXXXX` format if not provided
- Updated existing trigger to use BOOKIT- format instead of STZ-

**Severity**: CRITICAL (Booking creation would fail)

---

### 3. ✅ **Trigger Conflict for Booking Number** (HIGH)
**File**: `supabase/migrations/fix_booking_number_trigger_conflict.sql`

**Issue**:
- Two triggers existed: `set_booking_number_trigger` and `trigger_set_booking_reference`
- Both tried to set `booking_number` but used different formats
- Could cause conflicts or inconsistent booking numbers

**Fix**:
- Dropped old trigger
- Updated `set_booking_reference()` function to use `generate_booking_number()`
- Ensured single trigger with consistent BOOKIT- format

**Severity**: HIGH (Data inconsistency)

---

## Potential Issues Identified

### 4. ⚠️ **Simplified Seat Availability Check** (MEDIUM)
**File**: `src/pages/Booking.tsx` (line 50)

**Issue**:
```typescript
available: i <= availableSeats, // Simplified - in real app, check against booked seats
```

**Problem**:
- Only checks if seat number is <= total available seats
- Doesn't check which specific seats are already booked
- Could show seats as available when they're actually booked
- Multiple users could select the same seat

**Recommendation**:
- Query actual booked seats for the schedule/trip
- Check `seat_numbers` array in confirmed bookings
- Mark specific seats as unavailable, not just count

**Severity**: MEDIUM (Could cause double booking)

---

### 5. ⚠️ **Missing Trip Creation Logic** (MEDIUM)
**Issue**: 
- Database has both `schedules` (templates) and `trips` (instances for specific dates)
- Bookings reference `schedule_id` directly, not `trip_id`
- Original migration shows bookings should use `trip_id`, but actual database has `schedule_id`

**Current State**:
- Database actually has `schedule_id` column (nullable)
- Frontend uses `schedule_id` when creating bookings
- This might be intentional simplification, but could cause issues with:
  - Date-specific bookings
  - Available seats per date
  - Multiple bookings on same schedule for different dates

**Recommendation**:
- Verify if this is intentional design decision
- If using trips, need to create trip for specific date before booking
- If using schedules directly, ensure available seats are calculated per date

**Severity**: MEDIUM (Design decision needed)

---

### 6. ⚠️ **Payment Status Check Uses Stale State** (LOW)
**File**: `src/pages/Payment.tsx` (line 156)

**Issue**:
```typescript
if (isMounted && paymentStatus === 'processing') {
```

**Problem**:
- Uses `paymentStatus` from closure, which might be stale
- Should use functional state update or check current state

**Recommendation**:
- Use functional state update: `setPaymentStatus(prev => prev === 'processing' ? ...)`
- Or use a ref to track current status

**Severity**: LOW (Minor bug, unlikely to cause issues)

---

## Summary

### Fixed Issues:
1. ✅ Memory leak in payment polling
2. ✅ Booking number auto-generation
3. ✅ Trigger conflict resolution

### Identified Issues (Not Fixed):
1. ⚠️ Simplified seat availability check
2. ⚠️ Schedule vs Trip design decision
3. ⚠️ Stale state in payment timeout

### Next Steps:
1. Review seat availability logic - implement proper seat booking check
2. Clarify schedule vs trip architecture
3. Test booking creation end-to-end
4. Monitor for any booking_number generation issues

---

**Last Updated**: January 2026

