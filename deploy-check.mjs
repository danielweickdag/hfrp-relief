#!/usr/bin/env node

/**
 * HFRP Deployment Verification Script
 * Run this after deployment to verify everything is working
 */

import http from 'node:http';
import https from 'node:https';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const VERCEL_BYPASS_TOKEN = process.env.VERCEL_BYPASS_TOKEN || '';

console.log('🚀 HFRP Deployment Verification Starting...\n');

// Test pages to verify
const testPages = [
  '/',
  '/about',
  '/donate', 
  '/contact',
  '/programs',
  '/gallery',
  '/blog'
];

// API endpoints to test
const apiEndpoints = [
  '/api/contact'
];

async function testPage(url) {
  return new Promise((resolve) => {
    const requestUrl = `${SITE_URL}${url}`;
    console.log(`Testing: ${requestUrl}`);

    const options = new URL(requestUrl);
    const client = options.protocol === 'https:' ? https : http;
    if (VERCEL_BYPASS_TOKEN) {
      options.headers = {
        'x-vercel-protection-bypass': VERCEL_BYPASS_TOKEN,
      };
    }

    const request = client.get(options, (res) => {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`  ✅ Status: ${res.statusCode} ${success ? '(OK)' : '(ERROR)'}`);
      resolve({ url, status: res.statusCode, success });
    });
    
    request.on('error', (err) => {
      console.log(`  ❌ Error: ${err.message}`);
      resolve({ url, status: 0, success: false, error: err.message });
    });
    
    request.setTimeout(10000, () => {
      console.log(`  ⏰ Timeout`);
      request.destroy();
      resolve({ url, status: 0, success: false, error: 'Timeout' });
    });
  });
}

async function checkEnvironmentVariables() {
  console.log('\n📋 Environment Variables Check:');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN',
    'EMAIL_SERVICE'
  ];
  
  const optionalEnvVars = [
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'RESEND_API_KEY',
    'NEXTAUTH_SECRET'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`  ✅ ${envVar}: Set`);
    } else {
      console.log(`  ❌ ${envVar}: Missing (Required)`);
    }
  });
  
  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`  ✅ ${envVar}: Set`);
    } else {
      console.log(`  ⚠️  ${envVar}: Not set (Optional)`);
    }
  });
}

async function checkBuildFiles() {
  console.log('\n📁 Build Files Check:');
  
  const buildFiles = [
    '.next/BUILD_ID',
    '.next/static',
    'package.json',
    'netlify.toml'
  ];
  
  buildFiles.forEach(file => {
    const exists = existsSync(path.join(__dirname, file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}: ${exists ? 'Exists' : 'Missing'}`);
  });
}

async function runTests() {
  console.log('\n🌐 Testing Pages:');
  const pageResults = [];
  
  for (const page of testPages) {
    const result = await testPage(page);
    pageResults.push(result);
  }
  
  console.log('\n🔧 Testing API Endpoints:');
  // Note: POST requests need special handling for contact form
  console.log('  ℹ️  API endpoints require manual testing with form submission');
  
  checkEnvironmentVariables();
  checkBuildFiles();
  
  console.log('\n📊 Summary:');
  const successfulPages = pageResults.filter(r => r.success).length;
  const totalPages = pageResults.length;
  
  console.log(`  Pages working: ${successfulPages}/${totalPages}`);
  
  if (successfulPages === totalPages) {
    console.log('\n🎉 All tests passed! Your HFRP site is ready!');
    console.log('\n📝 Next steps:');
    console.log('  1. Test donation flow manually');
    console.log('  2. Submit contact form test');
    console.log('  3. Verify email notifications');
    console.log('  4. Check mobile responsiveness');
    console.log('  5. Run Lighthouse audit');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
  }
  
  console.log('\n🔍 Manual Testing Checklist:');
  console.log('  □ Donation buttons redirect to Donorbox');
  console.log('  □ Contact form sends emails');
  console.log('  □ Social media links work');
  console.log('  □ Images load properly');
  console.log('  □ Mobile navigation works');
  console.log('  □ Analytics tracking active');
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runTests().catch(console.error);
}

export { testPage, checkEnvironmentVariables, checkBuildFiles };