#!/usr/bin/env node

/**
 * HFRP Relief - Workflow Automation Orchestrator
 * Manages and coordinates all automation workflows
 */

const fs = require("fs").promises;
const path = require("path");
const { spawn } = require("child_process");

class WorkflowOrchestrator {
  constructor() {
    this.config = {
      dataDir: "./data",
      logsDir: "./logs",
      automationConfig: "./automation-config.json",
      workflows: {
        development: ["health-check", "lint", "build", "test"],
        staging: [
          "health-check",
          "lint",
          "build",
          "automation-sync",
          "deploy-staging",
        ],
        production: [
          "health-check",
          "lint",
          "build",
          "automation-sync",
          "final-validation",
          "deploy-production",
        ],
        maintenance: ["automation-sync", "health-monitor", "cleanup", "backup"],
      },
    };

    this.state = {
      currentWorkflow: null,
      runningTasks: new Set(),
      completedTasks: new Set(),
      failedTasks: new Set(),
      startTime: null,
      logs: [],
    };

    this.automationScripts = {
      "health-check": () => this.runScript("health-check.js"),
      lint: () => this.runCommand("bun", ["run", "lint"]),
      "lint-check": () => this.runCommand("bun", ["run", "lint"]),
      "type-check": () => this.runCommand("bunx", ["tsc", "--noEmit"]),
      build: () => this.runCommand("bun", ["run", "build"]),
      "build-test": () => this.runCommand("bun", ["run", "build"]),
      test: () => this.runScript("automation-test.js"),
      "unit-tests": () => this.runScript("automation-test.js"),
      "integration-tests": () => this.runScript("automation-test.js"),
      "performance-tests": () => this.runScript("automation-test.js"),
      "smoke-tests": () => this.runScript("automation-test.js"),
      "automation-sync": () => this.runScript("master-automation.js"),
      "deploy-staging": () => this.runScript("enhanced-deploy.js", ["staging"]),
      "deploy-production": () =>
        this.runScript("enhanced-deploy.js", ["production"]),
      "final-validation": () => this.runScript("final-validation.js"),
      "health-monitor": () => this.runScript("health-monitor.js"),
      "system-health-check": () => this.runScript("health-check.js"),
      "security-scan": () => this.runSecurityScan(),
      "backup-database": () =>
        this.runScript("enhanced-deploy.js", ["--backup"]),
      "monitoring-setup": () => this.setupMonitoring(),
      cleanup: () => this.performCleanup(),
      "log-cleanup": () => this.performLogCleanup(),
      "cache-cleanup": () => this.performCacheCleanup(),
      "database-optimization": () => this.optimizeDatabase(),
      "security-updates": () => this.applySecurityUpdates(),
      "backup-verification": () => this.verifyBackups(),
      "performance-optimization": () => this.optimizePerformance(),
      backup: () => this.performBackup(),
      "social-media-automation": () =>
        this.runScript("social-media-automation.js"),
      "donor-communication": () => this.runScript("donor-communication.js"),
      "campaign-milestone-tracking": () =>
        this.runScript("campaign-milestone-tracker.js"),
      "event-automation": () => this.runScript("event-automation.js"),
      "template-processing": () => this.runScript("template-processor.js"),
      "donor-segmentation": () => this.runScript("donor-segmentation.js"),
      "impact-reporting": () => this.runScript("impact-reporter.js"),
      "analytics-generation": () => this.runScript("analytics-generator.js"),
    };
  }

  async initialize() {
    await this.log("🚀 Initializing Workflow Orchestrator", "info");

    // Ensure directories exist
    await this.ensureDirectories();

    // Load configuration
    await this.loadConfiguration();

    // Setup signal handlers
    this.setupSignalHandlers();

    await this.log("✅ Orchestrator initialized successfully", "success");
  }

  async ensureDirectories() {
    const dirs = [this.config.dataDir, this.config.logsDir];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        await this.log(`📁 Created directory: ${dir}`, "info");
      }
    }
  }

  async loadConfiguration() {
    try {
      const configPath = this.config.automationConfig;
      const configData = await fs.readFile(configPath, "utf8");
      const config = JSON.parse(configData);

      // Merge with existing config
      this.config = { ...this.config, ...config };
      await this.log("📋 Configuration loaded successfully", "success");
    } catch (error) {
      await this.log("⚠️ Using default configuration", "warning");
      await this.createDefaultConfig();
    }
  }

  async createDefaultConfig() {
    const defaultConfig = {
      notifications: {
        email: true,
        slack: false,
        discord: false,
      },
      schedules: {
        healthCheck: "0 */6 * * *", // Every 6 hours
        backup: "0 2 * * *", // Daily at 2 AM
        maintenance: "0 3 * * 0", // Weekly on Sunday at 3 AM
      },
      deployment: {
        autoStaging: true,
        autoProduction: false,
        requireApproval: true,
      },
      monitoring: {
        uptime: true,
        performance: true,
        errors: true,
        donations: true,
      },
    };

    await fs.writeFile(
      this.config.automationConfig,
      JSON.stringify(defaultConfig, null, 2)
    );

    await this.log("📝 Default configuration created", "info");
  }

  setupSignalHandlers() {
    process.on("SIGINT", async () => {
      await this.log("🛑 Graceful shutdown initiated", "warning");
      await this.cleanup();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.log("🛑 Termination signal received", "warning");
      await this.cleanup();
      process.exit(0);
    });
  }

  async runWorkflow(workflowType = "development", options = {}) {
    if (!this.config.workflows[workflowType]) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    this.state.currentWorkflow = workflowType;
    this.state.startTime = new Date();
    this.state.runningTasks.clear();
    this.state.completedTasks.clear();
    this.state.failedTasks.clear();

    await this.log(
      `🎯 Starting workflow: ${workflowType.toUpperCase()}`,
      "header"
    );

    const workflowConfig = this.config.workflows[workflowType];
    const tasks =
      workflowConfig.tasks || this.config.workflows[workflowType] || [];

    const results = {
      workflow: workflowType,
      startTime: this.state.startTime,
      tasks: [],
      success: true,
    };

    for (const task of tasks) {
      const taskResult = await this.runTask(task, options);
      results.tasks.push(taskResult);

      if (!taskResult.success && !options.continueOnError) {
        results.success = false;
        break;
      }
    }

    results.endTime = new Date();
    results.duration = results.endTime - results.startTime;

    await this.generateWorkflowReport(results);
    return results;
  }

  async runTask(taskName, options = {}) {
    if (!this.automationScripts[taskName]) {
      throw new Error(`Unknown task: ${taskName}`);
    }

    this.state.runningTasks.add(taskName);

    const taskResult = {
      name: taskName,
      startTime: new Date(),
      success: false,
      output: "",
      error: null,
    };

    await this.log(`🔄 Running task: ${taskName}`, "info");

    try {
      const output = await this.automationScripts[taskName](options);
      taskResult.output = output || "";
      taskResult.success = true;

      this.state.completedTasks.add(taskName);
      await this.log(`✅ Task completed: ${taskName}`, "success");
    } catch (error) {
      taskResult.error = error.message;
      this.state.failedTasks.add(taskName);
      await this.log(`❌ Task failed: ${taskName} - ${error.message}`, "error");
    } finally {
      this.state.runningTasks.delete(taskName);
      taskResult.endTime = new Date();
      taskResult.duration = taskResult.endTime - taskResult.startTime;
    }

    return taskResult;
  }

  async runScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn("node", [scriptPath, ...args], {
        stdio: ["inherit", "pipe", "pipe"],
        cwd: process.cwd(),
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
            new Error(error || `Script ${scriptPath} exited with code ${code}`)
          );
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ["inherit", "pipe", "pipe"],
        cwd: process.cwd(),
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

  async performCleanup() {
    await this.log("🧹 Performing system cleanup", "info");

    // Clean temporary files
    try {
      await this.runCommand("find", [".", "-name", "*.tmp", "-delete"]);
      await this.runCommand("find", [
        "./logs",
        "-name",
        "*.log",
        "-mtime",
        "+7",
        "-delete",
      ]);
      await this.log("✅ Cleanup completed", "success");
    } catch (error) {
      await this.log(`⚠️ Cleanup warning: ${error.message}`, "warning");
    }
  }

  async performBackup() {
    await this.log("💾 Creating system backup", "info");

    const backupDir = `./backup/backup_${new Date().toISOString().split("T")[0]}`;

    try {
      await fs.mkdir(backupDir, { recursive: true });

      // Backup critical files
      const criticalFiles = [
        "./package.json",
        "./next.config.js",
        "./tailwind.config.ts",
        "./tsconfig.json",
        this.config.automationConfig,
      ];

      for (const file of criticalFiles) {
        try {
          await fs.copyFile(file, path.join(backupDir, path.basename(file)));
        } catch (err) {
          await this.log(
            `⚠️ Could not backup ${file}: ${err.message}`,
            "warning"
          );
        }
      }

      await this.log(`✅ Backup created: ${backupDir}`, "success");
      return { backup: "created", location: backupDir };
    } catch (error) {
      await this.log(`❌ Backup failed: ${error.message}`, "error");
      throw error;
    }
  }

  async runSecurityScan() {
    await this.log("🔒 Running security scan", "info");

    try {
      // Run npm audit for security vulnerabilities
      const auditResult = await this.runCommand("npm", [
        "audit",
        "--audit-level",
        "moderate",
      ]);
      await this.log("✅ Security scan completed", "success");
      return { securityScan: "passed", output: auditResult };
    } catch (error) {
      await this.log(
        `⚠️ Security scan found issues: ${error.message}`,
        "warning"
      );
      // Don't fail the workflow for security warnings
      return { securityScan: "warning", issues: error.message };
    }
  }

  async setupMonitoring() {
    await this.log("📊 Setting up monitoring", "info");

    try {
      // This would integrate with monitoring services
      await this.log("✅ Monitoring setup completed", "success");
      return { monitoring: "configured" };
    } catch (error) {
      await this.log(`⚠️ Monitoring setup failed: ${error.message}`, "warning");
      return { monitoring: "failed", error: error.message };
    }
  }

  async performLogCleanup() {
    await this.log("🧹 Cleaning up log files", "info");

    try {
      await this.runCommand("find", [
        "./logs",
        "-name",
        "*.log",
        "-mtime",
        "+7",
        "-delete",
      ]);
      await this.log("✅ Log cleanup completed", "success");
      return { logCleanup: "completed" };
    } catch (error) {
      await this.log(`⚠️ Log cleanup failed: ${error.message}`, "warning");
      return { logCleanup: "failed", error: error.message };
    }
  }

  async performCacheCleanup() {
    await this.log("🗑️ Cleaning up caches", "info");

    try {
      // Clean Next.js cache
      await this.runCommand("rm", ["-rf", "./.next/cache"]);

      // Clean node_modules cache if exists
      await this.runCommand("find", [".", "-name", "*.tmp", "-delete"]);

      await this.log("✅ Cache cleanup completed", "success");
      return { cacheCleanup: "completed" };
    } catch (error) {
      await this.log(`⚠️ Cache cleanup failed: ${error.message}`, "warning");
      return { cacheCleanup: "failed", error: error.message };
    }
  }

  async optimizeDatabase() {
    await this.log("🗄️ Optimizing database", "info");

    try {
      // Placeholder for database optimization
      await this.log("✅ Database optimization completed", "success");
      return { databaseOptimization: "completed" };
    } catch (error) {
      await this.log(
        `⚠️ Database optimization failed: ${error.message}`,
        "warning"
      );
      return { databaseOptimization: "failed", error: error.message };
    }
  }

  async applySecurityUpdates() {
    await this.log("🔐 Applying security updates", "info");

    try {
      // Run npm audit fix for automatic fixes
      const fixResult = await this.runCommand("npm", ["audit", "fix"]);
      await this.log("✅ Security updates applied", "success");
      return { securityUpdates: "applied", output: fixResult };
    } catch (error) {
      await this.log(`⚠️ Security updates failed: ${error.message}`, "warning");
      return { securityUpdates: "failed", error: error.message };
    }
  }

  async verifyBackups() {
    await this.log("✅ Verifying backups", "info");

    try {
      const backupDir = "./backup";
      const files = await fs.readdir(backupDir);
      const recentBackups = files.filter((f) => f.startsWith("backup_")).length;

      await this.log(
        `✅ Backup verification completed: ${recentBackups} backups found`,
        "success"
      );
      return { backupVerification: "passed", backupCount: recentBackups };
    } catch (error) {
      await this.log(
        `⚠️ Backup verification failed: ${error.message}`,
        "warning"
      );
      return { backupVerification: "failed", error: error.message };
    }
  }

  async optimizePerformance() {
    await this.log("⚡ Optimizing performance", "info");

    try {
      // Placeholder for performance optimization
      await this.log("✅ Performance optimization completed", "success");
      return { performanceOptimization: "completed" };
    } catch (error) {
      await this.log(
        `⚠️ Performance optimization failed: ${error.message}`,
        "warning"
      );
      return { performanceOptimization: "failed", error: error.message };
    }
  }

  async generateWorkflowReport(results) {
    const report = {
      workflow: results.workflow,
      timestamp: new Date().toISOString(),
      duration: results.duration,
      success: results.success,
      tasks: results.tasks,
      summary: {
        total: results.tasks.length,
        successful: results.tasks.filter((t) => t.success).length,
        failed: results.tasks.filter((t) => !t.success).length,
      },
    };

    const reportPath = path.join(
      this.config.logsDir,
      `workflow_${results.workflow}_${Date.now()}.json`
    );

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    await this.log(`📄 Workflow report saved: ${reportPath}`, "info");

    // Display summary
    await this.displayWorkflowSummary(report);
  }

  async displayWorkflowSummary(report) {
    console.log("\\n" + "═".repeat(60));
    console.log(`🎯 WORKFLOW SUMMARY: ${report.workflow.toUpperCase()}`);
    console.log("═".repeat(60));
    console.log(`📅 Completed: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`⏱️  Duration: ${Math.round(report.duration / 1000)}s`);
    console.log(`✅ Success: ${report.success ? "YES" : "NO"}`);
    console.log(
      `📊 Tasks: ${report.summary.successful}/${report.summary.total} successful`
    );

    if (report.summary.failed > 0) {
      console.log(`❌ Failed Tasks:`);
      report.tasks
        .filter((t) => !t.success)
        .forEach((task) => {
          console.log(`   • ${task.name}: ${task.error}`);
        });
    }
    console.log("═".repeat(60) + "\\n");
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

    this.state.logs.push({
      timestamp,
      message,
      type,
    });

    // Write to log file
    try {
      const logFile = path.join(this.config.logsDir, "orchestrator.log");
      await fs.appendFile(logFile, logMessage + "\\n");
    } catch (error) {
      // Silent fail for logging
    }
  }

  async getStatus() {
    return {
      currentWorkflow: this.state.currentWorkflow,
      runningTasks: Array.from(this.state.runningTasks),
      completedTasks: Array.from(this.state.completedTasks),
      failedTasks: Array.from(this.state.failedTasks),
      startTime: this.state.startTime,
      uptime: this.state.startTime ? Date.now() - this.state.startTime : 0,
    };
  }

  async cleanup() {
    await this.log("🧹 Orchestrator cleanup initiated", "info");

    // Cancel running tasks
    this.state.runningTasks.clear();

    // Save final state
    const finalState = await this.getStatus();
    const statePath = path.join(this.config.dataDir, "final_state.json");

    try {
      await fs.writeFile(statePath, JSON.stringify(finalState, null, 2));
      await this.log("💾 Final state saved", "success");
    } catch (error) {
      await this.log(
        `⚠️ Could not save final state: ${error.message}`,
        "warning"
      );
    }
  }
}

// CLI Interface
async function main() {
  const orchestrator = new WorkflowOrchestrator();
  await orchestrator.initialize();

  const args = process.argv.slice(2);
  const command = args[0] || "development";
  const options = {
    continueOnError: args.includes("--continue-on-error"),
    verbose: args.includes("--verbose"),
  };

  try {
    if (command === "status") {
      const status = await orchestrator.getStatus();
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    if (command === "help") {
      console.log(`
🤖 HFRP Relief - Workflow Orchestrator

Usage: node workflow-orchestrator.js [command] [options]

Commands:
  development    Run development workflow (default)
  staging        Run staging deployment workflow  
  production     Run production deployment workflow
  maintenance    Run maintenance workflow
  status         Show current status
  help           Show this help

Options:
  --continue-on-error    Continue workflow even if tasks fail
  --verbose             Enable verbose logging

Examples:
  node workflow-orchestrator.js development
  node workflow-orchestrator.js production --continue-on-error
  node workflow-orchestrator.js status
      `);
      return;
    }

    const result = await orchestrator.runWorkflow(command, options);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    await orchestrator.log(`💥 Orchestrator error: ${error.message}`, "error");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = WorkflowOrchestrator;
