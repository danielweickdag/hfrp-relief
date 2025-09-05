#!/bin/bash
# Quick Vercel Deployment Script for HFRP Relief

echo "🚀 Starting Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login check
echo "Checking Vercel authentication..."
vercel whoami || vercel login

# Run tests before deployment
echo "Running pre-deployment tests..."
node health-check.js
if [ $? -ne 0 ]; then
    echo "❌ Health check failed. Aborting deployment."
    exit 1
fi

# Deploy to production
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "Don't forget to:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test the deployed URL"
echo "3. Verify admin access"
