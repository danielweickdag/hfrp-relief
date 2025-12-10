import { type NextRequest, NextResponse } from "next/server";
import {
  getResendEnhanced,
  getResendConfig,
  isResendDemoMode,
  sendEnhancedEmail,
} from "@/lib/resendEnhanced";
import fs from "fs";
import path from "path";

type AutomationAction =
  | "run"
  | "process_scheduled"
  | "process_thank_you"
  | "process_queue";

interface DonationRecord {
  id: string;
  amount: number;
  currency: string;
  donor_email?: string;
  donor_name?: string;
  campaign?: string;
  date?: string;
  status?: string;
  payment_method?: string;
  synced_at?: string;
  source?: string;
  syncedAt?: string;
  thank_you_sent?: boolean;
  thank_you_sent_at?: string;
}

interface QueueItemTemplate {
  subject: string;
  greeting?: string;
  body: string;
  cta?: string;
  link?: string;
  footer?: string;
}

interface QueueItem {
  campaign?: string;
  type?: string;
  priority?: string;
  template: QueueItemTemplate;
  scheduled_for?: string;
  status?: string;
  sent_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}) as unknown);
    let action: AutomationAction = "run";
    if (typeof raw === "object" && raw && "action" in raw) {
      const val = (raw as { action?: unknown }).action;
      if (typeof val === "string") {
        const normalized = val as AutomationAction;
        action = normalized;
      }
    }

    const origin = new URL(request.url).origin;
    const summary: Record<string, unknown> = {};

    if (action === "run" || action === "process_scheduled") {
      summary.scheduled = await processScheduled(origin);
    }
    if (action === "run" || action === "process_thank_you") {
      summary.thankYou = await processDonationThankYous();
    }
    if (action === "run" || action === "process_queue") {
      summary.queue = await processEmailQueue();
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Email automation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  // Convenience: trigger full run via GET (cron-friendly)
  return POST(request);
}

async function processScheduled(origin: string) {
  try {
    const res = await fetch(`${origin}/api/email/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process_scheduled" }),
    });
    const data = await res.json().catch(() => ({}));
    return { processed: data.processed ?? 0, remaining: data.remaining ?? 0 };
  } catch (error) {
    console.warn("processScheduled failed:", error);
    return { processed: 0, remaining: null, error: String(error) };
  }
}

async function processDonationThankYous() {
  const donationsPath = path.join(process.cwd(), "data", "donations.json");
  if (!fs.existsSync(donationsPath)) {
    return {
      processed: 0,
      updated: 0,
      skipped: 0,
      message: "No donations.json",
    };
  }

  let donations: DonationRecord[] = [];
  try {
    donations = JSON.parse(fs.readFileSync(donationsPath, "utf8"));
  } catch (error) {
    console.error("Failed to read donations.json:", error);
    return { processed: 0, error: "read_failed" };
  }

  const demoMode = isResendDemoMode();
  const config = getResendConfig();
  const fromEmail = config?.fromEmail || "noreply@familyreliefproject7.org";

  let processed = 0;
  let updated = 0;
  let skipped = 0;

  for (const donation of donations) {
    // Skip if already thanked or missing recipient
    if (donation.thank_you_sent || !donation.donor_email) {
      skipped += 1;
      continue;
    }

    const subject = `Thank You for Your Donation${donation.campaign ? ` to ${donation.campaign}` : ""}!`;
    const greeting = `Dear ${donation.donor_name || "Supporter"},`;
    const amountStr =
      typeof donation.amount === "number"
        ? donation.amount.toFixed(2)
        : String(donation.amount ?? "");
    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        <h1 style="color:#059669;">Thank You!</h1>
        <p>${greeting}</p>
        <p>We are incredibly grateful for your generous donation of ${donation.currency || "USD"} $${amountStr}. Your support directly impacts families in Haiti.</p>
        ${donation.campaign ? `<p>Your donation supports our <strong>${donation.campaign}</strong> efforts.</p>` : ""}
        <p>With heartfelt gratitude,<br/>The HFRP Team</p>
      </div>
    `;
    const text = `Thank you for your generous donation of ${donation.currency || "USD"} $${amountStr}. Your support makes a real difference.\n\n— The HFRP Team`;

    if (demoMode) {
      // simulate
      donation.thank_you_sent = true;
      donation.thank_you_sent_at = new Date().toISOString();
      updated += 1;
    } else {
      const result = await sendEnhancedEmail({
        from: fromEmail,
        to: donation.donor_email,
        subject,
        html,
        text,
        tags: [
          { name: "source", value: "donation_thank_you" },
          { name: "donation_id", value: donation.id },
        ],
      });

      if (result.success) {
        donation.thank_you_sent = true;
        donation.thank_you_sent_at = new Date().toISOString();
        updated += 1;
      } else {
        console.error(
          `Failed to send thank you for ${donation.id}:`,
          result.error,
        );
      }
    }

    processed += 1;
  }

  // Persist updates
  try {
    fs.writeFileSync(donationsPath, JSON.stringify(donations, null, 2));
  } catch (error) {
    console.error("Failed to write donations.json:", error);
  }

  return { processed, updated, skipped, demoMode };
}

async function processEmailQueue() {
  const queuePath = path.join(process.cwd(), "data", "email_queue.json");
  if (!fs.existsSync(queuePath)) {
    return {
      processed: 0,
      updated: 0,
      skipped: 0,
      message: "No email_queue.json",
    };
  }

  let queue: QueueItem[] = [];
  try {
    queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
  } catch (error) {
    console.error("Failed to read email_queue.json:", error);
    return { processed: 0, error: "read_failed" };
  }

  const donationsPath = path.join(process.cwd(), "data", "donations.json");
  let donations: DonationRecord[] = [];
  if (fs.existsSync(donationsPath)) {
    try {
      donations = JSON.parse(fs.readFileSync(donationsPath, "utf8"));
    } catch {}
  }

  const demoMode = isResendDemoMode();
  const config = getResendConfig();
  const fromEmail = config?.fromEmail || "noreply@familyreliefproject7.org";
  const now = Date.now();

  let processed = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of queue) {
    const scheduledTime = item.scheduled_for
      ? Date.parse(item.scheduled_for)
      : now;
    if (item.status === "sent") {
      skipped += 1;
      continue;
    }
    if (!Number.isFinite(scheduledTime) || scheduledTime > now) {
      skipped += 1;
      continue;
    }

    // Target recipients: donors for matching campaign, fallback none
    const recipients = donations
      .filter((d) => (item.campaign ? d.campaign === item.campaign : true))
      .map((d) => d.donor_email)
      .filter((e): e is string => typeof e === "string" && e.length > 3);

    if (recipients.length === 0) {
      skipped += 1;
      continue;
    }

    const subject = item.template.subject;
    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
        ${item.template.greeting ? `<p>${item.template.greeting}</p>` : ""}
        <div>${item.template.body.replace(/\n/g, "<br/>")}</div>
        ${item.template.cta && item.template.link ? `<p><a href="${item.template.link}" style="color:#2563eb;">${item.template.cta}</a></p>` : ""}
        ${item.template.footer ? `<p style="color:#666;font-size:12px;">${item.template.footer}</p>` : ""}
      </div>
    `;
    const text = `${item.template.greeting ? item.template.greeting + "\n\n" : ""}${item.template.body}\n\n${item.template.cta && item.template.link ? `${item.template.cta}: ${item.template.link}` : ""}`;

    if (demoMode) {
      // simulate
      item.status = "sent";
      item.sent_at = new Date().toISOString();
      updated += 1;
    } else {
      const result = await sendEnhancedEmail({
        from: fromEmail,
        to: recipients,
        subject,
        html,
        text,
        tags: [
          { name: "source", value: "email_queue" },
          { name: "campaign", value: item.campaign || "" },
        ],
      });

      if (result.success) {
        item.status = "sent";
        item.sent_at = new Date().toISOString();
        updated += 1;
      } else {
        console.error("Failed to send queue item:", result.error);
      }
    }

    processed += 1;
  }

  // Persist queue updates
  try {
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  } catch (error) {
    console.error("Failed to write email_queue.json:", error);
  }

  return { processed, updated, skipped, demoMode };
}
