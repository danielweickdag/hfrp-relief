import { Resend } from "resend";

// Centralized Resend configuration and lazy initialization
interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
  toEmails?: string[];
  ccEmails?: string[];
  isDemoMode: boolean;
}

let resendInstance: Resend | null = null;
let resendConfig: ResendConfig | null = null;

/**
 * Get the default Resend configuration from environment variables
 */
export function getDefaultResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  
  // Check if API key is missing or is a demo/placeholder key
  if (!apiKey || apiKey.startsWith("re_demo_") || apiKey === "your_resend_api_key_here") {
    return null;
  }

  return {
    apiKey,
    fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@familyreliefproject7.org",
    toEmail: process.env.RESEND_TO_EMAIL || "contact@familyreliefproject7.org",
    toEmails: process.env.RESEND_TO_EMAILS?.split(",").map(email => email.trim()) || [],
    ccEmails: process.env.RESEND_CC_EMAILS?.split(",").map(email => email.trim()) || [],
    isDemoMode: false
  };
}

/**
 * Get or create a Resend instance with lazy initialization
 * Returns null if Resend is not properly configured
 */
export function getResendEnhanced(): Resend | null {
  // Return existing instance if available
  if (resendInstance) {
    return resendInstance;
  }

  // Get configuration
  const config = getDefaultResendConfig();
  if (!config) {
    console.warn("⚠️ Resend not configured - API key missing or invalid");
    return null;
  }

  try {
    // Create new instance
    resendInstance = new Resend(config.apiKey);
    resendConfig = config;
    console.log("✅ Resend initialized successfully");
    return resendInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Resend:", error);
    return null;
  }
}

/**
 * Get the current Resend configuration
 */
export function getResendConfig(): ResendConfig | null {
  if (!resendConfig) {
    // Try to initialize if not already done
    getResendEnhanced();
  }
  return resendConfig;
}

/**
 * Check if Resend is properly configured and available
 */
export function isResendConfigured(): boolean {
  return getResendEnhanced() !== null;
}

/**
 * Check if we're in demo mode (no valid API key)
 */
export function isResendDemoMode(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  return !apiKey || apiKey.startsWith("re_demo_") || apiKey === "your_resend_api_key_here";
}

/**
 * Get demo mode configuration for testing/development
 */
export function getDemoModeConfig(): ResendConfig {
  return {
    apiKey: "re_demo_mode",
    fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@familyreliefproject7.org",
    toEmail: process.env.RESEND_TO_EMAIL || "contact@familyreliefproject7.org",
    toEmails: process.env.RESEND_TO_EMAILS?.split(",").map(email => email.trim()) || [],
    ccEmails: process.env.RESEND_CC_EMAILS?.split(",").map(email => email.trim()) || [],
    isDemoMode: true
  };
}

/**
 * Reset the Resend instance (useful for testing)
 */
export function resetResendInstance(): void {
  resendInstance = null;
  resendConfig = null;
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate multiple email addresses
 */
export function validateEmails(emails: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  for (const email of emails) {
    const trimmedEmail = email.trim();
    if (validateEmail(trimmedEmail)) {
      valid.push(trimmedEmail);
    } else {
      invalid.push(trimmedEmail);
    }
  }
  
  return { valid, invalid };
}

/**
 * Enhanced email sending with automatic fallback to demo mode
 */
export interface EnhancedEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  // Accept camelCase in our API; map to Resend's expected snake_case
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEnhancedEmail(options: EnhancedEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  isDemoMode: boolean;
}> {
  const resend = getResendEnhanced();
  const config = getResendConfig();
  
  // Demo mode fallback
  if (!resend || !config) {
    console.warn("📧 Demo mode: Email would be sent to", options.to);
    return {
      success: true,
      messageId: `demo-${Date.now()}`,
      isDemoMode: true
    };
  }

  try {
    // Prepare email data
    const htmlContent =
      options.html ??
      (options.text ? String(options.text) : undefined) ??
      (options.subject ? `<p>${options.subject}</p>` : "<p></p>");

    const emailData = {
      from: options.from || config.fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: htmlContent,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      // Resend expects camelCase 'replyTo'
      replyTo: options.replyTo,
      tags: options.tags
    };

    // Validate email addresses
    const { valid: validTo, invalid: invalidTo } = validateEmails(emailData.to);
    if (invalidTo.length > 0) {
      console.warn("⚠️ Invalid email addresses:", invalidTo);
    }
    if (validTo.length === 0) {
      throw new Error("No valid recipient email addresses");
    }

    // Send email
    const result = await resend.emails.send({
      ...emailData,
      to: validTo
    });

    return {
      success: true,
      messageId: result.data?.id,
      isDemoMode: false
    };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      isDemoMode: false
    };
  }
}

// Export the Resend instance getter as default for backward compatibility
export default getResendEnhanced;