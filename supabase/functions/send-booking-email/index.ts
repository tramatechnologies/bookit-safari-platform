import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface BookingEmailRequest {
  booking_id: string;
  type: 'confirmation' | 'cancellation' | 'reminder';
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
    const { booking_id, type }: BookingEmailRequest = await req.json();

    if (!booking_id || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: booking_id, type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking with all related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        schedule:schedules(
          *,
          route:routes(
            *,
            departure_region:regions!routes_departure_region_id_fkey(name, code),
            destination_region:regions!routes_destination_region_id_fkey(name, code),
            operator:bus_operators(company_name)
          ),
          bus:buses(bus_number, plate_number, bus_type)
        )
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found', details: bookingError?.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const schedule = booking.schedule;
    const route = schedule?.route;
    const bus = schedule?.bus;
    const operator = route?.operator;

    // Generate email HTML based on type
    let subject = '';
    let html = '';

    if (type === 'confirmation') {
      subject = `Booking Confirmed - ${booking.booking_number}`;
      html = generateConfirmationEmail(booking, schedule, route, bus, operator);
    } else if (type === 'cancellation') {
      subject = `Booking Cancelled - ${booking.booking_number}`;
      html = generateCancellationEmail(booking, schedule, route);
    } else if (type === 'reminder') {
      subject = `Reminder: Your Trip Tomorrow - ${booking.booking_number}`;
      html = generateReminderEmail(booking, schedule, route, bus);
    }

    // Send email via send-email function
    const emailResponse = await supabase.functions.invoke('send-email', {
      body: {
        to: booking.passenger_email || booking.passenger_phone + '@sms.resend.com', // Fallback to SMS if no email
        subject,
        html,
      },
    });

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error);
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
    console.error('Booking email error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function generateConfirmationEmail(booking: any, schedule: any, route: any, bus: any, operator: any) {
  const departureDate = schedule?.departure_date
    ? new Date(schedule.departure_date).toLocaleDateString('en-TZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px;">Dear ${booking.passenger_name},</p>
        
        <p>Your bus booking has been confirmed. Here are your booking details:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488;">
          <h2 style="margin-top: 0; color: #0d9488;">Booking Information</h2>
          <p><strong>Booking Number:</strong> <span style="font-family: monospace; font-weight: bold;">${booking.booking_number}</span></p>
          <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Confirmed</span></p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0d9488; margin-top: 0;">Trip Details</h3>
          <p><strong>Route:</strong> ${route?.departure_region?.name || 'N/A'} → ${route?.destination_region?.name || 'N/A'}</p>
          <p><strong>Date:</strong> ${departureDate}</p>
          <p><strong>Departure Time:</strong> ${schedule?.departure_time?.substring(0, 5) || 'N/A'}</p>
          <p><strong>Operator:</strong> ${operator?.company_name || 'N/A'}</p>
        </div>
        
        ${bus ? `
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
          <h3 style="color: #92400e; margin-top: 0;">🚌 Your Bus Information</h3>
          <p style="font-size: 24px; font-weight: bold; color: #92400e; margin: 10px 0;">
            Bus ${bus.bus_number || 'N/A'}
          </p>
          ${bus.plate_number ? `<p style="font-family: monospace; color: #78350f;">Plate: ${bus.plate_number}</p>` : ''}
          ${bus.bus_type ? `<p style="color: #78350f;">Type: ${bus.bus_type}</p>` : ''}
          <p style="color: #78350f; font-size: 14px; margin-top: 10px;">
            ⚠️ Please look for this bus at the terminal
          </p>
        </div>
        ` : ''}
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0d9488; margin-top: 0;">Seat Information</h3>
          <p><strong>Seats:</strong> ${booking.seat_numbers.join(', ')}</p>
          <p><strong>Total Amount:</strong> TZS ${Number((booking as any).total_price_tzs || (booking as any).total_amount_tzs || 0).toLocaleString()}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #991b1b; margin-top: 0;">Important Reminders</h3>
          <ul style="color: #7f1d1d;">
            <li>Arrive at the terminal at least 30 minutes before departure</li>
            <li>Look for bus number <strong>${bus?.bus_number || 'as shown above'}</strong> at the terminal</li>
            <li>Bring a valid ID for verification</li>
            <li>Keep this email for reference</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px;">Thank you for choosing Bookit Safari!</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions, please contact our support team at support@bookitsafari.com
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateCancellationEmail(booking: any, schedule: any, route: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Cancelled</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Dear ${booking.passenger_name},</p>
        
        <p>Your booking (${booking.booking_number}) has been cancelled.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Route:</strong> ${route?.departure_region?.name || 'N/A'} → ${route?.destination_region?.name || 'N/A'}</p>
          <p><strong>Refund:</strong> Processing (if applicable)</p>
        </div>
        
        <p>If you have any questions, please contact our support team at support@bookitsafari.com</p>
      </div>
    </body>
    </html>
  `;
}

function generateReminderEmail(booking: any, schedule: any, route: any, bus: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Trip Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0d9488; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Trip Reminder</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Dear ${booking.passenger_name},</p>
        
        <p>This is a reminder that your trip is tomorrow!</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Route:</strong> ${route?.departure_region?.name || 'N/A'} → ${route?.destination_region?.name || 'N/A'}</p>
          <p><strong>Departure Time:</strong> ${schedule?.departure_time?.substring(0, 5) || 'N/A'}</p>
          ${bus ? `<p><strong>Bus Number:</strong> ${bus.bus_number || 'N/A'}</p>` : ''}
        </div>
        
        <p>Don't forget to arrive 30 minutes early!</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Questions? Contact us at support@bookitsafari.com
        </p>
      </div>
    </body>
    </html>
  `;
}

