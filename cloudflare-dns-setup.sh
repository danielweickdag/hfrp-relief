#!/bin/bash

# Cloudflare DNS Setup for familyreliefproject7.org
echo "☁️  Cloudflare DNS Configuration for familyreliefproject7.org"
echo "============================================================="
echo ""

DOMAIN="familyreliefproject7.org"
VERCEL_IP="76.76.21.21"

# Check if Cloudflare API credentials are available
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo "❌ Cloudflare API credentials not found"
    echo ""
    echo "To automatically configure DNS, you need:"
    echo "1. Cloudflare API Token with Zone:Edit permissions"
    echo "2. Zone ID for familyreliefproject7.org"
    echo ""
    echo "Get these from: https://dash.cloudflare.com/profile/api-tokens"
    echo ""
    echo "Then set environment variables:"
    echo "  export CLOUDFLARE_API_TOKEN='your_token_here'"
    echo "  export CLOUDFLARE_ZONE_ID='your_zone_id_here'"
    echo ""
    echo "Manual Configuration:"
    echo "1. Go to https://dash.cloudflare.com"
    echo "2. Select familyreliefproject7.org domain"
    echo "3. Go to DNS > Records"
    echo "4. Add/Update these A records:"
    echo ""
    echo "   Type: A"
    echo "   Name: @ (or familyreliefproject7.org)"
    echo "   IPv4 address: $VERCEL_IP"
    echo "   Proxy status: DNS only (gray cloud)"
    echo "   TTL: Auto"
    echo ""
    echo "   Type: A"
    echo "   Name: www"
    echo "   IPv4 address: $VERCEL_IP"
    echo "   Proxy status: DNS only (gray cloud)"
    echo "   TTL: Auto"
    echo ""
    exit 1
fi

echo "✅ Cloudflare API credentials found"
echo "🔧 Configuring DNS records automatically..."
echo ""

# Function to make Cloudflare API calls
cf_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    curl -s -X "$method" \
         "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/$endpoint" \
         -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
         -H "Content-Type: application/json" \
         ${data:+-d "$data"}
}

# Get existing DNS records
echo "📋 Checking existing DNS records..."
existing_records=$(cf_api "GET" "dns_records?type=A&name=$DOMAIN")
existing_www_records=$(cf_api "GET" "dns_records?type=A&name=www.$DOMAIN")

# Parse existing record IDs
apex_record_id=$(echo "$existing_records" | jq -r '.result[0].id // empty' 2>/dev/null)
www_record_id=$(echo "$existing_www_records" | jq -r '.result[0].id // empty' 2>/dev/null)

# Configure apex domain (@ record)
echo "🌐 Configuring apex domain ($DOMAIN)..."
if [ -n "$apex_record_id" ] && [ "$apex_record_id" != "null" ]; then
    echo "  Updating existing A record..."
    result=$(cf_api "PUT" "dns_records/$apex_record_id" "{
        \"type\": \"A\",
        \"name\": \"$DOMAIN\",
        \"content\": \"$VERCEL_IP\",
        \"ttl\": 1,
        \"proxied\": false
    }")
else
    echo "  Creating new A record..."
    result=$(cf_api "POST" "dns_records" "{
        \"type\": \"A\",
        \"name\": \"$DOMAIN\",
        \"content\": \"$VERCEL_IP\",
        \"ttl\": 1,
        \"proxied\": false
    }")
fi

if echo "$result" | jq -e '.success' >/dev/null 2>&1; then
    echo "  ✅ Apex domain configured successfully"
else
    echo "  ❌ Failed to configure apex domain"
    echo "  Error: $(echo "$result" | jq -r '.errors[0].message // "Unknown error"')"
fi

# Configure www subdomain
echo "🌐 Configuring www subdomain (www.$DOMAIN)..."
if [ -n "$www_record_id" ] && [ "$www_record_id" != "null" ]; then
    echo "  Updating existing A record..."
    result=$(cf_api "PUT" "dns_records/$www_record_id" "{
        \"type\": \"A\",
        \"name\": \"www\",
        \"content\": \"$VERCEL_IP\",
        \"ttl\": 1,
        \"proxied\": false
    }")
else
    echo "  Creating new A record..."
    result=$(cf_api "POST" "dns_records" "{
        \"type\": \"A\",
        \"name\": \"www\",
        \"content\": \"$VERCEL_IP\",
        \"ttl\": 1,
        \"proxied\": false
    }")
fi

if echo "$result" | jq -e '.success' >/dev/null 2>&1; then
    echo "  ✅ WWW subdomain configured successfully"
else
    echo "  ❌ Failed to configure www subdomain"
    echo "  Error: $(echo "$result" | jq -r '.errors[0].message // "Unknown error"')"
fi

echo ""
echo "🎉 DNS configuration complete!"
echo ""
echo "⏱️  DNS changes may take 5-30 minutes to propagate globally"
echo "🔄 Check status with: ./verify-domain.sh"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "📊 Vercel will automatically verify the domain once DNS propagates"