#!/bin/bash

# HFRP Relief - Complete System Test
# Tests all Stripe integration components and API endpoints

echo "🚀 Starting HFRP Relief Complete System Test"
echo "=============================================="

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"

echo -e "${BLUE}📊 System Information:${NC}"
echo "Base URL: $BASE_URL"
echo "Test Mode: Enabled"
echo "Date: $(date)"
echo ""

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" -X "$method" "$url" -o /dev/null)
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL (Got $response, expected $expected_status)${NC}"
        return 1
    fi
}

# Function to test page load
test_page() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" "$url" -o /dev/null)
    
    if [ "$response" == "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL (HTTP $response)${NC}"
        return 1
    fi
}

# Test counters
total_tests=0
passed_tests=0

echo -e "${YELLOW}🌐 Testing Core Pages:${NC}"
echo "----------------------"

# Test main pages
pages=(
    "$BASE_URL|Homepage"
    "$BASE_URL/stripe-admin|Stripe Admin Dashboard"
    "$BASE_URL/dashboard|Analytics Dashboard"
    "$BASE_URL/status|System Status"
    "$BASE_URL/stripe-migration|Migration Status"
    "$BASE_URL/donate|Donation Page"
    "$BASE_URL/admin|Legacy Admin"
)

for page_info in "${pages[@]}"; do
    IFS='|' read -r url description <<< "$page_info"
    test_page "$url" "$description"
    total_tests=$((total_tests + 1))
    if [ $? -eq 0 ]; then
        passed_tests=$((passed_tests + 1))
    fi
done

echo ""
echo -e "${YELLOW}🔌 Testing API Endpoints:${NC}"
echo "--------------------------"

# Test API endpoints
test_endpoint "GET" "$API_BASE/stripe/campaigns" "200" "Campaigns API - GET"
total_tests=$((total_tests + 1))
[ $? -eq 0 ] && passed_tests=$((passed_tests + 1))

test_endpoint "GET" "$API_BASE/stripe/analytics" "200" "Analytics API - GET"
total_tests=$((total_tests + 1))
[ $? -eq 0 ] && passed_tests=$((passed_tests + 1))

test_endpoint "GET" "$API_BASE/stripe/checkout" "405" "Checkout API - Method Check"
total_tests=$((total_tests + 1))
[ $? -eq 0 ] && passed_tests=$((passed_tests + 1))

test_endpoint "GET" "$API_BASE/stripe/webhook" "405" "Webhook API - Method Check"
total_tests=$((total_tests + 1))
[ $? -eq 0 ] && passed_tests=$((passed_tests + 1))

echo ""
echo -e "${YELLOW}💳 Testing Stripe Integration:${NC}"
echo "------------------------------"

# Test Stripe components (these would need actual browser testing)
echo -n "Checking Stripe publishable key configuration... "
if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ CONFIGURED${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${YELLOW}⚠️  NOT SET (Expected for development)${NC}"
fi
total_tests=$((total_tests + 1))

echo -n "Checking Stripe components exist... "
stripe_components=(
    "src/app/_components/StripeButton.tsx"
    "src/app/_components/StripeDashboard.tsx"
    "src/lib/stripeEnhanced.ts"
)

all_exist=true
for component in "${stripe_components[@]}"; do
    if [ ! -f "$component" ]; then
        all_exist=false
        break
    fi
done

if [ "$all_exist" = true ]; then
    echo -e "${GREEN}✅ ALL PRESENT${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}❌ MISSING COMPONENTS${NC}"
fi
total_tests=$((total_tests + 1))

echo ""
echo -e "${YELLOW}🔄 Testing Migration Status:${NC}"
echo "----------------------------"

echo -n "Checking migration completion... "
if [ -f "STRIPE_MIGRATION_COMPLETE.md" ]; then
    echo -e "${GREEN}✅ MIGRATION COMPLETE${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${YELLOW}⚠️  MIGRATION MARKER NOT FOUND${NC}"
fi
total_tests=$((total_tests + 1))

echo ""
echo -e "${YELLOW}📱 Testing Mobile Compatibility:${NC}"
echo "--------------------------------"

echo -n "Checking responsive design classes... "
responsive_patterns=("sm:" "md:" "lg:" "xl:")
responsive_found=false

for pattern in "${responsive_patterns[@]}"; do
    if grep -r "$pattern" src/app/_components/ >/dev/null 2>&1; then
        responsive_found=true
        break
    fi
done

if [ "$responsive_found" = true ]; then
    echo -e "${GREEN}✅ RESPONSIVE DESIGN DETECTED${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}❌ NO RESPONSIVE CLASSES FOUND${NC}"
fi
total_tests=$((total_tests + 1))

echo ""
echo -e "${YELLOW}🔒 Security & Performance Checks:${NC}"
echo "--------------------------------"

echo -n "Checking for environment variables... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ ENV FILE EXISTS${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${YELLOW}⚠️  NO .env.local FILE${NC}"
fi
total_tests=$((total_tests + 1))

echo -n "Checking TypeScript configuration... "
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✅ TYPESCRIPT CONFIGURED${NC}"
    passed_tests=$((passed_tests + 1))
else
    echo -e "${RED}❌ NO TYPESCRIPT CONFIG${NC}"
fi
total_tests=$((total_tests + 1))

# Final Results
echo ""
echo "=============================================="
echo -e "${BLUE}📊 TEST RESULTS SUMMARY:${NC}"
echo "=============================================="
echo "Total Tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $((total_tests - passed_tests))"

# Calculate percentage
if [ $total_tests -gt 0 ]; then
    percentage=$((passed_tests * 100 / total_tests))
    echo "Success Rate: $percentage%"
    
    if [ $percentage -ge 90 ]; then
        echo -e "${GREEN}🎉 EXCELLENT! System is working great!${NC}"
        exit_code=0
    elif [ $percentage -ge 75 ]; then
        echo -e "${YELLOW}✅ GOOD! Minor issues detected.${NC}"
        exit_code=0
    else
        echo -e "${RED}⚠️  WARNING! Multiple issues found.${NC}"
        exit_code=1
    fi
else
    echo -e "${RED}❌ ERROR! No tests could be run.${NC}"
    exit_code=1
fi

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Visit $BASE_URL to test donation flow"
echo "2. Access $BASE_URL/stripe-admin for campaign management"
echo "3. Monitor $BASE_URL/dashboard for real-time analytics"
echo "4. Check $BASE_URL/status for system status"

echo ""
echo -e "${GREEN}✨ HFRP Relief system testing complete!${NC}"

exit $exit_code
