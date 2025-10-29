#!/usr/bin/env node

/**
 * Website Health Monitoring Script for familyreliefproject7.org
 * Automated checks for uptime, SSL, performance, and functionality
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBSITE_URL = 'https://www.familyreliefproject7.org';
const BACKUP_URL = 'https://familyreliefproject7.org';
const VERCEL_URL = 'https://hfrp-relief.vercel.app';

class WebsiteMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async runAllChecks() {
    console.log('🔍 Starting Website Monitoring...');
    console.log('='.repeat(50));

    await this.checkUptime();
    await this.checkSSL();
    await this.checkPerformance();
    await this.checkFunctionality();
    await this.checkSEO();
    
    this.generateReport();
    this.saveResults();
  }

  async checkUptime() {
    console.log('\n📡 Checking Uptime...');
    
    const urls = [WEBSITE_URL, BACKUP_URL, VERCEL_URL];
    
    for (const url of urls) {
      try {
        const result = await this.makeRequest(url);
        const status = result.statusCode >= 200 && result.statusCode < 400 ? 'PASS' : 'FAIL';
        
        this.addResult('Uptime', `${url}`, status, {
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          headers: result.headers
        });

        console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${url} - ${result.statusCode} (${result.responseTime}ms)`);
      } catch (error) {
        this.addResult('Uptime', `${url}`, 'FAIL', { error: error.message });
        console.log(`  ❌ ${url} - ERROR: ${error.message}`);
      }
    }
  }

  async checkSSL() {
    console.log('\n🔒 Checking SSL Certificate...');
    
    try {
      const cert = await this.getSSLCertificate(WEBSITE_URL);
      const daysUntilExpiry = Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24));
      
      let status = 'PASS';
      if (daysUntilExpiry < 30) status = 'WARNING';
      if (daysUntilExpiry < 7) status = 'FAIL';

      this.addResult('SSL', 'Certificate Validity', status, {
        issuer: cert.issuer,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysUntilExpiry
      });

      console.log(`  ${status === 'PASS' ? '✅' : status === 'WARNING' ? '⚠️' : '❌'} Certificate expires in ${daysUntilExpiry} days`);
    } catch (error) {
      this.addResult('SSL', 'Certificate Check', 'FAIL', { error: error.message });
      console.log(`  ❌ SSL Check failed: ${error.message}`);
    }
  }

  async checkPerformance() {
    console.log('\n⚡ Checking Performance...');
    
    try {
      const start = Date.now();
      const result = await this.makeRequest(WEBSITE_URL);
      const loadTime = Date.now() - start;
      
      let status = 'PASS';
      if (loadTime > 3000) status = 'WARNING';
      if (loadTime > 5000) status = 'FAIL';

      this.addResult('Performance', 'Page Load Time', status, {
        loadTime,
        contentLength: result.headers['content-length'],
        server: result.headers['server']
      });

      console.log(`  ${status === 'PASS' ? '✅' : status === 'WARNING' ? '⚠️' : '❌'} Load time: ${loadTime}ms`);
    } catch (error) {
      this.addResult('Performance', 'Load Time Check', 'FAIL', { error: error.message });
      console.log(`  ❌ Performance check failed: ${error.message}`);
    }
  }

  async checkFunctionality() {
    console.log('\n🔧 Checking Functionality...');
    
    const endpoints = [
      { path: '/', name: 'Homepage' },
      { path: '/about', name: 'About Page' },
      { path: '/donate', name: 'Donate Page' },
      { path: '/api/health', name: 'Health API' },
      { path: '/admin', name: 'Admin Panel' }
    ];

    for (const endpoint of endpoints) {
      try {
        const url = WEBSITE_URL + endpoint.path;
        const result = await this.makeRequest(url);
        const status = result.statusCode >= 200 && result.statusCode < 400 ? 'PASS' : 'FAIL';
        
        this.addResult('Functionality', endpoint.name, status, {
          statusCode: result.statusCode,
          responseTime: result.responseTime
        });

        console.log(`  ${status === 'PASS' ? '✅' : '❌'} ${endpoint.name} - ${result.statusCode}`);
      } catch (error) {
        this.addResult('Functionality', endpoint.name, 'FAIL', { error: error.message });
        console.log(`  ❌ ${endpoint.name} - ERROR: ${error.message}`);
      }
    }
  }

  async checkSEO() {
    console.log('\n🔍 Checking SEO Elements...');
    
    try {
      const result = await this.makeRequest(WEBSITE_URL);
      const html = result.body || '';
      
      const checks = [
        { name: 'Title Tag', regex: /<title[^>]*>([^<]+)<\/title>/i },
        { name: 'Meta Description', regex: /<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i },
        { name: 'H1 Tag', regex: /<h1[^>]*>([^<]+)<\/h1>/i },
        { name: 'Canonical URL', regex: /<link[^>]*rel=["\']canonical["\'][^>]*>/i }
      ];

      for (const check of checks) {
        const found = check.regex.test(html);
        const status = found ? 'PASS' : 'WARNING';
        
        this.addResult('SEO', check.name, status, { found });
        console.log(`  ${found ? '✅' : '⚠️'} ${check.name} ${found ? 'found' : 'missing'}`);
      }
    } catch (error) {
      this.addResult('SEO', 'SEO Check', 'FAIL', { error: error.message });
      console.log(`  ❌ SEO check failed: ${error.message}`);
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'HFRP-Monitor/1.0'
        }
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            responseTime: Date.now() - start
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  getSSLCertificate(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        const cert = res.connection.getPeerCertificate();
        resolve(cert);
      });

      req.on('error', reject);
      req.end();
    });
  }

  addResult(category, test, status, details = {}) {
    this.results.checks.push({
      category,
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    });

    this.results.summary.total++;
    if (status === 'PASS') this.results.summary.passed++;
    else if (status === 'WARNING') this.results.summary.warnings++;
    else this.results.summary.failed++;
  }

  generateReport() {
    console.log('\n📊 MONITORING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Checks: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    
    const healthScore = Math.round((this.results.summary.passed / this.results.summary.total) * 100);
    console.log(`\n🏥 Health Score: ${healthScore}%`);
    
    if (this.results.summary.failed > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.results.checks
        .filter(check => check.status === 'FAIL')
        .forEach(check => {
          console.log(`  ❌ ${check.category}: ${check.test}`);
          if (check.details.error) {
            console.log(`     Error: ${check.details.error}`);
          }
        });
    }

    if (this.results.summary.warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.checks
        .filter(check => check.status === 'WARNING')
        .forEach(check => {
          console.log(`  ⚠️  ${check.category}: ${check.test}`);
        });
    }
  }

  saveResults() {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const filename = `monitoring-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(logsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to: ${filepath}`);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new WebsiteMonitor();
  monitor.runAllChecks().catch(console.error);
}

export default WebsiteMonitor;