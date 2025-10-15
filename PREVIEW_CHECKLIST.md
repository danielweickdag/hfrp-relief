# 🔍 Preview Checklist - Before Production Deployment

**Target Domain:** https://www.familyreliefproject7.org
**Dev Server:** http://localhost:3005
**Date:** October 14, 2025

---

## ✅ Local Preview Tasks

### 1. Homepage Verification
- [ ] Open http://localhost:3005
- [ ] Check hero section loads with background video
- [ ] Verify "Donate" button is visible and clickable
- [ ] Check social media links in header
- [ ] Scroll through all sections (Impact Stats, Programs, Testimonials)
- [ ] Verify footer content displays correctly
- [ ] Check responsive design (resize browser window)

### 2. Navigation Testing
- [ ] Test all header navigation links:
  - [ ] Home (/)
  - [ ] Gallery (/gallery)
  - [ ] Impact (/impact)
  - [ ] Radio (/radio)
  - [ ] Donate (/donate)
  - [ ] Contact (/contact)
- [ ] Verify mobile menu works (resize to mobile view)
- [ ] Check that navigation highlights current page

### 3. Donation Flow Testing
- [ ] Go to http://localhost:3005/donate
- [ ] Verify all donation amount buttons work ($25, $50, $100, Custom)
- [ ] Test recurring donation toggle
- [ ] Select a campaign from dropdown
- [ ] Click "Donate Now" button
- [ ] Verify Stripe checkout session opens
- [ ] Use test card: **4242 4242 4242 4242**
  - Expiry: 12/34
  - CVC: 123
  - ZIP: 12345
- [ ] Complete test donation
- [ ] Verify redirect to success page
- [ ] Check success page displays donation details

### 4. Admin Panel Testing
- [ ] Go to http://localhost:3005/admin
- [ ] Login with credentials:
  - Email: `w.regis@comcast.net`
  - Password: `Melirosecherie58`
- [ ] Verify dashboard loads after login
- [ ] Check analytics display correctly
- [ ] Test campaign management features
- [ ] Verify blog post management works
- [ ] Check donation reports display
- [ ] Test logout functionality

### 5. Stripe Integration Verification
- [ ] Webhook endpoint active: http://localhost:3005/api/stripe/webhook
- [ ] Check logs in `data/logs/stripe-events.json` for recent events
- [ ] Verify test mode indicator shows: "🧪 Test mode active"
- [ ] Confirm no real charges warning displays

### 6. Page-by-Page Review

#### Gallery Page (/gallery)
- [ ] Images load correctly
- [ ] Gallery categories work
- [ ] Image lightbox/modal works
- [ ] Mobile responsive layout

#### Impact Page (/impact)
- [ ] Impact statistics display
- [ ] Charts and graphs render
- [ ] Success stories load
- [ ] Testimonials display

#### Radio Page (/radio)
- [ ] Radio player loads
- [ ] Audio playback works
- [ ] Program schedule displays
- [ ] Social sharing buttons work

#### Contact Page (/contact)
- [ ] Contact form displays
- [ ] Form validation works
- [ ] Submit button functional
- [ ] Contact information visible

#### Blog Pages (/blog)
- [ ] Blog listing page loads
- [ ] Individual blog posts open
- [ ] Categories filter works
- [ ] Search functionality works

### 7. SEO and Metadata Check
- [ ] View page source (right-click → View Page Source)
- [ ] Verify `<meta>` tags contain **familyreliefproject7.org**
- [ ] Check canonical link: `<link rel="canonical" href="https://www.familyreliefproject7.org"/>`
- [ ] Verify Open Graph tags for social sharing
- [ ] Check Twitter card metadata
- [ ] Verify structured data (schema.org) contains correct domain

### 8. Performance Testing
- [ ] Open browser DevTools (F12)
- [ ] Go to "Network" tab
- [ ] Reload homepage
- [ ] Check load times (should be < 3 seconds)
- [ ] Verify no 404 errors in console
- [ ] Check for JavaScript errors
- [ ] Test on slow 3G network (DevTools → Network → Throttling)

### 9. Browser Compatibility
- [ ] Test in Chrome/Edge
- [ ] Test in Firefox
- [ ] Test in Safari (if on Mac)
- [ ] Test mobile view in each browser

### 10. Accessibility Check
- [ ] Tab through navigation (keyboard only)
- [ ] Check color contrast (text should be readable)
- [ ] Verify alt text on images
- [ ] Test screen reader announcements (if available)

---

## 🔧 Technical Verification

### Environment Variables Check
```bash
# In your terminal, run:
grep -E "STRIPE|SITE_URL" .env.local .env.example
```
Expected output should show:
- ✓ `NEXT_PUBLIC_SITE_URL` set to localhost for dev
- ✓ Stripe test keys configured
- ✓ `NEXT_PUBLIC_STRIPE_TEST_MODE=true`

### Build Test
```bash
# Run a production build locally
npm run build

# Check for:
# - No TypeScript errors
# - No linting errors
# - All 93 routes compiled successfully
```

### Stripe Workflow Test
```bash
# Run the automated Stripe test
node scripts/stripe-workflow-test.js

# Verify:
# - All environment variables present
# - Webhook configuration valid
# - Data directories exist
```

---

## 📝 Domain-Specific Checks

### Current Domain References
Run this command to verify all domain references are updated:
```bash
grep -r "familyreliefproject\.org" src/ --exclude-dir=node_modules | grep -v "familyreliefproject7.org"
```
Result should be empty (no old domain references).

### Meta Tags Verification
Check these files contain the new domain:
- [ ] `src/app/layout.tsx` - metadataBase URL
- [ ] `src/app/layout.tsx` - canonical link
- [ ] `src/app/layout.tsx` - Open Graph URL
- [ ] `src/app/layout.tsx` - schema.org URLs

### Documentation Review
Ensure all documentation has the updated domain:
- [ ] `DEPLOYMENT_GUIDE_PRODUCTION.md`
- [ ] `PROJECT_STATUS_REPORT.md`
- [ ] `QUICK_START.md`
- [ ] `CLAUDE.md`
- [ ] `.env.example`

---

## 🚀 Pre-Deployment Final Checks

### Before Running `vercel --prod`:

1. **Environment Variables Ready**
   - [ ] Have live Stripe keys ready (sk_live_ and pk_live_)
   - [ ] Have webhook secret from Stripe Dashboard
   - [ ] Prepared to set `NEXT_PUBLIC_STRIPE_TEST_MODE=false`
   - [ ] Generated secure `SESSION_SECRET`

2. **Security Updates**
   - [ ] Plan to change admin password after deployment
   - [ ] Remove test credentials from UI
   - [ ] Review exposed API endpoints

3. **DNS Configuration**
   - [ ] Domain purchased and accessible
   - [ ] DNS records ready to update
   - [ ] NS records pointing to Vercel

4. **Stripe Live Setup**
   - [ ] Business verification completed in Stripe
   - [ ] Bank account connected for payouts
   - [ ] Tax information submitted
   - [ ] Webhook endpoint ready: `https://www.familyreliefproject7.org/api/stripe/webhook`

5. **Backup Plan**
   - [ ] Current codebase backed up
   - [ ] Database/data files backed up
   - [ ] Rollback plan documented

---

## 🎯 Live Domain Preview (After DNS Setup)

Once deployed to Vercel but before going fully live:

1. **Preview URL Testing**
   - [ ] Test on Vercel preview URL first
   - [ ] Verify all pages load correctly
   - [ ] Complete a test donation on preview URL

2. **DNS Cutover**
   - [ ] Point DNS to Vercel
   - [ ] Wait for DNS propagation (5-60 minutes)
   - [ ] Test with `nslookup familyreliefproject7.org`

3. **Live Domain Testing**
   - [ ] Access https://www.familyreliefproject7.org
   - [ ] Verify SSL certificate is active (🔒 in browser)
   - [ ] Complete live test donation ($1)
   - [ ] Verify webhook receives production events

---

## 📊 Monitoring After Deployment

### First 24 Hours
- [ ] Monitor Vercel logs for errors
- [ ] Check Stripe dashboard for incoming donations
- [ ] Verify webhook events processing correctly
- [ ] Test email notifications (if configured)
- [ ] Monitor site uptime
- [ ] Check analytics for traffic

### Week 1
- [ ] Review error logs daily
- [ ] Monitor donation success rate
- [ ] Check for any user-reported issues
- [ ] Verify backups running automatically

---

## 🆘 Emergency Contacts

**If issues arise:**
- Vercel Status: https://vercel-status.com
- Stripe Status: https://status.stripe.com
- Domain Registrar Support: [Your registrar]
- Development Team: [Your contact info]

---

## ✨ Deployment Command

When everything above is checked and ready:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts and set environment variables in Vercel Dashboard
```

---

**Status:** Ready for local preview testing ✅
**Next Step:** Complete this checklist, then proceed with production deployment

**Questions?** Check `DEPLOYMENT_GUIDE_PRODUCTION.md` for detailed deployment instructions.
