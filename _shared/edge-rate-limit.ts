/**
 * Rate Limiting Middleware for Edge Functions
 * Provides flexible rate limiting strategies for API endpoints
 * 
 * Usage:
 * ```typescript
 * const checkRateLimit = createRateLimiter({
 *   windowMs: 60 * 1000,    // 1 minute
 *   maxRequests: 10,        // 10 requests per window
 *   keyGenerator: (req) => req.headers.get('x-user-id') || getClientIp(req)
 * });
 * 
 * export const handler = wrapHandler(async (req) => {
 *   await checkRateLimit(req);
 *   return { success: true };
 * });
 * ```
 */

import { createRateLimitResponse } from './edge-error-handler';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Key generation function to identify unique clients */
  keyGenerator: (req: Request) => string;
  /** Storage backend (default: in-memory) */
  store?: RateLimitStore;
  /** Custom error response handler */
  onLimitReached?: (key: string, retryAfter: number) => Response;
}

/**
 * Rate limit store interface
 */
export interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  set(key: string, count: number, resetTime: number): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * In-memory rate limit store
 * Note: Resets between function invocations in production
 * For persistent rate limiting, use Supabase or external service
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  async set(key: string, count: number, resetTime: number) {
    this.store.set(key, { count, resetTime });
  }

  async delete(key: string) {
    this.store.delete(key);
  }

  /**
   * Clean up all expired entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const store = config.store || new InMemoryRateLimitStore();
  const { windowMs, maxRequests, keyGenerator, onLimitReached } = config;

  return async (req: Request): Promise<void> => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get current rate limit entry
    let entry = await store.get(key);

    if (!entry) {
      // First request in window
      await store.set(key, 1, now + windowMs);
      return;
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Start new window
      await store.set(key, 1, now + windowMs);
      return;
    }

    // Increment counter
    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      // Call custom error handler if provided
      if (onLimitReached) {
        throw new RateLimitError(
          onLimitReached(key, retryAfter)
        );
      }

      // Use default error response
      throw new RateLimitError(
        createRateLimitResponse(retryAfter)
      );
    }

    // Update entry
    await store.set(key, entry.count, entry.resetTime);
  };
}

/**
 * Error class for rate limiting
 * Contains the pre-built response to return
 */
export class RateLimitError extends Error {
  constructor(public response: Response) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

/**
 * Get client IP from request
 * Works with proxies and load balancers
 */
export function getClientIp(req: Request): string {
  // Try to get from headers (for proxied requests)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to cf-connecting-ip (Cloudflare)
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  return 'unknown';
}

/**
 * Common rate limiting strategies
 */
export const RateLimitStrategies = {
  /**
   * Strict: 5 requests per minute
   */
  STRICT: {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },

  /**
   * Normal: 10 requests per minute
   */
  NORMAL: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },

  /**
   * Moderate: 30 requests per minute
   */
  MODERATE: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },

  /**
   * Relaxed: 60 requests per minute
   */
  RELAXED: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },

  /**
   * Per hour strict: 100 requests per hour
   */
  HOURLY_STRICT: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 100,
  },

  /**
   * Per hour normal: 500 requests per hour
   */
  HOURLY_NORMAL: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 500,
  },

  /**
   * Per day: 10,000 requests per day
   */
  DAILY: {
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 10000,
  },
};

/**
 * Create a keyed rate limiter (different limits for different keys)
 * Example: Rate limit per user ID instead of per IP
 */
export function createKeyedRateLimiter(
  config: Omit<RateLimitConfig, 'keyGenerator'> & {
    keyGenerator?: (req: Request) => string;
  }
) {
  const keyGenerator = config.keyGenerator || ((req: Request) => getClientIp(req));
  return createRateLimiter({ ...config, keyGenerator });
}

/**
 * Combine multiple rate limiters
 * Example: Rate limit by IP AND by user ID
 */
export function combineRateLimiters(...limiters: ReturnType<typeof createRateLimiter>[]) {
  return async (req: Request): Promise<void> => {
    for (const limiter of limiters) {
      await limiter(req);
    }
  };
}

/**
 * Supabase-based rate limit store
 * For persistent rate limiting across function invocations
 */
export class SupabaseRateLimitStore implements RateLimitStore {
  constructor(
    private supabase: any,
    private tableName: string = 'rate_limits'
  ) {}

  async get(key: string) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('count, reset_time')
      .eq('key', key)
      .single();

    if (error || !data) return null;

    return {
      count: data.count,
      resetTime: new Date(data.reset_time).getTime(),
    };
  }

  async set(key: string, count: number, resetTime: number) {
    const { error } = await this.supabase
      .from(this.tableName)
      .upsert(
        {
          key,
          count,
          reset_time: new Date(resetTime).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Failed to update rate limit:', error);
      }
    }
  }

  async delete(key: string) {
    await this.supabase
      .from(this.tableName)
      .delete()
      .eq('key', key);
  }
}
