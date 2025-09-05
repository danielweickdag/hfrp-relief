# 🔗 Stripe Webhook Setup - Step by Step Guide

## Your Webhook Endpoint is Ready! ✅

Your application already has a fully configured webhook endpoint at:
`/api/stripe/webhook`

**Supported Events:**

- ✅ `checkout.session.completed` - Payment successful
- ✅ `payment_intent.succeeded` - Payment confirmed
- ✅ `payment_intent.payment_failed` - Payment failed
- ✅ `customer.subscription.created` - New subscription
- ✅ `customer.subscription.updated` - Subscription changes
- ✅ `customer.subscription.deleted` - Subscription cancelled
- ✅ `invoice.payment_succeeded` - Recurring payment success

## 🚀 Setup Steps

### Step 1: Access Stripe Dashboard

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **IMPORTANT**: Make sure you're in **LIVE mode** (toggle in top-left corner should show "LIVE")

### Step 2: Navigate to Webhooks

1. Click **Developers** in the left sidebar
2. Click **Webhooks**

### Step 3: Add Your Webhook Endpoint

1. Click **"+ Add endpoint"** button
2. **Endpoint URL**: Enter your production URL:
   ```
   https://your-domain.com/api/stripe/webhook
   ```
   Examples:
   - Vercel: `https://your-project.vercel.app/api/stripe/webhook`
   - Netlify: `https://your-project.netlify.app/api/stripe/webhook`
   - Custom domain: `https://haitianfamilyrelief.org/api/stripe/webhook`

### Step 4: Select Events

Click **"Select events"** and add these specific events:

**Payment Events:**

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Subscription Events:**

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

### Step 5: Save and Get Webhook Secret

1. Click **"Add endpoint"** to save
2. Click on your newly created webhook in the list
3. In the webhook details page, find **"Signing secret"**
4. Click **"Reveal"** to show the secret
5. **Copy the webhook secret** (starts with `whsec_...`)

### Step 6: Add Webhook Secret to Production Environment

Add this to your deployment platform environment variables:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_from_step_5
```

## 🧪 Testing Your Webhook

### Option 1: Test with Stripe CLI (Local)

```bash
# Install Stripe CLI if you haven't
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Test webhook locally
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### Option 2: Test in Production

1. Deploy your application with all environment variables
2. Make a small test donation ($1-5)
3. Check your server logs to see webhook events being processed
4. Verify in Stripe Dashboard under **Webhooks** → **Your endpoint** → **Events**

## 🔍 Webhook Status Check

After setup, you can verify webhooks are working by:

1. **Stripe Dashboard**: Go to your webhook → **Events** tab to see delivery status
2. **Server Logs**: Check your application logs for webhook processing messages
3. **Test Page**: Visit `https://your-domain.com/stripe-live-test` to verify configuration

## 🛡️ Security Features

Your webhook endpoint includes:

- ✅ **Signature verification** - Ensures webhooks are from Stripe
- ✅ **Error handling** - Gracefully handles failed events
- ✅ **Duplicate processing** - Uses both legacy and automated systems
- ✅ **Detailed logging** - Comprehensive event tracking

## 🚀 You're Almost Live!

**Current Status:**

- ✅ Live Stripe keys configured
- ✅ Webhook endpoint ready
- 🔄 **Next**: Set up webhook in Stripe Dashboard (5 minutes)
- 🔄 **Then**: Deploy to production with all environment variables

After completing these steps, your HFRP Relief donation system will be fully live and processing real donations! 🌟
