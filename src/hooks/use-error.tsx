/**
 * Custom hook for consistent error handling in React components
 * Provides standardized error state management and recovery patterns
 */

import { useState, useCallback } from 'react';
import {
  AppError,
  ErrorCategory,
  parseError,
  categorizeError,
  getErrorMessage,
  ErrorSource,
} from '@/lib/utils/error-handling';

/**
 * Error state tracked by useError hook
 */
export interface ErrorState {
  error: AppError | null;
  category: ErrorCategory | null;
  userMessage: string;
  isRetryable: boolean;
  retryCount: number;
}

/**
 * Configuration for error behavior
 */
export interface ErrorConfig {
  maxRetries?: number;
  onErrorCallback?: (error: AppError) => void;
  logErrors?: boolean;
  context?: { action?: string; entity?: string };
}

/**
 * Custom hook for managing errors consistently
 *
 * @param config - Configuration for error handling
 * @returns Error state and handlers
 *
 * @example
 * const { error, setError, clearError, retry } = useError({
 *   context: { action: 'fetch bookings', entity: 'booking' }
 * });
 *
 * try {
 *   await fetchData();
 * } catch (err) {
 *   setError(err);
 * }
 */
export const useError = (config: ErrorConfig = {}) => {
  const {
    maxRetries = 3,
    onErrorCallback,
    logErrors = true,
    context,
  } = config;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    category: null,
    userMessage: '',
    isRetryable: false,
    retryCount: 0,
  });

  /**
   * Set error with full processing
   */
  const setError = useCallback((error: ErrorSource) => {
    const parsed = parseError(error);
    const category = categorizeError(error);
    const userMessage = getErrorMessage(error, context);

    // Determine if error is retryable
    const isRetryable = [
      ErrorCategory.NETWORK,
      ErrorCategory.RATE_LIMIT,
      ErrorCategory.SERVER,
    ].includes(category);

    if (logErrors && import.meta.env.DEV) {
      console.error(`[${category}] ${parsed.message}`, parsed);
    }

    const newState: ErrorState = {
      error: parsed,
      category,
      userMessage,
      isRetryable,
      retryCount: 0,
    };

    setErrorState(newState);
    onErrorCallback?.(parsed);
  }, [context, logErrors, onErrorCallback]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      category: null,
      userMessage: '',
      isRetryable: false,
      retryCount: 0,
    });
  }, []);

  /**
   * Retry operation
   */
  const retry = useCallback((fn: () => Promise<void>) => {
    return async () => {
      if (errorState.retryCount >= maxRetries) {
        const error = parseError('Max retries exceeded');
        setErrorState((prev) => ({
          ...prev,
          error,
          userMessage: getErrorMessage(error, context),
        }));
        return;
      }

      try {
        clearError();
        await fn();
      } catch (error) {
        setError(error);
        setErrorState((prev) => ({
          ...prev,
          retryCount: prev.retryCount + 1,
        }));
      }
    };
  }, [errorState.retryCount, maxRetries, clearError, setError, context]);

  /**
   * Handle async operation with automatic error handling
   */
  const handle = useCallback(
    async <T>(fn: () => Promise<T>, onSuccess?: (data: T) => void): Promise<T | null> => {
      try {
        clearError();
        const result = await fn();
        onSuccess?.(result);
        return result;
      } catch (error) {
        setError(error);
        return null;
      }
    },
    [clearError, setError]
  );

  return {
    // State
    error: errorState.error,
    category: errorState.category,
    userMessage: errorState.userMessage,
    isRetryable: errorState.isRetryable,
    retryCount: errorState.retryCount,
    hasError: !!errorState.error,

    // Handlers
    setError,
    clearError,
    retry,
    handle,

    // Helpers
    canRetry: errorState.isRetryable && errorState.retryCount < maxRetries,
  };
};

/**
 * Hook for managing multiple independent errors
 * Useful for forms with multiple fields
 *
 * @example
 * const { errors, setError, clearError } = useErrorMap();
 * errors.email // specific field error
 */
export const useErrorMap = () => {
  const [errors, setErrors] = useState<Record<string, AppError | null>>({});

  const setError = useCallback((field: string, error: ErrorSource) => {
    setErrors((prev) => ({
      ...prev,
      [field]: parseError(error),
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback((field?: string) => {
    if (field) return !!errors[field];
    return Object.keys(errors).length > 0;
  }, [errors]);

  const getErrorMessage = useCallback(
    (field: string, context?: { action?: string; entity?: string }) => {
      const error = errors[field];
      if (!error) return '';
      
      return error.message || `Error in ${field}`;
    },
    [errors]
  );

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasError,
    getErrorMessage,
  };
};
