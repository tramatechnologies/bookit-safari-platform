import { z } from 'zod';

/**
 * UUID validation schema
 * Validates that a string is a valid UUID v4 format
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Validate UUID from URL parameters
 */
export function validateUuid(id: string | undefined): string | null {
  if (!id) return null;
  const result = uuidSchema.safeParse(id);
  return result.success ? id : null;
}

