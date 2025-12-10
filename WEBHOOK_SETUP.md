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

Use a single endpoint for both modes:

- **Production**: `https://www.familyreliefproject7.org/api/stripe/webhook`
- **Local (dev)**: `http://localhost:3005/api/stripe/webhook`
- **Vercel**: `https://your-domain.vercel.app/api/stripe/webhook`
- **Netlify**: `https://your-domain.netlify.app/api/stripe/webhook`

The handler supports dual-secret verification and will validate signatures using the appropriate test/live secret.

## Security Note

The webhook signing secret (whsec\_...) is different from your API keys and is required for webhook verification.

Recommended environment variables:

- `STRIPE_WEBHOOK_SECRET_TEST=whsec_AHCGaRg47FuDA2VUCoPqRsbzZLJa7I7p`
- `STRIPE_WEBHOOK_SECRET_LIVE=whsec_sHMNL4Kcwnm4RruqDQh67IzP3q817Hiv`
- Optional `STRIPE_WEBHOOK_SECRET` (set to live in production)

## Testing Webhooks Locally

For local testing, you can use Stripe CLI:

```bash
stripe login
stripe listen --forward-to http://localhost:3005/api/stripe/webhook
```

This will give you a test webhook secret starting with `whsec_test_...`

## Debugging Signatures (Local Only)

To troubleshoot signature mismatches during local development:

- Enable debug logging with either header or env:
  - Send header `X-Debug-Signature: 1`, or
  - Set `WEBHOOK_DEBUG_SIGNATURE=true` in your environment
- The handler will log:
  - Expected `v1` signatures for configured secrets
  - The incoming `Stripe-Signature` header
  - Payload length

Do not enable signature debug in production.

## Health Endpoint (Admin-only)

An admin-only health endpoint reports webhook configuration state:

- `GET /api/stripe/webhook/health`
- Requires header `X-Admin-Health-Token: <ADMIN_HEALTH_TOKEN>`
- Returns publishable key, secret presence, flags, and connected account scope

Configure `ADMIN_HEALTH_TOKEN` in your environment.

## Dual-Secret Verification

The handler supports separate secrets for test and live modes:

- `STRIPE_WEBHOOK_SECRET_TEST` for test mode
- `STRIPE_WEBHOOK_SECRET_LIVE` for live mode
- Optional shared `STRIPE_WEBHOOK_SECRET` fallback

The publishable key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) or test-mode flag is used to choose which secret to use at runtime.
