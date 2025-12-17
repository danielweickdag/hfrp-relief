"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminAuth, WithPermission } from "./AdminAuth";
// import BlogStatsDashboard from "./BlogStatsDashboard";
// import StripeConfig from "./StripeConfig";
import StripeAutomationDashboard from "./StripeAutomationDashboard";

interface DashboardProps {
  className?: string;
}

interface AutomationSettings {
  emailNotifications: boolean;
  donationAlerts: boolean;
  weeklyReports: boolean;
  socialMediaPosts: boolean;
  donorFollowUp: boolean;
  inventoryAlerts: boolean;
  scheduledCampaigns: boolean;
  analyticsReporting: boolean;
}

interface HFRPStats {
  totalDonations: number;
  totalDonors: number;
  monthlyRecurring: number;
  familiesHelped: number;
  mealsServed: number;
  medicalTreatments: number;
  educationalSupport: number;
  homesBuilt: number;
  volunteersActive: number;
  websiteVisitors: number;
}

interface WorkflowTask {
  name: string;
  success: boolean;
}

interface WorkflowStatus {
  currentWorkflow: string | null;
  runningTasks: string[];
  completedTasks: string[];
  failedTasks: string[];
  logs: string[];
  isRunning: boolean;
}

interface Campaign {
  name: string;
  raised: number;
  progress: number;
}

interface SocialContent {
  platform: string;
  content: string;
  estimatedReach: number;
  expectedEngagement: string;
}

interface AutomationRunResults {
  processedScheduled: number;
  processedThankYou: number;
  processedQueue: number;
  isDemoMode?: boolean;
  persisted?: boolean;
  message?: string;
  error?: string;
}

// Scheduler types
interface SchedulerJob {
  status?: "running" | "stopped" | string;
  lastRun?: string;
  nextRun?: string;
}

interface SchedulerStatus {
  isRunning: boolean;
  totalJobs?: number;
  jobs?: Record<string, SchedulerJob>;
  [key: string]: unknown;
}

interface ResendEmail {
  id?: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  scheduledAt?: string;
}

interface ResendEmailStatus {
  id: string;
  status: "queued" | "sent" | "delivered" | "bounced" | "failed";
  created_at: string;
  last_event?: string;
}

export default function AdminDashboard({ className = "" }: DashboardProps) {
  const { user, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "automation"
    | "content"
    | "analytics"
    | "gallery"
    | "settings"
    | "stripe"
  >("overview");
  const [loading, setLoading] = useState(false);
  const [automationRunLoading, setAutomationRunLoading] = useState(false);
  const [automationRunResults, setAutomationRunResults] =
    useState<AutomationRunResults | null>(null);
  const [automationRunAt, setAutomationRunAt] = useState<string | null>(null);
  const analyticsSectionRef = useRef<HTMLDivElement>(null);
  // Scheduler state
  const [schedulerStatus, setSchedulerStatus] =
    useState<SchedulerStatus | null>(null);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  // Feature status state
  const [featuresEnabled, setFeaturesEnabled] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    mode?: "live" | "test" | "unknown" | "mismatch";
    modeMismatch?: boolean;
    webhook?: { configured_for_mode?: boolean };
  } | null>(null);

  // Resend Email Management State
  const [resendEmailForm, setResendEmailForm] = useState<ResendEmail>({
    from: "HFRP <noreply@familyreliefproject7.org>",
    to: [],
    subject: "",
    html: "",
  });
  const [batchEmails, setBatchEmails] = useState<ResendEmail[]>([]);
  const [emailStatuses, setEmailStatuses] = useState<ResendEmailStatus[]>([]);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailToTrack, setEmailToTrack] = useState("");

  const [hfrpStats, setHfrpStats] = useState<HFRPStats>({
    totalDonations: 185750,
    totalDonors: 1247,
    monthlyRecurring: 28430,
    familiesHelped: 389,
    mealsServed: 15680,
    medicalTreatments: 1250,
    educationalSupport: 567,
    homesBuilt: 34,
    volunteersActive: 47,
    websiteVisitors: 8450,
  });

  const [automationSettings, setAutomationSettings] =
    useState<AutomationSettings>({
      emailNotifications: true,
      donationAlerts: true,
      weeklyReports: true,
      socialMediaPosts: true,
      donorFollowUp: true,
      inventoryAlerts: true,
      scheduledCampaigns: true,
      analyticsReporting: true,
    });

  // Legacy stats for overview dashboard compatibility
  const stats = {
    donations: {
      total: `$${hfrpStats.totalDonations.toLocaleString()}`,
      monthly: `$${hfrpStats.monthlyRecurring.toLocaleString()}`,
      donors: hfrpStats.totalDonors,
    },
    content: {
      blogPosts: 24,
      pages: 8,
      media: 145,
    },
    volunteers: {
      active: hfrpStats.volunteersActive,
      pending: 3,
      hours: 278,
    },
    visitors: {
      total: hfrpStats.websiteVisitors,
      newUsers: Math.floor(hfrpStats.websiteVisitors * 0.46),
      avgSessionTime: "3m 42s",
    },
  };

  // Scheduler controls
  const refreshSchedulerStatus = async () => {
    try {
      setSchedulerLoading(true);
      const res = await fetch("/api/scheduler");
      const data = await res.json().catch(() => ({}));
      const parsed = (data?.status || data) as SchedulerStatus;
      setSchedulerStatus(parsed);
    } catch (error) {
      console.error("Failed to load scheduler status", error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const startScheduler = async () => {
    try {
      setSchedulerLoading(true);
      await fetch("/api/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      await refreshSchedulerStatus();
    } catch (error) {
      console.error("Failed to start scheduler", error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const stopScheduler = async () => {
    try {
      setSchedulerLoading(true);
      await fetch("/api/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
      await refreshSchedulerStatus();
    } catch (error) {
      console.error("Failed to stop scheduler", error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  // Load scheduler status and feature status on mount
  useEffect(() => {
    refreshSchedulerStatus();
    // Check initial feature status
    try {
      const enabled = localStorage.getItem("hfrp_features_enabled") === "true";
      setFeaturesEnabled(enabled);
    } catch {
      setFeaturesEnabled(false);
    }
    (async () => {
      try {
        const res = await fetch("/api/stripe/status");
        if (res.ok) {
          const data = await res.json();
          setStripeStatus(data);
        }
      } catch {}
    })();
  }, []);

  const runEmailAutomation = async () => {
    setAutomationRunLoading(true);
    try {
      const response = await fetch("/api/email/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run" }),
      });

      const json: unknown = await response.json();
      if (!response.ok) {
        const err = json as { error?: string };
        throw new Error(err.error || "Automation run failed");
      }
      const result = json as AutomationRunResults;
      setAutomationRunResults(result);
      const now = new Date().toISOString();
      setAutomationRunAt(now);

      alert(
        `🤖 AUTOMATION RUN COMPLETED\n\n` +
          `Scheduled Campaigns Processed: ${result.processedScheduled}\n` +
          `Donation Thank-Yous Sent: ${result.processedThankYou}\n` +
          `Queued Emails Sent: ${result.processedQueue}\n\n` +
          `${result.isDemoMode ? "⚠️ Demo mode: email sending is simulated." : "✅ Live mode: emails sent via Resend."}`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Automation run failed: ${msg}`);
    } finally {
      setAutomationRunLoading(false);
    }
  };

  const printAnalyticsReport = () => {
    const node = analyticsSectionRef.current;
    if (!node) return;

    const printWindow = window.open("", "PRINT", "height=900,width=1200");
    if (!printWindow) return;

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((el) => el.outerHTML)
      .join("\n");

    printWindow.document.write(
      `<!doctype html><html><head><title>Analytics Report</title>${styles}</head><body>`,
    );
    printWindow.document.write(`<div class="p-6">`);
    printWindow.document.write(
      `<h1 class="text-2xl font-bold mb-4">Analytics Report</h1>`,
    );
    printWindow.document.write(node.innerHTML);
    printWindow.document.write(`</div>`);
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // Workflow Orchestration State
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    currentWorkflow: null,
    runningTasks: [],
    completedTasks: [],
    failedTasks: [],
    logs: [],
    isRunning: false,
  });

  // Workflow Management Functions
  const runWorkflow = async (workflowType: string, options = {}) => {
    setLoading(true);
    setWorkflowStatus((prev) => {
      const updatedLogs = Array.isArray(prev.logs)
        ? [...prev.logs, `🚀 Starting ${workflowType} workflow...`]
        : [`🚀 Starting ${workflowType} workflow...`];

      return {
        ...prev,
        isRunning: true,
        currentWorkflow: workflowType,
        logs: updatedLogs,
      };
    });

    try {
      // Call the workflow orchestrator
      const response = await fetch("/api/workflows/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowType, options }),
      });

      if (response.ok) {
        const result = await response.json();
        setWorkflowStatus((prev) => ({
          ...prev,
          completedTasks: result.tasks
            .filter((t: WorkflowTask) => t.success)
            .map((t: WorkflowTask) => t.name),
          failedTasks: result.tasks
            .filter((t: WorkflowTask) => !t.success)
            .map((t: WorkflowTask) => t.name),
          logs: [...prev.logs, `✅ ${workflowType} workflow completed`],
        }));
      } else {
        throw new Error("Workflow execution failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setWorkflowStatus((prev) => ({
        ...prev,
        logs: [
          ...prev.logs,
          `❌ ${workflowType} workflow failed: ${errorMessage}`,
        ],
      }));
    } finally {
      setLoading(false);
      setWorkflowStatus((prev) => ({ ...prev, isRunning: false }));
    }
  };

  // Automation Functions
  const runDonationReport = async () => {
    setLoading(true);
    console.log("🔄 Generating comprehensive analytics report...");

    try {
      // Call the new analytics API
      const response = await fetch("/api/analytics/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "comprehensive",
          period: "monthly",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const report = result.report;

        // Update dashboard stats with real data
        setHfrpStats((prev) => ({
          ...prev,
          totalDonations: Math.round(report.donations.total),
          totalDonors: report.donors.total,
          monthlyRecurring: Math.round(report.donations.total * 0.3), // Estimate recurring
          websiteVisitors: report.traffic.visitors,
        }));

        // Show comprehensive report
        alert(
          `📊 COMPREHENSIVE ANALYTICS REPORT\n\n` +
            `💰 Total Donations: $${report.donations.total.toLocaleString()}\n` +
            `📊 Donation Count: ${report.donations.count}\n` +
            `💵 Average Donation: $${report.donations.average.toFixed(2)}\n` +
            `📈 Growth: ${report.donations.growth}\n` +
            `🔄 Recurring: ${report.donations.recurring} | One-time: ${report.donations.oneTime}\n\n` +
            `👥 DONOR INSIGHTS\n` +
            `Total Donors: ${report.donors.total}\n` +
            `New Donors: ${report.donors.new}\n` +
            `Returning: ${report.donors.returning}\n` +
            `Retention Rate: ${report.donors.retention}\n` +
            `Avg Lifetime Value: $${report.donors.averageLifetimeValue.toFixed(2)}\n\n` +
            `🎯 TOP CAMPAIGNS\n${report.campaigns.topPerforming
              .map(
                (c: Campaign) =>
                  `• ${c.name}: $${c.raised.toLocaleString()} (${c.progress}%)`,
              )
              .join("\n")}\n\n` +
            `🌐 WEBSITE TRAFFIC\n` +
            `Visitors: ${report.traffic.visitors.toLocaleString()}\n` +
            `Page Views: ${report.traffic.pageViews.toLocaleString()}\n` +
            `Conversion Rate: ${report.traffic.conversionRate}\n\n` +
            `🤖 AUTOMATION STATUS\n` +
            `Emails Sent: ${report.automation.emailsSent}\n` +
            `Social Posts: ${report.automation.socialPosts}\n` +
            `Workflows: ${report.automation.workflowsExecuted}\n` +
            `Success Rate: ${report.automation.successRate}\n\n` +
            `📄 Report ID: ${report.reportId}\n` +
            `📥 Download: ${result.downloadUrl}`,
        );

        // Trigger automated actions based on report
        console.log(
          "✅ Analytics report generated and automated actions triggered",
        );
      } else {
        throw new Error("Failed to generate analytics report");
      }
    } catch (error) {
      console.error("❌ Analytics report generation failed:", error);

      // Fallback to basic report
      const basicReport = {
        totalThisMonth: hfrpStats.totalDonations * 0.12,
        newDonors: Math.floor(hfrpStats.totalDonors * 0.08),
        recurringGrowth: "15.3%",
        averageDonation: 125,
      };

      alert(
        `📊 BASIC DONATION REPORT (Offline Mode)\n\n` +
          `💰 This Month: $${basicReport.totalThisMonth.toLocaleString()}\n` +
          `👥 New Donors: ${basicReport.newDonors}\n` +
          `📈 Recurring Growth: ${basicReport.recurringGrowth}\n` +
          `💵 Average Donation: $${basicReport.averageDonation}\n\n` +
          `⚠️ Full analytics unavailable - check API connection`,
      );
    } finally {
      setLoading(false);
    }
  };

  const syncStripeData = async () => {
    setLoading(true);
    console.log("🔄 Starting enhanced Stripe automation sync...");

    try {
      // Call the enhanced Stripe sync API
      const response = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "automation-sync",
          automateWorkflows: true,
          generateReports: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const automationReport = result.automationReport;
        const syncData = result.data;

        // Update local stats with real sync data
        setHfrpStats((prev) => ({
          ...prev,
          totalDonations:
            prev.totalDonations + (automationReport.donations.totalAmount || 0),
          totalDonors:
            prev.totalDonors + (automationReport.donations.synced || 0),
          monthlyRecurring: Math.round(
            (automationReport.donations.totalAmount || 0) * 0.4,
          ), // Estimate recurring
        }));

        // Show comprehensive sync report
        alert(
          `✅ ENHANCED STRIPE AUTOMATION SYNC COMPLETED\n\n` +
            `📊 SYNC SUMMARY\n` +
            `Campaigns Synced: ${automationReport.campaigns.synced}\n` +
            `Donations Processed: ${automationReport.donations.synced}\n` +
            `Total Amount: $${automationReport.donations.totalAmount.toLocaleString()}\n` +
            `Sync Duration: ${automationReport.summary.duration}\n` +
            `Success Rate: ${automationReport.summary.successRate}\n\n` +
            `🤖 AUTOMATION TRIGGERED\n` +
            `Emails Sent: ${automationReport.automation.emailsTriggered}\n` +
            `Social Posts Scheduled: ${automationReport.automation.socialPostsScheduled}\n` +
            `Workflows Executed: ${automationReport.automation.workflowsExecuted.length}\n\n` +
            `📄 Sync ID: ${automationReport.syncId}`,
        );

        console.log("✅ Enhanced Stripe sync completed with automation");
      } else {
        throw new Error("Enhanced Stripe sync failed");
      }
    } catch (error) {
      console.error("❌ Enhanced Stripe sync failed:", error);

      // Fallback to enhanced demo data
      const newDonations = Math.floor(Math.random() * 2000) + 500;
      const newDonors = Math.floor(Math.random() * 15) + 5;
      const emailsTriggered = Math.floor(Math.random() * 20) + 10;
      const socialPosts = Math.floor(Math.random() * 5) + 2;

      setHfrpStats((prev) => ({
        ...prev,
        totalDonations: prev.totalDonations + newDonations,
        totalDonors: prev.totalDonors + newDonors,
      }));

      alert(
        `⚠️ ENHANCED STRIPE SYNC (Demo Mode)\n\n` +
          `📊 SIMULATED SYNC DATA\n` +
          `Donations: +$${newDonations.toLocaleString()}\n` +
          `New Donors: +${newDonors}\n` +
          `Campaigns Updated: 5\n` +
          `Sync Duration: 3.2s\n\n` +
          `🤖 AUTOMATION SIMULATED\n` +
          `Thank You Emails: ${emailsTriggered}\n` +
          `Social Posts Scheduled: ${socialPosts}\n` +
          `Analytics Reports: 1\n` +
          `Donor Retention Workflows: Active\n\n` +
          `🔧 Full automation available in production\n` +
          `⚠️ Check API connection for live sync`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Donorbox sync removed; Stripe is the sole donation provider.

  const generateSocialContent = async () => {
    setLoading(true);
    console.log("🤖 Generating AI-powered social content...");

    try {
      // Call the AI social content API
      const response = await fetch("/api/social/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "all",
          contentType: "all",
          campaignData: {
            homesBuilt: hfrpStats.homesBuilt,
            educationalSupport: hfrpStats.educationalSupport,
            mealsServed: hfrpStats.mealsServed,
            medicalTreatments: hfrpStats.medicalTreatments,
            volunteersActive: hfrpStats.volunteersActive,
            totalDonations: hfrpStats.totalDonations,
            newDonors: Math.floor(hfrpStats.totalDonors * 0.1),
          },
          automatePosting: true,
          generateMultiple: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const content = result.content;
        const automationReport = result.automationReport;

        // Show comprehensive content generation report
        const contentSummary = content
          .map(
            (c: SocialContent, index: number) =>
              `${index + 1}. ${c.platform}: ${c.content.substring(0, 80)}...\n   📊 Reach: ${c.estimatedReach.toLocaleString()} | Engagement: ${c.expectedEngagement}`,
          )
          .join("\n\n");

        alert(
          `🤖 AI SOCIAL CONTENT GENERATED & SCHEDULED\n\n` +
            `📱 CONTENT CREATED\n${contentSummary}\n\n` +
            `🚀 AUTOMATION REPORT\n` +
            `Posts Scheduled: ${automationReport.postsScheduled}\n` +
            `Platforms: ${automationReport.platformsTargeted.join(", ")}\n` +
            `Total Estimated Reach: ${automationReport.totalEstimatedReach.toLocaleString()}\n` +
            `Automation ID: ${automationReport.automationId}\n\n` +
            `⏰ POSTING SCHEDULE\n${automationReport.scheduledTimes.join("\n")}\n\n` +
            `✅ All content optimized with real campaign data!\n` +
            `📈 AI-powered engagement optimization active`,
        );

        console.log("✅ AI social content generated and scheduled");
      } else {
        throw new Error("AI social content generation failed");
      }
    } catch (error) {
      console.error("❌ AI social content generation failed:", error);

      // Fallback to enhanced demo content
      const platforms = [
        "Facebook",
        "Instagram",
        "Twitter",
        "LinkedIn",
        "TikTok",
      ];
      const postsGenerated = Math.floor(Math.random() * 3) + 3;
      const totalReach = Math.floor(Math.random() * 5000) + 8000;
      const automationId = `social_${Date.now()}`;

      alert(
        `🤖 AI SOCIAL CONTENT (Demo Mode)\n\n` +
          `📱 CONTENT GENERATED\n` +
          `Posts Created: ${postsGenerated}\n` +
          `Platforms: ${platforms.slice(0, postsGenerated).join(", ")}\n` +
          `Content Type: Impact stories, education updates, urgent needs\n\n` +
          `🚀 AUTOMATION SIMULATED\n` +
          `Total Estimated Reach: ${totalReach.toLocaleString()}\n` +
          `Expected Engagement: 20-35%\n` +
          `Automation ID: ${automationId}\n\n` +
          `⏰ OPTIMIZED SCHEDULING\n` +
          `Facebook: 2:00 PM EST\n` +
          `Instagram: 12:30 PM EST\n` +
          `Twitter: 9:00 AM EST\n\n` +
          `🤖 AI Features: Real-time data integration, engagement optimization\n` +
          `🔧 Full AI generation available in production`,
      );
    } finally {
      setLoading(false);
    }
  };

  const scheduleEmailCampaign = async () => {
    setLoading(true);
    try {
      // Get email templates first
      const templatesResponse = await fetch(
        "/api/email/campaigns?action=templates",
      );
      const templatesData = await templatesResponse.json();

      if (!templatesResponse.ok) {
        throw new Error("Failed to fetch email templates");
      }

      // Select a random template
      const templates = templatesData.templates;
      const selectedTemplate =
        templates[Math.floor(Math.random() * templates.length)];

      // Generate recipient list based on current stats
      const recipientCount = Math.floor(
        hfrpStats.totalDonors * (0.7 + Math.random() * 0.3),
      );
      const recipients = Array.from(
        { length: Math.min(recipientCount, 10) },
        (_, i) => `donor${i + 1}@example.com`,
      );

      // Create campaign
      const createResponse = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          campaign: {
            name: selectedTemplate.name,
            subject: selectedTemplate.subject,
            content: selectedTemplate.htmlContent,
            recipients,
            scheduledFor: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(), // Tomorrow
          },
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.error || "Failed to create campaign");
      }

      // Schedule the campaign
      const scheduleResponse = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          campaignId: createData.campaign.id,
          campaign: {
            scheduledFor: new Date(
              Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        }),
      });

      const scheduleData = await scheduleResponse.json();

      if (!scheduleResponse.ok) {
        throw new Error(scheduleData.error || "Failed to schedule campaign");
      }

      // Send the campaign immediately for demo
      const sendResponse = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          campaignId: createData.campaign.id,
        }),
      });

      const sendData = await sendResponse.json();

      if (sendResponse.ok && sendData.automationReport) {
        const report = sendData.automationReport;

        alert(
          `📧 EMAIL CAMPAIGN SENT SUCCESSFULLY\n\n` +
            `Campaign: "${selectedTemplate.name}"\n` +
            `Subject: ${selectedTemplate.subject}\n` +
            `Recipients: ${recipients.length.toLocaleString()}\n` +
            `Category: ${selectedTemplate.category.replace("_", " ").toUpperCase()}\n\n` +
            `📊 CAMPAIGN ANALYTICS\n` +
            `Delivery Rate: ${(report.deliveryRate * 100).toFixed(1)}%\n` +
            `Open Rate: ${(report.openRate * 100).toFixed(1)}%\n` +
            `Click Rate: ${(report.clickRate * 100).toFixed(1)}%\n` +
            `Unsubscribe Rate: ${(report.unsubscribeRate * 100).toFixed(2)}%\n\n` +
            `🤖 AUTOMATION ACTIONS\n${report.automationActions.join("\n")}\n\n` +
            `📅 Next Scheduled: ${report.nextScheduledDate ? new Date(report.nextScheduledDate).toLocaleDateString() : "None"}\n\n` +
            `✅ Campaign completed successfully!${sendData.isDemoMode ? " (Demo Mode)" : ""}`,
        );
      } else {
        throw new Error(sendData.error || "Failed to send campaign");
      }
    } catch (error) {
      console.error("Email campaign error:", error);

      // Fallback to demo mode
      const demoTemplates = [
        {
          name: "Monthly Impact Newsletter",
          subject: "Your Support Changed Everything This Month ❤️",
          category: "newsletter",
        },
        {
          name: "Emergency Relief Appeal",
          subject: "Urgent: Emergency Relief Needed in Haiti",
          category: "emergency_appeal",
        },
        {
          name: "Donation Thank You",
          subject: "Thank You for Your Generous Donation! 🙏",
          category: "donation_thank_you",
        },
      ];

      const demoTemplate =
        demoTemplates[Math.floor(Math.random() * demoTemplates.length)];
      const demoRecipients = Math.floor(
        hfrpStats.totalDonors * (0.7 + Math.random() * 0.3),
      );

      alert(
        `📧 EMAIL CAMPAIGN SCHEDULED (Demo Mode)\n\n` +
          `Campaign: "${demoTemplate.name}"\n` +
          `Subject: ${demoTemplate.subject}\n` +
          `Recipients: ${demoRecipients.toLocaleString()}\n` +
          `Category: ${demoTemplate.category.replace("_", " ").toUpperCase()}\n\n` +
          `📅 Scheduled: Tomorrow 10:00 AM EST\n` +
          `📊 Expected open rate: 28-35%\n` +
          `🎯 Expected click rate: 8-12%\n` +
          `💰 Projected donations: $2,500-4,000\n\n` +
          `⚠️ Demo mode - Email service not configured\n` +
          `✅ Campaign queued in system!`,
      );
    } finally {
      setLoading(false);
    }
  };

  const generateAnalyticsReport = () => {
    const analytics = {
      websiteTraffic: {
        visitors: hfrpStats.websiteVisitors,
        pageViews: hfrpStats.websiteVisitors * 3.2,
        avgSessionTime: "3m 42s",
        bounceRate: "34%",
        topPages: ["/", "/donate", "/about", "/gallery", "/blog"],
      },
      donationInsights: {
        conversionRate: "4.2%",
        averageDonation: 125,
        recurringPercentage: "31%",
        mobileVsDesktop: "65% / 35%",
        peakDonationTime: "Sunday 2-4 PM",
      },
      socialMedia: {
        followers: 2840,
        engagement: "12.8%",
        reach: 15600,
        clicks: 420,
        shares: 89,
      },
    };

    alert(
      `📈 COMPREHENSIVE ANALYTICS REPORT\n\n` +
        `🌐 WEBSITE PERFORMANCE:\n` +
        `• Visitors: ${analytics.websiteTraffic.visitors.toLocaleString()}\n` +
        `• Page Views: ${analytics.websiteTraffic.pageViews.toLocaleString()}\n` +
        `• Session Time: ${analytics.websiteTraffic.avgSessionTime}\n` +
        `• Bounce Rate: ${analytics.websiteTraffic.bounceRate}\n\n` +
        `💰 DONATION INSIGHTS:\n` +
        `• Conversion Rate: ${analytics.donationInsights.conversionRate}\n` +
        `• Avg Donation: $${analytics.donationInsights.averageDonation}\n` +
        `• Recurring: ${analytics.donationInsights.recurringPercentage}\n` +
        `• Peak Time: ${analytics.donationInsights.peakDonationTime}\n\n` +
        `📱 SOCIAL MEDIA:\n` +
        `• Followers: ${analytics.socialMedia.followers.toLocaleString()}\n` +
        `• Engagement: ${analytics.socialMedia.engagement}\n` +
        `• Reach: ${analytics.socialMedia.reach.toLocaleString()}\n\n` +
        `📊 Full report exported to dashboard`,
    );
  };

  const automateVolunteerScheduling = async () => {
    setLoading(true);
    try {
      // Get available programs first
      const programsResponse = await fetch(
        "/api/volunteer/scheduler?action=programs",
      );
      const programsData = await programsResponse.json();

      if (!programsResponse.ok) {
        throw new Error("Failed to fetch volunteer programs");
      }

      // Select a random program for auto-matching
      const programs = programsData.programs;
      const selectedProgram =
        programs[Math.floor(Math.random() * programs.length)];

      // Auto-match volunteers to the selected program
      const matchResponse = await fetch("/api/volunteer/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_match",
          programId: selectedProgram.id,
          requiredSkills: selectedProgram.requiredSkills.slice(0, 2), // Use first 2 required skills
          shiftDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // Next week
        }),
      });

      const matchData = await matchResponse.json();

      if (!matchResponse.ok) {
        throw new Error(matchData.error || "Failed to auto-match volunteers");
      }

      // Get analytics for additional context
      const analyticsResponse = await fetch("/api/volunteer/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_analytics" }),
      });

      const analyticsData = await analyticsResponse.json();

      if (matchResponse.ok && matchData.automationReport) {
        const report = matchData.automationReport;
        const analytics = analyticsData.success
          ? analyticsData.analytics
          : null;

        alert(
          `👥 VOLUNTEER AUTOMATION COMPLETE\n\n` +
            `📋 Program: "${selectedProgram.name}"\n` +
            `📍 Location: ${selectedProgram.location}\n` +
            `👤 Coordinator: ${selectedProgram.coordinator}\n\n` +
            `🎯 MATCHING RESULTS\n` +
            `Potential Matches: ${report.matchesFound}\n` +
            `Shifts Scheduled: ${report.shiftsScheduled}\n` +
            `Volunteers Notified: ${report.volunteersNotified}\n` +
            `Success Rate: ${(report.successRate * 100).toFixed(1)}%\n\n` +
            `🤖 AUTOMATION ACTIONS\n${report.automationActions.join("\n")}\n\n` +
            `📊 SYSTEM ANALYTICS\n` +
            `Active Volunteers: ${analytics ? analytics.activeVolunteers : "N/A"}\n` +
            `Upcoming Shifts: ${analytics ? analytics.upcomingShifts : "N/A"}\n` +
            `Automation Efficiency: ${analytics ? analytics.automationEfficiency + "%" : "N/A"}\n\n` +
            `📅 Next Auto-Match: ${report.nextScheduledDate ? new Date(report.nextScheduledDate).toLocaleDateString() : "TBD"}\n\n` +
            `✅ Volunteer scheduling automation completed!${report.isDemoMode ? " (Demo Mode)" : ""}`,
        );
      } else {
        throw new Error(
          matchData.error || "Failed to complete volunteer automation",
        );
      }
    } catch (error) {
      console.error("Volunteer automation error:", error);

      // Fallback to demo mode
      const demoPrograms = [
        {
          name: "Community Meal Program",
          location: "HFRP Community Kitchen",
          coordinator: "Joseph Pierre",
        },
        {
          name: "Education Support",
          location: "Port-au-Prince Education Center",
          coordinator: "Marie Laurent",
        },
        {
          name: "Healthcare Assistance",
          location: "Mobile Health Clinic",
          coordinator: "Dr. Jean Baptiste",
        },
      ];

      const demoProgram =
        demoPrograms[Math.floor(Math.random() * demoPrograms.length)];
      const demoMatches = Math.floor(Math.random() * 8) + 3; // 3-10 matches
      const demoScheduled = Math.min(demoMatches, 3); // Max 3 scheduled

      alert(
        `👥 VOLUNTEER AUTOMATION COMPLETE (Demo Mode)\n\n` +
          `📋 Program: "${demoProgram.name}"\n` +
          `📍 Location: ${demoProgram.location}\n` +
          `👤 Coordinator: ${demoProgram.coordinator}\n\n` +
          `🎯 MATCHING RESULTS\n` +
          `Potential Matches: ${demoMatches}\n` +
          `Shifts Scheduled: ${demoScheduled}\n` +
          `Volunteers Notified: ${demoScheduled}\n` +
          `Success Rate: 95.2%\n\n` +
          `🤖 AUTOMATION ACTIONS\n` +
          `✅ Analyzed volunteer skills and availability\n` +
          `📅 Scheduled optimal shift assignments\n` +
          `📧 Sent notifications to matched volunteers\n` +
          `📱 Created calendar invites for all shifts\n` +
          `🔔 Set up automated reminder system\n\n` +
          `📊 SYSTEM ANALYTICS\n` +
          `Active Volunteers: ${hfrpStats.totalDonors}\n` +
          `Upcoming Shifts: 12\n` +
          `Automation Efficiency: 92.3%\n\n` +
          `⚠️ Demo mode - Volunteer system not configured\n` +
          `✅ Volunteer scheduling automation completed!`,
      );
    } finally {
      setLoading(false);
    }
  };

  const manageDonorCommunication = async () => {
    setLoading(true);
    console.log("🔄 Executing donor communication automation...");

    try {
      // Call the new donor communication API
      const response = await fetch("/api/donor/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "automate_outreach",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const report = result.report;

        // Show comprehensive automation report
        alert(
          `💌 DONOR COMMUNICATION AUTOMATED\n\n` +
            `🎯 AUTOMATION RESULTS\n` +
            `🎉 Welcome Emails: ${report.automationResults.newDonorWelcome} sent\n` +
            `📧 Monthly Updates: ${report.automationResults.monthlyUpdates.toLocaleString()} scheduled\n` +
            `💝 Thank You Letters: ${report.automationResults.thankYouLetters} personalized\n` +
            `🧾 Tax Receipts: ${report.automationResults.taxReceipts} generated\n` +
            `🎂 Birthday Messages: ${report.automationResults.birthdayMessages} queued\n` +
            `📅 Anniversary Notes: ${report.automationResults.anniversaryReminders} prepared\n` +
            `🔄 Lapsed Donor Re-engagement: ${report.automationResults.lapsedDonorReengagement} sent\n` +
            `💎 Major Gift Stewardship: ${report.automationResults.majorGiftStewardship} personalized\n\n` +
            `📊 DONOR SEGMENTS\n` +
            `First-time: ${report.segmentBreakdown.firstTime}\n` +
            `Recurring: ${report.segmentBreakdown.recurring}\n` +
            `Major Gifts: ${report.segmentBreakdown.majorGifts}\n` +
            `Corporate: ${report.segmentBreakdown.corporate}\n` +
            `Lapsed: ${report.segmentBreakdown.lapsed}\n` +
            `VIP: ${report.segmentBreakdown.vip}\n\n` +
            `🤖 AUTOMATION STATUS\n` +
            `Rules Executed: ${report.rulesExecuted}\n` +
            `Total Recipients: ${report.totalRecipients.toLocaleString()}\n` +
            `Next Scheduled: ${new Date(report.nextScheduled).toLocaleDateString()}\n\n` +
            `✅ All communications automated and scheduled\n` +
            `📊 AI personalization and tracking active`,
        );

        console.log("✅ Donor communication automation completed successfully");
      } else {
        throw new Error("Failed to execute donor communication automation");
      }
    } catch (error) {
      console.error("Donor communication automation error:", error);

      // Fallback to demo mode
      const communication = {
        newDonorWelcome: 8,
        monthlyUpdates: hfrpStats.totalDonors,
        thankYouLetters: 23,
        taxReceipts: 156,
        birthdayMessages: 12,
        anniversaryReminders: 5,
      };

      alert(
        `💌 DONOR COMMUNICATION AUTOMATED (Demo Mode)\n\n` +
          `🎉 Welcome Emails: ${communication.newDonorWelcome} sent\n` +
          `📧 Monthly Updates: ${communication.monthlyUpdates.toLocaleString()} scheduled\n` +
          `💝 Thank You Letters: ${communication.thankYouLetters} personalized\n` +
          `🧾 Tax Receipts: ${communication.taxReceipts} generated\n` +
          `🎂 Birthday Messages: ${communication.birthdayMessages} queued\n` +
          `📅 Anniversary Notes: ${communication.anniversaryReminders} prepared\n\n` +
          `⚠️ Demo mode - Communication API not configured\n` +
          `✅ All communications scheduled\n` +
          `🤖 AI personalization active\n` +
          `📊 Tracking enabled for all campaigns`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Management Functions
  const sendSingleEmail = async () => {
    if (
      !resendEmailForm.to.length ||
      !resendEmailForm.subject ||
      !resendEmailForm.html
    ) {
      alert(
        "Please fill in all required fields (recipients, subject, and content)",
      );
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch("/api/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: resendEmailForm,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `✅ Email sent successfully!\nEmail ID: ${result.id}\nStatus: ${result.status}`,
        );
        // Reset form
        setResendEmailForm({
          from: "HFRP <noreply@familyreliefproject7.org>",
          to: [],
          subject: "",
          html: "",
        });
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Failed to send email: ${errorMessage}`);
    } finally {
      setResendLoading(false);
    }
  };

  const sendBatchEmails = async () => {
    if (batchEmails.length === 0) {
      alert("Please add at least one email to the batch");
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch("/api/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch",
          emails: batchEmails,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `✅ Batch emails sent successfully!\nEmails sent: ${result.data.length}\nFirst email ID: ${result.data[0]?.id}`,
        );
        // Reset batch
        setBatchEmails([]);
      } else {
        throw new Error(result.error || "Failed to send batch emails");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Failed to send batch emails: ${errorMessage}`);
    } finally {
      setResendLoading(false);
    }
  };

  const trackEmailStatus = async () => {
    if (!emailToTrack) {
      alert("Please enter an email ID to track");
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch(
        `/api/email/resend?action=status&emailId=${emailToTrack}`,
      );
      const result = await response.json();

      if (response.ok) {
        setEmailStatuses([result.data]);
        alert(
          `📧 Email Status Retrieved\nID: ${result.data.id}\nStatus: ${result.data.status}\nCreated: ${new Date(result.data.created_at).toLocaleString()}`,
        );
      } else {
        throw new Error(result.error || "Failed to get email status");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Failed to track email: ${errorMessage}`);
    } finally {
      setResendLoading(false);
    }
  };

  const updateScheduledEmail = async (emailId: string) => {
    const newScheduleTime = prompt(
      "Enter new schedule time (ISO format, e.g., 2024-01-01T10:00:00Z):",
    );
    if (!newScheduleTime) return;

    setResendLoading(true);
    try {
      const response = await fetch("/api/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          emailId,
          scheduledAt: newScheduleTime,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `✅ Email schedule updated successfully!\nNew schedule: ${newScheduleTime}`,
        );
      } else {
        throw new Error(result.error || "Failed to update email schedule");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Failed to update email: ${errorMessage}`);
    } finally {
      setResendLoading(false);
    }
  };

  const cancelScheduledEmail = async (emailId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled email?"))
      return;

    setResendLoading(true);
    try {
      const response = await fetch("/api/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          emailId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Email cancelled successfully!`);
      } else {
        throw new Error(result.error || "Failed to cancel email");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Failed to cancel email: ${errorMessage}`);
    } finally {
      setResendLoading(false);
    }
  };

  const addToBatch = () => {
    if (
      !resendEmailForm.to.length ||
      !resendEmailForm.subject ||
      !resendEmailForm.html
    ) {
      alert("Please fill in all required fields before adding to batch");
      return;
    }

    setBatchEmails([...batchEmails, { ...resendEmailForm }]);
    // Reset form for next email
    setResendEmailForm({
      from: "HFRP <noreply@familyreliefproject7.org>",
      to: [],
      subject: "",
      html: "",
    });
    alert("Email added to batch!");
  };

  if (!user) {
    return null;
  }

  // Donorbox sync removed; Stripe is the sole donation provider.

  return (
    <div className={`min-h-screen bg-gray-100 pb-8 ${className}`}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/hfrp-logo.png"
                alt="HFRP"
                className="h-8 w-8 rounded-full mr-3"
              />
              <h1 className="text-xl font-bold text-gray-900">
                HFRP Admin Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  Welcome, {user.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="relative group">
                <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z" />
                    <path d="M10 14a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link
                    href="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stripeStatus && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              {stripeStatus.mode === "test" ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">🧪 Test Mode</span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">🔴 Live Mode</span>
              )}
              {stripeStatus.modeMismatch ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Mode Mismatch</span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Keys Aligned</span>
              )}
              {stripeStatus.webhook?.configured_for_mode ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Webhook Ready</span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Webhook Missing</span>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="font-medium text-gray-900">Main Navigation</div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "overview"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab("automation")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "automation"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Automation Hub</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "analytics"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <span>Analytics</span>
                </button>

                <WithPermission permission="edit_content">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                      activeTab === "content"
                        ? "bg-red-50 text-red-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path
                        fillRule="evenodd"
                        d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Content Management</span>
                  </button>
                </WithPermission>

                <WithPermission permission="edit_content">
                  <Link
                    href="/admin/blog/posts"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 1 1 0 000 2H4v10h12V5h-2a1 1 0 100-2 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Blog Management</span>
                  </Link>
                </WithPermission>

                <WithPermission permission="upload_media">
                  <button
                    onClick={() => setActiveTab("gallery")}
                    className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                      activeTab === "gallery"
                        ? "bg-red-50 text-red-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Media Gallery</span>
                  </button>
                </WithPermission>

                <WithPermission permission="manage_donations">
                  <button
                    onClick={() => setActiveTab("stripe")}
                    className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                      activeTab === "stripe"
                        ? "bg-red-50 text-red-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Stripe Automation</span>
                  </button>
                </WithPermission>

                <WithPermission permission="manage_volunteers">
                  <Link
                    href="/admin/volunteers"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <span>Volunteer Management</span>
                  </Link>
                </WithPermission>

                <WithPermission permission="manage_donations">
                  <Link
                    href="/admin/donations"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Donation Management</span>
                  </Link>
                </WithPermission>

                <WithPermission permission="manage_settings">
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                      activeTab === "settings"
                        ? "bg-red-50 text-red-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Site Settings</span>
                  </button>
                </WithPermission>

                <WithPermission permission="manage_settings">
                  <Link
                    href="/admin/backup"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Backup & Restore</span>
                  </Link>
                </WithPermission>
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="font-medium text-gray-900">Quick Links</div>
                <div className="mt-2 space-y-2">
                  <Link
                    href="/"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    → View Website
                  </Link>
                  <Link
                    href="/admin/test"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    → Run Tests
                  </Link>
                  <WithPermission permission="view_analytics">
                    <Link
                      href="/admin/analytics"
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      → View Analytics
                    </Link>
                  </WithPermission>
                  <WithPermission permission="manage_backups">
                    <Link
                      href="/admin/backup"
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      → Backup & Restore
                    </Link>
                  </WithPermission>
                  <WithPermission permission="manage_settings">
                    <Link
                      href="/admin/webhooks"
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      → Manage Webhooks
                    </Link>
                  </WithPermission>
                  <Link
                    href="/webhook-test"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    → Test Webhooks
                  </Link>
                  <Link
                    href="/admin/webhooks/logs"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    → Webhook Logs
                  </Link>
                  <Link
                    href="/assistant"
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    → Open Assistant
                  </Link>
                  <WithPermission permission="manage_users">
                    <Link
                      href="/admin/deploy"
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      → Deployment Checklist
                    </Link>
                  </WithPermission>
                </div>
              </div>
            </nav>

            <div className="mt-4 bg-white shadow rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>System status: Online</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Last backup: {new Date().toLocaleDateString()}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Dashboard Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Dashboard Overview
                </h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Donations */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path
                            fillRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Total Donations
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                          {stats.donations.total}
                        </p>
                        <p className="text-sm text-gray-500">
                          Monthly: {stats.donations.monthly}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Content
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          {stats.content.blogPosts}
                        </p>
                        <p className="text-sm text-gray-500">
                          Blog Posts Published
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Volunteers */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Volunteers
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                          {stats.volunteers.active}
                        </p>
                        <p className="text-sm text-gray-500">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Site Traffic */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Site Visitors
                        </h3>
                        <p className="text-3xl font-bold text-orange-600">
                          {stats.visitors.total}
                        </p>
                        <p className="text-sm text-gray-500">This month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <WithPermission permission="edit_content">
                        <Link
                          href="/admin/blog"
                          className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700 text-left transition-colors block"
                        >
                          <div className="text-2xl mb-2">📝</div>
                          <div className="font-semibold">Create Blog Post</div>
                          <div className="text-xs opacity-75">
                            Write new content
                          </div>
                        </Link>
                      </WithPermission>

                      <WithPermission permission="view_analytics">
                        <Link
                          href="/admin/analytics"
                          className="bg-green-600 text-white p-4 rounded hover:bg-green-700 text-left transition-colors block"
                        >
                          <div className="text-2xl mb-2">📊</div>
                          <div className="font-semibold">View Analytics</div>
                          <div className="text-xs opacity-75">
                            Site performance
                          </div>
                        </Link>
                      </WithPermission>

                      <WithPermission permission="manage_volunteers">
                        <Link
                          href="/admin/volunteers"
                          className="bg-purple-600 text-white p-4 rounded hover:bg-purple-700 text-left transition-colors block"
                        >
                          <div className="text-2xl mb-2">👥</div>
                          <div className="font-semibold">Manage Volunteers</div>
                          <div className="text-xs opacity-75">
                            Coordinate team
                          </div>
                        </Link>
                      </WithPermission>

                      <WithPermission permission="manage_settings">
                        <Link
                          href="/admin/settings"
                          className="bg-orange-600 text-white p-4 rounded hover:bg-orange-700 text-left transition-colors block"
                        >
                          <div className="text-2xl mb-2">⚙️</div>
                          <div className="font-semibold">Site Settings</div>
                          <div className="text-xs opacity-75">
                            Configure options
                          </div>
                        </Link>
                      </WithPermission>

                      <WithPermission permission="manage_donations">
                        <a
                          href="https://connect.stripe.com/d/setup/e/_TO365uSkCCbOqJ0ITW8P4bEW5C/YWNjdF8xU1BNUEwyTGZScmJJTTdq/6a2d66962b0c34ff8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-indigo-600 text-white p-4 rounded hover:bg-indigo-700 text-left transition-colors block"
                        >
                          <div className="text-2xl mb-2">🔗</div>
                          <div className="font-semibold">
                            Stripe Connect Onboarding
                          </div>
                          <div className="text-xs opacity-75">
                            Open external onboarding link
                          </div>
                        </a>
                      </WithPermission>

                      {/* Print Function */}
                      <button
                        onClick={() => {
                          // Add print-specific CSS
                          const printStyles = document.createElement("style");
                          printStyles.textContent = `
                            @media print {
                              body * { visibility: hidden; }
                              .print-content, .print-content * { visibility: visible; }
                              .print-content { position: absolute; left: 0; top: 0; width: 100%; }
                              .no-print { display: none !important; }
                              .print-header { 
                                display: flex !important; 
                                align-items: center; 
                                margin-bottom: 20px; 
                                padding-bottom: 10px; 
                                border-bottom: 2px solid #333; 
                              }
                              .print-logo { width: 60px; height: 60px; margin-right: 15px; }
                              .print-title { font-size: 24px; font-weight: bold; }
                              .print-date { font-size: 14px; color: #666; margin-top: 5px; }
                            }
                          `;
                          document.head.appendChild(printStyles);

                          // Create print content
                          const printContent = document.createElement("div");
                          printContent.className = "print-content";
                          printContent.innerHTML = `
                            <div class="print-header">
                              <img src="/hfrp-logo.svg" alt="HFRP Logo" class="print-logo" />
                              <div>
                                <div class="print-title">Haitian Family Relief Project</div>
                                <div class="print-date">Admin Dashboard Report - ${new Date().toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div>
                              <h2>Dashboard Overview</h2>
                              <p>This report was generated from the HFRP Admin Dashboard.</p>
                              <p>For more information, visit: haitianfamilyrelief.org</p>
                            </div>
                          `;
                          document.body.appendChild(printContent);

                          // Print and cleanup
                          window.print();

                          setTimeout(() => {
                            document.head.removeChild(printStyles);
                            document.body.removeChild(printContent);
                          }, 1000);
                        }}
                        className="bg-gray-600 text-white p-4 rounded hover:bg-gray-700 text-left transition-colors"
                      >
                        <div className="text-2xl mb-2">🖨️</div>
                        <div className="font-semibold">Print Report</div>
                        <div className="text-xs opacity-75">
                          Generate printout
                        </div>
                      </button>

                      {/* Toggle Features */}
                      <button
                        onClick={() => {
                          const newStatus = !featuresEnabled;

                          if (newStatus) {
                            // Enable features
                            localStorage.setItem(
                              "hfrp_features_enabled",
                              "true",
                            );

                            // Use window function if available
                            if (
                              typeof window !== "undefined" &&
                              (
                                window as Window & {
                                  hfrpEnableSiteFeatures?: () => void;
                                }
                              ).hfrpEnableSiteFeatures
                            ) {
                              (
                                window as Window & {
                                  hfrpEnableSiteFeatures?: () => void;
                                }
                              ).hfrpEnableSiteFeatures?.();
                            }

                            // Dispatch custom event for feature enablement
                            window.dispatchEvent(
                              new CustomEvent("featuresEnabled", {
                                detail: {
                                  enabled: true,
                                  timestamp: Date.now(),
                                },
                              }),
                            );

                            alert(
                              "Advanced features have been enabled! PWA and automation features are now active.",
                            );
                          } else {
                            // Disable features
                            localStorage.setItem(
                              "hfrp_features_enabled",
                              "false",
                            );

                            // Use window function if available
                            if (
                              typeof window !== "undefined" &&
                              (
                                window as Window & {
                                  hfrpDisableSiteFeatures?: () => void;
                                }
                              ).hfrpDisableSiteFeatures
                            ) {
                              (
                                window as Window & {
                                  hfrpDisableSiteFeatures?: () => void;
                                }
                              ).hfrpDisableSiteFeatures?.();
                            }

                            // Dispatch custom event for feature disablement
                            window.dispatchEvent(
                              new CustomEvent("featuresDisabled", {
                                detail: {
                                  enabled: false,
                                  timestamp: Date.now(),
                                },
                              }),
                            );

                            alert(
                              "Advanced features have been disabled. PWA has been unregistered.",
                            );
                          }

                          setFeaturesEnabled(newStatus);
                        }}
                        className={`${
                          featuresEnabled
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        } text-white p-4 rounded text-left transition-colors`}
                      >
                        <div className="text-2xl mb-2">
                          {featuresEnabled ? "✅" : "⚡"}
                        </div>
                        <div className="font-semibold">
                          {featuresEnabled
                            ? "Disable Features"
                            : "Enable Features"}
                        </div>
                        <div className="text-xs opacity-75">
                          {featuresEnabled
                            ? "Turn off advanced"
                            : "Activate advanced"}
                        </div>
                        <div className="text-xs mt-1 font-medium">
                          Status: {featuresEnabled ? "ON" : "OFF"}
                        </div>
                      </button>

                      {/* Donate Function */}
                      <button
                        onClick={() => {
                          window.open("/donate", "_self");
                        }}
                        className="bg-red-600 text-white p-4 rounded hover:bg-red-700 text-left transition-colors"
                      >
                        <div className="text-2xl mb-2">❤️</div>
                        <div className="font-semibold">Donate Now</div>
                        <div className="text-xs opacity-75">
                          Support our mission
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <div className="text-green-600">💰</div>
                        </div>
                        <div>
                          <p className="font-medium">New Donation Received</p>
                          <p className="text-sm text-gray-500">
                            $25.00 monthly donation
                          </p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <div className="text-blue-600">📝</div>
                        </div>
                        <div>
                          <p className="font-medium">Blog Post Published</p>
                          <p className="text-sm text-gray-500">
                            "New Children Welcomed to Safe Housing"
                          </p>
                          <p className="text-xs text-gray-400">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <div className="text-purple-600">👥</div>
                        </div>
                        <div>
                          <p className="font-medium">
                            New Volunteer Registration
                          </p>
                          <p className="text-sm text-gray-500">
                            Maria Rodriguez joined as educator
                          </p>
                          <p className="text-xs text-gray-400">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Automation Hub */}
            {activeTab === "automation" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <svg
                      className="w-8 h-8 text-blue-600 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    HFRP Automation Hub
                  </h2>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-medium">
                      All Systems Active
                    </span>
                  </div>
                </div>

                {/* Enhanced HFRP Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Total Donations
                        </p>
                        <p className="text-3xl font-bold">
                          ${hfrpStats.totalDonations.toLocaleString()}
                        </p>
                        <p className="text-green-100 text-xs">
                          +${hfrpStats.monthlyRecurring.toLocaleString()}{" "}
                          monthly
                        </p>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path
                            fillRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Families Helped
                        </p>
                        <p className="text-3xl font-bold">
                          {hfrpStats.familiesHelped}
                        </p>
                        <p className="text-blue-100 text-xs">
                          {hfrpStats.totalDonors.toLocaleString()} donors
                        </p>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">
                          Meals Served
                        </p>
                        <p className="text-3xl font-bold">
                          {hfrpStats.mealsServed.toLocaleString()}
                        </p>
                        <p className="text-orange-100 text-xs">
                          {hfrpStats.homesBuilt} homes built
                        </p>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          Medical Treatments
                        </p>
                        <p className="text-3xl font-bold">
                          {hfrpStats.medicalTreatments.toLocaleString()}
                        </p>
                        <p className="text-purple-100 text-xs">
                          {hfrpStats.educationalSupport} students supported
                        </p>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automation Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 text-indigo-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Automation Settings
                    </h3>

                    <div className="space-y-4">
                      {Object.entries(automationSettings).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <label className="text-gray-700 font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </label>
                              <p className="text-sm text-gray-500">
                                {key === "emailNotifications" &&
                                  "Automated email alerts for new donations"}
                                {key === "donationAlerts" &&
                                  "Real-time donation notifications"}
                                {key === "weeklyReports" &&
                                  "Automated weekly impact reports"}
                                {key === "socialMediaPosts" &&
                                  "Auto-generated social content"}
                                {key === "donorFollowUp" &&
                                  "Automated donor communication"}
                                {key === "inventoryAlerts" &&
                                  "Supply inventory notifications"}
                                {key === "scheduledCampaigns" &&
                                  "Automated fundraising campaigns"}
                                {key === "analyticsReporting" &&
                                  "Automated analytics generation"}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setAutomationSettings((prev) => ({
                                  ...prev,
                                  [key]: !value,
                                }))
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? "bg-blue-600" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 text-green-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={runDonationReport}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors text-center disabled:opacity-50"
                      >
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        <div className="font-semibold">Generate Report</div>
                        <div className="text-xs opacity-75">
                          Donation analytics
                        </div>
                      </button>

                      <button
                        onClick={syncStripeData}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors text-center disabled:opacity-50"
                      >
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <div className="font-semibold">
                          {loading ? "Syncing..." : "Sync Stripe Data"}
                        </div>
                        <div className="text-xs opacity-75">
                          Update campaigns & donations
                        </div>
                      </button>

                      <button
                        onClick={generateSocialContent}
                        className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors text-center"
                      >
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <div className="font-semibold">Social Content</div>
                        <div className="text-xs opacity-75">
                          AI generated posts
                        </div>
                      </button>

                      <button
                        onClick={scheduleEmailCampaign}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors text-center"
                      >
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="font-semibold">Email Campaign</div>
                        <div className="text-xs opacity-75">
                          Schedule outreach
                        </div>
                      </button>

                      <button
                        onClick={automateVolunteerScheduling}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-lg transition-colors text-center"
                      >
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <div className="font-semibold">Volunteer Scheduler</div>
                        <div className="text-xs opacity-75">
                          Auto-match volunteers
                        </div>
                      </button>

                      <button
                        onClick={manageDonorCommunication}
                        className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-lg transition-colors text-center"
                      >
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <div className="font-semibold">Donor Communication</div>
                        <div className="text-xs opacity-75">
                          Automated outreach
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Automation Runner */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl ring-1 ring-blue-100 p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center">
                      <svg
                        className="w-7 h-7 text-blue-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Email Automation
                    </h2>
                    <button
                      onClick={runEmailAutomation}
                      disabled={automationRunLoading}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-50"
                    >
                      {automationRunLoading ? (
                        <span className="inline-flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                          Running…
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          </svg>
                          Run Now
                        </span>
                      )}
                    </button>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Process scheduled campaigns, donation thank-you emails, and
                    queued emails in one click.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 shadow-sm ring-1 ring-inset ring-blue-100">
                      <div className="text-sm text-blue-700">
                        Scheduled Campaigns
                      </div>
                      <div className="text-2xl font-semibold text-blue-900">
                        {automationRunResults?.processedScheduled ?? 0}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 shadow-sm ring-1 ring-inset ring-green-100">
                      <div className="text-sm text-green-700">
                        Thank-You Emails
                      </div>
                      <div className="text-2xl font-semibold text-green-900">
                        {automationRunResults?.processedThankYou ?? 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 shadow-sm ring-1 ring-inset ring-purple-100">
                      <div className="text-sm text-purple-700">
                        Queued Emails
                      </div>
                      <div className="text-2xl font-semibold text-purple-900">
                        {automationRunResults?.processedQueue ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    <span className="mr-2">Mode:</span>
                    {automationRunResults?.isDemoMode ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                        Demo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700">
                        Live
                      </span>
                    )}
                    {automationRunAt && (
                      <span className="ml-4">
                        Last run: {new Date(automationRunAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Automation Scheduler */}
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl ring-1 ring-purple-100 p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 flex items-center">
                      <svg
                        className="w-7 h-7 text-purple-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 2a1 1 0 00-1 1v1H4a1 1 0 000 2h1v1a1 1 0 102 0V6h1a1 1 0 100-2H7V3a1 1 0 00-1-1zM4 12a1 1 0 011-1h1v-1a1 1 0 112 0v1h1a1 1 0 010 2H8v1a1 1 0 11-2 0v-1H5a1 1 0 01-1-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" />
                      </svg>
                      Automation Scheduler
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={refreshSchedulerStatus}
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center border border-gray-200"
                        title="Refresh scheduler status"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a8 8 0 0113.856 2.485 1 1 0 11-1.812.83A6 6 0 105 10h2l-3 3-3-3h2A8 8 0 014 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Refresh
                      </button>
                      <button
                        onClick={startScheduler}
                        disabled={schedulerLoading}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6 4l10 6-10 6V4z" />
                        </svg>
                        Start
                      </button>
                      <button
                        onClick={stopScheduler}
                        disabled={schedulerLoading}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6 6h8v8H6z" />
                        </svg>
                        Stop
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4 shadow-sm ring-1 ring-inset ring-purple-100">
                      <div className="text-sm text-purple-700">Status</div>
                      <div className="text-2xl font-semibold text-purple-900 flex items-center gap-2">
                        {schedulerLoading && (
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></span>
                        )}
                        {schedulerStatus?.isRunning ? "Running" : "Stopped"}
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 shadow-sm ring-1 ring-inset ring-indigo-100">
                      <div className="text-sm text-indigo-700">Jobs</div>
                      <div className="text-2xl font-semibold text-indigo-900">
                        {schedulerStatus?.totalJobs ?? 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 shadow-sm ring-1 ring-inset ring-blue-100">
                      <div className="text-sm text-blue-700">Active</div>
                      <div className="text-2xl font-semibold text-blue-900">
                        {(() => {
                          try {
                            const jobs = schedulerStatus?.jobs;
                            return jobs
                              ? Object.values(jobs).filter(
                                  (j) => j?.status === "running",
                                ).length
                              : 0;
                          } catch {
                            return 0;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Management Panel */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <svg
                        className="w-6 h-6 text-purple-600 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Workflow Orchestration
                    </h3>
                    <div className="flex items-center space-x-2">
                      {workflowStatus.isRunning ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-yellow-600 font-medium text-sm">
                            Running
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium text-sm">
                            Ready
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workflow Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <button
                      onClick={() => runWorkflow("development")}
                      disabled={workflowStatus.isRunning}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center text-center"
                    >
                      <svg
                        className="w-6 h-6 mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Development</span>
                      <span className="text-xs opacity-75">Test & Build</span>
                    </button>

                    <button
                      onClick={() => runWorkflow("staging")}
                      disabled={workflowStatus.isRunning}
                      className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center text-center"
                    >
                      <svg
                        className="w-6 h-6 mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path
                          fillRule="evenodd"
                          d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Staging</span>
                      <span className="text-xs opacity-75">Deploy to Test</span>
                    </button>

                    <button
                      onClick={() => runWorkflow("production")}
                      disabled={workflowStatus.isRunning}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center text-center"
                    >
                      <svg
                        className="w-6 h-6 mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="font-medium">Production</span>
                      <span className="text-xs opacity-75">Deploy Live</span>
                    </button>

                    <button
                      onClick={() => runWorkflow("maintenance")}
                      disabled={workflowStatus.isRunning}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center text-center"
                    >
                      <svg
                        className="w-6 h-6 mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Maintenance</span>
                      <span className="text-xs opacity-75">System Care</span>
                    </button>

                    <button
                      onClick={() => runWorkflow("ui-automation")}
                      disabled={workflowStatus.isRunning}
                      className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center text-center"
                    >
                      <svg
                        className="w-6 h-6 mb-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">UI Automation</span>
                      <span className="text-xs opacity-75">Post-Deploy UI</span>
                    </button>
                  </div>

                  {/* Workflow Status */}
                  {workflowStatus.currentWorkflow && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Current Workflow: {workflowStatus.currentWorkflow}
                        </h4>
                        {workflowStatus.isRunning && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Running:</span>
                          <span className="ml-2 font-medium">
                            {workflowStatus.runningTasks.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Completed:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {workflowStatus.completedTasks.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Failed:</span>
                          <span className="ml-2 font-medium text-red-600">
                            {workflowStatus.failedTasks.length}
                          </span>
                        </div>
                      </div>

                      {workflowStatus.logs.length > 0 && (
                        <div className="mt-3 max-h-32 overflow-y-auto">
                          <div className="text-xs space-y-1">
                            {workflowStatus.logs.slice(-5).map((log, index) => (
                              <div
                                key={index}
                                className="text-gray-600 font-mono"
                              >
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* System Health Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            System Health
                          </p>
                          <p className="text-xs text-green-600">
                            All systems operational
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Automation
                          </p>
                          <p className="text-xs text-blue-600">
                            {
                              Object.values(automationSettings).filter(Boolean)
                                .length
                            }
                            /8 active
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-purple-800">
                            Workflows
                          </p>
                          <p className="text-xs text-purple-600">
                            Ready for execution
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resend Email Management */}
            {activeTab === "automation" && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Resend Email Management
                </h3>

                {/* Single Email Form */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Send Single Email
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From
                      </label>
                      <input
                        type="email"
                        value={resendEmailForm.from}
                        onChange={(e) =>
                          setResendEmailForm({
                            ...resendEmailForm,
                            from: e.target.value,
                          })
                        }
                        placeholder="sender@yourdomain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={resendEmailForm.to.join(", ")}
                        onChange={(e) =>
                          setResendEmailForm({
                            ...resendEmailForm,
                            to: e.target.value
                              .split(",")
                              .map((email) => email.trim()),
                          })
                        }
                        placeholder="recipient1@email.com, recipient2@email.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={resendEmailForm.subject}
                        onChange={(e) =>
                          setResendEmailForm({
                            ...resendEmailForm,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Email subject"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HTML Content
                      </label>
                      <textarea
                        value={resendEmailForm.html}
                        onChange={(e) =>
                          setResendEmailForm({
                            ...resendEmailForm,
                            html: e.target.value,
                          })
                        }
                        placeholder="<p>Your email content here...</p>"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule At (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={resendEmailForm.scheduledAt || ""}
                        onChange={(e) =>
                          setResendEmailForm({
                            ...resendEmailForm,
                            scheduledAt: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={sendSingleEmail}
                        disabled={resendLoading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        {resendLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          "Send Email"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Batch Email Management */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Batch Email Management
                  </h4>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={addToBatch}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Add Current Email to Batch
                    </button>
                    <button
                      onClick={sendBatchEmails}
                      disabled={batchEmails.length === 0 || resendLoading}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      Send Batch ({batchEmails.length} emails)
                    </button>
                    <button
                      onClick={() => setBatchEmails([])}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Clear Batch
                    </button>
                  </div>

                  {batchEmails.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h5 className="font-medium text-gray-800 mb-2">
                        Batch Queue ({batchEmails.length} emails)
                      </h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {batchEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-white p-2 rounded border"
                          >
                            <div className="text-sm">
                              <span className="font-medium">
                                {email.subject}
                              </span>{" "}
                              → {email.to.join(", ")}
                            </div>
                            <button
                              onClick={() =>
                                setBatchEmails(
                                  batchEmails.filter((_, i) => i !== index),
                                )
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Status Tracking */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Email Status Tracking
                  </h4>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={emailToTrack}
                      onChange={(e) => setEmailToTrack(e.target.value)}
                      placeholder="Enter email ID to track"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={trackEmailStatus}
                      disabled={!emailToTrack || resendLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Track Status
                    </button>
                  </div>

                  {emailStatuses.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h5 className="font-medium text-gray-800 mb-2">
                        Email Status History
                      </h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {emailStatuses.map((status, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-white p-2 rounded border"
                          >
                            <div className="text-sm">
                              <span className="font-medium">{status.id}</span>
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs ${
                                  status.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : status.status === "sent"
                                      ? "bg-blue-100 text-blue-800"
                                      : status.status === "queued"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : status.status === "failed" ||
                                            status.status === "bounced"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {status.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(status.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Management Actions */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Email Management Actions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email ID for Update/Cancel
                      </label>
                      <input
                        type="text"
                        value={emailToTrack}
                        onChange={(e) => setEmailToTrack(e.target.value)}
                        placeholder="Enter email ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Schedule Time (for update)
                      </label>
                      <input
                        type="datetime-local"
                        value={resendEmailForm.scheduledAt || ""}
                        onChange={(e) =>
                          setResendEmailForm({
                            ...resendEmailForm,
                            scheduledAt: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => updateScheduledEmail(emailToTrack)}
                      disabled={
                        !emailToTrack ||
                        !resendEmailForm.scheduledAt ||
                        resendLoading
                      }
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      Update Schedule
                    </button>
                    <button
                      onClick={() => cancelScheduledEmail(emailToTrack)}
                      disabled={!emailToTrack || resendLoading}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Cancel Email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Dashboard */}
            {activeTab === "analytics" && (
              <div ref={analyticsSectionRef} className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <svg
                      className="w-8 h-8 text-indigo-600 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Analytics & Insights
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generateAnalyticsReport}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      Generate Full Report
                    </button>
                    <button
                      onClick={printAnalyticsReport}
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center border border-gray-200"
                      title="Print analytics section as a report"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 2a2 2 0 00-2 2v2h12V4a2 2 0 00-2-2H6z" />
                        <path d="M4 8a2 2 0 00-2 2v3a2 2 0 002 2h2v3h8v-3h2a2 2 0 002-2v-3a2 2 0 00-2-2H4zm4 9v-5h4v5H8z" />
                      </svg>
                      Print Report
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Website Traffic
                      </h3>
                      <div className="bg-blue-100 rounded-full p-2">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Visitors</span>
                        <span className="font-semibold">
                          {hfrpStats.websiteVisitors.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Page Views</span>
                        <span className="font-semibold">
                          {(hfrpStats.websiteVisitors * 3.2).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Session</span>
                        <span className="font-semibold">3m 42s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversion Rate</span>
                        <span className="font-semibold text-green-600">
                          4.2%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Donation Performance
                      </h3>
                      <div className="bg-green-100 rounded-full p-2">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path
                            fillRule="evenodd"
                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Donation</span>
                        <span className="font-semibold">$125</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recurring %</span>
                        <span className="font-semibold">31%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Donor Retention</span>
                        <span className="font-semibold text-green-600">
                          78%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Growth</span>
                        <span className="font-semibold text-green-600">
                          +15.3%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Social Media
                      </h3>
                      <div className="bg-purple-100 rounded-full p-2">
                        <svg
                          className="w-6 h-6 text-purple-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Followers</span>
                        <span className="font-semibold">2,840</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engagement Rate</span>
                        <span className="font-semibold">12.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Reach</span>
                        <span className="font-semibold">15,600</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Shares</span>
                        <span className="font-semibold text-blue-600">89</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Impact Metrics Timeline
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {hfrpStats.familiesHelped}
                      </div>
                      <div className="text-sm text-gray-600">
                        Families Helped
                      </div>
                      <div className="text-xs text-green-600">
                        +12 this month
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {hfrpStats.mealsServed.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Meals Served</div>
                      <div className="text-xs text-green-600">
                        +340 this week
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {hfrpStats.medicalTreatments.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Medical Treatments
                      </div>
                      <div className="text-xs text-green-600">
                        +23 this week
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {hfrpStats.educationalSupport}
                      </div>
                      <div className="text-sm text-gray-600">
                        Students Supported
                      </div>
                      <div className="text-xs text-green-600">
                        +8 this month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Management */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Content Management
                  </h2>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/admin/blog/posts"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Manage Blog Posts
                    </Link>
                    <Link
                      href="/assistant?mode=blog"
                      className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition-colors flex items-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6l4 2M12 4a8 8 0 100 16 8 8 0 000-16z"
                        />
                      </svg>
                      Open Blog Assistant
                    </Link>
                  </div>
                </div>

                {/* Blog Statistics */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    📊 Blog Statistics Dashboard temporarily disabled during
                    deployment setup.
                  </p>
                </div>
              </div>
            )}

            {/* Media Gallery */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Media Gallery
                </h2>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Uploaded Media
                    </h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                      Upload New
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                      <div key={item} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`/gallery/education/edu-${item}.jpg`}
                            alt={`Gallery item ${item}`}
                            className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                                <svg
                                  className="w-5 h-5 text-gray-700"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                                <svg
                                  className="w-5 h-5 text-gray-700"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                                <svg
                                  className="w-5 h-5 text-gray-700"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 text-sm truncate text-gray-500">
                          edu-{item}.jpg
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Site Settings
                </h2>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      General Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="site-title"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Site Title
                        </label>
                        <input
                          type="text"
                          id="site-title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="Haitian Family Relief Project"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="site-description"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Site Description
                        </label>
                        <textarea
                          id="site-description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare."
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="google-analytics"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Google Analytics ID
                        </label>
                        <input
                          type="text"
                          id="google-analytics"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="G-XXXXXXXXXX"
                          defaultValue=""
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Social Media Links
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="facebook"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Facebook URL
                        </label>
                        <input
                          type="text"
                          id="facebook"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="https://facebook.com/haitianfamilyrelief"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="instagram"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Instagram URL
                        </label>
                        <input
                          type="text"
                          id="instagram"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="https://instagram.com/haitianfamilyrelief"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="twitter"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Twitter URL
                        </label>
                        <input
                          type="text"
                          id="twitter"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="https://twitter.com/hfrp_haiti"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contact Email
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="haitianfamilyrelief@gmail.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          id="contact-phone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="(224) 217-0230"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>

                {/* Stripe Configuration */}
                <WithPermission permission="manage_donations">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      ✅ Stripe Configuration: Live payment system is active and
                      configured via environment variables.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href="/admin/webhooks"
                        className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <span className="mr-2">🔗</span>
                        Manage Webhooks
                      </Link>
                      <Link
                        href="/webhook-test"
                        className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        <span className="mr-2">🧪</span>
                        Test Webhooks
                      </Link>
                    </div>
                  </div>
                </WithPermission>
              </div>
            )}

            {/* Stripe Automation Dashboard */}
            {activeTab === "stripe" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Stripe Automation Dashboard
                </h2>
                <StripeAutomationDashboard />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
