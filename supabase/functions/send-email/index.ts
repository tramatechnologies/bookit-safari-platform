import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY');

// If Resend API key is not set, log warning but don't fail
if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent. Please configure it in Supabase secrets.');
}

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

    // Check if Resend API key is configured
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured. Cannot send email.');
      // In development, return success but log the email
      if (Deno.env.get('ENVIRONMENT') === 'development' || !Deno.env.get('RESEND_API_KEY')) {
        console.log('Email would be sent:', {
          to: emailData.to,
          subject: emailData.subject,
          from: emailData.from || 'Bookit Safari <noreply@bookitsafari.com>',
        });
        return new Response(
          JSON.stringify({ 
            success: true, 
            message_id: 'dev-mode',
            warning: 'RESEND_API_KEY not configured. Email not actually sent.' 
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please set RESEND_API_KEY in Supabase secrets.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log email attempt (without sensitive data)
    console.log('Attempting to send email:', {
      to: Array.isArray(emailData.to) ? emailData.to[0] : emailData.to,
      subject: emailData.subject,
      from: emailData.from || 'Bookit Safari <noreply@bookitsafari.com>',
      hasApiKey: !!resendApiKey,
    });

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

    const responseText = await resendResponse.text();
    let errorData: any;
    let result: any;

    try {
      if (!resendResponse.ok) {
        errorData = JSON.parse(responseText);
        console.error('Resend API error:', {
          status: resendResponse.status,
          statusText: resendResponse.statusText,
          error: errorData,
        });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send email', 
            details: errorData,
            status: resendResponse.status,
          }),
          { status: resendResponse.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
      result = JSON.parse(responseText);
      console.log('Email sent successfully:', { message_id: result.id });
    } catch (parseError) {
      console.error('Failed to parse Resend response:', parseError, 'Response:', responseText);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from Resend API', 
          details: responseText.substring(0, 200) 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

