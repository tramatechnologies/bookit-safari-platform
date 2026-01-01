# Domain Configuration - bookitsafari.com

## ✅ Domain Updated

All email functions and frontend components have been updated to use **bookitsafari.com** domain.

## Email Configuration

### From Address
- **Default**: `Bookit Safari <noreply@bookitsafari.com>`
- **Reply-To**: `support@bookitsafari.com`

### Support Email
- **Support**: `support@bookitsafari.com`

## Resend Domain Setup

### Step 1: Verify Domain in Resend
1. Log in to https://resend.com
2. Go to **Domains** → **Add Domain**
3. Add `bookitsafari.com`
4. Add the DNS records provided by Resend to your domain:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)

### Step 2: DNS Records
Add these DNS records to your domain provider:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

**DKIM Records:**
(Resend will provide specific DKIM records - add all of them)

**DMARC Record (Recommended):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@bookitsafari.com
```

### Step 3: Wait for Verification
- DNS propagation can take 24-48 hours
- Resend will show verification status in dashboard
- Once verified, you can send emails from `@bookitsafari.com`

## Updated Components

### Frontend
- ✅ Header logo: "BookitSafari"
- ✅ Footer: Updated brand name and support email
- ✅ Auth page: Updated brand name

### Edge Functions
- ✅ `send-email`: Updated from address to `noreply@bookitsafari.com`
- ✅ `send-booking-email`: Updated support email references
- ✅ `send-payment-email`: Updated support email references

## Email Addresses

| Purpose | Email Address |
|---------|---------------|
| No-Reply | noreply@bookitsafari.com |
| Support | support@bookitsafari.com |
| DMARC Reports | dmarc@bookitsafari.com |

## Testing

### Test Email Sending
Once domain is verified in Resend:

```bash
curl -X POST https://[your-project].supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test from Bookit Safari",
    "html": "<h1>Test Email</h1>"
  }'
```

## Important Notes

1. **Domain Verification Required**: Emails will not send until domain is verified in Resend
2. **DNS Propagation**: Allow 24-48 hours for DNS changes to propagate
3. **Email Deliverability**: Verified domains have better deliverability than unverified domains
4. **SPF/DKIM**: These records improve email deliverability and prevent spam

## Next Steps

1. ✅ Domain updated in code
2. ⏳ Verify `bookitsafari.com` in Resend
3. ⏳ Add DNS records to domain
4. ⏳ Wait for verification
5. ⏳ Test email sending
6. ⏳ Monitor email deliverability

## Support

- Resend Domain Setup: https://resend.com/docs/dashboard/domains/introduction
- DNS Configuration: Contact your domain registrar or DNS provider
- Email Issues: Check Resend dashboard for delivery logs

