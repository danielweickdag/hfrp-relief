# 🚀 Production Setup Tasks - HFRP Website

## 📋 Overview

This guide walks you through the exact steps to configure your HFRP website for production with real donation processing and email functionality.

---

## 🔴 **TASK 1: Set Up Real Donorbox Campaigns**

### **Time Required:** 30-45 minutes

### **Step 1.1: Access Your Donorbox Account**
1. **Go to** https://donorbox.org/admin
2. **Log in** to your existing account OR **Sign up** if you don't have one
3. **Navigate** to your dashboard

### **Step 1.2: Create Your Three Campaigns**

#### **Campaign A: Main Donation Campaign**
```
Campaign Name: "HFRP General Donations"
Purpose: Homepage and general donation buttons
Goal: Set your fundraising target
Suggested Amounts: $5, $10, $15, $20, $25, $50, $100
```

#### **Campaign B: Membership Campaign**
```
Campaign Name: "HFRP Monthly Membership"
Purpose: Recurring monthly donations
Enable: Monthly/Yearly recurring options
Suggested Monthly: $5, $10, $15, $25, $50
```

#### **Campaign C: Daily Giving Campaign**
```
Campaign Name: "HFRP Daily Impact"
Purpose: Daily cost messaging (16¢, 33¢, 50¢, 66¢)
Suggested Annual Amounts:
- $58 (16¢/day)
- $120 (33¢/day)
- $183 (50¢/day)
- $241 (66¢/day)
```

### **Step 1.3: Get Campaign IDs**
For each campaign, copy the ID from the URL:
```
Example: https://donorbox.org/hfrp-general-donations
Campaign ID: hfrp-general-donations
```

### **Step 1.4: Update Environment Variables**
Edit your `.env.local` file:
```env
# Replace with your real campaign IDs
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=hfrp-general-donations
NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=hfrp-monthly-membership
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=hfrp-daily-impact

# Keep test mode ON for now
NEXT_PUBLIC_DONATION_TEST_MODE=true
```

### **Step 1.5: Test With Real Campaigns**
```bash
# Restart your server
cd hfrp-relief
bun dev
```
1. **Test donate buttons** - should now open your real campaigns
2. **Verify test mode** still shows (yellow badges)
3. **Check URLs** include your real campaign IDs

**✅ Task 1 Complete When:** All donate buttons open your real Donorbox campaigns in test mode

---

## 🔴 **TASK 2: Configure Email Integration**

### **Time Required:** 20-30 minutes

### **Step 2.1: Create Resend Account**
1. **Go to** https://resend.com
2. **Sign up** for free account
3. **Verify your email** address
4. **Complete onboarding**

### **Step 2.2: Domain Setup**
**Option A: Use Your Domain (Recommended)**
1. **Add your domain** in Resend dashboard
2. **Add DNS records** as instructed
3. **Wait for verification** (up to 48 hours)

**Option B: Quick Start**
- Use `@resend.dev` addresses initially
- Upgrade to custom domain later

### **Step 2.3: Get API Key**
1. **Go to API Keys** in Resend dashboard
2. **Click "Create API Key"**
3. **Name it:** "HFRP Contact Form"
4. **Copy the key** (starts with `re_`)

### **Step 2.4: Update Environment Variables**
Add to your `.env.local` file:
```env
# Email Integration
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org
```

### **Step 2.5: Test Email Integration**
1. **Go to /contact page**
2. **Fill out contact form**
3. **Submit the form**
4. **Check your email** for notification
5. **Check sender's email** for auto-reply

**✅ Task 2 Complete When:** Contact form sends emails successfully

---

## 🔴 **TASK 3: Complete Website Testing**

### **Time Required:** 45-60 minutes

### **Step 3.1: Use Testing Checklist**
Follow the comprehensive `TEST_CHECKLIST.md`:

**Homepage Testing:**
- [ ] Video background plays
- [ ] Navigation works
- [ ] Donate button links to /donate
- [ ] All sections load correctly

**Donation Testing:**
- [ ] Orange header button works
- [ ] All daily giving options work
- [ ] Donorbox forms load properly
- [ ] Test mode indicators visible

**Mobile Testing:**
- [ ] Responsive design on phones
- [ ] Touch interactions work
- [ ] Navigation collapses properly
- [ ] Donation flow works on mobile

**Cross-Browser Testing:**
- [ ] Chrome - all features work
- [ ] Firefox - all features work
- [ ] Safari - all features work
- [ ] Edge - all features work

### **Step 3.2: Performance Testing**
- [ ] Pages load in under 3 seconds
- [ ] Images load progressively
- [ ] No console errors
- [ ] Smooth user experience

**✅ Task 3 Complete When:** All items in TEST_CHECKLIST.md pass

---

## 🔴 **TASK 4: Switch to Production Mode**

### **Time Required:** 10-15 minutes

### **Step 4.1: Final Test Donation**
```env
# Keep test mode on for final test
NEXT_PUBLIC_DONATION_TEST_MODE=true
```
1. **Make small test donation** ($1-5) to verify campaigns work
2. **Check Donorbox dashboard** for test transaction
3. **Verify email receipts** are sent

### **Step 4.2: Switch to Live Mode**
```env
# Switch to production
NEXT_PUBLIC_DONATION_TEST_MODE=false
```

### **Step 4.3: Verify Production Settings**
```env
# Final .env.local for production:
NEXT_PUBLIC_DONATION_TEST_MODE=false
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=your-real-main-campaign
NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=your-real-membership-campaign
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=your-real-daily-campaign
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org
```

### **Step 4.4: Final Live Test**
```bash
# Restart server in production mode
bun dev
```
1. **Verify TEST badges** are gone
2. **Make real $1 donation** to verify everything works
3. **Check donation appears** in Donorbox
4. **Verify receipt email** is sent

**✅ Task 4 Complete When:** Real donations process successfully

---

## 🔴 **TASK 5: Deploy to Production**

### **Time Required:** 30-45 minutes

### **Step 5.1: Choose Hosting Platform**
**Recommended Options:**
- **Vercel** (easiest for Next.js)
- **Netlify** (good for static sites)
- **DigitalOcean** (more control)

### **Step 5.2: Environment Variables**
**Set these in your hosting platform:**
```env
NEXT_PUBLIC_DONATION_TEST_MODE=false
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=your-real-main-campaign
NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=your-real-membership-campaign
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=your-real-daily-campaign
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org
NEXTAUTH_SECRET=your-production-secret-key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### **Step 5.3: Deploy and Test**
1. **Deploy your site**
2. **Test on live URL**
3. **Make test donation** on live site
4. **Verify all functionality**

**✅ Task 5 Complete When:** Website is live and fully functional

---

## 📊 **Task Progress Tracker**

### **Task Status:**
- [ ] **Task 1:** Real Donorbox campaigns set up
- [ ] **Task 2:** Email integration configured
- [ ] **Task 3:** Complete website testing done
- [ ] **Task 4:** Production mode activated
- [ ] **Task 5:** Website deployed live

### **Estimated Total Time:** 2.5 - 3.5 hours

---

## 🆘 **Support & Troubleshooting**

### **Donorbox Issues:**
- **Support:** support@donorbox.org
- **Help Center:** https://help.donorbox.org

### **Resend Email Issues:**
- **Docs:** https://resend.com/docs
- **Support:** support@resend.com

### **Website Issues:**
- Check browser console for errors
- Review environment variables
- Test in different browsers
- Clear cache and cookies

---

## 🎯 **Success Criteria**

**Your HFRP website is production-ready when:**

✅ **Real donations** process through Donorbox
✅ **Contact form** sends professional emails
✅ **All devices** work smoothly (mobile, tablet, desktop)
✅ **No test mode** indicators visible
✅ **Live website** accessible at your domain
✅ **Zero errors** in browser console

---

## 📞 **Next Steps After Completion**

1. **Monitor donations** in Donorbox dashboard
2. **Check email deliverability** regularly
3. **Review analytics** for user behavior
4. **Update content** as needed
5. **Share with supporters** - your HFRP website is ready to make an impact! 🇭🇹

**🎉 Your professional donation platform is ready to help families in Haiti!**
