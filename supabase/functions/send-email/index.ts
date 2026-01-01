import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  reply_to?: string;
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
    const emailData: EmailRequest = await req.json();

    if (!emailData.to || !emailData.subject || !emailData.html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailData.from || 'Bookit Safari <noreply@bookitsafari.com>',
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        reply_to: emailData.reply_to || 'support@bookitsafari.com',
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('Resend API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        { status: resendResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await resendResponse.json();

    return new Response(JSON.stringify({ success: true, message_id: result.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

