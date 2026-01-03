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
  payment_method: 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa' | 'clickpesa';
  phone_number?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
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
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: corsHeaders }
      );
    }

    let rawBody;
    try {
      rawBody = await req.json();
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body - JSON parse failed', details: parseError.message }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // SQL Injection Prevention: Validate and sanitize inputs
    const bookingId = validateUUID(rawBody.booking_id);
    if (!bookingId) {
      console.error('Invalid booking ID:', rawBody.booking_id);
      return new Response(
        JSON.stringify({ error: 'Invalid booking ID format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const paymentMethod = validateString(rawBody.payment_method, 20);
    if (!paymentMethod || !['mpesa', 'tigopesa', 'airtel', 'clickpesa'].includes(paymentMethod)) {
      console.error('Invalid payment method:', rawBody.payment_method, 'validated:', paymentMethod);
      return new Response(
        JSON.stringify({ error: 'Invalid payment method' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const phoneNumber = rawBody.phone_number ? validatePhone(rawBody.phone_number) : undefined;
    if (['mpesa', 'tigopesa', 'airtel', 'halopesa'].includes(paymentMethod) && !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required for mobile money payments' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const body: PaymentRequest = {
      booking_id: bookingId,
      payment_method: paymentMethod as 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa' | 'clickpesa',
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
        { status: 404, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if booking is already confirmed
    if (booking.status === 'confirmed') {
      return new Response(
        JSON.stringify({ error: 'This booking is already confirmed' }),
        { status: 400, headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    // Create payment record with server-validated amount
    const paymentReference = `BOOKIT-${Date.now()}-${booking.id.substring(0, 8)}`;
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: body.booking_id,
        amount_tzs: actualAmount,
        payment_method: body.payment_method,
        status: 'pending',
        payment_data: body.phone_number ? { phone_number: body.phone_number, reference: paymentReference } : { reference: paymentReference },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment insert error:', paymentError);
      console.error('Payment error code:', paymentError.code);
      console.error('Payment error details:', JSON.stringify(paymentError));
      // Check for duplicate payment constraint violation
      if (paymentError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'A payment for this booking already exists' }),
          { status: 409, headers: corsHeaders }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment', 
          details: paymentError.message,
          code: paymentError.code 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Integrate with ClickPesa API for mobile money payments
    if (['mpesa', 'tigopesa', 'airtel', 'halopesa'].includes(body.payment_method) && body.phone_number) {
      try {
        // Format mobile number for ClickPesa
        const formattedPhone = formatMobileNumber(body.phone_number, body.payment_method as 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa');

        // Validate mobile number format
        if (!validateMobileNumber(body.phone_number, body.payment_method as 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa')) {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid mobile number format for selected payment method',
              details: `Please ensure your ${body.payment_method.toUpperCase()} number is correct`,
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Step 1: Preview/Predict USSD-PUSH Request
        const previewResult = await previewPushRequest({
          phoneNumber: formattedPhone,
          amount: actualAmount,
          currency: 'TZS',
          orderReference: paymentReference,
        });

        // Check if any payment method is available
        const hasAvailableMethod = previewResult.activeMethods && previewResult.activeMethods.length > 0;
        if (!hasAvailableMethod) {
          return new Response(
            JSON.stringify({
              error: 'Payment method not available',
              message: 'The selected payment method is not available for this number. Please try a different payment method or verify your phone number.',
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Step 2: Initiate USSD-PUSH Request
        const pushResult = await initiatePushRequest({
          phoneNumber: formattedPhone,
          amount: actualAmount,
          currency: 'TZS',
          orderReference: paymentReference,
        });

        // Handle USSD push initiation failure
        if (!pushResult || pushResult.status === 'FAILED') {
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', payment.id);

          return new Response(
            JSON.stringify({
              error: 'Failed to initiate payment',
              message: 'Could not send payment request to your mobile device. Please try again.',
            }),
            { status: 500, headers: corsHeaders }
          );
        }

        // Update payment with transaction ID from ClickPesa response
        if (pushResult.id) {
          await supabase
            .from('payments')
            .update({
              transaction_id: pushResult.id,
              payment_data: {
                ...(payment.payment_data as object || {}),
                phone_number: formattedPhone,
                order_reference: paymentReference,
                clickpesa_transaction_id: pushResult.id,
                clickpesa_status: pushResult.status,
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
            transaction_id: pushResult.id,
            order_reference: paymentReference,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (clickpesaError: any) {
        console.error('ClickPesa integration error:', clickpesaError);

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
          { status: 500, headers: corsHeaders }
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
        order_reference: paymentReference,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error details:', JSON.stringify(error));
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message, details: error.toString() }),
      { status: 500, headers: corsHeaders }
    );
  }
});

