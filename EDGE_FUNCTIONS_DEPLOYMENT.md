# Edge Functions Deployment Summary

## ✅ All Functions Successfully Deployed

### 1. `clickpesa-webhook` ✅
- **Status**: ACTIVE
- **Version**: 1
- **ID**: 38912f97-be2a-44e6-a48d-c04ff39a46b9
- **JWT Verification**: Disabled (public webhook)
- **Purpose**: Handles ClickPesa payment webhooks
- **Endpoint**: `https://[your-project].supabase.co/functions/v1/clickpesa-webhook`

### 2. `send-email` ✅
- **Status**: ACTIVE
- **Version**: 1
- **ID**: f22abb22-b523-43ab-be56-c20903170267
- **JWT Verification**: Enabled
- **Purpose**: Generic email sending via Resend API
- **Endpoint**: `https://[your-project].supabase.co/functions/v1/send-email`

### 3. `send-booking-email` ✅
- **Status**: ACTIVE
- **Version**: 1
- **ID**: 6b063fcc-fa8c-45d9-9e48-33ae958d9db9
- **JWT Verification**: Enabled
- **Purpose**: Sends booking confirmation, cancellation, and reminder emails
- **Endpoint**: `https://[your-project].supabase.co/functions/v1/send-booking-email`

### 4. `send-payment-email` ✅
- **Status**: ACTIVE
- **Version**: 1
- **ID**: 3fcafc6e-bd61-4f6f-b0d7-cbcfb152f4af
- **JWT Verification**: Enabled
- **Purpose**: Sends payment confirmation emails
- **Endpoint**: `https://[your-project].supabase.co/functions/v1/send-payment-email`

## Required Environment Variables

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
CLICKPESA_SECRET_KEY=your_clickpesa_webhook_secret
```

## Function Integration Flow

### Payment Webhook Flow:
```
ClickPesa Payment → clickpesa-webhook → Update Payment Status → 
Update Booking Status → send-booking-email (confirmation)
```

### Booking Email Flow:
```
Booking Created/Cancelled → send-booking-email → 
Fetch Booking Data → Generate HTML → send-email → Resend API
```

### Payment Email Flow:
```
Payment Completed → send-payment-email → 
Fetch Payment Data → Generate HTML → send-email → Resend API
```

## ClickPesa Webhook Configuration

1. **In ClickPesa Dashboard:**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://[your-project].supabase.co/functions/v1/clickpesa-webhook`
   - Select events: `payment.completed`, `payment.failed`, `payment.pending`
   - Copy webhook secret

2. **In Supabase:**
   - Add `CLICKPESA_SECRET_KEY` secret with the webhook secret

## Resend Email Setup

1. **Sign up at Resend:**
   - Visit https://resend.com
   - Create account and verify domain (or use default for testing)

2. **Get API Key:**
   - Go to https://resend.com/api-keys
   - Create new API key
   - Copy the key (starts with `re_`)

3. **Add to Supabase:**
   - Add `RESEND_API_KEY` secret with your API key

4. **Update Email From Address:**
   - Edit `supabase/functions/send-email/index.ts`
   - Change `from` field to match your verified domain
   - Default: `SafiriTZ <noreply@safiritz.com>`

## Testing

### Test ClickPesa Webhook:
```bash
curl -X POST https://[your-project].supabase.co/functions/v1/clickpesa-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test_123",
    "status": "completed",
    "amount": 50000,
    "currency": "TZS",
    "reference": "booking_id_here",
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

### Test Send Email:
```bash
curl -X POST https://[your-project].supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

### Test Booking Email:
```bash
curl -X POST https://[your-project].supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "booking-uuid-here",
    "type": "confirmation"
  }'
```

## Frontend Integration

The frontend has been updated to automatically:
- Send booking confirmation emails after payment
- Send payment confirmation emails
- Send cancellation emails when bookings are cancelled

All email sending happens automatically via edge functions - no manual calls needed in most cases.

## Monitoring

Check function logs in Supabase Dashboard:
- Go to Edge Functions → Select function → Logs
- Monitor for errors and successful invocations
- Set up alerts for failed webhooks/emails

## Security Notes

1. **Webhook Security:**
   - ClickPesa webhook has signature verification (commented out - implement based on ClickPesa docs)
   - Only accepts POST requests
   - Validates payment data before updating database

2. **Email Security:**
   - All email functions require JWT authentication
   - Service role key used for database operations
   - Email templates sanitize user input

3. **Error Handling:**
   - All functions have try-catch blocks
   - Errors are logged but don't expose sensitive data
   - Failed emails don't break payment/booking flows

## Next Steps

1. ✅ All functions deployed
2. ⏳ Set up environment variables (RESEND_API_KEY, CLICKPESA_SECRET_KEY)
3. ⏳ Configure ClickPesa webhook URL
4. ⏳ Verify Resend domain
5. ⏳ Test webhook with ClickPesa test mode
6. ⏳ Test email sending
7. ⏳ Monitor logs for any issues

## Support

For issues:
- Check Supabase Edge Function logs
- Verify environment variables are set
- Test functions individually using curl commands
- Review ClickPesa/Resend API documentation

