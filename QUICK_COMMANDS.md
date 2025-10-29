# 🚀 Quick Commands Reference
## Haitian Family Relief Project - Essential Commands

---

## 📋 **MOST COMMON COMMANDS**

### 🚀 **Deployment**
```bash
# Deploy with automatic verification
npm run deploy-verify

# Quick deploy only
npm run deploy:vercel

# Deploy manually
vercel --prod
```

### 📊 **Monitoring**
```bash
# Full health check
npm run monitor

# Quick health status
npm run health

# API status check
npm run status

# Manual monitoring
node monitoring-setup.js
```

### 🔄 **Updates**
```bash
# Interactive update tool
npm run quick-update

# Start local development
npm run dev

# Build and test locally
npm run build
```

---

## 🎯 **DAILY TASKS**

### Morning Check (30 seconds)
```bash
npm run health
```
**Expected output:** `"status": "healthy"`

### Quick Deployment (2 minutes)
```bash
npm run deploy-verify
```
**Expected output:** `🏥 Health Score: 100%`

### Content Updates
```bash
npm run quick-update
```
**Follow the interactive prompts**

---

## 🔧 **TROUBLESHOOTING**

### If Health Check Fails
```bash
# Check detailed status
npm run status

# View deployment logs
vercel logs

# Redeploy
npm run deploy-verify
```

### If Payments Not Working
```bash
# Check Stripe status
curl "https://www.familyreliefproject7.org/api/status" | jq .services.stripe

# Verify environment variables
vercel env ls
```

### If Emails Not Sending
```bash
# Check email service status
curl "https://www.familyreliefproject7.org/api/status" | jq .services.email

# Test contact form
curl -X POST "https://www.familyreliefproject7.org/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

---

## 📁 **FILE LOCATIONS**

### Content Files
- **Homepage**: `src/app/page.tsx`
- **About Page**: `src/app/about/page.tsx`
- **Donate Page**: `src/app/donate/page.tsx`
- **Contact Page**: `src/app/contact/page.tsx`

### Configuration Files
- **Environment**: `.env`
- **Vercel Config**: `vercel.json`
- **Package Config**: `package.json`

### Data Files
- **Donations**: `data/donations.json`
- **Campaigns**: `data/campaigns.json`
- **Email Queue**: `data/email_queue.json`

---

## 🌐 **IMPORTANT URLS**

| Purpose | URL |
|---------|-----|
| **Live Site** | https://www.familyreliefproject7.org |
| **Health Check** | https://www.familyreliefproject7.org/api/health |
| **Admin Panel** | https://www.familyreliefproject7.org/admin |
| **Vercel Dashboard** | https://vercel.com/danielweickdags-projects/hfrp-relief |

---

## ⚡ **EMERGENCY COMMANDS**

### Site Down
```bash
vercel rollback  # Rollback to previous version
npm run deploy-verify  # Redeploy current version
```

### Performance Issues
```bash
npm run monitor  # Check performance metrics
vercel logs  # Check for errors
```

### Payment Issues
```bash
# Check Stripe dashboard
# Verify environment variables
vercel env ls | grep STRIPE
```

---

## 📞 **SUPPORT**

### Self-Help
1. Run `npm run monitor` first
2. Check `vercel logs` for errors
3. Try `npm run deploy-verify`
4. Review `WEBSITE_MANAGEMENT_GUIDE.md`

### Documentation
- **Full Guide**: `WEBSITE_MANAGEMENT_GUIDE.md`
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

*Keep this file handy for quick reference! 📌*