# PopularRoutes 400 Error Fix

## Issue
When clicking "View Buses" on popular routes cards, the application was returning a 400 error from the `get_active_schedules` RPC endpoint.

## Root Cause
The `POPULAR_ROUTES` constant was using region **display names** (e.g., "Dar es Salaam") as the `from` and `to` values. When these were passed to the SearchResults page via URL parameters, they were treated as region IDs and passed to the API, which expected valid UUIDs instead of display names.

### Data Flow of the Bug:
1. PopularRoutes component rendered with: `/search?from=Dar es Salaam&to=Arusha`
2. SearchResults received "Dar es Salaam" (a display name, not a region ID)
3. `useSearchSchedules` attempted to use this as `fromRegionId`
4. API called RPC with invalid string instead of UUID: `p_departure_region_id: "Dar es Salaam"`
5. RPC function expected UUID, returned 400 error

## Solution
Updated the application to use region **IDs** instead of display names, with separate fields for display:

### Changes Made:

#### 1. Updated POPULAR_ROUTES Constant (src/lib/constants.ts)
Changed from:
```typescript
{
  id: 1,
  from: 'Dar es Salaam',
  to: 'Arusha',
  duration: '9-10 hrs',
  image: '/placeholder.svg',
}
```

To:
```typescript
{
  id: 1,
  from: 'dar-es-salaam',        // Region ID (lowercase, hyphenated)
  to: 'arusha',                 // Region ID (lowercase, hyphenated)
  fromName: 'Dar es Salaam',    // Display name
  toName: 'Arusha',            // Display name
  duration: '9-10 hrs',
  image: '/placeholder.svg',
}
```

#### 2. Updated PopularRoutes Component Display (src/components/PopularRoutes.tsx)
Changed display from:
```tsx
<p className="text-lg font-semibold text-foreground">{route.from}</p>
<p className="text-lg font-semibold text-foreground">{route.to}</p>
```

To:
```tsx
<p className="text-lg font-semibold text-foreground">{route.fromName}</p>
<p className="text-lg font-semibold text-foreground">{route.toName}</p>
```

The link generation remained unchanged:
```tsx
<Link to={`/search?from=${route.from}&to=${route.to}`}>
  View Buses
</Link>
```

Now this correctly generates: `/search?from=dar-es-salaam&to=arusha` (with region IDs)

## Region ID Mapping
- `dar-es-salaam` → "Dar es Salaam"
- `arusha` → "Arusha"
- `mwanza` → "Mwanza"
- `kilimanjaro` → "Moshi"
- `dodoma` → "Dodoma"
- `mbeya` → "Mbeya"

## Data Flow After Fix:
1. PopularRoutes renders display names: "Dar es Salaam to Arusha"
2. User clicks "View Buses"
3. Navigates to: `/search?from=dar-es-salaam&to=arusha` (with region IDs)
4. SearchResults receives region IDs and passes them to `useSearchSchedules`
5. API calls RPC with valid region ID parameters
6. RPC function correctly filters schedules and returns results

## Build Status
✅ Build successful (9.44s) - No TypeScript or compilation errors

## Testing Required
- [ ] Homepage loads correctly
- [ ] Popular routes section displays with correct region names
- [ ] Click "View Buses" on any popular route
- [ ] SearchResults page loads and displays schedules
- [ ] No 400 errors in browser console
- [ ] Schedules match the selected route

## Files Modified
- `src/lib/constants.ts` - Updated POPULAR_ROUTES constant
- `src/components/PopularRoutes.tsx` - Updated display to use `fromName`/`toName`

## Related Issues Fixed
- Previously fixed: RPC function improved to remove date filtering constraint (migration: `improve_get_active_schedules_logic`)
