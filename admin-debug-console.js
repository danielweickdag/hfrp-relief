#!/usr/bin/env node

// Admin Debug Console - Check for client-side errors
const puppeteer = require("puppeteer");

async function debugAdminPanel() {
  let browser;
  try {
    console.log("🔍 Launching browser to debug admin panel...");

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Capture console messages
    const consoleMessages = [];
    page.on("console", (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
      });
    });

    // Capture network errors
    const networkErrors = [];
    page.on("requestfailed", (request) => {
      networkErrors.push({
        url: request.url(),
        error: request.failure().errorText,
        timestamp: new Date().toISOString(),
      });
    });

    // Capture page errors
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    });

    console.log("📡 Navigating to admin panel...");
    await page.goto("http://localhost:3001/admin", {
      waitUntil: "networkidle2",
      timeout: 10000,
    });

    // Wait for React to mount
    await page.waitForTimeout(3000);

    console.log("\n📊 DEBUG REPORT");
    console.log("================");

    // Check page title and basic content
    const title = await page.title();
    console.log(`✅ Page Title: ${title}`);

    // Check if admin login form is present
    const hasLoginForm = (await page.$("form")) !== null;
    console.log(`🔐 Login Form Present: ${hasLoginForm}`);

    // Check for React root
    const hasReactRoot = await page.evaluate(() => {
      return (
        document.querySelector("[data-reactroot]") !== null ||
        document.querySelector("#__next") !== null ||
        document.querySelector("#root") !== null
      );
    });
    console.log(`⚛️  React App Mounted: ${hasReactRoot}`);

    // Console messages
    console.log("\n📝 CONSOLE MESSAGES:");
    if (consoleMessages.length === 0) {
      console.log("  ✅ No console messages");
    } else {
      consoleMessages.forEach((msg, index) => {
        const icon =
          msg.type === "error" ? "❌" : msg.type === "warning" ? "⚠️" : "📄";
        console.log(`  ${icon} [${msg.type.toUpperCase()}] ${msg.text}`);
      });
    }

    // Network errors
    console.log("\n🌐 NETWORK ERRORS:");
    if (networkErrors.length === 0) {
      console.log("  ✅ No network errors");
    } else {
      networkErrors.forEach((error, index) => {
        console.log(`  ❌ ${error.url}: ${error.error}`);
      });
    }

    // Page errors
    console.log("\n🚨 PAGE ERRORS:");
    if (pageErrors.length === 0) {
      console.log("  ✅ No page errors");
    } else {
      pageErrors.forEach((error, index) => {
        console.log(`  ❌ ${error.message}`);
        if (error.stack) {
          console.log(`     Stack: ${error.stack.split("\n")[0]}`);
        }
      });
    }

    // Check for hydration issues
    const hydrationWarnings = consoleMessages.filter(
      (msg) =>
        msg.text.toLowerCase().includes("hydration") ||
        msg.text.toLowerCase().includes("server") ||
        msg.text.toLowerCase().includes("client")
    );

    if (hydrationWarnings.length > 0) {
      console.log("\n💧 HYDRATION ISSUES:");
      hydrationWarnings.forEach((warning) => {
        console.log(`  ⚠️  ${warning.text}`);
      });
    }

    // Take a screenshot for debugging
    await page.screenshot({
      path: "/Users/blvckdlphn/projects/hfrp-relief/admin-debug-screenshot.png",
      fullPage: true,
    });
    console.log("\n📸 Screenshot saved: admin-debug-screenshot.png");

    console.log("\n✨ Debug complete!");
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if puppeteer is available
debugAdminPanel().catch(console.error);
