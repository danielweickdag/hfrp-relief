#!/usr/bin/env node

/**
 * HFRP Radio Stream Diagnostic Tool
 * Tests radio stream connectivity and troubleshoots common issues
 */

const https = require("https");
const http = require("http");

console.log("🔍 HFRP Radio Stream Diagnostic Tool");
console.log("=====================================");

const STREAM_URL = "https://stream.zeno.fm/ttq4haexcf9uv";
const WEBPAGE_URL = "https://zeno.fm/radio/fgm-radio-haiti/";

// Test 1: Check if stream URL is accessible
async function testStreamURL() {
  console.log("\n📡 Testing Stream URL...");
  console.log(`URL: ${STREAM_URL}`);

  return new Promise((resolve) => {
    const startTime = Date.now();

    const req = https.request(STREAM_URL, { method: "HEAD" }, (res) => {
      const responseTime = Date.now() - startTime;

      console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`⏱️  Response Time: ${responseTime}ms`);

      if (res.headers.location) {
        console.log(`🔗 Redirects to: ${res.headers.location}`);
      }

      if (res.headers["content-type"]) {
        console.log(`📦 Content-Type: ${res.headers["content-type"]}`);
      }

      resolve({
        success: res.statusCode === 302 || res.statusCode === 200,
        statusCode: res.statusCode,
        responseTime,
        location: res.headers.location,
      });
    });

    req.on("error", (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log(`❌ Timeout after 10 seconds`);
      req.destroy();
      resolve({ success: false, error: "Timeout" });
    });

    req.end();
  });
}

// Test 2: Check if we can follow the redirect
async function testStreamRedirect(redirectUrl) {
  if (!redirectUrl) return { success: false, error: "No redirect URL" };

  console.log("\n🔄 Testing Stream Redirect...");
  console.log(`Redirect URL: ${redirectUrl}`);

  return new Promise((resolve) => {
    const startTime = Date.now();

    const req = https.request(redirectUrl, { method: "HEAD" }, (res) => {
      const responseTime = Date.now() - startTime;

      console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`⏱️  Response Time: ${responseTime}ms`);

      if (res.headers["content-type"]) {
        console.log(`📦 Content-Type: ${res.headers["content-type"]}`);
      }

      resolve({
        success: res.statusCode === 200,
        statusCode: res.statusCode,
        responseTime,
        contentType: res.headers["content-type"],
      });
    });

    req.on("error", (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log(`❌ Timeout after 10 seconds`);
      req.destroy();
      resolve({ success: false, error: "Timeout" });
    });

    req.end();
  });
}

// Test 3: Check webpage accessibility
async function testWebpage() {
  console.log("\n🌐 Testing Station Webpage...");
  console.log(`URL: ${WEBPAGE_URL}`);

  return new Promise((resolve) => {
    const startTime = Date.now();

    const req = https.request(WEBPAGE_URL, { method: "HEAD" }, (res) => {
      const responseTime = Date.now() - startTime;

      console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`⏱️  Response Time: ${responseTime}ms`);

      resolve({
        success: res.statusCode === 200,
        statusCode: res.statusCode,
        responseTime,
      });
    });

    req.on("error", (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(5000, () => {
      console.log(`❌ Timeout after 5 seconds`);
      req.destroy();
      resolve({ success: false, error: "Timeout" });
    });

    req.end();
  });
}

// Test 4: DNS Resolution
async function testDNS() {
  console.log("\n🌍 Testing DNS Resolution...");

  const dns = require("dns");
  const { promisify } = require("util");
  const lookup = promisify(dns.lookup);

  try {
    const result = await lookup("stream.zeno.fm");
    console.log(`✅ stream.zeno.fm resolves to: ${result.address}`);
    console.log(`📋 Address family: IPv${result.family}`);
    return { success: true, address: result.address };
  } catch (err) {
    console.log(`❌ DNS Error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log(`🕐 Started at: ${new Date().toISOString()}\n`);

  const results = {
    dns: await testDNS(),
    webpage: await testWebpage(),
    stream: await testStreamURL(),
  };

  // Test redirect if available
  if (results.stream.success && results.stream.location) {
    results.redirect = await testStreamRedirect(results.stream.location);
  }

  // Summary
  console.log("\n📊 DIAGNOSTIC SUMMARY");
  console.log("====================");

  console.log(
    `🌍 DNS Resolution: ${results.dns.success ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `🌐 Station Webpage: ${results.webpage.success ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `📡 Stream URL: ${results.stream.success ? "✅ PASS" : "❌ FAIL"}`
  );

  if (results.redirect) {
    console.log(
      `🔄 Stream Redirect: ${results.redirect.success ? "✅ PASS" : "❌ FAIL"}`
    );
  }

  // Recommendations
  console.log("\n💡 RECOMMENDATIONS");
  console.log("==================");

  if (results.stream.success) {
    console.log("✅ Stream URL is working correctly");
    console.log("✅ Radio should play in browser");

    if (results.redirect && results.redirect.success) {
      console.log("✅ Stream redirect is working");
      console.log("✅ Audio format appears to be supported");
    }
  } else {
    console.log("❌ Stream URL is not accessible");
    console.log("💭 Possible causes:");
    console.log("   - Stream is offline");
    console.log("   - Network connectivity issues");
    console.log("   - Firewall blocking the connection");
  }

  if (!results.dns.success) {
    console.log("❌ DNS resolution failed");
    console.log("💭 Check your internet connection");
  }

  if (!results.webpage.success) {
    console.log("❌ Station webpage not accessible");
    console.log("💭 May indicate broader connectivity issues");
  }

  console.log("\n🔧 TROUBLESHOOTING TIPS");
  console.log("=======================");
  console.log("1. Ensure browser allows audio playback");
  console.log("2. Check if audio is not muted");
  console.log("3. Try refreshing the page");
  console.log("4. Test with different browser");
  console.log("5. Check network firewall settings");

  console.log(`\n🕐 Completed at: ${new Date().toISOString()}`);
}

// Run diagnostics
runDiagnostics().catch(console.error);
