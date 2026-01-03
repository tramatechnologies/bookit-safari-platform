# Operator Dashboard Integration - Real-Time Trip Management

## Overview

The operator dashboard has been enhanced with:
1. **Real-Time Seat Availability** - Live updates of available seats across all trips
2. **Trip Management Integration** - Generate and manage trips directly from the schedules page
3. **Real-time Supabase Subscriptions** - Automatic updates when bookings change or seats are updated

## Features Implemented

### 1. Real-Time Seat Availability Component

**File**: `src/components/RealtimeSeatAvailability.tsx`

Shows live seat availability across operator's trips with:
- **Categorized Display**: Trips grouped by availability status
  - Green: 20+ seats (Available Now)
  - Amber: 10-19 seats (Limited Availability)
  - Red: <10 seats (Filling Up Fast)
- **Live Updates**: Uses Supabase Realtime to update when:
  - New bookings are made
  - Seats are updated
  - Trip status changes
- **Visual Indicators**: 
  - Status badges (scheduled, completed, etc.)
  - Color-coded availability levels
  - Total available seats summary

### 2. Real-Time Subscription Hook

**File**: `src/hooks/use-realtime-trips.ts`

Three powerful hooks for real-time updates:

#### `useRealtimeTrips(scheduleIds)`
- Subscribes to all trips for multiple schedules
- Watches for any changes (INSERT, UPDATE, DELETE)
- Automatically invalidates React Query cache
- Provides `tripUpdates` object with latest trip data

```tsx
const { tripUpdates, activeSubscriptions } = useRealtimeTrips(scheduleIds);
```

#### `useRealtimeScheduleTrips(scheduleId)`
- Single schedule subscription
- Returns connection status
- Minimal overhead for focused monitoring

```tsx
const { isConnected } = useRealtimeScheduleTrips(scheduleId);
```

### 3. Enhanced Operator Schedules Page

**File**: `src/pages/OperatorSchedules.tsx`

New capabilities:
- **Trip Generation**: Generate trips for upcoming dates directly from each schedule
- **Live Trip Display**: Shows all generated trips with real-time seat counts
- **Trip Management**:
  - Click schedule to expand and see trips
  - View trip dates and available seats
  - Real-time seat availability with live indicator
  - Configurable days ahead for trip generation (1-365 days)
  
**Features**:
- Expandable schedule sections showing generated trips
- Real-time connection indicator (green Zap icon when connected)
- Trip count summary per schedule
- Generate trips with custom day range

### 4. Enhanced Operator Dashboard

**File**: `src/pages/OperatorDashboard.tsx`

New sections:
- **Real-Time Seat Availability Widget**:
  - Displays top 10 upcoming trips
  - Shows total available seats across all schedules
  - Categorizes trips by availability status
  - Updates in real-time as bookings happen

- **Enhanced Quick Actions**: Added "Manage Schedules" link with direct access to trip generation

## How It Works

### Data Flow

```
Database (Supabase) 
    ↓
React Query (Initial Fetch)
    ↓
Realtime Subscription (listen for changes)
    ↓
Update Component State
    ↓
UI Re-renders with Latest Data
```

### Real-Time Updates Trigger

1. **Booking Created/Updated**:
   - Supabase `bookings` table changes
   - Realtime subscription triggers
   - All trip queries invalidated
   - Component re-renders with new seat counts

2. **Trip Status Changed**:
   - Supabase `trips` table changes
   - Realtime subscription detects change
   - Component updates trip status badge

3. **Manual Trip Generation**:
   - Operator clicks "Generate More Trips"
   - Database function creates new trip records
   - Realtime subscription picks up new trips
   - Component displays new trips immediately

## Usage Examples

### Display Real-Time Seat Availability

```tsx
import { RealtimeSeatAvailability } from '@/components/RealtimeSeatAvailability';

export function Dashboard() {
  const scheduleIds = ['schedule-1', 'schedule-2', 'schedule-3'];
  
  return (
    <RealtimeSeatAvailability 
      scheduleIds={scheduleIds}
      className="mt-8"
    />
  );
}
```

### Subscribe to Trip Changes

```tsx
import { useRealtimeTrips } from '@/hooks/use-realtime-trips';

export function TripMonitor() {
  const scheduleIds = ['schedule-1', 'schedule-2'];
  const { tripUpdates, activeSubscriptions } = useRealtimeTrips(scheduleIds);
  
  console.log('Active subscriptions:', activeSubscriptions.length);
  console.log('Latest trip data:', tripUpdates);
}
```

### Generate Trips from Schedule

```tsx
// In OperatorSchedules page, click "Generate More Trips"
// Specify days ahead (1-365)
// Database function creates trip records
// Realtime subscription picks up new trips
// UI updates automatically
```

## Database Integration

All data fetched from real database:
- **Routes**: `get_operator_routes()` RPC function
- **Schedules**: Direct table queries with route filtering
- **Trips**: Real-time subscriptions on `trips` table
- **Bookings**: Real-time subscriptions on `bookings` table

## Real-Time Features

### Subscription Management
- Automatic cleanup on component unmount
- No memory leaks
- Multiple subscriptions per page managed independently
- Connection status monitoring

### Performance
- Uses Supabase Realtime filters to minimize data transfer
- Only subscribed to relevant tables
- Efficient React Query cache invalidation
- Minimal re-renders through proper dependency tracking

### Error Handling
- Try-catch blocks for trip generation
- User-friendly error messages
- Fallback UI when data unavailable
- Connection status indicators

## Deployment Checklist

✅ Real-time hook created and tested
✅ RealtimeSeatAvailability component integrated
✅ OperatorSchedules page enhanced with trip management
✅ OperatorDashboard updated with real-time widget
✅ All TypeScript types properly defined
✅ Build passes without errors
✅ All database functions working
✅ Realtime subscriptions properly initialized and cleaned up

## Testing the Integration

### Test Real-Time Updates

1. **Open operator dashboard** in browser
2. **Open second browser tab** with booking creation
3. **Make a booking** for one of operator's trips
4. **Watch dashboard** - seat count should decrease in real-time
5. **Verify**: No page refresh needed, updates happen instantly

### Test Trip Generation

1. **Navigate** to /operator/schedules
2. **Click a schedule** to expand it
3. **Click "Generate More Trips"**
4. **Specify days** (e.g., 30)
5. **Watch trips appear** in real-time
6. **Verify**: Green indicator shows live connection

### Test Real-Time Seat Availability

1. **Check dashboard** seat availability widget
2. **Make multiple bookings** in another tab
3. **Watch** total available seats decrease in real-time
4. **Verify**: Trips move between categories as availability changes

## Architecture Benefits

- **Scalable**: Real-time features work across hundreds of schedules
- **Efficient**: Only subscribed to relevant data changes
- **Responsive**: Instant UI updates without polling
- **Reliable**: Proper error handling and fallbacks
- **Maintainable**: Clear separation of concerns
- **Type-Safe**: Full TypeScript support throughout

## Future Enhancements

- Automatic trip generation scheduler (daily/weekly)
- Trip analytics dashboard
- Booking analytics by trip
- Driver assignment for trips
- Trip status management UI
- Batch trip generation for multiple schedules
- Trip income forecasting
- Performance metrics per trip

## Support & Troubleshooting

### Realtime not updating?
- Check Supabase project has Realtime enabled
- Verify user has proper permissions
- Check browser console for connection errors
- Confirm scheduleIds are valid UUIDs

### No trips appearing?
- Verify schedule is active (is_active = true)
- Check if trips were generated (check database directly)
- Try clicking "Generate More Trips" button
- Check for RPC function errors in console

### Performance issues?
- Limit schedules being monitored (use filter)
- Reduce frequency of trip queries
- Use pagination for large trip lists
- Consider moving analytics to separate endpoint

## Related Files

- `src/hooks/use-realtime-trips.ts` - Realtime subscription hooks
- `src/components/RealtimeSeatAvailability.tsx` - Live seat availability display
- `src/pages/OperatorSchedules.tsx` - Schedule and trip management
- `src/pages/OperatorDashboard.tsx` - Dashboard with real-time widget
- `src/lib/api/trips.ts` - Trip API methods
- `src/hooks/use-trips.ts` - Trip React Query hooks
