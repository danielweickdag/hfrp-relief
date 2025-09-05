#!/bin/bash

# Stripe Campaign and Plan Sync Automation Script
# This script automates the synchronization of campaigns and plans with Stripe

echo "🚀 HFRP Relief - Stripe Campaign & Plan Sync Automation"
echo "======================================================="

# Configuration
API_BASE_URL="http://localhost:3001"
SYNC_ENDPOINT="$API_BASE_URL/api/stripe/sync"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if server is running
check_server() {
    print_status "Checking if development server is running..."
    
    if curl -s "$API_BASE_URL" > /dev/null 2>&1; then
        print_success "Development server is running"
        return 0
    else
        print_error "Development server is not running"
        print_status "Please start the server with: bun run dev"
        return 1
    fi
}

# Get current sync status
get_sync_status() {
    print_status "Getting current sync status..."
    
    response=$(curl -s "$SYNC_ENDPOINT?action=status")
    
    if [ $? -eq 0 ]; then
        echo "$response" | jq -r '.data | "Campaigns: \(.totalCampaigns), Plans: \(.totalPlans), Stripe Products: \(.stripeProducts), Stripe Prices: \(.stripePrices)"' 2>/dev/null || echo "$response"
    else
        print_error "Failed to get sync status"
    fi
}

# Get all plans
get_plans() {
    print_status "Getting all subscription plans..."
    
    response=$(curl -s "$SYNC_ENDPOINT?action=plans")
    
    if [ $? -eq 0 ]; then
        echo "$response" | jq -r '.data[] | "\(.name): $\(.amount)/\(.interval) (\(.id))"' 2>/dev/null || echo "$response"
    else
        print_error "Failed to get plans"
    fi
}

# Sync campaigns and plans
sync_stripe() {
    print_status "Starting Stripe sync..."
    
    response=$(curl -s -X POST "$SYNC_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    if [ $? -eq 0 ]; then
        success=$(echo "$response" | jq -r '.success' 2>/dev/null)
        
        if [ "$success" = "true" ]; then
            print_success "Sync completed successfully!"
            
            # Extract sync results
            synced=$(echo "$response" | jq -r '.data.synced' 2>/dev/null)
            errors=$(echo "$response" | jq -r '.data.errors | length' 2>/dev/null)
            
            if [ "$synced" != "null" ] && [ "$synced" != "" ]; then
                print_success "Synced $synced items"
            fi
            
            if [ "$errors" != "null" ] && [ "$errors" != "0" ] && [ "$errors" != "" ]; then
                print_warning "$errors errors occurred"
                echo "$response" | jq -r '.data.errors[]' 2>/dev/null
            fi
        else
            print_error "Sync failed"
            echo "$response" | jq -r '.error' 2>/dev/null || echo "$response"
        fi
    else
        print_error "Failed to connect to sync API"
    fi
}

# Auto-sync (for scheduled runs)
auto_sync() {
    print_status "Running auto-sync..."
    
    response=$(curl -s -X POST "$SYNC_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d '{"autoSync": true}')
    
    if [ $? -eq 0 ]; then
        success=$(echo "$response" | jq -r '.success' 2>/dev/null)
        
        if [ "$success" = "true" ]; then
            print_success "Auto-sync completed!"
        else
            print_error "Auto-sync failed"
            echo "$response" | jq -r '.error' 2>/dev/null || echo "$response"
        fi
    else
        print_error "Failed to run auto-sync"
    fi
}

# Setup cron job for automatic syncing
setup_cron() {
    print_status "Setting up automatic sync (every 6 hours)..."
    
    # Get current directory
    CURRENT_DIR=$(pwd)
    SCRIPT_PATH="$CURRENT_DIR/stripe-sync.sh"
    
    # Create cron job entry
    CRON_JOB="0 */6 * * * cd $CURRENT_DIR && ./stripe-sync.sh auto"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "stripe-sync.sh"; then
        print_warning "Cron job already exists"
    else
        # Add cron job
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        print_success "Cron job added - will sync every 6 hours"
    fi
}

# Remove cron job
remove_cron() {
    print_status "Removing automatic sync cron job..."
    
    # Remove cron job
    crontab -l 2>/dev/null | grep -v "stripe-sync.sh" | crontab -
    print_success "Cron job removed"
}

# Main menu
show_menu() {
    echo ""
    echo "Available commands:"
    echo "  status    - Get current sync status"
    echo "  plans     - List all subscription plans"
    echo "  sync      - Sync campaigns and plans with Stripe"
    echo "  auto      - Run auto-sync (for cron jobs)"
    echo "  setup     - Setup automatic sync (cron job)"
    echo "  remove    - Remove automatic sync"
    echo "  help      - Show this menu"
    echo ""
}

# Main script logic
main() {
    # Check if server is running first
    if ! check_server; then
        exit 1
    fi
    
    case "$1" in
        "status")
            get_sync_status
            ;;
        "plans")
            get_plans
            ;;
        "sync")
            sync_stripe
            ;;
        "auto")
            auto_sync
            ;;
        "setup")
            setup_cron
            ;;
        "remove")
            remove_cron
            ;;
        "help"|"")
            show_menu
            ;;
        *)
            print_error "Unknown command: $1"
            show_menu
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
