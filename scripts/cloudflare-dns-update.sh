#!/usr/bin/env bash
set -euo pipefail

# Update Cloudflare DNS for familyreliefproject.org to point to Vercel
# Requirements:
# - Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID
# - Tools: curl, jq

DOMAIN="familyreliefproject.org"
APEX_TARGET="76.76.21.21"
WWW_TARGET="cname.vercel-dns.com"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ZONE_ID:-}" ]]; then
  echo "❌ Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID env vars"
  echo "   Example: export CLOUDFLARE_API_TOKEN=cf_...; export CLOUDFLARE_ZONE_ID=..."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is required. Install with: brew install jq (macOS)"
  exit 1
fi

CF_API="https://api.cloudflare.com/client/v4"
AUTH_HEADER=("-H" "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "-H" "Content-Type: application/json")

echo "🚀 Updating Cloudflare DNS for ${DOMAIN}"

# Upsert A record for apex
echo "🔧 Upserting A @ → ${APEX_TARGET}"
APEX_NAME="${DOMAIN}"
APEX_LIST=$(curl -s -X GET "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/dns_records?type=A&name=${APEX_NAME}" "${AUTH_HEADER[@]}")
APEX_ID=$(echo "$APEX_LIST" | jq -r '.result[0].id // empty')

APEX_PAYLOAD=$(jq -nc --arg type "A" --arg name "$APEX_NAME" --arg content "$APEX_TARGET" '{type:$type,name:$name,content:$content,ttl:1,proxied:false}')
if [[ -n "$APEX_ID" ]]; then
  curl -s -X PUT "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${APEX_ID}" "${AUTH_HEADER[@]}" --data "$APEX_PAYLOAD" | jq -r '.success' | grep -q true && echo "✅ Updated A @"
else
  curl -s -X POST "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/dns_records" "${AUTH_HEADER[@]}" --data "$APEX_PAYLOAD" | jq -r '.success' | grep -q true && echo "✅ Created A @"
fi

# Upsert CNAME for www
echo "🔧 Upserting CNAME www → ${WWW_TARGET}"
WWW_NAME="www.${DOMAIN}"
WWW_LIST=$(curl -s -X GET "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/dns_records?type=CNAME&name=${WWW_NAME}" "${AUTH_HEADER[@]}")
WWW_ID=$(echo "$WWW_LIST" | jq -r '.result[0].id // empty')

WWW_PAYLOAD=$(jq -nc --arg type "CNAME" --arg name "$WWW_NAME" --arg content "$WWW_TARGET" '{type:$type,name:$name,content:$content,ttl:1,proxied:false}')
if [[ -n "$WWW_ID" ]]; then
  curl -s -X PUT "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${WWW_ID}" "${AUTH_HEADER[@]}" --data "$WWW_PAYLOAD" | jq -r '.success' | grep -q true && echo "✅ Updated CNAME www"
else
  curl -s -X POST "${CF_API}/zones/${CLOUDFLARE_ZONE_ID}/dns_records" "${AUTH_HEADER[@]}" --data "$WWW_PAYLOAD" | jq -r '.success' | grep -q true && echo "✅ Created CNAME www"
fi

echo "\n📡 DNS updated. Verify with: bash verify-domain.sh --strict"