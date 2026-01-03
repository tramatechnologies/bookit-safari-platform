# API Documentation

## Overview

This document describes the core API modules and utilities used throughout the BookIt Safari application.

## Authentication API (`src/lib/api/auth-rate-limit.ts`)

### Rate-Limited Authentication Functions

#### `rateLimitedSignIn(email: string, password: string)`

Authenticates a user with email and password, with built-in rate limiting to prevent brute force attacks.

**Rate Limits:**
- Max 5 attempts per 15 minutes

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password

**Returns:**
- Promise<AuthResponse> with user and session data

**Throws:**
- Error with code 'RATE_LIMIT_EXCEEDED' if limit exceeded
- Auth error if credentials are invalid

**Example:**
```typescript
try {
  const result = await rateLimitedSignIn('user@example.com', 'password123');
  console.log('User logged in:', result.data.user);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.log(`Try again in ${error.retryAfterSeconds} seconds`);
  }
}
```

#### `rateLimitedSignUp(email: string, password: string, fullName: string)`

Creates a new user account with built-in rate limiting.

**Rate Limits:**
- Max 3 attempts per 1 hour

**Parameters:**
- `email` (string): User's email address
- `password` (string): Password (must meet complexity requirements)
- `fullName` (string): User's full name

**Returns:**
- Promise<AuthResponse> with user and session data

**Throws:**
- Error with code 'RATE_LIMIT_EXCEEDED' if limit exceeded
- Auth error if email already exists or password doesn't meet requirements

**Example:**
```typescript
const result = await rateLimitedSignUp(
  'user@example.com',
  'SecurePass123!',
  'John Doe'
);
```

#### `rateLimitedResetPasswordRequest(email: string)`

Requests a password reset email with built-in rate limiting.

**Rate Limits:**
- Max 3 attempts per 1 hour

**Parameters:**
- `email` (string): User's email address

**Returns:**
- Promise<void>

**Throws:**
- Error with code 'RATE_LIMIT_EXCEEDED' if limit exceeded

**Example:**
```typescript
await rateLimitedResetPasswordRequest('user@example.com');
```

### Rate Limiting Utilities

#### `isRateLimited(action: string, identifier: string, config?: RateLimitConfig)`

Checks if an action is currently rate limited for an identifier.

**Parameters:**
- `action` (string): Action identifier (e.g., 'signin', 'signup')
- `identifier` (string): Unique identifier (e.g., email address, IP)
- `config` (optional): Custom rate limit configuration

**Returns:**
- `{ limited: false }` if not limited
- `{ limited: true, retryAfterSeconds: number }` if limited

**Example:**
```typescript
const { limited, retryAfterSeconds } = isRateLimited('signin', userEmail);
if (limited) {
  console.log(`Try again in ${retryAfterSeconds} seconds`);
}
```

#### `getRemainingAttempts(action: string, identifier: string)`

Gets the number of remaining attempts before rate limiting kicks in.

**Parameters:**
- `action` (string): Action identifier
- `identifier` (string): Unique identifier

**Returns:**
- Number of remaining attempts (0 if already limited)

**Example:**
```typescript
const remaining = getRemainingAttempts('signin', userEmail);
console.log(`You have ${remaining} attempts remaining`);
```

#### `clearRateLimit(action: string, identifier: string)`

Manually clears rate limit for an action/identifier (typically called after successful operation).

**Parameters:**
- `action` (string): Action identifier
- `identifier` (string): Unique identifier

**Example:**
```typescript
// Called automatically after successful sign in
clearRateLimit('signin', userEmail);
```

## Bookings API (`src/lib/api/bookings.ts`)

### Types

#### `BookingWithSchedule`

Represents a booking with full schedule and payment details.

```typescript
interface BookingWithSchedule extends Booking {
  schedule: {
    id: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string | null;
    price_tzs: number;
    route: { /* route details */ };
    bus: { /* bus details */ };
  };
  payments: Array<{
    id: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount_tzs: number;
    payment_method: string;
    completed_at: string | null;
  }>;
}
```

### Methods

#### `bookingsApi.getUserBookings(userId: string)`

Fetches all bookings for a user with associated schedule and payment details.

**Parameters:**
- `userId` (string): The user's ID

**Returns:**
- Promise<BookingWithSchedule[]>

**Example:**
```typescript
const bookings = await bookingsApi.getUserBookings(currentUser.id);
bookings.forEach(booking => {
  console.log(`Booking ${booking.id} for ${booking.schedule.route.from}`);
});
```

## Schedules API (`src/lib/api/schedules.ts`)

Provides methods to search and fetch bus schedules with route and operator information.

### Methods

#### `schedulesApi.searchSchedules(params: SearchScheduleParams)`

Searches for available schedules based on route, date, and other filters.

**Parameters:**
- `departure_region_id` (string): Departure region ID
- `destination_region_id` (string): Destination region ID
- `departure_date` (string): Date in YYYY-MM-DD format
- `limit` (optional): Maximum results to return

**Returns:**
- Promise<ScheduleWithDetails[]>

## Regions API (`src/lib/api/regions.ts`)

Provides methods to fetch Tanzania regions for route filtering.

### Methods

#### `regionsApi.getAllRegions()`

Fetches all available regions in Tanzania.

**Returns:**
- Promise<Region[]>

#### `regionsApi.getPopularRegions()`

Fetches popular/frequently used regions.

**Returns:**
- Promise<Region[]>

## Hooks

### `useAuth()`

Custom hook for authentication state management.

**Returns:**
```typescript
{
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: UserProfile) => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

### `useBookings()`

Custom hook for booking management and fetching.

**Returns:**
```typescript
{
  bookings: BookingWithSchedule[];
  loading: boolean;
  error: Error | null;
  createBooking: (data: BookingData) => Promise<Booking>;
  updateBooking: (id: string, data: Partial<BookingData>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  refetchBookings: () => Promise<void>;
}
```

### `useSchedules()`

Custom hook for searching and fetching schedules.

**Parameters:**
```typescript
interface UseSchedulesParams {
  departure_region_id: string;
  destination_region_id: string;
  departure_date: string;
}
```

**Returns:**
```typescript
{
  schedules: ScheduleWithDetails[];
  loading: boolean;
  error: Error | null;
  search: (params: UseSchedulesParams) => Promise<void>;
}
```

## Error Handling

### `formatAuthError(error: AuthError, context?: ErrorContext)`

Formats authentication errors into user-friendly messages.

**Parameters:**
- `error`: The auth error from Supabase
- `context` (optional): Additional context like 'signin', 'signup'

**Returns:**
```typescript
{
  title: string;      // User-friendly title
  description: string; // Detailed description
  code: string;       // Error code
}
```

## Rate Limiting Configuration

Default rate limit configurations:

```typescript
// Sign In
maxAttempts: 5
windowMs: 15 * 60 * 1000  // 15 minutes

// Sign Up
maxAttempts: 3
windowMs: 60 * 60 * 1000  // 1 hour

// Password Reset
maxAttempts: 3
windowMs: 60 * 60 * 1000  // 1 hour
```

## Storage & Persistence

- **Session**: Stored in localStorage via Supabase client
- **Rate Limits**: Stored in localStorage with timestamp
- **User Data**: Stored in Supabase database with RLS policies

## Testing

See `src/__tests__/` directory for example tests demonstrating how to test:
- API functions
- Custom hooks
- Components with providers
- Utility functions

Run tests with: `npm test` or `npm run test:watch`
