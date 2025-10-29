import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

// Send confirmation email to the user
async function sendConfirmationEmail(resend: Resend, userEmail: string, userName: string, subject: string) {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@familyreliefproject7.org";
    
    const confirmationHTML = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You for Contacting Us!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0;">Haitian Family Relief Project</p>
        </div>

        <div style="padding: 30px; background: white;">
          <h2 style="color: #667eea;">Dear ${userName},</h2>
          
          <p>Thank you for reaching out to the Haitian Family Relief Project. We have received your message regarding "<strong>${subject}</strong>" and appreciate you taking the time to contact us.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Our team will review your message within 24-48 hours</li>
              <li>We'll respond directly to this email address: <strong>${userEmail}</strong></li>
              <li>For urgent matters, you can also call us at (224) 217-0230</li>
            </ul>
          </div>

          <p>Your support and interest in our mission to provide relief and assistance to Haitian families means the world to us. Together, we can make a lasting difference in the lives of those who need it most.</p>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">Stay Connected</h4>
            <p style="margin-bottom: 0;">Follow our impact and get updates on our relief efforts:</p>
            <p style="margin: 10px 0;">
              <a href="https://facebook.com/familyreliefproject" style="color: #1976d2; text-decoration: none;">📘 Facebook</a> | 
              <a href="https://instagram.com/familyreliefproject" style="color: #1976d2; text-decoration: none;">📸 Instagram</a> | 
              <a href="https://familyreliefproject7.org" style="color: #1976d2; text-decoration: none;">🌐 Website</a>
            </p>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Haitian Family Relief Project<br>
            Email: haitianfamilyrelief@gmail.com | Phone: (224) 217-0230<br>
            <em>Bringing hope and relief to families in need</em>
          </p>
        </div>
      </div>
    `;

    const confirmationText = `
Dear ${userName},

Thank you for contacting the Haitian Family Relief Project!

We have received your message regarding "${subject}" and appreciate you reaching out to us.

What happens next?
- Our team will review your message within 24-48 hours
- We'll respond directly to this email address: ${userEmail}
- For urgent matters, you can also call us at (224) 217-0230

Your support and interest in our mission means the world to us. Together, we can make a lasting difference in the lives of those who need it most.

Stay connected with our impact:
- Website: https://familyreliefproject7.org
- Facebook: https://facebook.com/familyreliefproject
- Instagram: https://instagram.com/familyreliefproject

Best regards,
Haitian Family Relief Project Team

---
Email: haitianfamilyrelief@gmail.com
Phone: (224) 217-0230
Bringing hope and relief to families in need
    `;

    const confirmationData = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Thank you for contacting HFRP - We received your message`,
      html: confirmationHTML,
      text: confirmationText,
      tags: [
        { name: "type", value: "confirmation_email" },
        { name: "source", value: "contact_form" },
      ],
    });

    console.log("✅ Confirmation email sent to user:", confirmationData.data?.id || "sent");
    return confirmationData.data?.id || null;
  } catch (error) {
    console.error("⚠️ Failed to send confirmation email:", error);
    return null;
  }
}

// Optional Slack notifications for admin alerting
async function notifySlack(record: ContactRecord, delivery: "demo" | "emailed") {
  try {
    const webhook = process.env.SLACK_WEBHOOK_URL || process.env.CONTACT_SLACK_WEBHOOK_URL;
    if (!webhook) return;

    const text =
      delivery === "emailed"
        ? `📩 New contact submission emailed: ${record.subject} — ${record.name} <${record.email}>`
        : `📝 New contact submission received (demo mode): ${record.subject} — ${record.name} <${record.email}>`;

    const blocks = [
      {
        type: "section",
        text: { type: "mrkdwn", text },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Inquiry:* ${record.inquiryType}` },
          { type: "mrkdwn", text: `*Newsletter:* ${record.newsletter ? "yes" : "no"}` },
          { type: "mrkdwn", text: `*IP:* ${record.ip}` },
          { type: "mrkdwn", text: `*Time:* ${new Date(record.timestamp).toLocaleString()}` },
        ],
      },
    ];

    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    });
  } catch (err) {
    console.warn("⚠️ Slack notification failed:", err);
  }
}

// Rate limiting (simple in-memory store for development)
const rateLimit: Map<string, { count: number; resetTime: number }> = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // 5 requests per window

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  const current = rateLimit.get(ip)!;
  if (now > current.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count++;
  return false;
}

// Persistent logging of contact submissions for admin reliability
const DATA_DIR = path.join(process.cwd(), "data");
const CONTACT_LOG_FILE = path.join(DATA_DIR, "contact-requests.json");

interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
  newsletter: boolean;
  ip: string;
  timestamp: string;
  status: "received" | "emailed";
  emailId?: string | null;
  confirmationEmailId?: string | null;
  recipients?: string[];
  cc?: string[];
  // Admin automation fields (optional)
  handled?: boolean;
  handledAt?: string;
  assignedTo?: string;
  adminNotes?: string;
}

function appendContactLog(record: ContactRecord) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let existing: ContactRecord[] = [];
    if (fs.existsSync(CONTACT_LOG_FILE)) {
      const content = fs.readFileSync(CONTACT_LOG_FILE, "utf-8");
      existing = content ? (JSON.parse(content) as ContactRecord[]) : [];
    }

    existing.push(record);
    fs.writeFileSync(CONTACT_LOG_FILE, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("⚠️ Failed to persist contact request:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Prepare body early so we can persist even in demo mode
    const body = await request.json();
    const { name, email, phone, subject, message, inquiryType, newsletter } =
      body;

    const baseRecord: ContactRecord = {
      id: `contact-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      inquiryType,
      newsletter,
      ip,
      timestamp: new Date().toISOString(),
      status: "received",
    };

    // Initialize Resend inside the function to avoid build-time errors
    if (
      !process.env.RESEND_API_KEY ||
      process.env.RESEND_API_KEY.startsWith("re_demo_")
    ) {
      console.warn(
        "⚠️ RESEND_API_KEY not configured or using demo key, email will not be sent"
      );
      // Persist contact submission for admin visibility in demo mode
      appendContactLog(baseRecord);
      // Optional Slack alert in demo mode
      await notifySlack(baseRecord, "demo");
      // For development without email service, return success
      return NextResponse.json({
        success: true,
        message: "Message received (email service not configured - demo mode)",
        id: "demo-" + Date.now(),
        isDemoMode: true,
        persisted: true,
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["name", "email", "subject", "message"],
        },
        { status: 400 }
      );
    }

    // Enhanced validation
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "Content too long. Please shorten your message." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Basic spam detection
    const spamKeywords = [
      "viagra",
      "casino",
      "lottery",
      "winner",
      "congratulations",
    ];
    const contentToCheck = (name + " " + subject + " " + message).toLowerCase();
    if (spamKeywords.some((keyword) => contentToCheck.includes(keyword))) {
      return NextResponse.json(
        { error: "Message appears to be spam" },
        { status: 400 }
      );
    }

    // Prepare email content
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "noreply@familyreliefproject7.org";
  const toEmail =
    process.env.RESEND_TO_EMAIL || "contact@familyreliefproject7.org";
    const toEmails = (process.env.RESEND_TO_EMAILS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const ccEmails = (process.env.RESEND_CC_EMAILS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const recipients = toEmails.length > 0 ? toEmails : [toEmail];

    const inquiryTypeLabels = {
      general: "General Inquiry",
      volunteer: "Volunteer Opportunities",
      donate: "Donation Questions",
      media: "Media & Press",
    };

    const emailHTML = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0;">Haitian Family Relief Project</p>
        </div>

        <div style="padding: 30px; background: white;">
          <h2 style="color: #667eea; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Contact Details</h2>

          <div style="margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 12px 0;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Email:</td>
                <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #667eea;">${email}</a></td>
              </tr>
              ${
                phone
                  ? `
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 12px 0;">${phone}</td>
              </tr>
              `
                  : ""
              }
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Inquiry Type:</td>
                <td style="padding: 12px 0;">${inquiryTypeLabels[inquiryType as keyof typeof inquiryTypeLabels] || inquiryType}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; font-weight: bold;">Newsletter:</td>
                <td style="padding: 12px 0;">${newsletter ? "Yes, wants to receive updates" : "No"}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #667eea; margin-top: 30px;">Subject</h3>
          <p style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 10px 0;">${subject}</p>

          <h3 style="color: #667eea; margin-top: 30px;">Message</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This message was sent via the HFRP website contact form<br>
            <strong>Reply directly to this email to respond to ${name}</strong>
          </p>
        </div>
      </div>
    `;

    const emailText = `
New Contact Form Submission - Haitian Family Relief Project

Contact Details:
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
Inquiry Type: ${inquiryTypeLabels[inquiryType as keyof typeof inquiryTypeLabels] || inquiryType}
Newsletter Signup: ${newsletter ? "Yes" : "No"}

Subject: ${subject}

Message:
${message}

---
This message was sent via the HFRP website contact form.
Reply directly to this email to respond to ${name}.
    `;

    // Send email using Resend
    const emailData = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      replyTo: email, // Allow direct reply to the sender
      subject: `HFRP Contact Form: ${subject}`,
      html: emailHTML,
      text: emailText,
      tags: [
        { name: "source", value: "website_contact_form" },
        { name: "inquiry_type", value: inquiryType },
        { name: "newsletter_signup", value: newsletter ? "yes" : "no" },
      ],
    });

    console.log(
      "✅ Contact form email sent successfully:",
      emailData.data?.id || "sent"
    );

    // Send confirmation email to the user
    const confirmationEmailId = await sendConfirmationEmail(resend, email, name, subject);

    // Persist successful submission
    appendContactLog({
      ...baseRecord,
      status: "emailed",
      emailId: emailData.data?.id || null,
      confirmationEmailId,
      recipients,
      cc: ccEmails,
    });

    // Optional Slack alert after email
    await notifySlack({
      ...baseRecord,
      status: "emailed",
      emailId: emailData.data?.id || null,
      recipients,
      cc: ccEmails,
    }, "emailed");

    // Track analytics
    console.log("📊 Contact form submission:", {
      inquiryType,
      newsletter,
      hasPhone: !!phone,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      id: emailData.data?.id || "sent",
      persisted: true,
    });
  } catch (error) {
    console.error("❌ Contact form error:", error);

    // Determine error type and provide appropriate response
    let errorMessage =
      "Failed to send message. Please try again or contact us directly.";
    let statusCode = 500;

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("Invalid API key")) {
        errorMessage = "Email service configuration error";
        statusCode = 503;
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Too many requests. Please try again later.";
        statusCode = 429;
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 504;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
