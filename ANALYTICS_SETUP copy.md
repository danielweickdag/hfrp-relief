# 📊 Donation Analytics Setup Guide - HFRP

## Overview
Comprehensive tracking setup for donation events, conversion optimization, and donor behavior analysis.

## 🎯 Current Analytics Implementation

### Google Analytics 4 Configuration
- **Measurement ID**: `G-XXXXXXXXXX` (placeholder)
- **Enhanced Ecommerce**: Configured for donation tracking
- **Custom Events**: Donation-specific event tracking
- **Conversion Goals**: Donation completion tracking

### Event Tracking Structure

#### 1. Donation Button Clicks
```javascript
gtag('event', 'donate_button_click', {
  event_category: 'Donations',
  event_label: 'campaign_variant',
  value: amount || 0,
  currency: 'USD',
  custom_parameters: {
    donation_type: 'one_time' | 'recurring',
    amount_category: 'micro' | 'standard' | 'major',
    page_source: 'homepage' | 'donate_page' | 'program_page'
  }
});
```

#### 2. Daily Giving Specific Events
```javascript
// 50¢ Daily Button Click
gtag('event', 'daily_giving_selected', {
  event_category: 'Daily Giving',
  event_label: '50_cents_daily',
  value: 15, // Monthly equivalent
  currency: 'USD',
  daily_amount: 0.50,
  monthly_equivalent: 15
});
```

#### 3. Amount Category Tracking
```javascript
// Categorize donations by size
const categorizeAmount = (amount) => {
  if (amount <= 50) return 'micro_donation';
  if (amount <= 250) return 'standard_donation';
  return 'major_donation';
};
```

## 🔧 Enhanced Tracking Implementation

### 1. Donation Funnel Analysis

#### Stage 1: Page Visit
- **Event**: `page_view`
- **Page**: `/donate`
- **Parameters**: `source`, `medium`, `campaign`

#### Stage 2: Button Interaction
- **Event**: `donation_intent`
- **Trigger**: Hover over donation button >2 seconds
- **Purpose**: Measure consideration rate

#### Stage 3: Form Open
- **Event**: `donation_form_opened`
- **Trigger**: Donorbox iframe loads
- **Parameters**: `amount`, `type`, `source_button`

#### Stage 4: Form Completion
- **Event**: `donation_completed`
- **Trigger**: Return from successful donation
- **Parameters**: Full donation details

### 2. A/B Testing Framework

#### Test Variants
```javascript
// Daily amount testing
const dailyAmountTests = {
  'test_a': ['16¢', '33¢', '50¢', '66¢'],
  'test_b': ['25¢', '50¢', '75¢', '$1'],
  'test_c': ['33¢', '50¢', '66¢', '$1']
};

// Button color testing
const buttonColorTests = {
  'variant_a': 'gradient_orange',
  'variant_b': 'solid_red',
  'variant_c': 'gradient_blue'
};
```

#### Implementation
```javascript
// Assign user to test variant
const assignTestVariant = () => {
  const userId = getUserId();
  const variant = hash(userId) % 3;
  return `variant_${['a', 'b', 'c'][variant]}`;
};

// Track test participation
gtag('event', 'ab_test_assigned', {
  test_name: 'daily_amounts_v1',
  variant: assignTestVariant(),
  user_id: getUserId()
});
```

### 3. Donation Success Tracking

#### Return URL Configuration
```javascript
// Configure Donorbox return URL
const donorboxReturnUrl = `${window.location.origin}/donation-success?campaign=${campaignId}&amount=${amount}&type=${recurring ? 'recurring' : 'one_time'}`;
```

#### Success Page Analytics
```javascript
// /donation-success page
const trackDonationSuccess = () => {
  const urlParams = new URLSearchParams(window.location.search);

  gtag('event', 'purchase', {
    transaction_id: urlParams.get('transaction_id'),
    value: parseFloat(urlParams.get('amount')),
    currency: 'USD',
    items: [{
      item_id: urlParams.get('campaign'),
      item_name: 'Donation',
      category: 'Charitable Giving',
      quantity: 1,
      price: parseFloat(urlParams.get('amount'))
    }]
  });
};
```

## 📈 Custom Metrics & KPIs

### 1. Donation Metrics
- **Conversion Rate**: Visitors → Donors
- **Average Donation**: Mean donation amount
- **Daily Giving Adoption**: % choosing recurring
- **Mobile Conversion**: Mobile vs Desktop success

### 2. Daily Giving Specific KPIs
- **50¢ Selection Rate**: % choosing 50¢ daily option
- **Daily vs One-Time**: Preference distribution
- **Monthly Value**: Recurring donation MRR
- **Retention Rate**: Monthly donor continuation

### 3. User Experience Metrics
- **Button Click Rate**: CTR for each amount
- **Form Abandonment**: % who open but don't complete
- **Mobile Experience**: Mobile-specific conversion rates
- **Page Load Impact**: Speed correlation with conversion

## 🎯 Dashboard Configuration

### Google Analytics 4 Custom Reports

#### 1. Donation Overview Dashboard
```json
{
  "name": "HFRP Donation Overview",
  "metrics": [
    "totalRevenue",
    "conversions",
    "eventCount"
  ],
  "dimensions": [
    "eventName",
    "customEvent:donation_type",
    "customEvent:amount_category"
  ],
  "dateRanges": ["last30Days", "previousPeriod"]
}
```

#### 2. Daily Giving Performance
```json
{
  "name": "Daily Giving Analysis",
  "filters": {
    "eventName": "daily_giving_selected"
  },
  "metrics": [
    "eventCount",
    "totalRevenue",
    "conversions"
  ],
  "dimensions": [
    "customEvent:daily_amount",
    "deviceCategory",
    "source"
  ]
}
```

### 3. Conversion Funnel Report
```json
{
  "name": "Donation Funnel",
  "steps": [
    {"event": "page_view", "page": "/donate"},
    {"event": "donation_intent"},
    {"event": "donation_form_opened"},
    {"event": "purchase"}
  ],
  "breakdowns": ["deviceCategory", "source", "medium"]
}
```

## 🔍 Advanced Analytics Features

### 1. Heat Map Integration
```javascript
// Hotjar or similar heat mapping
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    // Implementation for donation page heat mapping
})();
```

### 2. User Session Recording
- **Target Pages**: `/donate`, `/`
- **Trigger Events**: Donation button interactions
- **Privacy**: Mask payment information
- **Analysis**: Identify UX friction points

### 3. Cohort Analysis
```javascript
// Track donor cohorts by first donation date
const trackDonorCohort = (donorId, firstDonationDate) => {
  gtag('event', 'donor_cohort_assignment', {
    donor_id: donorId,
    cohort_month: formatCohortMonth(firstDonationDate),
    donor_type: 'new' | 'returning'
  });
};
```

## 🚀 Implementation Checklist

### Phase 1: Basic Tracking (Complete)
- [x] Google Analytics 4 setup
- [x] Donation button click tracking
- [x] Amount parameter tracking
- [x] Device category tracking

### Phase 2: Enhanced Analytics
- [ ] Donation funnel analysis
- [ ] A/B testing framework
- [ ] Success page tracking
- [ ] Custom dashboard creation

### Phase 3: Advanced Features
- [ ] Heat map integration
- [ ] User session recording
- [ ] Cohort analysis setup
- [ ] Predictive analytics

### Phase 4: Optimization
- [ ] Conversion rate optimization
- [ ] Mobile experience enhancement
- [ ] Personalization features
- [ ] AI-driven recommendations

## 📊 Data Export & Reporting

### 1. Automated Reports
```javascript
// Weekly donation summary
const weeklyReport = {
  total_donations: getTotalDonations('week'),
  daily_giving_rate: getDailyGivingRate('week'),
  average_amount: getAverageAmount('week'),
  top_performing_button: getTopButton('week')
};
```

### 2. Donor Journey Analysis
```sql
-- Example BigQuery export query
SELECT
  user_pseudo_id,
  event_timestamp,
  event_name,
  event_parameters.value.string_value as donation_amount,
  device.category as device_type
FROM `project.analytics.events_*`
WHERE event_name IN ('donate_button_click', 'purchase')
ORDER BY user_pseudo_id, event_timestamp;
```

## 🔐 Privacy & Compliance

### 1. GDPR Compliance
- **Data Minimization**: Only collect necessary metrics
- **User Consent**: Clear opt-in for analytics
- **Data Retention**: Automatic deletion after 26 months
- **Access Rights**: Provide data export capabilities

### 2. Cookie Management
```javascript
// Cookie consent integration
const cookieConsent = {
  analytics: false,
  marketing: false,
  functional: true
};

// Conditional tracking based on consent
if (cookieConsent.analytics) {
  initializeGoogleAnalytics();
}
```

## 🎯 Success Targets

### Month 1 Goals
- **Conversion Rate**: 2.5% visitors → donors
- **Daily Giving Rate**: 30% of donations recurring
- **Mobile Conversion**: 1.8% mobile visitors → donors
- **Average Donation**: $45 one-time, $18 recurring

### Quarter 1 Goals
- **Total Donations**: $50,000 quarterly
- **Donor Acquisition**: 500 new donors
- **Daily Giving Growth**: 40% recurring rate
- **Mobile Optimization**: 2.2% mobile conversion

---

## 📞 Analytics Support

**Technical Implementation:**
- Google Analytics 4 setup assistance
- Custom event tracking configuration
- Dashboard creation and maintenance

**Data Analysis:**
- Monthly performance reviews
- Conversion optimization recommendations
- A/B testing design and analysis

**Reporting:**
- Weekly donation summaries
- Monthly trend analysis
- Quarterly strategic insights
