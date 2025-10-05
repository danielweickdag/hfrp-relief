#!/usr/bin/env bash
set -euo pipefail

# Attach familyreliefproject.org and www.familyreliefproject.org to a Vercel project
# Requirements:
# - Vercel CLI installed (`npm i -g vercel`)
# - `VERCEL_TOKEN` env var set with an access token
# - Logged-in or token provided; project must be the intended `hfrp-relief`

DOMAIN_APEX="familyreliefproject.org"
DOMAIN_WWW="www.familyreliefproject.org"

echo "🚀 Attaching domains to Vercel project"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "❌ VERCEL_TOKEN environment variable is not set."
  echo "   Create a token at https://vercel.com/account/tokens and export it:"
  echo "   export VERCEL_TOKEN=\"your-token\""
  exit 1
fi

# Try to add apex domain
echo "\n🔗 Adding apex domain: ${DOMAIN_APEX}"
if vercel domains add "${DOMAIN_APEX}" --token "$VERCEL_TOKEN" 2>&1 | tee /tmp/vercel_apex.log; then
  echo "✅ Added ${DOMAIN_APEX} to current project"
else
  if grep -qi "already assigned" /tmp/vercel_apex.log; then
    echo "⚠️ ${DOMAIN_APEX} is already assigned to another project/team."
    echo "   Ask the owner to move/remove it from that project, then re-run."
  else
    echo "❌ Failed to add ${DOMAIN_APEX}. See above output for details."
  fi
fi

# Try to add www subdomain
echo "\n🔗 Adding www subdomain: ${DOMAIN_WWW}"
if vercel domains add "${DOMAIN_WWW}" --token "$VERCEL_TOKEN" 2>&1 | tee /tmp/vercel_www.log; then
  echo "✅ Added ${DOMAIN_WWW} to current project"
else
  if grep -qi "already assigned" /tmp/vercel_www.log; then
    echo "⚠️ ${DOMAIN_WWW} is already assigned to another project/team."
    echo "   Ask the owner to move/remove it from that project, then re-run."
  else
    echo "❌ Failed to add ${DOMAIN_WWW}. See above output for details."
  fi
fi

echo "\n📋 Next: point DNS to Vercel"
echo "   A @ → 76.76.21.21"
echo "   CNAME www → cname.vercel-dns.com"
echo "   Then run: bash verify-domain.sh --strict"