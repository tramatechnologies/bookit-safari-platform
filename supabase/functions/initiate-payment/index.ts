import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { rateLimiters } from '../_shared/rate-limit.ts';
import { validateUUID, validateString, validatePhone } from '../_shared/sql-injection-prevention.ts';
import {
  previewPushRequest,
  initiatePushRequest,
  formatMobileNumber,
  validateMobileNumber,
} from '../_shared/clickpesa-api.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLICKPESA_WEBHOOK_URL = Deno.env.get('CLICKPESA_WEBHOOK_URL') || 
  `${supabaseUrl.replace('/rest/v1', '')}/functions/v1/clickpesa-webhook`;

interface PaymentRequest {
  booking_id: string;
  payment_method: 'mpesa' | 'tigopesa' | 'airtel' | 'clickpesa';
  phone_number?: string;
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

  // Rate limiting
  const rateLimitResponse = await rateLimiters.payment(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.json();
    
    // SQL Injection Prevention: Validate and sanitize inputs
    const bookingId = validateUUID(rawBody.booking_id);
    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Invalid booking ID format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const paymentMethod = validateString(rawBody.payment_method, 20);
    if (!paymentMethod || !['mpesa', 'tigopesa', 'airtel', 'clickpesa'].includes(paymentMethod)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment method' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const phoneNumber = rawBody.phone_number ? validatePhone(rawBody.phone_number) : undefined;
    if (['mpesa', 'tigopesa', 'airtel'].includes(paymentMethod) && !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required for mobile money payments' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: PaymentRequest = {
      booking_id: bookingId,
      payment_method: paymentMethod as 'mpesa' | 'tigopesa' | 'airtel' | 'clickpesa',
      phone_number: phoneNumber,
    };

    // Fetch booking with schedule to get actual price
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        schedule:schedules!inner(
          id,
          price_tzs,
          route:routes(id)
        )
      `)
      .eq('id', body.booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found or access denied' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if booking already has a completed payment
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('booking_id', body.booking_id)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'This booking already has a completed payment' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if booking is already confirmed
    if (booking.status === 'confirmed') {
      return new Response(
        JSON.stringify({ error: 'This booking is already confirmed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate actual amount from schedule (server-side validation)
    const actualAmount = Number(booking.schedule?.price_tzs || 0) * booking.total_seats;
    
    // Get booking amount (handle both field name variations)
    const bookingAmount = Number(
      (booking as any).total_price_tzs || 
      (booking as any).total_amount_tzs || 
      0
    );
    
    // Verify amount matches booking total (prevent manipulation)
    if (Math.abs(actualAmount - bookingAmount) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Payment amount mismatch - booking may have been modified' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create payment record with server-validated amount
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: body.booking_id,
        amount_tzs: actualAmount, // Use server-calculated amount
        payment_method: body.payment_method,
        status: 'pending',
        payment_data: body.phone_number ? { phone_number: body.phone_number } : {},
        payment_reference: `BOOKIT-${Date.now()}-${booking.id.substring(0, 8)}`,
      })
      .select()
      .single();

    if (paymentError) {
      // Check for duplicate payment constraint violation
      if (paymentError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'A payment for this booking already exists' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to create payment', details: paymentError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Integrate with ClickPesa API for mobile money payments
    if (['mpesa', 'tigopesa', 'airtel'].includes(body.payment_method) && body.phone_number) {
      try {
        // Format mobile number for ClickPesa
        const formattedPhone = formatMobileNumber(body.phone_number, body.payment_method);

        // Validate mobile number format
        if (!validateMobileNumber(body.phone_number, body.payment_method)) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid mobile number format for selected payment method',
              details: `Please ensure your ${body.payment_method.toUpperCase()} number is correct`,
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Step 1: Preview/Predict USSD-PUSH Request
        const previewResult = await previewPushRequest({
          mobile_number: formattedPhone,
          amount: actualAmount,
          currency: 'TZS',
          order_reference: payment.payment_reference!,
          payment_method: body.payment_method,
          description: `Bus booking payment - ${booking.booking_reference}`,
        });

        if (!previewResult.success || !previewResult.data?.available) {
          return new Response(
            JSON.stringify({
              error: 'Payment method not available',
              message: previewResult.message || 'The selected payment method is not available for this number',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Step 2: Initiate USSD-PUSH Request
        const pushResult = await initiatePushRequest({
          mobile_number: formattedPhone,
          amount: actualAmount,
          currency: 'TZS',
          order_reference: payment.payment_reference!,
          payment_method: body.payment_method,
          description: `Bus booking payment - ${booking.booking_reference}`,
          callback_url: CLICKPESA_WEBHOOK_URL,
        });

        if (!pushResult.success) {
          // Update payment status to failed
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', payment.id);

          return new Response(
            JSON.stringify({
              error: 'Failed to initiate payment',
              message: pushResult.message || 'Could not send payment request to your mobile device',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Update payment with transaction ID if provided
        if (pushResult.data?.transaction_id) {
          await supabase
            .from('payments')
            .update({
              clickpesa_transaction_id: pushResult.data.transaction_id,
              payment_data: {
                ...(payment.payment_data as object || {}),
                phone_number: formattedPhone,
                clickpesa_order_reference: payment.payment_reference,
              },
            })
            .eq('id', payment.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            payment_id: payment.id,
            amount: actualAmount,
            payment_method: body.payment_method,
            message: 'Payment request sent to your mobile device. Please check your phone and enter your PIN to complete the payment.',
            transaction_id: pushResult.data?.transaction_id,
            order_reference: payment.payment_reference,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (clickpesaError: any) {
        // Log error but don't fail the payment creation
        if (import.meta.env.DEV) {
          console.error('ClickPesa integration error:', clickpesaError);
        }

        // Update payment status to failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        return new Response(
          JSON.stringify({
            error: 'Payment initiation failed',
            message: clickpesaError.message || 'Failed to connect to payment provider. Please try again.',
            payment_id: payment.id, // Return payment ID so user can retry
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // For ClickPesa card payments or other methods, return payment ID
    // Card payments would use a different ClickPesa API endpoint
    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        amount: actualAmount,
        payment_method: body.payment_method,
        message: 'Payment initiated. Please complete payment with your provider.',
        order_reference: payment.payment_reference,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

