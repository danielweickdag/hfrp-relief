#!/bin/bash

# 🚀 Deploy and Verify Script
# Automates deployment and health verification

echo "🚀 Starting deployment and verification process..."
echo "=================================================="

# Step 1: Deploy to production
echo "📦 Deploying to production..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Step 2: Wait for deployment to propagate
echo "⏳ Waiting for deployment to propagate..."
sleep 10

# Step 3: Run health check
echo "🏥 Running health check..."
node monitoring-setup.js

# Step 4: Test critical endpoints
echo "🔍 Testing critical endpoints..."

# Test health API
echo "Testing health API..."
HEALTH_STATUS=$(curl -s "https://www.familyreliefproject7.org/api/health" | jq -r '.status')
if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "✅ Health API: OK"
else
    echo "❌ Health API: FAILED"
fi

# Test contact API
echo "Testing contact API..."
CONTACT_RESPONSE=$(curl -s -X POST "https://www.familyreliefproject7.org/api/contact" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Deploy","email":"test@example.com","message":"Deployment verification test"}' | jq -r '.success')

if [ "$CONTACT_RESPONSE" = "true" ]; then
    echo "✅ Contact API: OK"
else
    echo "❌ Contact API: FAILED"
fi

# Test status API
echo "Testing status API..."
STATUS_RESPONSE=$(curl -s "https://www.familyreliefproject7.org/api/status" | jq -r '.status')
if [ "$STATUS_RESPONSE" = "operational" ]; then
    echo "✅ Status API: OK"
else
    echo "❌ Status API: FAILED"
fi

echo "=================================================="
echo "🎉 Deployment and verification complete!"
echo "🌐 Live site: https://www.familyreliefproject7.org"
echo "📊 Health check: https://www.familyreliefproject7.org/api/health"