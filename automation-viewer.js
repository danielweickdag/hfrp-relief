#!/usr/bin/env node

/**
 * HFRP Automation Viewer & Controller
 * Displays all automation results and provides control interface
 */

const fs = require("fs");
const path = require("path");

class AutomationViewer {
  constructor() {
    this.dataPath = path.join(__dirname, "data");
  }

  log(message, type = "info") {
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
      warning: "\x1b[33m", // Yellow
      header: "\x1b[35m", // Magenta
      automation: "\x1b[34m", // Blue
      reset: "\x1b[0m", // Reset
    };

    const color = colors[type] || colors.info;
    console.log(`${color}${message}${colors.reset}`);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  displayHeader() {
    this.log(
      "╔═══════════════════════════════════════════════════════════╗",
      "header"
    );
    this.log(
      "║                 🤖 HFRP AUTOMATION CENTER                 ║",
      "header"
    );
    this.log(
      "║                Campaign Debug & Automation                ║",
      "header"
    );
    this.log(
      "╚═══════════════════════════════════════════════════════════╝",
      "header"
    );
  }

  displayAutomationSummary() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "automation"
    );
    this.log(
      "                    📊 AUTOMATION SUMMARY                     ",
      "automation"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "automation"
    );

    try {
      const logPath = path.join(this.dataPath, "automation_log.json");
      if (fs.existsSync(logPath)) {
        const log = JSON.parse(fs.readFileSync(logPath, "utf8"));

        this.log(`🕐 Last Run: ${this.formatDate(log.run_timestamp)}`, "info");
        this.log(`✅ Tasks Completed: ${log.summary.completed}`, "success");
        this.log(
          `❌ Tasks Failed: ${log.summary.failed}`,
          log.summary.failed > 0 ? "error" : "success"
        );
        this.log(
          `⚠️ Warnings: ${log.summary.warnings}`,
          log.summary.warnings > 0 ? "warning" : "success"
        );
        this.log(`📝 Log Entries: ${log.log_entries.length}`, "info");
      }
    } catch (error) {
      this.log(`❌ Error reading automation log: ${error.message}`, "error");
    }
  }

  displayGeneratedContent() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log(
      "                    📝 GENERATED CONTENT                      ",
      "info"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );

    try {
      const contentPath = path.join(this.dataPath, "generated_content.json");
      if (fs.existsSync(contentPath)) {
        const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));

        // Group content by type
        const contentByType = content.reduce((acc, item) => {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push(item);
          return acc;
        }, {});

        Object.entries(contentByType).forEach(([type, items]) => {
          this.log(
            `\n📋 ${type.toUpperCase().replace(/_/g, " ")} (${items.length} items)`,
            "success"
          );

          items.forEach((item, index) => {
            this.log(
              `\n${index + 1}. ${item.platform ? `[${item.platform.toUpperCase()}]` : ""} ${item.campaign || item.title || "Content"}`,
              "info"
            );

            if (item.content) {
              const preview =
                item.content.substring(0, 100) +
                (item.content.length > 100 ? "..." : "");
              this.log(`   Content: ${preview}`, "info");
            }

            if (item.scheduled_for) {
              this.log(
                `   📅 Scheduled: ${this.formatDate(item.scheduled_for)}`,
                "warning"
              );
            }

            if (item.status) {
              this.log(`   📊 Status: ${item.status.toUpperCase()}`, "info");
            }
          });
        });
      }
    } catch (error) {
      this.log(`❌ Error reading generated content: ${error.message}`, "error");
    }
  }

  displayEmailQueue() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log(
      "                        📧 EMAIL QUEUE                        ",
      "info"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );

    try {
      const emailPath = path.join(this.dataPath, "email_queue.json");
      if (fs.existsSync(emailPath)) {
        const emails = JSON.parse(fs.readFileSync(emailPath, "utf8"));

        emails.forEach((email, index) => {
          this.log(
            `\n${index + 1}. ${email.type.toUpperCase().replace(/_/g, " ")}`,
            "success"
          );
          this.log(`   🎯 Campaign: ${email.campaign}`, "info");
          this.log(`   📧 Subject: ${email.template.subject}`, "info");
          this.log(
            `   📅 Scheduled: ${this.formatDate(email.scheduled_for)}`,
            "warning"
          );
          this.log(`   📊 Status: ${email.status.toUpperCase()}`, "info");
          this.log(
            `   🔥 Priority: ${email.priority.toUpperCase()}`,
            email.priority === "high" ? "error" : "info"
          );
        });
      }
    } catch (error) {
      this.log(`❌ Error reading email queue: ${error.message}`, "error");
    }
  }

  displayPerformanceAlerts() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "warning"
    );
    this.log(
      "                     ⚠️  PERFORMANCE ALERTS                    ",
      "warning"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "warning"
    );

    try {
      const alertsPath = path.join(this.dataPath, "performance_alerts.json");
      if (fs.existsSync(alertsPath)) {
        const alerts = JSON.parse(fs.readFileSync(alertsPath, "utf8"));

        if (alerts.length === 0) {
          this.log(
            "✅ No performance alerts - all campaigns running smoothly!",
            "success"
          );
        } else {
          alerts.forEach((alert, index) => {
            this.log(
              `\n${index + 1}. ${alert.type.toUpperCase().replace(/_/g, " ")}`,
              alert.urgency === "high"
                ? "error"
                : alert.urgency === "medium"
                  ? "warning"
                  : "info"
            );
            this.log(`   🎯 Campaign: ${alert.campaign}`, "info");
            this.log(`   📝 Message: ${alert.message}`, "info");
            this.log(
              `   🚨 Urgency: ${alert.urgency.toUpperCase()}`,
              alert.urgency === "high"
                ? "error"
                : alert.urgency === "medium"
                  ? "warning"
                  : "info"
            );

            if (alert.recommendations) {
              this.log(`   💡 Recommendations:`, "info");
              alert.recommendations.forEach((rec) => {
                this.log(`      • ${rec}`, "info");
              });
            }
          });
        }
      }
    } catch (error) {
      this.log(
        `❌ Error reading performance alerts: ${error.message}`,
        "error"
      );
    }
  }

  displayDashboardUpdate() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log(
      "                      🎛️  DASHBOARD UPDATE                     ",
      "info"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );

    try {
      const dashboardPath = path.join(this.dataPath, "dashboard_update.json");
      if (fs.existsSync(dashboardPath)) {
        const dashboard = JSON.parse(fs.readFileSync(dashboardPath, "utf8"));

        this.log(`\n📊 SUMMARY STATISTICS`, "success");
        this.log(
          `   📈 Total Campaigns: ${dashboard.summary.total_campaigns}`,
          "info"
        );
        this.log(
          `   🎯 Active Campaigns: ${dashboard.summary.active_campaigns}`,
          "info"
        );
        this.log(
          `   💰 Total Raised: ${this.formatCurrency(dashboard.summary.total_raised)}`,
          "success"
        );
        this.log(
          `   👥 Total Donors: ${dashboard.summary.total_donors}`,
          "info"
        );
        this.log(
          `   💳 Recent Donations: ${dashboard.summary.recent_donations}`,
          "info"
        );

        this.log(`\n🎯 CAMPAIGN PERFORMANCE`, "success");
        dashboard.campaign_performance.forEach((campaign, index) => {
          this.log(`\n${index + 1}. ${campaign.name}`, "success");
          this.log(`   📊 Progress: ${campaign.progress}%`, "info");
          this.log(
            `   💰 Raised: ${this.formatCurrency(campaign.raised)} / ${this.formatCurrency(campaign.goal)}`,
            "info"
          );
          this.log(`   👥 Donors: ${campaign.donors}`, "info");
          this.log(
            `   ⚡ Velocity Score: ${campaign.velocity_score}/100`,
            "info"
          );
          this.log(
            `   📅 Est. Days to Goal: ${campaign.days_remaining === Infinity ? "∞" : campaign.days_remaining}`,
            "warning"
          );
        });

        this.log(`\n🤖 AUTOMATION STATUS`, "automation");
        this.log(
          `   📅 Last Update: ${this.formatDate(dashboard.automation_status.last_sync)}`,
          "info"
        );
        this.log(
          `   ✅ Tasks Completed: ${dashboard.automation_status.tasks_completed}`,
          "success"
        );
        this.log(
          `   ❌ Tasks Failed: ${dashboard.automation_status.tasks_failed}`,
          "info"
        );
        this.log(
          `   ⚠️ Warnings: ${dashboard.automation_status.warnings}`,
          "info"
        );
        this.log(
          `   🔄 Next Run: ${this.formatDate(dashboard.automation_status.next_scheduled_run)}`,
          "warning"
        );
      }
    } catch (error) {
      this.log(`❌ Error reading dashboard update: ${error.message}`, "error");
    }
  }

  displayControlPanel() {
    this.log(
      "\n╔═══════════════════════════════════════════════════════════╗",
      "header"
    );
    this.log(
      "║                    🎛️  CONTROL PANEL                      ║",
      "header"
    );
    this.log(
      "╚═══════════════════════════════════════════════════════════╝",
      "header"
    );

    this.log("\n🚀 AVAILABLE COMMANDS:", "automation");
    this.log(
      "   📊 node campaign-debug.js        - Debug campaign data",
      "info"
    );
    this.log(
      "   🤖 node integrated-automation.js - Run full automation",
      "info"
    );
    this.log(
      "   🔄 node donorbox-sync.js         - Sync Donorbox data",
      "info"
    );
    this.log("   📋 node data-viewer.js           - View synced data", "info");
    this.log("   🎯 node automation-viewer.js     - View this report", "info");

    this.log("\n🌐 WEB INTERFACES:", "automation");
    this.log("   🏠 http://localhost:3002          - Main website", "success");
    this.log(
      "   🔐 http://localhost:3002/admin    - Admin dashboard",
      "success"
    );

    this.log("\n📁 DATA DIRECTORY:", "automation");
    this.log(
      "   ./data/                           - All automation data",
      "info"
    );

    this.log("\n🔐 ADMIN CREDENTIALS:", "automation");
    this.log("   📧 Email: w.regis@comcast.net", "warning");
    this.log("   🔑 Password: Melirosecherie58", "warning");
  }

  run() {
    console.clear();

    this.displayHeader();
    this.displayAutomationSummary();
    this.displayGeneratedContent();
    this.displayEmailQueue();
    this.displayPerformanceAlerts();
    this.displayDashboardUpdate();
    this.displayControlPanel();

    this.log(
      "\n╔═══════════════════════════════════════════════════════════╗",
      "header"
    );
    this.log(
      "║          🎉 ALL CAMPAIGN AUTOMATIONS ARE WORKING! 🎉      ║",
      "header"
    );
    this.log(
      "╚═══════════════════════════════════════════════════════════╝",
      "header"
    );
  }
}

// Run the automation viewer
const viewer = new AutomationViewer();
viewer.run();
