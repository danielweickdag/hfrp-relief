# 🧪 Stripe Testing Guide - HFRP

## 🎯 Overview

Comprehensive testing guide for the new Stripe payment integration to ensure everything works perfectly before going live.

## 📋 Pre-Testing Checklist

### Environment Setup

- [ ] **Stripe Account**: Test account created and verified
- [ ] **API Keys**: Test keys configured in `.env.local`
- [ ] **Dependencies**: All Stripe packages installed
- [ ] **Components**: StripeButton components created
- [ ] **Dev Server**: Development server running successfully

### Required Test Cards

```
✅ Success Card: 4242 4242 4242 4242
✅ Declined Card: 4000 0000 0000 0002
✅ Insufficient Funds: 4000 0000 0000 9995
✅ 3D Secure: 4000 0025 0000 3155
✅ Visa Debit: 4000 0566 5566 5556
✅ Mastercard: 5555 5555 5555 4444
✅ American Express: 3782 822463 10005
```

## 🔧 Component Testing

### 1. StripeButton Component Tests

#### Test 1.1: Basic Button Rendering

```bash
# Navigate to any page with StripeButton
http://localhost:3000

Expected Results:
✅ Button displays correctly
✅ TEST badge visible in test mode
✅ Campaign information shows
✅ "Secured by Stripe" badge appears
```

#### Test 1.2: One-time Donations

```bash
# Test different amounts
- Click $25 donation button
- Click $50 donation button
- Click $100 donation button
- Click $250 donation button

Expected Results:
✅ Checkout session creates successfully
✅ Correct amount pre-filled
✅ Campaign metadata included
✅ Success/cancel URLs configured
```

#### Test 1.3: Recurring Donations

```bash
# Test subscription creation
- Click monthly recurring buttons
- Test yearly recurring options
- Verify subscription intervals

Expected Results:
✅ Subscription mode activated
✅ Correct recurring interval
✅ Subscription metadata included
✅ Customer portal accessible
```

### 2. Campaign Integration Tests

#### Test 2.1: Multiple Campaigns

```bash
# Test different campaign IDs
- HFRP General Fund: hfrp-general-fund
- Daily Giving: hfrp-daily-giving
- Emergency Relief: hfrp-emergency-relief

Expected Results:
✅ Correct campaign loads
✅ Campaign-specific amounts
✅ Proper goal tracking
✅ Campaign metadata passed
```

#### Test 2.2: Custom Amounts

```bash
# Test custom donation amounts
- Enter $15 custom amount
- Enter $500 custom amount
- Test minimum amount validation
- Test maximum amount validation

Expected Results:
✅ Custom amounts accepted
✅ Validation works correctly
✅ Proper error messages
✅ Amount formatting correct
```

## 💳 Payment Flow Testing

### 3. Checkout Process Tests

#### Test 3.1: Successful Payments

```bash
# Use success test card: 4242 4242 4242 4242
1. Click donation button
2. Enter test card details
3. Complete checkout process
4. Verify success page loads

Expected Results:
✅ Checkout session opens
✅ Payment processes successfully
✅ Redirects to success page
✅ Transaction details display
✅ Thank you message shows
```

#### Test 3.2: Failed Payments

```bash
# Use declined test card: 4000 0000 0000 0002
1. Click donation button
2. Enter declined test card
3. Attempt payment

Expected Results:
✅ Payment decline handled gracefully
✅ Error message displayed
✅ User can retry payment
✅ No successful transaction created
```

#### Test 3.3: 3D Secure Authentication

```bash
# Use 3D Secure test card: 4000 0025 0000 3155
1. Click donation button
2. Enter 3D Secure test card
3. Complete authentication

Expected Results:
✅ 3D Secure challenge appears
✅ Authentication flow works
✅ Payment completes after auth
✅ Success page loads
```

### 4. Subscription Testing

#### Test 4.1: Subscription Creation

```bash
# Test monthly recurring donation
1. Click monthly recurring button
2. Complete payment with test card
3. Verify subscription created

Expected Results:
✅ Subscription created in Stripe
✅ Customer record created
✅ First payment processed
✅ Subscription status active
```

#### Test 4.2: Subscription Management

```bash
# Test customer portal access
1. Create subscription
2. Access customer portal
3. Update payment method
4. Cancel subscription

Expected Results:
✅ Portal accessible
✅ Payment method updates
✅ Cancellation works
✅ Status updates correctly
```

## 🕸️ Webhook Testing

### 5. Webhook Event Handling

#### Test 5.1: Payment Events

```bash
# Monitor webhook endpoints
- payment_intent.succeeded
- payment_intent.payment_failed
- payment_method.attached

Expected Results:
✅ Webhooks received correctly
✅ Event data processed
✅ Database updates triggered
✅ Notifications sent
```

#### Test 5.2: Subscription Events

```bash
# Monitor subscription webhooks
- customer.subscription.created
- invoice.payment_succeeded
- customer.subscription.deleted

Expected Results:
✅ Subscription events handled
✅ Recurring payment processing
✅ Cancellation events processed
✅ Customer notifications sent
```

## 📱 Mobile Testing

### 6. Mobile Payment Tests

#### Test 6.1: Mobile Responsive Design

```bash
# Test on different devices
- iPhone Safari
- Android Chrome
- iPad Safari
- Android tablet

Expected Results:
✅ Buttons render correctly
✅ Checkout flow works
✅ Touch interactions smooth
✅ Form inputs accessible
```

#### Test 6.2: Mobile Wallets

```bash
# Test mobile payment methods
- Apple Pay (iOS Safari)
- Google Pay (Android Chrome)
- Samsung Pay (Samsung Internet)

Expected Results:
✅ Mobile wallets appear
✅ Biometric authentication works
✅ Payment completes successfully
✅ Success page loads properly
```

## 🌍 International Testing

### 7. Currency and Region Tests

#### Test 7.1: Multiple Currencies

```bash
# Test different currencies (if enabled)
- USD donations
- EUR donations
- CAD donations

Expected Results:
✅ Currency displays correctly
✅ Amounts format properly
✅ Exchange rates accurate
✅ Local payment methods available
```

#### Test 7.2: International Cards

```bash
# Test international test cards
- European cards
- Canadian cards
- UK cards

Expected Results:
✅ International cards accepted
✅ Proper address validation
✅ Currency conversion works
✅ Local regulations followed
```

## 🔒 Security Testing

### 8. Security and Validation Tests

#### Test 8.1: Input Validation

```bash
# Test edge cases
- Negative amounts
- Zero amounts
- Extremely large amounts
- Invalid characters

Expected Results:
✅ Proper validation messages
✅ No security vulnerabilities
✅ Sanitized inputs
✅ Error handling graceful
```

#### Test 8.2: API Security

```bash
# Test API endpoints
- Invalid API keys
- Missing parameters
- Malformed requests

Expected Results:
✅ Proper authentication
✅ Error responses secure
✅ No sensitive data exposed
✅ Rate limiting works
```

## 📊 Analytics Testing

### 9. Tracking and Analytics

#### Test 9.1: Event Tracking

```bash
# Verify analytics events
- stripe_checkout_started
- donation_completed
- subscription_created

Expected Results:
✅ Events fire correctly
✅ Proper event data
✅ Google Analytics integration
✅ Custom analytics working
```

#### Test 9.2: Conversion Tracking

```bash
# Test conversion funnels
- Button click → Checkout
- Checkout → Payment
- Payment → Success

Expected Results:
✅ Full funnel tracking
✅ Conversion rate data
✅ Drop-off point identification
✅ Performance metrics accurate
```

## 🚨 Error Handling Tests

### 10. Error Scenarios

#### Test 10.1: Network Issues

```bash
# Simulate network problems
- Slow network connections
- Intermittent connectivity
- Complete network failure

Expected Results:
✅ Graceful error handling
✅ Retry mechanisms work
✅ User feedback provided
✅ No data loss occurs
```

#### Test 10.2: Stripe Service Issues

```bash
# Test service unavailability
- Stripe API downtime
- Rate limiting responses
- Invalid webhook signatures

Expected Results:
✅ Fallback mechanisms activate
✅ User notifications clear
✅ Service recovery automatic
✅ Data integrity maintained
```

## ✅ Testing Checklist

### Pre-Launch Verification

- [ ] All test cards working
- [ ] Success/cancel pages functional
- [ ] Webhook endpoints responding
- [ ] Mobile experience smooth
- [ ] Analytics tracking correctly
- [ ] Error handling robust
- [ ] Security validations passing
- [ ] Performance acceptable

### Performance Benchmarks

- [ ] **Page Load**: < 3 seconds
- [ ] **Checkout Time**: < 30 seconds
- [ ] **Mobile Response**: < 2 seconds
- [ ] **Webhook Processing**: < 5 seconds

### User Experience Goals

- [ ] **Conversion Rate**: > Current Donorbox rate
- [ ] **Error Rate**: < 1% of transactions
- [ ] **Mobile Usage**: Works on 95%+ devices
- [ ] **International**: Supports key markets

## 🎯 Go-Live Checklist

### Final Steps Before Production

1. **Switch to Live API Keys**

   ```env
   NEXT_PUBLIC_STRIPE_TEST_MODE=false
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

2. **Configure Live Webhooks**
   - Production endpoint URLs
   - Live webhook signing secrets
   - Event type subscriptions

3. **Update Success/Cancel URLs**
   - Production domain URLs
   - HTTPS certificates valid
   - Proper redirects configured

4. **Monitor Launch**
   - Real-time transaction monitoring
   - Error rate tracking
   - User feedback collection
   - Performance metrics

## 📞 Support and Troubleshooting

### Common Issues and Solutions

**Issue**: Checkout not opening
**Solution**: Check API keys and network connectivity

**Issue**: Webhooks not received
**Solution**: Verify endpoint URL and webhook secret

**Issue**: Mobile payments failing
**Solution**: Test on actual devices, check mobile wallet setup

**Issue**: Currency formatting wrong
**Solution**: Verify locale settings and currency configuration

### Debug Mode

```javascript
// Enable detailed logging
localStorage.setItem("stripe_debug", "true");

// Check configuration
console.log(enhancedStripeService.validateConfig());

// Test webhook processing
console.log(enhancedStripeService.getTestCards());
```

## 🎉 Success Metrics

### Key Performance Indicators

- **Conversion Rate**: Target 25%+ improvement
- **Transaction Success**: 99%+ success rate
- **Load Time**: 50%+ faster than Donorbox
- **Mobile Conversion**: 30%+ improvement
- **International Donations**: 50%+ increase

**Testing completed? Ready for production! 🚀**
