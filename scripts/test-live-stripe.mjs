import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log('✅ Loaded .env.local');
} else {
  console.warn('⚠️  .env.local not found');
}

async function testStripeLive() {
  console.log('\n🔍 Starting Stripe Live Connection Test...');
  console.log('==========================================');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const liveMode = process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE === 'true';

  console.log(`📡 Mode: ${liveMode ? 'LIVE' : 'TEST'}`);
  console.log(`🔑 Publishable Key: ${publishableKey ? publishableKey.substring(0, 10) + '...' : 'MISSING'}`);
  console.log(`🔐 Secret Key: ${secretKey ? secretKey.substring(0, 10) + '...' : 'MISSING'}`);

  if (!secretKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY is missing in environment.');
    return;
  }

  if (liveMode && !secretKey.startsWith('sk_live_')) {
    console.error('❌ Error: Live mode enabled but secret key does not start with sk_live_');
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-04-10',
    });

    console.log('⏳ Connecting to Stripe API...');
    
    // Test connectivity by retrieving account details
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connection Successful!`);
    console.log(`🏢 Account: ${account.business_profile?.name || account.email || account.id}`);
    console.log(`🌍 Country: ${account.country}`);
    console.log(`💰 Default Currency: ${account.default_currency?.toUpperCase()}`);
    
    // Check balance
    const balance = await stripe.balance.retrieve();
    console.log(`💳 Balance Available: ${balance.available[0]?.amount / 100} ${balance.available[0]?.currency.toUpperCase()}`);

    console.log('\n✨ All systems look good for live payments!');
  } catch (error) {
    console.error('\n❌ Stripe Connection Failed:');
    if (error.code === 'api_key_expired') {
      console.error('   Your Stripe API Key has EXPIRED.');
    } else if (error.type === 'StripeAuthenticationError') {
      console.error('   Invalid API Key provided.');
    } else {
      console.error(`   ${error.message}`);
    }
    console.log('\n💡 Tip: Log in to your Stripe Dashboard -> Developers -> API Keys to get fresh keys.');
  }
}

testStripeLive();
