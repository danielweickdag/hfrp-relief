#!/bin/bash

# Quick Cloudflare API Token Setup
echo "🔑 Quick Cloudflare API Token Setup"
echo "===================================="
echo ""

DOMAIN="familyreliefproject7.org"

echo "📋 To configure DNS automatically, you need a Cloudflare API Token"
echo ""
echo "🚀 Quick Setup (2 minutes):"
echo ""
echo "1. 🌐 Open Cloudflare Dashboard:"
echo "   https://dash.cloudflare.com/profile/api-tokens"
echo ""
echo "2. 🔧 Create Token:"
echo "   - Click 'Create Token'"
echo "   - Choose 'Custom token'"
echo ""
echo "3. ⚙️  Set Permissions:"
echo "   - Zone | Zone | Read"
echo "   - Zone | DNS | Edit"
echo ""
echo "4. 🎯 Set Zone Resources:"
echo "   - Include | Specific zone | $DOMAIN"
echo ""
echo "5. ✅ Create and Copy Token"
echo ""

# Check if user wants to open the URL
if command -v open >/dev/null 2>&1; then
    read -p "🌐 Open Cloudflare API tokens page in browser? (y/n): " open_browser
    if [[ $open_browser =~ ^[Yy]$ ]]; then
        open "https://dash.cloudflare.com/profile/api-tokens"
        echo "✅ Browser opened. Create your token and come back here."
        echo ""
    fi
fi

echo "📝 Once you have your token, you can:"
echo ""
echo "Option 1 - Run automatic setup:"
echo "  ./auto-dns-setup.sh"
echo ""
echo "Option 2 - Set environment variables manually:"
echo "  export CLOUDFLARE_API_TOKEN='your_token_here'"
echo "  ./auto-dns-setup.sh"
echo ""

# Offer to set the token immediately
read -p "🔑 Do you have your API token ready now? (y/n): " has_token

if [[ $has_token =~ ^[Yy]$ ]]; then
    read -p "📝 Paste your Cloudflare API Token: " api_token
    
    if [ -n "$api_token" ]; then
        echo ""
        echo "🔍 Testing API token..."
        
        # Test the token
        test_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
            -H "Authorization: Bearer $api_token" \
            -H "Content-Type: application/json")
        
        if echo "$test_response" | jq -e '.success' >/dev/null 2>&1; then
            zone_id=$(echo "$test_response" | jq -r '.result[0].id // empty')
            if [ -n "$zone_id" ] && [ "$zone_id" != "null" ]; then
                echo "✅ Token is valid! Found zone: $zone_id"
                echo ""
                echo "💾 Setting environment variables..."
                export CLOUDFLARE_API_TOKEN="$api_token"
                export CLOUDFLARE_ZONE_ID="$zone_id"
                
                echo "🚀 Running automatic DNS configuration..."
                echo ""
                ./auto-dns-setup.sh
            else
                echo "❌ Token is valid but domain $DOMAIN not found in your account"
                echo "   Make sure the domain is added to your Cloudflare account"
            fi
        else
            echo "❌ Token test failed"
            echo "Error: $(echo "$test_response" | jq -r '.errors[0].message // "Invalid token or API error"')"
            echo ""
            echo "💡 Please check your token and try again with:"
            echo "   ./auto-dns-setup.sh"
        fi
    else
        echo "❌ No token provided"
    fi
else
    echo ""
    echo "💡 When you're ready, run:"
    echo "   ./auto-dns-setup.sh"
fi

echo ""
echo "📚 Need help? Check the full guide:"
echo "   cat DNS_CONFIGURATION_GUIDE.md"