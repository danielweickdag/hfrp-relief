#!/bin/bash

# Production Deployment Script
set -e

echo "🚀 Deploying HFRP to Production..."

# Check if webhook secret is configured
if grep -q "whsec_test_your_webhook_secret_here" .env.local; then
    echo "❌ Please update STRIPE_WEBHOOK_SECRET with actual webhook secret"
    echo "📖 See webhook-setup-instructions.md for details"
    exit 1
fi

# Deploy to Vercel
if command -v vercel &> /dev/null; then
    echo "📦 Deploying to Vercel..."
    vercel --prod
else
    echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
fi

# Deploy to Netlify
if command -v netlify &> /dev/null; then
    echo "📦 Deploying to Netlify..."
    netlify deploy --prod
else
    echo "⚠️  Netlify CLI not found. Install with: npm i -g netlify-cli"
fi

echo "✅ Production deployment completed!"
