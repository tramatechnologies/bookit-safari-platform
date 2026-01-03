import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStatusHookOptions {
  bookingId: string | null;
  enabled?: boolean;
  maxPollDuration?: number; // in milliseconds, default 5 minutes
  onSuccess?: () => void;
  onFailed?: () => void;
  onTimeout?: () => void;
}

export function usePaymentStatus({
  bookingId,
  enabled = false,
  maxPollDuration = 5 * 60 * 1000, // 5 minutes
  onSuccess,
  onFailed,
  onTimeout,
}: PaymentStatusHookOptions) {
  const [isPolling, setIsPolling] = useState(false);
  const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | 'timeout'>(
    'pending'
  );
  const [error, setError] = useState<string | null>(null);

  const checkPaymentStatus = useCallback(async () => {
    if (!bookingId) return;

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('status, payments(id, status)')
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        console.error('[usePaymentStatus] Error checking booking:', bookingError);
        return false;
      }

      if (booking?.status === 'confirmed') {
        setStatus('success');
        onSuccess?.();
        return true;
      }

      const failedPayment = booking?.payments?.find((p: any) => p.status === 'failed');
      if (failedPayment) {
        setStatus('failed');
        setError('Payment was not completed');
        onFailed?.();
        return true;
      }

      return false;
    } catch (error) {
      console.error('[usePaymentStatus] Polling error:', error);
      return false;
    }
  }, [bookingId, onSuccess, onFailed]);

  useEffect(() => {
    if (!enabled || !bookingId || !isPolling) {
      return;
    }

    let pollCount = 0;
    const maxPollCount = Math.ceil(maxPollDuration / 2000); // 2 second base interval
    const startTime = Date.now();

    const pollPaymentStatus = async () => {
      pollCount++;

      // Check if we've exceeded max duration
      if (Date.now() - startTime > maxPollDuration) {
        setStatus('timeout');
        setError('Payment confirmation timeout');
        setIsPolling(false);
        onTimeout?.();
        return;
      }

      const completed = await checkPaymentStatus();
      if (completed) {
        setIsPolling(false);
      }
    };

    // Initial poll immediately
    pollPaymentStatus();

    // Exponential backoff polling: start at 2s, max 10s
    const getInterval = (count: number) => {
      const baseInterval = 2000;
      const maxInterval = 10000;
      const interval = baseInterval * Math.pow(1.5, Math.floor(count / 10));
      return Math.min(interval, maxInterval);
    };

    const pollInterval = setInterval(() => {
      if (pollCount < maxPollCount) {
        pollPaymentStatus();
      }
    }, getInterval(pollCount));

    return () => {
      clearInterval(pollInterval);
    };
  }, [enabled, bookingId, isPolling, maxPollDuration, checkPaymentStatus, onTimeout]);

  return {
    status,
    error,
    isPolling,
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
    reset: () => {
      setStatus('pending');
      setError(null);
      setIsPolling(false);
    },
    checkNow: checkPaymentStatus,
  };
}
