#!/bin/bash

# Domain Verification Script for familyreliefproject7.org
echo "🔍 Verifying DNS Configuration for familyreliefproject7.org"
echo "=========================================================="
echo ""

VERCEL_IP="76.76.21.21"
DOMAIN="familyreliefproject7.org"
WWW_DOMAIN="www.familyreliefproject7.org"

# Function to check DNS resolution
check_dns() {
    local domain=$1
    local expected_ip=$2
    
    echo "Checking $domain..."
    
    # Try to resolve the domain
    if resolved_ip=$(dig +short $domain A 2>/dev/null) && [ -n "$resolved_ip" ]; then
        if [ "$resolved_ip" = "$expected_ip" ]; then
            echo "✅ $domain → $resolved_ip (CORRECT)"
            return 0
        else
            echo "❌ $domain → $resolved_ip (WRONG - should be $expected_ip)"
            return 1
        fi
    else
        echo "❌ $domain → No A record found"
        return 1
    fi
}

# Function to test HTTP connectivity
test_http() {
    local url=$1
    echo "Testing HTTP connectivity to $url..."
    
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" | grep -q "200\|301\|302"; then
        echo "✅ $url is accessible"
        return 0
    else
        echo "❌ $url is not accessible"
        return 1
    fi
}

echo "📡 DNS Resolution Check:"
echo "------------------------"
check_dns $DOMAIN $VERCEL_IP
apex_status=$?

check_dns $WWW_DOMAIN $VERCEL_IP
www_status=$?

echo ""
echo "🌐 HTTP Connectivity Check:"
echo "---------------------------"
test_http "https://$DOMAIN"
apex_http=$?

test_http "https://$WWW_DOMAIN"
www_http=$?

echo ""
echo "📊 Summary:"
echo "-----------"

if [ $apex_status -eq 0 ] && [ $www_status -eq 0 ]; then
    echo "✅ DNS Configuration: COMPLETE"
else
    echo "❌ DNS Configuration: INCOMPLETE"
    echo ""
    echo "Required DNS Records:"
    echo "  Type: A, Name: @, Value: $VERCEL_IP"
    echo "  Type: A, Name: www, Value: $VERCEL_IP"
fi

if [ $apex_http -eq 0 ] && [ $www_http -eq 0 ]; then
    echo "✅ Website Status: LIVE"
    echo ""
    echo "🎉 Your website is now live at:"
    echo "   https://$DOMAIN"
    echo "   https://$WWW_DOMAIN"
else
    echo "⏳ Website Status: PENDING"
    echo ""
    echo "💡 If DNS is configured correctly, wait 5-30 minutes for propagation"
fi

echo ""
echo "🔄 Run this script again to check updated status"

# Also check Vercel domain status
echo ""
echo "📋 Vercel Domain Status:"
echo "------------------------"
vercel domains inspect $DOMAIN 2>/dev/null | grep -A 5 "WARN\|configured properly" || echo "✅ Domain configured in Vercel"
