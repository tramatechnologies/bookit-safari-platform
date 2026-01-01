# Email Troubleshooting - Fixed Issues

## ✅ Fixes Applied

### 1. **JWT Authentication Issue** (CRITICAL FIX)
**Problem**: When `send-booking-email` calls `send-email`, authentication was failing because JWT wasn't being passed.

**Fix Applied**:
- Added `Authorization: Bearer ${supabaseServiceKey}` header when invoking functions from other functions
- Fixed in:
  - `send-booking-email` → `send-email`
  - `send-payment-email` → `send-email`
  - `webhook-clickpesa-callback` → `send-booking-email`
  - `clickpesa-webhook` → `send-booking-email`

### 2. **Enhanced Logging**
- Added detailed logging at each step of email sending
- Logs now show:
  - When email function is invoked
  - Email address being used
  - Resend API responses
  - Any errors with full details

### 3. **Better Error Handling**
- Improved error messages from Resend API
- Better parsing of Resend responses
- More detailed error logging

## 🔍 How to Debug

### Step 1: Check Supabase Function Logs

1. Go to **Supabase Dashboard → Edge Functions → Logs**
2. Filter by function name:
   - `send-email` - Check if emails are being sent
   - `send-booking-email` - Check if booking emails are triggered
   - `webhook-clickpesa-callback` - Check if webhook is calling email function

3. Look for these log messages:
   - ✅ `"Attempting to send email:"` - Email function was called
   - ✅ `"Email sent successfully:"` - Email was sent to Resend
   - ❌ `"Resend API error:"` - Resend rejected the email
   - ❌ `"Error invoking send-email function:"` - Function call failed

### Step 2: Check Resend Dashboard

1. Go to https://resend.com/emails
2. Check if emails appear in the list
3. If emails are there but not delivered:
   - Check bounce status
   - Check spam folder
   - Verify domain is verified

### Step 3: Test Email Function Directly

**Via Supabase Dashboard:**
1. Go to **Edge Functions → send-email**
2. Click **Invoke Function**
3. Use this payload:
```json
{
  "to": "your-email@example.com",
  "subject": "Test Email",
  "html": "<h1>Test</h1><p>This is a test email.</p>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message_id": "re_xxxxx"
}
```

**If you get an error:**
- Check the error message
- Verify `RESEND_API_KEY` is set correctly
- Check if domain is verified

### Step 4: Check Domain Verification

**In Resend Dashboard:**
1. Go to https://resend.com/domains
2. Check status of `bookitsafari.com`
3. If not verified:
   - Add DNS records (SPF, DKIM)
   - Wait for verification (up to 48 hours)
   - For testing, you can use Resend's default domain temporarily

**Temporary Fix for Testing:**
Update `send-email/index.ts` to use Resend's default domain:
```typescript
from: emailData.from || 'onboarding@resend.dev', // Use Resend default for testing
```

### Step 5: Verify Email Address

Check if passenger email is being captured:
1. Check `bookings` table - `passenger_email` column
2. Check `profiles` table - `email` column
3. Check `auth.users` table - `email` column

## 🐛 Common Issues & Solutions

### Issue 1: "Unauthorized" Error

**Symptoms**: Function logs show "Unauthorized" or 401 error

**Cause**: JWT authentication failing when functions call each other

**Solution**: ✅ FIXED - All function invocations now include Authorization header

### Issue 2: "Domain not verified" Error from Resend

**Symptoms**: Resend API returns error about domain verification

**Solution**:
- Verify domain in Resend dashboard
- Or use Resend's default domain for testing: `onboarding@resend.dev`

### Issue 3: "No email address found"

**Symptoms**: Function returns error "No email address found for passenger"

**Solution**:
- Ensure `passenger_email` is saved during booking
- Check that user profile has email
- The function now tries 3 sources (booking → profile → auth.users)

### Issue 4: Emails sent but not received

**Possible Causes**:
1. **Spam folder** - Check spam/junk folder
2. **Domain not verified** - Emails from unverified domains go to spam
3. **Email address typo** - Verify the email address is correct
4. **Resend account limits** - Check Resend dashboard for account status

### Issue 5: Function not being invoked

**Check**:
1. Are payments actually completing?
2. Is webhook being triggered?
3. Check webhook logs for errors
4. Verify booking status is being updated to 'confirmed'

## 📋 Testing Checklist

- [ ] Test `send-email` function directly via dashboard
- [ ] Check Supabase function logs for errors
- [ ] Check Resend dashboard for sent emails
- [ ] Verify `RESEND_API_KEY` is set in Supabase secrets
- [ ] Check domain verification status in Resend
- [ ] Test with a real booking and payment
- [ ] Check spam folder
- [ ] Verify email addresses are being saved correctly

## 🚀 Next Steps

1. **Redeploy Functions** (after fixes):
   ```bash
   supabase functions deploy send-email
   supabase functions deploy send-booking-email
   supabase functions deploy send-payment-email
   supabase functions deploy webhook-clickpesa-callback
   ```

2. **Test Email Function**:
   - Use Supabase dashboard to test `send-email` directly
   - Verify you get a success response

3. **Check Logs**:
   - After testing, check function logs
   - Look for the new detailed log messages

4. **Verify Domain** (for production):
   - Complete domain verification in Resend
   - Update `from` address to use verified domain

## 📞 Still Not Working?

If emails are still not being sent after these fixes:

1. **Check Function Logs** - Look for specific error messages
2. **Test Directly** - Use Supabase dashboard to invoke `send-email`
3. **Check Resend Dashboard** - See if emails are being sent but bouncing
4. **Verify API Key** - Make sure `RESEND_API_KEY` is correct and active
5. **Check Domain Status** - Verify domain in Resend dashboard

The most common issue is **domain verification** - Resend may be blocking emails from unverified domains.

