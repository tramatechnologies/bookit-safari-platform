/**
 * Rate Limiting Middleware for Supabase Edge Functions
 * Implements token bucket algorithm for rate limiting
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string; // Custom identifier (defaults to IP)
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for production, use Redis or Supabase database)
const rateLimitStore: RateLimitStore = {};

/**
 * Get client identifier (IP address or custom identifier)
 */
function getIdentifier(req: Request, config: RateLimitConfig): string {
  if (config.identifier) {
    return config.identifier;
  }
  
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to connection IP (if available)
  return 'unknown';
}

/**
 * Clean up expired entries from store
 */
function cleanupStore(): void {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}

/**
 * Rate limiting middleware
 * @param config Rate limit configuration
 * @returns Middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  return async (req: Request): Promise<Response | null> => {
    // Clean up expired entries periodically
    if (Math.random() < 0.1) {
      cleanupStore();
    }

    const identifier = getIdentifier(req, config);
    const now = Date.now();
    const windowMs = config.windowMs;
    const maxRequests = config.maxRequests;

    // Get or create rate limit entry
    let entry = rateLimitStore[identifier];

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore[identifier] = entry;
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${Math.ceil(windowMs / 1000)} seconds.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
          },
        }
      );
    }

    // Request allowed - return null to continue
    return null;
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: rateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),

  // Moderate rate limit for booking creation
  booking: rateLimit({
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  }),

  // Moderate rate limit for payment processing
  payment: rateLimit({
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  }),

  // Lenient rate limit for general API calls
  api: rateLimit({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  }),

  // Very strict rate limit for webhooks (by IP)
  webhook: rateLimit({
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  }),
};

