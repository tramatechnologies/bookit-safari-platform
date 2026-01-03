/**
 * Error Handling Utilities
 * Standardized error handling patterns for consistent error management across the application
 */

import { AxiosError } from 'axios';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Standard error response format used throughout the application
 */
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
  isUserFacing: boolean;
}

/**
 * Extended error type that combines various error sources
 */
export type ErrorSource = Error | PostgrestError | AxiosError | AppError | null | undefined;

/**
 * Categorize errors for consistent handling
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Parse and normalize any error into a standard AppError format
 * @param error - Error from any source (Error, PostgrestError, AxiosError, AppError)
 * @returns Normalized AppError object
 */
export function parseError(error: ErrorSource): AppError {
  // Handle null/undefined
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      isUserFacing: false,
    };
  }

  // Already an AppError
  if ('code' in error && 'statusCode' in error) {
    return error as AppError;
  }

  // PostgrestError (Supabase)
  if ('message' in error && 'code' in error) {
    const pgError = error as PostgrestError;
    return {
      code: pgError.code || 'DATABASE_ERROR',
      message: pgError.message || 'Database operation failed',
      details: { hint: pgError.hint },
      statusCode: 400,
      isUserFacing: false,
    };
  }

  // AxiosError
  if ('response' in error || 'request' in error) {
    const axiosError = error as AxiosError;
    return {
      code: `HTTP_${axiosError.response?.status || 'UNKNOWN'}`,
      message: axiosError.message || 'Network request failed',
      details: { status: axiosError.response?.status },
      statusCode: axiosError.response?.status || 500,
      isUserFacing: axiosError.response?.status ? axiosError.response.status < 500 : false,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      code: 'APPLICATION_ERROR',
      message: error.message || 'An error occurred',
      statusCode: 500,
      isUserFacing: false,
    };
  }

  // Fallback
  return {
    code: 'UNKNOWN_ERROR',
    message: String(error),
    statusCode: 500,
    isUserFacing: false,
  };
}

/**
 * Categorize an error for consistent handling
 * @param error - Parsed or raw error
 * @returns ErrorCategory
 */
export function categorizeError(error: ErrorSource): ErrorCategory {
  const parsed = parseError(error);

  if (
    parsed.code.includes('VALIDATION') ||
    parsed.statusCode === 400
  ) {
    return ErrorCategory.VALIDATION;
  }

  if (
    parsed.code.includes('UNAUTHORIZED') ||
    parsed.statusCode === 401
  ) {
    return ErrorCategory.AUTHENTICATION;
  }

  if (
    parsed.code.includes('FORBIDDEN') ||
    parsed.statusCode === 403
  ) {
    return ErrorCategory.AUTHORIZATION;
  }

  if (parsed.statusCode === 404) {
    return ErrorCategory.NOT_FOUND;
  }

  if (parsed.statusCode === 409) {
    return ErrorCategory.CONFLICT;
  }

  if (
    parsed.code.includes('RATE_LIMIT') ||
    parsed.statusCode === 429
  ) {
    return ErrorCategory.RATE_LIMIT;
  }

  if (parsed.statusCode >= 500) {
    return ErrorCategory.SERVER;
  }

  if (
    parsed.code.includes('NETWORK') ||
    parsed.code.includes('TIMEOUT')
  ) {
    return ErrorCategory.NETWORK;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Get user-friendly error message
 * @param error - Error to format
 * @param context - Optional context for better error messages
 * @returns User-friendly error message
 */
export function getErrorMessage(
  error: ErrorSource,
  context?: { action?: string; entity?: string }
): string {
  const parsed = parseError(error);
  const category = categorizeError(error);

  // Predefined user-friendly messages by category
  const messageMap: Record<ErrorCategory, string> = {
    [ErrorCategory.VALIDATION]: `Invalid input. Please check your ${context?.entity || 'data'} and try again.`,
    [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
    [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ErrorCategory.NOT_FOUND]: `The ${context?.entity || 'resource'} you requested was not found.`,
    [ErrorCategory.CONFLICT]: `This ${context?.entity || 'resource'} already exists.`,
    [ErrorCategory.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorCategory.SERVER]: 'A server error occurred. Please try again later.',
    [ErrorCategory.NETWORK]: 'Network connection failed. Please check your internet and try again.',
    [ErrorCategory.UNKNOWN]: parsed.message || 'An unexpected error occurred. Please try again.',
  };

  return messageMap[category];
}

/**
 * Safe error wrapper for try-catch blocks
 * Ensures errors are always properly formatted
 * @param fn - Async function to execute
 * @param context - Error context for better messages
 * @returns Result with error handling
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: { action?: string; entity?: string }
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const appError = parseError(error);
    
    // Log development errors
    if (import.meta.env.DEV) {
      console.error(`Error during ${context?.action || 'operation'}:`, appError);
    }

    return { error: appError };
  }
}

/**
 * Safe wrapper for synchronous operations
 * @param fn - Function to execute
 * @param context - Error context
 * @returns Result with error handling
 */
export function tryCatchSync<T>(
  fn: () => T,
  context?: { action?: string; entity?: string }
): { data?: T; error?: AppError } {
  try {
    const data = fn();
    return { data };
  } catch (error) {
    const appError = parseError(error);
    
    if (import.meta.env.DEV) {
      console.error(`Error during ${context?.action || 'operation'}:`, appError);
    }

    return { error: appError };
  }
}

/**
 * Assert condition and throw structured error
 * @param condition - Condition to check
 * @param message - Error message
 * @param code - Error code
 * @param statusCode - HTTP status code
 */
export function assert(
  condition: boolean,
  message: string,
  code: string = 'ASSERTION_ERROR',
  statusCode: number = 400
): void {
  if (!condition) {
    throw {
      code,
      message,
      statusCode,
      isUserFacing: statusCode < 500,
    } as AppError;
  }
}

/**
 * Retry failed operations with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Result of successful operation or final error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | AppError | undefined;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error | AppError;

      if (attempt < maxAttempts - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Format error for API response
 * @param error - Error to format
 * @returns Formatted error response
 */
export function formatErrorResponse(error: ErrorSource) {
  const parsed = parseError(error);
  
  return {
    success: false,
    error: {
      code: parsed.code,
      message: parsed.isUserFacing ? parsed.message : 'An error occurred',
      ...(import.meta.env.DEV && { details: parsed.details }),
    },
  };
}

/**
 * Safe JSON parse with error handling
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Create a typed error response
 * @param code - Error code
 * @param message - Error message
 * @param statusCode - HTTP status code
 * @param details - Additional details
 * @returns AppError
 */
export function createError(
  code: string,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>
): AppError {
  return {
    code,
    message,
    statusCode,
    isUserFacing: statusCode < 500,
    details,
  };
}
