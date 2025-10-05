#!/bin/bash

# 🚀 Complete Domain Assignment for familyreliefproject.org
# Automated setup with manual verification steps

set -e

echo "🌐 HFRP Relief - Complete Domain Assignment"
echo "==========================================="
echo "Domain: familyreliefproject.org"
echo "Target: Vercel deployment"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_action() {
    echo -e "${YELLOW}[ACTION NEEDED]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Step 1: Check current project status
print_step "1. Checking current project status..."

if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep '"projectId"' | cut -d'"' -f4)
    print_success "Vercel project found: $PROJECT_ID"
else
    print_action "No Vercel project found. Please run 'vercel link' first."
    exit 1
fi

# Step 2: Get project URL from Vercel
print_step "2. Getting current Vercel deployment URL..."

VERCEL_URL=$(vercel ls --scope danielweickdag 2>/dev/null | grep "hfrp-relief" | grep "Ready" | head -1 | awk '{print $2}' || echo "")

if [ -z "$VERCEL_URL" ]; then
    print_action "No ready deployment found. Using GitHub integration instead."
    VERCEL_URL="https://hfrp-relief-git-main-danielweickdags-projects.vercel.app"
else
    print_success "Found deployment: $VERCEL_URL"
fi

# Step 3: Create domain configuration
print_step "3. Creating domain configuration files..."

# Create DNS configuration file
cat > dns-configuration.txt << EOF
🌐 DNS CONFIGURATION FOR familyreliefproject.org
=====================================================

Configure these DNS records with your domain registrar:

📍 A RECORD:
   Name: @
   Value: 76.76.19.61
   TTL: Auto (or 3600)

📍 CNAME RECORD:
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto (or 3600)

📍 ALTERNATIVE (if A record doesn't work):
   Type: CNAME
   Name: @
   Value: hfrp-relief-git-main-danielweickdags-projects.vercel.app
   TTL: Auto (or 3600)

EOF

print_success "DNS configuration saved to dns-configuration.txt"

# Step 4: Create Vercel dashboard instructions
cat > vercel-dashboard-setup.md << EOF
# 🎯 Vercel Dashboard Domain Setup

## Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Login with your account: danielweickdag
3. Find project: **hfrp-relief**
4. Click on the project name

## Step 2: Add Custom Domain
1. Click **Settings** tab
2. Click **Domains** in the sidebar
3. Click **Add** button
4. Enter: \`familyreliefproject.org\`
5. Click **Add**
6. Enter: \`www.familyreliefproject.org\`
7. Click **Add**

## Step 3: Verify Domain Configuration
Vercel will show you the DNS records needed. They should match:
- A Record: @ → 76.76.19.61
- CNAME Record: www → cname.vercel-dns.com

## Step 4: Update Environment Variables
In the same Settings area:
1. Click **Environment Variables**
2. Add or update:
   - \`NEXT_PUBLIC_SITE_URL\` = \`https://www.familyreliefproject.org\`
   - \`NODE_ENV\` = \`production\`
   - \`NEXT_PUBLIC_DONATION_TEST_MODE\` = \`false\`

## Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Select **Use existing Build Cache**
4. Click **Redeploy**

EOF

print_success "Vercel dashboard instructions saved to vercel-dashboard-setup.md"

# Step 5: Create domain verification script
cat > verify-domain.sh << 'EOF'
#!/bin/bash

echo "🔍 Domain Verification for familyreliefproject.org"
echo "================================================"

# Check DNS propagation
echo "📡 Checking DNS records..."
echo ""
echo "A Record (familyreliefproject.org):"
nslookup familyreliefproject.org 8.8.8.8 2>/dev/null | grep "Address:" | tail -1 || echo "❌ A record not found"

echo ""
echo "CNAME Record (www.familyreliefproject.org):"
nslookup www.familyreliefproject.org 8.8.8.8 2>/dev/null | grep "canonical name" || echo "❌ CNAME record not found"

# Check website accessibility
echo ""
echo "🌐 Checking website accessibility..."
echo ""
echo "Main domain (familyreliefproject.org):"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://familyreliefproject.org 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Status: $HTTP_STATUS (Success)"
else
    echo "❌ Status: $HTTP_STATUS (Not ready)"
fi

echo ""
echo "WWW domain (www.familyreliefproject.org):"
HTTP_STATUS_WWW=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://www.familyreliefproject.org 2>/dev/null || echo "000")
if [ "$HTTP_STATUS_WWW" = "200" ]; then
    echo "✅ Status: $HTTP_STATUS_WWW (Success)"
else
    echo "❌ Status: $HTTP_STATUS_WWW (Not ready)"
fi

# Check SSL certificate
echo ""
echo "🔒 Checking SSL certificate..."
SSL_CHECK=$(echo | timeout 10 openssl s_client -servername www.familyreliefproject.org -connect www.familyreliefproject.org:443 2>/dev/null | openssl x509 -noout -subject 2>/dev/null || echo "")
if [ -n "$SSL_CHECK" ]; then
    echo "✅ SSL certificate is active"
    echo "   $SSL_CHECK"
else
    echo "❌ SSL certificate not ready"
fi

echo ""
echo "📊 Summary:"
if [ "$HTTP_STATUS" = "200" ] && [ "$HTTP_STATUS_WWW" = "200" ]; then
    echo "🎉 Domain is fully configured and working!"
    echo "   Visit: https://www.familyreliefproject.org"
else
    echo "⏳ Domain setup in progress. DNS propagation can take up to 24 hours."
    echo "   Check again in 15-30 minutes."
fi
EOF

chmod +x verify-domain.sh
print_success "Domain verification script created: ./verify-domain.sh"

# Step 6: Display next actions
echo ""
echo "================================================"
echo -e "${GREEN}🎯 DOMAIN ASSIGNMENT SETUP COMPLETE${NC}"
echo "================================================"
echo ""
print_action "NEXT ACTIONS REQUIRED:"
echo ""
echo "1. 📋 Configure DNS records (see dns-configuration.txt)"
echo "2. 🌐 Add domain in Vercel Dashboard (see vercel-dashboard-setup.md)"
echo "3. ⏳ Wait for DNS propagation (15 minutes - 24 hours)"
echo "4. ✅ Verify setup with: ./verify-domain.sh"
echo ""
print_info "Files created:"
echo "   • dns-configuration.txt (DNS records to add)"
echo "   • vercel-dashboard-setup.md (Step-by-step Vercel setup)"
echo "   • verify-domain.sh (Domain verification tool)"
echo ""
print_info "Quick links:"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • Your project: https://vercel.com/danielweickdags-projects/hfrp-relief"
echo "   • Current deployment: $VERCEL_URL"
echo ""
echo -e "${YELLOW}🚀 Ready to configure familyreliefproject.org!${NC}"
echo ""

# Open relevant files for user
if command -v open &> /dev/null; then
    print_info "Opening configuration files..."
    open dns-configuration.txt
    open vercel-dashboard-setup.md
    open https://vercel.com/dashboard
fi

echo "Domain assignment automation completed! 🎉"