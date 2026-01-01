import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { verifyClickPesaSignature } from './verify-signature.ts';
import { rateLimiters } from '../_shared/rate-limit.ts';
import { validateString, validateNumber, validateEmail, validatePhone, validateUUID } from '../_shared/sql-injection-prevention.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const clickpesaSecretKey = Deno.env.get('CLICKPESA_SECRET_KEY')!;

interface ClickPesaWebhookPayload {
  transaction_id?: string;
  order_reference?: string; // This is the payment_reference from our system
  status: 'completed' | 'failed' | 'pending' | 'cancelled';
  amount: number;
  currency: string;
  reference?: string; // booking_id or payment_id (legacy support)
  mobile_number?: string;
  customer_phone?: string;
  customer_email?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  payment_method?: string;
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
        console.error('Invalid webhook signature');
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
      console.error('Missing webhook signature');
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
    
    // SQL Injection Prevention: Validate and sanitize payload
    // ClickPesa sends order_reference (primary identifier) and optionally transaction_id
    const orderReference = payload.order_reference ? validateString(payload.order_reference, 100) : null;
    const transactionId = payload.transaction_id ? validateString(payload.transaction_id, 100) : null;
    
    // At least one identifier must be present
    if (!orderReference && !transactionId && !payload.reference) {
      return new Response(
        JSON.stringify({ error: 'Missing payment identifier (order_reference, transaction_id, or reference)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const status = validateString(payload.status, 20);
    if (!status || !['completed', 'failed', 'pending', 'cancelled'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const amount = validateNumber(payload.amount, 0, 10000000); // Max 10M TZS
    if (amount === null) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reference = payload.reference ? validateString(payload.reference, 100) : null;

    // Create sanitized payload
    const sanitizedPayload: ClickPesaWebhookPayload = {
      transaction_id: transactionId || undefined,
      order_reference: orderReference || undefined,
      status: status as 'completed' | 'failed' | 'pending' | 'cancelled',
      amount: amount,
      currency: validateString(payload.currency, 10) || 'TZS',
      reference: reference || undefined,
      mobile_number: payload.mobile_number ? validatePhone(payload.mobile_number) || undefined : undefined,
      customer_phone: payload.customer_phone ? validatePhone(payload.customer_phone) || undefined : undefined,
      customer_email: payload.customer_email ? validateEmail(payload.customer_email) || undefined : undefined,
      payment_method: payload.payment_method ? validateString(payload.payment_method, 20) || undefined : undefined,
      metadata: payload.metadata,
      timestamp: validateString(payload.timestamp, 50) || new Date().toISOString(),
    };
    
    // Log webhook receipt (without sensitive data)
    if (import.meta.env.DEV) {
      console.log('ClickPesa webhook received:', {
        transaction_id: sanitizedPayload.transaction_id,
        status: sanitizedPayload.status,
        amount: sanitizedPayload.amount,
        reference: sanitizedPayload.reference,
      });
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find payment by order_reference (primary - matches our payment_reference)
    // ClickPesa sends order_reference which matches our payment_reference field
    let paymentQuery = supabase
      .from('payments')
      .select('*, booking:bookings(*)');

    // Priority 1: order_reference (most reliable - matches payment_reference)
    if (sanitizedPayload.order_reference) {
      paymentQuery = paymentQuery.eq('payment_reference', sanitizedPayload.order_reference);
    } 
    // Priority 2: transaction_id
    else if (sanitizedPayload.transaction_id) {
      paymentQuery = paymentQuery.or(
        `transaction_id.eq.${sanitizedPayload.transaction_id},clickpesa_transaction_id.eq.${sanitizedPayload.transaction_id}`
      );
    } 
    // Priority 3: reference (legacy support - try as booking_id)
    else if (sanitizedPayload.reference) {
      const bookingId = validateUUID(sanitizedPayload.reference);
      if (bookingId) {
        paymentQuery = paymentQuery.eq('booking_id', bookingId);
      } else {
        // If not a UUID, try as payment_reference
        paymentQuery = paymentQuery.eq('payment_reference', sanitizedPayload.reference);
      }
    }

    const { data: payment, error: paymentError } = await paymentQuery.maybeSingle();

    if (paymentError) {
      console.error('Error fetching payment:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: paymentError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!payment) {
      // Try to find by booking_id if reference is provided
      // Validate reference as UUID first
      const bookingId = validateUUID(sanitizedPayload.reference);
      if (bookingId) {
        const { data: bookingPayment, error: bookingPaymentError } = await supabase
          .from('payments')
          .select('*, booking:bookings(*)')
          .eq('booking_id', bookingId)
          .maybeSingle();

        if (bookingPaymentError) {
          console.error('Error fetching booking payment:', bookingPaymentError);
          return new Response(
            JSON.stringify({ error: 'Database error', details: bookingPaymentError.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (!bookingPayment) {
          return new Response(
            JSON.stringify({ error: 'Payment not found', transaction_id: sanitizedPayload.transaction_id }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Validate payment amount matches booking amount (prevent amount manipulation)
        // Handle both field names for compatibility (database uses total_amount_tzs)
        const bookingAmount = Number(
          (bookingPayment.booking as any)?.total_price_tzs || 
          (bookingPayment.booking as any)?.total_amount_tzs || 
          0
        );
        if (sanitizedPayload.status === 'completed' && Math.abs(sanitizedPayload.amount - bookingAmount) > 0.01) {
          if (import.meta.env.DEV) {
            console.error('Amount mismatch:', { received: sanitizedPayload.amount, expected: bookingAmount });
          }
          return new Response(
            JSON.stringify({ 
              error: 'Payment amount mismatch', 
              received: sanitizedPayload.amount,
              expected: bookingAmount 
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Check if payment is already completed (prevent duplicate processing)
        if (bookingPayment.status === 'completed' && sanitizedPayload.status === 'completed') {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Payment already processed',
              payment_id: bookingPayment.id 
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Update payment (use transaction for atomicity)
        const { error: updateError } = await supabase.rpc('update_payment_status', {
          p_payment_id: bookingPayment.id,
          p_status: sanitizedPayload.status === 'completed' ? 'completed' : sanitizedPayload.status === 'failed' ? 'failed' : 'pending',
          p_transaction_id: sanitizedPayload.transaction_id,
          p_amount: sanitizedPayload.amount,
          p_booking_id: bookingPayment.booking_id,
        });

        if (updateError) {
          console.error('Error updating payment:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update payment', details: updateError.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Payment and booking status updated atomically by RPC function
        // Trigger booking confirmation email if payment completed
        if (sanitizedPayload.status === 'completed') {
          try {
            console.log('Invoking send-booking-email for booking:', bookingPayment.booking_id);
            const emailResult = await supabase.functions.invoke('send-booking-email', {
              body: {
                booking_id: bookingPayment.booking_id,
                type: 'confirmation',
              },
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
            });
            
            if (emailResult.error) {
              console.error('Error sending confirmation email:', {
                error: emailResult.error,
                booking_id: bookingPayment.booking_id,
              });
            } else {
              console.log('Confirmation email sent successfully:', bookingPayment.booking_id);
            }
          } catch (emailError: any) {
            console.error('Exception sending confirmation email:', {
              error: emailError,
              message: emailError?.message,
              booking_id: bookingPayment.booking_id,
            });
            // Don't fail the webhook if email fails
          }
        }

        return new Response(JSON.stringify({ success: true, payment_id: bookingPayment.id }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate payment amount matches booking amount (prevent amount manipulation)
    // Handle both field names for compatibility (database uses total_amount_tzs)
    const bookingAmount = Number(
      (payment.booking as any)?.total_price_tzs || 
      (payment.booking as any)?.total_amount_tzs || 
      0
    );
    if (sanitizedPayload.status === 'completed' && Math.abs(sanitizedPayload.amount - bookingAmount) > 0.01) {
      console.error('Amount mismatch:', { received: payload.amount, expected: bookingAmount });
      return new Response(
        JSON.stringify({ 
          error: 'Payment amount mismatch', 
          received: payload.amount,
          expected: bookingAmount 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if payment is already completed (prevent duplicate processing)
    if (payment.status === 'completed' && sanitizedPayload.status === 'completed') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment already processed',
          payment_id: payment.id 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update payment (use transaction for atomicity)
    const { error: updateError } = await supabase.rpc('update_payment_status', {
      p_payment_id: payment.id,
      p_status: sanitizedPayload.status === 'completed' ? 'completed' : sanitizedPayload.status === 'failed' ? 'failed' : 'pending',
      p_transaction_id: sanitizedPayload.transaction_id,
      p_amount: sanitizedPayload.amount,
      p_booking_id: payment.booking_id,
    });

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment', details: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Payment and booking status updated atomically by RPC function
    // Trigger booking confirmation email if payment completed
    if (sanitizedPayload.status === 'completed') {
      try {
        console.log('Invoking send-booking-email for booking:', payment.booking_id);
        const emailResult = await supabase.functions.invoke('send-booking-email', {
          body: {
            booking_id: payment.booking_id,
            type: 'confirmation',
          },
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        });
        
        if (emailResult.error) {
          console.error('Error sending confirmation email:', {
            error: emailResult.error,
            booking_id: payment.booking_id,
          });
        } else {
          console.log('Confirmation email sent successfully:', payment.booking_id);
        }
      } catch (emailError: any) {
        console.error('Exception sending confirmation email:', {
          error: emailError,
          message: emailError?.message,
          booking_id: payment.booking_id,
        });
        // Don't fail the webhook if email fails
      }
    }

    return new Response(JSON.stringify({ success: true, payment_id: payment.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

