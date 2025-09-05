# 🌐 Custom Domain Setup: familyreliefproject.org

## Your Domain Configuration

- **Domain**: familyreliefproject.org
- **DNS Provider**: Wix.com
- **Target**: Vercel deployment
- **SSL**: Automatic via Vercel

## 🚀 Step-by-Step Setup

### Step 1: Deploy to Vercel First

Let's get your site deployed to get a Vercel URL:

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

This will give you a URL like: `hfrp-relief-username.vercel.app`

### Step 2: Configure DNS in Wix

1. **Login to Wix**: Go to [wix.com](https://wix.com) and sign in
2. **Access Domains**: Go to **Domains** → **Manage Domains**
3. **Select Domain**: Click on `familyreliefproject.org`
4. **DNS Settings**: Look for **"Advanced DNS"** or **"DNS Records"**

### Step 3: Add DNS Records in Wix

#### For Root Domain (familyreliefproject.org):

```
Type: A
Host: @
Value: 76.76.19.61
TTL: 1 Hour (or Auto)
```

#### For WWW Subdomain:

```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 1 Hour (or Auto)
```

#### Alternative Setup (if A record doesn't work):

```
Type: CNAME
Host: @
Value: your-project.vercel.app
TTL: 1 Hour (or Auto)
```

### Step 4: Add Domain in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **hfrp-relief** project
3. Go to **Settings** → **Domains**
4. Click **"Add"**
5. Enter: `familyreliefproject.org`
6. Enter: `www.familyreliefproject.org` (optional but recommended)

### Step 5: Update Environment Variables

In Vercel Dashboard → Settings → Environment Variables, update:

```bash
NEXT_PUBLIC_SITE_URL=https://www.familyreliefproject.org
```

Then redeploy:

```bash
vercel --prod
```

## 🔧 Wix-Specific DNS Instructions

### If you can't find "Advanced DNS" in Wix:

1. Look for **"Connect a Domain"** or **"Point Domain"**
2. Select **"Connect to external site"**
3. Choose **"Other"** when asked about hosting provider
4. Follow the DNS record instructions above

### Common Wix DNS Interface Locations:

- **Option 1**: Domains → [Your Domain] → Advanced DNS
- **Option 2**: Domains → [Your Domain] → DNS Records
- **Option 3**: Dashboard → Domains → Manage → DNS

## ⚡ Production Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.familyreliefproject.org
NEXT_PUBLIC_SITE_NAME=Haitian Family Relief Project
NODE_ENV=production

# Stripe Live Configuration
NEXT_PUBLIC_STRIPE_TEST_MODE=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Rw9JfEUygl8L6JLw9zLcZEESyWFK8rH7eB8TAG56jyW3iF3YPr22iLaRhSi6hPPHmWAmD9jY5zBHUhecOZHSN5000Ecx69uyZ
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_WILL_BE_SET_AFTER_WEBHOOK_CREATION

# Campaign IDs
NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN=haiti-relief-main
NEXT_PUBLIC_STRIPE_MEMBERSHIP_CAMPAIGN=haiti-relief-membership
NEXT_PUBLIC_STRIPE_DAILY_GIVING_CAMPAIGN=haiti-relief-daily

# Security
NEXTAUTH_SECRET=your_secure_production_secret_here

# Email Configuration (optional)
EMAIL_SERVICE=resend
RESEND_FROM_EMAIL=noreply@familyreliefproject.org
RESEND_TO_EMAIL=contact@familyreliefproject.org
```

## 🔗 Stripe Webhook Setup (After Domain is Live)

Once your domain is working, set up Stripe webhook:

**Webhook URL**: `https://www.familyreliefproject.org/api/stripe/webhook`

In Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://www.familyreliefproject.org/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`, etc.
4. Copy webhook secret to environment variables

## 🧪 Testing Your Setup

After DNS propagation (can take 24 hours):

1. **Main Site**: https://www.familyreliefproject.org
2. **Configuration Test**: https://www.familyreliefproject.org/stripe-live-test
3. **Webhook Test**: https://www.familyreliefproject.org/webhook-test

## 📋 Timeline

- **Immediate**: Deploy to Vercel (5 minutes)
- **15 minutes**: Add DNS records in Wix
- **1-24 hours**: DNS propagation
- **After DNS works**: Set up Stripe webhook
- **Final**: Test live donations

## 🚨 Important Notes

- **DNS Propagation**: Can take up to 24 hours
- **SSL Certificate**: Automatic once domain connects to Vercel
- **Wix Interface**: May vary - look for "DNS", "Advanced", or "Connect Domain"
- **Test First**: Use a small donation ($1) to test everything works

## 🎯 Next Steps

1. **Deploy now**: Run `vercel --prod`
2. **Configure Wix DNS**: Add the A and CNAME records above
3. **Add domain in Vercel**: Connect familyreliefproject.org
4. **Wait for propagation**: Usually 1-4 hours
5. **Set up Stripe webhook**: Once domain is live
6. **Test everything**: Small donation to verify

Ready to deploy? Let's start with the Vercel deployment! 🚀
