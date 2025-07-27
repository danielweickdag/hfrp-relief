# 🚀 Vercel Deployment Guide

## Quick Deployment Steps

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub account
   - Select this repository

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to your project settings
   - Add environment variables from `.env.example`
   - Required for basic functionality:
     ```
     NEXT_PUBLIC_GA_TRACKING_ID=your_google_analytics_id
     RESEND_API_KEY=your_resend_api_key (for contact forms)
     NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
     ```

4. **Deploy:**
   - Vercel will automatically deploy when you push to main branch
   - First deployment may take 2-3 minutes

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify contact form works (if email configured)
- [ ] Check donation buttons work (if Donorbox/Stripe configured)
- [ ] Test admin login (default password: Melirosecherie58)
- [ ] Update admin password in production

## Domain Configuration

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

## Performance

The site is optimized for Vercel with:

- ✅ Automatic image optimization
- ✅ Edge caching
- ✅ Serverless functions for API routes
- ✅ TypeScript compilation
- ✅ PWA capabilities

## Monitoring

- Check Vercel dashboard for deployment logs
- Use Google Analytics for traffic monitoring
- Monitor Core Web Vitals in Vercel analytics

---

**Need help?** The project is production-ready and optimized for Vercel deployment.
