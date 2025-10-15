#!/bin/bash

# Add familyreliefproject7.org to Cloudflare and Configure DNS
# This script helps add the domain to Cloudflare and configure DNS records

set -e

DOMAIN="familyreliefproject7.org"
VERCEL_IP="76.76.21.21"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"

echo "🌐 Adding $DOMAIN to Cloudflare and Configuring DNS"
echo "=================================================="

# Check if API token is available
if [ -z "$API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN not found in environment"
    echo ""
    echo "To add a domain to Cloudflare, you need:"
    echo "1. A Cloudflare API token with Zone:Edit permissions"
    echo "2. The domain must be registered and you must own it"
    echo ""
    echo "Steps to add the domain:"
    echo "1. Log in to Cloudflare Dashboard: https://dash.cloudflare.com"
    echo "2. Click 'Add a Site' button"
    echo "3. Enter: $DOMAIN"
    echo "4. Choose a plan (Free plan is sufficient)"
    echo "5. Cloudflare will scan for existing DNS records"
    echo "6. Update your domain's nameservers to Cloudflare's nameservers"
    echo "7. Wait for nameserver propagation (can take up to 24 hours)"
    echo ""
    echo "After adding the domain to Cloudflare:"
    echo "1. Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Set it as environment variable: export CLOUDFLARE_API_TOKEN='your_token'"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

echo "✅ API Token found"

# Try to add the domain to Cloudflare
echo ""
echo "🔄 Attempting to add $DOMAIN to Cloudflare..."

# First check if domain already exists
ZONE_CHECK=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json")

ZONE_COUNT=$(echo "$ZONE_CHECK" | jq -r '.result | length')

if [ "$ZONE_COUNT" -gt 0 ]; then
    echo "✅ Domain $DOMAIN already exists in Cloudflare"
    ZONE_ID=$(echo "$ZONE_CHECK" | jq -r '.result[0].id')
    echo "Zone ID: $ZONE_ID"
else
    echo "⚠️  Domain $DOMAIN not found in Cloudflare account"
    echo ""
    echo "The domain needs to be added to Cloudflare first:"
    echo "1. Go to: https://dash.cloudflare.com"
    echo "2. Click 'Add a Site'"
    echo "3. Enter: $DOMAIN"
    echo "4. Follow the setup wizard"
    echo "5. Update nameservers at your domain registrar"
    echo ""
    echo "After adding the domain, run this script again."
    exit 1
fi

echo ""
echo "🔄 Configuring DNS records for $DOMAIN..."

# Function to create or update A record
create_or_update_record() {
    local name="$1"
    local content="$2"
    local display_name="$3"
    
    echo "Setting up A record: $display_name -> $content"
    
    # Check if record exists
    EXISTING_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$name&type=A" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json")
    
    RECORD_COUNT=$(echo "$EXISTING_RECORD" | jq -r '.result | length')
    
    if [ "$RECORD_COUNT" -gt 0 ]; then
        # Update existing record
        RECORD_ID=$(echo "$EXISTING_RECORD" | jq -r '.result[0].id')
        echo "  Updating existing record..."
        
        RESULT=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":1}")
    else
        # Create new record
        echo "  Creating new record..."
        
        RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":1}")
    fi
    
    SUCCESS=$(echo "$RESULT" | jq -r '.success')
    if [ "$SUCCESS" = "true" ]; then
        echo "  ✅ Success: $display_name"
    else
        echo "  ❌ Failed: $display_name"
        echo "  Error: $(echo "$RESULT" | jq -r '.errors[0].message // "Unknown error"')"
        return 1
    fi
}

# Configure A records
create_or_update_record "$DOMAIN" "$VERCEL_IP" "$DOMAIN (apex domain)"
create_or_update_record "www.$DOMAIN" "$VERCEL_IP" "www.$DOMAIN"

echo ""
echo "🎉 DNS Configuration Complete!"
echo ""
echo "📋 Summary:"
echo "  Domain: $DOMAIN"
echo "  Zone ID: $ZONE_ID"
echo "  A Record: $DOMAIN -> $VERCEL_IP"
echo "  A Record: www.$DOMAIN -> $VERCEL_IP"
echo ""
echo "⏱️  DNS propagation typically takes 5-10 minutes"
echo "🌍 Your website will be accessible at:"
echo "  - https://$DOMAIN"
echo "  - https://www.$DOMAIN"
echo ""
echo "🔍 To verify DNS propagation:"
echo "  dig $DOMAIN"
echo "  dig www.$DOMAIN"
echo ""
echo "Or run: ./verify-domain.sh"