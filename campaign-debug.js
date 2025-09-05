#!/usr/bin/env node

/**
 * HFRP Campaign Debugger & Automation Script
 * Debugs campaign data and automates campaign management
 */

const fs = require("fs");
const path = require("path");

class CampaignDebugger {
  constructor() {
    this.dataPath = path.join(__dirname, "data");
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
    this.automations = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
      warning: "\x1b[33m", // Yellow
      debug: "\x1b[35m", // Magenta
      reset: "\x1b[0m", // Reset
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async debugCampaignData() {
    this.log("🔍 Starting campaign data debugging...", "debug");

    try {
      const campaignsPath = path.join(this.dataPath, "campaigns.json");

      if (!fs.existsSync(campaignsPath)) {
        this.errors.push("Campaigns data file missing");
        this.log("❌ Campaigns data file not found", "error");
        return false;
      }

      const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));
      this.log(`✅ Found ${campaigns.length} campaigns to debug`, "success");

      campaigns.forEach((campaign, index) => {
        this.log(
          `\n🔍 Debugging Campaign ${index + 1}: "${campaign.name}"`,
          "debug"
        );

        // Check required fields
        const requiredFields = [
          "id",
          "name",
          "goal",
          "raised",
          "donors",
          "status",
        ];
        const missingFields = requiredFields.filter(
          (field) => !campaign.hasOwnProperty(field)
        );

        if (missingFields.length > 0) {
          this.errors.push(
            `Campaign "${campaign.name}" missing fields: ${missingFields.join(", ")}`
          );
          this.log(`❌ Missing fields: ${missingFields.join(", ")}`, "error");
        } else {
          this.log("✅ All required fields present", "success");
        }

        // Validate data types
        if (typeof campaign.goal !== "number" || campaign.goal <= 0) {
          this.errors.push(
            `Campaign "${campaign.name}" has invalid goal: ${campaign.goal}`
          );
          this.log(`❌ Invalid goal amount: ${campaign.goal}`, "error");
        }

        if (typeof campaign.raised !== "number" || campaign.raised < 0) {
          this.errors.push(
            `Campaign "${campaign.name}" has invalid raised amount: ${campaign.raised}`
          );
          this.log(`❌ Invalid raised amount: ${campaign.raised}`, "error");
        }

        // Check progress calculation
        const calculatedProgress = (
          (campaign.raised / campaign.goal) *
          100
        ).toFixed(1);
        if (campaign.progress_percentage !== calculatedProgress) {
          this.warnings.push(
            `Campaign "${campaign.name}" progress mismatch: stored=${campaign.progress_percentage}%, calculated=${calculatedProgress}%`
          );
          this.log(
            `⚠️ Progress mismatch: ${campaign.progress_percentage}% vs ${calculatedProgress}%`,
            "warning"
          );

          // Auto-fix progress
          campaign.progress_percentage = calculatedProgress;
          this.fixes.push(`Fixed progress calculation for "${campaign.name}"`);
          this.log(
            `🔧 Auto-fixed progress to ${calculatedProgress}%`,
            "success"
          );
        }

        // Performance analytics
        const avgDonationAmount = campaign.raised / campaign.donors;
        this.log(
          `📊 Average donation: $${avgDonationAmount.toFixed(2)}`,
          "info"
        );

        if (avgDonationAmount < 50) {
          this.warnings.push(
            `Campaign "${campaign.name}" has low average donation amount: $${avgDonationAmount.toFixed(2)}`
          );
          this.log(`⚠️ Low average donation detected`, "warning");
        }

        // Goal achievement timeline
        const daysRunning = Math.ceil(
          (new Date() - new Date(campaign.created)) / (1000 * 60 * 60 * 24)
        );
        const dailyRate = campaign.raised / daysRunning;
        const daysToGoal = Math.ceil(
          (campaign.goal - campaign.raised) / dailyRate
        );

        this.log(
          `📅 Running for ${daysRunning} days, daily rate: $${dailyRate.toFixed(2)}`,
          "info"
        );
        this.log(`🎯 Estimated ${daysToGoal} days to reach goal`, "info");

        if (daysToGoal > 365) {
          this.warnings.push(
            `Campaign "${campaign.name}" may take over a year to reach goal at current rate`
          );
          this.log(`⚠️ Goal timeline concern: ${daysToGoal} days`, "warning");
        }
      });

      // Save fixed data
      if (this.fixes.length > 0) {
        fs.writeFileSync(campaignsPath, JSON.stringify(campaigns, null, 2));
        this.log(
          `🔧 Applied ${this.fixes.length} fixes to campaign data`,
          "success"
        );
      }

      return true;
    } catch (error) {
      this.errors.push(`Campaign debugging failed: ${error.message}`);
      this.log(`❌ Debugging error: ${error.message}`, "error");
      return false;
    }
  }

  async automateCampaignManagement() {
    this.log("\n🤖 Starting campaign automation...", "debug");

    try {
      const campaignsPath = path.join(this.dataPath, "campaigns.json");
      const campaigns = JSON.parse(fs.readFileSync(campaignsPath, "utf8"));

      const automationResults = {
        alerts: [],
        recommendations: [],
        actions: [],
        reports: [],
      };

      campaigns.forEach((campaign) => {
        this.log(`\n🤖 Automating campaign: "${campaign.name}"`, "info");

        // 1. Performance Monitoring
        const progressPercent = parseFloat(campaign.progress_percentage);

        if (progressPercent >= 90) {
          automationResults.alerts.push({
            type: "success",
            campaign: campaign.name,
            message: "Campaign near completion! Consider celebration campaign.",
            action: "prepare_completion_strategy",
          });
          this.log(
            "🎉 Near completion detected - preparing celebration strategy",
            "success"
          );
        } else if (
          progressPercent < 25 &&
          this.getDaysRunning(campaign.created) > 30
        ) {
          automationResults.alerts.push({
            type: "warning",
            campaign: campaign.name,
            message: "Low progress after 30 days - boost needed",
            action: "increase_marketing",
          });
          this.log("⚠️ Low progress alert - marketing boost needed", "warning");
        }

        // 2. Donor Engagement Automation
        const avgDonation = campaign.raised / campaign.donors;
        if (avgDonation > 200) {
          automationResults.recommendations.push({
            campaign: campaign.name,
            type: "donor_appreciation",
            message: "High-value donors detected - send personalized thank you",
            priority: "high",
          });
          this.log(
            "💎 High-value donors detected - personalized outreach recommended",
            "info"
          );
        }

        // 3. Goal Adjustment Recommendations
        if (progressPercent > 95) {
          const newGoal = Math.ceil(campaign.goal * 1.2);
          automationResults.recommendations.push({
            campaign: campaign.name,
            type: "goal_increase",
            message: `Consider increasing goal to $${newGoal.toLocaleString()}`,
            current_goal: campaign.goal,
            suggested_goal: newGoal,
          });
          this.log(
            `📈 Goal increase recommended: $${newGoal.toLocaleString()}`,
            "info"
          );
        }

        // 4. Content Generation
        const contentSuggestion = this.generateCampaignContent(campaign);
        automationResults.actions.push({
          campaign: campaign.name,
          type: "content_generation",
          content: contentSuggestion,
        });

        // 5. Performance Report
        const report = this.generatePerformanceReport(campaign);
        automationResults.reports.push(report);
      });

      // Save automation results
      const automationPath = path.join(
        this.dataPath,
        "campaign_automation.json"
      );
      fs.writeFileSync(
        automationPath,
        JSON.stringify(automationResults, null, 2)
      );

      this.automations = automationResults;
      this.log(
        `🤖 Campaign automation completed - ${automationResults.alerts.length} alerts, ${automationResults.recommendations.length} recommendations`,
        "success"
      );

      return true;
    } catch (error) {
      this.errors.push(`Campaign automation failed: ${error.message}`);
      this.log(`❌ Automation error: ${error.message}`, "error");
      return false;
    }
  }

  generateCampaignContent(campaign) {
    const progressPercent = parseFloat(campaign.progress_percentage);
    const templates = {
      low_progress: {
        title: `Help Us Reach Our ${campaign.name} Goal!`,
        message: `We're ${progressPercent}% of the way to our $${campaign.goal.toLocaleString()} goal for ${campaign.name}. Every donation brings hope to families in Haiti. Join ${campaign.donors} supporters who have already contributed!`,
        hashtags: [
          "#HFRP",
          "#HopeForHaiti",
          `#${campaign.name.replace(/ /g, "")}`,
        ],
        cta: "Donate Now and Make a Difference!",
      },
      high_progress: {
        title: `Almost There! ${campaign.name} at ${progressPercent}%`,
        message: `Amazing! We're ${progressPercent}% toward our ${campaign.name} goal! Just $${(campaign.goal - campaign.raised).toLocaleString()} more needed. Help us cross the finish line!`,
        hashtags: [
          "#HFRP",
          "#AlmostThere",
          `#${campaign.name.replace(/ /g, "")}`,
        ],
        cta: "Help Us Reach 100%!",
      },
      milestone: {
        title: `Milestone Alert: ${campaign.name} Progress Update`,
        message: `Incredible news! Thanks to ${campaign.donors} amazing supporters, we've raised $${campaign.raised.toLocaleString()} for ${campaign.name}. We're ${progressPercent}% to our goal!`,
        hashtags: ["#HFRP", "#Milestone", "#ThankYou"],
        cta: "Keep the Momentum Going!",
      },
    };

    if (progressPercent >= 75) return templates.high_progress;
    if (progressPercent >= 50) return templates.milestone;
    return templates.low_progress;
  }

  generatePerformanceReport(campaign) {
    const daysRunning = this.getDaysRunning(campaign.created);
    const dailyRate = campaign.raised / daysRunning;
    const projectedTotal = dailyRate * 365; // Annual projection

    return {
      campaign_name: campaign.name,
      current_status: {
        progress_percentage: campaign.progress_percentage,
        amount_raised: campaign.raised,
        goal_amount: campaign.goal,
        donors_count: campaign.donors,
        days_running: daysRunning,
      },
      performance_metrics: {
        daily_average: Math.round(dailyRate * 100) / 100,
        average_donation:
          Math.round((campaign.raised / campaign.donors) * 100) / 100,
        projected_annual: Math.round(projectedTotal),
        velocity_score: this.calculateVelocityScore(campaign),
      },
      recommendations: this.generateRecommendations(campaign),
    };
  }

  getDaysRunning(createdDate) {
    return Math.ceil(
      (new Date() - new Date(createdDate)) / (1000 * 60 * 60 * 24)
    );
  }

  calculateVelocityScore(campaign) {
    // Score based on progress rate, donor count, and time
    const progressPercent = parseFloat(campaign.progress_percentage);
    const daysRunning = this.getDaysRunning(campaign.created);
    const donorDensity = campaign.donors / daysRunning;

    let score = 0;
    score += progressPercent * 0.4; // 40% weight on progress
    score += Math.min(donorDensity * 10, 30); // 30% max weight on donor acquisition rate
    score += Math.min((campaign.raised / campaign.goal) * 30, 30); // 30% weight on goal achievement

    return Math.round(score * 10) / 10;
  }

  generateRecommendations(campaign) {
    const recommendations = [];
    const progressPercent = parseFloat(campaign.progress_percentage);
    const avgDonation = campaign.raised / campaign.donors;

    if (progressPercent < 30) {
      recommendations.push("Increase social media presence and engagement");
      recommendations.push(
        "Consider email marketing campaign to existing donors"
      );
    }

    if (avgDonation < 100) {
      recommendations.push("Target higher-value donor segments");
      recommendations.push("Create premium giving levels with incentives");
    }

    if (campaign.donors < 50) {
      recommendations.push("Focus on donor acquisition strategies");
      recommendations.push("Implement referral program for existing donors");
    }

    return recommendations;
  }

  async createAutomationSchedule() {
    this.log("\n📅 Creating automation schedule...", "debug");

    const schedule = {
      daily_tasks: [
        {
          time: "09:00",
          task: "Check campaign progress and send alerts",
          automation: "progress_monitor",
        },
        {
          time: "15:00",
          task: "Generate social media content",
          automation: "content_generator",
        },
      ],
      weekly_tasks: [
        {
          day: "Monday",
          task: "Generate comprehensive campaign reports",
          automation: "weekly_report",
        },
        {
          day: "Friday",
          task: "Analyze donor engagement and send recommendations",
          automation: "donor_analysis",
        },
      ],
      monthly_tasks: [
        {
          task: "Full campaign performance review",
          automation: "monthly_review",
        },
        {
          task: "Goal adjustment recommendations",
          automation: "goal_optimization",
        },
      ],
    };

    const schedulePath = path.join(this.dataPath, "automation_schedule.json");
    fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2));

    this.log("✅ Automation schedule created and saved", "success");
    return schedule;
  }

  async generateDebugReport() {
    this.log("\n📋 Generating debug report...", "debug");

    const report = {
      debug_timestamp: new Date().toISOString(),
      summary: {
        errors_found: this.errors.length,
        warnings_found: this.warnings.length,
        fixes_applied: this.fixes.length,
        automations_created: Object.keys(this.automations).length,
      },
      errors: this.errors,
      warnings: this.warnings,
      fixes_applied: this.fixes,
      automation_results: this.automations,
      recommendations: [
        "Set up automated daily monitoring",
        "Implement real-time progress tracking",
        "Create donor engagement workflows",
        "Establish performance benchmarks",
      ],
    };

    const reportPath = path.join(this.dataPath, "campaign_debug_report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`✅ Debug report saved to: ${reportPath}`, "success");
    return report;
  }

  async run() {
    this.log("🚀 Starting Campaign Debugger & Automation...", "info");
    this.log(
      "═══════════════════════════════════════════════════════════",
      "info"
    );

    try {
      // Step 1: Debug campaign data
      await this.debugCampaignData();

      // Step 2: Automate campaign management
      await this.automateCampaignManagement();

      // Step 3: Create automation schedule
      await this.createAutomationSchedule();

      // Step 4: Generate debug report
      const report = await this.generateDebugReport();

      // Final summary
      this.log(
        "═══════════════════════════════════════════════════════════",
        "info"
      );
      this.log("📊 CAMPAIGN DEBUG & AUTOMATION COMPLETE!", "success");
      this.log(
        "═══════════════════════════════════════════════════════════",
        "info"
      );
      this.log(
        `❌ Errors found: ${this.errors.length}`,
        this.errors.length > 0 ? "error" : "success"
      );
      this.log(
        `⚠️ Warnings: ${this.warnings.length}`,
        this.warnings.length > 0 ? "warning" : "success"
      );
      this.log(`🔧 Fixes applied: ${this.fixes.length}`, "success");
      this.log(
        `🤖 Automations created: ${Object.keys(this.automations).length}`,
        "success"
      );

      if (this.errors.length > 0) {
        this.log("\nErrors found:", "error");
        this.errors.forEach((error) => this.log(`  • ${error}`, "error"));
      }

      if (this.warnings.length > 0) {
        this.log("\nWarnings:", "warning");
        this.warnings.forEach((warning) =>
          this.log(`  • ${warning}`, "warning")
        );
      }

      if (this.fixes.length > 0) {
        this.log("\nFixes applied:", "success");
        this.fixes.forEach((fix) => this.log(`  • ${fix}`, "success"));
      }

      this.log(
        "═══════════════════════════════════════════════════════════",
        "info"
      );
      this.log("📁 Reports saved to ./data/ directory", "info");
      this.log("🌐 Admin dashboard: http://localhost:3002/admin", "info");
      this.log("🔄 Run again: node campaign-debug.js", "info");

      return this.errors.length === 0;
    } catch (error) {
      this.log(`❌ Campaign debug failed: ${error.message}`, "error");
      return false;
    }
  }
}

// Run the campaign debugger
const campaignDebugger = new CampaignDebugger();
campaignDebugger.run().then((success) => {
  process.exit(success ? 0 : 1);
});
