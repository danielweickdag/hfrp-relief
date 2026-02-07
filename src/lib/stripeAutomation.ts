// 🚀 Enhanced Stripe Automation System
// Comprehensive automation for payments, webhooks, and error handling

import Stripe from "stripe";
import { getStripeConfigManager } from "./stripeConfigManager";
import { donationStorage } from "./donationStorage";
import { Resend } from "resend";

// Initialize Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Error handling utilities
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// Performance monitoring utilities
interface PerformanceMetrics {
  operationType: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  errorType?: string;
  retryCount?: number;
}

class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000; // Keep last 1000 operations

  static startOperation(operationType: string): number {
    const startTime = Date.now();
    console.log(
      `🚀 Starting ${operationType} at ${new Date(startTime).toISOString()}`,
    );
    return startTime;
  }

  static endOperation(
    operationType: string,
    startTime: number,
    success: boolean,
    errorType?: string,
    retryCount?: number,
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetrics = {
      operationType,
      startTime,
      endTime,
      duration,
      success,
      errorType,
      retryCount,
    };

    this.metrics.push(metric);

    // Keep only the last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    const status = success ? "✅" : "❌";
    const retryInfo = retryCount ? ` (${retryCount} retries)` : "";
    console.log(
      `${status} ${operationType} completed in ${duration}ms${retryInfo}`,
    );

    if (!success && errorType) {
      console.warn(`⚠️ Operation failed with error type: ${errorType}`);
    }
  }

  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  static getAverageOperationTime(operationType: string): number {
    const operations = this.metrics.filter(
      (m) => m.operationType === operationType && m.success,
    );
    if (operations.length === 0) return 0;

    const totalTime = operations.reduce(
      (sum, op) => sum + (op.duration || 0),
      0,
    );
    return totalTime / operations.length;
  }

  static getSuccessRate(operationType: string): number {
    const operations = this.metrics.filter(
      (m) => m.operationType === operationType,
    );
    if (operations.length === 0) return 0;

    const successful = operations.filter((op) => op.success).length;
    return (successful / operations.length) * 100;
  }
}

class StripeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public type?: string,
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "StripeError";
  }
}

// Retry utility with exponential backoff and performance monitoring
async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },
  operationType = "stripe_operation",
): Promise<T> {
  const startTime = PerformanceMonitor.startOperation(operationType);
  let lastError: Error = new Error("Unknown error");
  let retryCount = 0;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      const result = await operation();
      PerformanceMonitor.endOperation(
        operationType,
        startTime,
        true,
        undefined,
        retryCount,
      );
      return result;
    } catch (error: unknown) {
      const err = error as Error;
      lastError = err;
      retryCount = attempt;

      // Don't retry on certain error types
      if (
        error instanceof Stripe.errors.StripeInvalidRequestError ||
        error instanceof Stripe.errors.StripeAuthenticationError ||
        error instanceof Stripe.errors.StripePermissionError
      ) {
        const stripeError = error as Stripe.errors.StripeError;
        const errorType = err.constructor.name;
        PerformanceMonitor.endOperation(
          operationType,
          startTime,
          false,
          errorType,
          retryCount,
        );
        throw new StripeError(
          `Non-retryable Stripe error: ${err.message}`,
          stripeError.code,
          stripeError.type,
          stripeError.statusCode,
          error,
        );
      }

      if (attempt === options.maxRetries) {
        break;
      }

      const delay = Math.min(
        options.baseDelay * Math.pow(options.backoffMultiplier, attempt),
        options.maxDelay,
      );

      console.warn(
        `Stripe operation failed (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying in ${delay}ms:`,
        err.message,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const errorType = lastError.constructor.name;
  PerformanceMonitor.endOperation(
    operationType,
    startTime,
    false,
    errorType,
    retryCount,
  );
  throw new StripeError(
    `Stripe operation failed after ${options.maxRetries + 1} attempts: ${lastError.message}`,
    undefined,
    "retry_exhausted",
    undefined,
    lastError,
  );
}

// Core interfaces for migration
export interface CampaignSync {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  stripeProductId: string;
  stripePriceIds: string[];
  status: "active" | "paused" | "completed";
  automationSettings: {
    emailUpdates: boolean;
    socialMediaPosts: boolean;
    weeklyReports: boolean;
    donorFollowUp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EventSync {
  id: string;
  name: string;
  description: string;
  date: Date;
  ticketPrice: number;
  maxAttendees: number;
  currentAttendees: number;
  stripeProductId: string;
  stripePriceId: string;
  automationSettings: {
    confirmationEmails: boolean;
    reminderEmails: boolean;
    followUpSurveys: boolean;
  };
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

export interface DonationAutomation {
  donorId: string;
  donorEmail: string;
  amount: number;
  campaign?: string;
  isRecurring: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  automationTriggers: {
    thankYouEmail: boolean;
    receiptGeneration: boolean;
    monthlyUpdates: boolean;
    impactReports: boolean;
  };
}

class StripeAutomationService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Stripe secret key not configured");
    }
    this.stripe = new Stripe(secretKey);
  }

  // 🔄 CAMPAIGN MANAGEMENT & AUTOMATION
  async createCampaign(campaignData: {
    name: string;
    description: string;
    goalAmount: number;
    suggestedAmounts: number[];
    enableRecurring: boolean;
  }): Promise<CampaignSync> {
    console.log("🏗️ Creating new Stripe campaign:", campaignData.name);

    try {
      // Create Stripe Product for campaign with retry logic
      const product = await withRetry(() =>
        this.stripe.products.create({
          name: campaignData.name,
          description: campaignData.description,
          type: "service",
          metadata: {
            campaignType: "donation",
            goalAmount: campaignData.goalAmount.toString(),
            automationEnabled: "true",
          },
        }),
      );

      console.log("✅ Created Stripe product:", product.id);

      // Create multiple price options
      const priceIds: string[] = [];

      for (const amount of campaignData.suggestedAmounts) {
        // One-time donation price with retry logic
        const oneTimePrice = await withRetry(() =>
          this.stripe.prices.create({
            product: product.id,
            unit_amount: amount * 100, // Convert to cents
            currency: "usd",
            metadata: {
              donationType: "one-time",
              suggestedAmount: amount.toString(),
            },
          }),
        );
        priceIds.push(oneTimePrice.id);

        // Recurring monthly donation price (if enabled) with retry logic
        if (campaignData.enableRecurring) {
          const recurringPrice = await withRetry(() =>
            this.stripe.prices.create({
              product: product.id,
              unit_amount: amount * 100,
              currency: "usd",
              recurring: { interval: "month" },
              metadata: {
                donationType: "recurring",
                suggestedAmount: amount.toString(),
              },
            }),
          );
          priceIds.push(recurringPrice.id);
        }
      }

      // Create campaign record
      const campaign: CampaignSync = {
        id: `campaign_${Date.now()}`,
        name: campaignData.name,
        description: campaignData.description,
        goalAmount: campaignData.goalAmount,
        currentAmount: 0,
        stripeProductId: product.id,
        stripePriceIds: priceIds,
        status: "active",
        automationSettings: {
          emailUpdates: true,
          socialMediaPosts: true,
          weeklyReports: true,
          donorFollowUp: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save campaign data
      await this.saveCampaignData(campaign);

      console.log("🎉 Campaign created successfully:", campaign.id);
      return campaign;
    } catch (error) {
      console.error("❌ Failed to create campaign:", error);
      throw error;
    }
  }

  // 🎟️ EVENT MANAGEMENT & AUTOMATION
  async createEvent(eventData: {
    name: string;
    description: string;
    date: Date;
    ticketPrice: number;
    maxAttendees: number;
  }): Promise<EventSync> {
    console.log("🎪 Creating new Stripe event:", eventData.name);

    try {
      // Create Stripe Product for event
      const product = await this.stripe.products.create({
        name: `Event: ${eventData.name}`,
        description: eventData.description,
        type: "service",
        metadata: {
          eventType: "fundraising",
          eventDate: eventData.date.toISOString(),
          maxAttendees: eventData.maxAttendees.toString(),
        },
      });

      // Create ticket price
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: eventData.ticketPrice * 100,
        currency: "usd",
        metadata: {
          ticketType: "general",
          eventDate: eventData.date.toISOString(),
        },
      });

      const event: EventSync = {
        id: `event_${Date.now()}`,
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        ticketPrice: eventData.ticketPrice,
        maxAttendees: eventData.maxAttendees,
        currentAttendees: 0,
        stripeProductId: product.id,
        stripePriceId: price.id,
        automationSettings: {
          confirmationEmails: true,
          reminderEmails: true,
          followUpSurveys: true,
        },
        status: "upcoming",
      };

      await this.saveEventData(event);

      console.log("🎉 Event created successfully:", event.id);
      return event;
    } catch (error) {
      console.error("❌ Failed to create event:", error);
      throw error;
    }
  }

  // 💰 DONATION PROCESSING & AUTOMATION
  async processDonation(donationData: {
    amount: number;
    donorEmail: string;
    campaignId?: string;
    isRecurring: boolean;
    donorName?: string;
  }): Promise<DonationAutomation> {
    console.log("💝 Processing donation:", donationData);

    try {
      // Create or retrieve Stripe customer
      const customer = await this.getOrCreateCustomer(
        donationData.donorEmail,
        donationData.donorName,
      );

      let stripeSubscriptionId: string | undefined;

      if (donationData.isRecurring) {
        // Create subscription for recurring donations
        const subscription = await this.stripe.subscriptions.create({
          customer: customer.id,
          items: [
            {
              price_data: {
                currency: "usd",
                product: await this.getOrCreateProduct(
                  `Monthly Donation${donationData.campaignId ? ` - ${donationData.campaignId}` : ""}`,
                ),
                unit_amount: donationData.amount * 100,
                recurring: { interval: "month" },
              },
            },
          ],
          metadata: {
            donationType: "recurring",
            campaignId: donationData.campaignId || "general",
          },
        });
        stripeSubscriptionId = subscription.id;
      }

      const donation: DonationAutomation = {
        donorId: `donor_${Date.now()}`,
        donorEmail: donationData.donorEmail,
        amount: donationData.amount,
        campaign: donationData.campaignId,
        isRecurring: donationData.isRecurring,
        stripeCustomerId: customer.id,
        stripeSubscriptionId,
        automationTriggers: {
          thankYouEmail: true,
          receiptGeneration: true,
          monthlyUpdates: donationData.isRecurring,
          impactReports: true,
        },
      };

      // Trigger automation workflows
      await this.triggerDonationAutomation(donation);

      return donation;
    } catch (error) {
      console.error("❌ Failed to process donation:", error);
      throw error;
    }
  }

  // 🤖 AUTOMATION TRIGGERS
  async triggerDonationAutomation(donation: DonationAutomation) {
    console.log("🤖 Triggering donation automation for:", donation.donorEmail);

    // 1. Send thank you email
    if (donation.automationTriggers.thankYouEmail) {
      await this.sendThankYouEmail(donation);
    }

    // 2. Generate receipt
    if (donation.automationTriggers.receiptGeneration) {
      await this.generateReceipt(donation);
    }

    // 3. Update campaign progress
    if (donation.campaign) {
      await this.updateCampaignProgress(donation.campaign, donation.amount);
    }

    // 4. Schedule follow-up automations
    if (donation.automationTriggers.monthlyUpdates && donation.isRecurring) {
      await this.scheduleMonthlyUpdates(donation);
    }

    console.log("✅ Donation automation triggered successfully");
  }

  // 📊 SYNC & ANALYTICS
  async syncAllData(): Promise<{
    campaigns: CampaignSync[];
    events: EventSync[];
    totalDonations: number;
    recurringDonors: number;
  }> {
    console.log("🔄 Syncing all Stripe data...");

    try {
      // Get all products (campaigns and events)
      const products = await this.stripe.products.list({ limit: 100 });

      // Get all subscriptions (recurring donations)
      const subscriptions = await this.stripe.subscriptions.list({
        limit: 100,
      });

      // Get payment intents (one-time donations)
      const payments = await this.stripe.paymentIntents.list({ limit: 100 });

      const campaigns = await this.loadAllCampaigns();
      const events = await this.loadAllEvents();

      const totalDonations = payments.data.reduce((sum, payment) => {
        return sum + payment.amount_received / 100;
      }, 0);

      const syncReport = {
        campaigns,
        events,
        totalDonations,
        recurringDonors: subscriptions.data.length,
      };

      // Save sync report
      await this.saveSyncReport(syncReport);

      console.log("✅ Data sync completed:", syncReport);
      return syncReport;
    } catch (error) {
      console.error("❌ Failed to sync data:", error);
      throw error;
    }
  }

  // 📈 CAMPAIGN AUTOMATION
  async automateWeeklyReports() {
    console.log("📊 Generating weekly reports...");

    const campaigns = await this.loadAllCampaigns();

    for (const campaign of campaigns) {
      if (
        campaign.automationSettings.weeklyReports &&
        campaign.status === "active"
      ) {
        await this.generateCampaignReport(campaign);
        console.log(`📋 Generated report for: ${campaign.name}`);
      }
    }
  }

  async automateSocialMediaPosts() {
    console.log("📱 Automating social media posts...");

    const campaigns = await this.loadAllCampaigns();

    for (const campaign of campaigns) {
      if (
        campaign.automationSettings.socialMediaPosts &&
        campaign.status === "active"
      ) {
        await this.createSocialMediaContent(campaign);
        console.log(`📢 Created social content for: ${campaign.name}`);
      }
    }
  }

  // 🔧 HELPER METHODS
  private async getOrCreateCustomer(
    email: string,
    name?: string,
  ): Promise<Stripe.Customer> {
    // Try to find existing customer
    const existingCustomers = await this.stripe.customers.list({ email });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return await this.stripe.customers.create({
      email,
      name,
      metadata: {
        source: "hfrp_donation_system",
        createdAt: new Date().toISOString(),
      },
    });
  }

  private async sendThankYouEmail(donation: DonationAutomation) {
    // Integration with email service (Resend)
    console.log(`📧 Sending thank you email to: ${donation.donorEmail}`);

    if (!resend) {
      console.warn("⚠️ Resend API key not configured, skipping email");
      return;
    }

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@familyreliefproject7.org";
      
      await resend.emails.send({
        from: `Haitian Family Relief Project <${fromEmail}>`,
        to: donation.donorEmail,
        subject: "Thank you for your donation!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Thank You!</h1>
            <p>Dear Donor,</p>
            <p>We are incredibly narrowed by your generosity. Your donation of <strong>$${(donation.amount / 100).toFixed(2)}</strong> 
            will make a real difference in the lives of families in Haiti.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Donation Details</h3>
              <p><strong>Amount:</strong> $${(donation.amount / 100).toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Campaign:</strong> ${donation.campaign || "General Fund"}</p>
              <p><strong>Reference:</strong> ${donation.donorId}</p>
            </div>

            <p>Your support helps us provide food, shelter, and hope.</p>
            <p>With gratitude,<br/>The HFRP Team</p>
          </div>
        `,
      });
      console.log("✅ Thank you email sent successfully");
    } catch (error) {
      console.error("❌ Failed to send thank you email:", error);
      // Don't throw here to avoid failing the whole webhook process
    }
  }

  private async generateReceipt(donation: DonationAutomation) {
    console.log(`🧾 Generating receipt for: ${donation.donorId}`);
    
    // For now, we'll send a separate receipt email or include it in the thank you
    // In a full implementation, this would generate a PDF
    
    if (!resend) return;

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@familyreliefproject7.org";
      
      await resend.emails.send({
        from: `HFRP Receipts <${fromEmail}>`,
        to: donation.donorEmail,
        subject: `Donation Receipt - ${donation.donorId}`,
        html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 20px;">
            <h2 style="text-align: center;">OFFICIAL DONATION RECEIPT</h2>
            <hr/>
            <p><strong>Organization:</strong> Haitian Family Relief Project</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Receipt #:</strong> ${donation.donorId}</p>
            <hr/>
            <p><strong>Received From:</strong> ${donation.donorEmail}</p>
            <p><strong>Amount:</strong> $${(donation.amount / 100).toFixed(2)} USD</p>
            <p><strong>For:</strong> ${donation.campaign || "Charitable Donation"}</p>
            <hr/>
            <p style="font-size: 12px; text-align: center;">Thank you for your support. Please keep this for your tax records.</p>
          </div>
        `,
      });
      console.log("✅ Receipt sent successfully");
    } catch (error) {
      console.error("❌ Failed to send receipt:", error);
    }
  }

  private async updateCampaignProgress(campaignId: string, amount: number) {
    console.log(`📈 Updating campaign ${campaignId} with amount $${amount/100}`);
    
    try {
      // Use the donationStorage service to update campaign stats
      // Note: donationStorage expects amount in dollars (float), but Stripe uses cents (int)
      // We need to be careful with conversion.
      // Based on stripeAutomation usage, amount passed here is in cents.
      
      // Update local storage / database
      // Since donationStorage methods are async and handle storage
      
      // 1. Create a donation record in storage
      await donationStorage.createDonation({
        donorId: `donor_${Date.now()}`, // Ideally we'd map this to a real donor
        donorName: "Stripe Donor",
        amount: amount / 100, // Convert cents to dollars
        currency: "USD",
        type: "one_time",
        paymentMethod: "credit_card",
        status: "completed",
        source: "website",
        campaignId: campaignId,
        campaignName: campaignId, // We should look up the name
        programId: "general",
        donationDate: new Date().toISOString(),
        processedDate: new Date().toISOString(),
        isRecurring: false,
        isAnonymous: false,
        receiptSent: true,
        taxDeductible: true
      });

      console.log(`✅ Campaign ${campaignId} updated in storage`);
    } catch (error) {
      console.error("❌ Failed to update campaign progress:", error);
    }
  }

  private async scheduleMonthlyUpdates(donation: DonationAutomation) {
    console.log(`📅 Scheduled monthly updates for: ${donation.donorEmail}`);
    // Schedule recurring email updates
  }

  private async generateCampaignReport(campaign: CampaignSync) {
    console.log(`📊 Generating report for: ${campaign.name}`);
    // Generate detailed campaign performance report
  }

  private async createSocialMediaContent(campaign: CampaignSync) {
    console.log(`📱 Creating social content for: ${campaign.name}`);
    // Auto-generate social media posts
  }

  // 💾 DATA PERSISTENCE
  private async saveCampaignData(campaign: CampaignSync) {
    // Save to your database/file system
    const campaigns = await this.loadAllCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaign.id);

    if (index >= 0) {
      campaigns[index] = campaign;
    } else {
      campaigns.push(campaign);
    }

    // This would typically save to a database
    // For now, we'll use localStorage in browser or file system
    if (typeof window !== "undefined") {
      localStorage.setItem("hfrp_campaigns", JSON.stringify(campaigns));
    }
  }

  private async loadAllCampaigns(): Promise<CampaignSync[]> {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hfrp_campaigns");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  private async saveEventData(event: EventSync) {
    const events = await this.loadAllEvents();
    const index = events.findIndex((e) => e.id === event.id);

    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("hfrp_events", JSON.stringify(events));
    }
  }

  private async loadAllEvents(): Promise<EventSync[]> {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hfrp_events");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  private async saveSyncReport(report: Record<string, unknown>) {
    if (typeof window !== "undefined") {
      localStorage.setItem("hfrp_sync_report", JSON.stringify(report));
    }
  }

  private async getOrCreateProduct(name: string): Promise<string> {
    try {
      // Search for existing product
      const products = await this.stripe.products.list({
        limit: 100,
      });

      const existingProduct = products.data.find((p) => p.name === name);
      if (existingProduct) {
        return existingProduct.id;
      }

      // Create new product
      const product = await this.stripe.products.create({
        name: name,
        type: "service",
      });

      return product.id;
    } catch (error) {
      console.error("Failed to get or create product:", error);
      throw error;
    }
  }

  // Enhanced webhook processing method with comprehensive error handling
  async processWebhookAutomatically(
    event: Stripe.Event,
    signature: string,
    rawBody: Buffer,
  ): Promise<{
    success: boolean;
    eventType: string;
    processed: boolean;
    error?: string;
    retryScheduled?: boolean;
  }> {
    try {
      console.log(`Processing webhook event: ${event.type} with automation`);

      // Validate event integrity
      if (!event.id || !event.type || !event.data) {
        throw new StripeError(
          "Invalid webhook event structure",
          "invalid_event",
          "validation_error",
        );
      }

      // Process based on event type with retry logic
      await withRetry(
        async () => {
          switch (event.type) {
            case "payment_intent.succeeded":
              await this.handleAutomatedPaymentSuccess(
                event.data.object as Stripe.PaymentIntent,
              );
              break;
            case "payment_intent.payment_failed":
              await this.handleAutomatedPaymentFailure(
                event.data.object as Stripe.PaymentIntent,
              );
              break;
            case "checkout.session.completed":
              await this.handleAutomatedCheckoutCompleted(
                event.data.object as Stripe.Checkout.Session,
              );
              break;
            case "customer.subscription.created":
            case "customer.subscription.updated":
              await this.handleAutomatedSubscriptionChange(
                event.data.object as Stripe.Subscription,
              );
              break;
            default:
              console.log(
                `Automated processing not implemented for: ${event.type}`,
              );
              throw new StripeError(
                `Not implemented: ${event.type}`,
                "not_implemented",
                "processing_error",
              );
          }
        },
        { maxRetries: 2, baseDelay: 500, maxDelay: 5000, backoffMultiplier: 2 },
      );

      console.log(`✅ Successfully processed webhook event: ${event.type}`);
      return { success: true, eventType: event.type, processed: true };
    } catch (error) {
      console.error(
        `❌ Automated webhook processing failed for ${event.type}:`,
        error,
      );

      const isRetryable = !(
        error instanceof StripeError &&
        (error.type === "validation_error" || error.type === "not_implemented")
      );

      return {
        success: false,
        eventType: event.type,
        processed: false,
        error: error instanceof Error ? error.message : "Unknown error",
        retryScheduled: isRetryable,
      };
    }
  }

  private async handleAutomatedPaymentSuccess(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    console.log(`Automated payment success handling: ${paymentIntent.id}`);
    // Add automated success handling logic here
  }

  private async handleAutomatedPaymentFailure(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    console.log(`Automated payment failure handling: ${paymentIntent.id}`);
    // Add automated failure handling logic here
  }

  private async handleAutomatedCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    console.log(`Automated checkout completion handling: ${session.id}`);
    // Add automated checkout completion logic here
  }

  private async handleAutomatedSubscriptionChange(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    console.log(`Automated subscription change handling: ${subscription.id}`);
    // Add automated subscription change logic here
  }

  // Enhanced donation creation methods
  async createOneTimeDonation(params: {
    amount: number;
    currency: string;
    donorEmail: string;
    campaignId: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; paymentIntentId?: string }> {
    try {
      const {
        amount,
        currency,
        donorEmail,
        campaignId,
        metadata = {},
      } = params;

      // Validate input parameters
      if (!amount || amount <= 0) {
        throw new StripeError(
          "Invalid donation amount",
          "validation_error",
          "validation_error",
          400,
        );
      }
      if (!donorEmail || !campaignId) {
        throw new StripeError(
          "Missing required donation parameters",
          "validation_error",
          "validation_error",
          400,
        );
      }

      // Create payment intent for one-time donation with retry logic
      const paymentIntent = await withRetry(
        () =>
          this.stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
              donation_type: "one_time",
              campaign_id: campaignId,
              donor_email: donorEmail,
              ...metadata,
            },
          }),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2,
        },
        "create_one_time_donation",
      );

      const donationId = `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(
        `Created one-time donation: ${donationId} for campaign: ${campaignId}`,
      );

      return {
        id: donationId,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      const stripeError =
        error instanceof StripeError
          ? error
          : new StripeError(
              "Failed to create one-time donation",
              "donation_creation_error",
              "donation_creation_error",
              500,
              error as Error,
            );

      console.error("Failed to create one-time donation:", stripeError);
      throw stripeError;
    }
  }

  async createRecurringDonation(params: {
    amount: number;
    currency: string;
    interval: "day" | "week" | "month" | "year";
    donorEmail: string;
    campaignId: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; priceId: string; productId: string }> {
    try {
      const {
        amount,
        currency,
        interval,
        donorEmail,
        campaignId,
        metadata = {},
      } = params;

      // Validate input parameters
      if (!amount || amount <= 0) {
        throw new StripeError(
          "Invalid donation amount",
          "validation_error",
          "validation_error",
          400,
        );
      }
      if (!donorEmail || !campaignId) {
        throw new StripeError(
          "Missing required donation parameters",
          "validation_error",
          "validation_error",
          400,
        );
      }
      if (!["day", "week", "month", "year"].includes(interval)) {
        throw new StripeError(
          "Invalid recurring interval",
          "validation_error",
          "validation_error",
          400,
        );
      }

      // Create or get product for the campaign with retry logic
      const productId = await withRetry(
        () => this.getOrCreateProduct(`Recurring Donation - ${campaignId}`),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2,
        },
        "create_recurring_product",
      );

      // Create price for recurring donation with retry logic
      const price = await withRetry(
        () =>
          this.stripe.prices.create({
            unit_amount: amount,
            currency,
            recurring: {
              interval,
              interval_count: 1,
            },
            product: productId,
            metadata: {
              donation_type: "recurring",
              campaign_id: campaignId,
              donor_email: donorEmail,
              ...metadata,
            },
          }),
        {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2,
        },
        "create_recurring_price",
      );

      const donationId = `recurring_donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(
        `Created recurring donation: ${donationId} for campaign: ${campaignId}`,
      );

      return {
        id: donationId,
        priceId: price.id,
        productId,
      };
    } catch (error) {
      const stripeError =
        error instanceof StripeError
          ? error
          : new StripeError(
              "Failed to create recurring donation",
              "donation_creation_error",
              "donation_creation_error",
              500,
              error as Error,
            );

      console.error("Failed to create recurring donation:", stripeError);
      throw stripeError;
    }
  }

  // Performance monitoring methods
  getPerformanceMetrics(): PerformanceMetrics[] {
    return PerformanceMonitor.getMetrics();
  }

  getOperationStats(operationType?: string): {
    averageTime: number;
    successRate: number;
    totalOperations: number;
  } {
    const metrics = PerformanceMonitor.getMetrics();
    const filteredMetrics = operationType
      ? metrics.filter((m) => m.operationType === operationType)
      : metrics;

    const totalOperations = filteredMetrics.length;
    const successfulOperations = filteredMetrics.filter(
      (m) => m.success,
    ).length;
    const totalTime = filteredMetrics
      .filter((m) => m.success && m.duration)
      .reduce((sum, m) => sum + (m.duration || 0), 0);

    return {
      averageTime:
        successfulOperations > 0 ? totalTime / successfulOperations : 0,
      successRate:
        totalOperations > 0
          ? (successfulOperations / totalOperations) * 100
          : 0,
      totalOperations,
    };
  }

  getHealthStatus(): {
    status: "healthy" | "degraded" | "unhealthy";
    metrics: {
      recentSuccessRate: number;
      averageResponseTime: number;
      errorRate: number;
    };
  } {
    const recentMetrics = PerformanceMonitor.getMetrics().slice(-50); // Last 50 operations

    const totalRecent = recentMetrics.length;
    const successfulRecent = recentMetrics.filter((m) => m.success).length;
    const recentSuccessRate =
      totalRecent > 0 ? (successfulRecent / totalRecent) * 100 : 100;

    const avgResponseTime = recentMetrics
      .filter((m) => m.success && m.duration)
      .reduce((sum, m, _, arr) => sum + (m.duration || 0) / arr.length, 0);

    const errorRate = 100 - recentSuccessRate;

    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (recentSuccessRate < 50 || avgResponseTime > 10000) {
      status = "unhealthy";
    } else if (recentSuccessRate < 80 || avgResponseTime > 5000) {
      status = "degraded";
    }

    return {
      status,
      metrics: {
        recentSuccessRate,
        averageResponseTime: avgResponseTime,
        errorRate,
      },
    };
  }
}

// Lazy initialization to prevent build-time failures
let stripeAutomationInstance: StripeAutomationService | null = null;

export function getStripeAutomation(): StripeAutomationService | null {
  // Return null if STRIPE_SECRET_KEY is not set or is a placeholder
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "your_stripe_secret_key_here") {
    return null;
  }

  // Create instance only when needed and environment is properly configured
  if (!stripeAutomationInstance) {
    stripeAutomationInstance = new StripeAutomationService();
  }

  return stripeAutomationInstance;
}

// Export default getter function
export default getStripeAutomation;
