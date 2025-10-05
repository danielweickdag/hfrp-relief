# 🔒 SECURE STRIPE CONFIGURATION GUIDE

## ⚠️ IMPORTANT SECURITY NOTICE

You've shared a **live** Stripe publishable key. Here's how to configure it securely:

## 🎯 IMMEDIATE ACTIONS REQUIRED:

### 1. **Configure Your Live Key Securely**

For your production environment, you need to update your environment variables:

```bash
# Production Environment Variables
NEXT_PUBLIC_STRIPE_TEST_MODE=false
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Rw9JfEUygl8L6JLw9zLcZEESyWFK8rH7eB8TAG56jyW3iF3YPr22iLaRhSi6hPPHmWAmD9jY5zBHUhecOZHSN5000Ecx69uyZ
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE  # ⚠️ YOU NEED THIS FROM STRIPE DASHBOARD
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET  # ⚠️ YOU NEED THIS FOR WEBHOOKS
```

### 2. **Required Stripe Dashboard Steps**

1. **Get Your Secret Key**:
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your **Secret key** (starts with `sk_live_`)
   - ⚠️ NEVER SHARE THIS PUBLICLY

2. **Set Up Webhooks**:
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `invoice.payment_succeeded`
   - Copy the webhook secret (starts with `whsec_`)

### 3. **Deployment Configuration**

**For Vercel:**

```bash
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Paste: pk_live_51Rw9JfEUygl8L6JLw9zLcZEESyWFK8rH7eB8TAG56jyW3iF3YPr22iLaRhSi6hPPHmWAmD9jY5zBHUhecOZHSN5000Ecx69uyZ

vercel env add STRIPE_SECRET_KEY
# Paste your sk_live_ key here

vercel env add NEXT_PUBLIC_STRIPE_TEST_MODE
# Set to: false
```

**For Netlify:**

- Go to Site Settings > Environment Variables
- Add the same variables as above

## 🔧 CURRENT DEVELOPMENT SETUP

Your current `.env.local` is correctly configured for **testing**:

- Uses test keys (pk*test*/sk*test*)
- STRIPE_TEST_MODE=true
- No real charges will be made

## 🚀 PRODUCTION CHECKLIST

- [ ] Add live secret key to production environment
- [ ] Set up webhooks in Stripe dashboard
- [ ] Test with small amounts first
- [ ] Monitor Stripe dashboard for transactions
- [ ] Set up proper error handling and logging
- [ ] Configure email notifications for successful donations

## 🔒 SECURITY BEST PRACTICES

1. **Never commit API keys to version control**
2. **Use environment variables for all keys**
3. **Rotate keys regularly**
4. **Monitor your Stripe dashboard**
5. **Set up fraud detection**
6. **Use webhook signatures for validation**

Would you like me to help you test the live configuration once you have your secret key?
