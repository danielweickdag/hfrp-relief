#!/usr/bin/env node

/**
 * HFRP Relief - Campaign Milestone Tracker
 * Monitors campaign progress and triggers milestone-based automation
 */

const fs = require("fs").promises;
const path = require("path");

class CampaignMilestoneTracker {
  constructor() {
    this.config = null;
    this.campaignConfig = null;
    this.campaigns = new Map();
    this.milestoneHistory = [];
    this.triggers = [];
  }

  async initialize() {
    console.log("🎯 Initializing Campaign Milestone Tracker...");

    await this.loadConfigurations();
    await this.loadCampaignData();
    await this.checkAllMilestones();
    await this.processTriggers();

    console.log("✅ Campaign Milestone Tracker initialized");
  }

  async loadConfigurations() {
    try {
      const configData = await fs.readFile("automation-config.json", "utf8");
      this.config = JSON.parse(configData);

      const campaignData = await fs.readFile(
        "campaign-templates-config.json",
        "utf8"
      );
      this.campaignConfig = JSON.parse(campaignData);

      console.log("📋 Configurations loaded successfully");
    } catch (error) {
      console.error("❌ Error loading configurations:", error.message);
      throw error;
    }
  }

  async loadCampaignData() {
    try {
      // Simulate campaign data - in real implementation, this would query the database
      const campaignData = await this.simulateCampaignData();

      for (const campaign of campaignData) {
        this.campaigns.set(campaign.id, campaign);
      }

      console.log(`📊 Loaded ${this.campaigns.size} active campaigns`);
    } catch (error) {
      console.error("❌ Error loading campaign data:", error.message);
    }
  }

  async simulateCampaignData() {
    return [
      {
        id: "hfrp_emergency_2025",
        name: "Haiti Emergency Relief 2025",
        goal: 100000,
        raised: 67500,
        donorCount: 324,
        startDate: "2025-01-01",
        endDate: "2025-03-31",
        status: "active",
        milestones: [
          { percentage: 25, reached: true, reachedAt: "2025-01-15T10:30:00Z" },
          { percentage: 50, reached: true, reachedAt: "2025-01-28T14:22:00Z" },
          { percentage: 75, reached: false, reachedAt: null },
        ],
      },
      {
        id: "hfrp_education_2025",
        name: "Education Support Campaign 2025",
        goal: 50000,
        raised: 23750,
        donorCount: 156,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        status: "active",
        milestones: [
          { percentage: 20, reached: true, reachedAt: "2025-01-20T09:15:00Z" },
          { percentage: 40, reached: true, reachedAt: "2025-02-05T11:45:00Z" },
          { percentage: 60, reached: false, reachedAt: null },
        ],
      },
      {
        id: "hfrp_healthcare_2025",
        name: "Healthcare Initiative 2025",
        goal: 75000,
        raised: 41250,
        donorCount: 203,
        startDate: "2025-01-01",
        endDate: "2025-11-30",
        status: "active",
        milestones: [
          { percentage: 25, reached: true, reachedAt: "2025-01-25T16:20:00Z" },
          { percentage: 50, reached: true, reachedAt: "2025-02-10T13:10:00Z" },
          { percentage: 75, reached: false, reachedAt: null },
        ],
      },
      {
        id: "hfrp_housing_2025",
        name: "Housing Development Campaign 2025",
        goal: 120000,
        raised: 84000,
        donorCount: 278,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        status: "active",
        milestones: [
          { percentage: 30, reached: true, reachedAt: "2025-01-18T12:45:00Z" },
          { percentage: 60, reached: true, reachedAt: "2025-02-08T15:30:00Z" },
          { percentage: 90, reached: false, reachedAt: null },
        ],
      },
    ];
  }

  async checkAllMilestones() {
    console.log("🔍 Checking campaign milestones...");

    for (const [campaignId, campaign] of this.campaigns) {
      await this.checkCampaignMilestones(campaignId, campaign);
    }

    console.log(
      `📈 Milestone check complete. Found ${this.triggers.length} new triggers`
    );
  }

  async checkCampaignMilestones(campaignId, campaign) {
    const campaignConfig = this.campaignConfig.campaigns[campaignId];
    if (!campaignConfig || !campaignConfig.enabled) return;

    const currentPercentage = (campaign.raised / campaign.goal) * 100;
    console.log(
      `📊 ${campaign.name}: ${currentPercentage.toFixed(1)}% (${campaign.raised}/${campaign.goal})`
    );

    // Check configured milestones
    const milestones = campaignConfig.automation.milestones || [];

    for (const milestone of milestones) {
      if (!milestone.enabled) continue;

      const isReached = currentPercentage >= milestone.percentage;
      const wasReached = campaign.milestones.find(
        (m) => m.percentage === milestone.percentage && m.reached
      );

      // New milestone reached
      if (isReached && !wasReached) {
        await this.triggerMilestone(
          campaignId,
          campaign,
          milestone,
          currentPercentage
        );
      }
    }

    // Check for goal completion
    if (currentPercentage >= 100) {
      const goalCompleted = campaign.milestones.find(
        (m) => m.percentage === 100 && m.reached
      );
      if (!goalCompleted) {
        await this.triggerGoalCompletion(campaignId, campaign);
      }
    }

    // Check for campaign deadlines
    await this.checkDeadlineApproaching(campaignId, campaign);
  }

  async triggerMilestone(campaignId, campaign, milestone, currentPercentage) {
    console.log(
      `🎉 Milestone reached: ${campaign.name} - ${milestone.percentage}%`
    );

    const trigger = {
      id: `milestone_${campaignId}_${milestone.percentage}_${Date.now()}`,
      type: "milestone",
      campaignId,
      campaign: campaign.name,
      milestone: milestone.percentage,
      currentPercentage: currentPercentage.toFixed(1),
      actions: milestone.actions,
      timestamp: new Date().toISOString(),
    };

    this.triggers.push(trigger);

    // Update campaign milestone status
    const existingMilestone = campaign.milestones.find(
      (m) => m.percentage === milestone.percentage
    );
    if (existingMilestone) {
      existingMilestone.reached = true;
      existingMilestone.reachedAt = new Date().toISOString();
    } else {
      campaign.milestones.push({
        percentage: milestone.percentage,
        reached: true,
        reachedAt: new Date().toISOString(),
      });
    }

    // Log milestone achievement
    await this.logMilestone(trigger);
  }

  async triggerGoalCompletion(campaignId, campaign) {
    console.log(`🏆 Goal completed: ${campaign.name} - 100%`);

    const trigger = {
      id: `goal_complete_${campaignId}_${Date.now()}`,
      type: "goal_completion",
      campaignId,
      campaign: campaign.name,
      finalAmount: campaign.raised,
      goal: campaign.goal,
      overPercentage: ((campaign.raised / campaign.goal) * 100).toFixed(1),
      actions: [
        "send_email",
        "social_post",
        "success_celebration",
        "impact_showcase",
        "donor_recognition",
      ],
      timestamp: new Date().toISOString(),
    };

    this.triggers.push(trigger);

    // Update campaign status
    campaign.status = "completed";
    campaign.completedAt = new Date().toISOString();

    // Log goal completion
    await this.logMilestone(trigger);
  }

  async checkDeadlineApproaching(campaignId, campaign) {
    const endDate = new Date(campaign.endDate);
    const now = new Date();
    const daysUntilEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    // Trigger urgency actions for campaigns ending soon
    if (daysUntilEnd <= 7 && daysUntilEnd > 0 && campaign.status === "active") {
      const currentPercentage = (campaign.raised / campaign.goal) * 100;

      // Only trigger urgency if goal not yet reached
      if (currentPercentage < 100) {
        const trigger = {
          id: `urgency_${campaignId}_${Date.now()}`,
          type: "deadline_approaching",
          campaignId,
          campaign: campaign.name,
          daysRemaining: daysUntilEnd,
          currentPercentage: currentPercentage.toFixed(1),
          amountNeeded: campaign.goal - campaign.raised,
          actions: ["urgency_email", "urgency_social", "final_push_campaign"],
          timestamp: new Date().toISOString(),
        };

        this.triggers.push(trigger);
      }
    }
  }

  async processTriggers() {
    console.log("⚡ Processing milestone triggers...");

    for (const trigger of this.triggers) {
      await this.executeTriggerActions(trigger);
    }

    console.log(`✅ Processed ${this.triggers.length} triggers`);
  }

  async executeTriggerActions(trigger) {
    console.log(
      `🎬 Executing actions for trigger: ${trigger.type} - ${trigger.campaign}`
    );

    for (const action of trigger.actions) {
      try {
        await this.executeAction(action, trigger);
      } catch (error) {
        console.error(`❌ Failed to execute action ${action}:`, error.message);
      }
    }
  }

  async executeAction(action, trigger) {
    switch (action) {
      case "send_email":
        await this.scheduleEmailAction(trigger);
        break;
      case "social_post":
        await this.scheduleSocialMediaAction(trigger);
        break;
      case "donor_thank_you":
        await this.scheduleDonorThankYou(trigger);
        break;
      case "impact_report":
        await this.generateImpactReport(trigger);
        break;
      case "press_release":
        await this.schedulePressRelease(trigger);
        break;
      case "donor_celebration":
        await this.scheduleDonorCelebration(trigger);
        break;
      case "media_outreach":
        await this.scheduleMediaOutreach(trigger);
        break;
      case "final_push":
        await this.scheduleFinalPushCampaign(trigger);
        break;
      case "urgency_campaign":
        await this.scheduleUrgencyCampaign(trigger);
        break;
      case "success_celebration":
        await this.scheduleSuccessCelebration(trigger);
        break;
      case "impact_showcase":
        await this.scheduleImpactShowcase(trigger);
        break;
      case "donor_recognition":
        await this.scheduleDonorRecognition(trigger);
        break;
      default:
        console.log(`⚠️ Unknown action: ${action}`);
    }
  }

  async scheduleEmailAction(trigger) {
    const emailData = {
      type: "milestone_email",
      trigger: trigger.id,
      campaignId: trigger.campaignId,
      subject: `🎉 ${trigger.campaign} Milestone Update!`,
      template: this.getMilestoneEmailTemplate(trigger),
      recipients: "all_donors",
      scheduledFor: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
    };

    await this.scheduleAutomationTask("email", emailData);
    console.log(`📧 Scheduled milestone email for ${trigger.campaign}`);
  }

  async scheduleSocialMediaAction(trigger) {
    const socialData = {
      type: "milestone_post",
      trigger: trigger.id,
      campaignId: trigger.campaignId,
      content: this.getMilestoneSocialContent(trigger),
      platforms: ["facebook", "instagram", "twitter", "linkedin"],
      scheduledFor: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
    };

    await this.scheduleAutomationTask("social_media", socialData);
    console.log(
      `📱 Scheduled milestone social media posts for ${trigger.campaign}`
    );
  }

  async scheduleDonorThankYou(trigger) {
    const thankYouData = {
      type: "donor_thank_you",
      trigger: trigger.id,
      campaignId: trigger.campaignId,
      template: "milestone_thank_you",
      recipients: "recent_donors",
      scheduledFor: new Date(Date.now() + 900000).toISOString(), // 15 minutes from now
    };

    await this.scheduleAutomationTask("email", thankYouData);
    console.log(
      `🙏 Scheduled donor thank you messages for ${trigger.campaign}`
    );
  }

  async generateImpactReport(trigger) {
    const reportData = {
      type: "impact_report",
      trigger: trigger.id,
      campaignId: trigger.campaignId,
      milestone: trigger.milestone || trigger.type,
      includeMetrics: true,
      includeStories: true,
      scheduledFor: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
    };

    await this.scheduleAutomationTask("reporting", reportData);
    console.log(
      `📊 Scheduled impact report generation for ${trigger.campaign}`
    );
  }

  async scheduleAutomationTask(taskType, taskData) {
    // In real implementation, this would add to a task queue or database
    const task = {
      id: `task_${taskType}_${Date.now()}`,
      type: taskType,
      data: taskData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    // Simulate task scheduling by writing to a file
    try {
      const existingTasks = await this.loadScheduledTasks();
      existingTasks.push(task);
      await fs.writeFile(
        "data/scheduled-tasks.json",
        JSON.stringify(existingTasks, null, 2)
      );
    } catch (error) {
      console.error("Failed to schedule task:", error.message);
    }
  }

  async loadScheduledTasks() {
    try {
      const tasksData = await fs.readFile("data/scheduled-tasks.json", "utf8");
      return JSON.parse(tasksData);
    } catch {
      return [];
    }
  }

  getMilestoneEmailTemplate(trigger) {
    switch (trigger.type) {
      case "milestone":
        return `milestone_${trigger.milestone}_percent`;
      case "goal_completion":
        return "goal_completion_celebration";
      case "deadline_approaching":
        return "urgency_deadline_reminder";
      default:
        return "general_milestone_update";
    }
  }

  getMilestoneSocialContent(trigger) {
    switch (trigger.type) {
      case "milestone":
        return `🎉 MILESTONE REACHED! ${trigger.campaign} is now ${trigger.currentPercentage}% funded! Thank you to all our amazing supporters! #HFRPRelief #MilestoneAchieved`;
      case "goal_completion":
        return `🏆 GOAL COMPLETED! ${trigger.campaign} has reached ${trigger.overPercentage}% of its goal! Together, we raised $${trigger.finalAmount}! Thank you! #GoalAchieved #HFRPSuccess`;
      case "deadline_approaching":
        return `⏰ URGENT: Only ${trigger.daysRemaining} days left to support ${trigger.campaign}! We're ${trigger.currentPercentage}% there - help us reach our goal! #LastChance #UrgentAppeal`;
      default:
        return `📈 Great progress on ${trigger.campaign}! Thank you for your continued support! #HFRPRelief`;
    }
  }

  async logMilestone(milestone) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...milestone,
    };

    try {
      await fs.appendFile(
        "logs/campaign-milestones.log",
        JSON.stringify(logEntry) + "\n"
      );
      this.milestoneHistory.push(logEntry);
    } catch (error) {
      console.error("Failed to log milestone:", error.message);
    }
  }

  async generateReport() {
    console.log("📊 Generating campaign milestone report...");

    const report = {
      timestamp: new Date().toISOString(),
      activeCampaigns: this.campaigns.size,
      totalTriggersGenerated: this.triggers.length,
      campaignSummary: {},
      milestoneBreakdown: {},
      triggerBreakdown: {},
    };

    // Campaign summary
    for (const [campaignId, campaign] of this.campaigns) {
      report.campaignSummary[campaignId] = {
        name: campaign.name,
        progress: ((campaign.raised / campaign.goal) * 100).toFixed(1) + "%",
        raised: campaign.raised,
        goal: campaign.goal,
        donorCount: campaign.donorCount,
        status: campaign.status,
        milestonesReached: campaign.milestones.filter((m) => m.reached).length,
      };
    }

    // Milestone breakdown
    const allMilestones = Array.from(this.campaigns.values()).flatMap(
      (c) => c.milestones
    );
    report.milestoneBreakdown = {
      total: allMilestones.length,
      reached: allMilestones.filter((m) => m.reached).length,
      pending: allMilestones.filter((m) => !m.reached).length,
    };

    // Trigger breakdown
    for (const trigger of this.triggers) {
      report.triggerBreakdown[trigger.type] =
        (report.triggerBreakdown[trigger.type] || 0) + 1;
    }

    // Save report
    await fs.writeFile(
      "data/campaign-milestone-report.json",
      JSON.stringify(report, null, 2)
    );

    console.log("✅ Campaign milestone report generated");
    return report;
  }
}

// Main execution
async function main() {
  const tracker = new CampaignMilestoneTracker();

  try {
    await tracker.initialize();
    const report = await tracker.generateReport();

    console.log("\n📈 Campaign Milestone Tracker Summary:");
    console.log(`   Active campaigns: ${report.activeCampaigns}`);
    console.log(
      `   Total triggers generated: ${report.totalTriggersGenerated}`
    );
    console.log(
      `   Milestones: ${report.milestoneBreakdown.reached}/${report.milestoneBreakdown.total} reached`
    );
    console.log("   Trigger types:", report.triggerBreakdown);

    process.exit(0);
  } catch (error) {
    console.error("💥 Campaign Milestone Tracker failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CampaignMilestoneTracker;
