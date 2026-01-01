/**
 * SQL Injection Prevention Utilities
 * Additional validation layer on top of Supabase's parameterized queries
 */

/**
 * Dangerous SQL keywords and patterns
 */
const SQL_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
  'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', 'SCRIPT>', '<SCRIPT',
  '--', '/*', '*/', ';', 'OR', 'AND', '=', 'LIKE', 'IN',
  'BETWEEN', 'IS', 'NULL', 'NOT', 'EXISTS', 'HAVING', 'GROUP BY',
  'ORDER BY', 'LIMIT', 'OFFSET', 'JOIN', 'INNER', 'OUTER', 'LEFT',
  'RIGHT', 'FULL', 'CROSS', 'ON', 'AS', 'CASE', 'WHEN', 'THEN',
  'ELSE', 'END', 'IF', 'ELSEIF', 'WHILE', 'FOR', 'LOOP', 'BEGIN',
  'TRANSACTION', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'RELEASE',
  'GRANT', 'REVOKE', 'DENY', 'TRUNCATE', 'MERGE', 'DECLARE',
  'SET', 'PRINT', 'RAISERROR', 'THROW', 'TRY', 'CATCH', 'RETURN',
  'GOTO', 'WAITFOR', 'BREAK', 'CONTINUE', 'OPEN', 'CLOSE', 'FETCH',
  'DEALLOCATE', 'KILL', 'CHECKPOINT', 'DBCC', 'BACKUP', 'RESTORE',
  'BULK', 'INSERT', 'BULK', 'UPDATE', 'BULK', 'DELETE', 'BULK', 'SELECT',
];

const SQL_OPERATORS = ['=', '<', '>', '<=', '>=', '<>', '!=', 'LIKE', 'IN', 'BETWEEN'];

/**
 * Check if a string contains potentially dangerous SQL patterns
 */
export function containsSQLInjection(input: string | null | undefined): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const upperInput = input.toUpperCase().trim();
  
  // Check for SQL comment patterns
  if (upperInput.includes('--') || upperInput.includes('/*') || upperInput.includes('*/')) {
    return true;
  }

  // Check for semicolon (statement terminator)
  if (upperInput.includes(';')) {
    return true;
  }

  // Check for SQL keywords in suspicious contexts
  for (const keyword of SQL_KEYWORDS) {
    // Look for keyword followed by space or special characters (not just as part of a word)
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(upperInput)) {
      return true;
    }
  }

  // Check for UNION-based injection patterns
  if (/UNION\s+ALL\s+SELECT/i.test(upperInput)) {
    return true;
  }

  // Check for stacked queries (multiple statements)
  if (upperInput.split(';').length > 1) {
    return true;
  }

  // Check for hex encoding attempts
  if (/0x[0-9a-f]+/i.test(upperInput)) {
    return true;
  }

  // Check for char() or ascii() functions (common in SQL injection)
  if (/CHAR\s*\(|ASCII\s*\(|CONCAT\s*\(/i.test(upperInput)) {
    return true;
  }

  return false;
}

/**
 * Sanitize input to prevent SQL injection
 * Note: Supabase uses parameterized queries, but this adds an extra layer
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Remove SQL comment patterns
  sanitized = sanitized.replace(/--.*$/gm, '');
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove semicolons (statement terminators)
  sanitized = sanitized.replace(/;/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validate and sanitize UUID input
 */
export function validateUUID(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // UUID format: 8-4-4-4-12 hexadecimal characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(input)) {
    return null;
  }

  // Check for SQL injection attempts
  if (containsSQLInjection(input)) {
    return null;
  }

  return input.toLowerCase();
}

/**
 * Validate and sanitize numeric input
 */
export function validateNumber(
  input: string | number | null | undefined,
  min?: number,
  max?: number
): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  let num: number;
  
  if (typeof input === 'string') {
    // Check for SQL injection
    if (containsSQLInjection(input)) {
      return null;
    }
    
    num = parseFloat(input);
  } else {
    num = input;
  }

  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
}

/**
 * Validate and sanitize string input with length limits
 */
export function validateString(
  input: string | null | undefined,
  maxLength: number = 1000,
  minLength: number = 0
): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Check for SQL injection
  if (containsSQLInjection(input)) {
    return null;
  }

  // Check length
  if (input.length < minLength || input.length > maxLength) {
    return null;
  }

  // Sanitize
  const sanitized = sanitizeInput(input);

  return sanitized;
}

/**
 * Validate email input
 */
export function validateEmail(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Check for SQL injection
  if (containsSQLInjection(input)) {
    return null;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input)) {
    return null;
  }

  // Length check
  if (input.length > 254) {
    return null;
  }

  return input.toLowerCase().trim();
}

/**
 * Validate phone number input
 */
export function validatePhone(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Check for SQL injection
  if (containsSQLInjection(input)) {
    return null;
  }

  // Remove non-digit characters
  const digits = input.replace(/\D/g, '');

  // Check length (typical phone numbers are 10-15 digits)
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  return digits;
}

/**
 * Validate object keys to prevent NoSQL injection
 */
export function validateObjectKeys(obj: Record<string, any>): boolean {
  const dangerousKeys = ['$', '.', '__proto__', 'constructor', 'prototype'];
  
  for (const key of Object.keys(obj)) {
    if (dangerousKeys.some(dangerous => key.includes(dangerous))) {
      return false;
    }
  }
  
  return true;
}

