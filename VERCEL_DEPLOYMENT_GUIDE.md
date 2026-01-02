# Vercel Deployment Guide

## Automatic Deployment

Vercel should automatically deploy when you push to the `main` branch on GitHub. If it's not deploying automatically, try the following:

## Option 1: Trigger Deployment via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in to your account

2. **Select Your Project**
   - Find "bookit-safari-platform" (or your project name)
   - Click on it

3. **Redeploy**
   - Go to the "Deployments" tab
   - Find the latest deployment (or any previous one)
   - Click the "..." (three dots) menu
   - Select "Redeploy"
   - Confirm the redeployment

## Option 2: Trigger via Empty Commit

If you want to trigger a new deployment from the command line:

```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

## Option 3: Install Vercel CLI and Deploy

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project (if not already linked):**
   ```bash
   vercel link
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Deployment Not Triggering Automatically

1. **Check GitHub Integration:**
   - Go to Vercel Dashboard → Project Settings → Git
   - Verify GitHub repository is connected
   - Check that the correct branch (`main`) is selected for production

2. **Check Build Settings:**
   - Go to Project Settings → General
   - Verify:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Check Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Ensure all required variables are set:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`)

4. **Check Deployment Logs:**
   - Go to the Deployments tab
   - Click on the latest deployment
   - Check the build logs for any errors

### Common Build Errors

1. **Missing Environment Variables:**
   - Add them in Vercel Dashboard → Project Settings → Environment Variables
   - Redeploy after adding

2. **Build Timeout:**
   - Check if the build is taking too long
   - Consider optimizing the build process

3. **Module Not Found:**
   - Ensure all dependencies are in `package.json`
   - Run `npm install` locally to verify

## Current Project Status

- **Repository**: `tramatechnologies/bookit-safari-platform`
- **Branch**: `main`
- **Latest Commit**: `263b271` - "Update dashboard layout, authentication flow, and add Bing site verification"
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Quick Deploy Command

If you have Vercel CLI installed:

```bash
vercel --prod
```

This will deploy the current state of your project to production.

