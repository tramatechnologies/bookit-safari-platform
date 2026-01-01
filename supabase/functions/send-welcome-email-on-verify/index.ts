import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * This function is called via Supabase webhook when a user verifies their email
 * It sends a welcome email to newly verified users
 */
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
    // Parse webhook payload from Supabase Auth
    const payload = await req.json();
    
    // Supabase Auth webhook sends user data when email is verified
    const user = payload.record || payload.user;
    
    if (!user || !user.id || !user.email) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: missing user data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if email was just verified
    if (!user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ message: 'Email not yet verified, skipping welcome email' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if welcome email was already sent
    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_email_sent, full_name')
      .eq('user_id', user.id)
      .single();

    if (profile?.welcome_email_sent) {
      return new Response(
        JSON.stringify({ message: 'Welcome email already sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mark as sent immediately to prevent duplicate sends
    await supabase
      .from('profiles')
      .update({ welcome_email_sent: true })
      .eq('user_id', user.id);

    // Get user's full name
    const fullName = profile?.full_name || 
                     user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.email?.split('@')[0] ||
                     'Traveler';

    // Invoke send-welcome-email function
    const emailResponse = await supabase.functions.invoke('send-welcome-email', {
      body: {
        user_id: user.id,
        email: user.email,
        full_name: fullName,
      },
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    if (emailResponse.error) {
      console.error('Error sending welcome email:', emailResponse.error);
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
      user_id: user.id,
      email: user.email,
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
    console.error('Welcome email webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

