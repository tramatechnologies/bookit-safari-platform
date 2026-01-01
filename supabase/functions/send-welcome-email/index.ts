import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface WelcomeEmailRequest {
  user_id: string;
  email: string;
  full_name?: string;
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
    const { user_id, email, full_name }: WelcomeEmailRequest = await req.json();

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user profile to get full name if not provided
    let userName = full_name || 'Traveler';
    if (!full_name) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user_id)
        .single();
      
      if (profile?.full_name) {
        userName = profile.full_name;
      }
    }

    // Load welcome email template
    const websiteUrl = 'https://bookitsafari.com';
    let template: string;
    
    try {
      // Try to load from local email-templates directory
      template = await Deno.readTextFile('./email-templates/welcome.html');
    } catch (error) {
      // Try shared email-templates directory
      try {
        template = await Deno.readTextFile('../email-templates/welcome.html');
      } catch (error2) {
        // Fallback to inline template
        console.warn('Template file not found, using fallback template');
        template = getWelcomeEmailTemplate();
      }
    }

    // Replace template variables
    const html = template
      .replace(/\{\{full_name\}\}/g, userName)
      .replace(/\{\{website_url\}\}/g, websiteUrl);

    // Send email via send-email function
    const emailResponse = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: 'Welcome to Bookit Safari!',
        html,
      },
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    if (emailResponse.error) {
      console.error('Error invoking send-email function:', emailResponse.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send welcome email',
          details: emailResponse.error 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Welcome email sent successfully:', {
      user_id,
      email,
      response: emailResponse.data,
    });

    return new Response(
      JSON.stringify({ success: true, email_sent: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback template if file not found
function getWelcomeEmailTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Bookit Safari</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #f59e0b 100%); padding: 40px 30px; text-align: center;">
              <img src="https://bookitsafari.com/images/logo.png" alt="Bookit Safari Logo" style="max-width: 120px; height: auto; margin-bottom: 20px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Welcome to Bookit Safari!</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Your journey starts here</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">Hello {{full_name}},</p>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Thank you for joining Bookit Safari! We're thrilled to have you as part of our community of travelers exploring Tanzania.
              </p>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 8px; margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 15px 0; color: #0d9488; font-size: 20px; font-weight: bold;">Get Started</h2>
                    <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                      Your account has been successfully created. You can now book bus tickets, manage your trips, and explore all 31 regions of Tanzania!
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="{{website_url}}/search" style="display: inline-block; padding: 14px 32px; background-color: #0d9488; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Booking</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; border-collapse: collapse; border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; font-weight: 600;">Happy travels!</p>
                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                      Need help? Contact us at<br>
                      <a href="mailto:support@bookitsafari.com" style="color: #0d9488; text-decoration: none; font-weight: 600;">support@bookitsafari.com</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      © 2026 Bookit Safari. All rights reserved.<br>
                      Bookit Safari is a product of Trama Technologies (Holding Company)<br>
                      <a href="{{website_url}}" style="color: #6b7280; text-decoration: none;">bookitsafari.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

