# Developer Reference Card

**Version:** 1.0  
**Last Updated:** January 2, 2026

---

## 🚀 Quick Start

### Step 1: Import What You Need
```typescript
// For components
import { useError } from '@/hooks/use-error';
import { useErrorMap } from '@/hooks/use-error';

// For services
import { tryCatch, retryWithBackoff, assert } from '@/lib/utils/error-handling';

// For edge functions
import { wrapHandler, validateJsonPayload } from '../_shared/edge-error-handler';
import { createRateLimiter, RateLimitStrategies } from '../_shared/edge-rate-limit';
```

### Step 2: Use in Your Code

**Component:**
```typescript
const { error, setError, userMessage } = useError();
```

**Service:**
```typescript
const { data, error } = await tryCatch(() => fetchData(), context);
```

**Edge Function:**
```typescript
export const handler = wrapHandler(async (req) => {
  // Your code here
});
Deno.serve(handler);
```

---

## 📦 Error Handling Utilities

### `src/lib/utils/error-handling.ts`

#### AppError Interface
```typescript
interface AppError {
  code: string;           // Error code (e.g., 'NOT_FOUND')
  message: string;        // Technical message
  statusCode: number;     // HTTP status
  isUserFacing?: boolean; // Should show to user
  category?: ErrorCategory;
  context?: ErrorContext;
  originalError?: any;
}
```

#### ErrorCategory Enum
```
VALIDATION        = Invalid input
AUTHENTICATION    = Auth required
AUTHORIZATION     = Access denied
NOT_FOUND         = Resource missing
CONFLICT          = Resource exists
RATE_LIMIT        = Too many requests
SERVER            = Server error
NETWORK           = Connection failed
UNKNOWN           = Other error
```

#### Core Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `parseError(error)` | Convert to AppError | `AppError` |
| `categorizeError(error)` | Get ErrorCategory | `ErrorCategory` |
| `getErrorMessage(error, context)` | User-friendly text | `string` |
| `assert(condition, msg, code, status)` | Throw if false | `void` (throws) |
| `tryCatch(fn, context)` | Safe async wrapper | `{ data, error }` |
| `tryCatchSync(fn, context)` | Safe sync wrapper | `{ data, error }` |
| `retryWithBackoff(fn, options)` | Retry with delay | Result of fn |
| `safeJsonParse(json, fallback)` | Parse JSON safely | Parsed object or fallback |
| `formatErrorResponse(error)` | API error format | Formatted error object |

---

## 🪝 React Error Hook

### `src/hooks/use-error.tsx`

#### useError() Hook

**Returns:**
```typescript
{
  // State
  error: AppError | null;
  category: ErrorCategory | null;
  userMessage: string;
  isRetryable: boolean;
  retryCount: number;
  hasError: boolean;
  canRetry: boolean; // isRetryable && retryCount < maxRetries

  // Methods
  setError(error: ErrorSource): void;
  clearError(): void;
  retry(fn: () => Promise<void>): () => Promise<void>;
  handle<T>(fn: () => Promise<T>, onSuccess?: (data: T) => void): Promise<T | null>;
}
```

**Config Options:**
```typescript
{
  context?: { action?: string; entity?: string };
  maxRetries?: number;              // Default: 3
  onErrorCallback?: (error) => void;
  logErrors?: boolean;              // Default: true
}
```

**Usage:**
```typescript
const { error, setError, userMessage, canRetry, retry } = useError({
  context: { action: 'fetch', entity: 'bookings' }
});

// Option 1: Manual error handling
try {
  const data = await fetchData();
} catch (err) {
  setError(err);
}

// Option 2: Automatic with handle()
const result = await handle(
  () => fetchData(),
  (data) => console.log('Success:', data)
);
```

#### useErrorMap() Hook

For form field errors:
```typescript
const { errors, setError, clearError, clearAllErrors } = useErrorMap();

// Set error on field
setError('email', emailError);

// Get error message for field
const msg = errors.email?.message;

// Clear field error
clearError('email');

// Clear all errors
clearAllErrors();
```

---

## 🔧 Edge Function Utilities

### `_shared/edge-error-handler.ts`

#### Response Interfaces
```typescript
interface EdgeFunctionError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

interface EdgeFunctionSuccess<T> {
  success: true;
  data?: T;
}
```

#### Core Functions

| Function | Purpose | Signature |
|----------|---------|-----------|
| `createErrorResponse(code, msg, status)` | Error response | `Response` |
| `createSuccessResponse(data, status)` | Success response | `Response` |
| `assertRequest(condition, msg, status, code)` | Assert in handler | `void` (throws) |
| `validateJsonPayload(req)` | Parse & validate | `Promise<any>` |
| `validateAuthorization(header, token)` | Check auth | `void` (throws) |
| `logEdgeFunctionError(error, context)` | Structured log | `void` |
| `wrapHandler(handler, context)` | Auto error wrap | `(req) => Response` |
| `withDatabaseErrorHandling(op, entity)` | Safe DB ops | Result of op |
| `withTimeout(promise, ms)` | Add timeout | Result of promise |

#### Usage Example
```typescript
export const handler = wrapHandler(
  async (req) => {
    // Validate method
    assertRequest(req.method === 'POST', 'POST required', 405);
    
    // Parse body
    const { email, password } = await validateJsonPayload(req);
    
    // Validate data
    assertRequest(email, 'Email required', 400);
    
    // Safe DB operation
    const user = await withDatabaseErrorHandling(
      () => createUser(email, password),
      'User'
    );
    
    // Return success
    return { success: true, data: user };
  },
  { function: 'create-user' }
);

Deno.serve(handler);
```

---

## ⏱️ Rate Limiting

### `_shared/edge-rate-limit.ts`

#### RateLimitConfig
```typescript
interface RateLimitConfig {
  windowMs: number;        // Time window in ms
  maxRequests: number;     // Max requests per window
  keyGenerator: (req) => string;  // Unique identifier
  store?: RateLimitStore;  // Storage backend
  onLimitReached?: () => void;    // Callback
}
```

#### Pre-configured Strategies
```typescript
RateLimitStrategies.STRICT         // 5 req/min
RateLimitStrategies.NORMAL         // 10 req/min
RateLimitStrategies.MODERATE       // 30 req/min
RateLimitStrategies.RELAXED        // 60 req/min
RateLimitStrategies.HOURLY_STRICT  // 100 req/hr
RateLimitStrategies.HOURLY_NORMAL  // 500 req/hr
RateLimitStrategies.DAILY          // 10k req/day
```

#### Usage Examples

**Basic Rate Limiting (by IP):**
```typescript
const checkLimit = createRateLimiter({
  ...RateLimitStrategies.NORMAL,
  keyGenerator: (req) => getClientIp(req)
});

export const handler = wrapHandler(
  async (req) => {
    await checkLimit(req);
    // Process request
  }
);

Deno.serve(handler);
```

**Per-User Rate Limiting:**
```typescript
const checkLimit = createRateLimiter({
  ...RateLimitStrategies.STRICT,
  keyGenerator: (req) => `user:${req.headers.get('x-user-id')}`
});
```

**Combine Multiple Limiters:**
```typescript
const limitIP = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  keyGenerator: (req) => `ip:${getClientIp(req)}`
});

const limitUser = createRateLimiter({
  windowMs: 60000,
  maxRequests: 30,
  keyGenerator: (req) => `user:${req.headers.get('x-user-id') || 'anon'}`
});

const checkBoth = combineRateLimiters(limitIP, limitUser);
```

---

## 🗂️ Error Categories Quick Map

| Error | Category | Example |
|-------|----------|---------|
| Invalid input | VALIDATION | "Email format invalid" |
| No auth token | AUTHENTICATION | "Login required" |
| Insufficient perms | AUTHORIZATION | "Admin access required" |
| Not in database | NOT_FOUND | "User not found" |
| Already exists | CONFLICT | "Email already registered" |
| Too many requests | RATE_LIMIT | "Try again in 5 minutes" |
| Server crash | SERVER | "Server error occurred" |
| No internet | NETWORK | "Check your connection" |
| Unknown | UNKNOWN | "An error occurred" |

---

## 📋 Common Patterns

### Pattern 1: Simple Fetch
```typescript
const { error, setError, userMessage } = useError();
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    const { data, error } = await tryCatch(() => api.get('/data'));
    if (error) setError(error);
    else setData(data);
  };
  fetchData();
}, []);

return error ? <ErrorAlert message={userMessage} /> : <Content data={data} />;
```

### Pattern 2: Form Validation
```typescript
const { errors, setError, clearAllErrors } = useErrorMap();

const handleSubmit = async (formData) => {
  clearAllErrors();
  try {
    assert(formData.email, 'Email required', 'MISSING_EMAIL', 400);
    assert(/^.+@.+\..+$/.test(formData.email), 'Invalid email', 'INVALID_EMAIL', 400);
    await submitForm(formData);
  } catch (err) {
    setError(err.code === 'MISSING_EMAIL' ? 'email' : 'form', err);
  }
};
```

### Pattern 3: Retry Logic
```typescript
const { data, error } = await retryWithBackoff(
  () => api.get(`/data/${id}`),
  {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 2000,
    backoffMultiplier: 2
  }
);
```

### Pattern 4: Edge Function
```typescript
export const handler = wrapHandler(
  async (req) => {
    const { bookingId, amount } = await validateJsonPayload(req);
    assertRequest(bookingId && amount, 'Missing fields', 400);
    
    const booking = await withDatabaseErrorHandling(
      () => db.get('bookings', bookingId),
      'Booking'
    );
    
    return { success: true, data: { booking } };
  },
  { function: 'get-booking' }
);

Deno.serve(handler);
```

---

## 🎯 Decision Tree

**Q: Where is the error happening?**
- Component → Use `useError` hook
- Service → Use `tryCatch` or `retryWithBackoff`
- Edge function → Use `wrapHandler` + `assertRequest`
- Multiple fields → Use `useErrorMap` hook

**Q: Should I retry?**
- Network error → YES (use `retryWithBackoff`)
- Validation error → NO
- Server error → YES (with backoff)
- Rate limit → NO (show wait time)

**Q: Should I show to user?**
- Validation error → YES (user-friendly)
- Auth error → YES (user-friendly)
- Server error → YES (generic message)
- Internal error → NO (log only)

**Q: How to rate limit?**
- Public endpoint → IP-based (getClientIp)
- Auth endpoint → Already done (auth-rate-limit.ts)
- Payment endpoint → User-based (STRICT strategy)
- API endpoint → Either IP or user

---

## 🔗 File Map

```
Error Handling:
├── src/lib/utils/error-handling.ts    (Core utilities)
├── src/hooks/use-error.tsx            (React hook)
└── src/lib/api/auth-rate-limit.ts     (Auth specific)

Edge Functions:
├── _shared/edge-error-handler.ts      (Error handling)
├── _shared/edge-rate-limit.ts         (Rate limiting)
└── supabase/functions/*/index.ts      (Your functions)

Documentation:
├── ERROR_HANDLING_GUIDE.md            (Full guide)
├── INTEGRATION_EXAMPLES.md            (Examples)
├── QUICK_REFERENCE.md                 (Quick lookup)
└── DEPLOYMENT_CHECKLIST.md            (Implementation plan)
```

---

## ✅ Before You Code

- [ ] Read the relevant documentation
- [ ] Review example code for your use case
- [ ] Understand error categories
- [ ] Know which rate limit strategy to use
- [ ] Test error paths in development

## ✅ After You Code

- [ ] Test with real error scenarios
- [ ] Verify user error messages
- [ ] Check rate limiting works
- [ ] Add unit/integration tests
- [ ] Code review with peer
- [ ] Deploy to staging
- [ ] Monitor in production

---

**Questions?**
- Full guide: `ERROR_HANDLING_GUIDE.md`
- Examples: `INTEGRATION_EXAMPLES.md`
- Quick lookup: `QUICK_REFERENCE.md`

**Status:** ✅ Production Ready

---

**Version 1.0** | January 2, 2026
