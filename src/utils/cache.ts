// Cache utility for the Bookit Safari app
// Implements a simple in-memory cache with TTL (Time To Live)

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class AppCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value in the cache with a TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const timestamp = Date.now();
    this.cache.set(key, { data: value, timestamp, ttl });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns Boolean indicating if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from the cache
   * @param key Cache key to delete
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    this.cleanup(); // Clean up expired entries first
    return this.cache.size;
  }
}

// Create a singleton instance
export const appCache = new AppCache();

// Cache keys used throughout the app
export const CACHE_KEYS = {
  SCHEDULES: (regionId: string, date: string) => `schedules_${regionId}_${date}`,
  OPERATORS: 'operators',
  OPERATOR_BUSES: (operatorId: string) => `operator_buses_${operatorId}`,
  OPERATOR_ROUTES: (operatorId: string) => `operator_routes_${operatorId}`,
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  BOOKING_DETAILS: (bookingId: string) => `booking_details_${bookingId}`,
  REGION_LIST: 'region_list',
  SEAT_LAYOUT: (busId: string) => `seat_layout_${busId}`,
  TRIPS: (date: string, from: string, to: string) => `trips_${date}_${from}_${to}`,
};

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  key: string,
  ttl?: number
): T {
  return function (...args: Parameters<T>): ReturnType<T> {
    const cacheKey = `${key}_${JSON.stringify(args)}`;
    const cachedResult = appCache.get<ReturnType<T>>(cacheKey);

    if (cachedResult !== null) {
      return cachedResult;
    }

    const result = fn.apply(this, args);
    
    // If the result is a Promise, cache the resolved value
    if (result instanceof Promise) {
      result.then((resolved) => {
        appCache.set(cacheKey, resolved, ttl);
      });
    } else {
      appCache.set(cacheKey, result, ttl);
    }

    return result;
  } as T;
}