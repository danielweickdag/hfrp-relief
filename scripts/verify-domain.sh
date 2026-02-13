#!/bin/bash
set -e

DOMAIN="${1:-familyreliefproject7.org}"
EXPECTED_NS="cloudflare.com"

echo "🔍 Verifying domain configuration for $DOMAIN..."

# Check Nameservers
echo "Checking Nameservers..."
NS_RECORDS=$(dig +short NS $DOMAIN)
if echo "$NS_RECORDS" | grep -q "$EXPECTED_NS"; then
  echo "✅ Nameservers are correctly pointing to Cloudflare."
else
  echo "❌ Nameservers check failed. Current NS records:"
  echo "$NS_RECORDS"
  if [ "$1" == "--strict" ]; then exit 1; fi
fi

# Check A Record
echo "Checking A Record..."
A_RECORD=$(dig +short A $DOMAIN)
if [ -n "$A_RECORD" ]; then
  echo "✅ A Record found: $A_RECORD"
else
  echo "❌ No A Record found."
  if [ "$1" == "--strict" ]; then exit 1; fi
fi

echo "🎉 Domain verification completed."
