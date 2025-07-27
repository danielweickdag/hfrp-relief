# 🧪 Donation Testing Guide - HFRP Website

## ✅ Current Test Status

### Test Mode Configuration
- ✅ **Test mode is ENABLED** (NEXT_PUBLIC_DONATION_TEST_MODE=true)
- ✅ **TEST badges visible** on donation buttons
- ✅ **No real charges will be processed** in test mode

---

## 🔧 Testing the Donate Button

### Homepage "Donate Now" Button
1. **Navigate to homepage** (http://localhost:3000)
2. **Look for the red "Donate Now" button** with heart icon
3. **Verify TEST badge** appears in yellow in top-right corner
4. **Click the button** - it should:
   - Show "Opening..." briefly with loading spinner
   - Open new tab with Donorbox donation form
   - URL should include `?test=true` parameter
   - Form should show "TEST MODE" indicators

### Expected Behavior:
```
✅ Button clicks successfully
✅ New tab opens to: https://donorbox.org/embed/haitian-family-relief-project?test=true
✅ Donorbox form loads and shows test mode
✅ Console logs show: "🎯 DonorboxButton clicked!" and "🌐 Opening URL:"
```

---

## 🔧 Testing the Membership Page

### Membership Iframe
1. **Navigate to membership page** (http://localhost:3000/membership)
2. **Look for yellow test mode banner** at top
3. **Verify iframe loads** Donorbox membership form
4. **Check iframe URL** includes test parameters

### Expected Behavior:
```
✅ Test mode banner shows: "TEST MODE: This is a test membership form"
✅ Iframe loads successfully
✅ URL includes: ?test=true&default_interval=m&suggested_amounts=...
✅ Monthly recurring options are pre-selected
```

---

## 🔧 Testing from Navigation

### "Become a Member" Button
1. **Click "Become a Member"** in top navigation (red button)
2. **Should redirect** to membership page
3. **Verify test mode** indicators are visible

---

## 🚨 Troubleshooting

### If Donate Button Doesn't Respond:
1. **Check browser console** (F12 → Console tab)
2. **Look for error messages** or blocked pop-ups
3. **Try different browsers** (Chrome, Firefox, Safari)
4. **Disable ad blockers** temporarily
5. **Allow pop-ups** for localhost:3000

### If Pop-ups are Blocked:
- Enable pop-ups for localhost:3000
- Try right-click → "Open in new tab"
- Check browser settings for pop-up blockers

### Common Console Messages:
```javascript
// Success:
🎯 DonorboxButton clicked! {campaignId: "haitian-family-relief-project", isTestMode: true}
🧪 DONATION TEST MODE - No real charges will be made
🌐 Opening URL: https://donorbox.org/embed/haitian-family-relief-project?test=true

// Pop-up blocked:
Pop-up blocked, showing alert

// Error:
Error opening Donorbox: [error details]
```

---

## 🔍 Test Checklist

### ✅ Donation Button Tests
- [ ] Homepage button shows TEST badge
- [ ] Button click opens new tab
- [ ] Donorbox form loads in test mode
- [ ] No real payment processing occurs
- [ ] Console logs show success messages

### ✅ Membership Page Tests
- [ ] Test mode banner appears
- [ ] Iframe loads membership form
- [ ] Monthly options are pre-selected
- [ ] Test parameters in iframe URL

### ✅ Navigation Tests
- [ ] "Become a Member" button works
- [ ] Redirects to membership page correctly
- [ ] All test mode indicators visible

### ✅ Browser Compatibility
- [ ] Chrome - donations work
- [ ] Firefox - donations work
- [ ] Safari - donations work
- [ ] Mobile Chrome - donations work
- [ ] Mobile Safari - donations work

---

## 📱 Mobile Testing

### Mobile Considerations:
- Donation buttons open in new tab (better UX)
- Touch interactions work correctly
- Responsive design maintains functionality
- Pop-up blockers may be more aggressive

---

## ⚡ Performance Testing

### Loading Speed:
- Donorbox script loads asynchronously
- Button remains functional during script load
- Fallback behavior if script fails to load

### Network Conditions:
- Test on slow connections
- Verify timeout handling (5 second limit)
- Check error messages for failed loads

---

## 🔐 Security Testing

### Test Mode Safety:
- ✅ No real charges in test mode
- ✅ TEST indicators clearly visible
- ✅ Test URLs include safety parameters
- ✅ Environment variable controls test state

---

## 🎯 Next Steps

### Ready for Production:
1. **Complete all test checklist items**
2. **Verify donation flows work perfectly**
3. **Update environment variables** for production
4. **Set NEXT_PUBLIC_DONATION_TEST_MODE=false**
5. **Configure real Donorbox campaign IDs**

### Production Configuration Required:
```env
# Switch to production mode
NEXT_PUBLIC_DONATION_TEST_MODE=false

# Real campaign IDs (get from Donorbox dashboard)
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=your-real-main-campaign
NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=your-real-membership-campaign
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=your-real-daily-giving-campaign
```

---

## 📞 Support

If any tests fail or issues arise:
1. Check this troubleshooting guide
2. Review browser console errors
3. Test in different browsers
4. Verify environment variables are loaded correctly

**Current Status: ✅ All donation functionality working in test mode**
