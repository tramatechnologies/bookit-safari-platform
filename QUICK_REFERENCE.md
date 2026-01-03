# Quick Reference: Error Handling & Rate Limiting

## 🔧 Components Usage

### Error Hook (Single Field)
```typescript
const { error, setError, clearError, userMessage, canRetry, retry } = useError({
  context: { action: 'save', entity: 'booking' }
});

try {
  await submitForm();
} catch (err) {
  setError(err);
}

return error ? <ErrorAlert message={userMessage} /> : null;
```

### Error Map Hook (Multiple Fields)
```typescript
const { errors, setError, clearError, clearAllErrors } = useErrorMap();

// Set error on specific field
setError('email', emailError);

// Clear specific field
clearError('email');

// Use in form
{errors.email && <span>{errors.email.message}</span>}
```

---

## 📡 API Usage

### Basic Try-Catch
```typescript
import { tryCatch } from '@/lib/utils/error-handling';

const { data, error } = await tryCatch(
  () => fetchData(),
  { action: 'fetch', entity: 'data' }
);
```

### Retry Logic
```typescript
import { retryWithBackoff } from '@/lib/utils/error-handling';

const result = await retryWithBackoff(
  () => fetchDataFromApi(),
  { maxAttempts: 3, initialDelayMs: 100 }
);
```

### Assert Conditions
```typescript
import { assert } from '@/lib/utils/error-handling';

assert(userId, 'User required', 'MISSING_USER', 401);
assert(data.length > 0, 'No results', 'EMPTY', 404);
```

---

## 🚀 Edge Functions

### Basic Wrapper
```typescript
import { wrapHandler, assertRequest, validateJsonPayload } from '../_shared/edge-error-handler';

export const handler = wrapHandler(async (req) => {
  const { email } = await validateJsonPayload(req);
  assertRequest(email, 'Email required', 400);
  return { success: true, data: { processed: true } };
});

Deno.serve(handler);
```

### With Rate Limiting
```typescript
import { createRateLimiter, RateLimitStrategies } from '../_shared/edge-rate-limit';

const limitUser = createRateLimiter({
  ...RateLimitStrategies.NORMAL,
  keyGenerator: (req) => `user:${req.headers.get('x-user-id')}`
});

export const handler = wrapHandler(async (req) => {
  await limitUser(req);
  // Process request
});

Deno.serve(handler);
```

---

## 📊 Rate Limiting Strategies

| Strategy | Limit | Use Case |
|----------|-------|----------|
| STRICT | 5/min | Auth endpoints |
| NORMAL | 10/min | API endpoints |
| MODERATE | 30/min | Public endpoints |
| RELAXED | 60/min | Non-sensitive |
| HOURLY_STRICT | 100/hr | Payment operations |
| HOURLY_NORMAL | 500/hr | Data export |
| DAILY | 10,000/day | General API |

---

## 🎯 Common Patterns

### Pattern 1: Component with Loading & Error
```typescript
const Component = () => {
  const { error, setError, userMessage } = useError();
  const { data, isLoading } = useQuery(...);

  useEffect(() => {
    if (isLoading === false && !data && !error) {
      setError(new Error('No data returned'));
    }
  }, [data, isLoading]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert message={userMessage} />;
  return <Content data={data} />;
};
```

### Pattern 2: Form Submission with Validation
```typescript
const Form = () => {
  const { errors, setError, clearAllErrors } = useErrorMap();

  const handleSubmit = async (data) => {
    clearAllErrors();
    try {
      assert(data.email, 'Email required', 'MISSING_EMAIL', 400);
      await submitForm(data);
    } catch (err) {
      if (err.field) setError(err.field, err);
      else setError('general', err);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Pattern 3: API Call with Retry
```typescript
const fetchWithRetry = async (id: string) => {
  return retryWithBackoff(
    () => api.get(`/bookings/${id}`),
    { maxAttempts: 3 }
  );
};
```

### Pattern 4: Edge Function with Multiple Validations
```typescript
export const handler = wrapHandler(async (req) => {
  assertRequest(req.method === 'POST', 'POST required', 405);
  
  const { email, password } = await validateJsonPayload(req);
  assertRequest(email, 'Email required', 400);
  assertRequest(password?.length >= 8, 'Password too short', 400);
  
  const user = await withDatabaseErrorHandling(
    () => createUser(email, password),
    'User'
  );
  
  return { success: true, data: user };
}, { function: 'create-user' });

Deno.serve(handler);
```

---

## 🔍 Error Categories

| Category | Example | Default Message |
|----------|---------|-----------------|
| VALIDATION | Invalid email | Invalid input provided |
| AUTHENTICATION | Missing token | Authentication required |
| AUTHORIZATION | Insufficient permissions | Access denied |
| NOT_FOUND | Missing resource | Not found |
| CONFLICT | Duplicate key | Resource already exists |
| RATE_LIMIT | Too many requests | Too many requests, try later |
| SERVER | Database error | Something went wrong |
| NETWORK | Connection failed | Network error, please retry |
| UNKNOWN | Unexpected error | An unexpected error occurred |

---

## 📝 Tips & Tricks

### Get Remaining Attempts (Auth Rate Limiting)
```typescript
import { getRemainingAttempts } from '@/lib/api/auth-rate-limit';

const remaining = getRemainingAttempts('sign-in', email);
console.log(`${remaining} attempts remaining`);
```

### Clear Rate Limit
```typescript
import { clearRateLimit } from '@/lib/api/auth-rate-limit';

clearRateLimit('sign-in', email);
```

### Parse Any Error Type
```typescript
import { parseError } from '@/lib/utils/error-handling';

try {
  await operation();
} catch (error) {
  const normalized = parseError(error);
  console.log(normalized.code, normalized.message);
}
```

### Combine Multiple Rate Limiters
```typescript
import { combineRateLimiters } from '../_shared/edge-rate-limit';

const limitIP = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  keyGenerator: (req) => getClientIp(req)
});

const limitUser = createRateLimiter({
  windowMs: 60000,
  maxRequests: 30,
  keyGenerator: (req) => `user:${req.headers.get('x-user-id')}`
});

const checkBoth = combineRateLimiters(limitIP, limitUser);
await checkBoth(req);
```

---

## 🚨 Common Mistakes

❌ **Don't:** Catch and ignore errors
```typescript
try { await fetch(); } catch (e) { }
```

✅ **Do:** Handle errors properly
```typescript
try { 
  await fetch(); 
} catch (err) { 
  setError(err); 
}
```

---

❌ **Don't:** Pass raw errors to users
```typescript
alert(error.message); // Could be internal details
```

✅ **Do:** Use user-friendly messages
```typescript
const { userMessage } = useError();
alert(userMessage); // Safe, user-friendly
```

---

❌ **Don't:** Rate limit without key generator
```typescript
const limiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 10
  // Missing keyGenerator!
});
```

✅ **Do:** Specify how to identify clients
```typescript
const limiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  keyGenerator: (req) => getClientIp(req)
});
```

---

## 📚 File References

- **Error Utilities:** `src/lib/utils/error-handling.ts`
- **Error Hook:** `src/hooks/use-error.tsx`
- **Edge Handler:** `_shared/edge-error-handler.ts`
- **Rate Limiting:** `_shared/edge-rate-limit.ts`
- **Auth Rate Limit:** `src/lib/api/auth-rate-limit.ts`
- **Full Guide:** `ERROR_HANDLING_GUIDE.md`
- **Examples:** `INTEGRATION_EXAMPLES.md`

---

**Last Updated:** January 2, 2026  
**Status:** ✅ Production Ready
