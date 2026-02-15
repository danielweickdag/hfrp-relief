#!/usr/bin/env node

/**
 * HFRP Data Viewer
 * Displays synced Stripe data in readable format
 */

const fs = require("fs");
const path = require("path");

class DataViewer {
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

  displaySummary() {
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );
    this.log(
      "                    📊 HFRP DATA SYNC SUMMARY                    ",
      "header"
    );
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );

    try {
      const summaryPath = path.join(this.dataPath, "sync_summary.json");
      if (fs.existsSync(summaryPath)) {
        const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

        this.log(`🕐 Last Sync: ${this.formatDate(summary.last_sync)}`, "info");
        this.log(
          `💰 Total Donations: ${this.formatCurrency(summary.totals.donations)}`,
          "success"
        );
        this.log(`👥 Total Donors: ${summary.totals.donors}`, "success");
        this.log(`🎯 Active Campaigns: ${summary.totals.campaigns}`, "success");
        this.log(
          `✅ Sync Status: ${summary.sync_results.success ? "SUCCESS" : "FAILED"}`,
          summary.sync_results.success ? "success" : "error"
        );
      }
    } catch (error) {
      this.log(`❌ Error reading summary: ${error.message}`, "error");
    }
  }

  displayDonations() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log(
      "                        💰 RECENT DONATIONS                        ",
      "info"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );

    try {
      const donationsPath = path.join(this.dataPath, "donations.json");
      if (fs.existsSync(donationsPath)) {
        const donations = JSON.parse(fs.readFileSync(donationsPath, "utf8"));

        donations.forEach((donation, index) => {
          this.log(`\n${index + 1}. ${donation.donor_name}`, "success");
          this.log(
            `   💳 Amount: ${this.formatCurrency(donation.amount)}`,
            "info"
          );
          this.log(`   📧 Email: ${donation.donor_email}`, "info");
          this.log(`   🎯 Campaign: ${donation.campaign}`, "info");
          this.log(`   📅 Date: ${this.formatDate(donation.date)}`, "info");
          this.log(
            `   💳 Payment: ${donation.payment_method.replace("_", " ").toUpperCase()}`,
            "info"
          );
          this.log(`   ✅ Status: ${donation.status.toUpperCase()}`, "success");
        });
      }
    } catch (error) {
      this.log(`❌ Error reading donations: ${error.message}`, "error");
    }
  }

  displayDonors() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log(
      "                           👥 DONOR PROFILES                         ",
      "info"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );

    try {
      const donorsPath = path.join(this.dataPath, "donors.json");
      if (fs.existsSync(donorsPath)) {
        const donors = JSON.parse(fs.readFileSync(donorsPath, "utf8"));

        donors.forEach((donor, index) => {
          this.log(`\n${index + 1}. ${donor.name}`, "success");
          this.log(`   📧 Email: ${donor.email}`, "info");
          this.log(`   📞 Phone: ${donor.phone}`, "info");
          this.log(`   🏠 Address: ${donor.address}`, "info");
          this.log(
            `   💰 Total Donated: ${this.formatCurrency(donor.total_donated)}`,
            "success"
          );
          this.log(`   🔄 Donations: ${donor.donation_count} times`, "info");
          this.log(
            `   📅 First Donation: ${this.formatDate(donor.first_donation)}`,
            "info"
          );
          this.log(
            `   📅 Last Donation: ${this.formatDate(donor.last_donation)}`,
            "info"
          );
          this.log(`   ✅ Status: ${donor.status.toUpperCase()}`, "success");
        });
      }
    } catch (error) {
      this.log(`❌ Error reading donors: ${error.message}`, "error");
    }
  }

  displayCampaigns() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log(
      "                        🎯 CAMPAIGN STATUS                         ",
      "info"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );

    try {
      const campaignsPath = path.join(this.dataPath, "campaigns.json");
      if (fs.existsSync(campaignsPath)) {
        const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));

        campaigns.forEach((campaign, index) => {
          this.log(`\n${index + 1}. ${campaign.name}`, "success");
          this.log(`   🎯 Goal: ${this.formatCurrency(campaign.goal)}`, "info");
          this.log(
            `   💰 Raised: ${this.formatCurrency(campaign.raised)}`,
            "success"
          );
          this.log(`   📊 Progress: ${campaign.progress_percentage}%`, "info");
          this.log(`   👥 Donors: ${campaign.donors} people`, "info");
          this.log(
            `   📅 Created: ${this.formatDate(campaign.created)}`,
            "info"
          );
          this.log(`   ✅ Status: ${campaign.status.toUpperCase()}`, "success");

          // Progress bar
          const progressBars = Math.floor(
            parseFloat(campaign.progress_percentage) / 5
          );
          const progressBar =
            "█".repeat(progressBars) + "░".repeat(20 - progressBars);
          this.log(
            `   📈 [${progressBar}] ${campaign.progress_percentage}%`,
            "warning"
          );
        });
      }
    } catch (error) {
      this.log(`❌ Error reading campaigns: ${error.message}`, "error");
    }
  }

  displaySyncReport() {
    this.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );
    this.log(
      "                        📋 SYNC REPORT                            ",
      "info"
    );
    this.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "info"
    );

    try {
      const reportPath = path.join(this.dataPath, "last_sync_report.json");
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

        this.log(
          `\n📅 Sync Date: ${this.formatDate(report.sync_date)}`,
          "info"
        );
        this.log(`🔐 Credentials: ${report.credentials_used}`, "info");
        this.log(
          `💰 Donations Synced: ${report.data_summary.donations_synced}`,
          "success"
        );
        this.log(
          `👥 Donors Synced: ${report.data_summary.donors_synced}`,
          "success"
        );
        this.log(
          `🎯 Campaigns Synced: ${report.data_summary.campaigns_synced}`,
          "success"
        );
        this.log(`❌ Errors: ${report.data_summary.errors_count}`, "info");
        this.log(
          `🔄 Next Sync: ${this.formatDate(report.next_sync_recommended)}`,
          "warning"
        );
      }
    } catch (error) {
      this.log(`❌ Error reading sync report: ${error.message}`, "error");
    }
  }

  run() {
    console.clear();

    this.displaySummary();
    this.displayDonations();
    this.displayDonors();
    this.displayCampaigns();
    this.displaySyncReport();

    this.log(
      "\n═══════════════════════════════════════════════════════════",
      "header"
    );
    this.log(
      "                        🚀 NEXT STEPS                           ",
      "header"
    );
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );
    this.log("🌐 View Admin Dashboard: http://localhost:3002/admin", "success");
    this.log("🔄 Run sync again: ./stripe-sync.sh", "info");
    this.log("📊 View data: node data-viewer.js", "info");
    this.log(
      "═══════════════════════════════════════════════════════════",
      "header"
    );
  }
}

// Run the data viewer
const viewer = new DataViewer();
viewer.run();
