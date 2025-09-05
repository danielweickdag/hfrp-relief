#!/bin/bash

# Console Error Monitor Script
# Monitors the development server for errors and provides real-time feedback

echo "🔍 HFRP Relief - Console Error Monitor"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_BASE_URL="http://localhost:3000"

# Test endpoints
ENDPOINTS=(
    "/"
    "/donate"
    "/membership"
    "/stripe-admin"
    "/dashboard"
    "/campaign-sync"
    "/automation-status"
    "/api/stripe/analytics"
    "/api/stripe/sync"
    "/api/stripe/campaigns"
    "/api/stripe/checkout"
    "/api/stripe/webhook"
)

check_endpoint() {
    local endpoint=$1
    local url="$API_BASE_URL$endpoint"
    
    echo -n "Testing $endpoint ... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" -eq 200 ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        return 0
    elif [ "$status_code" -eq 404 ]; then
        echo -e "${YELLOW}⚠️  Not Found (404)${NC}"
        return 1
    elif [ "$status_code" -eq 405 ]; then
        echo -e "${YELLOW}⚠️  Method Not Allowed (405)${NC}"
        return 1
    elif [ "$status_code" -eq 500 ]; then
        echo -e "${RED}❌ Server Error (500)${NC}"
        return 2
    else
        echo -e "${RED}❌ Error ($status_code)${NC}"
        return 2
    fi
}

check_server() {
    echo -e "${BLUE}🔍 Checking server status...${NC}"
    
    if ! curl -s "$API_BASE_URL" > /dev/null 2>&1; then
        echo -e "${RED}❌ Server is not running${NC}"
        echo "Please start the server with: bun run dev"
        return 1
    fi
    
    echo -e "${GREEN}✅ Server is running${NC}"
    return 0
}

run_health_check() {
    echo ""
    echo -e "${BLUE}🏥 Running health check on all endpoints...${NC}"
    echo ""
    
    local total=0
    local success=0
    local warnings=0
    local errors=0
    
    for endpoint in "${ENDPOINTS[@]}"; do
        check_endpoint "$endpoint"
        case $? in
            0) ((success++)) ;;
            1) ((warnings++)) ;;
            2) ((errors++)) ;;
        esac
        ((total++))
    done
    
    echo ""
    echo "📊 Summary:"
    echo -e "  Total endpoints: $total"
    echo -e "  ${GREEN}Success: $success${NC}"
    echo -e "  ${YELLOW}Warnings: $warnings${NC}"
    echo -e "  ${RED}Errors: $errors${NC}"
    
    local health_percentage=$((success * 100 / total))
    
    if [ $health_percentage -ge 90 ]; then
        echo -e "  ${GREEN}🎯 Health: $health_percentage% - Excellent${NC}"
    elif [ $health_percentage -ge 75 ]; then
        echo -e "  ${YELLOW}🎯 Health: $health_percentage% - Good${NC}"
    else
        echo -e "  ${RED}🎯 Health: $health_percentage% - Needs Attention${NC}"
    fi
}

monitor_mode() {
    echo -e "${BLUE}🔄 Starting continuous monitoring (press Ctrl+C to stop)...${NC}"
    echo ""
    
    while true; do
        clear
        echo "🔍 HFRP Relief - Console Error Monitor (Live)"
        echo "=============================================="
        echo "$(date)"
        
        run_health_check
        
        echo ""
        echo "Next check in 30 seconds..."
        sleep 30
    done
}

show_menu() {
    echo ""
    echo "Available commands:"
    echo "  check     - Run one-time health check"
    echo "  monitor   - Start continuous monitoring"
    echo "  help      - Show this menu"
    echo ""
}

main() {
    if ! check_server; then
        exit 1
    fi
    
    case "$1" in
        "check")
            run_health_check
            ;;
        "monitor")
            monitor_mode
            ;;
        "help"|"")
            show_menu
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            show_menu
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
