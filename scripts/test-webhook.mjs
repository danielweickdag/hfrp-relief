import crypto from 'node:crypto';
import http from 'node:http';

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3005/api/stripe/webhook';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'whsec_mW029MFkUQcdu8oZSyCIZcCZNB6t0GwG';
const DEV_BYPASS = process.env.DEV_BYPASS === '1';
const ACCOUNT_ID = process.env.ACCOUNT_ID || '';

// Minimal realistic Stripe event payload
const now = Math.floor(Date.now() / 1000);
const event = {
  id: `evt_test_${Date.now()}`,
  type: 'checkout.session.completed',
  api_version: '2024-11-20',
  created: now,
  ...(ACCOUNT_ID ? { account: ACCOUNT_ID } : {}),
  data: {
    object: {
      id: `cs_test_${Date.now()}`,
      customer: `cus_test_${Date.now()}`,
      payment_intent: `pi_test_${Date.now()}`,
      amount_total: 2500,
      currency: 'usd',
    },
  },
};

const payload = JSON.stringify(event);

// Stripe signature: HMAC-SHA256 of `${t}.${payload}` with webhook secret
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(`${now}.${payload}`)
  .digest('hex');

const stripeSignatureHeader = `t=${now},v1=${signature}`;

const req = http.request(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Stripe-Signature': stripeSignatureHeader,
    'X-Debug-Signature': '1',
    ...(DEV_BYPASS ? { 'X-Dev-Bypass-Signature': '1' } : {}),
  },
}, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
  process.exitCode = 1;
});

req.write(payload);
req.end();