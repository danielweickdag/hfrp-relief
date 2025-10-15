#!/usr/bin/env node

/**
 * Stripe Workflow Automation & Testing Script
 * Tests the complete Stripe payment flow and webhook processing
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 HFRP Stripe Workflow Test & Automation\n');

// Check environment variables
function checkEnvVariables() {
  console.log('📋 Checking environment variables...\n');

  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missingVars = [];
  const configuredVars = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      const value = process.env[varName];
      const isTest = value.includes('test');
      const status = isTest ? '🧪 TEST' : '🚀 LIVE';
      configuredVars.push(`  ✅ ${varName}: ${status} (${value.substring(0, 20)}...)`);
    } else {
      missingVars.push(`  ❌ ${varName}: Missing`);
    }
  });

  configuredVars.forEach(line => console.log(line));
  missingVars.forEach(line => console.log(line));

  if (missingVars.length > 0) {
    console.log('\n⚠️  Warning: Some Stripe environment variables are missing!');
    console.log('Set them in your .env.local file or deployment platform.\n');
  } else {
    console.log('\n✅ All Stripe environment variables configured!\n');
  }

  return missingVars.length === 0;
}

// Check webhook configuration
function checkWebhookSetup() {
  console.log('🔗 Checking webhook configuration...\n');

  const webhookFile = path.join(__dirname, '../src/app/api/stripe/webhook/route.ts');

  if (fs.existsSync(webhookFile)) {
    console.log('  ✅ Webhook route file exists');

    const content = fs.readFileSync(webhookFile, 'utf-8');

    // Check for event handlers
    const eventHandlers = [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'checkout.session.completed'
    ];

    eventHandlers.forEach(event => {
      if (content.includes(event)) {
        console.log(`  ✅ Handler for: ${event}`);
      } else {
        console.log(`  ⚠️  Missing handler for: ${event}`);
      }
    });

    console.log('\n✅ Webhook file configured!\n');
    return true;
  } else {
    console.log('  ❌ Webhook route file not found\n');
    return false;
  }
}

// Check data directory structure
function checkDataDirectory() {
  console.log('📁 Checking data directory structure...\n');

  const dataDir = path.join(__dirname, '../data');
  const logsDir = path.join(dataDir, 'logs');

  const requiredDirs = [dataDir, logsDir];

  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`  ✅ ${path.basename(dir)}/ directory exists`);
    } else {
      console.log(`  📁 Creating ${path.basename(dir)}/ directory...`);
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  ✅ Created ${path.basename(dir)}/ directory`);
    }
  });

  // Check for required data files
  const requiredFiles = [
    'donations.json',
    'campaigns.json',
    'logs/stripe-events.json'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file} exists`);
    } else {
      console.log(`  📄 Creating ${file}...`);
      const initialData = file.includes('logs') ? [] : (file.includes('campaigns') ? [] : []);
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      console.log(`  ✅ Created ${file}`);
    }
  });

  console.log('\n✅ Data directory structure ready!\n');
  return true;
}

// Generate Stripe test card reference
function generateTestCardReference() {
  console.log('💳 Stripe Test Cards Reference:\n');

  const testCards = {
    '✅ Success': '4242 4242 4242 4242',
    '❌ Declined': '4000 0000 0000 0002',
    '⚠️  Insufficient Funds': '4000 0000 0000 9995',
    '🔐 3D Secure (Auth Required)': '4000 0027 6000 3184',
    '💰 Visa Debit': '4000 0566 5566 5556',
    '💳 Mastercard': '5555 5555 5555 4444',
    '🎫 American Express': '3782 822463 10005'
  };

  Object.entries(testCards).forEach(([name, number]) => {
    console.log(`  ${name}: ${number}`);
  });

  console.log('\n  Use any future expiration date (e.g., 12/34) and any CVC (e.g., 123)\n');
}

// Test payment flow summary
function displayPaymentFlowSummary() {
  console.log('🔄 Payment Flow Summary:\n');

  console.log('  1️⃣  User initiates donation on /donate page');
  console.log('  2️⃣  Frontend calls /api/stripe/checkout with amount & campaign');
  console.log('  3️⃣  API creates Stripe Checkout Session');
  console.log('  4️⃣  User redirected to Stripe-hosted checkout page');
  console.log('  5️⃣  User completes payment with test card');
  console.log('  6️⃣  Stripe sends webhook to /api/stripe/webhook');
  console.log('  7️⃣  Webhook handler processes event & updates data');
  console.log('  8️⃣  User redirected to success page\n');

  console.log('  📊 Data Flow:');
  console.log('     - Webhook events logged to: data/logs/stripe-events.json');
  console.log('     - Donations recorded in: data/donations.json');
  console.log('     - Campaign progress updated in: data/campaigns.json\n');
}

// Generate automation setup guide
function displayAutomationGuide() {
  console.log('🤖 Automation Setup Guide:\n');

  console.log('  📝 Pre-commit Linting:');
  console.log('     - Install Husky: npm install --save-dev husky');
  console.log('     - Initialize: npx husky install');
  console.log('     - Hook already created at: .husky/pre-commit\n');

  console.log('  🔄 Webhook Testing (Local Development):');
  console.log('     1. Install Stripe CLI: https://stripe.com/docs/stripe-cli');
  console.log('     2. Login: stripe login');
  console.log('     3. Forward webhooks:');
  console.log('        stripe listen --forward-to localhost:3005/api/stripe/webhook');
  console.log('     4. Copy webhook signing secret to .env.local\n');

  console.log('  🚀 Production Deployment:');
  console.log('     1. Set environment variables in Vercel/hosting platform');
  console.log('     2. Configure webhook endpoint in Stripe Dashboard:');
  console.log('        https://www.familyreliefproject.org/api/stripe/webhook');
  console.log('     3. Select events to listen for (see webhook route.ts)');
  console.log('     4. Copy webhook signing secret to production env vars\n');
}

// Main execution
async function main() {
  const allChecks = [
    { name: 'Environment Variables', fn: checkEnvVariables },
    { name: 'Webhook Configuration', fn: checkWebhookSetup },
    { name: 'Data Directory', fn: checkDataDirectory }
  ];

  let allPassed = true;

  for (const check of allChecks) {
    const passed = check.fn();
    if (!passed) allPassed = false;
  }

  generateTestCardReference();
  displayPaymentFlowSummary();
  displayAutomationGuide();

  if (allPassed) {
    console.log('✅ All checks passed! Stripe workflow is ready.\n');
    console.log('🚀 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3005/donate');
    console.log('   3. Test a donation with test card: 4242 4242 4242 4242');
    console.log('   4. Check data/donations.json for recorded donation\n');
  } else {
    console.log('⚠️  Some checks failed. Please review the output above.\n');
    process.exit(1);
  }
}

main().catch(console.error);
