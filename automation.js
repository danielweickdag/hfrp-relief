#!/usr/bin/env node

/**
 * HFRP Server Automation & Debug Tool
 * Automatically fixes common issues and keeps the development server healthy
 */

const fs = require("fs");
const path = require("path");
const { exec, spawn } = require("child_process");

class HFRPAutomation {
  constructor() {
    this.projectPath = "/Users/blvckdlphn/projects/hfrp-relief";
    this.isMonitoring = false;
  }

  async runDiagnostics() {
    console.log("🔍 HFRP Server Diagnostics");
    console.log("========================");

    // Check 1: Project structure
    console.log("\n📁 Checking project structure...");
    const structureOk = await this.checkProjectStructure();
    console.log(
      structureOk ? "✅ Project structure OK" : "❌ Project structure issues"
    );

    // Check 2: Environment configuration
    console.log("\n🔧 Checking environment configuration...");
    const envOk = await this.checkEnvironment();
    console.log(envOk ? "✅ Environment OK" : "❌ Environment issues");

    // Check 3: Dependencies
    console.log("\n📦 Checking dependencies...");
    const depsOk = await this.checkDependencies();
    console.log(depsOk ? "✅ Dependencies OK" : "❌ Dependency issues");

    // Check 4: Syntax errors
    console.log("\n🔍 Checking for syntax errors...");
    const syntaxOk = await this.checkSyntax();
    console.log(syntaxOk ? "✅ No syntax errors" : "❌ Syntax errors found");

    // Check 5: Server status
    console.log("\n🌐 Checking server status...");
    const serverOk = await this.checkServer();
    console.log(serverOk ? "✅ Server running" : "❌ Server issues");

    return { structureOk, envOk, depsOk, syntaxOk, serverOk };
  }

  async autoFix() {
    console.log("\n🔧 AUTOMATIC FIXES");
    console.log("==================");

    try {
      // Fix 1: Clean build cache
      console.log("\n1. Cleaning build cache...");
      await this.execCommand(`cd ${this.projectPath} && rm -rf .next`);
      console.log("✅ Cache cleared");

      // Fix 2: Fix admin page encoding issues
      console.log("\n2. Fixing admin page...");
      await this.fixAdminPage();
      console.log("✅ Admin page fixed");

      // Fix 3: Fix environment configuration
      console.log("\n3. Fixing environment...");
      await this.fixEnvironment();
      console.log("✅ Environment fixed");

      // Fix 4: Fix metadata configuration
      console.log("\n4. Fixing metadata...");
      await this.fixMetadata();
      console.log("✅ Metadata fixed");

      // Fix 5: Install/update dependencies
      console.log("\n5. Checking dependencies...");
      await this.fixDependencies();
      console.log("✅ Dependencies updated");

      console.log("\n🎉 All automatic fixes completed!");
    } catch (error) {
      console.error("❌ Auto-fix error:", error.message);
    }
  }

  async startServer() {
    console.log("\n🚀 Starting development server...");

    // Stop any existing servers
    await this.execCommand('pkill -f "next dev" || true');
    await this.sleep(2000);

    // Start new server
    const serverProcess = spawn("npm", ["run", "dev"], {
      cwd: this.projectPath,
      stdio: "pipe",
    });

    serverProcess.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    console.log("✅ Server started");
    return serverProcess;
  }

  async startMonitoring() {
    console.log("\n👁️ Starting health monitoring...");
    this.isMonitoring = true;

    while (this.isMonitoring) {
      try {
        const health = await this.runDiagnostics();
        const issues = Object.values(health).filter((ok) => !ok).length;

        if (issues > 0) {
          console.log(`\n⚠️ ${issues} issues detected, running auto-fix...`);
          await this.autoFix();
        } else {
          console.log("\n✅ All systems healthy");
        }

        await this.sleep(30000); // Check every 30 seconds
      } catch (error) {
        console.error("❌ Monitoring error:", error.message);
        await this.sleep(5000);
      }
    }
  }

  async checkProjectStructure() {
    const requiredDirs = ["src/app", "src/app/_components", "public"];
    const requiredFiles = ["package.json", "next.config.js", ".env.local"];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(path.join(this.projectPath, dir))) {
        return false;
      }
    }

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.projectPath, file))) {
        return false;
      }
    }

    return true;
  }

  async checkEnvironment() {
    const envPath = path.join(this.projectPath, ".env.local");

    try {
      const content = fs.readFileSync(envPath, "utf8");
      const required = [
        "NEXT_PUBLIC_SITE_URL",
        "NEXT_PUBLIC_DONATION_TEST_MODE",
        "NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN",
      ];

      return required.every((key) => content.includes(key));
    } catch (error) {
      return false;
    }
  }

  async checkDependencies() {
    try {
      const packagePath = path.join(this.projectPath, "package.json");
      const nodeModulesPath = path.join(this.projectPath, "node_modules");

      return fs.existsSync(packagePath) && fs.existsSync(nodeModulesPath);
    } catch (error) {
      return false;
    }
  }

  async checkSyntax() {
    try {
      const output = await this.execCommand(
        `cd ${this.projectPath} && npx next build --dry-run 2>&1`
      );
      return !output.includes("Error") && !output.includes("error");
    } catch (error) {
      return false;
    }
  }

  async checkServer() {
    try {
      const response = await fetch("http://localhost:3000");
      return response.status === 200;
    } catch (error) {
      try {
        const response = await fetch("http://localhost:3001");
        return response.status === 200;
      } catch (fallbackError) {
        return false;
      }
    }
  }

  async fixAdminPage() {
    const adminPath = path.join(this.projectPath, "src/app/admin/page.tsx");

    try {
      let content = fs.readFileSync(adminPath, "utf8");

      // Remove problematic characters
      content = content
        .replace(/[←→]/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[\u2000-\u206F]/g, " ");

      fs.writeFileSync(adminPath, content, "utf8");
    } catch (error) {
      console.warn("Could not fix admin page:", error.message);
    }
  }

  async fixEnvironment() {
    const envPath = path.join(this.projectPath, ".env.local");

    try {
      let content = fs.readFileSync(envPath, "utf8");

      // Ensure required variables exist
      const updates = {
        NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
        NEXT_PUBLIC_DONATION_TEST_MODE: "true",
        NODE_ENV: "development",
      };

      for (const [key, value] of Object.entries(updates)) {
        if (!content.includes(key)) {
          content += `\n${key}=${value}`;
        }
      }

      fs.writeFileSync(envPath, content, "utf8");
    } catch (error) {
      console.warn("Could not fix environment:", error.message);
    }
  }

  async fixMetadata() {
    const layoutPath = path.join(this.projectPath, "src/app/layout.tsx");

    try {
      let content = fs.readFileSync(layoutPath, "utf8");

      // Ensure metadataBase is configured
      if (!content.includes("metadataBase")) {
        content = content.replace(
          "export const metadata: Metadata = {",
          'export const metadata: Metadata = {\n  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),'
        );

        fs.writeFileSync(layoutPath, content, "utf8");
      }
    } catch (error) {
      console.warn("Could not fix metadata:", error.message);
    }
  }

  async fixDependencies() {
    try {
      await this.execCommand(`cd ${this.projectPath} && npm install`);
    } catch (error) {
      console.warn("Could not update dependencies:", error.message);
    }
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout + stderr);
      });
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI Interface
const automation = new HFRPAutomation();

const command = process.argv[2];

switch (command) {
  case "diagnose":
    automation.runDiagnostics();
    break;

  case "fix":
    automation.autoFix();
    break;

  case "start":
    automation.autoFix().then(() => automation.startServer());
    break;

  case "monitor":
    automation.startMonitoring();
    break;

  case "full":
    automation
      .runDiagnostics()
      .then(() => automation.autoFix())
      .then(() => automation.startServer())
      .then(() => automation.startMonitoring());
    break;

  default:
    console.log(`
🎯 HFRP Server Automation Tool

Usage:
  node automation.js [command]

Commands:
  diagnose  - Run diagnostics only
  fix       - Run automatic fixes
  start     - Fix and start server
  monitor   - Start health monitoring
  full      - Run full automation (diagnose + fix + start + monitor)

Examples:
  node automation.js diagnose
  node automation.js fix
  node automation.js full
`);
}

module.exports = HFRPAutomation;
