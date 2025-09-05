# Webhook Configuration for Live Stripe

## Required Webhook Events

Add these events to your Stripe webhook in the dashboard:

1. **payment_intent.succeeded** - When a payment is completed
2. **payment_intent.payment_failed** - When a payment fails
3. **checkout.session.completed** - When a checkout session completes
4. **invoice.payment_succeeded** - For subscription payments
5. **customer.subscription.created** - New subscriptions
6. **customer.subscription.updated** - Subscription changes
7. **customer.subscription.deleted** - Subscription cancellations

## Webhook Endpoint URL

When you deploy to production, your webhook URL will be:

- **Vercel**: `https://your-domain.vercel.app/api/stripe/webhook`
- **Netlify**: `https://your-domain.netlify.app/api/stripe/webhook`

## Security Note

The webhook signing secret (whsec\_...) is different from your API keys and is required for webhook verification.

## Testing Webhooks Locally

For local testing, you can use Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

This will give you a test webhook secret starting with `whsec_test_...`
