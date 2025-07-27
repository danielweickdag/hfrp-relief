# HFRP Website Testing Guide

## 🧪 Pre-Production Testing Checklist

### **1. Donation Functionality Testing**

#### Test Payment Flow (IMPORTANT: Use Test Mode)
1. **Set Test Mode**: Ensure `NEXT_PUBLIC_DONATION_TEST_MODE=true` in your environment
2. **Homepage Donation Button**:
   - [ ] Click "Donate Now" button
   - [ ] Verify Donorbox form opens (popup or new tab)
   - [ ] Test with different amounts: $25, $50, $100, custom amount
   - [ ] Test both one-time and monthly recurring options
   - [ ] Verify form loads correctly on mobile devices

3. **Donate Page Testing**:
   - [ ] Navigate to `/donate` page
   - [ ] Test multiple donation buttons with different campaigns
   - [ ] Verify suggested amounts display correctly
   - [ ] Test emergency donation vs. monthly giving buttons

4. **Cross-Browser Testing**:
   - [ ] Chrome (desktop & mobile)
   - [ ] Safari (desktop & mobile)
   - [ ] Firefox
   - [ ] Edge
   - [ ] Test with ad blockers enabled

#### Expected Results
- ✅ Test mode indicator should show on buttons
- ✅ No real charges should be processed
- ✅ Analytics should track button clicks
- ✅ Fallback should work if popup is blocked

---

### **2. Team Review Process**

#### Review Page Testing
1. **Access Review Page**: Navigate to `/review`
2. **Team Review Workflow**:
   - [ ] Review all 18 content/functionality items
   - [ ] Test approval/rejection buttons
   - [ ] Add feedback notes for items needing revision
   - [ ] Verify progress tracking updates correctly
   - [ ] Test quick navigation links to all pages

#### Content Review Items
- [ ] **Homepage**: Mission statement, messaging, video
- [ ] **About Page**: Organization details and accuracy
- [ ] **Gallery**: All 18 authentic images display correctly
- [ ] **Programs**: Healthcare, Feeding, Education, Shelter descriptions
- [ ] **Contact Information**: Phone, email, address accuracy
- [ ] **Testimonials**: Authentic voices from Haiti beneficiaries

---

### **3. Analytics Tracking Verification**

#### Setup Google Analytics
1. **Get Measurement ID**: From Google Analytics dashboard
2. **Set Environment Variable**: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
3. **Deploy with Analytics**: Restart server after setting variable

#### Test Event Tracking
1. **Donation Tracking**:
   - [ ] Click donation buttons
   - [ ] Verify events in GA Real-Time reports
   - [ ] Check for `donate_button_click` events

2. **Gallery Tracking**:
   - [ ] Click gallery images
   - [ ] Verify `gallery_image_view` events
   - [ ] Test category filtering

3. **Contact Form Tracking**:
   - [ ] Submit contact form
   - [ ] Verify `contact_form_submit` events

4. **Page View Tracking**:
   - [ ] Navigate between pages
   - [ ] Verify page views with correct categories

#### Analytics Console Verification
```javascript
// Open browser console and test:
window.hfrpAnalytics.trackDonation(50, 'USD', 'test');
window.hfrpAnalytics.trackContactSubmit();
window.hfrpAnalytics.trackGalleryView('test-image', 'healthcare');
```

---

### **4. Mobile Responsiveness Testing**

#### Device Testing Matrix
| Device Type | Screen Sizes | Test Areas |
|-------------|--------------|------------|
| Mobile Phone | 320px - 480px | Navigation, forms, images |
| Tablet | 768px - 1024px | Gallery grid, testimonials |
| Desktop | 1024px+ | Full functionality |

#### Mobile-Specific Tests
1. **Navigation**:
   - [ ] Hamburger menu works on mobile
   - [ ] All pages accessible
   - [ ] Touch targets are adequate size

2. **Gallery**:
   - [ ] Images load with lazy loading
   - [ ] Grid adjusts: 1 col (mobile) → 2 col (tablet) → 3-4 col (desktop)
   - [ ] Image modal works on touch devices

3. **Forms**:
   - [ ] Contact form is touch-friendly
   - [ ] Donation buttons work on mobile
   - [ ] Validation messages display properly

4. **Performance**:
   - [ ] Video background optimized for mobile
   - [ ] Slow connection warning appears on 2G/3G
   - [ ] Images load progressively

---

### **5. Cross-Browser Compatibility**

#### Browser Test Matrix
- [ ] **Chrome** (Windows, Mac, Android, iOS)
- [ ] **Safari** (Mac, iOS)
- [ ] **Firefox** (Windows, Mac)
- [ ] **Edge** (Windows)
- [ ] **Samsung Internet** (Android)

#### Feature Testing Per Browser
1. **Video Background**:
   - [ ] Autoplay works (with fallback for restrictions)
   - [ ] Video loads on slow connections
   - [ ] Fallback background displays if video fails

2. **Donation Buttons**:
   - [ ] Donorbox integration works
   - [ ] Popup/redirect fallbacks function
   - [ ] Test mode indicators display

3. **Forms**:
   - [ ] Contact form submission
   - [ ] Field validation
   - [ ] Error messages

---

### **6. Performance Testing**

#### Speed Testing Tools
1. **Google PageSpeed Insights**: Test homepage and gallery
2. **GTmetrix**: Check loading times
3. **WebPageTest**: Test from different locations

#### Performance Metrics
- [ ] **First Contentful Paint**: < 2.5s
- [ ] **Largest Contentful Paint**: < 4s
- [ ] **Cumulative Layout Shift**: < 0.1
- [ ] **Time to Interactive**: < 5s

#### Optimization Verification
- [ ] Images load lazily
- [ ] Video uses appropriate preload settings
- [ ] CSS/JS bundles are optimized
- [ ] Gallery loads efficiently with connection detection

---

### **7. Security Testing**

#### Form Security
- [ ] Contact form validates input
- [ ] No XSS vulnerabilities in form fields
- [ ] CSRF protection (if implemented)
- [ ] Rate limiting on form submissions

#### Content Security
- [ ] No exposed API keys in frontend code
- [ ] Analytics tracking doesn't expose sensitive data
- [ ] External links open safely (`noopener,noreferrer`)

---

### **8. Final Pre-Launch Checklist**

#### Content Verification
- [ ] All contact information is accurate
- [ ] Gallery contains only approved, authentic images
- [ ] Testimonials are verified and authentic
- [ ] Program descriptions are current and accurate
- [ ] No placeholder text remains

#### Technical Verification
- [ ] Environment variables configured for production
- [ ] Analytics tracking is live
- [ ] Donation buttons configured with real campaign IDs
- [ ] Contact form sends to correct email addresses
- [ ] SSL certificate is valid
- [ ] Domain DNS is properly configured

#### Legal/Compliance
- [ ] Privacy policy is current (if required)
- [ ] Terms of service updated (if applicable)
- [ ] Donation disclosures are compliant
- [ ] Image usage rights confirmed

---

### **9. Post-Launch Monitoring**

#### Week 1 Monitoring
- [ ] Monitor analytics for traffic patterns
- [ ] Check donation completion rates
- [ ] Monitor contact form submissions
- [ ] Watch for error logs or issues

#### Monthly Reviews
- [ ] Review analytics reports
- [ ] Check donation metrics
- [ ] Update content as needed
- [ ] Test all functionality monthly

---

## 🚨 **Emergency Procedures**

### If Donations Stop Working
1. Check Donorbox campaign status
2. Verify API keys and configurations
3. Test payment processor status
4. Activate backup donation methods

### If Website Goes Down
1. Check hosting service status
2. Verify DNS configuration
3. Check SSL certificate expiration
4. Activate backup/maintenance page

### Support Contacts
- **Technical Issues**: [Your technical contact]
- **Donation Issues**: [Donorbox support]
- **Analytics Issues**: [Google Analytics support]

---

## ✅ **Testing Sign-off**

| Test Category | Status | Tested By | Date | Notes |
|---------------|--------|-----------|------|-------|
| Donation Functionality | ⏳ | | | |
| Mobile Responsiveness | ⏳ | | | |
| Analytics Tracking | ⏳ | | | |
| Cross-Browser Compatibility | ⏳ | | | |
| Performance | ⏳ | | | |
| Content Accuracy | ⏳ | | | |
| Security | ⏳ | | | |

**Final Approval**: ⏳ Pending
**Ready for Production**: ⏳ Pending
**Launch Date**: ___________
