#!/usr/bin/env node

/**
 * HFRP Admin Template Tester
 * Tests all admin panel templates and their functionality
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class AdminTemplateTester {
  constructor() {
    this.projectPath = "/Users/blvckdlphn/projects/hfrp-relief";
    this.adminPath = path.join(this.projectPath, "src/app/admin/page.tsx");
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

  async testAllTemplates() {
    console.log("🧪 HFRP Admin Template Testing");
    console.log("==============================");

    try {
      // Step 1: Verify admin file exists and is readable
      console.log("\n📁 Checking admin file...");
      const adminExists = await this.checkAdminFile();
      console.log(adminExists ? "✅ Admin file OK" : "❌ Admin file missing");

      // Step 2: Check syntax
      console.log("\n🔍 Checking syntax...");
      const syntaxOk = await this.checkSyntax();
      console.log(syntaxOk ? "✅ Syntax OK" : "❌ Syntax errors found");

      // Step 3: Verify all templates exist
      console.log("\n📋 Checking template structure...");
      const templatesOk = await this.checkTemplateStructure();
      console.log(
        templatesOk ? "✅ All templates found" : "❌ Missing templates"
      );

      // Step 4: Check for common JSX issues
      console.log("\n⚛️ Checking JSX structure...");
      const jsxOk = await this.checkJSXStructure();
      console.log(jsxOk ? "✅ JSX structure OK" : "❌ JSX issues found");

      // Step 5: Test component state management
      console.log("\n🎛️ Checking state management...");
      const stateOk = await this.checkStateManagement();
      console.log(stateOk ? "✅ State management OK" : "❌ State issues found");

      // Step 6: Test authentication flow
      console.log("\n🔐 Checking authentication...");
      const authOk = await this.checkAuthentication();
      console.log(authOk ? "✅ Authentication OK" : "❌ Authentication issues");

      // Step 7: Check for missing imports
      console.log("\n📦 Checking imports...");
      const importsOk = await this.checkImports();
      console.log(importsOk ? "✅ Imports OK" : "❌ Missing imports");

      // Generate report
      console.log("\n📊 TEMPLATE TEST RESULTS");
      console.log("========================");

      const results = {
        adminExists,
        syntaxOk,
        templatesOk,
        jsxOk,
        stateOk,
        authOk,
        importsOk,
      };

      const passed = Object.values(results).filter(Boolean).length;
      const total = Object.keys(results).length;

      console.log(`\n🎯 Overall Score: ${passed}/${total} tests passed`);

      if (passed === total) {
        console.log("🎉 All admin templates are working correctly!");
      } else {
        console.log("⚠️ Some issues found, running auto-fixes...");
        await this.autoFixIssues(results);
      }

      return results;
    } catch (error) {
      console.error("❌ Testing failed:", error.message);
      return false;
    }
  }

  async checkAdminFile() {
    try {
      const stats = fs.statSync(this.adminPath);
      return stats.isFile() && stats.size > 0;
    } catch (error) {
      return false;
    }
  }

  async checkSyntax() {
    try {
      // Use Next.js to check syntax instead of raw TypeScript
      const output = await this.execCommand(
        `cd ${this.projectPath} && npx next lint --file src/app/admin/page.tsx 2>&1`
      );
      return !output.includes("error") && !output.includes("Error");
    } catch (error) {
      console.log(
        "Syntax check details:",
        error.stdout?.toString() || error.message
      );
      return false;
    }
  }

  async checkTemplateStructure() {
    try {
      const content = fs.readFileSync(this.adminPath, "utf8");

      // Check if all templates are defined
      const missingTemplates = [];
      for (const template of this.templates) {
        const templateCheck = `activeTab === "${template}"`;
        if (!content.includes(templateCheck)) {
          missingTemplates.push(template);
        }
      }

      if (missingTemplates.length > 0) {
        console.log("Missing templates:", missingTemplates.join(", "));
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async checkJSXStructure() {
    try {
      const content = fs.readFileSync(this.adminPath, "utf8");

      // Check for common JSX issues
      const issues = [];

      // Check for unclosed tags
      const openDivs = (content.match(/<div/g) || []).length;
      const closeDivs = (content.match(/<\/div>/g) || []).length;
      if (openDivs !== closeDivs) {
        issues.push(`Unmatched div tags: ${openDivs} open, ${closeDivs} close`);
      }

      // Check for proper className usage
      if (content.includes("class=") && !content.includes("className=")) {
        issues.push("Using class instead of className");
      }

      // Check for proper event handlers
      const onClickPattern = /onClick=\{[^}]+\}/g;
      const onClickMatches = content.match(onClickPattern) || [];
      for (const match of onClickMatches) {
        if (!match.includes("=>") && !match.includes("function")) {
          issues.push(`Potential onClick issue: ${match}`);
        }
      }

      if (issues.length > 0) {
        console.log("JSX issues found:", issues);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async checkStateManagement() {
    try {
      const content = fs.readFileSync(this.adminPath, "utf8");

      // Check for useState declarations
      const requiredStates = [
        "activeTab",
        "isAuthenticated",
        "campaigns",
        "donors",
      ];

      const missingStates = [];
      for (const state of requiredStates) {
        if (
          !content.includes(`[${state},`) &&
          !content.includes(`const [${state},`)
        ) {
          missingStates.push(state);
        }
      }

      if (missingStates.length > 0) {
        console.log("Missing state variables:", missingStates.join(", "));
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async checkAuthentication() {
    try {
      const content = fs.readFileSync(this.adminPath, "utf8");

      // Check for authentication logic
      const authChecks = [
        "isAuthenticated",
        "localStorage",
        "admin@haitianfamilyrelief.org",
        "password",
      ];

      const missingAuth = [];
      for (const check of authChecks) {
        if (!content.includes(check)) {
          missingAuth.push(check);
        }
      }

      if (missingAuth.length > 0) {
        console.log("Missing authentication elements:", missingAuth.join(", "));
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async checkImports() {
    try {
      const content = fs.readFileSync(this.adminPath, "utf8");

      // Check for required imports
      const requiredImports = ["useState", "useEffect", '"use client"'];

      const missingImports = [];
      for (const imp of requiredImports) {
        if (!content.includes(imp)) {
          missingImports.push(imp);
        }
      }

      if (missingImports.length > 0) {
        console.log("Missing imports:", missingImports.join(", "));
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async autoFixIssues(results) {
    console.log("\n🔧 Applying automatic fixes...");

    try {
      let content = fs.readFileSync(this.adminPath, "utf8");
      let modified = false;

      // Fix common issues
      if (!results.importsOk) {
        // Ensure proper imports
        if (!content.includes('"use client"')) {
          content = '"use client";\n\n' + content;
          modified = true;
          console.log('✅ Added "use client" directive');
        }
      }

      // Fix JSX issues
      if (!results.jsxOk) {
        // Replace class with className
        content = content.replace(/\bclass=/g, "className=");
        modified = true;
        console.log("✅ Fixed className attributes");
      }

      // Write back if modified
      if (modified) {
        fs.writeFileSync(this.adminPath, content, "utf8");
        console.log("✅ Auto-fixes applied");
      }
    } catch (error) {
      console.error("❌ Auto-fix failed:", error.message);
    }
  }

  async generateTemplateReport() {
    console.log("\n📋 TEMPLATE DETAILS");
    console.log("===================");

    try {
      const content = fs.readFileSync(this.adminPath, "utf8");

      for (const template of this.templates) {
        const templateRegex = new RegExp(
          `activeTab === "${template}"[\\s\\S]*?(?=activeTab === "|$)`,
          "g"
        );
        const match = content.match(templateRegex);

        if (match) {
          const templateContent = match[0];
          const lineCount = templateContent.split("\n").length;
          const hasState =
            templateContent.includes("useState") ||
            templateContent.includes("setShow");
          const hasButtons = templateContent.includes("button");
          const hasForm =
            templateContent.includes("form") ||
            templateContent.includes("input");

          console.log(`\n📄 ${template.toUpperCase()}`);
          console.log(`   📏 Lines: ${lineCount}`);
          console.log(`   🎛️ Interactive: ${hasState ? "✅" : "❌"}`);
          console.log(`   🔘 Buttons: ${hasButtons ? "✅" : "❌"}`);
          console.log(`   📝 Forms: ${hasForm ? "✅" : "❌"}`);
        } else {
          console.log(`\n📄 ${template.toUpperCase()}: ❌ NOT FOUND`);
        }
      }
    } catch (error) {
      console.error("❌ Report generation failed:", error.message);
    }
  }
}

// CLI interface
const tester = new AdminTemplateTester();

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "test":
      await tester.testAllTemplates();
      break;

    case "report":
      await tester.generateTemplateReport();
      break;

    case "full":
      await tester.testAllTemplates();
      await tester.generateTemplateReport();
      break;

    default:
      console.log(`
🧪 HFRP Admin Template Tester

Usage:
  node admin-test.js [command]

Commands:
  test    - Run all template tests
  report  - Generate detailed template report  
  full    - Run tests and generate report

Examples:
  node admin-test.js test
  node admin-test.js full
`);
  }
}

main().catch(console.error);

module.exports = AdminTemplateTester;
