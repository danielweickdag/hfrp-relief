#!/bin/bash

# DNS Configuration for familyreliefproject.org
echo "🌐 DNS Configuration for familyreliefproject.org"
echo "================================================"
echo ""

DOMAIN="familyreliefproject.org"
ZONE_ID="ea37d2b4562afd6d89157f88b37047de"
VERCEL_IP="76.76.21.21"

echo "✅ Domain Found in Cloudflare: $DOMAIN"
echo "✅ Zone ID: $ZONE_ID"
echo "🎯 Target IP: $VERCEL_IP"
echo ""

echo "📋 Required DNS Records:"
echo "------------------------"
echo "1. A record: @ (root) → $VERCEL_IP"
echo "2. A record: www → $VERCEL_IP"
echo ""

# Check current DNS status
echo "🔍 Current DNS Status:"
echo "---------------------"
echo "Checking $DOMAIN..."
current_ip=$(dig +short $DOMAIN @8.8.8.8 | head -1)
if [ -n "$current_ip" ]; then
    echo "   $DOMAIN → $current_ip"
    if [ "$current_ip" = "$VERCEL_IP" ]; then
        echo "   ✅ Root domain correctly configured"
    else
        echo "   ❌ Root domain needs update"
    fi
else
    echo "   ❌ Root domain not resolving"
fi

echo "Checking www.$DOMAIN..."
www_ip=$(dig +short www.$DOMAIN @8.8.8.8 | head -1)
if [ -n "$www_ip" ]; then
    echo "   www.$DOMAIN → $www_ip"
    if [ "$www_ip" = "$VERCEL_IP" ]; then
        echo "   ✅ WWW subdomain correctly configured"
    else
        echo "   ❌ WWW subdomain needs update"
    fi
else
    echo "   ❌ WWW subdomain not resolving"
fi

echo ""

# Check if API token is available
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo "🔑 API Token found - attempting automatic configuration..."
    echo ""
    
    # Configure root domain
    echo "🔧 Configuring root domain..."
    root_response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"@\",\"content\":\"$VERCEL_IP\",\"ttl\":1}")
    
    if echo "$root_response" | jq -e '.success' >/dev/null 2>&1; then
        echo "   ✅ Root domain A record created/updated"
    else
        echo "   ❌ Failed to configure root domain"
        echo "   Error: $(echo "$root_response" | jq -r '.errors[0].message // "Unknown error"')"
    fi
    
    # Configure www subdomain
    echo "🔧 Configuring www subdomain..."
    www_response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"www\",\"content\":\"$VERCEL_IP\",\"ttl\":1}")
    
    if echo "$www_response" | jq -e '.success' >/dev/null 2>&1; then
        echo "   ✅ WWW subdomain A record created/updated"
    else
        echo "   ❌ Failed to configure www subdomain"
        echo "   Error: $(echo "$www_response" | jq -r '.errors[0].message // "Unknown error"')"
    fi
    
    echo ""
    echo "⏱️  Waiting for DNS propagation (30 seconds)..."
    sleep 30
    
    # Verify configuration
    echo "🔍 Verifying configuration..."
    ./verify-domain.sh
    
else
    echo "🔑 No API token found - Manual configuration required"
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "-----------------------------"
    echo "1. Go to: https://dash.cloudflare.com"
    echo "2. Select domain: $DOMAIN"
    echo "3. Go to DNS > Records"
    echo "4. Add/Edit A record:"
    echo "   - Type: A"
    echo "   - Name: @"
    echo "   - IPv4: $VERCEL_IP"
    echo "   - Proxy: DNS only (gray cloud)"
    echo "5. Add/Edit A record:"
    echo "   - Type: A"
    echo "   - Name: www"
    echo "   - IPv4: $VERCEL_IP"
    echo "   - Proxy: DNS only (gray cloud)"
    echo ""
    echo "💡 For automatic setup, get an API token:"
    echo "   https://dash.cloudflare.com/profile/api-tokens"
    echo "   Then run: export CLOUDFLARE_API_TOKEN='your_token' && $0"
fi

echo ""
echo "🎯 Expected Results:"
echo "-------------------"
echo "• https://$DOMAIN → Live website"
echo "• https://www.$DOMAIN → Live website"
echo "• Automatic SSL certificate"
echo ""

echo "📚 For detailed instructions:"
echo "   cat DNS_CONFIGURATION_GUIDE.md"