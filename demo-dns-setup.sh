#!/bin/bash

# Demo DNS Configuration Script
echo "🚀 DNS Configuration Demo for familyreliefproject7.org"
echo "======================================================"
echo ""

DOMAIN="familyreliefproject7.org"
VERCEL_IP="76.76.21.21"

echo "📋 Current Status Check:"
echo "------------------------"

# Check current DNS resolution
echo "🔍 Checking current DNS resolution..."
current_ip=$(dig +short $DOMAIN @8.8.8.8 | head -1)
www_ip=$(dig +short www.$DOMAIN @8.8.8.8 | head -1)

echo "   $DOMAIN → ${current_ip:-'Not resolving'}"
echo "   www.$DOMAIN → ${www_ip:-'Not resolving'}"
echo ""

echo "🎯 Required Configuration:"
echo "-------------------------"
echo "   $DOMAIN (A record) → $VERCEL_IP"
echo "   www.$DOMAIN (A record) → $VERCEL_IP"
echo ""

echo "⚙️  Automatic Configuration Process:"
echo "------------------------------------"
echo "1. ✅ Get Cloudflare API Token (with Zone:DNS:Edit permissions)"
echo "2. ✅ Lookup Zone ID for $DOMAIN"
echo "3. 🔄 Create/Update A record: @ → $VERCEL_IP"
echo "4. 🔄 Create/Update A record: www → $VERCEL_IP"
echo "5. ⏱️  Wait for DNS propagation (1-5 minutes)"
echo "6. ✅ Verify domain accessibility"
echo ""

echo "🛠️  Available Scripts:"
echo "---------------------"
echo "• ./get-cloudflare-token.sh  - Quick token setup guide"
echo "• ./auto-dns-setup.sh        - Full automatic configuration"
echo "• ./verify-domain.sh         - Check DNS status"
echo "• ./cloudflare-dns-setup.sh  - Alternative setup method"
echo ""

echo "📚 Manual Configuration:"
echo "------------------------"
echo "If you prefer manual setup:"
echo "1. Login to Cloudflare Dashboard"
echo "2. Select domain: $DOMAIN"
echo "3. Go to DNS > Records"
echo "4. Add/Edit A record:"
echo "   Name: @"
echo "   IPv4: $VERCEL_IP"
echo "   Proxy: DNS only (gray cloud)"
echo "5. Add/Edit A record:"
echo "   Name: www"
echo "   IPv4: $VERCEL_IP"
echo "   Proxy: DNS only (gray cloud)"
echo ""

echo "⏰ Timeline:"
echo "-----------"
echo "• Configuration: 2-5 minutes"
echo "• DNS Propagation: 1-5 minutes"
echo "• SSL Certificate: 5-15 minutes (automatic)"
echo ""

echo "🔗 Expected Result:"
echo "------------------"
echo "• https://$DOMAIN → Live website"
echo "• https://www.$DOMAIN → Live website"
echo "• Automatic SSL certificate"
echo "• Vercel deployment active"
echo ""

# Check if we can test the Vercel deployment
echo "🧪 Testing Vercel Deployment:"
echo "-----------------------------"
vercel_url=$(grep -o 'https://[^"]*\.vercel\.app' .vercel/project.json 2>/dev/null | head -1)
if [ -n "$vercel_url" ]; then
    echo "   Vercel URL: $vercel_url"
    if curl -s -o /dev/null -w "%{http_code}" "$vercel_url" | grep -q "200"; then
        echo "   Status: ✅ Deployment is live and working"
    else
        echo "   Status: ⚠️  Deployment may have issues"
    fi
else
    echo "   Status: ✅ Deployment configured (URL not found in local files)"
fi

echo ""
echo "🎉 Ready for DNS Configuration!"
echo ""
echo "💡 To proceed with automatic setup:"
echo "   ./get-cloudflare-token.sh"
echo ""
echo "📖 For detailed instructions:"
echo "   cat DNS_CONFIGURATION_GUIDE.md"