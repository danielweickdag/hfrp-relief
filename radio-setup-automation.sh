#!/bin/bash

# 🎵 HFRP Radio - Automated Stream Setup Script
# This script automates the radio streaming setup process

echo "🎵 HFRP Radio - Automated Stream Setup"
echo "======================================"

# Check if the development server is running
if lsof -i :3005 > /dev/null 2>&1; then
    echo "✅ Development server is running on port 3005"
else
    echo "⚠️  Development server not detected on port 3005"
    echo "Starting development server..."
    npm run dev &
    sleep 5
fi

# Test the current HLS stream
echo ""
echo "🔍 Testing HLS stream connectivity..."
HLS_URL="https://stream.zeno.fm/hls/wvdsqqn1cf9uv"

if curl -I "$HLS_URL" 2>/dev/null | head -1 | grep -q "200\|302"; then
    echo "✅ HLS stream is accessible: $HLS_URL"
else
    echo "⚠️  HLS stream test failed, but this may be normal for live streams"
fi

# Test the website radio player
echo ""
echo "🌐 Testing website radio player..."
if curl -s http://localhost:3000 | grep -q "RadioPlayer"; then
    echo "✅ Radio player component found on website"
else
    echo "⚠️  Could not verify radio player component"
fi

# Display current configuration
echo ""
echo "📊 Current Stream Configuration:"
echo "================================"
echo "• HLS Stream URL: https://stream.zeno.fm/hls/wvdsqqn1cf9uv"
echo "• Player Page: https://listen.zeno.fm/player/family-relief-project-radio-station"
echo "• Website: http://localhost:3000"

echo ""
echo "🎯 Broadcasting Setup:"
echo "====================="
echo "• Server: stream.zeno.fm"
echo "• Port: 80"
echo "• Mount Point: wvdsqqn1cf9uv/source"
echo "• Format: MP3, 128kbps recommended"

echo ""
echo "🚀 Next Steps:"
echo "============="
echo "1. Set up your broadcasting software (BUTT, OBS, etc.)"
echo "2. Enter your Zeno.FM stream key"
echo "3. Start broadcasting to Zeno.FM"
echo "4. Test your website at http://localhost:3000"

echo ""
echo "📱 Quick Links:"
echo "==============="
echo "• Website: http://localhost:3000"
echo "• Zeno.FM Dashboard: https://zeno.fm/dashboard"
echo "• Setup Guide: ./ZENO_BROADCASTING_SETUP.md"

echo ""
echo "✨ Setup automation complete!"
