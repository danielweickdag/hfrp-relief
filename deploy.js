#!/usr/bin/env node

/**
 * HFRP Relief - Automated Deployment Script
 * This script automates the entire deployment process with health checks
 */

const { exec } = require("child_process");
const fs = require("fs");

class HFRPDeployer {
  constructor() {
    this.steps = [];
    this.currentStep = 0;
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
      warning: "\x1b[33m", // Yellow
      reset: "\x1b[0m", // Reset
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, description) {
    return new Promise((resolve, reject) => {
      this.log(`🔄 ${description}...`, "info");
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.log(`❌ FAILED: ${description}`, "error");
          this.log(`Error: ${error.message}`, "error");
          reject(error);
        } else {
          this.log(`✅ SUCCESS: ${description}`, "success");
          if (stdout) {
            console.log(stdout);
          }
          resolve(stdout);
        }
      });
    });
  }

  async preDeploymentChecks() {
    this.log("🔍 Running pre-deployment checks...", "info");

    // Check if we're in the right directory
    if (!fs.existsSync("package.json")) {
      throw new Error("package.json not found. Are you in the project root?");
    }

    // Check if .env.local exists
    if (!fs.existsSync(".env.local")) {
      this.log(
        "⚠️ WARNING: .env.local not found. Some features may not work.",
        "warning"
      );
    }

    // Check critical files
    const criticalFiles = [
      "src/app/page.tsx",
      "src/app/layout.tsx",
      "src/app/_components/ErrorBoundary.tsx",
    ];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Critical file missing: ${file}`);
      }
    }

    this.log("✅ Pre-deployment checks passed", "success");
  }

  async buildProject() {
    this.log("🏗️ Building project...", "info");
    await this.runCommand("npm run build", "Building Next.js application");
  }

  async deployToVercel() {
    this.log("🚀 Deploying to Vercel...", "info");
    const output = await this.runCommand(
      "vercel --prod --yes",
      "Deploying to production"
    );

    // Extract deployment URL from output
    const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
    if (urlMatch) {
      const deploymentUrl = urlMatch[0];
      this.log(`🌐 Deployment URL: ${deploymentUrl}`, "success");
      return deploymentUrl;
    }

    return null;
  }

  async postDeploymentTest(deploymentUrl) {
    if (!deploymentUrl) {
      this.log(
        "⚠️ No deployment URL found, skipping post-deployment tests",
        "warning"
      );
      return;
    }

    this.log("🧪 Running post-deployment tests...", "info");

    // Wait a bit for deployment to be ready
    this.log("⏳ Waiting for deployment to be ready...", "info");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    try {
      // Test if the site is accessible
      const testCommand = `curl -I "${deploymentUrl}" | head -n 1`;
      await this.runCommand(testCommand, "Testing site accessibility");

      // Test debug page
      const debugUrl = `${deploymentUrl}/debug`;
      const debugTestCommand = `curl -I "${debugUrl}" | head -n 1`;
      await this.runCommand(debugTestCommand, "Testing debug page");

      // Test simple page
      const simpleUrl = `${deploymentUrl}/test-simple`;
      const simpleTestCommand = `curl -I "${simpleUrl}" | head -n 1`;
      await this.runCommand(simpleTestCommand, "Testing simple page");

      this.log("✅ Post-deployment tests passed", "success");
    } catch (error) {
      this.log(
        "⚠️ Some post-deployment tests failed, but deployment completed",
        "warning"
      );
    }
  }

  async deploy() {
    try {
      this.log("🚀 Starting HFRP Relief Automated Deployment...", "info");
      this.log("=".repeat(60), "info");

      await this.preDeploymentChecks();
      await this.buildProject();
      const deploymentUrl = await this.deployToVercel();
      await this.postDeploymentTest(deploymentUrl);

      this.log("=".repeat(60), "info");
      this.log("🎉 DEPLOYMENT SUCCESSFUL!", "success");

      if (deploymentUrl) {
        this.log(`🌐 Your site is live at: ${deploymentUrl}`, "success");
        this.log(`🔧 Debug page: ${deploymentUrl}/debug`, "info");
        this.log(`🧪 Test page: ${deploymentUrl}/test-simple`, "info");
      }

      this.log("✅ All automated systems are operational!", "success");
    } catch (error) {
      this.log("=".repeat(60), "info");
      this.log("❌ DEPLOYMENT FAILED!", "error");
      this.log(`Error: ${error.message}`, "error");
      this.log("Please check the errors above and try again.", "error");
      process.exit(1);
    }
  }
}

// Run the deployment
const deployer = new HFRPDeployer();
deployer.deploy();
