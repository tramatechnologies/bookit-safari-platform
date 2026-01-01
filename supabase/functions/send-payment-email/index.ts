import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface PaymentEmailRequest {
  payment_id: string;
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

  try {
    const { payment_id }: PaymentEmailRequest = await req.json();

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: payment_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch payment with booking details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          *,
          passenger_name,
          passenger_email,
          passenger_phone,
          booking_number
        )
      `)
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found', details: paymentError?.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (payment.status !== 'completed') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed yet' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const booking = payment.booking;

    // Generate email HTML
    const subject = `Payment Confirmed - ${booking.booking_number}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Payment Confirmed!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px;">Dear ${booking.passenger_name},</p>
          
          <p>Your payment has been successfully processed. Your booking is now confirmed!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h2 style="margin-top: 0; color: #059669;">Payment Details</h2>
            <p><strong>Transaction ID:</strong> <span style="font-family: monospace;">${payment.transaction_id || payment.clickpesa_transaction_id || 'N/A'}</span></p>
            <p><strong>Amount Paid:</strong> <span style="font-size: 24px; font-weight: bold; color: #059669;">TZS ${Number(payment.amount_tzs).toLocaleString()}</span></p>
            <p><strong>Payment Method:</strong> ${payment.payment_method || 'N/A'}</p>
            <p><strong>Booking Number:</strong> <span style="font-family: monospace; font-weight: bold;">${booking.booking_number}</span></p>
            <p><strong>Payment Date:</strong> ${payment.completed_at ? new Date(payment.completed_at).toLocaleString('en-TZ') : 'N/A'}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              ✅ Your booking is confirmed! You will receive a separate email with your trip details.
            </p>
          </div>
          
          <p style="margin-top: 30px;">Thank you for your payment!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions about this payment, please contact our support team at support@bookitsafari.com
          </p>
        </div>
      </body>
      </html>
    `;

    // Send email via send-email function
    const emailResponse = await supabase.functions.invoke('send-email', {
      body: {
        to: booking.passenger_email || booking.passenger_phone + '@sms.resend.com',
        subject,
        html,
      },
    });

    if (emailResponse.error) {
      console.error('Error sending payment email:', emailResponse.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResponse.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true, email_sent: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Payment email error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

