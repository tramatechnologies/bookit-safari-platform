# Test Email Function - Troubleshooting Guide

## Quick Test

To test if emails are working, you can invoke the `send-email` function directly from Supabase Dashboard or via API.

### Option 1: Test via Supabase Dashboard

1. Go to **Supabase Dashboard → Edge Functions → send-email**
2. Click **Invoke Function**
3. Use this test payload:

```json
{
  "to": "your-email@example.com",
  "subject": "Test Email from Bookit Safari",
  "html": "<h1>Test Email</h1><p>This is a test email to verify email sending is working.</p>"
}
```

4. Check the response and logs

### Option 2: Test via API (with Service Role Key)

```bash
curl -X POST https://[your-project].supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test.</p>"
  }'
```

### Option 3: Test Booking Email Function

```bash
curl -X POST https://[your-project].supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "[ACTUAL_BOOKING_ID]",
    "type": "confirmation"
  }'
```

## Common Issues

### Issue 1: "Unauthorized" Error

**Problem**: JWT authentication failing

**Solution**: 
- Make sure you're using **Service Role Key** (not anon key) when invoking from another function
- The functions require JWT authentication
- When calling from webhook, use `supabaseServiceKey` in Authorization header

### Issue 2: "Domain not verified" Error from Resend

**Problem**: Resend rejects emails because domain isn't verified

**Solution**:
- For testing: Use Resend's default domain temporarily
- For production: Verify `bookitsafari.com` in Resend dashboard
- Update `from` address to match verified domain

### Issue 3: "No email address found"

**Problem**: Passenger email is missing

**Solution**:
- Check that `bookings.passenger_email` is being saved
- Check that user profile has email
- Check that auth.users has email

### Issue 4: Function Not Being Invoked

**Problem**: Email function never gets called

**Solution**:
- Check Supabase Edge Functions logs
- Verify webhook is triggering correctly
- Check that payment completion is actually happening
- Look for errors in webhook logs

## Debugging Steps

1. **Check Function Logs**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Filter by function name (e.g., `send-email`)
   - Look for errors or warnings

2. **Check Resend Dashboard**
   - Go to https://resend.com/emails
   - See if emails are being sent
   - Check for bounces or failures

3. **Verify API Key**
   - Check Supabase Secrets: `RESEND_API_KEY` is set
   - Verify the key is correct (starts with `re_`)
   - Try regenerating the key if needed

4. **Test Directly**
   - Use the test methods above
   - This will help isolate if it's a function issue or integration issue

5. **Check Email Address**
   - Verify the email address is valid
   - Check spam folder
   - Try a different email address

## Expected Log Output

When working correctly, you should see logs like:

```
Attempting to send email: { to: 'user@example.com', subject: '...', hasApiKey: true }
Email sent successfully: { message_id: 're_xxxxx' }
```

If there's an error, you'll see:

```
Resend API error: { status: 400, error: { message: '...' } }
```

## Next Steps

1. Run the test email function
2. Check the logs for errors
3. Verify Resend dashboard shows the email
4. Check spam folder
5. If still not working, check domain verification status

