# Sitemap Troubleshooting Guide for Google Search Console

## Issue: "Could not fetch" error in Google Search Console

This guide will help you resolve the sitemap fetch error in Google Search Console.

## Step 1: Verify Sitemap is Accessible

1. **Test in Browser**: Open `https://www.bookitsafari.com/sitemap.xml` directly in your browser
   - You should see the XML content displayed
   - If you see HTML or an error, the sitemap is not being served correctly

2. **Check HTTP Status**: Use an online tool like [httpstatus.io](https://httpstatus.io/) to verify:
   - URL: `https://www.bookitsafari.com/sitemap.xml`
   - Expected Status: `200 OK`
   - Content-Type: `application/xml` or `text/xml`

3. **Validate XML Format**: Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
   - Enter: `https://www.bookitsafari.com/sitemap.xml`
   - Check for any XML syntax errors

## Step 2: Verify Vercel Deployment

1. **Check Deployment Status**: 
   - Go to your Vercel dashboard
   - Ensure the latest deployment is successful
   - The deployment should include the updated `vercel.json` configuration

2. **Wait for Propagation**: 
   - After deployment, wait 2-5 minutes for changes to propagate globally
   - CDN cache may take a few minutes to update

## Step 3: Fix in Google Search Console

1. **Remove Old Sitemap Entry**:
   - Go to Google Search Console
   - Navigate to: Sitemaps (under Indexing)
   - Find `https://www.bookitsafari.com/sitemap.xml`
   - Click the three dots menu → Remove

2. **Resubmit Sitemap**:
   - Click "Add a new sitemap"
   - Enter: `sitemap.xml` (or the full URL: `https://www.bookitsafari.com/sitemap.xml`)
   - Click "Submit"

3. **Wait for Processing**:
   - Google may take a few minutes to hours to process
   - Check back in 24-48 hours for status updates

## Step 4: Verify robots.txt

Ensure your `robots.txt` includes the sitemap reference:
```
Sitemap: https://www.bookitsafari.com/sitemap.xml
```

## Step 5: Common Issues and Solutions

### Issue: Sitemap returns HTML instead of XML
**Solution**: The Vercel rewrite rule is catching the sitemap. The updated `vercel.json` should fix this.

### Issue: 404 Not Found
**Solution**: 
- Verify the file exists in `public/sitemap.xml`
- Check Vercel build logs to ensure the file is included in the deployment

### Issue: Wrong Content-Type
**Solution**: The `vercel.json` now sets `Content-Type: application/xml` for sitemap.xml

### Issue: CORS or Access Denied
**Solution**: 
- Check if there are any firewall rules blocking Googlebot
- Verify robots.txt doesn't block the sitemap

## Step 6: Test with Google's Tools

1. **Google Search Console URL Inspection Tool**:
   - Go to: URL Inspection (under Indexing)
   - Enter: `https://www.bookitsafari.com/sitemap.xml`
   - Click "Test Live URL"
   - Check if it shows as "Indexable" and returns 200 status

2. **Google Rich Results Test**:
   - Not applicable for sitemaps, but useful for testing individual pages

## Current Sitemap Configuration

- **Location**: `public/sitemap.xml`
- **URL**: `https://www.bookitsafari.com/sitemap.xml`
- **Format**: XML Sitemap Protocol 0.9
- **Total URLs**: 13 pages
- **Last Updated**: 2026-01-02

## Pages Included in Sitemap

1. Homepage (`/`)
2. Authentication (`/auth`)
3. Search (`/search`)
4. Routes (`/routes`)
5. Dashboard (`/dashboard`)
6. Bookings (`/bookings`)
7. Profile (`/profile`)
8. Operators (`/operators`)
9. Operator Register (`/operator/register`)
10. About (`/about`)
11. Help (`/help`)
12. Partner (`/partner`)
13. Advertise (`/advertise`)
14. Privacy (`/privacy`)
15. Terms (`/terms`)

## Next Steps

1. ✅ Verify sitemap is accessible in browser
2. ✅ Check HTTP status code (should be 200)
3. ✅ Validate XML format
4. ✅ Remove and resubmit in Google Search Console
5. ✅ Wait 24-48 hours for Google to process
6. ✅ Check status in Google Search Console

## Support

If issues persist after following these steps:
- Check Vercel deployment logs
- Verify DNS and domain configuration
- Contact Vercel support if deployment issues
- Post in Google Search Console Help Community

