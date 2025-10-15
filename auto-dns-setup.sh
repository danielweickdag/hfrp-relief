#!/bin/bash

# Automatic DNS Configuration for familyreliefproject7.org
echo "🚀 Automatic DNS Configuration for familyreliefproject7.org"
echo "=========================================================="
echo ""

DOMAIN="familyreliefproject7.org"
VERCEL_IP="76.76.21.21"

# Function to get Cloudflare Zone ID automatically
get_zone_id() {
    local api_token=$1
    echo "🔍 Looking up Zone ID for $DOMAIN..."
    
    zone_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
        -H "Authorization: Bearer $api_token" \
        -H "Content-Type: application/json")
    
    if echo "$zone_response" | jq -e '.success' >/dev/null 2>&1; then
        zone_id=$(echo "$zone_response" | jq -r '.result[0].id // empty')
        if [ -n "$zone_id" ] && [ "$zone_id" != "null" ]; then
            echo "✅ Found Zone ID: $zone_id"
            echo "$zone_id"
            return 0
        else
            echo "❌ Domain $DOMAIN not found in your Cloudflare account"
            return 1
        fi
    else
        echo "❌ Failed to connect to Cloudflare API"
        echo "Error: $(echo "$zone_response" | jq -r '.errors[0].message // "Unknown error"')"
        return 1
    fi
}

# Function to configure DNS records
configure_dns() {
    local api_token=$1
    local zone_id=$2
    
    echo "🔧 Configuring DNS records..."
    echo ""
    
    # Get existing records
    existing_apex=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records?type=A&name=$DOMAIN" \
        -H "Authorization: Bearer $api_token" \
        -H "Content-Type: application/json")
    
    existing_www=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records?type=A&name=www.$DOMAIN" \
        -H "Authorization: Bearer $api_token" \
        -H "Content-Type: application/json")
    
    # Configure apex domain
    echo "📍 Configuring apex domain ($DOMAIN)..."
    apex_record_id=$(echo "$existing_apex" | jq -r '.result[0].id // empty' 2>/dev/null)
    
    if [ -n "$apex_record_id" ] && [ "$apex_record_id" != "null" ]; then
        echo "  Updating existing A record..."
        apex_result=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$apex_record_id" \
            -H "Authorization: Bearer $api_token" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    else
        echo "  Creating new A record..."
        apex_result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
            -H "Authorization: Bearer $api_token" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    fi
    
    if echo "$apex_result" | jq -e '.success' >/dev/null 2>&1; then
        echo "  ✅ Apex domain configured successfully"
    else
        echo "  ❌ Failed to configure apex domain"
        echo "  Error: $(echo "$apex_result" | jq -r '.errors[0].message // "Unknown error"')"
    fi
    
    # Configure www subdomain
    echo "📍 Configuring www subdomain (www.$DOMAIN)..."
    www_record_id=$(echo "$existing_www" | jq -r '.result[0].id // empty' 2>/dev/null)
    
    if [ -n "$www_record_id" ] && [ "$www_record_id" != "null" ]; then
        echo "  Updating existing A record..."
        www_result=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records/$www_record_id" \
            -H "Authorization: Bearer $api_token" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"A\",\"name\":\"www\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    else
        echo "  Creating new A record..."
        www_result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
            -H "Authorization: Bearer $api_token" \
            -H "Content-Type: application/json" \
            -d "{\"type\":\"A\",\"name\":\"www\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":false}")
    fi
    
    if echo "$www_result" | jq -e '.success' >/dev/null 2>&1; then
        echo "  ✅ WWW subdomain configured successfully"
    else
        echo "  ❌ Failed to configure www subdomain"
        echo "  Error: $(echo "$www_result" | jq -r '.errors[0].message // "Unknown error"')"
    fi
    
    echo ""
    echo "🎉 DNS configuration complete!"
    return 0
}

# Check if credentials are already set
if [ -n "$CLOUDFLARE_API_TOKEN" ] && [ -n "$CLOUDFLARE_ZONE_ID" ]; then
    echo "✅ Cloudflare credentials found in environment"
    echo "🚀 Proceeding with automatic configuration..."
    echo ""
    
    configure_dns "$CLOUDFLARE_API_TOKEN" "$CLOUDFLARE_ZONE_ID"
    
elif [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo "✅ Cloudflare API token found"
    echo "🔍 Looking up Zone ID automatically..."
    echo ""
    
    zone_id=$(get_zone_id "$CLOUDFLARE_API_TOKEN")
    if [ $? -eq 0 ]; then
        configure_dns "$CLOUDFLARE_API_TOKEN" "$zone_id"
    else
        exit 1
    fi
    
else
    echo "🔑 Cloudflare API credentials needed for automatic configuration"
    echo ""
    echo "📋 Step 1: Get your Cloudflare API Token"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use 'Custom token' template"
    echo "4. Set permissions:"
    echo "   - Zone:Zone:Read"
    echo "   - Zone:DNS:Edit"
    echo "5. Set Zone Resources:"
    echo "   - Include: Specific zone: $DOMAIN"
    echo "6. Click 'Continue to summary' then 'Create Token'"
    echo ""
    
    read -p "📝 Enter your Cloudflare API Token: " api_token
    
    if [ -z "$api_token" ]; then
        echo "❌ No API token provided. Exiting."
        exit 1
    fi
    
    echo ""
    echo "🔍 Looking up Zone ID for $DOMAIN..."
    zone_id=$(get_zone_id "$api_token")
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "💾 Saving credentials for future use..."
        echo "export CLOUDFLARE_API_TOKEN='$api_token'" >> ~/.bashrc
        echo "export CLOUDFLARE_ZONE_ID='$zone_id'" >> ~/.bashrc
        
        # Also set for current session
        export CLOUDFLARE_API_TOKEN="$api_token"
        export CLOUDFLARE_ZONE_ID="$zone_id"
        
        echo "✅ Credentials saved to ~/.bashrc"
        echo ""
        
        configure_dns "$api_token" "$zone_id"
    else
        exit 1
    fi
fi

echo ""
echo "⏱️  DNS changes may take 5-30 minutes to propagate"
echo "🔄 Check status with: ./verify-domain.sh"
echo ""
echo "🌐 Your site will be live at:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "🎯 Next: Wait for DNS propagation, then verify with Vercel"