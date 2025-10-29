#!/usr/bin/env bash
set -euo pipefail

# Create a Stripe webhook endpoint for production and print the signing secret
# Requirements:
# - Env: STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL
# - Tools: curl, jq

if [[ -z "${STRIPE_SECRET_KEY:-}" || -z "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
  echo "❌ Set STRIPE_SECRET_KEY and NEXT_PUBLIC_SITE_URL env vars"
  echo "   Example: export STRIPE_SECRET_KEY=sk_live_...; export NEXT_PUBLIC_SITE_URL=https://www.familyreliefproject.org"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is required. Install with: brew install jq (macOS)"
  exit 1
fi

WEBHOOK_URL="${NEXT_PUBLIC_SITE_URL%/}/api/stripe/webhook"
EVENTS=(
  "checkout.session.completed"
  "payment_intent.succeeded"
  "payment_intent.payment_failed"
  "invoice.payment_succeeded"
  "customer.subscription.created"
  "customer.subscription.updated"
  "customer.subscription.deleted"
)

echo "🚀 Creating Stripe webhook endpoint for: ${WEBHOOK_URL}"

# Build curl data parameters
CURL_DATA="-d url=${WEBHOOK_URL}"
for ev in "${EVENTS[@]}"; do
  CURL_DATA="${CURL_DATA} -d enabled_events[]=${ev}"
done

RESP=$(curl -s -X POST https://api.stripe.com/v1/webhook_endpoints \
  -H "Authorization: Bearer ${STRIPE_SECRET_KEY}" \
  ${CURL_DATA})

SUCCESS=$(echo "$RESP" | jq -r '.id // empty')
SECRET=$(echo "$RESP" | jq -r '.secret // empty')

if [[ -n "$SUCCESS" && -n "$SECRET" ]]; then
  echo "✅ Webhook created: $SUCCESS"
  echo "🔑 Signing secret: $SECRET"
  echo "📋 Add to production env: STRIPE_WEBHOOK_SECRET=$SECRET"
else
  echo "❌ Failed to create webhook. Response:"
  echo "$RESP"
  exit 1
fi