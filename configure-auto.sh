#!/bin/bash

# HFRP Relief - Automatic Configuration Script
# This script unifies the setup process for the HFRP Relief project.

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting HFRP Relief Automatic Configuration...${NC}"
echo "=================================================="

# 1. Environment Setup
echo -e "\n${BLUE}Step 1: Environment Setup${NC}"
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from example..."
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✅ .env.local created from .env.local.example${NC}"
    elif [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ .env.local created from .env.example${NC}"
    else
        echo -e "${YELLOW}⚠️  No example environment file found.${NC}"
    fi
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# 2. Install Dependencies
echo -e "\n${BLUE}Step 2: Installing Dependencies${NC}"
if command -v npm >/dev/null 2>&1; then
    echo "Installing dependencies with npm..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ npm not found. Please install Node.js and npm.${NC}"
    exit 1
fi

# 3. Stripe Setup
echo -e "\n${BLUE}Step 3: Stripe Automation Setup${NC}"
if [ -f "./setup-stripe-automation.sh" ]; then
    chmod +x ./setup-stripe-automation.sh
    # Running without arguments defaults to test mode
    # We allow it to fail if keys are missing, but don't exit the main script
    ./setup-stripe-automation.sh || echo -e "${YELLOW}⚠️  Stripe setup encountered issues (likely missing keys). Continuing...${NC}"
else
    echo -e "${YELLOW}⚠️  setup-stripe-automation.sh not found.${NC}"
fi

# 4. Radio Setup
echo -e "\n${BLUE}Step 4: Radio Setup${NC}"
if [ -f "./radio-setup-automation.sh" ]; then
    chmod +x ./radio-setup-automation.sh
    ./radio-setup-automation.sh || echo -e "${YELLOW}⚠️  Radio setup encountered issues. Continuing...${NC}"
else
    echo -e "${YELLOW}⚠️  radio-setup-automation.sh not found.${NC}"
fi

# 5. DNS Configuration
echo -e "\n${BLUE}Step 5: DNS Configuration${NC}"
# Prioritize the script for the active domain (familyreliefproject7.org)
if [ -f "./setup-dns-auto.sh" ]; then
    chmod +x ./setup-dns-auto.sh
    ./setup-dns-auto.sh || echo -e "${YELLOW}⚠️  DNS setup encountered issues. Continuing...${NC}"
elif [ -f "./configure-familyreliefproject.sh" ]; then
    chmod +x ./configure-familyreliefproject.sh
    ./configure-familyreliefproject.sh || echo -e "${YELLOW}⚠️  DNS setup encountered issues. Continuing...${NC}"
else
    echo -e "${YELLOW}⚠️  No DNS configuration script found.${NC}"
fi

# 6. Final Status
echo -e "\n${BLUE}Step 6: Automation Status Check${NC}"
if command -v npm >/dev/null 2>&1; then
    npm run automation-status || echo -e "${YELLOW}⚠️  Status check failed. Continuing...${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping automation status (npm not available).${NC}"
fi

echo -e "\n${GREEN}🎉 Configuration Complete!${NC}"
echo "Please review any warnings above and ensure .env.local has valid API keys."
