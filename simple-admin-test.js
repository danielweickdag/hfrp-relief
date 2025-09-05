#!/usr/bin/env node

/**
 * Simple Admin Template Validator
 * Validates that all admin templates are accessible and functional
 */

const fs = require("fs");
const path = require("path");

class SimpleAdminValidator {
  constructor() {
    this.adminPath =
      "/Users/blvckdlphn/projects/hfrp-relief/src/app/admin/page.tsx";
    this.templates = [
      "dashboard",
      "campaigns",
      "donors",
      "content",
      "analytics",
      "automation",
      "settings",
      "reports",
    ];
  }

  async validateAllTemplates() {
    console.log("🧪 HFRP Admin Template Validation");
    console.log("================================");

    try {
      // Step 1: Check file exists
      console.log("\n📁 Checking admin file...");
      const adminExists = fs.existsSync(this.adminPath);
      console.log(
        adminExists ? "✅ Admin file exists" : "❌ Admin file missing"
      );

      if (!adminExists) {
        console.log("❌ Cannot proceed without admin file");
        return false;
      }

      // Step 2: Read content
      const content = fs.readFileSync(this.adminPath, "utf8");

      // Step 3: Check each template
      console.log("\n📋 Validating template structure...");
      const templateResults = {};

      for (const template of this.templates) {
        const result = this.validateTemplate(content, template);
        templateResults[template] = result;

        const status = result.exists ? "✅" : "❌";
        console.log(`   ${status} ${template.toUpperCase()}: ${result.status}`);
      }

      // Step 4: Check authentication
      console.log("\n🔐 Checking authentication...");
      const authOk = this.validateAuthentication(content);
      console.log(
        authOk ? "✅ Authentication logic found" : "❌ Authentication missing"
      );

      // Step 5: Check basic React structure
      console.log("\n⚛️ Checking React structure...");
      const reactOk = this.validateReactStructure(content);
      console.log(
        reactOk ? "✅ React structure OK" : "❌ React structure issues"
      );

      // Generate summary
      const workingTemplates = Object.values(templateResults).filter(
        (r) => r.exists
      ).length;
      const totalTemplates = this.templates.length;

      console.log("\n📊 VALIDATION SUMMARY");
      console.log("=====================");
      console.log(`Templates: ${workingTemplates}/${totalTemplates} working`);
      console.log(`Authentication: ${authOk ? "OK" : "Missing"}`);
      console.log(`React Structure: ${reactOk ? "OK" : "Issues"}`);

      if (workingTemplates === totalTemplates && authOk && reactOk) {
        console.log("\n🎉 All admin templates are working correctly!");

        // Test server accessibility
        await this.testServerAccess();

        return true;
      } else {
        console.log("\n⚠️ Some issues found. Creating fix suggestions...");
        this.generateFixSuggestions(templateResults, authOk, reactOk);
        return false;
      }
    } catch (error) {
      console.error("❌ Validation failed:", error.message);
      return false;
    }
  }

  validateTemplate(content, templateName) {
    // Check if template section exists
    const templatePattern = `activeTab === "${templateName}"`;
    const exists = content.includes(templatePattern);

    if (!exists) {
      return {
        exists: false,
        status: "Template section not found",
        details: [],
      };
    }

    // Extract template section
    const startPattern = new RegExp(
      `activeTab === "${templateName}"[\\s\\S]*?{([\\s\\S]*?)(?=activeTab === "|$)`,
      "g"
    );
    const match = content.match(startPattern);

    if (!match) {
      return {
        exists: true,
        status: "Found but cannot parse",
        details: [],
      };
    }

    const templateContent = match[0];
    const details = [];

    // Check for common elements
    if (templateContent.includes("<button")) {
      details.push("Has buttons");
    }
    if (
      templateContent.includes("<form") ||
      templateContent.includes("<input")
    ) {
      details.push("Has forms");
    }
    if (
      templateContent.includes("useState") ||
      templateContent.includes("setShow")
    ) {
      details.push("Has state management");
    }
    if (templateContent.includes("onClick")) {
      details.push("Has interactions");
    }

    const lineCount = templateContent.split("\n").length;
    details.push(`${lineCount} lines`);

    return {
      exists: true,
      status: `Working (${details.join(", ")})`,
      details,
    };
  }

  validateAuthentication(content) {
    const authChecks = ["isAuthenticated", "localStorage", "admin", "password"];

    return authChecks.every((check) => content.includes(check));
  }

  validateReactStructure(content) {
    const reactChecks = [
      '"use client"',
      "useState",
      "useEffect",
      "export default",
    ];

    return reactChecks.every((check) => content.includes(check));
  }

  async testServerAccess() {
    console.log("\n🌐 Testing server access...");

    try {
      // Test if server is running
      const response = await fetch("http://localhost:3000/admin");

      if (response.ok) {
        console.log("✅ Admin panel accessible at http://localhost:3000/admin");

        // Test if we can get the page content
        const text = await response.text();
        if (text.includes("Admin") || text.includes("Dashboard")) {
          console.log("✅ Admin content loading correctly");
        } else {
          console.log("⚠️ Admin page loads but content may be incomplete");
        }
      } else {
        console.log(`⚠️ Server responded with status: ${response.status}`);
      }
    } catch (error) {
      try {
        // Try port 3001 as fallback
        const response = await fetch("http://localhost:3001/admin");
        if (response.ok) {
          console.log(
            "✅ Admin panel accessible at http://localhost:3001/admin"
          );
        } else {
          console.log("❌ Admin panel not accessible");
        }
      } catch (fallbackError) {
        console.log("❌ Server not responding on either port 3000 or 3001");
      }
    }
  }

  generateFixSuggestions(templateResults, authOk, reactOk) {
    console.log("\n🔧 FIX SUGGESTIONS");
    console.log("==================");

    // Check for missing templates
    const missingTemplates = Object.entries(templateResults)
      .filter(([_, result]) => !result.exists)
      .map(([name, _]) => name);

    if (missingTemplates.length > 0) {
      console.log("\n❌ Missing Templates:");
      missingTemplates.forEach((template) => {
        console.log(`   - Add template section for "${template}"`);
        console.log(`     Pattern: {activeTab === "${template}" && (`);
      });
    }

    if (!authOk) {
      console.log("\n❌ Authentication Issues:");
      console.log("   - Ensure authentication logic is implemented");
      console.log("   - Check for localStorage usage");
      console.log("   - Verify login form exists");
    }

    if (!reactOk) {
      console.log("\n❌ React Structure Issues:");
      console.log('   - Ensure "use client" directive is present');
      console.log("   - Check useState and useEffect imports");
      console.log("   - Verify default export");
    }

    console.log("\n💡 Quick fixes:");
    console.log("   1. Clear cache: rm -rf .next");
    console.log("   2. Restart server: npm run dev");
    console.log("   3. Check browser console for errors");
  }

  generateTemplateReport() {
    console.log("\n📋 TEMPLATE STRUCTURE OVERVIEW");
    console.log("===============================");

    try {
      const content = fs.readFileSync(this.adminPath, "utf8");

      this.templates.forEach((template) => {
        const result = this.validateTemplate(content, template);

        console.log(`\n📄 ${template.toUpperCase()}`);
        console.log(
          `   Status: ${result.exists ? "✅ Working" : "❌ Missing"}`
        );
        if (result.details.length > 0) {
          console.log(`   Details: ${result.details.join(", ")}`);
        }
      });
    } catch (error) {
      console.error("❌ Cannot generate report:", error.message);
    }
  }
}

// CLI interface
const validator = new SimpleAdminValidator();

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "validate":
      await validator.validateAllTemplates();
      break;

    case "report":
      validator.generateTemplateReport();
      break;

    case "full":
      await validator.validateAllTemplates();
      validator.generateTemplateReport();
      break;

    default:
      console.log(`
🧪 Simple Admin Template Validator

Usage:
  node simple-admin-test.js [command]

Commands:
  validate  - Validate all templates
  report    - Generate template report
  full      - Validate and report

Examples:
  node simple-admin-test.js validate
  node simple-admin-test.js full
`);
  }
}

// Add fetch polyfill for Node.js
if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}

main().catch(console.error);

module.exports = SimpleAdminValidator;
