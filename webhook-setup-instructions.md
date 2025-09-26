# 🔗 Automated Webhook Setup Instructions

## Step 1: Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Switch to LIVE mode (toggle in top-left corner)
3. Navigate to Developers → Webhooks

## Step 2: Add Webhook Endpoint
1. Click "+ Add endpoint"
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Select these events:
   - checkout.session.completed
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - invoice.payment_succeeded
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted

## Step 3: Copy Webhook Secret
1. Click on your webhook in the list
2. Click "Reveal" next to "Signing secret"
3. Copy the secret (starts with whsec_)
4. Update your production environment variables

## Step 4: Deploy to Production
Run: `./setup-stripe-automation.sh --production`
