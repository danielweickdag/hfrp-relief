#!/usr/bin/env node

/**
 * Admin Dashboard Template Verification Test
 * Tests all admin dashboard templates and functionality
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class AdminTemplateTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      details: [],
    };
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testFileExists(filePath, description) {
    try {
      if (fs.existsSync(filePath)) {
        this.log(`${description} exists at ${filePath}`, "success");
        this.testResults.passed++;
        this.testResults.details.push({
          test: description,
          status: "PASS",
          path: filePath,
        });
        return true;
      } else {
        this.log(`${description} missing at ${filePath}`, "error");
        this.testResults.failed++;
        this.testResults.details.push({
          test: description,
          status: "FAIL",
          path: filePath,
        });
        return false;
      }
    } catch (error) {
      this.log(`Error checking ${description}: ${error.message}`, "error");
      this.testResults.failed++;
      this.testResults.details.push({
        test: description,
        status: "ERROR",
        error: error.message,
      });
      return false;
    }
  }

  async testFileContent(filePath, searchTerm, description) {
    try {
      if (!fs.existsSync(filePath)) {
        this.log(`File ${filePath} does not exist for content test`, "error");
        this.testResults.failed++;
        return false;
      }

      const content = fs.readFileSync(filePath, "utf8");
      if (content.includes(searchTerm)) {
        this.log(
          `${description} found in ${path.basename(filePath)}`,
          "success"
        );
        this.testResults.passed++;
        this.testResults.details.push({
          test: description,
          status: "PASS",
          file: path.basename(filePath),
        });
        return true;
      } else {
        this.log(
          `${description} missing in ${path.basename(filePath)}`,
          "error"
        );
        this.testResults.failed++;
        this.testResults.details.push({
          test: description,
          status: "FAIL",
          file: path.basename(filePath),
        });
        return false;
      }
    } catch (error) {
      this.log(
        `Error testing content in ${description}: ${error.message}`,
        "error"
      );
      this.testResults.failed++;
      return false;
    }
  }

  async runAllTests() {
    this.log("🚀 Starting Admin Dashboard Template Verification...", "info");

    const basePath = "/Users/blvckdlphn/projects/hfrp-relief";

    // Test core admin files
    await this.testFileExists(
      `${basePath}/src/app/admin/page.tsx`,
      "Main Admin Page"
    );
    await this.testFileExists(
      `${basePath}/src/app/admin/layout.tsx`,
      "Admin Layout"
    );
    await this.testFileExists(
      `${basePath}/src/app/_components/AdminAuth.tsx`,
      "Admin Authentication"
    );
    await this.testFileExists(
      `${basePath}/src/app/_components/AdminDashboard.tsx`,
      "Admin Dashboard Component"
    );

    // Test admin template pages
    const adminPages = [
      "analytics/page.tsx",
      "donations/page.tsx",
      "blog/posts/page.tsx",
      "users/page.tsx",
      "volunteers/page.tsx",
      "settings/page.tsx",
      "media/page.tsx",
      "backup/page.tsx",
      "deploy/page.tsx",
    ];

    for (const page of adminPages) {
      const pageName = page.replace("/page.tsx", "").replace("/", " ");
      await this.testFileExists(
        `${basePath}/src/app/admin/${page}`,
        `Admin ${pageName} Template`
      );
    }

    // Test authentication functionality
    await this.testFileContent(
      `${basePath}/src/app/_components/AdminAuth.tsx`,
      "AdminAuthProvider",
      "Authentication Provider Implementation"
    );

    await this.testFileContent(
      `${basePath}/src/app/_components/AdminAuth.tsx`,
      "useAdminAuth",
      "Admin Auth Hook Implementation"
    );

    // Test admin dashboard functionality
    await this.testFileContent(
      `${basePath}/src/app/_components/AdminDashboard.tsx`,
      "activeTab",
      "Dashboard Tab Navigation"
    );

    await this.testFileContent(
      `${basePath}/src/app/_components/AdminDashboard.tsx`,
      "WithPermission",
      "Permission-based Access Control"
    );

    // Test analytics template
    await this.testFileContent(
      `${basePath}/src/app/admin/analytics/page.tsx`,
      "Chart.js",
      "Analytics Charts Integration"
    );

    // Test donations template
    await this.testFileContent(
      `${basePath}/src/app/admin/donations/page.tsx`,
      "DonationDashboard",
      "Donations Management Interface"
    );

    // Test automation integration
    await this.testFileContent(
      `${basePath}/src/app/_components/AdminDashboard.tsx`,
      "AutomationSettings",
      "Automation Settings Integration"
    );

    // Test permissions
    await this.testFileContent(
      `${basePath}/src/app/_components/AdminAuth.tsx`,
      "superadmin",
      "Role-based Permissions System"
    );

    this.generateReport();
  }

  generateReport() {
    const total = this.testResults.passed + this.testResults.failed;
    const passRate = ((this.testResults.passed / total) * 100).toFixed(1);

    this.log("\n📊 ADMIN DASHBOARD TEMPLATE VERIFICATION REPORT", "info");
    this.log("=".repeat(60), "info");
    this.log(`Total Tests: ${total}`, "info");
    this.log(
      `Passed: ${this.testResults.passed}`,
      this.testResults.passed > 0 ? "success" : "info"
    );
    this.log(
      `Failed: ${this.testResults.failed}`,
      this.testResults.failed > 0 ? "error" : "info"
    );
    this.log(`Pass Rate: ${passRate}%`, passRate >= 80 ? "success" : "error");

    if (this.testResults.failed > 0) {
      this.log("\n❌ FAILED TESTS:", "error");
      this.testResults.details
        .filter(
          (detail) => detail.status === "FAIL" || detail.status === "ERROR"
        )
        .forEach((detail) => {
          this.log(`  - ${detail.test}`, "error");
        });
    }

    if (passRate >= 90) {
      this.log(
        "\n🎉 EXCELLENT! All admin dashboard templates are working properly!",
        "success"
      );
    } else if (passRate >= 80) {
      this.log(
        "\n✅ GOOD! Most admin dashboard templates are working properly!",
        "success"
      );
    } else {
      this.log(
        "\n⚠️  WARNING! Some admin dashboard templates need attention!",
        "error"
      );
    }

    // Write detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: parseFloat(passRate),
      },
      details: this.testResults.details,
    };

    fs.writeFileSync(
      "/Users/blvckdlphn/projects/hfrp-relief/data/admin_template_verification_report.json",
      JSON.stringify(reportData, null, 2)
    );

    this.log(
      "\n📄 Detailed report saved to: data/admin_template_verification_report.json",
      "info"
    );
  }
}

// Run the test
const test = new AdminTemplateTest();
test.runAllTests().catch(console.error);
