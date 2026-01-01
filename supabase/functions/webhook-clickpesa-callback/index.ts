import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { verifyClickPesaSignature } from './verify-signature.ts';
import { rateLimiters } from './_shared/rate-limit.ts';
import { validateString, validateNumber, validateEmail, validatePhone, validateUUID } from './_shared/sql-injection-prevention.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const clickpesaSecretKey = Deno.env.get('CLICKPESA_SECRET_KEY')!;

/**
 * ClickPesa Webhook Event Types
 */
type ClickPesaEventType = 
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'PAYOUT_INITIATED'
  | 'PAYOUT_REFUNDED'
  | 'PAYOUT_REVERSED'
  | 'DEPOSIT_RECEIVED';

interface ClickPesaWebhookPayload {
  event: ClickPesaEventType;
  transaction_id?: string;
  order_reference?: string; // payment_reference from our system
  reference?: string; // booking_id or payment_id (legacy support)
  status?: 'completed' | 'failed' | 'pending' | 'cancelled' | 'refunded' | 'reversed';
  amount: number;
  currency: string;
  mobile_number?: string;
  customer_phone?: string;
  customer_email?: string;
  payment_method?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  payout_id?: string;
  deposit_id?: string;
  reason?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // Rate limiting for webhooks
  const rateLimitResponse = await rateLimiters.webhook(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Verify webhook signature (if ClickPesa provides one)
    const signature = req.headers.get('x-clickpesa-signature') || 
                     req.headers.get('x-signature') ||
                     req.headers.get('authorization');
    
    if (signature && clickpesaSecretKey) {
      // Verify the signature
      const isValid = await verifyClickPesaSignature(rawBody, signature, clickpesaSecretKey);
      
      if (!isValid) {
        if (import.meta.env.DEV) {
          console.error('Invalid webhook signature');
        }
        return new Response(
          JSON.stringify({ error: 'Invalid signature - request not authenticated' }), 
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } else if (clickpesaSecretKey) {
      // If secret key is configured but no signature provided, reject
      if (import.meta.env.DEV) {
        console.error('Missing webhook signature');
      }
      return new Response(
        JSON.stringify({ error: 'Missing signature - request not authenticated' }), 
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse payload after signature verification
    const payload: ClickPesaWebhookPayload = JSON.parse(rawBody);
    
    // Validate event type
    const validEvents: ClickPesaEventType[] = [
      'PAYMENT_RECEIVED',
      'PAYMENT_FAILED',
      'PAYOUT_INITIATED',
      'PAYOUT_REFUNDED',
      'PAYOUT_REVERSED',
      'DEPOSIT_RECEIVED',
    ];

    const eventType = validateString(payload.event, 50);
    if (!eventType || !validEvents.includes(eventType as ClickPesaEventType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event type', received: payload.event }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SQL Injection Prevention: Validate and sanitize payload
    const orderReference = payload.order_reference ? validateString(payload.order_reference, 100) : null;
    const transactionId = payload.transaction_id ? validateString(payload.transaction_id, 100) : null;
    const amount = validateNumber(payload.amount, 0, 10000000); // Max 10M TZS
    
    if (amount === null) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook receipt (without sensitive data)
    if (import.meta.env.DEV) {
      console.log('ClickPesa webhook received:', {
        event: eventType,
        transaction_id: transactionId,
        order_reference: orderReference,
        amount: amount,
      });
    }

    // Route to appropriate handler based on event type
    switch (eventType) {
      case 'PAYMENT_RECEIVED':
        return await handlePaymentReceived(supabase, payload, orderReference, transactionId, amount);
      
      case 'PAYMENT_FAILED':
        return await handlePaymentFailed(supabase, payload, orderReference, transactionId);
      
      case 'PAYOUT_INITIATED':
        return await handlePayoutInitiated(supabase, payload);
      
      case 'PAYOUT_REFUNDED':
        return await handlePayoutRefunded(supabase, payload, orderReference, transactionId);
      
      case 'PAYOUT_REVERSED':
        return await handlePayoutReversed(supabase, payload, orderReference, transactionId);
      
      case 'DEPOSIT_RECEIVED':
        return await handleDepositReceived(supabase, payload);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unhandled event type', event: eventType }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('Webhook error:', error);
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Handle PAYMENT_RECEIVED event
 * Updates payment status to completed and confirms booking
 */
async function handlePaymentReceived(
  supabase: any,
  payload: ClickPesaWebhookPayload,
  orderReference: string | null,
  transactionId: string | null,
  amount: number
): Promise<Response> {
  // Find payment by order_reference (primary), transaction_id, or reference
  let paymentQuery = supabase
    .from('payments')
    .select('*, booking:bookings(*)');

  if (orderReference) {
    paymentQuery = paymentQuery.eq('payment_reference', orderReference);
  } else if (transactionId) {
    paymentQuery = paymentQuery.or(
      `transaction_id.eq.${transactionId},clickpesa_transaction_id.eq.${transactionId}`
    );
  } else if (payload.reference) {
    const bookingId = validateUUID(payload.reference);
    if (bookingId) {
      paymentQuery = paymentQuery.eq('booking_id', bookingId);
    }
  }

  const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

  if (paymentError) {
    if (import.meta.env.DEV) {
      console.error('Error fetching payment:', paymentError);
    }
    return new Response(
      JSON.stringify({ error: 'Database error', details: paymentError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!payment) {
    return new Response(
      JSON.stringify({ error: 'Payment not found', transaction_id: transactionId }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate payment amount matches booking amount
  const bookingAmount = Number(
    (payment.booking as any)?.total_price_tzs || 
    (payment.booking as any)?.total_amount_tzs || 
    0
  );

  if (Math.abs(amount - bookingAmount) > 0.01) {
    if (import.meta.env.DEV) {
      console.error('Amount mismatch:', { received: amount, expected: bookingAmount });
    }
    return new Response(
      JSON.stringify({ 
        error: 'Payment amount mismatch', 
        received: amount,
        expected: bookingAmount 
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check if payment is already completed (prevent duplicate processing)
  if (payment.status === 'completed') {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment already processed',
        payment_id: payment.id 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Update payment status atomically
  const { error: updateError } = await supabase.rpc('update_payment_status', {
    p_payment_id: payment.id,
    p_status: 'completed',
    p_transaction_id: transactionId || undefined,
    p_amount: amount,
    p_booking_id: payment.booking_id,
  });

  if (updateError) {
    if (import.meta.env.DEV) {
      console.error('Error updating payment:', updateError);
    }
    return new Response(
      JSON.stringify({ error: 'Failed to update payment', details: updateError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Send booking confirmation email
  try {
    await supabase.functions.invoke('send-booking-email', {
      body: {
        booking_id: payment.booking_id,
        type: 'confirmation',
      },
    });
  } catch (emailError) {
    if (import.meta.env.DEV) {
      console.error('Error sending confirmation email:', emailError);
    }
    // Don't fail the webhook if email fails
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Payment received and processed',
      payment_id: payment.id 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handle PAYMENT_FAILED event
 * Updates payment status to failed
 */
async function handlePaymentFailed(
  supabase: any,
  payload: ClickPesaWebhookPayload,
  orderReference: string | null,
  transactionId: string | null
): Promise<Response> {
  // Find payment
  let paymentQuery = supabase
    .from('payments')
    .select('*, booking:bookings(*)');

  if (orderReference) {
    paymentQuery = paymentQuery.eq('payment_reference', orderReference);
  } else if (transactionId) {
    paymentQuery = paymentQuery.or(
      `transaction_id.eq.${transactionId},clickpesa_transaction_id.eq.${transactionId}`
    );
  } else if (payload.reference) {
    const bookingId = validateUUID(payload.reference);
    if (bookingId) {
      paymentQuery = paymentQuery.eq('booking_id', bookingId);
    }
  }

  const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

  if (paymentError || !payment) {
    return new Response(
      JSON.stringify({ error: 'Payment not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Update payment status to failed
  const { error: updateError } = await supabase
    .from('payments')
    .update({ 
      status: 'failed',
      clickpesa_transaction_id: transactionId || payment.clickpesa_transaction_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    if (import.meta.env.DEV) {
      console.error('Error updating payment:', updateError);
    }
    return new Response(
      JSON.stringify({ error: 'Failed to update payment', details: updateError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Payment failed status updated',
      payment_id: payment.id 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handle PAYOUT_INITIATED event
 * Logs payout initiation (for operator payouts)
 */
async function handlePayoutInitiated(
  supabase: any,
  payload: ClickPesaWebhookPayload
): Promise<Response> {
  // Log payout initiation
  // In the future, you might want to create a payouts table to track operator payouts
  if (import.meta.env.DEV) {
    console.log('Payout initiated:', {
      payout_id: payload.payout_id,
      amount: payload.amount,
      currency: payload.currency,
    });
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Payout initiation logged',
      payout_id: payload.payout_id 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handle PAYOUT_REFUNDED event
 * Handles refunds to customers
 */
async function handlePayoutRefunded(
  supabase: any,
  payload: ClickPesaWebhookPayload,
  orderReference: string | null,
  transactionId: string | null
): Promise<Response> {
  // Find payment
  let paymentQuery = supabase
    .from('payments')
    .select('*, booking:bookings(*)');

  if (orderReference) {
    paymentQuery = paymentQuery.eq('payment_reference', orderReference);
  } else if (transactionId) {
    paymentQuery = paymentQuery.or(
      `transaction_id.eq.${transactionId},clickpesa_transaction_id.eq.${transactionId}`
    );
  }

  const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

  if (paymentError || !payment) {
    return new Response(
      JSON.stringify({ error: 'Payment not found for refund' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Update payment status to refunded
  const { error: updateError } = await supabase
    .from('payments')
    .update({ 
      status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    if (import.meta.env.DEV) {
      console.error('Error updating refund status:', updateError);
    }
    return new Response(
      JSON.stringify({ error: 'Failed to update refund status', details: updateError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Cancel booking if refunded
  const { error: bookingUpdateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.booking_id);

  if (bookingUpdateError) {
    if (import.meta.env.DEV) {
      console.error('Error cancelling booking:', bookingUpdateError);
    }
  }

  // Send cancellation email
  try {
    await supabase.functions.invoke('send-booking-email', {
      body: {
        booking_id: payment.booking_id,
        type: 'cancellation',
      },
    });
  } catch (emailError) {
    if (import.meta.env.DEV) {
      console.error('Error sending cancellation email:', emailError);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Refund processed',
      payment_id: payment.id 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handle PAYOUT_REVERSED event
 * Handles payment reversals
 */
async function handlePayoutReversed(
  supabase: any,
  payload: ClickPesaWebhookPayload,
  orderReference: string | null,
  transactionId: string | null
): Promise<Response> {
  // Find payment
  let paymentQuery = supabase
    .from('payments')
    .select('*, booking:bookings(*)');

  if (orderReference) {
    paymentQuery = paymentQuery.eq('payment_reference', orderReference);
  } else if (transactionId) {
    paymentQuery = paymentQuery.or(
      `transaction_id.eq.${transactionId},clickpesa_transaction_id.eq.${transactionId}`
    );
  }

  const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

  if (paymentError || !payment) {
    return new Response(
      JSON.stringify({ error: 'Payment not found for reversal' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Update payment status to failed (reversed payments are treated as failed)
  // Store reversal info in payment_data
  const currentPaymentData = (payment.payment_data as Record<string, any>) || {};
  const { error: updateError } = await supabase
    .from('payments')
    .update({ 
      status: 'failed', // Use 'failed' since 'reversed' is not in enum
      payment_data: {
        ...currentPaymentData,
        reversal_reason: payload.reason || 'Payment reversed',
        reversed_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    if (import.meta.env.DEV) {
      console.error('Error updating reversal status:', updateError);
    }
    return new Response(
      JSON.stringify({ error: 'Failed to update reversal status', details: updateError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Cancel booking if reversed
  const { error: bookingUpdateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.booking_id);

  if (bookingUpdateError) {
    if (import.meta.env.DEV) {
      console.error('Error cancelling booking:', bookingUpdateError);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Payment reversal processed',
      payment_id: payment.id 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Handle DEPOSIT_RECEIVED event
 * Logs deposit received (for account deposits)
 */
async function handleDepositReceived(
  supabase: any,
  payload: ClickPesaWebhookPayload
): Promise<Response> {
  // Log deposit received
  // In the future, you might want to create a deposits table to track account deposits
  if (import.meta.env.DEV) {
    console.log('Deposit received:', {
      deposit_id: payload.deposit_id,
      amount: payload.amount,
      currency: payload.currency,
    });
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Deposit received logged',
      deposit_id: payload.deposit_id 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

