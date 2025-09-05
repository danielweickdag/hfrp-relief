# 🚀 Live Stripe Setup - Next Steps

## ✅ Current Status

- **Live Publishable Key**: Configured ✅
- **Live Secret Key**: Configured ✅
- **Webhook Setup**: **NEEDED** ⚠️

## 🔧 Next Step: Configure Webhooks

### 1. Go to Stripe Dashboard

1. Visit: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Make sure you're in LIVE mode** (toggle in top-left corner)
3. Navigate to **Developers** → **Webhooks**

### 2. Add Webhook Endpoint

1. Click **"+ Add endpoint"**
2. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
   - For Vercel: `https://your-project.vercel.app/api/stripe/webhook`
   - For Netlify: `https://your-project.netlify.app/api/stripe/webhook`

### 3. Select Events

Add these specific events:

```
payment_intent.succeeded
payment_intent.payment_failed
checkout.session.completed
invoice.payment_succeeded
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

### 4. Copy Webhook Secret

1. After creating the webhook, click on it
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Add it to your production environment variables

## 🛠️ Production Deployment

### Environment Variables for Your Hosting Platform

Copy these to **Vercel** or **Netlify** environment variables:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_TEST_MODE=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx_REDACTED_xxx51Rw9JfEUygl8L6JLw9zLcZEESyWFK8rH7eB8TAG56jyW3iF3YPr22iLaRhSi6hPPHmWAmD9jY5zBHUhecOZHSN5000Ecx69uyZ
STRIPE_SECRET_KEY=sk_live_xxx_REDACTED_xxx51Rw9JfEUygl8L6JLAhAzuH3FdTMrSZKvDyDSsXY5hR0bCj5hBUojx6usltbKgpY8AlECprNX8A3Fd65wzkojFLpt002uC9WTqS
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_STEP_4

# Other required variables
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secure_random_string
NODE_ENV=production
```

## ⚠️ Security Reminders

- ✅ **Never commit live keys to Git**
- ✅ **Only set live keys in production environment**
- ✅ **Test with small amounts first** ($1-5)
- ✅ **Monitor Stripe Dashboard** for live transactions

## 🧪 Testing Your Live Setup

1. **Deploy to production** with live environment variables
2. **Make a test donation** (small amount)
3. **Check Stripe Dashboard** to see the transaction
4. **Verify webhook delivery** in Stripe Dashboard

## 📱 Quick Deployment Commands

### For Vercel:

```bash
vercel --prod
```

### For Netlify:

```bash
netlify deploy --prod
```

## 🎯 You're Almost Ready!

**Remaining steps:**

1. Set up webhooks (5 minutes)
2. Deploy to production (2 minutes)
3. Test with small donation (1 minute)

Your HFRP Relief donation system will then be live and accepting real donations! 🌟
