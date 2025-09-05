#!/usr/bin/env node

/**
 * Admin Panel Comprehensive Debug & Feature Test
 * Tests all admin features using built-in modules and system commands
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const BASE_URL = "http://localhost:3000";

class AdminDebugger {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: { totalTests: 0, passed: 0, failed: 0, warnings: 0 },
      tests: [],
      features: {
        server: { status: "pending", details: [] },
        authentication: { status: "pending", details: [] },
        navigation: { status: "pending", details: [] },
        components: { status: "pending", details: [] },
        analytics: { status: "pending", details: [] },
      },
    };
  }

  log(message, level = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const icons = {
      info: "📋",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      debug: "🔧",
    };
    console.log(`[${timestamp}] ${icons[level] || "📋"} ${message}`);
  }

  addTest(name, status, details = "", category = "general") {
    const result = {
      name,
      status,
      details,
      category,
      timestamp: new Date().toISOString(),
    };
    this.results.tests.push(result);
    this.results.summary.totalTests++;
    this.results.summary[
      status === "pass" ? "passed" : status === "fail" ? "failed" : "warnings"
    ]++;

    if (this.results.features[category]) {
      this.results.features[category].details.push(result);
      const tests = this.results.features[category].details;
      this.results.features[category].status = tests.some(
        (t) => t.status === "fail"
      )
        ? "failed"
        : tests.some((t) => t.status === "warning")
          ? "warning"
          : "passed";
    }

    const icon = status === "pass" ? "✅" : status === "fail" ? "❌" : "⚠️";
    this.log(`${icon} ${name}: ${details || status}`);
  }

  curlTest(url, description, category) {
    try {
      const result = execSync(
        `curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${url}"`,
        { encoding: "utf8", timeout: 10000 }
      );
      const httpCode = parseInt(result.trim());

      if (httpCode === 200) {
        this.addTest(description, "pass", `HTTP ${httpCode}`, category);
        return true;
      } else if (httpCode === 404) {
        this.addTest(
          description,
          "warning",
          `HTTP ${httpCode} - Not implemented`,
          category
        );
        return false;
      } else {
        this.addTest(description, "fail", `HTTP ${httpCode}`, category);
        return false;
      }
    } catch (error) {
      this.addTest(
        description,
        "fail",
        `Connection failed: ${error.message}`,
        category
      );
      return false;
    }
  }

  testServer() {
    this.log("Testing server connectivity...", "debug");

    // Test main server
    this.curlTest("/", "Main Server Response", "server");

    // Test admin endpoint
    this.curlTest("/admin", "Admin Endpoint", "server");
  }

  testAuthentication() {
    this.log("Testing authentication system...", "debug");

    // Test admin page loads
    try {
      const htmlContent = execSync(`curl -s "${BASE_URL}/admin"`, {
        encoding: "utf8",
        timeout: 10000,
      });

      // Check for login form elements
      const hasEmail =
        htmlContent.includes("email") || htmlContent.includes("Email");
      const hasPassword =
        htmlContent.includes("password") || htmlContent.includes("Password");
      const hasForm =
        htmlContent.includes("<form") || htmlContent.includes("form");
      const hasHFRP =
        htmlContent.includes("HFRP") || htmlContent.includes("Haitian");

      if (hasForm) {
        this.addTest(
          "Login Form Present",
          "pass",
          "Form elements detected",
          "authentication"
        );
      } else {
        this.addTest(
          "Login Form Present",
          "warning",
          "Form not clearly detected",
          "authentication"
        );
      }

      if (hasEmail && hasPassword) {
        this.addTest(
          "Login Fields",
          "pass",
          "Email and password fields detected",
          "authentication"
        );
      } else {
        this.addTest(
          "Login Fields",
          "warning",
          "Login fields not detected",
          "authentication"
        );
      }

      if (hasHFRP) {
        this.addTest(
          "HFRP Branding",
          "pass",
          "HFRP branding present",
          "authentication"
        );
      } else {
        this.addTest(
          "HFRP Branding",
          "warning",
          "HFRP branding not detected",
          "authentication"
        );
      }
    } catch (error) {
      this.addTest(
        "Admin Page Content",
        "fail",
        `Failed to fetch content: ${error.message}`,
        "authentication"
      );
    }
  }

  testNavigation() {
    this.log("Testing admin navigation routes...", "debug");

    const routes = [
      { path: "/admin", desc: "Main Admin Page" },
      { path: "/admin/analytics", desc: "Analytics Page" },
      { path: "/admin/campaigns", desc: "Campaigns Page" },
      { path: "/admin/donations", desc: "Donations Page" },
      { path: "/admin/settings", desc: "Settings Page" },
    ];

    routes.forEach((route) => {
      this.curlTest(route.path, route.desc, "navigation");
    });
  }

  testComponents() {
    this.log("Testing component file integrity...", "debug");

    const criticalFiles = [
      {
        path: "src/app/_components/AdminAuth.tsx",
        desc: "AdminAuth Component",
      },
      {
        path: "src/app/_components/AdminDashboard.tsx",
        desc: "AdminDashboard Component",
      },
      { path: "src/app/admin/page.tsx", desc: "Admin Page Component" },
      { path: "src/app/admin/layout.tsx", desc: "Admin Layout Component" },
      {
        path: "src/app/admin/analytics/page.tsx",
        desc: "Analytics Page Component",
      },
      { path: "src/lib/chartSetup.ts", desc: "Chart.js Setup" },
      { path: "package.json", desc: "Package Configuration" },
    ];

    criticalFiles.forEach((file) => {
      try {
        const filePath = path.join(process.cwd(), file.path);
        const exists = fs.existsSync(filePath);

        if (exists) {
          const stats = fs.statSync(filePath);
          const sizeKB = (stats.size / 1024).toFixed(1);
          this.addTest(
            file.desc,
            "pass",
            `File exists (${sizeKB}KB)`,
            "components"
          );
        } else {
          this.addTest(file.desc, "fail", "File missing", "components");
        }
      } catch (error) {
        this.addTest(file.desc, "fail", error.message, "components");
      }
    });
  }

  testAnalytics() {
    this.log("Testing analytics features...", "debug");

    // Test analytics page
    try {
      const analyticsContent = execSync(
        `curl -s "${BASE_URL}/admin/analytics"`,
        { encoding: "utf8", timeout: 10000 }
      );

      const hasChart =
        analyticsContent.includes("chart") ||
        analyticsContent.includes("Chart");
      const hasAnalytics =
        analyticsContent.includes("analytics") ||
        analyticsContent.includes("Analytics");
      const hasData =
        analyticsContent.includes("data") || analyticsContent.includes("stats");

      if (hasChart) {
        this.addTest(
          "Chart Components",
          "pass",
          "Chart elements detected",
          "analytics"
        );
      } else {
        this.addTest(
          "Chart Components",
          "warning",
          "Chart elements not detected",
          "analytics"
        );
      }

      if (hasAnalytics && hasData) {
        this.addTest(
          "Analytics Content",
          "pass",
          "Analytics and data content present",
          "analytics"
        );
      } else {
        this.addTest(
          "Analytics Content",
          "warning",
          "Analytics content limited",
          "analytics"
        );
      }
    } catch (error) {
      this.addTest("Analytics Page Load", "fail", error.message, "analytics");
    }
  }

  testStaticAssets() {
    this.log("Testing static assets...", "debug");

    const assets = [
      { path: "/hfrp-logo.png", desc: "HFRP Logo" },
      { path: "/favicon.ico", desc: "Favicon" },
    ];

    assets.forEach((asset) => {
      this.curlTest(asset.path, asset.desc, "components");
    });
  }

  testDependencies() {
    this.log("Testing critical dependencies...", "debug");

    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      const criticalDeps = [
        "next",
        "react",
        "react-dom",
        "typescript",
        "chart.js",
        "react-chartjs-2",
        "lucide-react",
      ];

      criticalDeps.forEach((dep) => {
        const hasInDeps =
          packageJson.dependencies && packageJson.dependencies[dep];
        const hasInDevDeps =
          packageJson.devDependencies && packageJson.devDependencies[dep];

        if (hasInDeps || hasInDevDeps) {
          const version = hasInDeps || hasInDevDeps;
          this.addTest(
            `Dependency: ${dep}`,
            "pass",
            `Version ${version}`,
            "components"
          );
        } else {
          this.addTest(
            `Dependency: ${dep}`,
            "warning",
            "Not found in package.json",
            "components"
          );
        }
      });
    } catch (error) {
      this.addTest(
        "Package.json Analysis",
        "fail",
        error.message,
        "components"
      );
    }
  }

  generateReport() {
    this.log("Generating comprehensive report...", "debug");

    console.log("\n" + "=".repeat(70));
    console.log("🔧 ADMIN PANEL COMPREHENSIVE DEBUG REPORT");
    console.log("=".repeat(70));

    console.log(`\n📊 SUMMARY:`);
    console.log(`   🎯 Total Tests: ${this.results.summary.totalTests}`);
    console.log(`   ✅ Passed: ${this.results.summary.passed}`);
    console.log(`   ❌ Failed: ${this.results.summary.failed}`);
    console.log(`   ⚠️  Warnings: ${this.results.summary.warnings}`);

    const successRate = (
      (this.results.summary.passed / this.results.summary.totalTests) *
      100
    ).toFixed(1);
    console.log(`   📈 Success Rate: ${successRate}%`);

    console.log(`\n🎨 FEATURE STATUS:`);
    Object.entries(this.results.features).forEach(([feature, data]) => {
      const icons = {
        passed: "✅",
        failed: "❌",
        warning: "⚠️",
        pending: "⏳",
      };
      const icon = icons[data.status] || "❓";
      console.log(
        `   ${icon} ${feature.toUpperCase()}: ${data.status} (${data.details.length} tests)`
      );
    });

    // Show critical failures
    const criticalFailures = this.results.tests.filter(
      (t) =>
        t.status === "fail" &&
        ["server", "authentication", "components"].includes(t.category)
    );

    if (criticalFailures.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES:`);
      criticalFailures.forEach((failure) => {
        console.log(`   ❌ ${failure.name}: ${failure.details}`);
      });
    }

    // Show warnings that need attention
    const warnings = this.results.tests.filter((t) => t.status === "warning");
    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS REQUIRING ATTENTION:`);
      warnings.slice(0, 5).forEach((warning) => {
        console.log(`   ⚠️  ${warning.name}: ${warning.details}`);
      });
      if (warnings.length > 5) {
        console.log(`   ... and ${warnings.length - 5} more warnings`);
      }
    }

    // Overall health assessment
    const criticalCount = criticalFailures.length;
    const overallHealth =
      criticalCount === 0
        ? this.results.summary.failed === 0
          ? "🟢 EXCELLENT"
          : "🟡 GOOD"
        : criticalCount > 3
          ? "🔴 CRITICAL"
          : "🟠 NEEDS ATTENTION";

    console.log(`\n🎯 OVERALL HEALTH: ${overallHealth}`);

    if (criticalCount === 0 && this.results.summary.failed === 0) {
      console.log(`\n🎉 ADMIN PANEL STATUS: All systems operational!`);
    } else if (criticalCount === 0) {
      console.log(
        `\n👍 ADMIN PANEL STATUS: Core features working, some optimizations needed`
      );
    } else {
      console.log(`\n🔧 ADMIN PANEL STATUS: Requires immediate attention`);
    }

    // Save detailed report
    const reportFile = "admin-debug-report.json";
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    console.log("=".repeat(70));
  }

  runAllTests() {
    this.log("🚀 Starting comprehensive admin panel debug...", "info");

    this.testServer();
    this.testAuthentication();
    this.testNavigation();
    this.testComponents();
    this.testAnalytics();
    this.testStaticAssets();
    this.testDependencies();

    this.generateReport();
  }
}

// Run the comprehensive debug
const adminDebugger = new AdminDebugger();
adminDebugger.runAllTests();
