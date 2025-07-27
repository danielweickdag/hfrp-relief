# Donorbox Campaign Setup Guide - Daily Giving Focus

## 🎯 **Campaign Configuration**

### **1. Create New Donorbox Campaign**
1. **Log into Donorbox**: Go to [donorbox.org](https://donorbox.org)
2. **Create Campaign**: Click "Create Campaign"
3. **Campaign Name**: "HFRP Daily Giving - Cents That Count"
4. **Campaign URL**: Choose a memorable URL like `hfrp-daily-giving`

### **2. Campaign Settings**

#### **Basic Information**
- **Organization Name**: Haitian Family Relief Project
- **Campaign Title**: "Daily Giving - Transform Lives with Cents"
- **Campaign Description**:
  ```
  Just cents a day can transform lives in Haiti. Your daily generosity provides hope, dignity, and sustainable change for families in need. Choose from our daily giving options starting at just 16¢ per day.
  ```

#### **Suggested Donation Amounts**
Configure these amounts in Donorbox dashboard:
- **Amount 1**: $5 (represents 16¢/day option)
  - **Label**: "Daily Nutrition - 16¢/day"
- **Amount 2**: $10 (represents 33¢/day option)
  - **Label**: "Healthcare Access - 33¢/day"
- **Amount 3**: $15 (represents 50¢/day option)
  - **Label**: "Education Support - 50¢/day"
- **Amount 4**: $20 (represents 66¢/day option)
  - **Label**: "Comprehensive Care - 66¢/day"

#### **Custom Amount Settings**
- **Enable Custom Amount**: ✅ Yes
- **Minimum Amount**: $1
- **Default Amount**: $10 (33¢/day option)
- **Currency**: USD

### **3. Design Customization**

#### **Campaign Colors**
- **Primary Color**: #DC2626 (Red - matches HFRP branding)
- **Secondary Color**: #2563EB (Blue - matches website)
- **Background**: White
- **Text Color**: Dark gray

#### **Campaign Images**
Upload these images to Donorbox:
- **Header Image**: HFRP logo or Haiti family photo
- **Background Image**: Subtle pattern or Haiti landscape
- **Thank You Image**: HFRP impact photo

#### **Custom CSS (if available)**
```css
.donation-amount-label {
  font-size: 0.9em;
  color: #666;
}

.daily-giving-emphasis {
  font-weight: bold;
  color: #DC2626;
}
```

### **4. Form Configuration**

#### **Required Fields**
- ✅ **Name** (First and Last)
- ✅ **Email Address**
- ✅ **Payment Information**

#### **Optional Fields**
- **Phone Number** (optional)
- **Address** (for tax receipts)
- **Company Name** (for corporate donors)

#### **Custom Questions**
Add these custom fields:
1. **"How did you hear about our daily giving program?"**
   - Website
   - Social Media
   - Friend/Family
   - Email
   - Other

2. **"Would you like updates on your daily impact?"**
   - Yes, send me impact stories
   - No, just receipts please

### **5. Payment Processing**

#### **Payment Methods**
- ✅ **Credit/Debit Cards** (Visa, MasterCard, American Express)
- ✅ **PayPal**
- ✅ **Apple Pay** (if available)
- ✅ **Google Pay** (if available)
- ✅ **Bank Transfer** (for larger donations)

#### **Recurring Donations**
- **Enable Recurring**: ✅ Yes
- **Default Frequency**: One-time (let donors choose)
- **Available Frequencies**:
  - One-time
  - Monthly
  - Quarterly
  - Annual

### **6. Thank You Page Configuration**

#### **Thank You Message**
```
Thank You for Your Daily Giving!

Your generous gift of [AMOUNT] will make an immediate difference in Haiti.

🍽️ If you chose 16¢/day: You're providing daily nutrition for a child
🏥 If you chose 33¢/day: You're ensuring healthcare access for a family
📚 If you chose 50¢/day: You're supporting education for children
🏠 If you chose 66¢/day: You're providing comprehensive family care

Your impact starts today. Thank you for choosing to transform lives with the Haitian Family Relief Project.
```

#### **Social Sharing**
- ✅ **Enable Social Sharing**
- **Facebook Message**: "I just donated to help families in Haiti with @HaitianFamilyReliefProject! Just cents a day can transform lives. #DailyGiving #Haiti"
- **Twitter Message**: "Just donated to @HFRP_Official - daily giving starting at 16¢/day transforms lives in Haiti! #DailyGiving"

### **7. Integration Settings**

#### **Website Integration**
- **Campaign ID**: [Your campaign ID will be generated]
- **Embed Code**: Use popup integration for best UX

#### **Google Analytics**
- **Enable GA Tracking**: ✅ Yes
- **GA Tracking ID**: Use same as website (`G-XXXXXXXXXX`)
- **Event Tracking**: Enable donation completion events

### **8. Email Configuration**

#### **Receipt Email**
Customize the donation receipt email:
```
Subject: Thank you for your daily giving to HFRP!

Dear [DONOR_NAME],

Thank you for your generous donation of $[AMOUNT] to the Haitian Family Relief Project!

Your Daily Impact:
[Include specific impact based on amount chosen]

Donation Details:
- Amount: $[AMOUNT]
- Date: [DATE]
- Transaction ID: [TRANSACTION_ID]
- Tax Deductible: Yes (EIN: [YOUR_EIN])

This donation will help us continue our vital work providing nutrition, healthcare, education, and comprehensive family support in Haiti.

With gratitude,
The HFRP Team

[Include HFRP logo and contact information]
```

### **9. Testing Setup**

#### **Test Mode Configuration**
1. **Enable Test Mode** in Donorbox dashboard
2. **Use Test Credit Cards**:
   - **Visa**: 4242 4242 4242 4242
   - **MasterCard**: 5555 5555 5555 4444
   - **American Express**: 3782 822463 10005
   - **CVC**: Any 3-4 digits
   - **Expiry**: Any future date

#### **Test Scenarios**
Test these donation flows:
- [ ] 16¢/day option ($5)
- [ ] 33¢/day option ($10)
- [ ] 50¢/day option ($15)
- [ ] 66¢/day option ($20)
- [ ] Custom amount
- [ ] Recurring vs one-time
- [ ] Different payment methods

### **10. Production Launch Checklist**

#### **Before Going Live**
- [ ] Test all donation amounts in test mode
- [ ] Verify email receipts are working
- [ ] Check thank you page displays correctly
- [ ] Test on mobile devices
- [ ] Confirm analytics tracking
- [ ] Set up bank account for fund deposits

#### **Going Live**
- [ ] Disable test mode in Donorbox
- [ ] Update website environment variables:
  ```
  NEXT_PUBLIC_DONORBOX_CAMPAIGN_ID=your-real-campaign-id
  NEXT_PUBLIC_DONATION_TEST_MODE=false
  ```
- [ ] Test one small real donation
- [ ] Monitor first few donations closely

### **11. Campaign URL Structure**

Your final Donorbox URLs will be:
- **Direct Link**: `https://donorbox.org/your-campaign-id`
- **Embed Code**: For popup integration on website
- **QR Code**: Generate for offline marketing

### **12. Post-Launch Monitoring**

#### **Daily Monitoring**
- Check donation totals
- Review any failed transactions
- Monitor email delivery
- Check analytics data

#### **Weekly Reviews**
- Analyze donation patterns
- Review donor feedback
- Update impact messaging if needed
- Test campaign functionality

---

## 🔗 **Next Steps**

1. **Create Donorbox Account**: If you don't have one already
2. **Set Up Campaign**: Follow the configuration above
3. **Get Campaign ID**: You'll receive this after creation
4. **Update Website**: Replace test campaign ID with real one
5. **Test Everything**: Use test mode before going live
6. **Launch**: Switch to live mode and start accepting donations!

## 📞 **Support Resources**

- **Donorbox Support**: [support@donorbox.org](mailto:support@donorbox.org)
- **Donorbox Documentation**: [donorbox.org/help](https://donorbox.org/help)
- **Phone Support**: Available during business hours

---

**Campaign Focus**: Daily Giving - Cents That Count
**Target**: Make daily giving accessible starting at just 16¢/day
**Goal**: Emphasize immediate daily impact over long-term calculations
