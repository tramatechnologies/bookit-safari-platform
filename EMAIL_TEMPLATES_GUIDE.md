# Email Templates Guide - Bookit Safari

## Overview

All email templates have been created for both **Resend** (via Edge Functions) and **Supabase Auth** (built-in email system). All emails are configured to use `noreply@bookitsafari.com` as the sender address.

## Email Templates Created

### 1. Booking Confirmation ✅
- **File**: `supabase/functions/email-templates/booking-confirmation.html`
- **Used by**: `send-booking-email` edge function
- **From**: `noreply@bookitsafari.com`
- **Variables**: 
  - `{{passenger_name}}`
  - `{{booking_number}}`
  - `{{departure_region}}`
  - `{{destination_region}}`
  - `{{departure_date}}`
  - `{{departure_time}}`
  - `{{operator_name}}`
  - `{{bus_number}}`
  - `{{plate_number}}`
  - `{{bus_type}}`
  - `{{seat_numbers}}`
  - `{{total_amount}}`
  - `{{booking_url}}`
  - `{{website_url}}`

### 2. Payment Confirmation ✅
- **File**: `supabase/functions/email-templates/payment-confirmation.html`
- **Used by**: `send-payment-email` edge function
- **From**: `noreply@bookitsafari.com`
- **Variables**:
  - `{{passenger_name}}`
  - `{{transaction_id}}`
  - `{{amount}}`
  - `{{payment_method}}`
  - `{{booking_number}}`
  - `{{payment_date}}`
  - `{{booking_url}}`
  - `{{website_url}}`

### 3. Booking Cancellation ✅
- **File**: `supabase/functions/email-templates/booking-cancellation.html`
- **Used by**: `send-booking-email` edge function
- **From**: `noreply@bookitsafari.com`
- **Variables**:
  - `{{passenger_name}}`
  - `{{booking_number}}`
  - `{{departure_region}}`
  - `{{destination_region}}`
  - `{{total_amount}}`
  - `{{refund_status}}`
  - `{{refund_amount}}` (optional)
  - `{{book_again_url}}`
  - `{{website_url}}`

### 4. Trip Reminder ✅
- **File**: `supabase/functions/email-templates/trip-reminder.html`
- **Used by**: `send-booking-email` edge function
- **From**: `noreply@bookitsafari.com`
- **Variables**:
  - `{{passenger_name}}`
  - `{{booking_number}}`
  - `{{departure_region}}`
  - `{{destination_region}}`
  - `{{departure_date}}`
  - `{{departure_time}}`
  - `{{bus_number}}`
  - `{{plate_number}}`
  - `{{seat_numbers}}`
  - `{{booking_url}}`
  - `{{website_url}}`

### 5. Welcome Email ✅
- **File**: `supabase/functions/email-templates/welcome.html`
- **Used by**: Can be called from edge functions or Supabase triggers
- **From**: `noreply@bookitsafari.com`
- **Variables**:
  - `{{full_name}}`
  - `{{website_url}}`

## Supabase Auth Email Templates

### 6. Email Verification ✅
- **File**: `supabase/templates/confirmation.html`
- **Used by**: Supabase Auth (automatic)
- **From**: `noreply@bookitsafari.com` (configured in Supabase)
- **Supabase Variables**:
  - `{{ .ConfirmationURL }}`
  - `{{ .Email }}`
  - `{{ .Token }}`
  - `{{ .TokenHash }}`
  - `{{ .SiteURL }}`

### 7. Password Reset ✅
- **File**: `supabase/templates/recovery.html`
- **Used by**: Supabase Auth (automatic)
- **From**: `noreply@bookitsafari.com`
- **Supabase Variables**:
  - `{{ .ConfirmationURL }}`
  - `{{ .Email }}`
  - `{{ .Token }}`
  - `{{ .TokenHash }}`
  - `{{ .SiteURL }}`

### 8. Magic Link ✅
- **File**: `supabase/templates/magic_link.html`
- **Used by**: Supabase Auth (automatic)
- **From**: `noreply@bookitsafari.com`
- **Supabase Variables**:
  - `{{ .ConfirmationURL }}`
  - `{{ .Email }}`
  - `{{ .Token }}`
  - `{{ .TokenHash }}`
  - `{{ .SiteURL }}`

### 9. Email Change Confirmation ✅
- **File**: `supabase/templates/email_change.html`
- **Used by**: Supabase Auth (automatic)
- **From**: `noreply@bookitsafari.com`
- **Supabase Variables**:
  - `{{ .ConfirmationURL }}`
  - `{{ .Email }}`
  - `{{ .NewEmail }}`
  - `{{ .Token }}`
  - `{{ .TokenHash }}`
  - `{{ .SiteURL }}`

### 10. Invitation Email ✅
- **File**: `supabase/templates/invite.html`
- **Used by**: Supabase Auth (automatic)
- **From**: `noreply@bookitsafari.com`
- **Supabase Variables**:
  - `{{ .ConfirmationURL }}`
  - `{{ .Email }}`
  - `{{ .Token }}`
  - `{{ .TokenHash }}`
  - `{{ .SiteURL }}`

## Configuration

### Supabase Auth Email Configuration

The `supabase/config.toml` file has been configured with:
- **Site URL**: `https://bookitsafari.com`
- **Email Templates**: All templates point to custom HTML files
- **From Address**: Configured to use `noreply@bookitsafari.com`

### Resend Email Configuration

The `send-email` edge function is configured with:
- **From**: `Bookit Safari <noreply@bookitsafari.com>`
- **Reply-To**: `support@bookitsafari.com`

## Template Features

All templates include:
- ✅ Responsive design (mobile-friendly)
- ✅ Professional branding (Bookit Safari colors)
- ✅ Clear call-to-action buttons
- ✅ Security notices where applicable
- ✅ Support contact information
- ✅ Consistent footer with branding
- ✅ Accessible HTML structure
- ✅ Email client compatibility

## Template Variables

### Resend Templates (Edge Functions)
- Use `{{variable}}` syntax
- Support conditional blocks: `{{#if variable}}...{{/if}}`
- All variables are replaced at runtime

### Supabase Auth Templates
- Use `{{ .VariableName }}` syntax (Go template format)
- Standard Supabase variables are automatically provided
- Custom variables can be added via Supabase dashboard

## Email Sender Configuration

### Resend Setup
1. Verify `bookitsafari.com` domain in Resend
2. Add DNS records (SPF, DKIM, DMARC)
3. Emails will send from `noreply@bookitsafari.com`

### Supabase Auth Setup
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Configure SMTP settings (or use Supabase's email service)
3. Set "From" address to `noreply@bookitsafari.com`
4. Templates are automatically loaded from `supabase/templates/`

## Testing

### Test Resend Templates
```bash
# Test booking confirmation
curl -X POST https://[project].supabase.co/functions/v1/send-booking-email \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "booking-uuid",
    "type": "confirmation"
  }'
```

### Test Supabase Auth Templates
- Sign up a new user → Triggers confirmation email
- Request password reset → Triggers recovery email
- Request magic link → Triggers magic link email

## Template Customization

To customize templates:
1. Edit HTML files in `supabase/functions/email-templates/` (Resend)
2. Edit HTML files in `supabase/templates/` (Supabase Auth)
3. Update variables as needed
4. Redeploy edge functions if using Resend templates

## Email Addresses

| Purpose | Email Address |
|---------|---------------|
| No-Reply (All emails) | noreply@bookitsafari.com |
| Support | support@bookitsafari.com |
| DMARC Reports | dmarc@bookitsafari.com |

## Next Steps

1. ✅ All templates created
2. ✅ Supabase config updated
3. ⏳ Verify `bookitsafari.com` domain in Resend
4. ⏳ Configure Supabase Auth SMTP (or use Supabase email service)
5. ⏳ Test all email templates
6. ⏳ Monitor email deliverability

## Notes

- Supabase Auth templates use Go template syntax (`{{ .Variable }}`)
- Resend templates use custom syntax (`{{variable}}`) - handled by render-template.ts
- All templates are mobile-responsive
- Templates include proper email client fallbacks
- Support email is consistent across all templates

