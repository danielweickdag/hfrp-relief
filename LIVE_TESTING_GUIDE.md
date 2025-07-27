# 🧪 Live Testing Guide - HFRP Website

## 🎯 Current Testing Session - Version 75

Your HFRP website is **running live** at http://localhost:3000 with all navigation improvements completed. Let's test the new donation flow step-by-step.

---

## ✅ **Step 1: Test Header Navigation**

### **Orange "Donate" Button Test:**
1. **Navigate to homepage**: http://localhost:3000
2. **Look for orange "Donate" button** in top-right header
3. **Verify TEST badge** appears (yellow badge indicating test mode)
4. **Click the orange "Donate" button**

**Expected Result:**
```
✅ Button shows loading spinner briefly
✅ Redirects to /donate page
✅ No Donorbox popup (button links to donate page now)
```

### **Admin Quick Link Test:**
1. **Look for small admin icon** in header (next to social media)
2. **Click the admin icon** (shield/checkmark icon)
3. **Should redirect** to /admin page

---

## ✅ **Step 2: Test Donate Page Flow**

### **Main Hero Section:**
1. **On the /donate page**, look for large blue hero section
2. **Find "Donate Now - Any Amount" button** (white button with 💝 emoji)
3. **Verify TEST mode indicators** are visible
4. **Click the main donate button**

**Expected Result:**
```
✅ Opens new tab with Donorbox form
✅ URL includes "?test=true" parameter
✅ Donorbox shows test mode indicators
✅ No real charges will be processed
```

### **Daily Giving Options Test:**
1. **Scroll down** to "Daily Giving - Cents That Count" section
2. **Test each daily option** by clicking the buttons:
   - **16¢ Daily** (Blue - Daily Nutrition)
   - **33¢ Daily** (Green - Healthcare Access)
   - **50¢ Daily** (Orange - Education Support)
   - **66¢ Daily** (Red - Comprehensive Care)

**Expected for Each Button:**
```
✅ Shows "Give [amount]¢ Daily" text
✅ Opens Donorbox in new tab
✅ Includes test mode parameters
✅ Form loads without errors
```

---

## ✅ **Step 3: Test Mobile Responsiveness**

### **Mobile Browser Test:**
1. **Open on mobile device** or **resize browser** to mobile width
2. **Test orange donate button** in mobile header
3. **Test hamburger menu** (if visible on mobile)
4. **Navigate to /donate page** on mobile
5. **Test daily giving buttons** on mobile

**Expected Mobile Behavior:**
```
✅ Header remains sticky and functional
✅ Orange donate button visible and clickable
✅ Daily giving cards stack vertically
✅ All buttons remain touch-friendly
✅ New tabs open properly on mobile
```

---

## ✅ **Step 4: Test Other Key Flows**

### **Membership Test:**
1. **Click red "Become a Member" button** in header
2. **Should navigate** to /membership page
3. **Look for yellow test mode banner**
4. **Verify iframe loads** with membership form

### **Contact Form Test:**
1. **Navigate to /contact page**
2. **Fill out contact form** with test information
3. **Submit the form**
4. **Check for success message**

**Note:** *Email won't actually send until you configure email integration*

---

## 🚨 **Troubleshooting Common Issues**

### **Pop-up Blocked:**
```
Solution: Enable pop-ups for localhost:3000
Or: Right-click donate button → "Open in new tab"
```

### **Donorbox Not Loading:**
```
Check: Browser console for errors (F12 → Console)
Check: Ad blockers disabled for localhost
Check: Internet connection stable
```

### **Button Not Responding:**
```
Check: Browser console for JavaScript errors
Try: Different browser (Chrome, Firefox, Safari)
Try: Refresh page and test again
```

---

## 📊 **Console Monitoring**

### **Open Browser Console** (F12 → Console tab)

**Success Messages to Look For:**
```javascript
🎯 DonorboxButton clicked! {campaignId: "haitian-family-relief-project", isTestMode: true}
🧪 DONATION TEST MODE - No real charges will be made
🌐 Opening URL: https://donorbox.org/embed/haitian-family-relief-project?test=true
Donorbox script loaded successfully
```

**Warning Messages (OK to ignore):**
```javascript
Video play attempt failed (normal browser behavior)
Donorbox script taking too long (on slow connections)
```

**Error Messages (Report if seen):**
```javascript
Failed to load Donorbox script
Error opening Donorbox
Window not available
```

---

## ✅ **Test Results Checklist**

Mark each item as you test:

### **Header Navigation:**
- [ ] Orange "Donate" button visible in header
- [ ] Orange button redirects to /donate page
- [ ] Admin icon links to /admin page
- [ ] Social media icons are functional
- [ ] "Become a Member" button works

### **Donate Page Functionality:**
- [ ] Main "Donate Now - Any Amount" button opens Donorbox
- [ ] All 4 daily giving buttons (16¢, 33¢, 50¢, 66¢) work
- [ ] Test mode indicators visible (yellow badges)
- [ ] Donorbox forms load correctly in new tabs
- [ ] URLs include test parameters (?test=true)

### **Mobile Experience:**
- [ ] Header functions properly on mobile
- [ ] Donate page is responsive on mobile
- [ ] All buttons are touch-friendly
- [ ] Navigation works smoothly

### **Additional Pages:**
- [ ] Membership page loads with test banner
- [ ] Contact form accepts and validates input
- [ ] Gallery, About, Programs pages load correctly
- [ ] No broken links or 404 errors

---

## 🎉 **Success Indicators**

### **You'll know everything is working when:**
✅ **All donation buttons** open Donorbox forms in test mode
✅ **No real charges** can be processed (test mode active)
✅ **Mobile experience** is smooth and responsive
✅ **Navigation flows** work intuitively
✅ **Console shows** success messages, not errors

---

## 📞 **Next Steps After Testing**

Once you complete this testing and everything works:

1. **Set up real Donorbox campaigns** (DONORBOX_SETUP_GUIDE.md)
2. **Configure email integration** (EMAIL_SETUP_GUIDE.md)
3. **Complete full website testing** (TEST_CHECKLIST.md)
4. **Switch to production mode** and deploy

---

## 🚀 **Ready to Test!**

**Start with Step 1** and work through each section systematically. The current setup is completely safe for testing - no real charges will occur in test mode.

**Current Status:** ✅ Test mode active, all safety measures in place
