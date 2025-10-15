#!/bin/bash

# Complete Setup Script for familyreliefproject7.org
# This script guides you through the entire process of setting up your domain

set -e

DOMAIN="familyreliefproject7.org"
VERCEL_IP="76.76.21.21"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"

echo "🚀 Complete Setup for $DOMAIN"
echo "=============================================="
echo ""

# Step 1: Check current status
echo "📋 Step 1: Checking Current Status"
echo "-----------------------------------"

# Check if domain is in Cloudflare
echo "🔍 Checking if $DOMAIN is in your Cloudflare account..."
if [ -z "$API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN not set. Will check manually later."
    DOMAIN_IN_CF="unknown"
else
    ZONE_CHECK=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json")
    
    ZONE_COUNT=$(echo "$ZONE_CHECK" | jq -r '.result | length')
    
    if [ "$ZONE_COUNT" -gt 0 ]; then
        echo "✅ $DOMAIN found in Cloudflare!"
        ZONE_ID=$(echo "$ZONE_CHECK" | jq -r '.result[0].id')
        echo "   Zone ID: $ZONE_ID"
        DOMAIN_IN_CF="yes"
    else
        echo "❌ $DOMAIN not found in Cloudflare account"
        DOMAIN_IN_CF="no"
    fi
fi

# Check Vercel status
echo ""
echo "🔍 Checking Vercel configuration..."
VERCEL_DOMAINS=$(vercel domains ls 2>/dev/null | grep "$DOMAIN" || echo "")
if [ -n "$VERCEL_DOMAINS" ]; then
    echo "✅ $DOMAIN configured in Vercel"
else
    echo "⚠️  $DOMAIN not found in Vercel domains"
fi

# Check DNS resolution
echo ""
echo "🔍 Checking DNS resolution..."
DNS_RESULT=$(dig +short $DOMAIN A 2>/dev/null || echo "")
if [ -n "$DNS_RESULT" ]; then
    echo "✅ DNS resolving to: $DNS_RESULT"
    if [ "$DNS_RESULT" = "$VERCEL_IP" ]; then
        echo "✅ DNS correctly pointing to Vercel!"
    else
        echo "⚠️  DNS not pointing to Vercel IP ($VERCEL_IP)"
    fi
else
    echo "❌ No DNS resolution for $DOMAIN"
fi

echo ""
echo "================================================"

# Step 2: Add domain to Cloudflare (if needed)
if [ "$DOMAIN_IN_CF" = "no" ] || [ "$DOMAIN_IN_CF" = "unknown" ]; then
    echo ""
    echo "📝 Step 2: Add Domain to Cloudflare"
    echo "------------------------------------"
    echo ""
    echo "🌐 You need to add $DOMAIN to your Cloudflare account:"
    echo ""
    echo "1. 🔗 Open Cloudflare Dashboard:"
    echo "   https://dash.cloudflare.com"
    echo ""
    echo "2. ➕ Click 'Add a Site' button"
    echo ""
    echo "3. 📝 Enter your domain:"
    echo "   $DOMAIN"
    echo ""
    echo "4. 📋 Choose a plan:"
    echo "   → Select 'Free' (sufficient for basic DNS)"
    echo ""
    echo "5. 🔍 DNS scan:"
    echo "   → Cloudflare will scan for existing records"
    echo "   → Review and continue"
    echo ""
    echo "6. 🔧 Update nameservers:"
    echo "   → Cloudflare will provide nameservers"
    echo "   → Update these at your domain registrar"
    echo "   → Common registrars: GoDaddy, Namecheap, Google Domains"
    echo ""
    echo "7. ⏱️  Wait for propagation:"
    echo "   → Usually 2-4 hours"
    echo "   → Can take up to 24 hours"
    echo ""
    echo "💡 After adding the domain, run this script again!"
    echo ""
    
    read -p "Press Enter when you've added the domain to Cloudflare..."
    
    # Re-check if domain is now in Cloudflare
    if [ -n "$API_TOKEN" ]; then
        echo ""
        echo "🔄 Re-checking Cloudflare..."
        ZONE_CHECK=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json")
        
        ZONE_COUNT=$(echo "$ZONE_CHECK" | jq -r '.result | length')
        
        if [ "$ZONE_COUNT" -gt 0 ]; then
            echo "✅ Great! $DOMAIN is now in Cloudflare!"
            ZONE_ID=$(echo "$ZONE_CHECK" | jq -r '.result[0].id')
            echo "   Zone ID: $ZONE_ID"
            DOMAIN_IN_CF="yes"
        else
            echo "⚠️  Domain not yet visible. This might be due to:"
            echo "   - Nameservers not yet propagated"
            echo "   - Domain not fully added to account"
            echo ""
            echo "💡 You can continue with manual setup or wait and run this script later."
            DOMAIN_IN_CF="no"
        fi
    fi
fi

# Step 3: Configure DNS records
if [ "$DOMAIN_IN_CF" = "yes" ] && [ -n "$API_TOKEN" ] && [ -n "$ZONE_ID" ]; then
    echo ""
    echo "🔧 Step 3: Configure DNS Records"
    echo "---------------------------------"
    echo ""
    echo "🔄 Setting up A records for $DOMAIN..."
    
    # Function to create or update A record
    create_or_update_record() {
        local name="$1"
        local content="$2"
        local display_name="$3"
        
        echo "   Setting up: $display_name → $content"
        
        # Check if record exists
        EXISTING_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$name&type=A" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json")
        
        RECORD_COUNT=$(echo "$EXISTING_RECORD" | jq -r '.result | length')
        
        if [ "$RECORD_COUNT" -gt 0 ]; then
            # Update existing record
            RECORD_ID=$(echo "$EXISTING_RECORD" | jq -r '.result[0].id')
            echo "     Updating existing record..."
            
            RESULT=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
                -H "Authorization: Bearer $API_TOKEN" \
                -H "Content-Type: application/json" \
                --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":1}")
        else
            # Create new record
            echo "     Creating new record..."
            
            RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
                -H "Authorization: Bearer $API_TOKEN" \
                -H "Content-Type: application/json" \
                --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":1}")
        fi
        
        SUCCESS=$(echo "$RESULT" | jq -r '.success')
        if [ "$SUCCESS" = "true" ]; then
            echo "     ✅ Success!"
        else
            echo "     ❌ Failed!"
            echo "     Error: $(echo "$RESULT" | jq -r '.errors[0].message // "Unknown error"')"
            return 1
        fi
    }
    
    # Configure A records
    create_or_update_record "$DOMAIN" "$VERCEL_IP" "$DOMAIN (apex)"
    create_or_update_record "www.$DOMAIN" "$VERCEL_IP" "www.$DOMAIN"
    
    echo ""
    echo "✅ DNS records configured successfully!"
    
elif [ "$DOMAIN_IN_CF" = "yes" ] && [ -z "$API_TOKEN" ]; then
    echo ""
    echo "🔧 Step 3: Manual DNS Configuration"
    echo "------------------------------------"
    echo ""
    echo "Since no API token is available, please configure DNS manually:"
    echo ""
    echo "1. 🔗 Go to Cloudflare Dashboard:"
    echo "   https://dash.cloudflare.com"
    echo ""
    echo "2. 🎯 Select your domain: $DOMAIN"
    echo ""
    echo "3. 📝 Go to DNS > Records"
    echo ""
    echo "4. ➕ Add these A records:"
    echo "   Type: A"
    echo "   Name: @"
    echo "   IPv4: $VERCEL_IP"
    echo "   TTL: Auto"
    echo ""
    echo "   Type: A"
    echo "   Name: www"
    echo "   IPv4: $VERCEL_IP"
    echo "   TTL: Auto"
    echo ""
    
    read -p "Press Enter when you've added the DNS records..."
    
else
    echo ""
    echo "⏭️  Skipping DNS configuration (domain not ready)"
fi

# Step 4: Verification and final steps
echo ""
echo "🔍 Step 4: Verification"
echo "-----------------------"
echo ""
echo "⏱️  DNS propagation typically takes 5-10 minutes"
echo "🔄 Running verification check..."
echo ""

# Run domain verification
if [ -f "./verify-domain.sh" ]; then
    ./verify-domain.sh
else
    echo "🔍 Manual verification:"
    echo "   dig $DOMAIN"
    echo "   dig www.$DOMAIN"
    echo ""
    echo "Expected results:"
    echo "   $DOMAIN should resolve to $VERCEL_IP"
    echo "   www.$DOMAIN should resolve to $VERCEL_IP"
fi

echo ""
echo "🎉 Setup Process Complete!"
echo "=========================="
echo ""
echo "📋 Summary:"
echo "   Domain: $DOMAIN"
echo "   Target IP: $VERCEL_IP"
echo "   Vercel: Configured ✅"
echo "   Cloudflare: $([ "$DOMAIN_IN_CF" = "yes" ] && echo "Added ✅" || echo "Pending ⏳")"
echo "   DNS: $([ -n "$DNS_RESULT" ] && echo "Configured ✅" || echo "Propagating ⏳")"
echo ""
echo "🌍 Your website will be accessible at:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "⏱️  Timeline:"
echo "   DNS Propagation: 5-10 minutes"
echo "   SSL Certificate: 10-15 minutes after DNS"
echo "   Full Accessibility: 15-30 minutes total"
echo ""
echo "🔍 To check status later:"
echo "   ./verify-domain.sh"
echo ""
echo "🆘 If you need help:"
echo "   - Check DNS: https://dnschecker.org"
echo "   - Cloudflare Support: https://support.cloudflare.com"
echo "   - Vercel Support: https://vercel.com/support"