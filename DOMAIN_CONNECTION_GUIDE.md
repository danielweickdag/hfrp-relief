# 🌐 Domain Connection Guide - familyreliefproject.org

## 🎯 Overview

This guide will help you connect your HFRP Relief website to your custom domain `https://www.familyreliefproject.org`.

## 🚀 Deployment Options

### Option A: Vercel (Recommended - Fastest Setup)

Vercel is optimized for Next.js applications and provides automatic SSL, CDN, and easy domain management.

#### Step 1: Deploy to Vercel

1. **Fork this repository** to your GitHub account (if not already done)
2. **Go to [vercel.com](https://vercel.com)** and sign up/login
3. **Click "Import Project"**
4. **Connect your GitHub account** and select the `hfrp-relief` repository
5. **Configure environment variables** (see section below)
6. **Deploy** - First deployment takes 2-3 minutes

#### Step 2: Add Custom Domain

1. **In Vercel Dashboard** → Your Project → Settings → Domains
2. **Add Domain**: Enter `familyreliefproject.org`
3. **Add WWW Domain**: Enter `www.familyreliefproject.org`
4. **Copy the DNS records** provided by Vercel

#### Step 3: Configure DNS

**At your domain registrar (GoDaddy, Namecheap, etc.):**

1. **A Record**:
   - Name: `@`
   - Value: `76.76.19.61` (Vercel's IP)
2. **CNAME Record**:

   - Name: `www`
   - Value: `cname.vercel-dns.com`

3. **Wait for DNS propagation** (15 minutes to 48 hours)

### Option B: Netlify

#### Step 1: Deploy to Netlify

1. **Go to [netlify.com](https://netlify.com)** and sign up/login
2. **Connect to Git** → Choose GitHub → Select your repository
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Deploy site**

#### Step 2: Add Custom Domain

1. **Site Dashboard** → Domain Settings → Add Custom Domain
2. **Enter**: `familyreliefproject.org`
3. **Add redirect** for `www.familyreliefproject.org` → `familyreliefproject.org`

#### Step 3: Configure DNS

**At your domain registrar:**

1. **A Record**:

   - Name: `@`
   - Value: `75.2.60.5` (Netlify's IP)

2. **CNAME Record**:
   - Name: `www`
   - Value: Your Netlify subdomain (e.g., `amazing-site-123.netlify.app`)

## 🔧 Environment Variables Configuration

**Add these environment variables in your hosting platform:**

```env
# Production Settings
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.familyreliefproject.org
NEXT_PUBLIC_DONATION_TEST_MODE=false

# Donorbox Campaigns (Replace with your real campaign IDs)
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=your-main-campaign-id
NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=your-membership-campaign-id
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=your-daily-campaign-id

# Email Configuration (Resend - Recommended)
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@familyreliefproject.org
RESEND_TO_EMAIL=contact@familyreliefproject.org

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Security
NEXTAUTH_SECRET=your-secure-random-string-32-characters-long
```

## 📧 Email Setup for familyreliefproject.org

### Step 1: Set up Email Service (Resend Recommended)

1. **Go to [resend.com](https://resend.com)**
2. **Sign up for free account**
3. **Add your domain**: `familyreliefproject.org`
4. **Add DNS records** as instructed by Resend:

```dns
# Add these DNS records to your domain
TXT record: v=spf1 include:spf.resend.com ~all
CNAME record: resend._domainkey.familyreliefproject.org → resend._domainkey.resend.com
```

5. **Get your API key** and add to environment variables

### Step 2: Email Addresses Setup

Once domain is verified, you can use:

- `noreply@familyreliefproject.org` (for automated emails)
- `contact@familyreliefproject.org` (where you'll receive messages)
- `admin@familyreliefproject.org` (for admin notifications)

## 🔒 SSL Certificate Setup

Both Vercel and Netlify automatically provide SSL certificates:

- ✅ **Automatic SSL** - No configuration needed
- ✅ **Auto-renewal** - Never expires
- ✅ **Force HTTPS** - Automatic redirects

## 🧪 Testing Your Domain Connection

### After DNS Propagation:

1. **Visit your domain**: `https://www.familyreliefproject.org`
2. **Test key pages**:

   - Homepage: `/`
   - Donate page: `/donate`
   - Contact form: `/contact`
   - Admin panel: `/admin`

3. **Test functionality**:
   - Donation buttons open Donorbox
   - Contact form sends emails
   - Admin login works
   - Mobile responsiveness

### Troubleshooting Tools:

- **DNS Propagation**: https://dnschecker.org
- **SSL Test**: https://ssllabs.com/ssltest
- **Speed Test**: https://gtmetrix.com

## ⚡ Performance Optimization

### Automatic Optimizations:

- ✅ **Image optimization** - Automatic WebP conversion
- ✅ **Edge caching** - Fast global delivery
- ✅ **Code splitting** - Faster page loads
- ✅ **Compression** - Gzip/Brotli

### CDN Configuration (Optional)

Consider adding Cloudflare for additional:

- DDoS protection
- Additional caching
- Advanced analytics

## 📊 Post-Launch Checklist

### Day 1:

- [ ] Verify all pages load correctly
- [ ] Test donation flow with small real donation ($1-5)
- [ ] Confirm contact form emails arrive
- [ ] Check mobile experience
- [ ] Verify admin panel access

### Week 1:

- [ ] Monitor error rates in hosting dashboard
- [ ] Check Google Analytics data (if configured)
- [ ] Review Core Web Vitals scores
- [ ] Test from different devices/browsers
- [ ] Backup database (if applicable)

### Monthly:

- [ ] Review hosting usage and costs
- [ ] Update dependencies
- [ ] Check SSL certificate renewal
- [ ] Monitor site speed performance
- [ ] Review security logs

## 🔄 Backup and Monitoring

### Automatic Backups:

- **Code**: Automatically backed up on GitHub
- **Environment**: Document all environment variables securely
- **Content**: Consider backing up any dynamic content

### Monitoring:

- **Uptime**: Set up monitoring (UptimeRobot, Pingdom)
- **Performance**: Use Vercel Analytics or Google PageSpeed Insights
- **Errors**: Check hosting platform dashboards regularly

## 🆘 Emergency Procedures

### If Site Goes Down:

1. **Check hosting status page** (Vercel/Netlify status)
2. **Verify DNS settings** haven't changed
3. **Check domain registration** expiration
4. **Review recent deployments** for issues
5. **Rollback to previous version** if needed

### Emergency Contacts:

- **Domain Registrar Support**: [Your registrar's support]
- **Hosting Platform Support**: Vercel/Netlify support
- **Email Service Support**: Resend support

## 📞 Support Resources

### Vercel Support:

- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: support@vercel.com

### Netlify Support:

- Documentation: https://docs.netlify.com
- Community: https://community.netlify.com
- Support: support@netlify.com

### DNS/Domain Issues:

- Check with your domain registrar (GoDaddy, Namecheap, etc.)
- Use DNS tools: https://mxtoolbox.com
- Cloudflare DNS (free): https://cloudflare.com

## 🎉 Success Metrics

### Technical:

- **Page Load Speed**: < 3 seconds
- **Uptime**: > 99.9%
- **SSL Score**: A+ rating
- **Mobile Performance**: > 90 score

### Business:

- **Donation Conversions**: Track donation completions
- **Contact Form**: Monitor form submissions
- **User Engagement**: Analytics data
- **Social Shares**: Track social media engagement

---

**🚀 Once complete, your HFRP website will be live at https://www.familyreliefproject.org with full functionality!**

**Need help?** This guide covers the most common scenarios, but feel free to reach out if you encounter any specific issues during the setup process.

- ✅ **Code splitting** - Faster page loads
- ✅ **Compression** - Gzip/Brotli

### CDN Configuration (Optional)

Consider adding Cloudflare for additional:

- DDoS protection
- Additional caching
- Advanced analytics

## 📊 Post-Launch Checklist

### Day 1:

- [ ] Verify all pages load correctly
- [ ] Test donation flow with small real donation ($1-5)
- [ ] Confirm contact form emails arrive
- [ ] Check mobile experience
- [ ] Verify admin panel access

### Week 1:

- [ ] Monitor error rates in hosting dashboard
- [ ] Check Google Analytics data (if configured)
- [ ] Review Core Web Vitals scores
- [ ] Test from different devices/browsers
- [ ] Backup database (if applicable)

### Monthly:

- [ ] Review hosting usage and costs
- [ ] Update dependencies
- [ ] Check SSL certificate renewal
- [ ] Monitor site speed performance
- [ ] Review security logs
      Value: 76.76.19.61
      TTL: Auto

```

#### For WWW Subdomain:

```

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto

```

#### Alternative CNAME Setup:

```

Type: CNAME
Name: @
Value: your-project.vercel.app
TTL: Auto

````

## 📋 Step 3: Environment Variables Setup

Once your domain is connected, add these environment variables in Vercel:

### In Vercel Dashboard → Settings → Environment Variables:

```bash
# Stripe Live Configuration
NEXT_PUBLIC_STRIPE_TEST_MODE=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx_REDACTED_xxx51Rw9JfEUygl8L6JLw9zLcZEESyWFK8rH7eB8TAG56jyW3iF3YPr22iLaRhSi6hPPHmWAmD9jY5zBHUhecOZHSN5000Ecx69uyZ
STRIPE_SECRET_KEY=sk_live_xxx_REDACTED_xxx51Rw9JfEUygl8L6JLAhAzuH3FdTMrSZKvDyDSsXY5hR0bCj5hBUojx6usltbKgpY8AlECprNX8A3Fd65wzkojFLpt002uC9WTqS
STRIPE_WEBHOOK_SECRET=whsec_WILL_BE_SET_AFTER_WEBHOOK_CREATION

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Haitian Family Relief Project
NODE_ENV=production

# Campaign IDs
NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN=haiti-relief-main
NEXT_PUBLIC_STRIPE_MEMBERSHIP_CAMPAIGN=haiti-relief-membership
NEXT_PUBLIC_STRIPE_DAILY_GIVING_CAMPAIGN=haiti-relief-daily

# Security
NEXTAUTH_SECRET=your_production_nextauth_secret_here

# Email Configuration (when ready)
EMAIL_SERVICE=resend
RESEND_API_KEY=your_production_resend_api_key
RESEND_FROM_EMAIL=noreply@haitianfamilyrelief.org
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org

# Analytics (when ready)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_google_analytics_id
````

## 🔗 Step 4: Stripe Webhook Setup (After Domain Connection)

Once your domain is live, you'll set up the webhook with:
**Webhook URL**: `https://your-domain.com/api/stripe/webhook`

## ⚡ Quick Deployment Commands

### Deploy Now:

```bash
# From your project directory
vercel --prod
```

### Deploy with Environment Variables:

```bash
# Set environment variables during deployment
vercel env add NEXT_PUBLIC_STRIPE_TEST_MODE
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# ... add all other variables

# Then deploy
vercel --prod
```

## 🧪 Testing After Domain Connection

1. **Test Domain**: Visit `https://your-domain.com`
2. **Test Configuration**: Visit `https://your-domain.com/stripe-live-test`
3. **Test Webhook Endpoint**: Visit `https://your-domain.com/webhook-test`

## 🔒 Security Checklist

- [ ] Domain has SSL certificate (automatic with Vercel)
- [ ] All environment variables set in Vercel dashboard
- [ ] No sensitive keys in code repository
- [ ] Test mode disabled in production
- [ ] Webhook URL uses HTTPS

## 📞 What's Your Domain?

To help you with the specific setup, what domain will you be using for HFRP Relief?

- Is it already registered?
- Who is your DNS provider?
- Do you want to use the root domain or a subdomain?

Once you share your domain details, I can provide more specific DNS setup instructions! 🌟
