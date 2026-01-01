# Email Verification Redirect Fix

## Issue
After clicking the confirmation link in the email, users get "this site can't be reached" error.

## Root Cause
The `emailRedirectTo` URL was using `window.location.origin` which could point to localhost or incorrect URLs. Supabase requires the exact redirect URL to be in the allowed list.

## Fixes Applied

### 1. Updated `use-auth.tsx`
- Changed `emailRedirectTo` to use production URL (`https://bookitsafari.com`) in production
- Falls back to `window.location.origin` for local development
- Applied same fix to `resetPassword` function

### 2. Updated `supabase/config.toml`
- Added specific redirect URLs to `additional_redirect_urls`:
  - `https://bookitsafari.com/auth/verify`
  - `https://bookitsafari.com/auth/verify?redirect=/dashboard`
  - `https://bookitsafari.com/auth/callback`
  - `https://bookitsafari.com/auth/reset`

## Important: Supabase Dashboard Configuration

You MUST also add these URLs in the Supabase Dashboard:

1. Go to **Supabase Dashboard** → **Project Settings** → **Auth** → **URL Configuration**

2. Add these URLs to **Redirect URLs**:
   - `https://bookitsafari.com/auth/verify`
   - `https://bookitsafari.com/auth/verify?redirect=/dashboard`
   - `https://bookitsafari.com/auth/callback`
   - `https://bookitsafari.com/auth/reset`

3. Set **Site URL** to: `https://bookitsafari.com`

## How Email Verification Works

1. User signs up → `signUp()` is called with `emailRedirectTo: 'https://bookitsafari.com/auth/verify?redirect=/dashboard'`
2. Supabase sends email with confirmation link
3. User clicks link → Supabase verifies email and redirects to `https://bookitsafari.com/auth/verify?redirect=/dashboard`
4. `VerifyEmail` page checks if user is verified
5. If verified → Redirects to `/dashboard`

## Testing

1. Sign up a new user
2. Check email for verification link
3. Click the link
4. Should redirect to `https://bookitsafari.com/auth/verify?redirect=/dashboard`
5. Should then redirect to dashboard after verification

## Troubleshooting

If still getting "site can't be reached":

1. **Check Supabase Dashboard**:
   - Verify redirect URLs are added
   - Verify Site URL is `https://bookitsafari.com`

2. **Check Email Link**:
   - The link should point to: `https://[project-ref].supabase.co/auth/v1/verify?token=...&type=email&redirect_to=https://bookitsafari.com/auth/verify?redirect=/dashboard`
   - After clicking, Supabase redirects to: `https://bookitsafari.com/auth/verify?redirect=/dashboard#access_token=...`

3. **Check Browser Console**:
   - Look for any CORS or redirect errors
   - Check network tab for failed requests

4. **Verify Domain**:
   - Ensure `bookitsafari.com` is properly configured
   - Check DNS records
   - Verify SSL certificate

---

**Last Updated**: January 2026

