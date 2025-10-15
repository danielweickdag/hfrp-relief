#!/bin/bash

# Automated DNS Setup for familyreliefproject7.org
# This script provides the exact DNS configuration needed

echo "🌐 Automated DNS Setup for familyreliefproject7.org"
echo "=================================================="
echo ""

# Vercel's IP address for A records
VERCEL_IP="76.76.21.21"

echo "📋 DNS Configuration Required:"
echo ""
echo "Domain: familyreliefproject7.org"
echo "Current Nameservers: Cloudflare (aron.ns.cloudflare.com, george.ns.cloudflare.com)"
echo ""
echo "Required A Records:"
echo "  @ (root)    A    $VERCEL_IP"
echo "  www         A    $VERCEL_IP"
echo ""

# Check if domain is already configured
echo "🔍 Checking current DNS status..."
echo ""

# Test apex domain
echo "Testing familyreliefproject7.org..."
if nslookup familyreliefproject7.org > /dev/null 2>&1; then
    echo "✅ familyreliefproject7.org resolves"
    CURRENT_IP=$(nslookup familyreliefproject7.org | grep "Address:" | tail -1 | awk '{print $2}')
    if [ "$CURRENT_IP" = "$VERCEL_IP" ]; then
        echo "✅ Points to correct Vercel IP: $VERCEL_IP"
    else
        echo "❌ Points to wrong IP: $CURRENT_IP (should be $VERCEL_IP)"
    fi
else
    echo "❌ familyreliefproject7.org does not resolve"
fi

# Test www subdomain
echo "Testing www.familyreliefproject7.org..."
if nslookup www.familyreliefproject7.org > /dev/null 2>&1; then
    echo "✅ www.familyreliefproject7.org resolves"
    CURRENT_WWW_IP=$(nslookup www.familyreliefproject7.org | grep "Address:" | tail -1 | awk '{print $2}')
    if [ "$CURRENT_WWW_IP" = "$VERCEL_IP" ]; then
        echo "✅ Points to correct Vercel IP: $VERCEL_IP"
    else
        echo "❌ Points to wrong IP: $CURRENT_WWW_IP (should be $VERCEL_IP)"
    fi
else
    echo "❌ www.familyreliefproject7.org does not resolve"
fi

echo ""
echo "🔧 To configure DNS automatically, you need to:"
echo ""
echo "1. Log into your Cloudflare dashboard"
echo "2. Select the familyreliefproject7.org domain"
echo "3. Go to DNS > Records"
echo "4. Add these A records:"
echo ""
echo "   Type: A"
echo "   Name: @"
echo "   IPv4 address: $VERCEL_IP"
echo "   TTL: Auto"
echo ""
echo "   Type: A" 
echo "   Name: www"
echo "   IPv4 address: $VERCEL_IP"
echo "   TTL: Auto"
echo ""

# Check if we can use Cloudflare API
if [ -n "$CLOUDFLARE_API_TOKEN" ] && [ -n "$CLOUDFLARE_ZONE_ID" ]; then
    echo "🚀 Cloudflare API credentials detected. Attempting automatic configuration..."
    
    # Create apex A record
    echo "Creating A record for @ (root domain)..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
         -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data "{\"type\":\"A\",\"name\":\"@\",\"content\":\"$VERCEL_IP\",\"ttl\":1}"
    
    echo ""
    echo "Creating A record for www subdomain..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
         -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data "{\"type\":\"A\",\"name\":\"www\",\"content\":\"$VERCEL_IP\",\"ttl\":1}"
    
    echo ""
    echo "✅ DNS records created automatically!"
else
    echo "💡 For automatic configuration, set these environment variables:"
    echo "   export CLOUDFLARE_API_TOKEN='your_api_token'"
    echo "   export CLOUDFLARE_ZONE_ID='your_zone_id'"
    echo ""
    echo "   Then run this script again."
fi

echo ""
echo "⏱️  DNS propagation typically takes 5-30 minutes"
echo "🔄 You can check status with: ./verify-domain.sh"
echo ""
echo "🌐 Once configured, your site will be live at:"
echo "   https://familyreliefproject7.org"
echo "   https://www.familyreliefproject7.org"