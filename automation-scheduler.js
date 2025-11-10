#!/usr/bin/env node

/**
 * HFRP Relief - Automation Scheduler
 * Manages scheduled tasks and workflow automation
 */

const fs = require("fs").promises;
const path = require("path");
const { spawn } = require("child_process");
const { CronJob } = require("cron");

class AutomationScheduler {
  constructor() {
    this.configPath = "./automation-config.json";
    this.jobs = new Map();
    this.isRunning = false;
    this.config = null;
  }

  async initialize() {
    console.log("🕐 Initializing Automation Scheduler");

    // Load configuration
    await this.loadConfig();

    // Setup scheduled jobs
    await this.setupScheduledJobs();

    // Setup signal handlers
    this.setupSignalHandlers();

    console.log("✅ Automation Scheduler initialized");
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, "utf8");
      this.config = JSON.parse(configData);
      console.log("📋 Configuration loaded");
    } catch (error) {
      console.error(`❌ Failed to load config: ${error.message}`);
      throw error;
    }
  }

  async setupScheduledJobs() {
    if (!this.config.schedules) {
      console.log("⚠️ No schedules configured");
      return;
    }

    for (const [jobName, schedule] of Object.entries(this.config.schedules)) {
      if (!schedule.enabled) {
        console.log(`⏸️ Skipping disabled job: ${jobName}`);
        continue;
      }

      try {
        const job = new CronJob(
          schedule.cron,
          () => this.executeScheduledJob(jobName, schedule),
          null,
          false,
          "UTC"
        );

        this.jobs.set(jobName, {
          job,
          schedule,
          lastRun: null,
          nextRun: job.nextDates().toString(),
          status: "scheduled",
        });

        console.log(`📅 Scheduled job: ${jobName} (${schedule.cron})`);
      } catch (error) {
        console.error(`❌ Failed to schedule ${jobName}: ${error.message}`);
      }
    }
  }

  async executeScheduledJob(jobName, schedule) {
    console.log(`🏃 Executing scheduled job: ${jobName}`);

    const jobInfo = this.jobs.get(jobName);
    if (jobInfo) {
      jobInfo.status = "running";
      jobInfo.lastRun = new Date();
    }

    try {
      let result;

      switch (schedule.workflow) {
        case "health-check":
          result = await this.runHealthCheck();
          break;
        case "backup":
          result = await this.runBackup();
          break;
        case "maintenance":
          result = await this.runMaintenance();
          break;
        case "donation-sync":
          result = await this.runDonationSync();
          break;
        case "campaign-sync":
          result = await this.runCampaignSync();
          break;
        default:
          result = await this.runWorkflow(schedule.workflow);
      }

      if (jobInfo) {
        jobInfo.status = "completed";
        jobInfo.lastResult = result;
      }

      console.log(`✅ Completed scheduled job: ${jobName}`);

      // Send notification if configured
      await this.sendNotification("success", jobName, result);
    } catch (error) {
      console.error(`❌ Scheduled job failed: ${jobName} - ${error.message}`);

      if (jobInfo) {
        jobInfo.status = "failed";
        jobInfo.lastError = error.message;
      }

      // Send failure notification
      await this.sendNotification("failure", jobName, null, error.message);
    }
  }

  async runHealthCheck() {
    return this.executeScript("health-check.js");
  }

  async runBackup() {
    return this.executeScript("enhanced-deploy.mjs", ["--status"]);
  }

  async runMaintenance() {
    return this.executeScript("workflow-orchestrator.js", ["maintenance"]);
  }

  async runDonationSync() {
    return this.executeScript("master-automation.js");
  }

  async runCampaignSync() {
    return this.executeScript("campaign-validation-test.js");
  }

  async runWorkflow(workflowName) {
    return this.executeScript("workflow-orchestrator.js", [workflowName]);
  }

  async executeScript(scriptName, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn("node", [scriptName, ...args], {
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
          resolve({ success: true, output, script: scriptName });
        } else {
          reject(
            new Error(
              `Script ${scriptName} failed: ${error || "Unknown error"}`
            )
          );
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  async sendNotification(type, jobName, result = null, error = null) {
    if (!this.config.notifications) return;

    try {
      // Email notifications
      if (this.config.notifications.email?.enabled) {
        await this.sendEmailNotification(type, jobName, result, error);
      }

      // Slack notifications
      if (this.config.notifications.slack?.enabled) {
        await this.sendSlackNotification(type, jobName, result, error);
      }

      // Discord notifications
      if (this.config.notifications.discord?.enabled) {
        await this.sendDiscordNotification(type, jobName, result, error);
      }
    } catch (notificationError) {
      console.error(`⚠️ Notification failed: ${notificationError.message}`);
    }
  }

  async sendEmailNotification(type, jobName, result, error) {
    // Placeholder for email notification
    // In a real implementation, you'd use a service like Resend, SendGrid, etc.
    console.log(`📧 Email notification: ${type} - ${jobName}`);
  }

  async sendSlackNotification(type, jobName, result, error) {
    // Placeholder for Slack notification
    // In a real implementation, you'd use the Slack webhook
    console.log(`💬 Slack notification: ${type} - ${jobName}`);
  }

  async sendDiscordNotification(type, jobName, result, error) {
    // Placeholder for Discord notification
    console.log(`🎮 Discord notification: ${type} - ${jobName}`);
  }

  async start() {
    if (this.isRunning) {
      console.log("⚠️ Scheduler is already running");
      return;
    }

    console.log("🚀 Starting automation scheduler");
    this.isRunning = true;

    // Start all jobs
    for (const [jobName, jobInfo] of this.jobs) {
      jobInfo.job.start();
      console.log(`▶️ Started job: ${jobName}`);
    }

    console.log("✅ All scheduled jobs are now active");
  }

  async stop() {
    if (!this.isRunning) {
      console.log("⚠️ Scheduler is not running");
      return;
    }

    console.log("🛑 Stopping automation scheduler");
    this.isRunning = false;

    // Stop all jobs
    for (const [jobName, jobInfo] of this.jobs) {
      jobInfo.job.stop();
      console.log(`⏹️ Stopped job: ${jobName}`);
    }

    console.log("✅ All scheduled jobs stopped");
  }

  async getStatus() {
    const jobStatuses = {};

    for (const [jobName, jobInfo] of this.jobs) {
      jobStatuses[jobName] = {
        enabled: true,
        status: jobInfo.status,
        lastRun: jobInfo.lastRun,
        nextRun: jobInfo.job.nextDates().toString(),
        cronPattern: jobInfo.schedule.cron,
        description: jobInfo.schedule.description,
      };
    }

    return {
      isRunning: this.isRunning,
      totalJobs: this.jobs.size,
      jobs: jobStatuses,
    };
  }

  setupSignalHandlers() {
    process.on("SIGINT", async () => {
      console.log("\\n🛑 Received SIGINT, stopping scheduler gracefully...");
      await this.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("\\n🛑 Received SIGTERM, stopping scheduler gracefully...");
      await this.stop();
      process.exit(0);
    });
  }
}

// CLI Interface
async function main() {
  const scheduler = new AutomationScheduler();

  try {
    await scheduler.initialize();

    const args = process.argv.slice(2);
    const command = args[0] || "start";

    switch (command) {
      case "start":
        await scheduler.start();

        // Keep the process running
        console.log("\\n📊 Scheduler Status Dashboard:");
        console.log("Press Ctrl+C to stop the scheduler\\n");

        setInterval(async () => {
          const status = await scheduler.getStatus();
          console.clear();
          console.log("🕐 HFRP Automation Scheduler - Live Status\\n");
          console.log(`📊 Running: ${status.isRunning ? "✅ Yes" : "❌ No"}`);
          console.log(`📋 Total Jobs: ${status.totalJobs}\\n`);

          for (const [jobName, jobStatus] of Object.entries(status.jobs)) {
            const statusIcon =
              jobStatus.status === "running"
                ? "🏃"
                : jobStatus.status === "completed"
                  ? "✅"
                  : jobStatus.status === "failed"
                    ? "❌"
                    : "⏸️";

            console.log(`${statusIcon} ${jobName}`);
            console.log(`   Status: ${jobStatus.status}`);
            console.log(`   Last Run: ${jobStatus.lastRun || "Never"}`);
            console.log(`   Next Run: ${jobStatus.nextRun}`);
            console.log(`   Pattern: ${jobStatus.cronPattern}`);
            console.log("");
          }

          console.log("Press Ctrl+C to stop the scheduler");
        }, 30000); // Update every 30 seconds

        // Keep process alive
        process.stdin.resume();
        break;

      case "stop":
        await scheduler.stop();
        break;

      case "status":
        const status = await scheduler.getStatus();
        console.log(JSON.stringify(status, null, 2));
        break;

      case "help":
        console.log(`
🤖 HFRP Relief - Automation Scheduler

Usage: node automation-scheduler.js [command]

Commands:
  start    Start the automation scheduler (default)
  stop     Stop the scheduler
  status   Show current status
  help     Show this help

Examples:
  node automation-scheduler.js start
  node automation-scheduler.js status
        `);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`💥 Scheduler error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AutomationScheduler;
