# Live Stripe Deployment Checklist ✅

## Pre-Deployment Testing

- [ ] All payments tested in test mode ✅ (Currently working)
- [ ] Campaign sync working properly ✅ (Running successfully)
- [ ] Error handling and validation working ✅ (Enhanced security in place)

## Stripe Dashboard Setup

- [ ] **Get Live Secret Key**: Go to Stripe Dashboard → Developers → API Keys → Secret key (starts with `sk_live_...`)
- [ ] **Set up Webhooks**:
  - Go to Stripe Dashboard → Developers → Webhooks
  - Add endpoint: `https://your-domain.com/api/stripe/webhook`
  - Select events: `payment_intent.succeeded`, `checkout.session.completed`, `invoice.payment_succeeded`
  - Copy webhook signing secret (starts with `whsec_...`)

## Environment Configuration

- [x] **Copy live publishable key**: `pk_live_51Rw9JfEUygl8L6JLw9zLcZEESyWFK8rH7eB8TAG56jyW3iF3YPr22iLaRhSi6hPPHmWAmD9jY5zBHUhecOZHSN5000Ecx69uyZ` ✅
- [x] **Add live secret key**: `sk_live_51Rw9JfEUygl8L6JL...` ✅ **CONFIGURED**
- [ ] **Add webhook secret** (from webhook setup)
- [ ] **Set test mode to false**: `NEXT_PUBLIC_STRIPE_TEST_MODE=false`

## Deployment Platform Setup

### For Vercel:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add all variables from `.env.production.template`
4. Deploy your project

### For Netlify:

1. Go to Site settings → Environment variables
2. Add all variables from `.env.production.template`
3. Deploy your project

## Security Verification

- [ ] **Never commit live keys to git** ⚠️
- [ ] **Test a small donation first** ($1-5)
- [ ] **Monitor Stripe Dashboard** for live transactions
- [ ] **Set up email notifications** in Stripe for failed payments

## Current Status

✅ **Development Environment**: Secure with test keys
✅ **Security Validation**: Live key detection working
✅ **Enhanced Configuration**: 15+ new donation-optimized settings
✅ **Test Page**: Available at `/stripe-live-test`

## Next Actions Needed

1. **Get your Stripe secret key** (most important)
2. **Set up webhooks** (for payment confirmations)
3. **Configure production environment variables**
4. **Deploy and test with a small donation**

## Support

- Check `/stripe-live-test` page for configuration validation
- Review `STRIPE_LIVE_SETUP.md` for detailed instructions
- All security warnings will appear in the test page
