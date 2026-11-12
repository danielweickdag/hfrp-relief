#!/usr/bin/env node

// Simple Stripe Transaction Viewer
// Usage: node transaction-viewer.js

import https from 'https';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is not set.');
  process.exit(1);
}

function makeStripeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      path: endpoint,
      method: 'GET',
      auth: STRIPE_SECRET_KEY + ':'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function formatAmount(amount, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

async function viewTransactions() {
  try {
    console.log('🏦 HAITIAN FAMILY RELIEF PROJECT - STRIPE TRANSACTIONS\n');
    
    const charges = await makeStripeRequest('/v1/charges?limit=10');
    
    if (charges.data.length === 0) {
      console.log('No transactions found.');
      return;
    }

    console.log(`📊 Showing ${charges.data.length} recent transactions:\n`);
    
    charges.data.forEach((charge, index) => {
      console.log(`${index + 1}. Transaction ID: ${charge.id}`);
      console.log(`   💰 Amount: ${formatAmount(charge.amount, charge.currency)}`);
      console.log(`   📅 Date: ${formatDate(charge.created)}`);
      console.log(`   ✅ Status: ${charge.status.toUpperCase()}`);
      console.log(`   💳 Payment: ${charge.payment_method_details?.card?.brand?.toUpperCase() || 'N/A'} ****${charge.payment_method_details?.card?.last4 || 'N/A'}`);
      console.log(`   📧 Customer: ${charge.customer || 'Guest'}`);
      console.log(`   📄 Description: ${charge.description || 'Donation'}`);
      if (charge.receipt_url) {
        console.log(`   🧾 Receipt: ${charge.receipt_url}`);
      }
      console.log('   ' + '─'.repeat(50));
    });

    // Summary
    const totalAmount = charges.data.reduce((sum, charge) => {
      return charge.status === 'succeeded' ? sum + charge.amount : sum;
    }, 0);
    
    const successfulCharges = charges.data.filter(c => c.status === 'succeeded').length;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Successful Transactions: ${successfulCharges}`);
    console.log(`   Total Amount: ${formatAmount(totalAmount)}`);
    console.log(`   Has More Transactions: ${charges.has_more ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error fetching transactions:', error.message);
  }
}

// Run the viewer
viewTransactions();