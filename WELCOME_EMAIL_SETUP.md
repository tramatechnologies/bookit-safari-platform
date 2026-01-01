# Welcome Email Automation Setup Guide

## Overview

Welcome emails are now automatically sent to users after they verify their email address. This is implemented using:

1. **Database Trigger**: Detects when `email_confirmed_at` is set
2. **Edge Function**: `send-welcome-email` - Sends the welcome email via Resend
3. **Webhook Function**: `send-welcome-email-on-verify` - Handles Supabase Auth webhooks

## Implementation Details

### 1. Database Migration
**File**: `supabase/migrations/20260102000000_add_welcome_email_trigger.sql`

**What it does**:
- Adds `welcome_email_sent` column to `profiles` table
- Creates trigger `on_email_verified` that fires when email is confirmed
- Creates function `send_welcome_email_if_needed` for manual triggering

### 2. Edge Functions

#### `send-welcome-email`
**Purpose**: Sends welcome email via Resend
**Endpoint**: `https://[project].supabase.co/functions/v1/send-welcome-email`
**Authentication**: Requires JWT (service role key)

**Request Body**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe" // optional
}
```

#### `send-welcome-email-on-verify`
**Purpose**: Webhook handler for Supabase Auth events
**Endpoint**: `https://[project].supabase.co/functions/v1/send-welcome-email-on-verify`
**Authentication**: None (public webhook)

## Setup Instructions

### Step 1: Apply Database Migration

Run the migration to add the trigger and column:

```bash
# Using Supabase CLI
supabase db push

# Or apply via MCP
# The migration file is ready: supabase/migrations/20260102000000_add_welcome_email_trigger.sql
```

### Step 2: Deploy Edge Functions

Deploy both edge functions:

```bash
# Deploy send-welcome-email
supabase functions deploy send-welcome-email

# Deploy send-welcome-email-on-verify (webhook handler)
supabase functions deploy send-welcome-email-on-verify
```

### Step 3: Configure Supabase Auth Webhook

1. Go to **Supabase Dashboard** → **Project Settings** → **Auth** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **Name**: Welcome Email Webhook
   - **URL**: `https://[your-project].supabase.co/functions/v1/send-welcome-email-on-verify`
   - **Events**: Select `user.updated` (when email_confirmed_at changes)
   - **HTTP Method**: POST
   - **HTTP Headers**: (optional) Add authentication if needed

### Step 4: Verify Configuration

1. **Test the function manually**:
   ```bash
   curl -X POST https://[project].supabase.co/functions/v1/send-welcome-email \
     -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "email": "test@example.com",
       "full_name": "Test User"
     }'
   ```

2. **Test the full flow**:
   - Sign up a new user
   - Verify email
   - Check inbox for welcome email

## How It Works

### Flow 1: Automatic (Recommended)
```
User Verifies Email
  ↓
Supabase Auth Webhook → send-welcome-email-on-verify
  ↓
Checks if welcome_email_sent = false
  ↓
Calls send-welcome-email function
  ↓
Sends email via Resend
  ↓
Updates welcome_email_sent = true
```

### Flow 2: Manual Trigger
```
Admin/System calls RPC function
  ↓
send_welcome_email_if_needed(user_id)
  ↓
Checks conditions (email verified, not already sent)
  ↓
Calls send-welcome-email edge function
  ↓
Sends email via Resend
```

## Email Template

The welcome email template is located at:
- `supabase/functions/email-templates/welcome.html` (shared)
- `supabase/functions/send-welcome-email/email-templates/welcome.html` (local copy)

**Template Variables**:
- `{{full_name}}` - User's full name
- `{{website_url}}` - Website URL (https://bookitsafari.com)

## Troubleshooting

### Welcome emails not sending

1. **Check webhook configuration**:
   - Verify webhook URL is correct
   - Ensure `user.updated` event is selected
   - Check webhook logs in Supabase Dashboard

2. **Check function logs**:
   - Go to **Edge Functions** → **Logs**
   - Filter by `send-welcome-email` or `send-welcome-email-on-verify`
   - Look for errors

3. **Check database**:
   ```sql
   -- Check if trigger is working
   SELECT * FROM profiles WHERE welcome_email_sent = false;
   
   -- Manually trigger for a user
   SELECT public.send_welcome_email_if_needed('user-uuid');
   ```

4. **Check Resend**:
   - Verify `RESEND_API_KEY` is set in Supabase secrets
   - Check Resend dashboard for email delivery status

### Duplicate emails

- The `welcome_email_sent` flag prevents duplicate sends
- If you need to resend, manually reset the flag:
  ```sql
  UPDATE profiles SET welcome_email_sent = false WHERE user_id = 'user-uuid';
  ```

## Testing

### Test Welcome Email Function
```bash
curl -X POST https://[project].supabase.co/functions/v1/send-welcome-email \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "email": "your-email@example.com",
    "full_name": "Test User"
  }'
```

### Test Full Flow
1. Create a test user account
2. Verify the email
3. Check inbox for welcome email
4. Verify email comes from `noreply@bookitsafari.com`

## Manual Trigger (if needed)

If you need to manually send welcome emails to existing users:

```sql
-- For a specific user
SELECT public.send_welcome_email_if_needed('user-uuid');

-- For all users who haven't received welcome email
SELECT public.send_welcome_email_if_needed(id)
FROM auth.users
WHERE email_confirmed_at IS NOT NULL
AND id IN (
  SELECT user_id FROM profiles WHERE welcome_email_sent = false
);
```

**Note**: The function only marks the flag - you'll need to call the edge function separately or use the webhook.

## Next Steps

1. ✅ Migration created
2. ✅ Edge functions created
3. ⏳ Deploy functions
4. ⏳ Configure Supabase Auth webhook
5. ⏳ Test email delivery
6. ⏳ Monitor email deliverability

---

**Last Updated**: January 2026

