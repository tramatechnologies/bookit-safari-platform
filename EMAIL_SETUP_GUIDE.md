# Email Setup Guide - Bookit Safari

## Problem: Emails Not Being Sent

If confirmation emails and other emails are not being sent, follow this troubleshooting guide.

## Required Setup

### 1. Resend API Key Configuration

**Step 1: Get Resend API Key**
1. Sign up at https://resend.com (if you haven't already)
2. Go to https://resend.com/api-keys
3. Create a new API key
4. Copy the API key (starts with `re_`)

**Step 2: Add to Supabase Secrets**
1. Go to your Supabase Dashboard
2. Navigate to **Project Settings → Edge Functions → Secrets**
3. Add a new secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (e.g., `re_xxxxxxxxxxxxx`)
4. Click **Save**

### 2. Domain Verification (Required for Production)

**Step 1: Verify Domain in Resend**
1. Go to https://resend.com/domains
2. Click **Add Domain**
3. Enter `bookitsafari.com`
4. Add the DNS records provided by Resend to your domain:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)

**Step 2: Wait for Verification**
- Domain verification can take up to 48 hours
- You'll receive an email when verification is complete

**Step 3: Update Email From Address**
Once verified, the `send-email` function will automatically use:
- From: `Bookit Safari <noreply@bookitsafari.com>`
- Reply-To: `support@bookitsafari.com`

### 3. Deploy Edge Functions

Make sure all email-related functions are deployed:

```bash
# Deploy send-email function
supabase functions deploy send-email

# Deploy send-booking-email function
supabase functions deploy send-booking-email

# Deploy send-payment-email function
supabase functions deploy send-payment-email
```

Or deploy all at once:
```bash
supabase functions deploy
```

### 4. Verify Function Deployment

1. Go to Supabase Dashboard → Edge Functions
2. Verify these functions are listed:
   - ✅ `send-email`
   - ✅ `send-booking-email`
   - ✅ `send-payment-email`

### 5. Test Email Sending

**Option 1: Test via Supabase Dashboard**
1. Go to **Edge Functions → send-email**
2. Click **Invoke Function**
3. Use this test payload:
```json
{
  "to": "your-email@example.com",
  "subject": "Test Email",
  "html": "<h1>Test</h1><p>This is a test email from Bookit Safari.</p>"
}
```

**Option 2: Test via API**
```bash
curl -X POST https://[your-project].supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer [YOUR_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

## Common Issues & Solutions

### Issue 1: "RESEND_API_KEY is not configured"

**Solution:**
- Make sure you've added `RESEND_API_KEY` to Supabase secrets
- The secret name must be exactly `RESEND_API_KEY` (case-sensitive)
- After adding, wait a few minutes for it to propagate

### Issue 2: "Domain not verified" Error

**Solution:**
- Verify your domain in Resend dashboard
- Make sure DNS records are correctly configured
- Wait for verification to complete (can take up to 48 hours)
- For testing, you can use Resend's default domain temporarily

### Issue 3: "No email address found for passenger"

**Solution:**
- Make sure users provide email addresses during booking
- Check that `passenger_email` is being saved in the `bookings` table
- The function now tries to get email from:
  1. `bookings.passenger_email`
  2. `profiles.email` (from user profile)
  3. `auth.users.email` (from auth system)

### Issue 4: Emails going to spam

**Solution:**
- Complete domain verification in Resend
- Set up SPF, DKIM, and DMARC records
- Use a verified sender address
- Avoid spam trigger words in subject lines

### Issue 5: Functions not being invoked

**Solution:**
- Check Supabase logs: **Edge Functions → Logs**
- Verify functions are deployed and active
- Check that webhook is calling the function correctly
- Ensure JWT authentication is working (for protected functions)

## Email Flow

### Booking Confirmation Email
```
Payment Completed → Webhook → update_payment_status → 
send-booking-email → send-email → Resend API → Email Sent
```

### Payment Confirmation Email
```
Payment Completed → send-payment-email → send-email → Resend API → Email Sent
```

## Monitoring

### Check Email Logs
1. Go to Resend Dashboard → **Emails**
2. View sent emails and their status
3. Check for bounces or failures

### Check Function Logs
1. Go to Supabase Dashboard → **Edge Functions → Logs**
2. Filter by function name (e.g., `send-email`)
3. Look for errors or warnings

### Check Webhook Logs
1. Go to Supabase Dashboard → **Edge Functions → Logs**
2. Filter by `webhook-clickpesa-callback`
3. Verify emails are being triggered

## Testing Checklist

- [ ] Resend API key added to Supabase secrets
- [ ] Domain verified in Resend (or using default for testing)
- [ ] All edge functions deployed
- [ ] Test email sent successfully
- [ ] Booking confirmation email sent after payment
- [ ] Payment confirmation email sent
- [ ] Email addresses are being captured correctly
- [ ] No errors in function logs

## Support

If emails are still not working after following this guide:
1. Check Supabase function logs for errors
2. Check Resend dashboard for email status
3. Verify all environment variables are set
4. Test with a simple email first
5. Contact support if domain verification is stuck

