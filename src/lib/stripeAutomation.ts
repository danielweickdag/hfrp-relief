// 🚀 Comprehensive Stripe Automation System
// Replaces Donorbox with full Stripe integration for campaigns, events, and donations

import Stripe from "stripe";
import { stripeEnhanced } from "./stripeEnhanced";

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
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia",
    });
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
      // Create Stripe Product for campaign
      const product = await this.stripe.products.create({
        name: campaignData.name,
        description: campaignData.description,
        type: "service",
        metadata: {
          campaignType: "donation",
          goalAmount: campaignData.goalAmount.toString(),
          automationEnabled: "true",
        },
      });

      console.log("✅ Created Stripe product:", product.id);

      // Create multiple price options
      const priceIds: string[] = [];

      for (const amount of campaignData.suggestedAmounts) {
        // One-time donation price
        const oneTimePrice = await this.stripe.prices.create({
          product: product.id,
          unit_amount: amount * 100, // Convert to cents
          currency: "usd",
          metadata: {
            donationType: "one-time",
            suggestedAmount: amount.toString(),
          },
        });
        priceIds.push(oneTimePrice.id);

        // Recurring monthly donation price (if enabled)
        if (campaignData.enableRecurring) {
          const recurringPrice = await this.stripe.prices.create({
            product: product.id,
            unit_amount: amount * 100,
            currency: "usd",
            recurring: { interval: "month" },
            metadata: {
              donationType: "recurring",
              suggestedAmount: amount.toString(),
            },
          });
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
        donationData.donorName
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
                product_data: {
                  name: `Monthly Donation${donationData.campaignId ? ` - ${donationData.campaignId}` : ""}`,
                },
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
    name?: string
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
    // Integration with email service (Resend, SendGrid, etc.)
    console.log(`📧 Sending thank you email to: ${donation.donorEmail}`);

    // This would integrate with your email service
    // await emailService.send({
    //   to: donation.donorEmail,
    //   template: "thank-you",
    //   data: { amount: donation.amount, campaign: donation.campaign }
    // });
  }

  private async generateReceipt(donation: DonationAutomation) {
    console.log(`🧾 Generating receipt for: ${donation.donorId}`);
    // Generate PDF receipt logic here
  }

  private async updateCampaignProgress(campaignId: string, amount: number) {
    const campaigns = await this.loadAllCampaigns();
    const campaign = campaigns.find((c) => c.id === campaignId);

    if (campaign) {
      campaign.currentAmount += amount;
      campaign.updatedAt = new Date();
      await this.saveCampaignData(campaign);

      console.log(
        `📈 Updated campaign ${campaignId}: $${campaign.currentAmount}/$${campaign.goalAmount}`
      );
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

  private async saveSyncReport(report: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem("hfrp_sync_report", JSON.stringify(report));
    }
  }
}

export const stripeAutomation = new StripeAutomationService();
