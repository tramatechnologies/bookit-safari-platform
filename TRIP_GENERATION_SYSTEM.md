# Trip Generation System

## Overview

The Trip Generation System automatically creates **trips** from **schedules** for upcoming dates. This system enables:

- Automatic trip creation for all active schedules
- Batch trip generation for specific date ranges
- Trip status tracking (scheduled, in_progress, completed, cancelled)
- Available seat management per trip
- Trip statistics and reporting

## Architecture

### Database Structure

**Trips Table:**
```typescript
trips {
  id: UUID (primary key)
  schedule_id: UUID (foreign key to schedules)
  trip_date: DATE
  available_seats: INTEGER
  status: TEXT ('scheduled' | 'in_progress' | 'completed' | 'cancelled')
  created_at: TIMESTAMP
}
```

### Key Components

#### 1. **PL/pgSQL Functions** (Database Layer)

**`generate_trips_from_schedules(p_days_ahead, p_schedule_id)`**
- Generates trips from schedules for upcoming dates
- Takes parameters:
  - `p_days_ahead`: Number of days to generate trips for (1-365)
  - `p_schedule_id`: Optional - generate for specific schedule only
- Returns: List of generated trips with details
- Automatically skips duplicate trips (same schedule + date)

**`generate_recurring_trips(p_days_ahead)`**
- Wrapper function to generate trips for all active schedules
- Returns: Statistics (count, date range)

#### 2. **Edge Function** (`generate-trips`)

HTTP endpoint for trip generation:
- **URL:** `POST /functions/v1/generate-trips`
- **Auth:** Requires valid JWT token
- **Payload:**
  ```json
  {
    "daysAhead": 30,
    "scheduleId": null
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "trips_generated": 42,
    "trips": [
      {
        "generated_trip_id": "uuid",
        "schedule_id": "uuid",
        "trip_date": "2026-01-15",
        "available_seats": 57,
        "status": "scheduled"
      }
    ]
  }
  ```

#### 3. **TypeScript API Layer** (`src/lib/api/trips.ts`)

Provides high-level functions:

```typescript
// Generate trips from schedules
await tripsApi.generateTripsFromSchedules(daysAhead, scheduleId)

// Generate for all schedules
await tripsApi.generateRecurringTrips(daysAhead)

// Get trips by date range
await tripsApi.getTripsByDateRange(startDate, endDate)

// Get upcoming trips for a schedule
await tripsApi.getUpcomingTripsForSchedule(scheduleId, daysAhead)

// Get trip by ID
await tripsApi.getTripById(tripId)

// Update trip status
await tripsApi.updateTripStatus(tripId, status)

// Update available seats
await tripsApi.updateTripAvailableSeats(tripId, availableSeats)

// Get statistics
await tripsApi.getTripStatistics(startDate, endDate)
```

#### 4. **React Hooks** (`src/hooks/use-trips.ts`)

```typescript
// Generate trips
const { mutate, isPending } = useGenerateTripsFromSchedules()

// Generate recurring
const { mutate, isPending } = useGenerateRecurringTrips()

// Get trips by date range
const { data: trips, isLoading } = useTripsByDateRange(startDate, endDate)

// Get upcoming trips for schedule
const { data: trips, isLoading } = useUpcomingTripsForSchedule(scheduleId, daysAhead)

// Get single trip
const { data: trip, isLoading } = useTrip(tripId)

// Update trip status
const { mutate, isPending } = useUpdateTripStatus()

// Update available seats
const { mutate, isPending } = useUpdateTripAvailableSeats()

// Get statistics
const { data: stats, isLoading } = useTripStatistics(startDate, endDate)
```

#### 5. **UI Components** (`src/components/TripGenerator.tsx`)

React component for trip generation:

```tsx
<TripGenerator
  scheduleId="optional-schedule-id"
  onSuccess={(message) => console.log(message)}
  onError={(error) => console.error(error)}
/>
```

#### 6. **Client Utilities** (`src/lib/trip-generator.ts`)

Helper functions:

```typescript
// Trigger trip generation
await triggerTripGeneration({ daysAhead: 30, scheduleId: 'uuid' })

// Generate with retry logic
await generateTripsWithRetry({ daysAhead: 30 }, maxRetries)

// Schedule automatic generation (client-side timer)
const cleanup = scheduleAutomaticTripGeneration(
  intervalMs,
  daysAhead,
  onSuccess,
  onError
)
```

## Usage Examples

### 1. Generate Trips from Component

```tsx
import { TripGenerator } from '@/components/TripGenerator';

export function MyPage() {
  return (
    <TripGenerator
      onSuccess={(msg) => toast.success(msg)}
      onError={(err) => toast.error(err)}
    />
  );
}
```

### 2. Generate Trips Programmatically

```tsx
import { useGenerateRecurringTrips } from '@/hooks/use-trips';

function OperatorDashboard() {
  const generateTrips = useGenerateRecurringTrips();

  const handleGenerateWeek = async () => {
    try {
      const result = await generateTrips.mutateAsync({ daysAhead: 7 });
      console.log(`Generated ${result.generated_trips} trips`);
    } catch (error) {
      console.error('Failed to generate trips:', error);
    }
  };

  return (
    <button onClick={handleGenerateWeek} disabled={generateTrips.isPending}>
      Generate Weekly Trips
    </button>
  );
}
```

### 3. Get Trips for Display

```tsx
import { useTripsByDateRange } from '@/hooks/use-trips';
import { format } from 'date-fns';

function TripsCalendar() {
  const startDate = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  const { data: trips, isLoading } = useTripsByDateRange(startDate, endDate);

  return (
    <div>
      {trips?.map((trip) => (
        <div key={trip.id}>
          <p>Trip: {trip.trip_date}</p>
          <p>Status: {trip.status}</p>
          <p>Available Seats: {trip.available_seats}</p>
        </div>
      ))}
    </div>
  );
}
```

### 4. Update Trip Status

```tsx
import { useUpdateTripStatus } from '@/hooks/use-trips';

function TripCard({ trip }) {
  const updateStatus = useUpdateTripStatus();

  const handleStartTrip = async () => {
    try {
      await updateStatus.mutateAsync({
        tripId: trip.id,
        status: 'in_progress',
      });
    } catch (error) {
      console.error('Failed to update trip:', error);
    }
  };

  return (
    <button onClick={handleStartTrip} disabled={updateStatus.isPending}>
      Start Trip
    </button>
  );
}
```

## Workflow

### Typical Trip Generation Flow

```
1. Schedule created with route, bus, date, time, price
   └─ Schedule.departure_date = '2026-01-15'

2. Operator triggers trip generation
   └─ TripGenerator component → useGenerateTripsFromSchedules hook

3. Edge Function called with parameters
   └─ POST /functions/v1/generate-trips
   └─ { daysAhead: 30, scheduleId: null }

4. Database function generates trips
   └─ For each active schedule in DB
   └─ For each day in date range
   └─ Create trip if not already exists

5. Trips created in database
   └─ trips.schedule_id = schedule.id
   └─ trips.trip_date = upcoming date
   └─ trips.available_seats = bus.total_seats
   └─ trips.status = 'scheduled'

6. Response returned to client
   └─ { success: true, trips_generated: 42, trips: [...] }

7. Trips now available for booking
   └─ Bookings reference trip_id (indirectly via schedule)
   └─ Trip.available_seats decremented as bookings made
```

## Database Functions Details

### `generate_trips_from_schedules`

**Purpose:** Create trip records from schedule definitions

**Parameters:**
- `p_days_ahead` (INTEGER, default 30): Days to generate trips for
- `p_schedule_id` (UUID, optional): Specific schedule or all schedules

**Logic:**
1. For each day in the date range (0 to p_days_ahead)
2. Get all active schedules (or specific one if provided)
3. Check if trip already exists for that schedule + date
4. If not exists, create new trip:
   - `schedule_id` from schedule
   - `trip_date` from loop iteration
   - `available_seats` from bus.total_seats
   - `status` = 'scheduled'
5. Return array of created trips

**Returns:**
```sql
RETURNS TABLE (
  generated_trip_id UUID,
  schedule_id UUID,
  trip_date DATE,
  available_seats INTEGER,
  status TEXT
)
```

## Automatic Trip Generation

### Method 1: Client-Side Timer (Frontend)

```tsx
import { scheduleAutomaticTripGeneration } from '@/lib/trip-generator';

// In component useEffect
useEffect(() => {
  const cleanup = scheduleAutomaticTripGeneration(
    1000 * 60 * 60, // Every 1 hour
    30, // For 30 days ahead
    (result) => console.log(`Generated ${result.trips_generated} trips`),
    (error) => console.error('Generation failed:', error)
  );

  return cleanup; // Clean up on unmount
}, []);
```

**Pros:** Simple, no backend needed
**Cons:** Only works while user is on page, not reliable

### Method 2: Scheduled Edge Function (Production)

For production, use Supabase Cron Extension or external service:

```sql
-- Enable cron in Supabase
SELECT cron.schedule(
  'generate-daily-trips',
  '0 2 * * *',  -- 2 AM every day
  $$
  SELECT generate_recurring_trips(30)
  $$
);
```

### Method 3: External Service (Recommended)

Create a cron job in your infrastructure (e.g., GitHub Actions, AWS Lambda):

```typescript
// Run daily via cron service
POST /functions/v1/generate-trips
{
  "daysAhead": 30
}
```

## Best Practices

1. **Generate Regularly:** Run trip generation daily or when new schedules are created
2. **Optimize Dates:** Set `daysAhead` to match your booking window (e.g., 60 days)
3. **Monitor Duplicates:** System automatically prevents duplicate trips
4. **Update Status:** Update trip status as bookings are made
5. **Archive Old Trips:** Archive or delete trips older than needed
6. **Performance:** For large schedules (1000+), generate incrementally

## Edge Cases & Solutions

### Case 1: Duplicate Trips
**Problem:** Multiple trip generation runs create duplicates
**Solution:** Database uses `DISTINCT` check, automatically skips existing trips

### Case 2: Schedule Changes
**Problem:** Schedule updated after trips generated
**Solution:** Trips are independent; create new trips for new dates

### Case 3: Seat Management
**Problem:** Available seats not updated with bookings
**Solution:** Use `updateTripAvailableSeats()` when booking is made

## Troubleshooting

### No Trips Generated

1. Check if schedules exist:
   ```sql
   SELECT COUNT(*) FROM public.schedules WHERE is_active = TRUE;
   ```

2. Check if function has correct permissions:
   ```sql
   SELECT has_function_privilege('authenticated', 'public.generate_trips_from_schedules(integer, uuid)', 'EXECUTE');
   ```

3. Verify dates aren't in the past:
   ```sql
   SELECT CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days';
   ```

### Performance Issues

1. Generate for fewer days: `daysAhead = 7` instead of `30`
2. Generate for specific schedules instead of all
3. Add index on `trips(schedule_id, trip_date)`:
   ```sql
   CREATE INDEX idx_trips_schedule_date ON public.trips(schedule_id, trip_date);
   ```

## Security

- ✅ JWT authentication required for Edge Function
- ✅ Service role only for database functions
- ✅ RLS not applicable (system-managed table)
- ✅ No direct client access to function calls

## Future Enhancements

1. **Smart Trip Scheduling:** Predict trip demand and adjust generation
2. **Dynamic Pricing:** Adjust prices based on trip demand
3. **Trip Pooling:** Combine trips with low bookings
4. **Cancellation Automation:** Auto-cancel low-booked trips
5. **Driver Assignment:** Automatically assign drivers to trips
6. **Real-time Updates:** WebSocket for trip availability changes
