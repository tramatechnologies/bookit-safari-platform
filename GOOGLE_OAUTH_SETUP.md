# Google OAuth Setup Guide

## Error: redirect_uri_mismatch

This error occurs when the redirect URI in Google Cloud Console doesn't match what Supabase is sending.

## Supabase OAuth Redirect URI Format

Supabase uses this format for OAuth redirects:
```
https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
```

**Example:**
```
https://udiiniltuufkxivguayd.supabase.co/auth/v1/callback
```

## Step-by-Step Fix

### 1. Get Your Supabase Project Reference

1. Go to **Supabase Dashboard** → **Project Settings** → **General**
2. Find your **Project Reference** (e.g., `udiiniltuufkxivguayd`)
3. Your redirect URI will be: `https://[PROJECT_REF].supabase.co/auth/v1/callback`

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (or create one if you don't have it)
5. Click **Edit** on your OAuth client
6. Under **Authorized redirect URIs**, add:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   Replace `[YOUR_PROJECT_REF]` with your actual Supabase project reference.

7. Click **Save**

### 3. Configure Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** provider
3. Enable it if not already enabled
4. Enter your **Google Client ID** (from Google Cloud Console)
5. Enter your **Google Client Secret** (from Google Cloud Console)
6. Click **Save**

### 4. Verify Redirect URLs in Supabase

1. Go to **Supabase Dashboard** → **Project Settings** → **Auth** → **URL Configuration**
2. Under **Redirect URLs**, make sure you have:
   - `https://bookitsafari.com/auth/callback`
   - `https://bookitsafari.com`
   - `https://bookitsafari.com/auth/verify`
   - `https://bookitsafari.com/auth/reset`

### 5. Important Notes

- **Google Cloud Console** needs: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- **Supabase Dashboard** needs: `https://bookitsafari.com/auth/callback` (your app's callback URL)
- These are **different URLs** - Google redirects to Supabase first, then Supabase redirects to your app

## OAuth Flow

1. User clicks "Sign in with Google" on `bookitsafari.com`
2. User is redirected to Google for authentication
3. Google redirects to: `https://[PROJECT_REF].supabase.co/auth/v1/callback` ✅ (Must be in Google Console)
4. Supabase processes the OAuth callback
5. Supabase redirects to: `https://bookitsafari.com/auth/callback` ✅ (Must be in Supabase Dashboard)
6. Your app handles the callback and redirects to dashboard

## Testing

1. After configuring both:
   - Google Cloud Console redirect URI
   - Supabase Google provider credentials
2. Try signing in with Google again
3. The redirect_uri_mismatch error should be resolved

## Common Issues

### Issue: Still getting redirect_uri_mismatch
- **Solution**: Double-check the redirect URI in Google Cloud Console matches exactly: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes or typos
- Wait a few minutes for changes to propagate

### Issue: OAuth works but redirects to wrong page
- **Solution**: Check Supabase Dashboard → Auth → URL Configuration
- Make sure `https://bookitsafari.com/auth/callback` is in the redirect URLs list

### Issue: Can't find Project Reference
- **Solution**: Go to Supabase Dashboard → Project Settings → General
- The Project Reference is shown at the top of the page

---

**Last Updated**: January 2026

