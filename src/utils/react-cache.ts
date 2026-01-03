// React-specific cache utilities for the Bookit Safari app
import { useState, useEffect } from 'react';
import { appCache } from './cache';

// Cache hook for React components
export function useCachedState<T>(
  key: string,
  initialValue: T,
  ttl?: number
): [T, (value: T) => void] {
  const [cachedValue, setCachedValue] = useState<T>(() => {
    const cached = appCache.get<T>(key);
    return cached !== null ? cached : initialValue;
  });

  useEffect(() => {
    const cached = appCache.get<T>(key);
    if (cached !== null) {
      setCachedValue(cached);
    }
  }, [key]);

  const setValue = (value: T) => {
    setCachedValue(value);
    appCache.set(key, value, ttl);
  };

  return [cachedValue, setValue];
}