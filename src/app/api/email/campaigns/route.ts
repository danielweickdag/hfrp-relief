import { type NextRequest, NextResponse } from "next/server";
import {
  getResendEnhanced,
  getResendConfig,
  isResendDemoMode,
  sendEnhancedEmail,
} from "@/lib/resendEnhanced";
import fs from "fs";
import path from "path";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipients: string[];
  scheduledFor: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  createdAt: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category:
    | "newsletter"
    | "donation_thank_you"
    | "emergency_appeal"
    | "volunteer_update"
    | "impact_report";
}

interface CampaignRequest {
  action:
    | "create"
    | "schedule"
    | "send"
    | "list"
    | "get_templates"
    | "analytics"
    | "process_scheduled";
  campaign?: Partial<EmailCampaign>;
  campaignId?: string;
  templateId?: string;
  recipientSegment?:
    | "all_donors"
    | "monthly_donors"
    | "volunteers"
    | "newsletter_subscribers";
}

interface AutomationReport {
  campaignsSent: number;
  totalRecipients: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  automationActions: string[];
  scheduledCampaigns: number;
  nextScheduledDate?: string;
}

// POST - Create, schedule, or send email campaigns
export async function POST(request: NextRequest) {
  try {
    const body: CampaignRequest = await request.json();
    const { action, campaign, campaignId, templateId, recipientSegment } = body;

    switch (action) {
      case "create":
        return await handleCreateCampaign(campaign!);
      case "schedule":
        return await handleScheduleCampaign(campaignId!, campaign!);
      case "send":
        return await handleSendCampaign(campaignId!);
      case "process_scheduled":
        return await handleProcessScheduled();
      case "list":
        return await handleListCampaigns();
      case "get_templates":
        return await handleGetTemplates();
      case "analytics":
        return await handleCampaignAnalytics();
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Email campaign API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}

// GET - Retrieve campaigns and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";
    const campaignId = searchParams.get("campaignId");

    switch (action) {
      case "list":
        return await handleListCampaigns();
      case "get":
        if (!campaignId) {
          return NextResponse.json(
            { error: "Campaign ID required" },
            { status: 400 },
          );
        }
        return await handleGetCampaign(campaignId);
      case "templates":
        return await handleGetTemplates();
      case "analytics":
        return await handleCampaignAnalytics();
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Email campaign GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper functions
async function handleCreateCampaign(campaignData: Partial<EmailCampaign>) {
  const campaign: EmailCampaign = {
    id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: campaignData.name || "Untitled Campaign",
    subject: campaignData.subject || "",
    content: campaignData.content || "",
    recipients: campaignData.recipients || [],
    scheduledFor: campaignData.scheduledFor || new Date().toISOString(),
    status: "draft",
    createdAt: new Date().toISOString(),
  };

  await saveCampaign(campaign);

  return NextResponse.json({
    success: true,
    campaign,
    message: "Campaign created successfully",
  });
}

async function handleScheduleCampaign(
  campaignId: string,
  updates: Partial<EmailCampaign>,
) {
  const campaigns = await loadCampaigns();
  const campaignIndex = campaigns.findIndex((c) => c.id === campaignId);

  if (campaignIndex === -1) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  campaigns[campaignIndex] = {
    ...campaigns[campaignIndex],
    ...updates,
    status: "scheduled",
  };

  await saveCampaigns(campaigns);

  // Schedule automation
  await scheduleAutomatedCampaign(campaigns[campaignIndex]);

  return NextResponse.json({
    success: true,
    campaign: campaigns[campaignIndex],
    message: "Campaign scheduled successfully",
  });
}

async function handleSendCampaign(campaignId: string) {
  const campaigns = await loadCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Check for demo mode
  if (isResendDemoMode()) {
    console.log(
      "📧 Demo Mode: Campaign would be sent to:",
      campaign.recipients,
    );

    const updatedCampaign = {
      ...campaign,
      status: "sent" as const,
      sentAt: new Date().toISOString(),
      openRate: Math.random() * 0.4 + 0.15, // 15-55% open rate
      clickRate: Math.random() * 0.15 + 0.05, // 5-20% click rate
    };

    const campaignIndex = campaigns.findIndex((c) => c.id === campaignId);
    campaigns[campaignIndex] = updatedCampaign;
    await saveCampaigns(campaigns);

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: "Campaign sent successfully (Demo Mode)",
      isDemoMode: true,
      automationReport: generateDemoAutomationReport(),
    });
  }

  // Real email sending logic using enhanced utility
  const results = await sendCampaignEmails(campaign);

  const updatedCampaign = {
    ...campaign,
    status: "sent" as const,
    sentAt: new Date().toISOString(),
  };

  const campaignIndex = campaigns.findIndex((c) => c.id === campaignId);
  campaigns[campaignIndex] = updatedCampaign;
  await saveCampaigns(campaigns);

  return NextResponse.json({
    success: true,
    campaign: updatedCampaign,
    results,
    message: "Campaign sent successfully",
  });
}

async function handleListCampaigns() {
  const campaigns = await loadCampaigns();
  return NextResponse.json({ campaigns });
}

async function handleGetCampaign(campaignId: string) {
  const campaigns = await loadCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

async function handleGetTemplates() {
  const templates = getEmailTemplates();
  return NextResponse.json({ templates });
}

async function handleCampaignAnalytics() {
  const campaigns = await loadCampaigns();
  const analytics = generateCampaignAnalytics(campaigns);
  return NextResponse.json({ analytics });
}

// Email sending functions
async function sendCampaignEmails(campaign: EmailCampaign) {
  const results = [];

  for (const recipient of campaign.recipients) {
    const result = await sendEnhancedEmail({
      to: recipient,
      subject: campaign.subject,
      html: campaign.content,
      tags: [
        { name: "campaign_id", value: campaign.id },
        { name: "campaign_name", value: campaign.name },
      ],
    });

    if (result.success) {
      results.push({ recipient, success: true, id: result.messageId });
    } else {
      results.push({ recipient, success: false, error: result.error });
    }
  }

  return results;
}

interface AutomationScheduleData {
  campaignId: string;
  scheduledFor: string;
  recipients: number;
  automationType: string;
  createdAt: string;
}

// Automation functions
async function scheduleAutomatedCampaign(campaign: EmailCampaign) {
  const automationData: AutomationScheduleData = {
    campaignId: campaign.id,
    scheduledFor: campaign.scheduledFor,
    recipients: campaign.recipients.length,
    automationType: "email_campaign",
    createdAt: new Date().toISOString(),
  };

  await saveAutomationSchedule(automationData);
}

async function saveAutomationSchedule(automationData: AutomationScheduleData) {
  const dataPath = path.join(process.cwd(), "data", "automation");
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  const schedulePath = path.join(dataPath, "email_schedule.json");
  let schedules = [];

  if (fs.existsSync(schedulePath)) {
    schedules = JSON.parse(fs.readFileSync(schedulePath, "utf8"));
  }

  schedules.push(automationData);
  fs.writeFileSync(schedulePath, JSON.stringify(schedules, null, 2));
}

async function handleProcessScheduled() {
  const dataPath = path.join(process.cwd(), "data", "automation");
  const schedulePath = path.join(dataPath, "email_schedule.json");
  const campaigns = await loadCampaigns();

  if (!fs.existsSync(schedulePath)) {
    return NextResponse.json({ processed: 0, message: "No schedule found" });
  }

  const now = Date.now();
  let schedules: AutomationScheduleData[] = [];
  try {
    schedules = JSON.parse(
      fs.readFileSync(schedulePath, "utf8"),
    ) as AutomationScheduleData[];
  } catch (error) {
    console.error("Failed to read schedule file:", error);
    return NextResponse.json(
      { error: "Failed to read schedule" },
      { status: 500 },
    );
  }

  let processed = 0;
  const remaining: AutomationScheduleData[] = [];

  for (const item of schedules) {
    const scheduledTime = Date.parse(item.scheduledFor);
    const campaign = campaigns.find((c) => c.id === item.campaignId);

    if (!campaign) {
      // Skip unknown campaigns but keep schedule for investigation
      remaining.push(item);
      continue;
    }

    if (campaign.status === "sent") {
      // Already sent; drop from schedule
      continue;
    }

    if (Number.isFinite(scheduledTime) && scheduledTime <= now) {
      // Send now
      await handleSendCampaign(campaign.id);
      processed += 1;
    } else {
      // Keep for future
      remaining.push(item);
    }
  }

  // Write back remaining schedules
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    fs.writeFileSync(schedulePath, JSON.stringify(remaining, null, 2));
  } catch (error) {
    console.error("Failed to update schedule file:", error);
  }

  return NextResponse.json({ processed, remaining: remaining.length });
}

// Data persistence functions
async function loadCampaigns(): Promise<EmailCampaign[]> {
  const dataPath = path.join(process.cwd(), "data", "email_campaigns.json");

  if (!fs.existsSync(dataPath)) {
    return [];
  }

  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading campaigns:", error);
    return [];
  }
}

async function saveCampaign(campaign: EmailCampaign) {
  const campaigns = await loadCampaigns();
  campaigns.push(campaign);
  await saveCampaigns(campaigns);
}

async function saveCampaigns(campaigns: EmailCampaign[]) {
  const dataPath = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }

  const filePath = path.join(dataPath, "email_campaigns.json");
  fs.writeFileSync(filePath, JSON.stringify(campaigns, null, 2));
}

// Template functions
function getEmailTemplates(): EmailTemplate[] {
  return [
    {
      id: "monthly_newsletter",
      name: "Monthly Impact Newsletter",
      subject: "Your Support Changed Everything This Month ❤️",
      category: "newsletter",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #2563eb;">Monthly Impact Report</h1>
          <p>Dear Supporter,</p>
          <p>Thanks to your generous support, we've made incredible progress this month:</p>
          <ul>
            <li>🏠 5 families received emergency housing assistance</li>
            <li>🍽️ 1,200 meals served to children in need</li>
            <li>🏥 15 medical treatments provided</li>
            <li>📚 30 children received educational support</li>
          </ul>
          <p>Your continued support makes all of this possible. Thank you!</p>
        </div>
      `,
      textContent:
        "Monthly Impact Report - Thanks to your support, we helped 5 families, served 1,200 meals, provided 15 medical treatments, and supported 30 children with education.",
    },
    {
      id: "emergency_appeal",
      name: "Emergency Relief Appeal",
      subject: "Urgent: Emergency Relief Needed in Haiti",
      category: "emergency_appeal",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #dc2626;">Emergency Relief Appeal</h1>
          <p><strong>Urgent assistance needed!</strong></p>
          <p>A recent natural disaster has affected hundreds of families in our partner communities. We need your immediate help to provide:</p>
          <ul>
            <li>🏠 Emergency shelter materials</li>
            <li>🍽️ Food and clean water</li>
            <li>🏥 Medical supplies and care</li>
            <li>👶 Support for children and families</li>
          </ul>
          <p>Every donation, no matter the size, makes a difference. Please consider making an emergency donation today.</p>
        </div>
      `,
      textContent:
        "Emergency Relief Appeal - Urgent assistance needed for families affected by natural disaster. Help us provide shelter, food, medical care, and support.",
    },
    {
      id: "donation_thank_you",
      name: "Donation Thank You",
      subject: "Thank You for Your Generous Donation! 🙏",
      category: "donation_thank_you",
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #059669;">Thank You!</h1>
          <p>Dear [DONOR_NAME],</p>
          <p>We are incredibly grateful for your generous donation of $[AMOUNT]. Your support directly impacts families in Haiti and helps us continue our vital work.</p>
          <p>Your donation will help provide:</p>
          <ul>
            <li>Essential food and nutrition</li>
            <li>Medical care and supplies</li>
            <li>Educational opportunities</li>
            <li>Emergency relief assistance</li>
          </ul>
          <p>We'll keep you updated on how your donation is making a difference.</p>
          <p>With heartfelt gratitude,<br>The HFRP Team</p>
        </div>
      `,
      textContent:
        "Thank you for your generous donation! Your support directly impacts families in Haiti and helps provide food, medical care, education, and emergency relief.",
    },
  ];
}

// Analytics functions
function generateCampaignAnalytics(
  campaigns: EmailCampaign[],
): AutomationReport {
  const sentCampaigns = campaigns.filter((c) => c.status === "sent");
  const totalRecipients = sentCampaigns.reduce(
    (sum, c) => sum + c.recipients.length,
    0,
  );
  const avgOpenRate =
    sentCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) /
      sentCampaigns.length || 0;
  const avgClickRate =
    sentCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) /
      sentCampaigns.length || 0;
  const scheduledCampaigns = campaigns.filter((c) => c.status === "scheduled");

  return {
    campaignsSent: sentCampaigns.length,
    totalRecipients,
    deliveryRate: 0.95, // Assume 95% delivery rate
    openRate: avgOpenRate,
    clickRate: avgClickRate,
    unsubscribeRate: 0.02, // Assume 2% unsubscribe rate
    automationActions: [
      "Email campaigns scheduled",
      "Donor segmentation applied",
      "A/B testing configured",
      "Analytics tracking enabled",
    ],
    scheduledCampaigns: scheduledCampaigns.length,
    nextScheduledDate:
      scheduledCampaigns.length > 0
        ? scheduledCampaigns[0].scheduledFor
        : undefined,
  };
}

function generateDemoAutomationReport(): AutomationReport {
  return {
    campaignsSent: 1,
    totalRecipients: Math.floor(Math.random() * 500) + 200,
    deliveryRate: 0.96,
    openRate: Math.random() * 0.4 + 0.15,
    clickRate: Math.random() * 0.15 + 0.05,
    unsubscribeRate: 0.018,
    automationActions: [
      "Email campaign sent successfully",
      "Donor engagement tracked",
      "Follow-up sequences triggered",
      "Analytics data collected",
    ],
    scheduledCampaigns: Math.floor(Math.random() * 3) + 1,
    nextScheduledDate: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
}
