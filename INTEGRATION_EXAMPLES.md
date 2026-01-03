# Integration Examples

## Example 1: MyBookings Page with Error Handling

```typescript
// src/pages/MyBookings.tsx
import { useEffect } from 'react';
import { useError } from '@/hooks/use-error';
import { useBookings } from '@/hooks/use-bookings';
import { ErrorAlert } from '@/components/ui/error-alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function MyBookings() {
  const { error: bookingError, setError, clearError, userMessage, canRetry, retry } = useError({
    context: { action: 'fetch bookings', entity: 'booking' },
    onErrorCallback: (error) => {
      console.error('Booking fetch failed:', error);
    },
  });

  const { data: bookings, isLoading, error: queryError } = useBookings();

  useEffect(() => {
    if (queryError) {
      setError(queryError);
    }
  }, [queryError, setError]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {bookingError && (
        <ErrorAlert
          title="Failed to Load Bookings"
          message={userMessage}
          onDismiss={clearError}
          actionButton={
            canRetry
              ? {
                  label: 'Retry',
                  onClick: () => retry(() => refetch()),
                }
              : undefined
          }
        />
      )}

      {/* Bookings List */}
      {bookings?.length === 0 ? (
        <div className="text-center text-gray-500">No bookings found</div>
      ) : (
        <div className="grid gap-4">
          {bookings?.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Example 2: Booking Form with Field-Level Errors

```typescript
// src/pages/Booking.tsx
import { useErrorMap } from '@/hooks/use-error';
import { assert } from '@/lib/utils/error-handling';

export default function BookingForm() {
  const { errors, setError, clearError, clearAllErrors, hasError } = useErrorMap();

  const handleSubmit = async (formData) => {
    clearAllErrors();

    try {
      // Validate required fields
      assert(formData.email, 'Email is required', 'MISSING_EMAIL', 400);
      assert(formData.passengers.length > 0, 'At least 1 passenger required', 'MISSING_PASSENGERS', 400);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      assert(emailRegex.test(formData.email), 'Invalid email format', 'INVALID_EMAIL', 400);

      // Submit booking
      const result = await submitBooking(formData);

      // Success handling
      toast.success('Booking confirmed!');
      navigate(`/booking/${result.id}`);
    } catch (error) {
      // Set field-specific errors
      if (error.code === 'MISSING_EMAIL') {
        setError('email', error);
      } else if (error.code === 'INVALID_EMAIL') {
        setError('email', error);
      } else if (error.code === 'MISSING_PASSENGERS') {
        setError('passengers', error);
      } else {
        // Generic error
        setError('general', error);
      }
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData); }}>
      <div className="space-y-4">
        {/* Email Field */}
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            onFocus={() => clearError('email')}
            className={hasError('email') ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Passengers Field */}
        <div>
          <label>Passengers</label>
          <div className="space-y-2">
            {/* Passenger inputs */}
          </div>
          {errors.passengers && (
            <p className="text-red-500 text-sm mt-1">
              {errors.passengers.message}
            </p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700">{errors.general.message}</p>
          </div>
        )}

        <button type="submit" disabled={Object.keys(errors).length > 0}>
          Confirm Booking
        </button>
      </div>
    </form>
  );
}
```

---

## Example 3: API Service with Error Handling

```typescript
// src/lib/api/advanced-bookings.ts
import { tryCatch, retryWithBackoff, parseError } from '@/lib/utils/error-handling';

export const advancedBookingsApi = {
  /**
   * Fetch bookings with retry logic for network errors
   */
  async getBookingsWithRetry(userId: string) {
    return retryWithBackoff(
      () => this.getBookings(userId),
      {
        maxAttempts: 3,
        initialDelayMs: 100,
        maxDelayMs: 2000,
      }
    );
  },

  /**
   * Fetch bookings with error handling
   */
  async getBookings(userId: string) {
    const { data, error } = await tryCatch(
      () => supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId),
      { action: 'fetch bookings', entity: 'booking' }
    );

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Create booking with validation
   */
  async createBooking(bookingData) {
    const { data, error } = await tryCatch(
      () => supabase
        .from('bookings')
        .insert([bookingData])
        .select(),
      { action: 'create booking', entity: 'booking' }
    );

    if (error) {
      // Parse database errors for better messages
      const parsed = parseError(error);
      if (parsed.message.includes('unique violation')) {
        throw new Error('Email already has a booking for this route');
      }
      throw error;
    }

    return data[0];
  },
};
```

---

## Example 4: Edge Function with Rate Limiting

```typescript
// supabase/functions/initiate-payment/index.ts
import {
  wrapHandler,
  assertRequest,
  validateJsonPayload,
  validateAuthorization,
  withDatabaseErrorHandling,
} from '../_shared/edge-error-handler';
import {
  createRateLimiter,
  RateLimitStrategies,
} from '../_shared/edge-rate-limit';

// Rate limiter: 5 payment attempts per minute per user
const checkPaymentRateLimit = createRateLimiter({
  ...RateLimitStrategies.STRICT,
  keyGenerator: (req) => `payment:${req.headers.get('x-user-id') || 'anonymous'}`,
});

export const handler = wrapHandler(
  async (req) => {
    // Only allow POST requests
    assertRequest(req.method === 'POST', 'Method not allowed', 405);

    // Check rate limit
    await checkPaymentRateLimit(req);

    // Validate authorization
    const authHeader = req.headers.get('authorization');
    validateAuthorization(authHeader, Deno.env.get('PAYMENT_API_KEY'));

    // Parse and validate payload
    const { bookingId, amount, currency } = await validateJsonPayload(req);
    assertRequest(bookingId, 'Booking ID required', 400);
    assertRequest(amount > 0, 'Amount must be greater than 0', 400);

    // Get booking with error handling
    const booking = await withDatabaseErrorHandling(
      () => getBookingById(bookingId),
      'Booking'
    );

    assertRequest(booking, 'Booking not found', 404);
    assertRequest(booking.status === 'pending', 'Booking not in pending status', 400);

    // Initiate payment with external API
    const paymentResult = await initiatePayment({
      bookingId,
      amount,
      currency,
      userId: booking.user_id,
    });

    // Update booking status
    await withDatabaseErrorHandling(
      () => updateBookingPaymentStatus(bookingId, 'payment_initiated', paymentResult.transactionId),
      'Booking'
    );

    return {
      success: true,
      data: {
        transactionId: paymentResult.transactionId,
        paymentUrl: paymentResult.paymentUrl,
      },
    };
  },
  { function: 'initiate-payment' }
);

Deno.serve(handler);
```

---

## Example 5: Admin Dashboard with Error Handling Hook

```typescript
// src/pages/AdminDashboard.tsx
import { useError } from '@/hooks/use-error';
import { useAdminStats } from '@/hooks/use-admin-stats';

export default function AdminDashboard() {
  const {
    error,
    setError,
    clearError,
    userMessage,
    canRetry,
    retry,
    handle,
  } = useError({
    context: { action: 'load admin dashboard' },
    maxRetries: 2,
  });

  const { stats, isLoading, refetch } = useAdminStats();

  // Wrap async operations with automatic error handling
  const handleRefresh = () => {
    return handle(() => refetch(), () => {
      toast.success('Dashboard refreshed');
    });
  };

  const handleExportData = async () => {
    return handle(
      async () => {
        const data = await exportAdminData();
        downloadCSV(data, 'admin-export.csv');
      },
      () => {
        toast.success('Data exported successfully');
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-600 text-sm">{userMessage}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
          {canRetry && (
            <button
              onClick={() => retry(() => refetch())}
              className="mt-3 text-red-600 underline text-sm"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* Dashboard Content */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers} />
        <StatCard title="Total Bookings" value={stats?.totalBookings} />
        <StatCard title="Revenue" value={`$${stats?.revenue}`} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleRefresh}>Refresh</button>
        <button onClick={handleExportData}>Export Data</button>
      </div>
    </div>
  );
}
```

---

## Example 6: Protected Async Operation Handler

```typescript
// Use case: Handle any async operation safely
const { handle, error, userMessage } = useError();

// Option 1: Using handle() method
const processBooking = async () => {
  const result = await handle(
    () => submitBookingForPayment(bookingData),
    (data) => {
      // Success callback
      navigate(`/booking/${data.id}`);
    }
  );

  // Error is automatically set if operation fails
};

// Option 2: Using try-catch with setError
const processBooking = async () => {
  try {
    const result = await submitBookingForPayment(bookingData);
    navigate(`/booking/${result.id}`);
  } catch (err) {
    setError(err);
  }
};

// Both approaches handle errors consistently
if (error) {
  return <ErrorAlert message={userMessage} />;
}
```

---

## Implementation Checklist

- [ ] Review error-handling utilities in `src/lib/utils/error-handling.ts`
- [ ] Review useError hook in `src/hooks/use-error.tsx`
- [ ] Review edge function utilities in `_shared/edge-error-handler.ts`
- [ ] Review rate limiting in `_shared/edge-rate-limit.ts`
- [ ] Update `src/pages/MyBookings.tsx` with error handling
- [ ] Update `src/pages/Booking.tsx` with field-level error handling
- [ ] Update API services with try-catch wrappers
- [ ] Update edge functions to use wrapHandler
- [ ] Add rate limiting to payment endpoints
- [ ] Add unit tests for error handling utilities
- [ ] Add integration tests for error flows
- [ ] Deploy to staging for testing

---

**Status:** Ready for implementation  
**Time Estimate:** 4-8 hours for full integration  
**Testing:** Add tests as shown in TESTING_GUIDE.md
