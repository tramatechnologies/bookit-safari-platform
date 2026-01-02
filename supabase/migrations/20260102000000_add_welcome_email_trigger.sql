-- Migration: Add Welcome Email Automation
-- This migration adds a trigger to automatically send welcome emails when users verify their email

-- Add column to track if welcome email was sent
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- Create function to check and send welcome email (can be called via RPC or webhook)
CREATE OR REPLACE FUNCTION public.send_welcome_email_if_needed(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
  already_sent BOOLEAN;
  email_verified BOOLEAN;
BEGIN
  -- Check if welcome email was already sent
  SELECT welcome_email_sent INTO already_sent
  FROM public.profiles
  WHERE id = _user_id;
  
  IF already_sent THEN
    RETURN;
  END IF;
  
  -- Check if email is verified
  SELECT email_confirmed_at IS NOT NULL INTO email_verified
  FROM auth.users
  WHERE id = _user_id;
  
  IF NOT email_verified THEN
    RETURN;
  END IF;
  
  -- Get user email and name
  SELECT 
    u.email,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1), 'Traveler')
  INTO user_email, user_full_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = _user_id;
  
  IF user_email IS NULL THEN
    RAISE WARNING 'User % not found or has no email', _user_id;
    RETURN;
  END IF;
  
  -- Mark as sent (the edge function will handle actual sending)
  -- This prevents duplicate sends
  UPDATE public.profiles
  SET welcome_email_sent = TRUE
  WHERE id = _user_id;
  
  -- The actual email sending will be handled by calling the send-welcome-email edge function
  -- This can be done via Supabase webhook or scheduled job
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.send_welcome_email_if_needed(UUID) TO service_role;

-- Create trigger that marks welcome email as needed when email is verified
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When email_confirmed_at is set for the first time
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Reset welcome_email_sent flag to trigger sending
    -- The actual sending will be handled by Supabase webhook
    UPDATE public.profiles
    SET welcome_email_sent = FALSE
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to detect email verification
CREATE TRIGGER on_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_verification();
