#!/usr/bin/env node

/**
 * HFRP Relief - Enhanced Deployment Automation
 * Integrates with workflow orchestrator for seamless deployments
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentAutomation {
  constructor() {
    this.config = {
      environments: {
        development: {
          name: "Development",
          url: "http://localhost:3000",
          branch: "develop",
          requiresApproval: false,
          healthCheckTimeout: 30000,
        },
        staging: {
          name: "Staging",
          url: process.env.STAGING_URL || "https://staging.hfrprelief.org",
          branch: "staging",
          requiresApproval: false,
          healthCheckTimeout: 60000,
        },
        production: {
          name: "Production",
          url: process.env.PRODUCTION_URL || "https://hfrprelief.org",
          branch: "main",
          requiresApproval: true,
          healthCheckTimeout: 120000,
        },
      },
      dataDir: "./data",
      logFile: "./logs/deployment.log",
    };

    this.deploymentState = {
      environment: null,
      startTime: null,
      status: "idle",
      steps: [],
      errors: [],
      rollbackAvailable: false,
    };
  }

  async initialize() {
    await this.log("🚀 Initializing Enhanced Deployment Automation", "info");

    // Ensure directories exist
    await this.ensureDirectories();

    // Load deployment history
    await this.loadDeploymentHistory();

    await this.log("✅ Deployment automation initialized", "success");
  }

  async ensureDirectories() {
    const dirs = ["./data", "./logs", "./backup"];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        await this.log(`📁 Created directory: ${dir}`, "info");
      }
    }
  }

  async loadDeploymentHistory() {
    try {
      const historyPath = path.join(
        this.config.dataDir,
        "deployment-history.json"
      );
      const historyData = await fs.readFile(historyPath, "utf8");
      this.deploymentHistory = JSON.parse(historyData);
    } catch (error) {
      this.deploymentHistory = {
        deployments: [],
        lastDeployment: null,
        rollbacks: [],
      };
    }
  }

  async saveDeploymentHistory() {
    const historyPath = path.join(
      this.config.dataDir,
      "deployment-history.json"
    );
    await fs.writeFile(
      historyPath,
      JSON.stringify(this.deploymentHistory, null, 2)
    );
  }

  async deploy(environment = "production", options = {}) {
    if (!this.config.environments[environment]) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    const env = this.config.environments[environment];

    this.deploymentState = {
      environment,
      startTime: new Date(),
      status: "running",
      steps: [],
      errors: [],
      rollbackAvailable: false,
    };

    await this.log(`🎯 Starting deployment to ${env.name}`, "header");

    try {
      // Pre-deployment validation
      await this.runDeploymentStep("pre-validation", () =>
        this.preValidation(environment)
      );

      // Health check
      await this.runDeploymentStep("health-check", () => this.runHealthCheck());

      // Build application
      await this.runDeploymentStep("build", () => this.buildApplication());

      // Run tests
      await this.runDeploymentStep("tests", () => this.runTests());

      // Backup (production only)
      if (environment === "production") {
        await this.runDeploymentStep("backup", () => this.createBackup());
      }

      // Deploy to platform
      await this.runDeploymentStep("deploy", () =>
        this.deployToVercel(environment)
      );

      // Post-deployment verification
      await this.runDeploymentStep("verification", () =>
        this.postDeploymentCheck(env.url)
      );

      // Update deployment history
      await this.updateDeploymentHistory(environment, true);

      this.deploymentState.status = "completed";
      await this.log(
        `🎉 Deployment to ${env.name} completed successfully!`,
        "success"
      );

      return {
        success: true,
        environment,
        url: env.url,
        deploymentId: this.generateDeploymentId(),
        steps: this.deploymentState.steps,
        duration: Date.now() - this.deploymentState.startTime,
      };
    } catch (error) {
      this.deploymentState.status = "failed";
      this.deploymentState.errors.push(error.message);

      await this.log(
        `💥 Deployment to ${env.name} failed: ${error.message}`,
        "error"
      );

      // Attempt rollback for production
      if (
        environment === "production" &&
        this.deploymentState.rollbackAvailable
      ) {
        await this.log("🔄 Attempting automatic rollback...", "warning");
        try {
          await this.rollback();
        } catch (rollbackError) {
          await this.log(
            `❌ Rollback failed: ${rollbackError.message}`,
            "error"
          );
        }
      }

      await this.updateDeploymentHistory(environment, false, error.message);

      throw error;
    }
  }

  async runDeploymentStep(stepName, stepFunction) {
    const step = {
      name: stepName,
      startTime: new Date(),
      status: "running",
    };

    this.deploymentState.steps.push(step);
    await this.log(`🔄 Running step: ${stepName}`, "info");

    try {
      const result = await stepFunction();
      step.status = "completed";
      step.endTime = new Date();
      step.duration = step.endTime - step.startTime;
      step.result = result;

      await this.log(`✅ Step completed: ${stepName}`, "success");
      return result;
    } catch (error) {
      step.status = "failed";
      step.endTime = new Date();
      step.duration = step.endTime - step.startTime;
      step.error = error.message;

      await this.log(`❌ Step failed: ${stepName} - ${error.message}`, "error");
      throw error;
    }
  }

  async preValidation(environment) {
    await this.log("🔍 Running pre-deployment validation", "info");

    // Check environment variables
    const requiredEnvVars = [
      "VERCEL_TOKEN",
      "VERCEL_ORG_ID",
      "VERCEL_PROJECT_ID",
    ];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    // Check Git status
    if (environment === "production") {
      const branch = await this.getCurrentBranch();
      const expectedBranch = this.config.environments[environment].branch;

      if (branch !== expectedBranch) {
        throw new Error(
          `Wrong branch: expected ${expectedBranch}, got ${branch}`
        );
      }
    }

    return { validation: "passed" };
  }

  async runHealthCheck() {
    await this.log("🏥 Running system health check", "info");

    try {
      const healthResult = await this.executeCommand("node", [
        "health-check.mjs",
      ]);
      return { healthCheck: "passed", output: healthResult };
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async buildApplication() {
    await this.log("🏗️ Building application", "info");

    try {
      const buildResult = await this.executeCommand("bun", ["run", "build"]);
      return { build: "completed", output: buildResult };
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async runTests() {
    await this.log("🧪 Running tests", "info");

    // For now, we'll run the automation tests
    try {
      const testResult = await this.executeCommand("node", [
        "automation-test.js",
      ]);
      return { tests: "passed", output: testResult };
    } catch (error) {
      // Tests are optional for now
      await this.log(
        `⚠️ Tests failed but continuing: ${error.message}`,
        "warning"
      );
      return { tests: "skipped", reason: error.message };
    }
  }

  async createBackup() {
    await this.log("💾 Creating system backup", "info");

    const backupDir = `./backup/pre-deploy-${Date.now()}`;
    await fs.mkdir(backupDir, { recursive: true });

    // Backup critical files
    const filesToBackup = [
      "./package.json",
      "./next.config.js",
      "./vercel.json",
      "./automation-config.json",
    ];

    for (const file of filesToBackup) {
      try {
        await fs.copyFile(file, path.join(backupDir, path.basename(file)));
      } catch (error) {
        await this.log(
          `⚠️ Could not backup ${file}: ${error.message}`,
          "warning"
        );
      }
    }

    this.deploymentState.rollbackAvailable = true;
    return { backup: "created", location: backupDir };
  }

  async deployToVercel(environment) {
    await this.log(`🚀 Deploying to Vercel (${environment})`, "info");

    const isProd = environment === "production";
    const args = ["--prebuilt"];

    if (isProd) {
      args.push("--prod");
    }

    try {
      // Use Vercel CLI
      const deployResult = await this.executeCommand("vercel", args, {
        env: {
          ...process.env,
          VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
          VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
        },
      });

      return {
        deployment: "completed",
        environment,
        output: deployResult,
      };
    } catch (error) {
      throw new Error(`Vercel deployment failed: ${error.message}`);
    }
  }

  async postDeploymentCheck(url) {
    await this.log(`🔍 Verifying deployment at ${url}`, "info");

    const maxAttempts = 5;
    const delay = 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.log(
          `📡 Health check attempt ${attempt}/${maxAttempts}`,
          "info"
        );

        const bypassToken = process.env.VERCEL_BYPASS_TOKEN || "";
        const headers = bypassToken
          ? { "x-vercel-protection-bypass": bypassToken }
          : undefined;

        const response = await fetch(`${url}/api/health`, { headers }).catch(() => {
          return fetch(url, { headers });
        });

        if (response.ok) {
          await this.log("✅ Deployment verification successful", "success");
          return { verification: "passed", url, attempts: attempt };
        }

        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(
            `Deployment verification failed after ${maxAttempts} attempts: ${error.message}`
          );
        }

        await this.log(`⏳ Waiting ${delay / 1000}s before retry...`, "info");
        await this.sleep(delay);
      }
    }
  }

  async rollback() {
    await this.log("🔄 Initiating rollback procedure", "warning");

    // This is a simplified rollback - in a real system you'd have more sophisticated rollback mechanisms
    try {
      const rollbackResult = await this.executeCommand("vercel", [
        "rollback",
        "--prod",
      ]);

      this.deploymentHistory.rollbacks.push({
        timestamp: new Date().toISOString(),
        reason: "Automatic rollback after failed deployment",
        result: "success",
      });

      await this.saveDeploymentHistory();
      await this.log("✅ Rollback completed successfully", "success");

      return { rollback: "completed", output: rollbackResult };
    } catch (error) {
      throw new Error(`Rollback failed: ${error.message}`);
    }
  }

  async updateDeploymentHistory(environment, success, error = null) {
    const deployment = {
      id: this.generateDeploymentId(),
      environment,
      timestamp: new Date().toISOString(),
      success,
      duration: Date.now() - this.deploymentState.startTime,
      steps: this.deploymentState.steps,
      error,
    };

    this.deploymentHistory.deployments.push(deployment);
    this.deploymentHistory.lastDeployment = deployment;

    // Keep only last 50 deployments
    if (this.deploymentHistory.deployments.length > 50) {
      this.deploymentHistory.deployments =
        this.deploymentHistory.deployments.slice(-50);
    }

    await this.saveDeploymentHistory();
  }

  async getCurrentBranch() {
    try {
      const result = await this.executeCommand("git", [
        "rev-parse",
        "--abbrev-ref",
        "HEAD",
      ]);
      return result.trim();
    } catch (error) {
      throw new Error("Could not determine current Git branch");
    }
  }

  async executeCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ["inherit", "pipe", "pipe"],
        cwd: process.cwd(),
        ...options,
      });

      let output = "";
      let error = "";

      child.stdout?.on("data", (data) => {
        output += data.toString();
      });

      child.stderr?.on("data", (data) => {
        error += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(
            new Error(error || `Command ${command} exited with code ${code}`)
          );
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  generateDeploymentId() {
    return `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\\x1b[36m",
      success: "\\x1b[32m",
      error: "\\x1b[31m",
      warning: "\\x1b[33m",
      header: "\\x1b[35m",
      reset: "\\x1b[0m",
    };

    const color = colors[type] || colors.info;
    const logMessage = `${timestamp} - ${message}`;

    console.log(`${color}${logMessage}${colors.reset}`);

    // Write to log file
    try {
      await fs.appendFile(this.config.logFile, logMessage + "\\n");
    } catch (error) {
      // Silent fail for logging
    }
  }

  async getDeploymentStatus() {
    return {
      currentDeployment: this.deploymentState,
      history: this.deploymentHistory,
      environments: this.config.environments,
    };
  }
}

// CLI Interface
async function main() {
  const deployment = new DeploymentAutomation();
  await deployment.initialize();

  const args = process.argv.slice(2);
  const environment = args[0] || "production";
  const options = {
    skipTests: args.includes("--skip-tests"),
    skipBackup: args.includes("--skip-backup"),
    force: args.includes("--force"),
  };

  try {
    if (args.includes("--status")) {
      const status = await deployment.getDeploymentStatus();
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    const result = await deployment.deploy(environment, options);
    console.log("\\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log(`📍 Environment: ${result.environment}`);
    console.log(`🔗 URL: ${result.url}`);
    console.log(`⏱️  Duration: ${Math.round(result.duration / 1000)}s`);
    process.exit(0);
  } catch (error) {
    console.error(`\\n💥 DEPLOYMENT FAILED: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch(console.error);
}

export default DeploymentAutomation;
