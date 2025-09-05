#!/usr/bin/env node

/**
 * HFRP Relief - Donor Communication Automation
 * Manages automated email campaigns and donor engagement
 */

const fs = require("fs").promises;
const path = require("path");

class DonorCommunicationAutomation {
  constructor() {
    this.config = null;
    this.campaignConfig = null;
    this.donors = [];
    this.emailQueue = [];
    this.segments = {
      firstTime: [],
      recurring: [],
      majorGifts: [],
      corporate: [],
      lapsed: [],
      vip: [],
    };
  }

  async initialize() {
    console.log("📧 Initializing Donor Communication Automation...");

    await this.loadConfigurations();
    await this.loadDonorData();
    await this.segmentDonors();
    await this.buildEmailQueue();
    await this.scheduleEmails();

    console.log("✅ Donor Communication Automation initialized");
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

  async loadDonorData() {
    try {
      // Simulate donor data - in real implementation, this would query the database
      this.donors = await this.simulateDonorData();
      console.log(`👥 Loaded ${this.donors.length} donors`);
    } catch (error) {
      console.error("❌ Error loading donor data:", error.message);
      this.donors = [];
    }
  }

  async simulateDonorData() {
    return [
      {
        id: "donor_001",
        name: "Marie Dupont",
        email: "marie.dupont@email.com",
        totalDonated: 150,
        donationCount: 3,
        lastDonation: "2025-01-10",
        preferredCampaigns: ["education", "healthcare"],
        segment: "recurring",
      },
      {
        id: "donor_002",
        name: "Jean Baptiste",
        email: "jean.baptiste@email.com",
        totalDonated: 50,
        donationCount: 1,
        lastDonation: "2025-01-08",
        preferredCampaigns: ["emergency"],
        segment: "firstTime",
      },
      {
        id: "donor_003",
        name: "Claire Martin",
        email: "claire.martin@email.com",
        totalDonated: 1200,
        donationCount: 8,
        lastDonation: "2025-01-12",
        preferredCampaigns: ["housing", "education"],
        segment: "majorGifts",
      },
      {
        id: "donor_004",
        name: "Enterprise Solutions Inc",
        email: "donations@enterprise.com",
        totalDonated: 5000,
        donationCount: 2,
        lastDonation: "2025-01-05",
        preferredCampaigns: ["education", "healthcare"],
        segment: "corporate",
      },
    ];
  }

  async segmentDonors() {
    console.log("🎯 Segmenting donors...");

    for (const donor of this.donors) {
      // Determine segment based on donation history
      if (donor.totalDonated >= 1000) {
        this.segments.majorGifts.push(donor);
      } else if (donor.donationCount === 1) {
        this.segments.firstTime.push(donor);
      } else if (donor.donationCount >= 2) {
        this.segments.recurring.push(donor);
      }

      // Corporate donors
      if (
        donor.email.includes("@") &&
        !donor.email.includes("gmail") &&
        !donor.email.includes("yahoo")
      ) {
        this.segments.corporate.push(donor);
      }

      // VIP donors (high value or frequent)
      if (donor.totalDonated >= 500 || donor.donationCount >= 5) {
        this.segments.vip.push(donor);
      }

      // Lapsed donors (haven't donated in 6 months)
      const lastDonation = new Date(donor.lastDonation);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (lastDonation < sixMonthsAgo) {
        this.segments.lapsed.push(donor);
      }
    }

    console.log("📊 Donor segmentation complete:");
    for (const [segment, donors] of Object.entries(this.segments)) {
      console.log(`   ${segment}: ${donors.length} donors`);
    }
  }

  async buildEmailQueue() {
    console.log("📝 Building email queue...");

    // Process campaign email templates
    for (const [campaignId, campaign] of Object.entries(
      this.campaignConfig.campaigns
    )) {
      if (!campaign.enabled || !campaign.automation.emailTemplates) continue;

      await this.processCampaignEmails(campaignId, campaign);
    }

    // Process event email campaigns
    for (const [eventId, event] of Object.entries(this.campaignConfig.events)) {
      if (!event.enabled || !event.automation.emailCampaigns) continue;

      await this.processEventEmails(eventId, event);
    }

    // Process donor journey emails
    await this.processDonorJourneyEmails();

    console.log(
      `📊 Email queue built: ${this.emailQueue.length} emails scheduled`
    );
  }

  async processCampaignEmails(campaignId, campaign) {
    const emailTemplates = campaign.automation.emailTemplates;

    for (const [templateType, template] of Object.entries(emailTemplates)) {
      if (!template.enabled) continue;

      // Get relevant email template
      const emailTemplate =
        this.campaignConfig.templates.email[template.template];
      if (!emailTemplate || !emailTemplate.enabled) continue;

      // Determine target donors based on campaign and template
      const targetDonors = this.getTargetDonors(campaignId, templateType);

      for (const donor of targetDonors) {
        const email = await this.createEmail(donor, emailTemplate, {
          campaignId,
          templateType,
          triggers: template.triggers,
          delay: template.delay || 0,
        });

        this.emailQueue.push(email);
      }
    }
  }

  async processEventEmails(eventId, event) {
    const emailCampaigns = event.automation.emailCampaigns;

    for (const [campaignType, campaign] of Object.entries(emailCampaigns)) {
      if (!campaign.enabled) continue;

      // Get all donors for event emails (broader reach)
      const targetDonors = this.donors;

      for (const donor of targetDonors) {
        const email = await this.createEventEmail(donor, campaign, {
          eventId,
          campaignType,
          eventDate: event.date,
          sendDate: campaign.sendDate,
        });

        this.emailQueue.push(email);
      }
    }
  }

  async processDonorJourneyEmails() {
    const journeyConfig =
      this.campaignConfig.templates.automation["donor-journey"];
    if (!journeyConfig.enabled) return;

    for (const [stage, stageConfig] of Object.entries(journeyConfig.stages)) {
      const targetDonors = this.getDonorsForJourneyStage(stage);

      for (const donor of targetDonors) {
        for (const template of stageConfig.templates) {
          const email = await this.createJourneyEmail(donor, template, {
            stage,
            duration: stageConfig.duration,
          });

          this.emailQueue.push(email);
        }
      }
    }
  }

  async createEmail(donor, template, context) {
    const scheduledTime = new Date();
    scheduledTime.setSeconds(scheduledTime.getSeconds() + (context.delay || 0));

    return {
      id: `email_${donor.id}_${context.campaignId}_${context.templateType}_${Date.now()}`,
      type: "campaign",
      donorId: donor.id,
      donorEmail: donor.email,
      donorName: donor.name,
      subject: this.personalizeContent(template.subject, donor),
      template: template,
      context: context,
      scheduledTime: scheduledTime.toISOString(),
      status: "scheduled",
    };
  }

  async createEventEmail(donor, campaign, context) {
    const scheduledTime = context.sendDate
      ? new Date(context.sendDate)
      : new Date();

    return {
      id: `event_${donor.id}_${context.eventId}_${context.campaignType}_${Date.now()}`,
      type: "event",
      donorId: donor.id,
      donorEmail: donor.email,
      donorName: donor.name,
      subject: this.personalizeContent(campaign.template, donor),
      template: campaign.template,
      context: context,
      scheduledTime: scheduledTime.toISOString(),
      status: "scheduled",
    };
  }

  async createJourneyEmail(donor, template, context) {
    const scheduledTime = new Date();
    // Add random delay to avoid sending all at once
    scheduledTime.setHours(scheduledTime.getHours() + Math.random() * 24);

    return {
      id: `journey_${donor.id}_${context.stage}_${template}_${Date.now()}`,
      type: "journey",
      donorId: donor.id,
      donorEmail: donor.email,
      donorName: donor.name,
      subject: `Your support matters - ${context.stage} update`,
      template: template,
      context: context,
      scheduledTime: scheduledTime.toISOString(),
      status: "scheduled",
    };
  }

  getTargetDonors(campaignId, templateType) {
    // Get campaign type from campaign ID
    const campaignType = this.getCampaignType(campaignId);

    // Filter donors based on their preferences and segment
    let targetDonors = this.donors.filter(
      (donor) =>
        donor.preferredCampaigns.includes(campaignType) ||
        templateType === "welcomeEmail" ||
        templateType === "thankYouEmail"
    );

    // For donor segmentation templates, filter by segment
    if (templateType.includes("segment")) {
      const campaign = this.campaignConfig.campaigns[campaignId];
      if (campaign.automation.donorSegmentation) {
        const segmentConfig = campaign.automation.donorSegmentation;

        targetDonors = targetDonors.filter((donor) => {
          for (const [segment, config] of Object.entries(segmentConfig)) {
            if (config.enabled && this.segments[segment].includes(donor)) {
              return true;
            }
          }
          return false;
        });
      }
    }

    return targetDonors;
  }

  getDonorsForJourneyStage(stage) {
    switch (stage) {
      case "awareness":
        return this.segments.firstTime;
      case "consideration":
        return [...this.segments.firstTime, ...this.segments.lapsed];
      case "conversion":
        return this.segments.firstTime;
      case "retention":
        return [
          ...this.segments.recurring,
          ...this.segments.majorGifts,
          ...this.segments.vip,
        ];
      default:
        return this.donors;
    }
  }

  personalizeContent(content, donor) {
    let personalizedContent = content;

    const replacements = {
      "{donor_name}": donor.name,
      "{donation_amount}": `$${donor.totalDonated}`,
      "{donation_count}": donor.donationCount,
      "{impact_message}": this.generateImpactMessage(donor),
      "{preferred_campaigns}": donor.preferredCampaigns.join(", "),
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      personalizedContent = personalizedContent.replace(
        new RegExp(placeholder, "g"),
        value
      );
    }

    return personalizedContent;
  }

  generateImpactMessage(donor) {
    const impacts = [
      "providing clean water for 3 families",
      "funding education for 2 children for a month",
      "supporting healthcare for 5 patients",
      "helping build homes for families in need",
    ];
    return impacts[Math.floor(Math.random() * impacts.length)];
  }

  getCampaignType(campaignId) {
    if (campaignId.includes("emergency")) return "emergency";
    if (campaignId.includes("education")) return "education";
    if (campaignId.includes("healthcare")) return "healthcare";
    if (campaignId.includes("housing")) return "housing";
    return "general";
  }

  async scheduleEmails() {
    console.log("⏰ Scheduling email campaigns...");

    // Sort emails by scheduled time
    this.emailQueue.sort(
      (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
    );

    let scheduled = 0;
    const now = new Date();

    for (const email of this.emailQueue) {
      const scheduledTime = new Date(email.scheduledTime);

      // Only schedule future emails
      if (scheduledTime > now) {
        const timeUntilEmail = scheduledTime.getTime() - now.getTime();

        setTimeout(
          () => {
            this.sendEmail(email);
          },
          Math.min(timeUntilEmail, 2147483647)
        ); // Max timeout value

        scheduled++;
      }
    }

    console.log(`📅 Scheduled ${scheduled} emails for delivery`);
  }

  async sendEmail(email) {
    console.log(`📧 Sending email: ${email.id}`);

    try {
      // In a real implementation, this would connect to email service (SendGrid, etc.)
      await this.simulateEmailSending(email);

      // Update status and log
      email.status = "sent";
      await this.logEmailDelivery(email, "success");
    } catch (error) {
      console.error(`❌ Failed to send email ${email.id}:`, error.message);
      email.status = "failed";
      await this.logEmailDelivery(email, "error", error.message);
    }
  }

  async simulateEmailSending(email) {
    // Simulate email service delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`✅ Email sent to ${email.donorEmail}: "${email.subject}"`);
    console.log(`   Type: ${email.type}, Scheduled: ${email.scheduledTime}`);
  }

  async logEmailDelivery(email, status, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      emailId: email.id,
      donorId: email.donorId,
      type: email.type,
      subject: email.subject,
      status,
      scheduledTime: email.scheduledTime,
      actualTime: new Date().toISOString(),
      error,
    };

    try {
      await fs.appendFile(
        "logs/donor-communication.log",
        JSON.stringify(logEntry) + "\n"
      );
    } catch (err) {
      console.error("Failed to write log:", err.message);
    }
  }

  async generateReport() {
    console.log("📊 Generating donor communication report...");

    const report = {
      timestamp: new Date().toISOString(),
      totalEmails: this.emailQueue.length,
      segmentBreakdown: {},
      typeBreakdown: {},
      scheduledEmails: this.emailQueue.filter(
        (e) => new Date(e.scheduledTime) > new Date()
      ).length,
      sentEmails: this.emailQueue.filter((e) => e.status === "sent").length,
      failedEmails: this.emailQueue.filter((e) => e.status === "failed").length,
    };

    // Segment breakdown
    for (const [segment, donors] of Object.entries(this.segments)) {
      report.segmentBreakdown[segment] = donors.length;
    }

    // Type breakdown
    for (const email of this.emailQueue) {
      report.typeBreakdown[email.type] =
        (report.typeBreakdown[email.type] || 0) + 1;
    }

    // Save report
    await fs.writeFile(
      "data/donor-communication-report.json",
      JSON.stringify(report, null, 2)
    );

    console.log("✅ Donor communication report generated");
    return report;
  }
}

// Main execution
async function main() {
  const automation = new DonorCommunicationAutomation();

  try {
    await automation.initialize();
    const report = await automation.generateReport();

    console.log("\n📈 Donor Communication Automation Summary:");
    console.log(`   Total emails in queue: ${report.totalEmails}`);
    console.log(`   Scheduled for future: ${report.scheduledEmails}`);
    console.log(`   Donor segments:`, report.segmentBreakdown);
    console.log(`   Email types:`, report.typeBreakdown);

    process.exit(0);
  } catch (error) {
    console.error("💥 Donor Communication Automation failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DonorCommunicationAutomation;
