#!/bin/bash
# Quick Netlify Deployment Script for HFRP Relief

echo "🚀 Starting Netlify deployment..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login check
echo "Checking Netlify authentication..."
netlify status || netlify login

# Build the project
echo "Building project..."
npm run build

# Deploy to production
echo "Deploying to Netlify..."
netlify deploy --prod --dir=.next

echo "✅ Deployment complete!"
echo "Don't forget to:"
echo "1. Set environment variables in Netlify dashboard"
echo "2. Test the deployed URL"
echo "3. Verify admin access"
