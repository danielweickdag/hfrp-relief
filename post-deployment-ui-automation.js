#!/usr/bin/env node

/**
 * Post-Deployment UI Automation Script
 * Automates UI interactions with div elements and buttons after deployment
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PostDeploymentUIAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = process.env.DEPLOYMENT_URL || "http://localhost:3005";
    this.results = {
      timestamp: new Date().toISOString(),
      interactions: [],
      errors: [],
      success: false,
      totalInteractions: 0,
      successfulInteractions: 0,
    };
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      warning: "\x1b[33m",
      error: "\x1b[31m",
      reset: "\x1b[0m",
    };

    console.log(
      `${colors[type]}[${timestamp}] ${message}${colors.reset}`
    );
  }

  async initialize() {
    try {
      this.log("🚀 Initializing post-deployment UI automation...", "info");
      
      this.browser = await puppeteer.launch({
        headless: process.env.NODE_ENV === "production",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });

      this.page = await this.browser.newPage();
      
      // Set viewport for consistent testing
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent
      await this.page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      this.log("✅ Browser initialized successfully", "success");
      return true;
    } catch (error) {
      this.log(`❌ Failed to initialize browser: ${error.message}`, "error");
      this.results.errors.push({
        step: "initialization",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  async navigateToSite() {
    try {
      this.log(`🌐 Navigating to ${this.baseUrl}...`, "info");
      
      await this.page.goto(this.baseUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for page to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 3000));

      this.log("✅ Successfully navigated to site", "success");
      return true;
    } catch (error) {
      this.log(`❌ Failed to navigate to site: ${error.message}`, "error");
      this.results.errors.push({
        step: "navigation",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  async ensurePageReady() {
    try {
      // Check if page is still accessible
      await this.page.evaluate(() => document.readyState);
      return true;
    } catch (error) {
      this.log("🔄 Page frame detached, creating new page...", "info");
      try {
        // Create a new page instance
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 720 });
        return await this.navigateToSite();
      } catch (newPageError) {
        this.log(`❌ Failed to create new page: ${newPageError.message}`, "error");
        return false;
      }
    }
  }

  async interactWithDivElements() {
    try {
      this.log("🎯 Starting div element interactions...", "info");

      // Ensure page is ready before interactions
      if (!(await this.ensurePageReady())) {
        this.log("❌ Could not ensure page readiness", "error");
        return false;
      }

      // Find all interactive div elements
      const divElements = await this.page.$$eval("div[role='button'], div[onclick], div.cursor-pointer, div[data-testid]", 
        (elements) => {
          return elements.map((el, index) => ({
            index,
            className: el.className,
            id: el.id,
            role: el.getAttribute("role"),
            testId: el.getAttribute("data-testid"),
            text: el.textContent?.trim().substring(0, 50) || "",
            hasOnClick: !!el.onclick,
          }));
        }
      );

      this.log(`📊 Found ${divElements.length} interactive div elements`, "info");

      for (const [index, divInfo] of divElements.entries()) {
        try {
          // Ensure page is still ready before each interaction
          if (!(await this.ensurePageReady())) {
            this.log("❌ Page not ready for interaction", "error");
            break;
          }

          this.log(`🔄 Interacting with div ${index + 1}: ${divInfo.text}`, "info");
          
          // Click the div element
          await this.page.evaluate((idx) => {
            const divs = document.querySelectorAll("div[role='button'], div[onclick], div.cursor-pointer, div[data-testid]");
            if (divs[idx]) {
              divs[idx].click();
            }
          }, index);

          // Wait for any potential navigation or modal
          await new Promise(resolve => setTimeout(resolve, 2000));

          this.results.interactions.push({
            type: "div_click",
            element: divInfo,
            success: true,
            timestamp: new Date().toISOString(),
          });

          this.results.successfulInteractions++;
          this.log(`✅ Successfully interacted with div ${index + 1}`, "success");

        } catch (error) {
          this.log(`⚠️ Failed to interact with div ${index + 1}: ${error.message}`, "warning");
          this.results.interactions.push({
            type: "div_click",
            element: divInfo,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      this.results.totalInteractions += divElements.length;
      return true;
    } catch (error) {
      this.log(`❌ Error during div interactions: ${error.message}`, "error");
      this.results.errors.push({
        step: "div_interactions",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  async interactWithButtons() {
    try {
      this.log("🎯 Starting button interactions...", "info");

      // Ensure page is ready before interactions
      if (!(await this.ensurePageReady())) {
        this.log("❌ Could not ensure page readiness", "error");
        return false;
      }

      // Find all button elements
      const buttons = await this.page.$$eval("button, input[type='button'], input[type='submit']", 
        (elements) => {
          return elements.map((el, index) => ({
            index,
            tagName: el.tagName,
            type: el.type,
            className: el.className,
            id: el.id,
            text: el.textContent?.trim().substring(0, 50) || el.value || "",
            disabled: el.disabled,
          }));
        }
      );

      this.log(`📊 Found ${buttons.length} button elements`, "info");

      for (const [index, buttonInfo] of buttons.entries()) {
        try {
          // Ensure page is still ready before each interaction
          if (!(await this.ensurePageReady())) {
            this.log("❌ Page not ready for interaction", "error");
            break;
          }

          // Skip disabled buttons
          if (buttonInfo.disabled) {
            this.log(`⏭️ Skipping disabled button ${index + 1}: ${buttonInfo.text}`, "info");
            continue;
          }

          this.log(`🔄 Interacting with button ${index + 1}: ${buttonInfo.text}`, "info");
          
          // Click the button
          await this.page.evaluate((idx) => {
            const buttons = document.querySelectorAll("button, input[type='button'], input[type='submit']");
            if (buttons[idx] && !buttons[idx].disabled) {
              buttons[idx].click();
            }
          }, index);

          // Wait for any potential navigation or modal
          await new Promise(resolve => setTimeout(resolve, 2000));

          this.results.interactions.push({
            type: "button_click",
            element: buttonInfo,
            success: true,
            timestamp: new Date().toISOString(),
          });

          this.results.successfulInteractions++;
          this.log(`✅ Successfully interacted with button ${index + 1}`, "success");

        } catch (error) {
          this.log(`⚠️ Failed to interact with button ${index + 1}: ${error.message}`, "warning");
          this.results.interactions.push({
            type: "button_click",
            element: buttonInfo,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }

      this.results.totalInteractions += buttons.length;
      return true;
    } catch (error) {
      this.log(`❌ Error during button interactions: ${error.message}`, "error");
      this.results.errors.push({
        step: "button_interactions",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  async performSpecificWorkflows() {
    try {
      this.log("🎯 Performing specific post-deployment workflows...", "info");

      // Ensure page is ready before workflows
      if (!(await this.ensurePageReady())) {
        this.log("❌ Could not ensure page readiness", "error");
        return false;
      }

      // Check for donation buttons
      const donationButtons = await this.page.$$eval(
        "button[data-testid*='donate'], a[href*='donate']",
        (elements) => elements.length
      );

      if (donationButtons > 0) {
        this.log(`💰 Found ${donationButtons} donation-related elements`, "info");
        // Test donation flow (without actually donating)
        await this.testDonationFlow();
      }

      // Check for contact forms
      const contactForms = await this.page.$$eval("form", (elements) => elements.length);
      if (contactForms > 0) {
        this.log(`📧 Found ${contactForms} forms`, "info");
        await this.testFormInteractions();
      }

      // Check for navigation elements
      await this.testNavigationElements();

      return true;
    } catch (error) {
      this.log(`❌ Error during specific workflows: ${error.message}`, "error");
      this.results.errors.push({
        step: "specific_workflows",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  async testDonationFlow() {
    try {
      this.log("💰 Testing donation flow...", "info");
      
      // Look for donation buttons and test their functionality
      const donateButton = await this.page.$("button[data-testid*='donate'], a[href*='donate']");
      if (donateButton) {
        await donateButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        this.results.interactions.push({
          type: "donation_flow_test",
          success: true,
          timestamp: new Date().toISOString(),
        });
        
        this.log("✅ Donation flow test completed", "success");
      }
    } catch (error) {
      this.log(`⚠️ Donation flow test failed: ${error.message}`, "warning");
    }
  }

  async testFormInteractions() {
    try {
      this.log("📧 Testing form interactions...", "info");
      
      const forms = await this.page.$$("form");
      for (const form of forms) {
        // Test form validation without submitting
        const inputs = await form.$$("input[required]");
        for (const input of inputs) {
          await input.focus();
          await input.blur(); // Trigger validation
        }
      }
      
      this.results.interactions.push({
        type: "form_validation_test",
        success: true,
        timestamp: new Date().toISOString(),
      });
      
      this.log("✅ Form interaction test completed", "success");
    } catch (error) {
      this.log(`⚠️ Form interaction test failed: ${error.message}`, "warning");
    }
  }

  async testNavigationElements() {
    try {
      this.log("🧭 Testing navigation elements...", "info");
      
      // Test navigation menu items
      const navLinks = await this.page.$$("nav a, .nav a, [role='navigation'] a");
      this.log(`📊 Found ${navLinks.length} navigation links`, "info");
      
      this.results.interactions.push({
        type: "navigation_test",
        elementCount: navLinks.length,
        success: true,
        timestamp: new Date().toISOString(),
      });
      
      this.log("✅ Navigation test completed", "success");
    } catch (error) {
      this.log(`⚠️ Navigation test failed: ${error.message}`, "warning");
    }
  }

  async generateReport() {
    try {
      this.results.success = this.results.errors.length === 0 && this.results.successfulInteractions > 0;
      this.results.successRate = this.results.totalInteractions > 0 
        ? (this.results.successfulInteractions / this.results.totalInteractions * 100).toFixed(2)
        : 0;

      const reportPath = path.join(process.cwd(), "logs", "ui-automation-report.json");
      
      // Ensure logs directory exists
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

      this.log("📊 UI Automation Report Generated", "success");
      this.log(`📁 Report saved to: ${reportPath}`, "info");
      this.log(`✅ Success Rate: ${this.results.successRate}%`, "success");
      this.log(`🎯 Total Interactions: ${this.results.totalInteractions}`, "info");
      this.log(`✅ Successful: ${this.results.successfulInteractions}`, "success");
      this.log(`❌ Errors: ${this.results.errors.length}`, this.results.errors.length > 0 ? "warning" : "success");

      return this.results;
    } catch (error) {
      this.log(`❌ Failed to generate report: ${error.message}`, "error");
      return null;
    }
  }

  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.log("🧹 Browser cleanup completed", "success");
      }
    } catch (error) {
      this.log(`⚠️ Cleanup warning: ${error.message}`, "warning");
    }
  }

  async run() {
    try {
      this.log("🚀 Starting Post-Deployment UI Automation", "info");
      this.log("=" .repeat(60), "info");

      // Initialize browser
      if (!(await this.initialize())) {
        throw new Error("Failed to initialize automation");
      }

      // Navigate to site
      if (!(await this.navigateToSite())) {
        throw new Error("Failed to navigate to site");
      }

      // Perform UI interactions
      await this.interactWithDivElements();
      await this.interactWithButtons();
      await this.performSpecificWorkflows();

      // Generate report
      const report = await this.generateReport();

      this.log("=" .repeat(60), "info");
      this.log("🎉 Post-Deployment UI Automation Completed", "success");

      return report;
    } catch (error) {
      this.log(`❌ Automation failed: ${error.message}`, "error");
      this.results.errors.push({
        step: "main_execution",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return this.results;
    } finally {
      await this.cleanup();
    }
  }
}

// Export for use in other scripts
module.exports = PostDeploymentUIAutomation;

// Run if called directly
if (require.main === module) {
  const automation = new PostDeploymentUIAutomation();
  automation.run()
    .then((results) => {
      if (results && results.success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}