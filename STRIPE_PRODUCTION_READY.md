# 🚀 Going Live with Stripe Payments

This document provides a final checklist and instructions to ensure your Stripe integration is ready for production (Live Mode).

## 1. Required Environment Variables

To activate live payments, you MUST set the following environment variables in your production environment (e.g., Vercel, Netlify, or your server):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_STRIPE_LIVE_MODE` | `true` |
| `NEXT_PUBLIC_STRIPE_TEST_MODE` | `false` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (Your Live Publishable Key) |
| `STRIPE_SECRET_KEY` | `sk_live_...` (Your Live Secret Key) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (Your Live Webhook Secret) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.familyreliefproject.org` |

## 2. Webhook Configuration

1.  Go to the [Stripe Dashboard](https://dashboard.stripe.com/).
2.  Navigate to **Developers > Webhooks**.
3.  Click **Add endpoint**.
4.  Endpoint URL: `https://www.familyreliefproject.org/api/stripe/webhook`
5.  Select events to listen to:
    - `checkout.session.completed`
    - `payment_intent.succeeded`
    - `invoice.payment_succeeded`
    - `customer.subscription.created`
    - `customer.subscription.deleted`
6.  Copy the **Signing secret** (starts with `whsec_`) and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`.

## 3. Security Verification

- [x] Hardcoded live keys removed from `transaction-viewer.js`.
- [x] API routes use server-side environment variables for the Secret Key.
- [x] Client-side components use the `NEXT_PUBLIC_` prefixed keys.
- [x] Configuration logic in `stripeConfig.ts` correctly toggles between Test and Live mode based on environment variables.

## 4. Testing in Live Mode

Once deployed with live keys:
1.  **Do not use test card numbers** (e.g., 4242...). Use a real card for a small donation (e.g., $1.00) to verify the flow.
2.  Verify that the "Success" page correctly displays the donation details.
3.  Check the Stripe Dashboard to ensure the payment was processed successfully.
4.  Verify that the webhook was received and processed (if applicable).

## 5. Automation & Monitoring

The system includes automated monitoring for Stripe health:
- `stripe-automation-workflow.mjs` can be run to monitor system health and process automation queues.
- Ensure `STRIPE_SECRET_KEY` is set in the environment where this script runs.

---
**Warning:** Never share your `sk_live_` secret key or check it into version control. If a key is compromised, roll it immediately in the Stripe Dashboard.
