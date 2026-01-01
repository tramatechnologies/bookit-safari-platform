# ClickPesa Webhook Configuration Guide

## Webhook URL

Your ClickPesa webhook should be configured to point to:

```
https://www.bookitsafari.com/functions/v1/webhook-clickpesa-callback
```

**Note:** If you're using Supabase's default domain, the URL would be:
```
https://[your-project-ref].supabase.co/functions/v1/webhook-clickpesa-callback
```

If you have a custom domain (`bookitsafari.com`) configured, use that URL instead.

## Supported Events

The webhook handler supports the following ClickPesa events:

### 1. PAYMENT_RECEIVED
- **Trigger:** When a customer successfully completes a payment
- **Action:** 
  - Updates payment status to `completed`
  - Confirms the booking
  - Calculates and records commission
  - Sends booking confirmation email

### 2. PAYMENT_FAILED
- **Trigger:** When a payment fails or is declined
- **Action:**
  - Updates payment status to `failed`
  - Keeps booking in `pending` status

### 3. PAYOUT_INITIATED
- **Trigger:** When a payout to an operator is initiated
- **Action:**
  - Logs the payout initiation
  - (Future: Track in payouts table)

### 4. PAYOUT_REFUNDED
- **Trigger:** When a refund is processed to a customer
- **Action:**
  - Updates payment status to `refunded`
  - Cancels the booking
  - Sends cancellation email to customer

### 5. PAYOUT_REVERSED
- **Trigger:** When a payment is reversed
- **Action:**
  - Updates payment status to `failed`
  - Stores reversal reason in `payment_data`
  - Cancels the booking

### 6. DEPOSIT_RECEIVED
- **Trigger:** When a deposit is received in your account
- **Action:**
  - Logs the deposit
  - (Future: Track in deposits table)

## Configuration Steps

### 1. Deploy the Webhook Function

Deploy the webhook function to Supabase:

```bash
supabase functions deploy webhook-clickpesa-callback
```

### 2. Configure ClickPesa Dashboard

1. Log in to your ClickPesa dashboard
2. Navigate to **Settings → Webhooks**
3. Add a new webhook with the following details:
   - **URL:** `https://www.bookitsafari.com/functions/v1/webhook-clickpesa-callback`
   - **Events to Subscribe:**
     - ✅ PAYMENT RECEIVED
     - ✅ PAYMENT FAILED
     - ✅ PAYOUT INITIATED
     - ✅ PAYOUT REFUNDED
     - ✅ PAYOUT REVERSED
     - ✅ DEPOSIT RECEIVED
4. Copy the webhook secret key

### 3. Set Environment Variables

Add the webhook secret to Supabase Edge Functions secrets:

```bash
supabase secrets set CLICKPESA_SECRET_KEY=your_webhook_secret_here
```

Or via Supabase Dashboard:
1. Go to **Project Settings → Edge Functions → Secrets**
2. Add `CLICKPESA_SECRET_KEY` with your webhook secret

### 4. Test the Webhook

You can test the webhook using ClickPesa's webhook testing tool or by sending a test event:

```bash
curl -X POST https://www.bookitsafari.com/functions/v1/webhook-clickpesa-callback \
  -H "Content-Type: application/json" \
  -H "x-clickpesa-signature: test_signature" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "order_reference": "BOOKIT-1234567890-abc12345",
    "transaction_id": "TXN-123456",
    "amount": 50000,
    "currency": "TZS",
    "status": "completed",
    "timestamp": "2026-01-15T10:00:00Z"
  }'
```

## Webhook Payload Structure

ClickPesa will send webhooks with the following structure:

```json
{
  "event": "PAYMENT_RECEIVED",
  "transaction_id": "TXN-123456789",
  "order_reference": "BOOKIT-1234567890-abc12345",
  "reference": "optional-booking-id",
  "status": "completed",
  "amount": 50000,
  "currency": "TZS",
  "mobile_number": "255712345678",
  "customer_phone": "255712345678",
  "customer_email": "customer@example.com",
  "payment_method": "mpesa",
  "timestamp": "2026-01-15T10:00:00Z",
  "metadata": {}
}
```

## Security Features

1. **Signature Verification:** All webhooks are verified using HMAC-SHA256 signature
2. **Rate Limiting:** Webhook requests are rate-limited to prevent abuse
3. **SQL Injection Prevention:** All inputs are validated and sanitized
4. **Amount Validation:** Payment amounts are validated against booking amounts
5. **Duplicate Prevention:** Prevents processing the same payment multiple times

## Troubleshooting

### Webhook Not Receiving Events

1. Check ClickPesa dashboard to ensure webhook is active
2. Verify the webhook URL is correct
3. Check Supabase Edge Functions logs for errors
4. Ensure `CLICKPESA_SECRET_KEY` is set correctly

### Payment Not Updating

1. Check that `order_reference` matches `payment_reference` in database
2. Verify payment exists in database
3. Check Edge Functions logs for errors
4. Ensure booking amount matches payment amount

### Signature Verification Failing

1. Verify `CLICKPESA_SECRET_KEY` matches ClickPesa dashboard
2. Check that ClickPesa is sending signature header
3. Review signature verification logic in `verify-signature.ts`

## Monitoring

Monitor webhook activity through:
- Supabase Edge Functions logs
- ClickPesa dashboard webhook logs
- Application database (payment status updates)

## Support

For issues or questions:
- Check ClickPesa documentation: https://docs.clickpesa.com
- Review Supabase Edge Functions logs
- Contact ClickPesa support for webhook-related issues

