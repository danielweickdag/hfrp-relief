#!/bin/bash

# 🚀 HFRP Relief - Production Deployment Script
# Deploy to familyreliefproject.org

set -e  # Exit on any error

echo "🚀 Starting HFRP Relief Production Deployment..."
echo "🌐 Target Domain: https://www.familyreliefproject.org"
echo ""

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

# Check prerequisites
print_status "Checking prerequisites..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm/yarn/bun is available
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
else
    print_error "No package manager found (npm, yarn, or bun)"
    exit 1
fi

print_success "Using package manager: $PACKAGE_MANAGER"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from template..."
    
    if [ -f ".env.production.template" ]; then
        cp .env.production.template .env.production
        print_warning "Please edit .env.production with your actual values before continuing"
        print_warning "Press Enter after you've configured .env.production..."
        read -r
    else
        print_error ".env.production.template not found. Please create environment configuration."
        exit 1
    fi
fi

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Install dependencies
print_status "Installing dependencies..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun install
elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn install
else
    npm install
fi

# Run linting
print_status "Running code quality checks..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run lint || print_warning "Linting issues found, continuing anyway..."
else
    $PACKAGE_MANAGER run lint || print_warning "Linting issues found, continuing anyway..."
fi

# Build the application
print_status "Building application for production..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run build
else
    $PACKAGE_MANAGER run build
fi

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Run health check
if [ -f "health-check.js" ]; then
    print_status "Running health check..."
    node health-check.js || print_warning "Health check failed, continuing anyway..."
fi

print_success "Pre-deployment checks completed!"
echo ""

# Environment variables reminder
print_status "🔧 Required Environment Variables for familyreliefproject.org:"
echo "=================================================================="
echo ""
echo "Production Settings:"
echo "- NODE_ENV=production"
echo "- NEXT_PUBLIC_SITE_URL=https://www.familyreliefproject.org"
echo "- NEXT_PUBLIC_DONATION_TEST_MODE=false"
echo ""
echo "Donorbox Configuration:"
echo "- NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=your-main-campaign-id"
echo "- NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=your-membership-campaign-id"
echo "- NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=your-daily-campaign-id"
echo ""
echo "Email Configuration:"
echo "- EMAIL_SERVICE=resend"
echo "- RESEND_API_KEY=re_your_resend_api_key"
echo "- RESEND_FROM_EMAIL=noreply@familyreliefproject.org"
echo "- RESEND_TO_EMAIL=contact@familyreliefproject.org"
echo ""
echo "Security:"
echo "- NEXTAUTH_SECRET=your-secure-random-string"
echo ""
read -p "Have you configured all these environment variables in your deployment platform? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Please set up environment variables first:"
    echo "   1. Go to https://vercel.com/dashboard"
    echo "   2. Select your project"
    echo "   3. Go to Settings → Environment Variables"
    echo "   4. Add all required variables"
    exit 1
fi

# Build check
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "========================="
    echo ""
    echo "Next steps:"
    echo "1. 🌐 Connect your custom domain in Vercel Dashboard"
    echo "2. 🔗 Set up Stripe webhook with your domain URL"
    echo "3. 🧪 Test a small donation to verify everything works"
    echo ""
    echo "Test URLs (replace with your domain):"
    echo "- Configuration test: https://your-domain.com/stripe-live-test"
    echo "- Webhook test: https://your-domain.com/webhook-test"
    echo ""
    echo "📋 See DOMAIN_CONNECTION_GUIDE.md for detailed next steps"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
