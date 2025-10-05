#!/bin/bash

echo "🔍 Domain Verification for familyreliefproject.org"
echo "================================================"

# Check DNS propagation
echo "📡 Checking DNS records..."
echo ""
APEX_A=$(dig +short A familyreliefproject.org @8.8.8.8 2>/dev/null)
echo "A Record (familyreliefproject.org): ${APEX_A:-not found}"
if [ "$APEX_A" = "76.76.21.21" ]; then
  echo "✅ Apex A record points to Vercel (76.76.21.21)"
else
  echo "❌ Apex A record is incorrect. Set A @ → 76.76.21.21"
fi

echo ""
WWW_CNAME=$(dig +short CNAME www.familyreliefproject.org @8.8.8.8 2>/dev/null)
echo "CNAME Record (www.familyreliefproject.org): ${WWW_CNAME:-not found}"
if [[ "$WWW_CNAME" == *"vercel-dns.com."* ]]; then
  echo "✅ WWW CNAME points to Vercel (cname.vercel-dns.com)"
else
  echo "❌ WWW CNAME is incorrect. Set CNAME www → cname.vercel-dns.com"
fi

# Check website accessibility
echo ""
echo "🌐 Checking website accessibility..."
echo ""
echo "Main domain (familyreliefproject.org):"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L -I --connect-timeout 10 https://familyreliefproject.org 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Status: $HTTP_STATUS (Success)"
else
    echo "❌ Status: $HTTP_STATUS (Not ready)"
fi

echo ""
echo "WWW domain (www.familyreliefproject.org):"
SERVER_HEADER=$(curl -s -I --connect-timeout 10 https://www.familyreliefproject.org 2>/dev/null | grep -i "^server:" | awk -F': ' '{print $2}')
HTTP_STATUS_WWW=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 https://www.familyreliefproject.org 2>/dev/null || echo "000")
if [ "$HTTP_STATUS_WWW" = "200" ]; then
    echo "✅ Status: $HTTP_STATUS_WWW (Success)"
else
    echo "❌ Status: $HTTP_STATUS_WWW (Not ready)"
fi
if [[ "$SERVER_HEADER" == *"Vercel"* ]]; then
    echo "✅ Server header indicates Vercel (${SERVER_HEADER})"
else
    echo "❌ Server header is not Vercel (${SERVER_HEADER:-unknown})"
fi

# Check SSL certificate
echo ""
echo "🔒 Checking SSL certificate..."
SSL_CHECK=$(echo | timeout 10 openssl s_client -servername www.familyreliefproject.org -connect www.familyreliefproject.org:443 2>/dev/null | openssl x509 -noout -subject 2>/dev/null || echo "")
if [ -n "$SSL_CHECK" ]; then
    echo "✅ SSL certificate is active"
    echo "   $SSL_CHECK"
else
    echo "❌ SSL certificate not ready"
fi

echo ""
echo "🔁 Checking apex redirect to WWW..."
REDIRECT_LOCATION=$(curl -s -I https://familyreliefproject.org 2>/dev/null | grep -i "^location:" | awk -F': ' '{print $2}' | tr -d '\r')
if [[ "$REDIRECT_LOCATION" == "https://www.familyreliefproject.org"* ]]; then
  echo "✅ Apex redirects to ${REDIRECT_LOCATION}"
else
  echo "❌ Apex redirect missing or incorrect (Location: ${REDIRECT_LOCATION:-none})"
fi

echo ""
echo "📊 Summary:"
APEX_OK=0; WWW_OK=0; SERVER_OK=0; REDIRECT_OK=0
if [ "$APEX_A" = "76.76.21.21" ]; then APEX_OK=1; fi
if [[ "$WWW_CNAME" == *"vercel-dns.com."* ]]; then WWW_OK=1; fi
if [[ "$SERVER_HEADER" == *"Vercel"* ]] && [ "$HTTP_STATUS_WWW" = "200" ]; then SERVER_OK=1; fi
if [[ "$REDIRECT_LOCATION" == "https://www.familyreliefproject.org"* ]]; then REDIRECT_OK=1; fi

if [ $APEX_OK -eq 1 ] && [ $WWW_OK -eq 1 ] && [ $SERVER_OK -eq 1 ] && [ $REDIRECT_OK -eq 1 ]; then
  echo "🎉 Domain is correctly pointed to Vercel and serving content."
  echo "   Visit: https://www.familyreliefproject.org"
  STRICT=0
else
  echo "⏳ Domain not yet pointed to Vercel or still propagating."
  echo "   Required: A @ → 76.76.21.21, CNAME www → cname.vercel-dns.com"
  echo "   Optional checks: Apex 301 to WWW, Server: Vercel, Status: 200"
  echo "   Current APEX: ${APEX_A:-none}; WWW CNAME: ${WWW_CNAME:-none}; Server: ${SERVER_HEADER:-unknown}"
  STRICT=1
fi

# Strict mode: exit non-zero when domain is not correctly configured
if [[ "$1" == "--strict" ]]; then
  if [ $STRICT -ne 0 ]; then
    exit 1
  fi
fi
