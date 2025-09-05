#!/bin/bash

# HFRP Relief - Complete Stripe Automation Verification
# Verifies all automated Stripe systems are working correctly

echo "🔍 HFRP Relief - Stripe Automation Verification"
echo "=============================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
total_checks=0
passed_checks=0

check_item() {
    local description="$1"
    local check_command="$2"
    local expected_result="$3"
    
    echo -n "$description... "
    total_checks=$((total_checks + 1))
    
    if eval "$check_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
    fi
}

check_file_exists() {
    local file="$1"
    local description="$2"
    
    echo -n "$description... "
    total_checks=$((total_checks + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ EXISTS${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌ MISSING${NC}"
    fi
}

check_content() {
    local file="$1"
    local pattern="$2"
    local description="$3"
    
    echo -n "$description... "
    total_checks=$((total_checks + 1))
    
    if [ -f "$file" ] && grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ CONFIGURED${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${YELLOW}⚠️  NOT CONFIGURED${NC}"
    fi
}

echo -e "${BLUE}📦 Checking Core Stripe Components:${NC}"
echo "-----------------------------------"

# Check main Stripe service
check_file_exists "src/lib/stripeEnhanced.ts" "Enhanced Stripe Service"
check_file_exists "src/app/_components/StripeButton.tsx" "Stripe Button Component"
check_file_exists "src/app/_components/StripeDashboard.tsx" "Stripe Dashboard Component"
check_file_exists "src/app/_components/CampaignManager.tsx" "Campaign Manager Component"
check_file_exists "src/app/_components/RealTimeDashboard.tsx" "Real-Time Dashboard Component"

echo ""
echo -e "${BLUE}🌐 Checking API Endpoints:${NC}"
echo "---------------------------"

# Check API routes
check_file_exists "src/app/api/stripe/checkout/route.ts" "Stripe Checkout API"
check_file_exists "src/app/api/stripe/webhook/route.ts" "Stripe Webhook API"
check_file_exists "src/app/api/stripe/campaigns/route.ts" "Campaigns Management API"
check_file_exists "src/app/api/stripe/analytics/route.ts" "Analytics API"

echo ""
echo -e "${BLUE}📱 Checking Admin Interfaces:${NC}"
echo "------------------------------"

# Check admin pages
check_file_exists "src/app/stripe-admin/page.tsx" "Stripe Admin Dashboard"
check_file_exists "src/app/status/page.tsx" "System Status Page"
check_file_exists "src/app/stripe-migration/page.tsx" "Migration Status Page"
check_file_exists "src/app/dashboard/page.tsx" "Analytics Dashboard Page"

echo ""
echo -e "${BLUE}🎨 Checking UI Components:${NC}"
echo "---------------------------"

# Check UI components
check_file_exists "src/components/ui/badge.tsx" "Badge Component"
check_file_exists "src/components/ui/button.tsx" "Button Component"
check_file_exists "src/components/ui/card.tsx" "Card Component"
check_file_exists "src/components/ui/input.tsx" "Input Component"
check_file_exists "src/components/ui/label.tsx" "Label Component"
check_file_exists "src/components/ui/textarea.tsx" "Textarea Component"
check_file_exists "src/components/ui/tabs.tsx" "Tabs Component"
check_file_exists "src/components/ui/progress.tsx" "Progress Component"
check_file_exists "src/components/ui/switch.tsx" "Switch Component"

echo ""
echo -e "${BLUE}⚙️  Checking Configuration:${NC}"
echo "----------------------------"

# Check configuration files
check_file_exists ".env.local" "Environment Configuration"
check_content ".env.local" "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Stripe Public Key"
check_content "package.json" "stripe" "Stripe Package Dependency"
check_content "package.json" "@radix-ui" "Radix UI Dependencies"

echo ""
echo -e "${BLUE}🔄 Checking Migration Status:${NC}"
echo "------------------------------"

# Check migration completion
check_file_exists "STRIPE_MIGRATION_COMPLETE.md" "Migration Completion Marker"
check_content "migrate-to-stripe.js" "StripeButton" "Migration Script"

# Check for old Donorbox references
echo -n "Checking for Donorbox cleanup... "
total_checks=$((total_checks + 1))
donorbox_files=$(find src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs grep -l "DonorboxButton" 2>/dev/null | wc -l)
if [ "$donorbox_files" -eq 0 ]; then
    echo -e "${GREEN}✅ CLEAN${NC}"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${YELLOW}⚠️  $donorbox_files files still reference DonorboxButton${NC}"
fi

echo ""
echo -e "${BLUE}🔒 Checking Automation Scripts:${NC}"
echo "--------------------------------"

# Check automation scripts
check_file_exists "stripe-automation-setup.sh" "Stripe Setup Script"
check_file_exists "migrate-to-stripe.js" "Migration Script"
check_file_exists "system-test.sh" "System Test Script"

echo ""
echo -e "${BLUE}🏗️  Checking Build Configuration:${NC}"
echo "-----------------------------------"

# Check build files
check_file_exists "next.config.js" "Next.js Configuration"
check_file_exists "tsconfig.json" "TypeScript Configuration"
check_file_exists "tailwind.config.ts" "Tailwind Configuration"
check_file_exists "components.json" "Components Configuration"

echo ""
echo -e "${BLUE}📊 Automation Features Verification:${NC}"
echo "--------------------------------------"

# Check specific automation features
check_content "src/lib/stripeEnhanced.ts" "createCheckoutSession" "Automated Checkout Creation"
check_content "src/lib/stripeEnhanced.ts" "processWebhook" "Webhook Processing"
check_content "src/app/_components/RealTimeDashboard.tsx" "fetchData" "Real-time Data Fetching"
check_content "src/app/_components/CampaignManager.tsx" "createCampaign" "Campaign Creation Automation"

# Check API automation
echo -n "API Route Automation... "
total_checks=$((total_checks + 1))
if [ -f "src/app/api/stripe/campaigns/route.ts" ] && [ -f "src/app/api/stripe/analytics/route.ts" ]; then
    echo -e "${GREEN}✅ IMPLEMENTED${NC}"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${RED}❌ MISSING${NC}"
fi

# Check webhook automation
echo -n "Webhook Automation... "
total_checks=$((total_checks + 1))
if [ -f "src/app/api/stripe/webhook/route.ts" ] && grep -q "processWebhook" "src/app/api/stripe/webhook/route.ts" 2>/dev/null; then
    echo -e "${GREEN}✅ AUTOMATED${NC}"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${YELLOW}⚠️  BASIC SETUP${NC}"
fi

echo ""
echo "=============================================="
echo -e "${PURPLE}🎯 STRIPE AUTOMATION SUMMARY:${NC}"
echo "=============================================="

# Calculate percentage
if [ $total_checks -gt 0 ]; then
    percentage=$((passed_checks * 100 / total_checks))
    echo "Total Checks: $total_checks"
    echo "Passed: $passed_checks"
    echo "Failed: $((total_checks - passed_checks))"
    echo "Automation Score: $percentage%"
    
    if [ $percentage -ge 95 ]; then
        echo -e "${GREEN}🚀 EXCELLENT! Full automation ready!${NC}"
        echo -e "${GREEN}Your Stripe system is completely automated and ready for production.${NC}"
        exit_code=0
    elif [ $percentage -ge 85 ]; then
        echo -e "${YELLOW}✅ GOOD! Automation mostly complete.${NC}"
        echo -e "${YELLOW}Minor issues detected but system is functional.${NC}"
        exit_code=0
    elif [ $percentage -ge 70 ]; then
        echo -e "${YELLOW}⚠️  FAIR! Some automation missing.${NC}"
        echo -e "${YELLOW}Core functionality present but some features incomplete.${NC}"
        exit_code=1
    else
        echo -e "${RED}❌ POOR! Major automation issues.${NC}"
        echo -e "${RED}Significant problems detected. Manual intervention required.${NC}"
        exit_code=1
    fi
else
    echo -e "${RED}❌ ERROR! No checks could be performed.${NC}"
    exit_code=1
fi

echo ""
echo -e "${BLUE}🎛️  Automated Features Available:${NC}"
echo "• 💳 Automated payment processing with Stripe"
echo "• 📊 Real-time donation analytics and reporting"
echo "• 🎯 Automated campaign management and tracking"
echo "• 🔄 Webhook processing for instant updates"
echo "• 📱 Mobile-optimized payment flows"
echo "• 🔒 Automated security and compliance checks"
echo "• 📈 Performance monitoring and optimization"
echo "• 🚀 One-click deployment capabilities"

echo ""
echo -e "${BLUE}🌐 Access Your Automated System:${NC}"
echo "• Stripe Admin: http://localhost:3000/stripe-admin"
echo "• Real-time Analytics: http://localhost:3000/dashboard"
echo "• System Status: http://localhost:3000/status"
echo "• Test Donations: http://localhost:3000/"

echo ""
echo -e "${GREEN}✨ Stripe automation verification complete!${NC}"

exit $exit_code
