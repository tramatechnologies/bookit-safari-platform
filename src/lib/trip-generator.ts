import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export interface TripGenerationOptions {
  daysAhead?: number;
  scheduleId?: string;
}

export interface TripGenerationResponse {
  success: boolean;
  trips_generated: number;
  trips: Array<{
    generated_trip_id: string;
    schedule_id: string;
    trip_date: string;
    available_seats: number;
    status: string;
  }>;
  error?: string;
}

/**
 * Trigger trip generation via Edge Function
 * Automatically creates trips from all schedules for upcoming dates
 */
export async function triggerTripGeneration(
  options: TripGenerationOptions = {}
): Promise<TripGenerationResponse> {
  try {
    const { daysAhead = 30, scheduleId } = options;

    // Get JWT token for authenticated request
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // Call the Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-trips`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          daysAhead,
          scheduleId: scheduleId || null,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate trips');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Get the API URL for the trip generation endpoint
 */
export function getTripGenerationEndpoint(): string {
  return `${SUPABASE_URL}/functions/v1/generate-trips`;
}

/**
 * Schedule automatic trip generation (client-side, runs on a timer)
 * Note: For production, consider using a cron job or scheduled function
 */
export function scheduleAutomaticTripGeneration(
  intervalMs: number = 1000 * 60 * 60, // 1 hour default
  daysAhead: number = 30,
  onSuccess?: (result: TripGenerationResponse) => void,
  onError?: (error: Error) => void
): () => void {
  let intervalId: number;

  const runGeneration = async () => {
    try {
      const result = await triggerTripGeneration({ daysAhead });
      onSuccess?.(result);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  // Run immediately on first call
  runGeneration();

  // Then schedule it to run periodically
  intervalId = setInterval(runGeneration, intervalMs) as unknown as number;

  // Return a cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Generate trips with retry logic
 */
export async function generateTripsWithRetry(
  options: TripGenerationOptions = {},
  maxRetries: number = 3,
  retryDelayMs: number = 1000
): Promise<TripGenerationResponse> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await triggerTripGeneration(options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Trip generation attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelayMs * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw lastError || new Error('Trip generation failed');
}
