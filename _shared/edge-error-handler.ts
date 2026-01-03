/**
 * Edge Function Error Handling Utilities
 * Standardized error handling for Supabase Edge Functions
 * 
 * Usage in edge functions:
 * ```typescript
 * import { handleError, assertRequest, wrapHandler } from './_shared/edge-error-handler';
 * 
 * export const handler = wrapHandler(async (req) => {
 *   assertRequest(req.method === 'POST', 'Method not allowed', 405);
 *   const data = await processRequest(req);
 *   return { success: true, data };
 * });
 * ```
 */

/**
 * Standard error response format for edge functions
 */
export interface EdgeFunctionError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

/**
 * Standard success response format
 */
export interface EdgeFunctionSuccess<T> {
  success: true;
  data?: T;
}

/**
 * Edge function handler type
 */
export type EdgeHandler<T = any> = (req: Request) => Promise<EdgeFunctionSuccess<T>>;

/**
 * Create error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number = 400
): Response {
  const errorResponse: EdgeFunctionError = {
    success: false,
    error: {
      code,
      message,
      statusCode,
    },
  };

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data?: T,
  statusCode: number = 200
): Response {
  const response: EdgeFunctionSuccess<T> = {
    success: true,
    data,
  };

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Assert condition in edge function
 * Throws error if condition is false
 */
export function assertRequest(
  condition: boolean,
  message: string,
  statusCode: number = 400,
  code: string = 'VALIDATION_ERROR'
): void {
  if (!condition) {
    throw new EdgeFunctionRequestError(code, message, statusCode);
  }
}

/**
 * Custom error class for edge functions
 */
export class EdgeFunctionRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'EdgeFunctionRequestError';
  }
}

/**
 * Validate JSON payload
 */
export async function validateJsonPayload(req: Request): Promise<any> {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new EdgeFunctionRequestError(
        'INVALID_CONTENT_TYPE',
        'Content-Type must be application/json',
        400
      );
    }

    const body = await req.text();
    if (!body) {
      throw new EdgeFunctionRequestError(
        'EMPTY_BODY',
        'Request body is required',
        400
      );
    }

    try {
      return JSON.parse(body);
    } catch {
      throw new EdgeFunctionRequestError(
        'INVALID_JSON',
        'Request body must be valid JSON',
        400
      );
    }
  } catch (error) {
    if (error instanceof EdgeFunctionRequestError) {
      throw error;
    }
    throw new EdgeFunctionRequestError(
      'PAYLOAD_ERROR',
      'Failed to parse request payload',
      400
    );
  }
}

/**
 * Log error in edge function (will be visible in Supabase logs)
 */
export function logEdgeFunctionError(
  error: unknown,
  context?: { function?: string; userId?: string; action?: string }
): void {
  const timestamp = new Date().toISOString();
  const contextStr = context
    ? ` [${[context.function, context.userId, context.action].filter(Boolean).join(' | ')}]`
    : '';

  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (error instanceof EdgeFunctionRequestError) {
      console.error(`[${timestamp}] Request Error${contextStr}:`, {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
    } else if (error instanceof Error) {
      console.error(`[${timestamp}] Error${contextStr}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error(`[${timestamp}] Unknown Error${contextStr}:`, error);
    }
  }
}

/**
 * Wrap edge function handler with automatic error handling
 * Converts thrown errors to proper error responses
 */
export function wrapHandler<T = any>(
  handler: EdgeHandler<T>,
  context?: { function?: string }
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      const result = await handler(req);
      return createSuccessResponse(result.data);
    } catch (error) {
      // Handle request errors
      if (error instanceof EdgeFunctionRequestError) {
        logEdgeFunctionError(error, { ...context, action: 'validation' });
        return createErrorResponse(error.code, error.message, error.statusCode);
      }

      // Handle Supabase/database errors
      if (error instanceof Error) {
        const message = error.message;
        let code = 'INTERNAL_ERROR';
        let statusCode = 500;

        // Detect specific error types
        if (message.includes('not found')) {
          code = 'NOT_FOUND';
          statusCode = 404;
        } else if (message.includes('already exists')) {
          code = 'CONFLICT';
          statusCode = 409;
        } else if (message.includes('permission')) {
          code = 'FORBIDDEN';
          statusCode = 403;
        } else if (message.includes('unauthorized')) {
          code = 'UNAUTHORIZED';
          statusCode = 401;
        }

        logEdgeFunctionError(error, { ...context, action: 'execution' });
        return createErrorResponse(
          code,
          import.meta.env.DEV ? message : 'An error occurred',
          statusCode
        );
      }

      // Handle unknown errors
      logEdgeFunctionError(error, { ...context, action: 'unknown' });
      return createErrorResponse(
        'UNKNOWN_ERROR',
        'An unexpected error occurred',
        500
      );
    }
  };
}

/**
 * Rate limit edge function
 */
export function createRateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Retry after ${retryAfter} seconds`,
        statusCode: 429,
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}

/**
 * Validate authorization
 */
export function validateAuthorization(
  authHeader?: string,
  expectedToken?: string
): void {
  if (!authHeader) {
    throw new EdgeFunctionRequestError(
      'MISSING_AUTH',
      'Authorization header is required',
      401
    );
  }

  const token = authHeader.replace('Bearer ', '');

  if (expectedToken && token !== expectedToken) {
    throw new EdgeFunctionRequestError(
      'INVALID_TOKEN',
      'Invalid authorization token',
      401
    );
  }
}

/**
 * Safe database operation with error handling
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Convert database errors to request errors
    if (message.includes('duplicate')) {
      throw new EdgeFunctionRequestError(
        'DUPLICATE_ENTRY',
        `${context || 'Resource'} already exists`,
        409
      );
    }

    if (message.includes('not found')) {
      throw new EdgeFunctionRequestError(
        'NOT_FOUND',
        `${context || 'Resource'} not found`,
        404
      );
    }

    if (message.includes('violates')) {
      throw new EdgeFunctionRequestError(
        'CONSTRAINT_VIOLATION',
        'Invalid data provided',
        400
      );
    }

    throw error;
  }
}

/**
 * Timeout helper for long-running operations
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new EdgeFunctionRequestError(
              'TIMEOUT',
              'Operation timed out',
              504
            )
          ),
        timeoutMs
      )
    ),
  ]);
}
