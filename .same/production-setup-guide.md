# 🚀 Production Setup Guide - Analytics & Donations

## 📊 Google Analytics 4 Setup

### Step 1: Create Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Create Account: "Haitian Family Relief Project"
4. Property Name: "HFRP Website"
5. Country: "United States"
6. Currency: "US Dollar"
7. Business Category: "Non-profit Organization"

### Step 2: Setup Enhanced Ecommerce for Donations
1. Go to Admin > Property > Data Streams
2. Click "Web" stream
3. Enable Enhanced Ecommerce
4. Configure Goals:
   - Goal 1: Contact Form Submission
   - Goal 2: Donation Button Click
   - Goal 3: Newsletter Signup
   - Goal 4: Program Page View

### Step 3: Get Measurement ID
1. In Admin > Property > Data Streams
2. Click on your web stream
3. Copy the Measurement ID (format: G-XXXXXXXXXX)
4. Replace in .env.production:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID
   ```

### Step 4: Verify Tracking
1. Install Google Analytics Debugger extension
2. Visit your website
3. Check Real-time reports in GA4
4. Verify custom events are firing:
   - `donate_button_click`
   - `contact_form_submit`
   - `page_view`
   - `gallery_image_view`

## 💰 Donorbox Campaign Setup

### Step 1: Create Donorbox Account
1. Go to [Donorbox.org](https://donorbox.org/)
2. Sign up with HFRP organization details
3. Verify your nonprofit status (501c3 documentation)
4. Complete account verification

### Step 2: Create Main Campaign
1. Click "Create Campaign"
2. Campaign Details:
   - **Campaign Name**: "Haitian Family Relief Project - General Fund"
   - **URL**: haitian-family-relief-project (will become: donorbox.org/haitian-family-relief-project)
   - **Goal Amount**: $50,000 (annual goal)
   - **Currency**: USD

### Step 3: Configure Campaign Settings
```yaml
Basic Settings:
  Campaign Title: "Support Families in Haiti"
  Description: "Help us provide food, healthcare, education, and shelter to families in need"
  Featured Image: Upload HFRP hero image
  Campaign Type: "Ongoing"

Donation Settings:
  Suggested Amounts: [$15, $50, $100, $250]
  Default Amount: $15
  Minimum Amount: $5
  Allow Custom Amount: Yes
  Recurring Options: [Monthly, Quarterly, Annually]
  Default Frequency: Monthly

Payment Options:
  Credit Cards: ✓ Enabled
  PayPal: ✓ Enabled
  Apple Pay: ✓ Enabled
  Google Pay: ✓ Enabled
  Bank Transfer: ✓ Enabled (if available)

Donor Information:
  Required Fields: [Name, Email]
  Optional Fields: [Phone, Address, Employer]
  Anonymous Donations: ✓ Allowed
  Comments: ✓ Enabled
```

### Step 4: Create Specialized Campaigns

#### Daily Giving Campaign
```yaml
Campaign Name: "50¢ Daily Giving - HFRP"
URL: hfrp-daily-giving
Monthly Amount: $15 (50¢ x 30 days)
Focus: "Just 50¢ a day provides meals for children"
```

#### Emergency Response Campaign
```yaml
Campaign Name: "HFRP Emergency Response Fund"
URL: hfrp-emergency-response
Focus: "Rapid response to natural disasters and crises"
Goal: $25,000
```

#### Education Program Campaign
```yaml
Campaign Name: "Education for Every Child - HFRP"
URL: hfrp-education-program
Focus: "School supplies, tuition, and educational support"
Suggested Amounts: [$30, $100, $500] (school supplies, semester fees, full year)
```

### Step 5: Update Environment Variables
Replace in `.env.production`:
```bash
# Main campaign for general donations
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=haitian-family-relief-project

# Specialized campaign IDs
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=hfrp-daily-giving
NEXT_PUBLIC_DONORBOX_EMERGENCY_CAMPAIGN=hfrp-emergency-response
NEXT_PUBLIC_DONORBOX_EDUCATION_CAMPAIGN=hfrp-education-program
```

### Step 6: Configure Donorbox Integration
1. **Webhook Setup** (for donation notifications):
   ```
   Webhook URL: https://haitianfamilyrelief.org/api/donorbox-webhook
   Events: donation.completed, donation.refunded
   ```

2. **Thank You Page**:
   ```
   Redirect URL: https://haitianfamilyrelief.org/thank-you
   ```

3. **Email Templates**:
   - Customize donation receipt emails
   - Add HFRP branding and contact information
   - Include tax-deductible information

## 🔐 Security & Compliance Setup

### Step 1: SSL Certificate
- Ensure HTTPS is enabled on domain
- Verify SSL certificate is valid
- Test secure connections to Donorbox

### Step 2: Privacy Policy & Terms
1. Create comprehensive privacy policy
2. Include Google Analytics data collection notice
3. Add Donorbox payment processing terms
4. Link from website footer

### Step 3: Nonprofit Compliance
1. Display GuideStar/Charity Navigator badges
2. Include EIN (Tax ID) on website
3. Provide annual report download
4. Display board of directors information

## 📈 Enhanced Analytics Setup

### Custom Dimensions in GA4
1. **Donation Amount Category**:
   - Micro: $1-$50
   - Standard: $51-$250
   - Major: $251+

2. **User Journey Stage**:
   - Visitor, Engaged, Donor, Repeat Donor

3. **Program Interest**:
   - Feeding, Healthcare, Education, Housing

### Enhanced Ecommerce Events
```javascript
// Donation Intent Tracking
gtag('event', 'begin_checkout', {
  currency: 'USD',
  value: donationAmount,
  items: [{
    item_id: 'donation',
    item_name: 'HFRP Donation',
    category: 'Charitable Giving',
    quantity: 1,
    price: donationAmount
  }]
});

// Donation Completion
gtag('event', 'purchase', {
  transaction_id: 'txn_' + Date.now(),
  value: donationAmount,
  currency: 'USD',
  items: [{
    item_id: 'donation_completed',
    item_name: 'HFRP Donation Completed',
    category: 'Charitable Giving',
    quantity: 1,
    price: donationAmount
  }]
});
```

## 🌐 Netlify Environment Variables Setup

### Required Environment Variables
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID

# Donorbox Campaigns
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=haitian-family-relief-project
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=hfrp-daily-giving
NEXT_PUBLIC_DONORBOX_EDUCATION_CAMPAIGN=hfrp-education-program

# Resend Email API
RESEND_API_KEY=re_YOUR_RESEND_API_KEY
RESEND_FROM_EMAIL=noreply@haitianfamilyrelief.org
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org

# Security
NEXTAUTH_SECRET=your-32-character-secret-key
NEXT_PUBLIC_SITE_URL=https://haitianfamilyrelief.org

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_DONATION_TEST_MODE=false
```

### Setting Variables in Netlify
1. Go to Site Settings > Environment Variables
2. Click "Add Variable"
3. Enter variable name and value
4. Click "Save"
5. Redeploy site to apply changes

## 📊 Testing & Validation

### Analytics Testing Checklist
- [ ] GA4 receives pageviews
- [ ] Custom events fire correctly
- [ ] Ecommerce events track donations
- [ ] Real-time reports show data
- [ ] Goals are properly configured

### Donation Testing Checklist
- [ ] Test donations work in production
- [ ] Payment methods function correctly
- [ ] Receipt emails are sent
- [ ] Thank you page displays
- [ ] Analytics track donation events

### Performance Testing
- [ ] Core Web Vitals pass
- [ ] Page load speeds < 3 seconds
- [ ] Mobile performance optimized
- [ ] CDN delivery works properly

## 🚨 Launch Readiness Checklist

### Pre-Launch (Required)
- [ ] Google Analytics 4 configured and tested
- [ ] Donorbox campaigns created and verified
- [ ] Environment variables set in Netlify
- [ ] SSL certificate active and valid
- [ ] Contact form working with Resend API
- [ ] Privacy policy and terms published
- [ ] All photos uploaded and displaying
- [ ] Mobile responsiveness verified

### Post-Launch (First Week)
- [ ] Monitor donation functionality daily
- [ ] Check analytics data accuracy
- [ ] Test contact form submissions
- [ ] Monitor site performance metrics
- [ ] Verify all links work correctly
- [ ] Check social media integration
- [ ] Monitor error logs and fix issues

### Ongoing (Monthly)
- [ ] Review analytics reports
- [ ] Analyze donation patterns
- [ ] Update content as needed
- [ ] Monitor site security
- [ ] Backup data and configurations
- [ ] Update dependencies and packages

## 📞 Support Contacts

### Technical Support
- **Netlify Support**: [Netlify Help](https://docs.netlify.com/)
- **Donorbox Support**: support@donorbox.org
- **Google Analytics Help**: [GA4 Documentation](https://support.google.com/analytics/)
- **Resend Support**: [Resend Documentation](https://resend.com/docs)

### Emergency Contacts
- **Domain Registrar**: [Contact info]
- **Hosting Provider**: Netlify (support@netlify.com)
- **Payment Processor**: Donorbox (support@donorbox.org)
- **Developer Contact**: [Your contact information]

---

✅ **Production Setup Complete**: Check this when all services are configured and tested in production.
