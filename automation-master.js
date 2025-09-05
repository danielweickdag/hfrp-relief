#!/usr/bin/env node

/**
 * HFRP Relief - Master Automation System
 * Automates and syncs all platform systems
 */

const fs = require("fs").promises;
const path = require("path");

class MasterAutomation {
  constructor() {
    this.config = {
      dataDir: "./data",
      logFile: "./data/automation_master.log",
      syncInterval: 300000, // 5 minutes
      backupInterval: 3600000, // 1 hour
    };

    this.systems = [
      "stripe-sync",
      "campaign-sync",
      "donation-tracking",
      "analytics-update",
      "webhook-processing",
      "data-backup",
      "health-monitoring",
    ];

    this.isRunning = false;
    this.lastSync = null;
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      errors: 0,
      lastError: null,
    };
  }

  async initialize() {
    await this.log("🚀 Initializing Master Automation System");

    // Ensure data directories exist
    await this.ensureDirectories();

    // Load previous state
    await this.loadState();

    // Start monitoring systems
    await this.startMonitoring();

    await this.log("✅ Master Automation System initialized");
  }

  async ensureDirectories() {
    const dirs = [
      "data",
      "data/backups",
      "data/logs",
      "data/sync-reports",
      "data/automation",
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
  }

  async loadState() {
    try {
      const stateFile = path.join(this.config.dataDir, "automation_state.json");
      const state = await fs.readFile(stateFile, "utf8");
      const data = JSON.parse(state);

      this.lastSync = data.lastSync;
      this.syncStats = { ...this.syncStats, ...data.syncStats };

      await this.log(`📊 Loaded previous state - Last sync: ${this.lastSync}`);
    } catch (error) {
      await this.log("📝 No previous state found, starting fresh");
    }
  }

  async saveState() {
    try {
      const stateFile = path.join(this.config.dataDir, "automation_state.json");
      const state = {
        lastSync: this.lastSync,
        syncStats: this.syncStats,
        timestamp: new Date().toISOString(),
      };

      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      await this.log(`❌ Failed to save state: ${error.message}`);
    }
  }

  async startMonitoring() {
    if (this.isRunning) {
      await this.log("⚠️ Monitoring already running");
      return;
    }

    this.isRunning = true;
    await this.log("🔄 Starting continuous monitoring");

    // Immediate sync
    await this.runFullSync();

    // Schedule periodic syncs
    this.syncTimer = setInterval(async () => {
      await this.runFullSync();
    }, this.config.syncInterval);

    // Schedule periodic backups
    this.backupTimer = setInterval(async () => {
      await this.createBackup();
    }, this.config.backupInterval);

    // Health check every minute
    this.healthTimer = setInterval(async () => {
      await this.healthCheck();
    }, 60000);
  }

  async stopMonitoring() {
    this.isRunning = false;

    if (this.syncTimer) clearInterval(this.syncTimer);
    if (this.backupTimer) clearInterval(this.backupTimer);
    if (this.healthTimer) clearInterval(this.healthTimer);

    await this.saveState();
    await this.log("🛑 Monitoring stopped");
  }

  async runFullSync() {
    const startTime = Date.now();
    await this.log("🔄 Starting full system sync...");

    try {
      this.syncStats.totalSyncs++;

      const results = {
        stripe: await this.syncStripe(),
        campaigns: await this.syncCampaigns(),
        donations: await this.syncDonations(),
        analytics: await this.updateAnalytics(),
        webhooks: await this.processWebhooks(),
      };

      this.lastSync = new Date().toISOString();
      this.syncStats.successfulSyncs++;

      const duration = Date.now() - startTime;

      await this.log(`✅ Full sync completed in ${duration}ms`);
      await this.generateSyncReport(results, duration);
    } catch (error) {
      this.syncStats.errors++;
      this.syncStats.lastError = error.message;
      await this.log(`❌ Sync failed: ${error.message}`);
    }

    await this.saveState();
  }

  async syncStripe() {
    await this.log("💳 Syncing Stripe data...");

    try {
      // This would integrate with your Stripe service
      const response = await fetch("http://localhost:3001/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "full-sync" }),
      });

      if (!response.ok) {
        throw new Error(`Stripe sync failed: ${response.statusText}`);
      }

      const data = await response.json();
      await this.log(
        `💳 Stripe sync: ${data.products || 0} products, ${data.prices || 0} prices`
      );

      return { success: true, data };
    } catch (error) {
      await this.log(`❌ Stripe sync error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async syncCampaigns() {
    await this.log("🎯 Syncing campaigns...");

    try {
      const campaignsFile = path.join(this.config.dataDir, "campaigns.json");
      let campaigns = [];

      try {
        const campaignsData = await fs.readFile(campaignsFile, "utf8");
        campaigns = JSON.parse(campaignsData);
      } catch {
        // File doesn't exist, use empty array
      }

      // Update campaign statistics
      for (const campaign of campaigns) {
        // Calculate progress
        if (campaign.goal > 0) {
          campaign.progress_percentage = (
            ((campaign.raised || 0) / campaign.goal) *
            100
          ).toFixed(1);
        }

        // Update sync timestamp
        campaign.synced_at = new Date().toISOString();
      }

      await fs.writeFile(campaignsFile, JSON.stringify(campaigns, null, 2));
      await this.log(
        `🎯 Campaigns sync: ${campaigns.length} campaigns updated`
      );

      return { success: true, count: campaigns.length };
    } catch (error) {
      await this.log(`❌ Campaign sync error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async syncDonations() {
    await this.log("💰 Syncing donations...");

    try {
      const donationsFile = path.join(this.config.dataDir, "donations.json");
      let donations = [];

      try {
        const donationsData = await fs.readFile(donationsFile, "utf8");
        donations = JSON.parse(donationsData);
      } catch {
        // File doesn't exist, create sample data
        donations = [
          {
            id: "don_" + Date.now(),
            amount: 100,
            currency: "usd",
            campaignId: "haiti-relief-main",
            donorName: "Anonymous",
            donorEmail: "donor@example.com",
            status: "completed",
            createdAt: new Date().toISOString(),
            syncedAt: new Date().toISOString(),
          },
        ];
      }

      // Update sync timestamps
      donations.forEach((donation) => {
        donation.syncedAt = new Date().toISOString();
      });

      await fs.writeFile(donationsFile, JSON.stringify(donations, null, 2));
      await this.log(
        `💰 Donations sync: ${donations.length} donations processed`
      );

      return { success: true, count: donations.length };
    } catch (error) {
      await this.log(`❌ Donations sync error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async updateAnalytics() {
    await this.log("📊 Updating analytics...");

    try {
      const analyticsFile = path.join(
        this.config.dataDir,
        "analytics_summary.json"
      );

      // Fetch fresh analytics data
      const response = await fetch(
        "http://localhost:3001/api/stripe/analytics"
      );
      const analyticsData = await response.json();

      if (analyticsData.success) {
        await fs.writeFile(
          analyticsFile,
          JSON.stringify(analyticsData.analytics, null, 2)
        );
        await this.log("📊 Analytics updated successfully");

        return { success: true, data: analyticsData.analytics };
      } else {
        throw new Error("Analytics API returned error");
      }
    } catch (error) {
      await this.log(`❌ Analytics update error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async processWebhooks() {
    await this.log("🔗 Processing webhooks...");

    try {
      // This would process any pending webhook events
      await this.log("🔗 Webhook processing completed");
      return { success: true, processed: 0 };
    } catch (error) {
      await this.log(`❌ Webhook processing error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async createBackup() {
    await this.log("💾 Creating system backup...");

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupDir = path.join(
        this.config.dataDir,
        "backups",
        `backup-${timestamp}`
      );

      await fs.mkdir(backupDir, { recursive: true });

      // Backup data files
      const dataFiles = await fs.readdir(this.config.dataDir);
      let backedUpFiles = 0;

      for (const file of dataFiles) {
        if (file.endsWith(".json")) {
          const srcPath = path.join(this.config.dataDir, file);
          const destPath = path.join(backupDir, file);

          try {
            await fs.copyFile(srcPath, destPath);
            backedUpFiles++;
          } catch (error) {
            await this.log(`⚠️ Failed to backup ${file}: ${error.message}`);
          }
        }
      }

      // Create backup manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        files: backedUpFiles,
        syncStats: this.syncStats,
      };

      await fs.writeFile(
        path.join(backupDir, "manifest.json"),
        JSON.stringify(manifest, null, 2)
      );

      await this.log(`💾 Backup created: ${backedUpFiles} files backed up`);
      return { success: true, files: backedUpFiles };
    } catch (error) {
      await this.log(`❌ Backup error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async healthCheck() {
    try {
      // Check if server is running
      const response = await fetch(
        "http://localhost:3001/api/stripe/analytics"
      );

      if (response.ok) {
        // Server is healthy
        return { status: "healthy", timestamp: new Date().toISOString() };
      } else {
        await this.log(
          `⚠️ Health check warning: Server returned ${response.status}`
        );
        return { status: "warning", timestamp: new Date().toISOString() };
      }
    } catch (error) {
      await this.log(`❌ Health check failed: ${error.message}`);
      return {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateSyncReport(results, duration) {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      duration,
      results,
      stats: this.syncStats,
      summary: {
        successful: Object.values(results).filter((r) => r.success).length,
        failed: Object.values(results).filter((r) => !r.success).length,
        total: Object.keys(results).length,
      },
    };

    const reportFile = path.join(
      this.config.dataDir,
      "sync-reports",
      `sync-${timestamp.replace(/[:.]/g, "-")}.json`
    );

    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    console.log(logMessage);

    try {
      await fs.appendFile(this.config.logFile, logMessage + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  async getStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSync,
      stats: this.syncStats,
      systems: this.systems,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
    };
  }
}

// CLI Interface
if (require.main === module) {
  const automation = new MasterAutomation();

  const command = process.argv[2];

  switch (command) {
    case "start":
      automation.startTime = Date.now();
      automation.initialize().catch(console.error);
      break;

    case "stop":
      automation.stopMonitoring().then(() => process.exit(0));
      break;

    case "sync":
      automation.runFullSync().then(() => process.exit(0));
      break;

    case "status":
      automation.getStatus().then((status) => {
        console.log(JSON.stringify(status, null, 2));
        process.exit(0);
      });
      break;

    case "backup":
      automation.createBackup().then(() => process.exit(0));
      break;

    default:
      console.log(`
HFRP Relief Master Automation System

Commands:
  start   - Start continuous monitoring and sync
  stop    - Stop monitoring and save state  
  sync    - Run one-time full sync
  status  - Show current status
  backup  - Create manual backup

Usage: node automation-master.js <command>
      `);
      break;
  }
}

module.exports = MasterAutomation;
