#!/usr/bin/env node

/**
 * Comprehensive Admin Panel Debug & Feature Test
 * Tests all admin panel features and capabilities
 */

const axios = require("axios").default;
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3000";
const DEBUG_REPORT_FILE = "admin-debug-report.json";

class AdminDebugger {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
      tests: [],
      features: {
        authentication: { status: "pending", details: [] },
        dashboard: { status: "pending", details: [] },
        analytics: { status: "pending", details: [] },
        navigation: { status: "pending", details: [] },
        components: { status: "pending", details: [] },
        integrations: { status: "pending", details: [] },
      },
    };
  }

  log(message, level = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const levelIcon =
      {
        info: "📋",
        success: "✅",
        error: "❌",
        warning: "⚠️",
        debug: "🔧",
      }[level] || "📋";

    console.log(`[${timestamp}] ${levelIcon} ${message}`);
  }

  addTestResult(testName, status, details = "", category = "general") {
    const result = {
      name: testName,
      status,
      details,
      category,
      timestamp: new Date().toISOString(),
    };

    this.results.tests.push(result);
    this.results.summary.totalTests++;

    if (status === "pass") {
      this.results.summary.passed++;
    } else if (status === "fail") {
      this.results.summary.failed++;
    } else if (status === "warning") {
      this.results.summary.warnings++;
    }

    // Update feature status
    if (this.results.features[category]) {
      this.results.features[category].details.push(result);

      // Determine overall feature status
      const categoryTests = this.results.features[category].details;
      const hasFailures = categoryTests.some((t) => t.status === "fail");
      const hasWarnings = categoryTests.some((t) => t.status === "warning");

      if (hasFailures) {
        this.results.features[category].status = "failed";
      } else if (hasWarnings) {
        this.results.features[category].status = "warning";
      } else {
        this.results.features[category].status = "passed";
      }
    }

    const statusIcon =
      status === "pass" ? "✅" : status === "fail" ? "❌" : "⚠️";
    this.log(
      `${statusIcon} ${testName}: ${details || status}`,
      status === "pass" ? "success" : status === "fail" ? "error" : "warning"
    );
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await axios({
        url: `${BASE_URL}${url}`,
        timeout: 10000,
        validateStatus: () => true, // Don't throw on HTTP errors
        ...options,
      });
      return { success: true, response };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  async testServerConnectivity() {
    this.log("Testing server connectivity...", "debug");

    const result = await this.makeRequest("/");
    if (result.success && result.response.status === 200) {
      this.addTestResult(
        "Server Connectivity",
        "pass",
        `HTTP ${result.response.status}`,
        "dashboard"
      );
    } else {
      this.addTestResult(
        "Server Connectivity",
        "fail",
        result.error || "Server unreachable",
        "dashboard"
      );
    }
  }

  async testAdminRoutes() {
    this.log("Testing admin routes...", "debug");

    const routes = [
      "/admin",
      "/admin/analytics",
      "/admin/campaigns",
      "/admin/donations",
      "/admin/content",
      "/admin/settings",
    ];

    for (const route of routes) {
      const result = await this.makeRequest(route);
      if (result.success) {
        if (result.response.status === 200) {
          this.addTestResult(
            `Route ${route}`,
            "pass",
            `HTTP ${result.response.status}`,
            "navigation"
          );
        } else if (result.response.status === 404) {
          this.addTestResult(
            `Route ${route}`,
            "warning",
            "Route not implemented",
            "navigation"
          );
        } else {
          this.addTestResult(
            `Route ${route}`,
            "fail",
            `HTTP ${result.response.status}`,
            "navigation"
          );
        }
      } else {
        this.addTestResult(
          `Route ${route}`,
          "fail",
          result.error,
          "navigation"
        );
      }
    }
  }

  async testAuthentication() {
    this.log("Testing authentication system...", "debug");

    // Test admin page accessibility
    const adminResult = await this.makeRequest("/admin");
    if (adminResult.success && adminResult.response.status === 200) {
      this.addTestResult(
        "Admin Page Load",
        "pass",
        "Page loads successfully",
        "authentication"
      );

      // Check if login form is present in response
      const hasLoginForm =
        adminResult.response.data.includes("form") ||
        adminResult.response.data.includes("email") ||
        adminResult.response.data.includes("password");

      if (hasLoginForm) {
        this.addTestResult(
          "Login Form Detection",
          "pass",
          "Login form elements detected",
          "authentication"
        );
      } else {
        this.addTestResult(
          "Login Form Detection",
          "warning",
          "Login form not clearly detected in HTML",
          "authentication"
        );
      }
    } else {
      this.addTestResult(
        "Admin Page Load",
        "fail",
        "Admin page failed to load",
        "authentication"
      );
    }
  }

  async testComponentIntegrity() {
    this.log("Testing component integrity...", "debug");

    // Check if critical files exist
    const criticalFiles = [
      "src/app/_components/AdminAuth.tsx",
      "src/app/_components/AdminDashboard.tsx",
      "src/app/admin/page.tsx",
      "src/app/admin/analytics/page.tsx",
    ];

    for (const file of criticalFiles) {
      try {
        const exists = fs.existsSync(path.join(process.cwd(), file));
        if (exists) {
          this.addTestResult(
            `Component File ${file}`,
            "pass",
            "File exists",
            "components"
          );
        } else {
          this.addTestResult(
            `Component File ${file}`,
            "fail",
            "File missing",
            "components"
          );
        }
      } catch (error) {
        this.addTestResult(
          `Component File ${file}`,
          "fail",
          error.message,
          "components"
        );
      }
    }
  }

  async testAnalyticsFeatures() {
    this.log("Testing analytics features...", "debug");

    const analyticsResult = await this.makeRequest("/admin/analytics");
    if (analyticsResult.success && analyticsResult.response.status === 200) {
      this.addTestResult(
        "Analytics Page",
        "pass",
        "Analytics page loads",
        "analytics"
      );

      // Check for chart-related content
      const hasChartContent =
        analyticsResult.response.data.includes("chart") ||
        analyticsResult.response.data.includes("Chart") ||
        analyticsResult.response.data.includes("analytics");

      if (hasChartContent) {
        this.addTestResult(
          "Analytics Content",
          "pass",
          "Chart/analytics content detected",
          "analytics"
        );
      } else {
        this.addTestResult(
          "Analytics Content",
          "warning",
          "Chart content not detected",
          "analytics"
        );
      }
    } else {
      this.addTestResult(
        "Analytics Page",
        "fail",
        "Analytics page failed to load",
        "analytics"
      );
    }
  }

  async testIntegrations() {
    this.log("Testing integrations...", "debug");

    // Test API endpoints
    const apiEndpoints = [
      "/api/health",
      "/api/donations",
      "/api/analytics",
      "/api/campaigns",
    ];

    for (const endpoint of apiEndpoints) {
      const result = await this.makeRequest(endpoint);
      if (result.success) {
        if (result.response.status === 200) {
          this.addTestResult(
            `API ${endpoint}`,
            "pass",
            "API endpoint responding",
            "integrations"
          );
        } else if (result.response.status === 404) {
          this.addTestResult(
            `API ${endpoint}`,
            "warning",
            "API endpoint not implemented",
            "integrations"
          );
        } else {
          this.addTestResult(
            `API ${endpoint}`,
            "fail",
            `HTTP ${result.response.status}`,
            "integrations"
          );
        }
      } else {
        this.addTestResult(
          `API ${endpoint}`,
          "warning",
          "API endpoint not available",
          "integrations"
        );
      }
    }
  }

  async testStaticAssets() {
    this.log("Testing static assets...", "debug");

    const assets = [
      "/hfrp-logo.png",
      "/favicon.ico",
      "/_next/static/css/app/layout.css",
    ];

    for (const asset of assets) {
      const result = await this.makeRequest(asset);
      if (result.success && result.response.status === 200) {
        this.addTestResult(
          `Asset ${asset}`,
          "pass",
          "Asset loads successfully",
          "components"
        );
      } else if (result.response && result.response.status === 404) {
        this.addTestResult(
          `Asset ${asset}`,
          "warning",
          "Asset not found",
          "components"
        );
      } else {
        this.addTestResult(
          `Asset ${asset}`,
          "fail",
          result.error || "Asset failed to load",
          "components"
        );
      }
    }
  }

  generateReport() {
    this.log("Generating debug report...", "debug");

    // Write detailed JSON report
    fs.writeFileSync(DEBUG_REPORT_FILE, JSON.stringify(this.results, null, 2));

    // Generate console summary
    console.log("\n" + "=".repeat(60));
    console.log("🔧 ADMIN PANEL DEBUG REPORT");
    console.log("=".repeat(60));

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${this.results.summary.totalTests}`);
    console.log(`   ✅ Passed: ${this.results.summary.passed}`);
    console.log(`   ❌ Failed: ${this.results.summary.failed}`);
    console.log(`   ⚠️  Warnings: ${this.results.summary.warnings}`);

    console.log(`\n📋 FEATURE STATUS:`);
    Object.entries(this.results.features).forEach(([feature, data]) => {
      const statusIcon =
        data.status === "passed"
          ? "✅"
          : data.status === "failed"
            ? "❌"
            : data.status === "warning"
              ? "⚠️"
              : "⏳";
      console.log(
        `   ${statusIcon} ${feature.charAt(0).toUpperCase() + feature.slice(1)}: ${data.status}`
      );
    });

    const criticalFailures = this.results.tests.filter(
      (t) =>
        t.status === "fail" &&
        ["authentication", "dashboard"].includes(t.category)
    );

    if (criticalFailures.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES:`);
      criticalFailures.forEach((failure) => {
        console.log(`   ❌ ${failure.name}: ${failure.details}`);
      });
    }

    const overallStatus =
      this.results.summary.failed === 0
        ? "✅ HEALTHY"
        : criticalFailures.length > 0
          ? "🚨 CRITICAL"
          : "⚠️ ISSUES";

    console.log(`\n🎯 OVERALL STATUS: ${overallStatus}`);
    console.log(`\n📄 Detailed report saved to: ${DEBUG_REPORT_FILE}`);
    console.log("=".repeat(60));
  }

  async runAllTests() {
    this.log("Starting comprehensive admin panel debug...", "info");

    await this.testServerConnectivity();
    await this.testAdminRoutes();
    await this.testAuthentication();
    await this.testComponentIntegrity();
    await this.testAnalyticsFeatures();
    await this.testIntegrations();
    await this.testStaticAssets();

    this.generateReport();
    return this.results;
  }
}

// Run the debugger
async function runDebug() {
  const adminDebugger = new AdminDebugger();
  try {
    await adminDebugger.runAllTests();
  } catch (error) {
    console.error("❌ Debug process failed:", error);
    process.exit(1);
  }
}

// Check if we can run (axios dependency)
try {
  require("axios");
  runDebug();
} catch (error) {
  console.log("📋 Running simplified debug without axios...");

  // Simplified version using built-in modules
  const adminDebugger = new AdminDebugger();
  adminDebugger.testComponentIntegrity();
  adminDebugger.generateReport();
}
