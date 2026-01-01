# Edge Functions Setup Guide

## Deployed Functions

### 1. `clickpesa-webhook` ✅
- **Status**: Deployed and Active
- **Purpose**: Handles ClickPesa payment webhooks
- **URL**: `https://[your-project].supabase.co/functions/v1/clickpesa-webhook`
- **Authentication**: Disabled (public webhook endpoint)
- **Environment Variables Required**:
  - `CLICKPESA_SECRET_KEY` - For webhook signature verification

### 2. `send-email` ✅
- **Status**: Deployed and Active
- **Purpose**: Generic email sending service using Resend
- **URL**: `https://[your-project].supabase.co/functions/v1/send-email`
- **Authentication**: Enabled (requires JWT)
- **Environment Variables Required**:
  - `RESEND_API_KEY` - Your Resend API key

### 3. `send-booking-email` (Ready to Deploy)
- **Purpose**: Sends booking confirmation, cancellation, and reminder emails
- **Authentication**: Enabled (requires JWT)
- **Calls**: `send-email` function internally

### 4. `send-payment-email` (Ready to Deploy)
- **Purpose**: Sends payment confirmation emails
- **Authentication**: Enabled (requires JWT)
- **Calls**: `send-email` function internally

## Environment Variables Setup

### In Supabase Dashboard:
1. Go to Project Settings → Edge Functions → Secrets
2. Add the following secrets:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
CLICKPESA_SECRET_KEY=your_clickpesa_secret_key
```

### Required Environment Variables:
- `SUPABASE_URL` - Automatically available
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically available
- `RESEND_API_KEY` - Your Resend API key (get from https://resend.com/api-keys)
- `CLICKPESA_SECRET_KEY` - Your ClickPesa webhook secret (get from ClickPesa dashboard)

## ClickPesa Webhook Configuration

1. Log in to your ClickPesa dashboard
2. Navigate to Webhooks/Settings
3. Add webhook URL: `https://[your-project].supabase.co/functions/v1/clickpesa-webhook`
4. Select events: `payment.completed`, `payment.failed`, `payment.pending`
5. Copy the webhook secret and add it as `CLICKPESA_SECRET_KEY` in Supabase

## Resend Email Setup

1. Sign up at https://resend.com
2. Verify your domain (or use Resend's default domain for testing)
3. Get your API key from https://resend.com/api-keys
4. Add the API key as `RESEND_API_KEY` in Supabase secrets
5. Update the `from` email in `send-email/index.ts` to match your verified domain

## Testing the Functions

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

## Function Integration

### Payment Flow:
1. User completes payment → ClickPesa processes payment
2. ClickPesa sends webhook → `clickpesa-webhook` function
3. Webhook updates payment status → Triggers `send-booking-email` (confirmation)
4. Booking status updated to 'confirmed'

### Email Flow:
1. `send-booking-email` or `send-payment-email` called
2. Function fetches booking/payment data from database
3. Generates HTML email template
4. Calls `send-email` function
5. `send-email` sends via Resend API

## Next Steps

1. Deploy remaining functions (`send-booking-email`, `send-payment-email`)
2. Set up environment variables in Supabase
3. Configure ClickPesa webhook URL
4. Verify Resend domain
5. Test webhook with ClickPesa test mode
6. Test email sending

## Troubleshooting

### Webhook not receiving requests:
- Check ClickPesa webhook URL is correct
- Verify webhook is enabled in ClickPesa dashboard
- Check Supabase function logs

### Emails not sending:
- Verify `RESEND_API_KEY` is set correctly
- Check Resend domain verification
- Review function logs for errors
- Ensure `from` email matches verified domain

### Function errors:
- Check Supabase Edge Function logs
- Verify all environment variables are set
- Ensure database permissions are correct
- Check function invocation permissions

