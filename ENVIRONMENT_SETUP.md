# Environment Setup Guide

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials:**
   - Visit: https://app.supabase.com/project/_/settings/api
   - Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy your **anon/public key** (starts with `eyJ...`)

3. **Update `.env.local` file:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   > **Note:** You can use either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` - both are supported!

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## Finding Your Supabase Credentials

### Step 1: Go to Supabase Dashboard
1. Log in to https://app.supabase.com
2. Select your project (or create a new one)

### Step 2: Navigate to API Settings
1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** under Project Settings

### Step 3: Copy Your Credentials
You'll see two important values:

1. **Project URL** (under "Project URL")
   - Example: `https://abcdefghijklmnop.supabase.co`
   - Copy this to `VITE_SUPABASE_URL`

2. **anon public key** (under "Project API keys" → "anon public")
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ...`
   - Copy this to `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`)

## Troubleshooting

### Error: "supabaseKey is required"
- **Cause**: Missing or incorrect `VITE_SUPABASE_ANON_KEY` in `.env.local`
- **Solution**: 
  1. Check that `.env.local` file exists in the project root
  2. Verify the key is correct (should start with `eyJ`)
  3. Make sure you're using `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
  4. Restart your dev server after updating `.env.local`

### Error: "Missing Supabase URL"
- **Cause**: Missing or incorrect `VITE_SUPABASE_URL` in `.env.local`
- **Solution**:
  1. Check that `.env.local` file exists
  2. Verify the URL format: `https://xxxxx.supabase.co`
  3. Restart your dev server

### Environment variables not loading
- **Cause**: Vite requires server restart after `.env.local` changes
- **Solution**: 
  1. Stop your dev server (Ctrl+C)
  2. Start it again: `npm run dev`

### Still having issues?
1. Verify `.env.local` file is in the project root (same level as `package.json`)
2. Check for typos in variable names (must start with `VITE_`)
3. Ensure no extra spaces or quotes around values
4. Make sure you're using `.env.local` (not just `.env`)
5. Try clearing browser cache and restarting dev server

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Never share your keys publicly** - They're sensitive credentials
3. **Use different keys for production** - Create separate Supabase projects or use environment-specific keys
4. **Rotate keys if exposed** - If keys are accidentally shared, regenerate them in Supabase dashboard

## Production Setup

For production deployments:

1. Set environment variables in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - **Other platforms**: Check their documentation

2. Use the same variable names:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

3. Never hardcode credentials in your code!

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Dashboard: https://app.supabase.com
- Project Issues: Check the README.md for more information

