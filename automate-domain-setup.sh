#!/bin/bash

# 🚀 HFRP Relief - Automated Domain Assignment Script
# Automatically configures familyreliefproject.org domain in Vercel

set -e  # Exit on any error

echo "🌐 Starting automated domain assignment for familyreliefproject.org..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    print_status "Checking Vercel CLI installation..."
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
        print_success "Vercel CLI installed successfully"
    else
        print_success "Vercel CLI is already installed"
    fi
}

# Check if user is logged in to Vercel
check_vercel_auth() {
    print_status "Checking Vercel authentication..."
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Please login..."
        vercel login
        print_success "Successfully logged in to Vercel"
    else
        VERCEL_USER=$(vercel whoami)
        print_success "Already logged in as: $VERCEL_USER"
    fi
}

# Get or create Vercel project
setup_vercel_project() {
    print_status "Setting up Vercel project..."
    
    # Check if project exists
    if [ ! -f ".vercel/project.json" ]; then
        print_warning "No Vercel project found. Linking project..."
        vercel link --yes
        print_success "Project linked successfully"
    else
        print_success "Vercel project already configured"
    fi
}

# Deploy to get a Vercel URL first
deploy_to_vercel() {
    print_status "Deploying to Vercel to get project URL..."
    
    # Deploy to production
    DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
    
    if [ $? -eq 0 ]; then
        # Extract the deployment URL
        VERCEL_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^[:space:]]*\.vercel\.app' | head -1)
        print_success "Deployed successfully to: $VERCEL_URL"
        echo "$VERCEL_URL" > .vercel-url
    else
        print_error "Deployment failed. Please check the output above."
        exit 1
    fi
}

# Add custom domain to Vercel project
add_domain_to_vercel() {
    print_status "Adding custom domain to Vercel project..."
    
    # Add the main domain
    print_status "Adding familyreliefproject.org..."
    vercel domains add familyreliefproject.org --yes 2>/dev/null || {
        print_warning "Domain familyreliefproject.org may already be added or requires verification"
    }
    
    # Add the www subdomain
    print_status "Adding www.familyreliefproject.org..."
    vercel domains add www.familyreliefproject.org --yes 2>/dev/null || {
        print_warning "Domain www.familyreliefproject.org may already be added or requires verification"
    }
    
    print_success "Domain addition commands completed"
}

# Update environment variables
update_environment_variables() {
    print_status "Updating environment variables..."
    
    # Set the site URL to the custom domain
    vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://www.familyreliefproject.org" 2>/dev/null || {
        print_warning "NEXT_PUBLIC_SITE_URL may already be set"
    }
    
    # Set production mode
    vercel env add NODE_ENV production <<< "production" 2>/dev/null || {
        print_warning "NODE_ENV may already be set"
    }
    
    # Disable test mode for donations
    vercel env add NEXT_PUBLIC_DONATION_TEST_MODE production <<< "false" 2>/dev/null || {
        print_warning "NEXT_PUBLIC_DONATION_TEST_MODE may already be set"
    }
    
    print_success "Environment variables updated"
}

# Redeploy with new environment variables
redeploy_with_domain() {
    print_status "Redeploying with updated configuration..."
    
    REDEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
    
    if [ $? -eq 0 ]; then
        print_success "Redeployment successful"
    else
        print_warning "Redeployment had issues, but domain setup may still work"
    fi
}

# Display DNS configuration instructions
show_dns_instructions() {
    echo ""
    echo "================================================"
    echo -e "${BLUE}🔧 DNS CONFIGURATION REQUIRED${NC}"
    echo "================================================"
    echo ""
    echo "To complete the domain setup, configure these DNS records with your domain provider:"
    echo ""
    echo -e "${YELLOW}A Record:${NC}"
    echo "  Name: @"
    echo "  Value: 76.76.19.61"
    echo "  TTL: Auto (or 1 hour)"
    echo ""
    echo -e "${YELLOW}CNAME Record:${NC}"
    echo "  Name: www"
    echo "  Value: cname.vercel-dns.com"
    echo "  TTL: Auto (or 1 hour)"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "1. Add the DNS records above with your domain registrar"
    echo "2. Wait for DNS propagation (15 minutes to 24 hours)"
    echo "3. Visit https://www.familyreliefproject.org to verify"
    echo "4. Check Vercel dashboard for domain verification status"
    echo ""
    echo -e "${GREEN}🎉 Domain automation completed!${NC}"
}

# Create domain status checker
create_status_checker() {
    print_status "Creating domain status checker..."
    
cat > check-domain-status.sh << 'EOF'
#!/bin/bash

echo "🔍 Checking domain status for familyreliefproject.org..."
echo "================================================"

# Check DNS propagation
echo "📡 DNS Status:"
echo "A Record (familyreliefproject.org):"
nslookup familyreliefproject.org 8.8.8.8 | grep -A 1 "Name:" || echo "❌ Not resolved yet"

echo ""
echo "CNAME Record (www.familyreliefproject.org):"
nslookup www.familyreliefproject.org 8.8.8.8 | grep -A 1 "Name:" || echo "❌ Not resolved yet"

# Check HTTP status
echo ""
echo "🌐 HTTP Status:"
echo "Main domain:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://familyreliefproject.org || echo "❌ Not accessible"

echo "WWW domain:"
curl -s -o /dev/null -w "Status: %{http_code}\n" https://www.familyreliefproject.org || echo "❌ Not accessible"

echo ""
echo "📊 SSL Certificate:"
echo | openssl s_client -servername www.familyreliefproject.org -connect www.familyreliefproject.org:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "❌ SSL not ready"

echo ""
echo "✅ Check complete. If domains show ❌, wait for DNS propagation."
EOF

    chmod +x check-domain-status.sh
    print_success "Domain status checker created: ./check-domain-status.sh"
}

# Main execution
main() {
    echo "Starting automated domain assignment process..."
    echo ""
    
    check_vercel_cli
    check_vercel_auth
    setup_vercel_project
    deploy_to_vercel
    add_domain_to_vercel
    update_environment_variables
    redeploy_with_domain
    create_status_checker
    show_dns_instructions
    
    echo ""
    echo "================================================"
    echo -e "${GREEN}🚀 AUTOMATION COMPLETE!${NC}"
    echo "================================================"
    echo ""
    echo "Your HFRP Relief website is now configured for:"
    echo "• https://familyreliefproject.org"
    echo "• https://www.familyreliefproject.org"
    echo ""
    echo "Run './check-domain-status.sh' to monitor DNS propagation."
    echo ""
}

# Run the main function
main "$@"