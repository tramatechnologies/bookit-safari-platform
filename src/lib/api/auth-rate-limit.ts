/**
 * Rate-Limited Authentication Service
 * Protects auth endpoints from brute force attacks
 */

import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

// In-memory rate limit store (uses browser storage for persistence)
const RATE_LIMIT_KEY_PREFIX = 'auth_ratelimit_';
const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

/**
 * Get rate limit key for a specific action and identifier
 */
function getRateLimitKey(action: string, identifier: string): string {
  return `${RATE_LIMIT_KEY_PREFIX}${action}:${identifier}`;
}

/**
 * Get stored rate limit data
 */
function getRateLimitData(key: string): { attempts: number; resetTime: number } | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored);
    const now = Date.now();

    if (data.resetTime < now) {
      // Window expired, clear the entry
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Update rate limit data
 */
function updateRateLimitData(key: string, attempts: number, resetTime: number): void {
  try {
    localStorage.setItem(key, JSON.stringify({ attempts, resetTime }));
  } catch {
    console.error('Failed to update rate limit data');
  }
}

/**
 * Check if action is rate limited
 */
export function isRateLimited(
  action: string,
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { limited: boolean; retryAfterSeconds?: number } {
  const key = getRateLimitKey(action, identifier);
  const now = Date.now();

  let data = getRateLimitData(key);

  if (!data) {
    // First attempt in this window
    updateRateLimitData(key, 1, now + config.windowMs);
    return { limited: false };
  }

  // Increment attempt count
  data.attempts++;
  updateRateLimitData(key, data.attempts, data.resetTime);

  // Check if exceeded
  if (data.attempts > config.maxAttempts) {
    const retryAfterSeconds = Math.ceil((data.resetTime - now) / 1000);
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false };
}

/**
 * Clear rate limit for an action/identifier
 */
export function clearRateLimit(action: string, identifier: string): void {
  const key = getRateLimitKey(action, identifier);
  try {
    localStorage.removeItem(key);
  } catch {
    console.error('Failed to clear rate limit');
  }
}

/**
 * Get remaining attempts before rate limit
 */
export function getRemainingAttempts(
  action: string,
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): number {
  const key = getRateLimitKey(action, identifier);
  const data = getRateLimitData(key);

  if (!data) return config.maxAttempts;

  return Math.max(0, config.maxAttempts - data.attempts);
}

/**
 * Rate-limited sign in wrapper
 */
export async function rateLimitedSignIn(email: string, password: string) {
  const config: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  };

  const rateLimit = isRateLimited('signin', email, config);

  if (rateLimit.limited) {
    const error = new Error('Too many sign-in attempts');
    (error as any).code = 'RATE_LIMIT_EXCEEDED';
    (error as any).retryAfterSeconds = rateLimit.retryAfterSeconds;
    throw error;
  }

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      throw result.error;
    }

    // Clear rate limit on successful sign in
    clearRateLimit('signin', email);
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Rate-limited sign up wrapper
 */
export async function rateLimitedSignUp(
  email: string,
  password: string,
  fullName: string
) {
  const config: RateLimitConfig = {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  };

  const rateLimit = isRateLimited('signup', email, config);

  if (rateLimit.limited) {
    const error = new Error('Too many sign-up attempts');
    (error as any).code = 'RATE_LIMIT_EXCEEDED';
    (error as any).retryAfterSeconds = rateLimit.retryAfterSeconds;
    throw error;
  }

  try {
    const redirectUrl = import.meta.env.PROD
      ? 'https://bookitsafari.com/auth/verify?redirect=/dashboard'
      : `${window.location.origin}/auth/verify?redirect=/dashboard`;

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectUrl,
      },
    });

    if (result.error) {
      throw result.error;
    }

    // Clear rate limit on successful sign up
    clearRateLimit('signup', email);
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Rate-limited password reset request
 */
export async function rateLimitedResetPasswordRequest(email: string) {
  const config: RateLimitConfig = {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  };

  const rateLimit = isRateLimited('reset_password_request', email, config);

  if (rateLimit.limited) {
    const error = new Error('Too many password reset requests');
    (error as any).code = 'RATE_LIMIT_EXCEEDED';
    (error as any).retryAfterSeconds = rateLimit.retryAfterSeconds;
    throw error;
  }

  try {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (result.error) {
      throw result.error;
    }

    // Clear rate limit on successful request
    clearRateLimit('reset_password_request', email);
    return result;
  } catch (error) {
    throw error;
  }
}
