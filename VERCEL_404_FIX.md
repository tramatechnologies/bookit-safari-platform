# Fixing 404 Errors on Vercel

If you're experiencing 404 errors when refreshing pages on Vercel, follow these steps:

## 1. Verify vercel.json Configuration

The `vercel.json` file should contain:
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 2. Verify Vercel Project Settings

Go to your Vercel Dashboard → Project Settings → General and verify:

- **Framework Preset**: `Vite` (or `Other`)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `./` (leave empty if project is at root)

## 3. Verify Build Output

After building locally, check that `dist/index.html` exists:
```bash
npm run build
ls dist/index.html  # Should exist
```

## 4. Clear Vercel Cache and Redeploy

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "..." → "Redeploy"
4. Check "Use existing Build Cache" → Uncheck it
5. Click "Redeploy"

## 5. Test the Rewrite

After deployment, test these URLs:
- `https://your-domain.com/` (should work)
- `https://your-domain.com/dashboard` (should work, not 404)
- `https://your-domain.com/bookings` (should work, not 404)
- `https://your-domain.com/profile` (should work, not 404)

## 6. Check Deployment Logs

If still not working:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the "Build Logs" for any errors
4. Check the "Function Logs" if using serverless functions

## 7. Verify Static Files Are Served

Static files should be served directly:
- `https://your-domain.com/sitemap.xml` (should return XML)
- `https://your-domain.com/robots.txt` (should return text)
- `https://your-domain.com/images/logo.png` (should return image)

## Common Issues

### Issue: Rewrite not working
**Solution**: Ensure `vercel.json` is in the root directory and committed to git.

### Issue: Build output not found
**Solution**: Verify the Output Directory in Vercel settings matches your build output (`dist` for Vite).

### Issue: Still getting 404s
**Solution**: 
1. Clear browser cache
2. Try incognito mode
3. Check if the deployment actually succeeded
4. Verify the rewrite rule is being applied (check Network tab in browser dev tools)

## How It Works

1. Vercel automatically serves static files (from `dist/` or `public/`) first
2. If a file doesn't exist, the rewrite rule catches it
3. The rewrite sends the request to `/index.html`
4. React Router handles the routing client-side
5. The correct page is displayed

## Still Having Issues?

If you've tried all the above and still get 404 errors:
1. Check Vercel's status page: https://vercel-status.com
2. Review Vercel's documentation: https://vercel.com/docs
3. Contact Vercel support with your deployment logs

