#!/usr/bin/env node
import process from 'node:process';

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

// Determine mode
const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const isLive = pk.startsWith('pk_live') || process.env.NODE_ENV === 'production';

const liveSecret = (process.env.STRIPE_WEBHOOK_SECRET_LIVE || '').trim();
const testSecret = (process.env.STRIPE_WEBHOOK_SECRET_TEST || '').trim();
const fallbackSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

console.log('🔎 Webhook Environment Validation');
console.log(`Mode: ${isLive ? 'live' : 'test'} (pk=${pk ? pk.slice(0, 7) + '…' : 'none'})`);

// Bypass must not be enabled anywhere
if (process.env.ENABLE_DEV_WEBHOOK_BYPASS === 'true') {
  fail('ENABLE_DEV_WEBHOOK_BYPASS is set but bypass has been removed. Unset this variable.');
}

// Signature debug should not be enabled in production
if ((process.env.WEBHOOK_DEBUG_SIGNATURE === 'true' || process.env.WEBHOOK_DEBUG_SIGNATURE === '1') && isLive) {
  fail('WEBHOOK_DEBUG_SIGNATURE must be disabled in live/production environments');
}

if (isLive) {
  if (!liveSecret && !fallbackSecret) {
    fail('Missing STRIPE_WEBHOOK_SECRET_LIVE (or STRIPE_WEBHOOK_SECRET fallback) for live mode');
  } else {
    ok('Live webhook secret present');
  }
} else {
  if (!testSecret && !fallbackSecret) {
    fail('Missing STRIPE_WEBHOOK_SECRET_TEST (or STRIPE_WEBHOOK_SECRET fallback) for test mode');
  } else {
    ok('Test webhook secret present');
  }
}

// Connected account optional
const account = process.env.STRIPE_CONNECTED_ACCOUNT_ID || process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID || '';
if (account) {
  ok(`Connected account scoped: ${account}`);
} else {
  console.log('ℹ️ No connected account scope configured');
}

// Admin health token recommended
if (!process.env.ADMIN_HEALTH_TOKEN) {
  console.log('ℹ️ ADMIN_HEALTH_TOKEN not set; health endpoint will return 403');
} else {
  ok('ADMIN_HEALTH_TOKEN configured');
}

if (process.exitCode === 1) {
  console.error('❌ Webhook env validation failed');
  process.exit(1);
} else {
  ok('Webhook env validation passed');
}