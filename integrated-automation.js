#!/usr/bin/env node

/**
 * HFRP Integrated Automation System
 * Connects all automation systems and runs scheduled tasks
 */

const fs = require("fs");
const path = require("path");

class IntegratedAutomation {
  constructor() {
    this.dataPath = path.join(__dirname, "data");
    this.automationLog = [];
    this.taskResults = {
      completed: 0,
      failed: 0,
      warnings: 0,
    };
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
      warning: "\x1b[33m", // Yellow
      automation: "\x1b[35m", // Magenta
      reset: "\x1b[0m", // Reset
    };

    const color = colors[type] || colors.info;
    const logEntry = {
      timestamp,
      message,
      type,
    };

    this.automationLog.push(logEntry);
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async loadDataFiles() {
    this.log("📂 Loading data files...", "info");

    const dataFiles = {
      campaigns: "campaigns.json",
      donations: "donations.json",
      donors: "donors.json",
      automation: "campaign_automation.json",
      schedule: "automation_schedule.json",
    };

    const data = {};

    for (const [key, filename] of Object.entries(dataFiles)) {
      const filePath = path.join(this.dataPath, filename);

      if (fs.existsSync(filePath)) {
        try {
          data[key] = JSON.parse(fs.readFileSync(filePath, "utf8"));
          this.log(`✅ Loaded ${filename}`, "success");
        } catch (error) {
          this.log(`❌ Error loading ${filename}: ${error.message}`, "error");
          data[key] = null;
        }
      } else {
        this.log(`⚠️ ${filename} not found`, "warning");
        data[key] = null;
      }
    }

    return data;
  }

  async runDonorAppreciationAutomation(campaigns, donors) {
    this.log("💝 Running donor appreciation automation...", "automation");

    try {
      const appreciationTasks = [];

      campaigns.forEach((campaign) => {
        const avgDonation = campaign.raised / campaign.donors;

        if (avgDonation > 200) {
          appreciationTasks.push({
            campaign: campaign.name,
            avgDonation: avgDonation,
            action: "send_personalized_thank_you",
            priority: "high",
            template: this.generateThankYouTemplate(campaign, avgDonation),
          });
        }
      });

      // Generate appreciation emails
      const emailResults =
        await this.generateAppreciationEmails(appreciationTasks);

      this.log(
        `✅ Generated ${emailResults.length} appreciation emails`,
        "success"
      );
      this.taskResults.completed += emailResults.length;

      return emailResults;
    } catch (error) {
      this.log(
        `❌ Donor appreciation automation failed: ${error.message}`,
        "error"
      );
      this.taskResults.failed++;
      return [];
    }
  }

  generateThankYouTemplate(campaign, avgDonation) {
    return {
      subject: `Thank You for Your Generous Support of ${campaign.name}!`,
      greeting: "Dear Valued Supporter,",
      body: `
We are deeply grateful for your exceptional generosity toward our ${campaign.name} campaign. 
Your contribution of over $${Math.round(avgDonation)} places you among our most valued supporters.

Thanks to donors like you, we have already raised $${campaign.raised.toLocaleString()} toward our 
goal of $${campaign.goal.toLocaleString()} - that's ${campaign.progress_percentage}% complete!

Your support is making a real difference in the lives of Haitian families. Every dollar helps 
provide essential services, hope, and a brighter future.

We would love to keep you updated on how your donation is being used. Would you be interested 
in receiving a personalized impact report?

With heartfelt gratitude,
The HFRP Team
      `,
      cta: "See Your Impact",
      link: "http://localhost:3002/impact-report",
      footer: "Haitian Family Relief Project | Bringing Hope to Haiti",
    };
  }

  async generateAppreciationEmails(tasks) {
    const emails = [];

    tasks.forEach((task) => {
      emails.push({
        campaign: task.campaign,
        type: "donor_appreciation",
        priority: task.priority,
        template: task.template,
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        status: "queued",
      });
    });

    // Save email queue
    const emailQueuePath = path.join(this.dataPath, "email_queue.json");
    fs.writeFileSync(emailQueuePath, JSON.stringify(emails, null, 2));

    return emails;
  }

  async runContentGenerationAutomation(campaigns) {
    this.log("📝 Running content generation automation...", "automation");

    try {
      const contentPieces = [];

      campaigns.forEach((campaign) => {
        // Generate social media content
        const socialContent = this.generateSocialMediaContent(campaign);
        contentPieces.push(...socialContent);

        // Generate blog content
        const blogContent = this.generateBlogContent(campaign);
        contentPieces.push(blogContent);

        // Generate newsletter content
        const newsletterContent = this.generateNewsletterContent(campaign);
        contentPieces.push(newsletterContent);
      });

      // Save generated content
      const contentPath = path.join(this.dataPath, "generated_content.json");
      fs.writeFileSync(contentPath, JSON.stringify(contentPieces, null, 2));

      this.log(
        `✅ Generated ${contentPieces.length} content pieces`,
        "success"
      );
      this.taskResults.completed += contentPieces.length;

      return contentPieces;
    } catch (error) {
      this.log(`❌ Content generation failed: ${error.message}`, "error");
      this.taskResults.failed++;
      return [];
    }
  }

  generateSocialMediaContent(campaign) {
    const progressPercent = parseFloat(campaign.progress_percentage);
    const content = [];

    // Facebook post
    content.push({
      platform: "facebook",
      campaign: campaign.name,
      type: "progress_update",
      content: `🎯 AMAZING PROGRESS! Our ${campaign.name} campaign is ${progressPercent}% complete! 

$${campaign.raised.toLocaleString()} raised by ${campaign.donors} incredible supporters toward our $${campaign.goal.toLocaleString()} goal.

Every donation brings hope to Haitian families. Join us in making a difference! 

#HFRP #HopeForHaiti #${campaign.name.replace(/ /g, "")} #CommunitySupport`,
      scheduled_for: this.getNextPostTime("facebook"),
      status: "draft",
    });

    // Instagram post
    content.push({
      platform: "instagram",
      campaign: campaign.name,
      type: "visual_story",
      content: `✨ ${progressPercent}% to our goal! ✨

Thanks to ${campaign.donors} amazing supporters, we've raised $${campaign.raised.toLocaleString()} for ${campaign.name}! 

Every story shared, every dollar donated, every prayer offered - it all matters. 

Help us reach $${campaign.goal.toLocaleString()} and transform more lives! 

#HFRP #${campaign.name.replace(/ /g, "")} #Haiti #Hope #Community #Support`,
      image_suggestion: "Progress visualization with Haitian family photos",
      scheduled_for: this.getNextPostTime("instagram"),
      status: "draft",
    });

    // Twitter post
    content.push({
      platform: "twitter",
      campaign: campaign.name,
      type: "milestone_tweet",
      content: `🎉 Milestone alert! ${campaign.name} is ${progressPercent}% funded!

$${campaign.raised.toLocaleString()} raised by ${campaign.donors} supporters
Goal: $${campaign.goal.toLocaleString()}

Every donation counts. Join us! 🙏

#HFRP #Haiti #${campaign.name.replace(/ /g, "")}`,
      scheduled_for: this.getNextPostTime("twitter"),
      status: "draft",
    });

    return content;
  }

  generateBlogContent(campaign) {
    return {
      type: "blog_post",
      campaign: campaign.name,
      title: `${campaign.name}: Stories of Hope and Progress`,
      content: `
Our ${campaign.name} campaign continues to make incredible strides, and we wanted to share some amazing updates with you.

## Progress Update
We're thrilled to announce that we've reached ${campaign.progress_percentage}% of our goal! Thanks to ${campaign.donors} generous supporters, we've raised $${campaign.raised.toLocaleString()} toward our target of $${campaign.goal.toLocaleString()}.

## Real Impact Stories
[This section would include 2-3 specific stories of families or individuals helped by this campaign]

## What's Next
With your continued support, we're on track to reach our goal and help even more families. Every donation, no matter the size, brings us closer to our mission.

## How You Can Help
- **Donate**: Every dollar makes a difference
- **Share**: Spread the word on social media
- **Volunteer**: Join our community efforts
- **Pray**: Keep the families in your thoughts

Thank you for being part of this incredible journey!
      `,
      author: "HFRP Team",
      tags: [
        "campaign-update",
        campaign.name.toLowerCase().replace(/ /g, "-"),
        "progress",
        "impact",
      ],
      scheduled_for: this.getNextPostTime("blog"),
      status: "draft",
    };
  }

  generateNewsletterContent(campaign) {
    return {
      type: "newsletter_section",
      campaign: campaign.name,
      title: `${campaign.name} Campaign Update`,
      content: `
🎯 **Campaign Progress: ${campaign.progress_percentage}% Complete**

We're excited to share that our ${campaign.name} campaign has reached an important milestone! 

**Key Numbers:**
- 💰 Raised: $${campaign.raised.toLocaleString()}
- 🎯 Goal: $${campaign.goal.toLocaleString()}
- 👥 Supporters: ${campaign.donors}
- 📈 Progress: ${campaign.progress_percentage}%

**Recent Highlights:**
[This would include recent success stories and impact updates]

**How You Can Continue to Help:**
Your support has been incredible, and we invite you to keep the momentum going by sharing our mission with friends and family.

[Call-to-Action Button: "Support ${campaign.name}"]
      `,
      priority: "high",
      section_order: 1,
    };
  }

  getNextPostTime(platform) {
    const now = new Date();
    const schedules = {
      facebook: { hour: 12, days: 1 }, // Daily at noon
      instagram: { hour: 15, days: 1 }, // Daily at 3 PM
      twitter: { hour: 10, days: 1 }, // Daily at 10 AM
      blog: { hour: 9, days: 7 }, // Weekly on Mondays at 9 AM
    };

    const schedule = schedules[platform];
    const nextPost = new Date(now);
    nextPost.setDate(now.getDate() + schedule.days);
    nextPost.setHours(schedule.hour, 0, 0, 0);

    return nextPost.toISOString();
  }

  async runPerformanceMonitoring(campaigns, donations) {
    this.log("📊 Running performance monitoring...", "automation");

    try {
      const alerts = [];
      const now = new Date();

      campaigns.forEach((campaign) => {
        const daysRunning = Math.ceil(
          (now - new Date(campaign.created)) / (1000 * 60 * 60 * 24)
        );
        const dailyRate = campaign.raised / daysRunning;
        const progressPercent = parseFloat(campaign.progress_percentage);

        // Check for performance alerts
        if (progressPercent < 25 && daysRunning > 30) {
          alerts.push({
            type: "performance_warning",
            campaign: campaign.name,
            message: `Low progress after ${daysRunning} days - urgent attention needed`,
            urgency: "high",
            recommendations: [
              "Increase marketing budget",
              "Create compelling social media campaign",
              "Reach out to previous high-value donors",
              "Consider promotional incentives",
            ],
          });
        }

        if (dailyRate < 50 && daysRunning > 14) {
          alerts.push({
            type: "velocity_warning",
            campaign: campaign.name,
            message: `Daily fundraising rate is below $50 (currently $${dailyRate.toFixed(2)})`,
            urgency: "medium",
            recommendations: [
              "Analyze successful campaigns for insights",
              "Test different messaging approaches",
              "Expand outreach channels",
            ],
          });
        }

        if (progressPercent > 90) {
          alerts.push({
            type: "success_alert",
            campaign: campaign.name,
            message: `Campaign near completion! Prepare success celebration and thank you campaign`,
            urgency: "low",
            recommendations: [
              "Prepare completion announcement",
              "Plan donor thank you event",
              "Document success stories",
              "Consider stretch goal",
            ],
          });
        }
      });

      // Save performance alerts
      const alertsPath = path.join(this.dataPath, "performance_alerts.json");
      fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));

      this.log(`✅ Generated ${alerts.length} performance alerts`, "success");
      this.taskResults.completed++;

      return alerts;
    } catch (error) {
      this.log(`❌ Performance monitoring failed: ${error.message}`, "error");
      this.taskResults.failed++;
      return [];
    }
  }

  async generateDashboardUpdate(data) {
    this.log("🎛️ Generating dashboard update...", "automation");

    try {
      const dashboardData = {
        last_update: new Date().toISOString(),
        summary: {
          total_campaigns: data.campaigns ? data.campaigns.length : 0,
          active_campaigns: data.campaigns
            ? data.campaigns.filter((c) => c.status === "active").length
            : 0,
          total_raised: data.campaigns
            ? data.campaigns.reduce((sum, c) => sum + c.raised, 0)
            : 0,
          total_donors: data.donors ? data.donors.length : 0,
          recent_donations: data.donations ? data.donations.length : 0,
        },
        campaign_performance: data.campaigns
          ? data.campaigns.map((campaign) => ({
              name: campaign.name,
              progress: campaign.progress_percentage,
              raised: campaign.raised,
              goal: campaign.goal,
              donors: campaign.donors,
              velocity_score: this.calculateVelocityScore(campaign),
              status: campaign.status,
              days_remaining: this.estimateDaysToGoal(campaign),
            }))
          : [],
        automation_status: {
          last_sync: new Date().toISOString(),
          tasks_completed: this.taskResults.completed,
          tasks_failed: this.taskResults.failed,
          warnings: this.taskResults.warnings,
          next_scheduled_run: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };

      const dashboardPath = path.join(this.dataPath, "dashboard_update.json");
      fs.writeFileSync(dashboardPath, JSON.stringify(dashboardData, null, 2));

      this.log("✅ Dashboard update generated", "success");
      this.taskResults.completed++;

      return dashboardData;
    } catch (error) {
      this.log(`❌ Dashboard update failed: ${error.message}`, "error");
      this.taskResults.failed++;
      return null;
    }
  }

  calculateVelocityScore(campaign) {
    const progressPercent = parseFloat(campaign.progress_percentage);
    const daysRunning = Math.ceil(
      (new Date() - new Date(campaign.created)) / (1000 * 60 * 60 * 24)
    );
    const donorDensity = campaign.donors / daysRunning;

    let score = 0;
    score += progressPercent * 0.4; // 40% weight on progress
    score += Math.min(donorDensity * 10, 30); // 30% max weight on donor acquisition rate
    score += Math.min((campaign.raised / campaign.goal) * 30, 30); // 30% weight on goal achievement

    return Math.round(score * 10) / 10;
  }

  estimateDaysToGoal(campaign) {
    const daysRunning = Math.ceil(
      (new Date() - new Date(campaign.created)) / (1000 * 60 * 60 * 24)
    );
    const dailyRate = campaign.raised / daysRunning;
    const remaining = campaign.goal - campaign.raised;

    if (dailyRate <= 0) return Infinity;
    return Math.ceil(remaining / dailyRate);
  }

  async saveAutomationLog() {
    const logPath = path.join(this.dataPath, "automation_log.json");
    const logData = {
      run_timestamp: new Date().toISOString(),
      summary: this.taskResults,
      log_entries: this.automationLog,
    };

    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    this.log(`✅ Automation log saved to: ${logPath}`, "success");
  }

  async run() {
    this.log("🚀 Starting Integrated Automation System...", "automation");
    this.log(
      "═══════════════════════════════════════════════════════════",
      "automation"
    );

    try {
      // Load all data
      const data = await this.loadDataFiles();

      // Run automation tasks
      if (data.campaigns && data.donors) {
        await this.runDonorAppreciationAutomation(data.campaigns, data.donors);
      }

      if (data.campaigns) {
        await this.runContentGenerationAutomation(data.campaigns);
      }

      if (data.campaigns && data.donations) {
        await this.runPerformanceMonitoring(data.campaigns, data.donations);
      }

      // Generate dashboard update
      await this.generateDashboardUpdate(data);

      // Save automation log
      await this.saveAutomationLog();

      // Final summary
      this.log(
        "═══════════════════════════════════════════════════════════",
        "automation"
      );
      this.log("🎉 INTEGRATED AUTOMATION COMPLETE!", "success");
      this.log(
        "═══════════════════════════════════════════════════════════",
        "automation"
      );
      this.log(`✅ Tasks completed: ${this.taskResults.completed}`, "success");
      this.log(
        `❌ Tasks failed: ${this.taskResults.failed}`,
        this.taskResults.failed > 0 ? "error" : "success"
      );
      this.log(
        `⚠️ Warnings: ${this.taskResults.warnings}`,
        this.taskResults.warnings > 0 ? "warning" : "success"
      );
      this.log(
        "═══════════════════════════════════════════════════════════",
        "automation"
      );
      this.log("📁 All automation results saved to ./data/ directory", "info");
      this.log("🌐 Admin dashboard: http://localhost:3002/admin", "info");
      this.log("🔄 Run automation: node integrated-automation.js", "info");

      return this.taskResults.failed === 0;
    } catch (error) {
      this.log(`❌ Integrated automation failed: ${error.message}`, "error");
      return false;
    }
  }
}

// Run the integrated automation
const automation = new IntegratedAutomation();
automation.run().then((success) => {
  process.exit(success ? 0 : 1);
});
