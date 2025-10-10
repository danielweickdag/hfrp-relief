#!/usr/bin/env node

/**
 * Campaign Dashboard Viewer
 * Display comprehensive campaign data and sync status
 */

const fs = require("fs");
const path = require("path");

class CampaignViewer {
  constructor() {
    this.dataPath = path.join(__dirname, "data");
  }

  log(message, type = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      header: "\x1b[35m",
      reset: "\x1b[0m",
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
    });
  }

  createProgressBar(percentage, width = 20) {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  getMomentumEmoji(score) {
    if (score >= 80) return "🚀";
    if (score >= 60) return "📈";
    if (score >= 40) return "📊";
    if (score >= 20) return "📉";
    return "⚠️";
  }

  displayHeader() {
    console.clear();
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );
    this.log(
      "             📊 HFRP CAMPAIGN DASHBOARD                      ",
      "header"
    );
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );
  }

  displaySyncStatus() {
    try {
      const reportPath = path.join(this.dataPath, "donorbox_sync_report.json");
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

        this.log("\n🔄 SYNC STATUS", "info");
        this.log(
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "info"
        );
        this.log(
          `📅 Last Sync: ${this.formatDate(report.sync_timestamp)}`,
          "info"
        );
        this.log(
          `🌐 API Status: ${report.api_status.toUpperCase()}`,
          report.api_status === "healthy" ? "success" : "warning"
        );
        this.log(`🔐 Account: ${report.credentials_used}`, "info");
        this.log(
          `🎯 Campaigns: ${report.campaign_summary.campaigns_synced}`,
          "success"
        );
      }
    } catch (error) {
      this.log("❌ Could not load sync status", "error");
    }
  }

  displayCampaignSummary() {
    try {
      const dashboardPath = path.join(this.dataPath, "campaign_dashboard.json");
      if (fs.existsSync(dashboardPath)) {
        const dashboard = JSON.parse(fs.readFileSync(dashboardPath, "utf8"));

        this.log("\n📊 CAMPAIGN OVERVIEW", "info");
        this.log(
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "info"
        );
        this.log(
          `📈 Total Goal: ${this.formatCurrency(dashboard.summary.total_goal)}`,
          "info"
        );
        this.log(
          `💰 Total Raised: ${this.formatCurrency(dashboard.summary.total_raised)}`,
          "success"
        );
        this.log(
          `📊 Overall Progress: ${dashboard.summary.average_progress}%`,
          "warning"
        );
        this.log(
          `🎯 Active Campaigns: ${dashboard.summary.active_campaigns}/${dashboard.summary.total_campaigns}`,
          "info"
        );
        this.log(
          `👥 Total Donors: ${dashboard.summary.total_donors}`,
          "success"
        );

        const overallProgress =
          (dashboard.summary.total_raised / dashboard.summary.total_goal) * 100;
        const progressBar = this.createProgressBar(overallProgress);
        this.log(
          `📈 [${progressBar}] ${overallProgress.toFixed(1)}%`,
          "warning"
        );
      }
    } catch (error) {
      this.log("❌ Could not load campaign summary", "error");
    }
  }

  displayCampaignDetails() {
    try {
      const campaignsPath = path.join(this.dataPath, "campaigns_real.json");
      if (fs.existsSync(campaignsPath)) {
        const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));

        this.log("\n🎯 CAMPAIGN DETAILS", "info");
        this.log(
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "info"
        );

        campaigns.forEach((campaign, index) => {
          const momentum = this.getMomentumEmoji(
            campaign.performance_metrics.momentum_score
          );

          this.log(`\n${index + 1}. ${campaign.name} ${momentum}`, "success");
          this.log(`   📝 ${campaign.description}`, "info");
          this.log(
            `   🎯 Goal: ${this.formatCurrency(campaign.goal_amount)}`,
            "info"
          );
          this.log(
            `   💰 Raised: ${this.formatCurrency(campaign.raised_amount)}`,
            "success"
          );
          this.log(
            `   📊 Progress: ${campaign.progress_percentage}%`,
            "warning"
          );
          this.log(
            `   👥 Donors: ${campaign.donor_count} (${campaign.donation_count} donations)`,
            "info"
          );
          this.log(
            `   💵 Avg Donation: ${this.formatCurrency(campaign.average_donation)}`,
            "info"
          );
          this.log(
            `   📅 Created: ${this.formatDate(campaign.created_at)}`,
            "info"
          );
          this.log(`   🌐 URL: ${campaign.url}`, "info");

          // Progress bar
          const progressBar = this.createProgressBar(
            parseFloat(campaign.progress_percentage)
          );
          this.log(
            `   📈 [${progressBar}] ${campaign.progress_percentage}%`,
            "warning"
          );

          // Performance metrics
          this.log(`   📊 Performance Metrics:`, "info");
          this.log(
            `      • Conversion Rate: ${campaign.performance_metrics.conversion_rate}x`,
            "info"
          );
          this.log(
            `      • Daily Velocity: ${this.formatCurrency(campaign.performance_metrics.funding_velocity)}/day`,
            "info"
          );
          this.log(
            `      • Days to Goal: ${campaign.performance_metrics.days_remaining}`,
            "info"
          );
          this.log(
            `      • Momentum Score: ${campaign.performance_metrics.momentum_score}/100 ${momentum}`,
            "warning"
          );

          // Status indicators
          const status =
            campaign.status === "active" ? "✅ ACTIVE" : "⏸️ INACTIVE";
          this.log(
            `   🔄 Status: ${status}`,
            campaign.status === "active" ? "success" : "warning"
          );
        });
      }
    } catch (error) {
      this.log("❌ Could not load campaign details", "error");
    }
  }

  displayTopPerformers() {
    try {
      const dashboardPath = path.join(this.dataPath, "campaign_dashboard.json");
      if (fs.existsSync(dashboardPath)) {
        const dashboard = JSON.parse(fs.readFileSync(dashboardPath, "utf8"));

        this.log("\n🏆 TOP PERFORMING CAMPAIGNS", "success");
        this.log(
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "info"
        );

        dashboard.top_performers.forEach((campaign, index) => {
          const medal = ["🥇", "🥈", "🥉"][index] || "🏅";
          this.log(`${medal} ${campaign.name}`, "success");
          this.log(
            `   📊 ${campaign.progress_percentage}% complete`,
            "warning"
          );
          this.log(
            `   💰 ${this.formatCurrency(campaign.raised_amount)} raised`,
            "success"
          );
        });

        if (dashboard.needs_attention && dashboard.needs_attention.length > 0) {
          this.log("\n⚠️  CAMPAIGNS NEEDING ATTENTION", "warning");
          this.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "info"
          );

          dashboard.needs_attention.forEach((campaign) => {
            this.log(`🚨 ${campaign.name}`, "warning");
            this.log(
              `   📊 Only ${campaign.progress_percentage}% complete`,
              "error"
            );
            this.log(`   💡 Needs marketing boost`, "warning");
          });
        }
      }
    } catch (error) {
      this.log("❌ Could not load performance data", "error");
    }
  }

  displayStripeCampaignUrls() {
    try {
      const campaignsPath = path.join(this.dataPath, "campaigns_real.json");
      if (fs.existsSync(campaignsPath)) {
        const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));

        this.log("\n🌐 STRIPE CAMPAIGN URLS", "info");
        this.log(
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "info"
        );

        campaigns.forEach((campaign, index) => {
          this.log(`${index + 1}. ${campaign.name}`, "success");
          this.log(`   🔗 ${campaign.url}`, "info");
        });
      }
    } catch (error) {
      this.log("❌ Could not load campaign URLs", "error");
    }
  }

  displayAutomationStatus() {
    this.log("\n🤖 AUTOMATION STATUS", "info");
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log("✅ Real-time sync with Stripe", "success");
    this.log("✅ Campaign progress tracking", "success");
    this.log("✅ Performance analytics", "success");
    this.log("✅ Donor segmentation", "success");
    this.log("✅ Automated reporting", "success");
    this.log("🔄 Next sync: Automated via workflows", "warning");
  }

  displayFooter() {
    this.log(
      "\n═══════════════════════════════════════════════════════════",
      "header"
    );
    this.log(
      "                        🚀 QUICK ACTIONS                      ",
      "header"
    );
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );
    this.log("📋 Commands:", "info");
    this.log("• ./stripe-sync.sh              - Sync Stripe campaigns", "info");
    this.log("• ./setup-stripe-automation.sh  - Configure Stripe automation", "info");
    this.log("• node campaign-viewer.js       - View this dashboard", "info");
    this.log("• node data-viewer.js           - View all data", "info");

    this.log("\n🌐 Links:", "info");
    this.log("• HFRP Admin: http://localhost:3002/admin", "success");
    this.log("• Stripe Dashboard: https://dashboard.stripe.com/test", "info");
    this.log("• Account: w.regis@comcast.net", "warning");
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );
  }

  run() {
    this.displayHeader();
    this.displaySyncStatus();
    this.displayCampaignSummary();
    this.displayCampaignDetails();
    this.displayTopPerformers();
    this.displayStripeCampaignUrls();
    this.displayAutomationStatus();
    this.displayFooter();
  }
}

// Run the campaign viewer
const viewer = new CampaignViewer();
viewer.run();
