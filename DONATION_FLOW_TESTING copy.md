# 🎯 Donation Flow Testing Guide - HFRP

## Test Environment Setup
- **Test Mode**: Currently ACTIVE (shows TEST badges)
- **Environment Variable**: `NEXT_PUBLIC_DONATION_TEST_MODE=true`
- **Campaign ID**: `hfrp-haiti-relief-fund`
- **Base URL**: `https://donorbox.org/embed/`

## 🧪 Test Scenarios

### 1. One-Time Donation Testing
**Test each button and verify URL parameters:**

#### $25 Button Test:
- **Click**: Blue $25 button in "Prefer a One-Time Donation?" section
- **Expected URL**: `https://donorbox.org/embed/hfrp-haiti-relief-fund?test=true&amount=25`
- **Verify**: Amount pre-filled as $25, one-time selected

#### $50 Button Test:
- **Click**: Green $50 button
- **Expected URL**: `https://donorbox.org/embed/hfrp-haiti-relief-fund?test=true&amount=50`
- **Verify**: Amount pre-filled as $50, one-time selected

#### $100 Button Test:
- **Click**: Orange $100 button
- **Expected URL**: `https://donorbox.org/embed/hfrp-haiti-relief-fund?test=true&amount=100`
- **Verify**: Amount pre-filled as $100, one-time selected

#### $250 Button Test:
- **Click**: Red $250 button
- **Expected URL**: `https://donorbox.org/embed/hfrp-haiti-relief-fund?test=true&amount=250`
- **Verify**: Amount pre-filled as $250, one-time selected

#### Custom Amount Test:
- **Click**: "Choose Custom Amount" button
- **Expected URL**: `https://donorbox.org/embed/hfrp-haiti-relief-fund?test=true`
- **Verify**: No pre-filled amount, user can enter custom value

### 2. Monthly Recurring Donation Testing

#### 50¢ Daily (Monthly) Test:
- **Click**: "Give 50¢ Daily - Start Monthly Support" button
- **Expected URL**: `https://donorbox.org/embed/hfrp-haiti-relief-fund?test=true&amount=15&recurring=true`
- **Verify**: Amount shows $15, recurring monthly selected

### 3. Visual Testing Checklist

#### Button Appearance:
- [ ] All buttons show yellow "TEST" badges
- [ ] Button colors match design (blue, green, orange, red)
- [ ] Hover effects work properly
- [ ] Loading states display correctly
- [ ] Mobile responsiveness verified

#### Page Layout:
- [ ] No "Donate Now - Any Amount" button in hero
- [ ] No "Our Impact in Numbers" section
- [ ] No "See Your Impact in Action" section
- [ ] No "Monthly Recurring: $15/month" text in 50¢ section
- [ ] Donation button appears before impact description in 50¢ card

### 4. User Experience Testing

#### Navigation Flow:
- [ ] Homepage "Donate" header button → /donate page
- [ ] /donate page loads quickly
- [ ] All sections render properly
- [ ] Page is mobile-friendly

#### Error Handling:
- [ ] Pop-up blocker message appears if needed
- [ ] Console shows proper logging
- [ ] Failed donations show user-friendly errors

### 5. Analytics Testing

#### Event Tracking:
- [ ] Google Analytics events fire on button clicks
- [ ] Campaign tracking includes correct parameters
- [ ] Amount values logged correctly

## 🔧 Browser Testing Matrix

### Desktop Browsers:
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)

### Mobile Browsers:
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Samsung Internet
- [ ] Firefox Mobile

## 📊 Production Readiness Checklist

### Pre-Production Setup:
- [ ] Set `NEXT_PUBLIC_DONATION_TEST_MODE=false`
- [ ] Verify real Donorbox campaign ID
- [ ] Test with real payment methods (small amounts)
- [ ] Confirm email notifications work
- [ ] Verify tax receipt generation

### Security Verification:
- [ ] HTTPS enabled for all donation flows
- [ ] No sensitive data in URLs
- [ ] Proper iframe security headers
- [ ] Cross-origin resource sharing configured

### Performance Testing:
- [ ] Page load time < 3 seconds
- [ ] Button click response < 1 second
- [ ] Mobile performance optimized
- [ ] Images properly compressed

## 🚨 Known Issues & Workarounds

### Browser Compatibility:
- **Pop-up blockers**: Users may need to allow pop-ups
- **Ad blockers**: May block Donorbox script loading
- **Solution**: Clear error messages and retry options

### Mobile Considerations:
- **iOS Safari**: May require user gesture for pop-ups
- **Android Chrome**: Tab switching behavior
- **Solution**: Test thoroughly on real devices

## 📈 Success Metrics

### Conversion Tracking:
- **Button clicks** → Donorbox page loads
- **Page loads** → Payment form completion
- **Form completion** → Successful donations

### User Experience Goals:
- **< 2 clicks** to start donation process
- **Clear messaging** about daily giving impact
- **Seamless flow** from selection to payment

---

## 🎯 Quick Test Commands

```bash
# Start development server
cd hfrp-relief && bun run dev

# Test donation page
curl -s http://localhost:3000/donate | grep -i "donate\|test"

# Check for JavaScript errors
# Open browser console and click donation buttons
```

## 📞 Support Information

**For technical issues:**
- Check browser console for errors
- Verify network connectivity
- Test with different browsers
- Contact: Technical Support Team

**For donation questions:**
- Test mode: No real charges
- Production mode: Real payment processing
- Contact: HFRP Support Team
