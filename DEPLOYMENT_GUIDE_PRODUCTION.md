# 🚀 HFRP Relief - Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Quality & Testing
- [x] All linting issues fixed (Biome)
- [x] TypeScript compilation successful
- [x] Build completes without errors
- [x] Stripe payment flow tested locally
- [x] Admin panel tested
- [x] Webhook handlers verified

### 🔐 Environment Variables

**Required for Production:**

```env
# Stripe Configuration (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_TEST_MODE=false

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.familyreliefproject7.org
NODE_ENV=production

# Admin Security
SESSION_SECRET=YOUR_SECURE_RANDOM_STRING

# Optional: Email Service
RESEND_API_KEY=re_YOUR_RESEND_API_KEY

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 🔧 Stripe Setup

#### 1. Get Live API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Switch to **LIVE mode** (toggle in top right)
3. Copy **Publishable key** (starts with `pk_live_`)
4. Reveal and copy **Secret key** (starts with `sk_live_`)

#### 2. Configure Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Set URL: `https://www.familyreliefproject7.org/api/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.created`
   - `customer.updated`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)

### 📋 Vercel Deployment

#### 1. Connect Repository
```bash
# Login to Vercel
npm install -g vercel
vercel login

# Deploy to production
vercel --prod
```

#### 2. Set Environment Variables
In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add all variables from above
3. Ensure they're set for **Production** environment

#### 3. Configure Domain
1. Go to **Settings** → **Domains**
2. Add domain: `www.familyreliefproject7.org`
3. Add domain: `familyreliefproject7.org` (redirect to www)
4. Update DNS records as instructed by Vercel

#### 4. Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x

### 🔒 Security Checklist

- [ ] Change default admin password (currently: `Melirosecherie58`)
- [ ] Remove test credentials from login page
- [ ] Enable HTTPS only (automatic with Vercel)
- [ ] Configure Content Security Policy headers
- [ ] Set secure session cookies
- [ ] Review and update CORS settings
- [ ] Enable rate limiting for API routes

### 📊 Post-Deployment Verification

#### 1. Test Core Functionality
```bash
# Test homepage
curl -I https://www.familyreliefproject7.org

# Test donate page
curl -I https://www.familyreliefproject7.org/donate

# Test admin panel
curl -I https://www.familyreliefproject7.org/admin

# Test webhook endpoint
curl https://www.familyreliefproject7.org/api/stripe/webhook
```

#### 2. Verify Stripe Integration
- [ ] Make a small test donation ($1)
- [ ] Verify donation appears in Stripe Dashboard
- [ ] Check webhook events received
- [ ] Confirm data logged to `data/donations.json`
- [ ] Test donation receipt email (if configured)

#### 3. Admin Panel Check
- [ ] Login with admin credentials
- [ ] View dashboard analytics
- [ ] Check donation reports
- [ ] Verify campaign management
- [ ] Test blog post creation

### 🎯 Monitoring & Maintenance

#### Analytics Setup
1. **Google Analytics** (Optional)
   - Create GA4 property
   - Add measurement ID to env vars
   - Verify tracking code loads

2. **Vercel Analytics** (Included)
   - Automatically enabled
   - View in Vercel Dashboard → Analytics

#### Error Monitoring
- Check Vercel Logs for errors
- Monitor webhook event logs
- Review failed payment attempts

#### Data Backups
- Automated backups to `data/backups/`
- Consider cloud storage backup (S3, Google Cloud)
- Database migration plan for scaling

### 🚨 Troubleshooting

#### Common Issues

**Stripe Webhook Not Receiving Events:**
```bash
# Verify webhook URL is correct
# Check Stripe Dashboard → Webhooks → Events
# Ensure webhook secret matches env var
# Check Vercel logs for webhook errors
```

**Build Failures:**
```bash
# Clear Vercel cache
vercel --prod --force

# Check build logs in Vercel Dashboard
# Verify all dependencies installed
```

**Admin Login Not Working:**
```bash
# Clear browser localStorage
# Check session secret is set
# Verify admin auth logic
```

### 📞 Support Resources

**Vercel:**
- Documentation: https://vercel.com/docs
- Support: support@vercel.com

**Stripe:**
- Documentation: https://stripe.com/docs
- Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com

**Next.js:**
- Documentation: https://nextjs.org/docs
- GitHub Issues: https://github.com/vercel/next.js

### 🎉 Launch Checklist

Final steps before going live:

- [ ] All environment variables set (production)
- [ ] Stripe live mode enabled and tested
- [ ] Domain DNS configured and verified
- [ ] SSL certificate active (automatic)
- [ ] Admin credentials secured
- [ ] Test donation completed successfully
- [ ] Webhook events processing correctly
- [ ] Error monitoring configured
- [ ] Backup system verified
- [ ] Analytics tracking enabled
- [ ] Team notified of launch
- [ ] Social media announcement prepared

---

## Quick Deploy Commands

```bash
# 1. Build and test locally
npm run build
npm start

# 2. Deploy to Vercel
vercel --prod

# 3. Verify deployment
curl -I https://www.familyreliefproject7.org

# 4. Test Stripe
node scripts/stripe-workflow-test.js

# 5. Monitor
vercel logs --follow
```

## Emergency Rollback

If issues arise after deployment:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific version
vercel --prod [deployment-url]
```

---

**Last Updated:** October 2025
**Prepared By:** HFRP Development Team
**Status:** Ready for Production 🚀
