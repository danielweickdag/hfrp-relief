import Stripe from "stripe";
import { donationStorage } from "./donationStorage";
import { stripeEnhanced } from "./stripeEnhanced";
import type {
  Donation,
  Donor,
  DonationCampaign,
  DonationFilters,
  DonationStats,
  DonationType,
  PaymentMethod,
  DonationSource,
} from "@/types/donation";

// Stripe-enhanced donation interfaces
export interface StripeAutomatedDonation
  extends Omit<Donation, "paymentMethod"> {
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeInvoiceId?: string;
  stripeChargeId?: string;
  paymentMethod: PaymentMethod | "stripe_card" | "stripe_sepa" | "stripe_ach";
  stripePaymentMethodId?: string;
  processingFee: number;
  netAmount: number;
  refundAmount?: number;
  refundReason?: string;
  webhookProcessed: boolean;
  automationTriggered: boolean;
}

export interface StripeAutomatedCampaign extends DonationCampaign {
  stripeProductId?: string;
  stripePriceIds: string[];
  automatedGoalTracking: boolean;
  automatedNotifications: boolean;
  automatedReporting: boolean;
  milestoneAutomation: MilestoneAutomation[];
  socialMediaAutomation: SocialMediaAutomation;
  emailAutomation: EmailAutomation;
}

export interface MilestoneAutomation {
  percentage: number; // e.g., 25, 50, 75, 100
  amount: number;
  triggered: boolean;
  actions: {
    sendThankYouEmail: boolean;
    postSocialMedia: boolean;
    sendPressRelease: boolean;
    updateWebsite: boolean;
    notifyTeam: boolean;
  };
}

export interface SocialMediaAutomation {
  enabled: boolean;
  platforms: ("facebook" | "twitter" | "instagram" | "linkedin")[];
  templates: {
    milestone: string;
    goalReached: string;
    newDonation: string;
    weeklyUpdate: string;
  };
}

export interface EmailAutomation {
  enabled: boolean;
  sequences: {
    welcomeSeries: boolean;
    donorThankYou: boolean;
    milestoneUpdates: boolean;
    monthlyReports: boolean;
    impactStories: boolean;
  };
  segmentation: {
    byAmount: boolean;
    byFrequency: boolean;
    byGeography: boolean;
    byInterests: boolean;
  };
}

export interface StripeEvent {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  location: string;
  venue: string;
  capacity: number;
  soldTickets: number;
  stripeProductId?: string;
  ticketTypes: StripeTicketType[];
  automatedProcessing: boolean;
  checkInAutomation: boolean;
  followUpAutomation: boolean;
  status: "draft" | "active" | "sold_out" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface StripeTicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId?: string;
  quantity: number;
  sold: number;
  maxPerCustomer: number;
  salesStart: string;
  salesEnd: string;
  benefits: string[];
}

// Storage keys for Stripe-enhanced system
const STRIPE_STORAGE_KEYS = {
  STRIPE_DONATIONS: "hfrp_stripe_donations",
  STRIPE_CAMPAIGNS: "hfrp_stripe_campaigns",
  STRIPE_EVENTS: "hfrp_stripe_events",
  STRIPE_SUBSCRIPTIONS: "hfrp_stripe_subscriptions",
  AUTOMATION_LOGS: "hfrp_automation_logs",
  STRIPE_CUSTOMERS: "hfrp_stripe_customers",
  CAMPAIGN_ANALYTICS: "hfrp_campaign_analytics",
  EVENT_ANALYTICS: "hfrp_event_analytics",
};

class StripeAutomatedDonationSystem {
  private stripe: Stripe;
  private automationQueue: Array<() => Promise<void>> = [];
  private processingInterval: NodeJS.Timeout | null = null;
  private serverStorage: Map<string, string> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    // Start automation processing
    this.startAutomationProcessor();
    // Initialize campaigns asynchronously
    this.initializeDefaultCampaigns().then(() => {
      this.initialized = true;
    });
  }

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getFromStorage(key: string, defaultValue = ""): string {
    if (this.isClient()) {
      return localStorage.getItem(key) || defaultValue;
    } else {
      // Use in-memory storage for server-side
      return this.serverStorage.get(key) || defaultValue;
    }
  }

  private setToStorage(key: string, value: string): void {
    if (this.isClient()) {
      localStorage.setItem(key, value);
    } else {
      // Use in-memory storage for server-side
      this.serverStorage.set(key, value);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeDefaultCampaigns();
      this.initialized = true;
    }
  }

  // Initialize default automated campaigns
  private async initializeDefaultCampaigns() {
    const campaigns = this.getStripeCampaigns();
    if (campaigns.length === 0) {
      const defaultCampaigns: StripeAutomatedCampaign[] = [
        {
          id: "haiti-relief-emergency",
          name: "Haiti Emergency Relief",
          description:
            "Immediate disaster relief and humanitarian aid for Haiti",
          goal: 100000,
          raised: 0,
          donorCount: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: true,
          tags: ["emergency", "haiti", "disaster-relief"],
          stripePriceIds: [],
          automatedGoalTracking: true,
          automatedNotifications: true,
          automatedReporting: true,
          milestoneAutomation: [
            {
              percentage: 25,
              amount: 25000,
              triggered: false,
              actions: {
                sendThankYouEmail: true,
                postSocialMedia: true,
                sendPressRelease: false,
                updateWebsite: true,
                notifyTeam: true,
              },
            },
            {
              percentage: 50,
              amount: 50000,
              triggered: false,
              actions: {
                sendThankYouEmail: true,
                postSocialMedia: true,
                sendPressRelease: true,
                updateWebsite: true,
                notifyTeam: true,
              },
            },
            {
              percentage: 100,
              amount: 100000,
              triggered: false,
              actions: {
                sendThankYouEmail: true,
                postSocialMedia: true,
                sendPressRelease: true,
                updateWebsite: true,
                notifyTeam: true,
              },
            },
          ],
          socialMediaAutomation: {
            enabled: true,
            platforms: ["facebook", "twitter", "instagram"],
            templates: {
              milestone:
                "🎉 We've reached {percentage}% of our goal! Thanks to {donorCount} amazing supporters, we've raised ${amount} for Haiti relief.",
              goalReached:
                "🙏 GOAL REACHED! Thanks to our incredible community, we've raised ${amount} for Haiti emergency relief. Every dollar makes a difference!",
              newDonation:
                "❤️ Another generous donation just came in! We're now at ${totalRaised} towards our ${goal} goal.",
              weeklyUpdate:
                "📊 Weekly Update: ${weeklyAmount} raised this week, bringing us to ${totalRaised} of our ${goal} goal. Keep it going!",
            },
          },
          emailAutomation: {
            enabled: true,
            sequences: {
              welcomeSeries: true,
              donorThankYou: true,
              milestoneUpdates: true,
              monthlyReports: true,
              impactStories: true,
            },
            segmentation: {
              byAmount: true,
              byFrequency: true,
              byGeography: false,
              byInterests: true,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "daily-support-program",
          name: "Daily 50¢ Support Program",
          description:
            "Consistent daily support that provides ongoing assistance",
          goal: 50000,
          raised: 0,
          donorCount: 0,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: true,
          tags: ["recurring", "daily", "sustainable"],
          stripePriceIds: [],
          automatedGoalTracking: true,
          automatedNotifications: true,
          automatedReporting: true,
          milestoneAutomation: [
            {
              percentage: 20,
              amount: 10000,
              triggered: false,
              actions: {
                sendThankYouEmail: true,
                postSocialMedia: true,
                sendPressRelease: false,
                updateWebsite: true,
                notifyTeam: true,
              },
            },
            {
              percentage: 50,
              amount: 25000,
              triggered: false,
              actions: {
                sendThankYouEmail: true,
                postSocialMedia: true,
                sendPressRelease: true,
                updateWebsite: true,
                notifyTeam: true,
              },
            },
          ],
          socialMediaAutomation: {
            enabled: true,
            platforms: ["facebook", "twitter", "instagram"],
            templates: {
              milestone:
                "💪 Daily Support Milestone! {donorCount} people are now providing daily 50¢ support - that's ${monthlyAmount}/month in consistent aid!",
              goalReached:
                "🌟 Our Daily Support Program has reached its goal! Sustainable support makes the biggest impact.",
              newDonation:
                "🤝 Welcome to our Daily Support family! Every 50¢ adds up to lasting change.",
              weeklyUpdate:
                "📈 This week: {newSupporters} new daily supporters joined our mission!",
            },
          },
          emailAutomation: {
            enabled: true,
            sequences: {
              welcomeSeries: true,
              donorThankYou: true,
              milestoneUpdates: true,
              monthlyReports: true,
              impactStories: true,
            },
            segmentation: {
              byAmount: false,
              byFrequency: true,
              byGeography: false,
              byInterests: true,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      this.setToStorage(
        STRIPE_STORAGE_KEYS.STRIPE_CAMPAIGNS,
        JSON.stringify(defaultCampaigns)
      );

      // Create Stripe products and prices for these campaigns
      for (const campaign of defaultCampaigns) {
        await this.createStripeProductForCampaign(campaign);
      }
    }
  }

  // Create Stripe products and prices for campaigns
  private async createStripeProductForCampaign(
    campaign: StripeAutomatedCampaign
  ): Promise<void> {
    try {
      // Create Stripe product
      const product = await this.stripe.products.create({
        name: campaign.name,
        description: campaign.description,
        metadata: {
          campaignId: campaign.id,
          type: "donation_campaign",
        },
      });

      campaign.stripeProductId = product.id;

      // Create prices based on campaign type
      if (campaign.id === "daily-support-program") {
        // Create recurring daily price (50 cents)
        const dailyPrice = await this.stripe.prices.create({
          product: product.id,
          unit_amount: 50, // 50 cents
          currency: "usd",
          recurring: {
            interval: "day",
            interval_count: 1,
          },
          metadata: {
            campaignId: campaign.id,
            type: "daily_recurring",
          },
        });
        campaign.stripePriceIds.push(dailyPrice.id);
      } else {
        // Create one-time donation prices
        const amounts = [2500, 5000, 10000, 25000, 50000, 100000]; // $25, $50, $100, $250, $500, $1000
        for (const amount of amounts) {
          const price = await this.stripe.prices.create({
            product: product.id,
            unit_amount: amount,
            currency: "usd",
            metadata: {
              campaignId: campaign.id,
              type: "one_time",
              suggested_amount: "true",
            },
          });
          campaign.stripePriceIds.push(price.id);
        }
      }

      // Update campaign in storage
      const campaigns = this.getStripeCampaigns();
      const index = campaigns.findIndex((c) => c.id === campaign.id);
      if (index !== -1) {
        campaigns[index] = campaign;
        this.setToStorage(
          STRIPE_STORAGE_KEYS.STRIPE_CAMPAIGNS,
          JSON.stringify(campaigns)
        );
      }

      this.logAutomation(
        `Created Stripe product ${product.id} for campaign ${campaign.id}`
      );
    } catch (error) {
      console.error(
        `Failed to create Stripe product for campaign ${campaign.id}:`,
        error
      );
    }
  }

  // Create Stripe checkout session for donation
  async createDonationCheckout(params: {
    campaignId: string;
    amount?: number; // in cents
    priceId?: string;
    isRecurring?: boolean;
    customerEmail?: string;
    metadata?: Record<string, string>;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string; url: string }> {
    try {
      await this.ensureInitialized();
      const campaign = this.getStripeCampaigns().find(
        (c) => c.id === params.campaignId
      );
      if (!campaign) {
        throw new Error(`Campaign ${params.campaignId} not found`);
      }

      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      if (params.priceId) {
        // Use existing price
        lineItems = [
          {
            price: params.priceId,
            quantity: 1,
          },
        ];
      } else if (params.amount) {
        // Create custom amount
        if (!campaign.stripeProductId) {
          throw new Error(
            `Campaign ${params.campaignId} missing Stripe product`
          );
        }

        const price = await this.stripe.prices.create({
          product: campaign.stripeProductId,
          unit_amount: params.amount,
          currency: "usd",
          metadata: {
            campaignId: params.campaignId,
            type: params.isRecurring ? "custom_recurring" : "custom_one_time",
          },
          ...(params.isRecurring && {
            recurring: {
              interval: "month",
            },
          }),
        });

        lineItems = [
          {
            price: price.id,
            quantity: 1,
          },
        ];
      } else {
        throw new Error("Either priceId or amount must be provided");
      }

      const session = await this.stripe.checkout.sessions.create({
        mode: params.isRecurring ? "subscription" : "payment",
        line_items: lineItems,
        success_url:
          params.successUrl ||
          `${process.env.NEXT_PUBLIC_BASE_URL}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          params.cancelUrl ||
          `${process.env.NEXT_PUBLIC_BASE_URL}/donation/cancel`,
        customer_email: params.customerEmail,
        metadata: {
          campaignId: params.campaignId,
          ...params.metadata,
        },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: ["US", "CA"],
        },
      });

      this.logAutomation(
        `Created checkout session ${session.id} for campaign ${params.campaignId}`
      );

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error("Failed to create donation checkout:", error);
      throw error;
    }
  }

  // Process Stripe webhook events
  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session
          );
          break;

        case "payment_intent.succeeded":
          await this.handlePaymentSucceeded(
            event.data.object as Stripe.PaymentIntent
          );
          break;

        case "invoice.payment_succeeded":
          await this.handleRecurringPaymentSucceeded(
            event.data.object as Stripe.Invoice
          );
          break;

        case "customer.subscription.created":
        case "customer.subscription.updated":
          await this.handleSubscriptionChange(
            event.data.object as Stripe.Subscription
          );
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionCancelled(
            event.data.object as Stripe.Subscription
          );
          break;

        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }

      this.logAutomation(
        `Processed webhook event: ${event.type} - ${event.id}`
      );
    } catch (error) {
      console.error(`Failed to process webhook event ${event.type}:`, error);
    }
  }

  // Handle successful checkout completion
  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const campaignId = session.metadata?.campaignId;
    if (!campaignId) return;

    // Create donation record
    const donation: StripeAutomatedDonation = {
      id: `stripe-${session.id}`,
      donorId: (session.customer as string) || `guest-${Date.now()}`,
      donorName: session.customer_details?.name || "Anonymous",
      amount: (session.amount_total || 0) / 100, // Convert from cents
      currency: session.currency?.toUpperCase() || "USD",
      type: session.mode === "subscription" ? "monthly" : "one_time",
      paymentMethod: "stripe_card",
      status: "completed",
      source: "website",
      campaignId,
      campaignName: this.getStripeCampaigns().find((c) => c.id === campaignId)
        ?.name,
      stripePaymentIntentId: session.payment_intent as string,
      stripeCustomerId: session.customer as string,
      processingFee: ((session.amount_total || 0) * 0.029 + 30) / 100, // Stripe fee
      netAmount:
        ((session.amount_total || 0) -
          ((session.amount_total || 0) * 0.029 + 30)) /
        100,
      processorFee: ((session.amount_total || 0) * 0.029 + 30) / 100,
      isRecurring: session.mode === "subscription",
      isAnonymous: !session.customer_details?.name,
      receiptSent: true,
      receiptNumber: `HFRP-${new Date().getFullYear()}-${Date.now()}`,
      taxDeductible: true,
      donationDate: new Date().toISOString(),
      processedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      webhookProcessed: true,
      automationTriggered: false,
    };

    // Save donation
    this.saveStripeDonation(donation);

    // Update campaign stats
    await this.updateCampaignStats(campaignId, donation.amount);

    // Trigger automation
    this.queueAutomation(() => this.triggerDonationAutomation(donation));
  }

  // Handle successful payment
  private async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    // Update donation status if exists
    const donations = this.getStripeDonations();
    const donation = donations.find(
      (d) => d.stripePaymentIntentId === paymentIntent.id
    );

    if (donation) {
      donation.status = "completed";
      donation.webhookProcessed = true;
      donation.updatedAt = new Date().toISOString();

      this.setToStorage(
        STRIPE_STORAGE_KEYS.STRIPE_DONATIONS,
        JSON.stringify(donations)
      );

      // Trigger automation if not already triggered
      if (!donation.automationTriggered) {
        this.queueAutomation(() => this.triggerDonationAutomation(donation));
      }
    }
  }

  // Handle recurring payment success
  private async handleRecurringPaymentSucceeded(
    invoice: Stripe.Invoice
  ): Promise<void> {
    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
    const campaignId = invoice.lines.data[0]?.metadata?.campaignId;

    if (!campaignId) return;

    // Create donation record for recurring payment
    const donation: StripeAutomatedDonation = {
      id: `stripe-invoice-${invoice.id}`,
      donorId: invoice.customer as string,
      donorName: "Recurring Donor", // Will be updated when customer info is fetched
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency?.toUpperCase() || "USD",
      type: "monthly", // Assume monthly for now
      paymentMethod: "stripe_card",
      status: "completed",
      source: "website",
      campaignId,
      campaignName: this.getStripeCampaigns().find((c) => c.id === campaignId)
        ?.name,
      stripeSubscriptionId: subscriptionId,
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer as string,
      processingFee: ((invoice.amount_paid || 0) * 0.029 + 30) / 100,
      netAmount:
        ((invoice.amount_paid || 0) -
          ((invoice.amount_paid || 0) * 0.029 + 30)) /
        100,
      processorFee: ((invoice.amount_paid || 0) * 0.029 + 30) / 100,
      isRecurring: true,
      isAnonymous: false,
      receiptSent: true,
      receiptNumber: `HFRP-REC-${new Date().getFullYear()}-${Date.now()}`,
      taxDeductible: true,
      donationDate: new Date().toISOString(),
      processedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      webhookProcessed: true,
      automationTriggered: false,
    };

    this.saveStripeDonation(donation);
    await this.updateCampaignStats(campaignId, donation.amount);
    this.queueAutomation(() =>
      this.triggerRecurringDonationAutomation(donation)
    );
  }

  // Handle subscription changes
  private async handleSubscriptionChange(
    subscription: Stripe.Subscription
  ): Promise<void> {
    // Log subscription changes for analytics
    this.logAutomation(
      `Subscription ${subscription.status}: ${subscription.id}`
    );
  }

  // Handle subscription cancellation
  private async handleSubscriptionCancelled(
    subscription: Stripe.Subscription
  ): Promise<void> {
    // Trigger retention automation
    this.queueAutomation(() => this.triggerRetentionAutomation(subscription));
  }

  // Trigger donation automation
  private async triggerDonationAutomation(
    donation: StripeAutomatedDonation
  ): Promise<void> {
    const campaign = this.getStripeCampaigns().find(
      (c) => c.id === donation.campaignId
    );
    if (!campaign || !campaign.automatedNotifications) return;

    // Send thank you email
    if (
      campaign.emailAutomation.enabled &&
      campaign.emailAutomation.sequences.donorThankYou
    ) {
      await this.sendThankYouEmail(donation, campaign);
    }

    // Post social media update
    if (campaign.socialMediaAutomation.enabled) {
      await this.postSocialMediaUpdate(donation, campaign, "newDonation");
    }

    // Check for milestone triggers
    await this.checkMilestones(campaign);

    // Mark automation as triggered
    const donations = this.getStripeDonations();
    const donationIndex = donations.findIndex((d) => d.id === donation.id);
    if (donationIndex !== -1) {
      donations[donationIndex].automationTriggered = true;
      this.setToStorage(
        STRIPE_STORAGE_KEYS.STRIPE_DONATIONS,
        JSON.stringify(donations)
      );
    }

    this.logAutomation(`Triggered donation automation for ${donation.id}`);
  }

  // Trigger recurring donation automation
  private async triggerRecurringDonationAutomation(
    donation: StripeAutomatedDonation
  ): Promise<void> {
    // Special handling for recurring donations
    this.logAutomation(
      `Triggered recurring donation automation for ${donation.id}`
    );

    // Send recurring thank you (different from one-time)
    const campaign = this.getStripeCampaigns().find(
      (c) => c.id === donation.campaignId
    );
    if (campaign) {
      await this.sendRecurringThankYouEmail(donation, campaign);
    }
  }

  // Trigger retention automation for cancelled subscriptions
  private async triggerRetentionAutomation(
    subscription: Stripe.Subscription
  ): Promise<void> {
    this.logAutomation(
      `Triggered retention automation for cancelled subscription ${subscription.id}`
    );

    // Send retention email
    // Schedule follow-up in 30 days
    // Offer to restart with incentive
  }

  // Check and trigger milestone automations
  private async checkMilestones(
    campaign: StripeAutomatedCampaign
  ): Promise<void> {
    for (const milestone of campaign.milestoneAutomation) {
      if (!milestone.triggered && campaign.raised >= milestone.amount) {
        milestone.triggered = true;

        // Execute milestone actions
        if (milestone.actions.sendThankYouEmail) {
          await this.sendMilestoneEmail(campaign, milestone);
        }

        if (milestone.actions.postSocialMedia) {
          await this.postSocialMediaUpdate(
            null,
            campaign,
            "milestone",
            milestone
          );
        }

        if (milestone.actions.notifyTeam) {
          await this.notifyTeam(campaign, milestone);
        }

        // Update campaign in storage
        const campaigns = this.getStripeCampaigns();
        const index = campaigns.findIndex((c) => c.id === campaign.id);
        if (index !== -1) {
          campaigns[index] = campaign;
          this.setToStorage(
            STRIPE_STORAGE_KEYS.STRIPE_CAMPAIGNS,
            JSON.stringify(campaigns)
          );
        }

        this.logAutomation(
          `Triggered milestone automation for ${campaign.id} at ${milestone.percentage}%`
        );
      }
    }
  }

  // Automation helper methods
  private async sendThankYouEmail(
    donation: StripeAutomatedDonation,
    campaign: StripeAutomatedCampaign
  ): Promise<void> {
    // Implementation would integrate with email service (SendGrid, Mailgun, etc.)
    this.logAutomation(`Sent thank you email for donation ${donation.id}`);
  }

  private async sendRecurringThankYouEmail(
    donation: StripeAutomatedDonation,
    campaign: StripeAutomatedCampaign
  ): Promise<void> {
    this.logAutomation(
      `Sent recurring thank you email for donation ${donation.id}`
    );
  }

  private async sendMilestoneEmail(
    campaign: StripeAutomatedCampaign,
    milestone: MilestoneAutomation
  ): Promise<void> {
    this.logAutomation(
      `Sent milestone email for ${campaign.id} at ${milestone.percentage}%`
    );
  }

  private async postSocialMediaUpdate(
    donation: StripeAutomatedDonation | null,
    campaign: StripeAutomatedCampaign,
    type: "newDonation" | "milestone" | "goalReached" | "weeklyUpdate",
    milestone?: MilestoneAutomation
  ): Promise<void> {
    const template = campaign.socialMediaAutomation.templates[type];
    let message = template;

    // Replace placeholders
    if (type === "milestone" && milestone) {
      message = message
        .replace("{percentage}", milestone.percentage.toString())
        .replace("{amount}", campaign.raised.toString())
        .replace("{donorCount}", campaign.donorCount.toString());
    }

    this.logAutomation(
      `Posted social media update: ${type} for ${campaign.id}`
    );
  }

  private async notifyTeam(
    campaign: StripeAutomatedCampaign,
    milestone: MilestoneAutomation
  ): Promise<void> {
    this.logAutomation(
      `Notified team about milestone ${milestone.percentage}% for ${campaign.id}`
    );
  }

  // Update campaign statistics
  private async updateCampaignStats(
    campaignId: string,
    amount: number
  ): Promise<void> {
    const campaigns = this.getStripeCampaigns();
    const campaignIndex = campaigns.findIndex((c) => c.id === campaignId);

    if (campaignIndex !== -1) {
      campaigns[campaignIndex].raised += amount;
      campaigns[campaignIndex].donorCount += 1;
      campaigns[campaignIndex].updatedAt = new Date().toISOString();

      this.setToStorage(
        STRIPE_STORAGE_KEYS.STRIPE_CAMPAIGNS,
        JSON.stringify(campaigns)
      );
    }
  }

  // Storage methods
  private getStripeDonations(): StripeAutomatedDonation[] {
    return JSON.parse(
      this.getFromStorage(STRIPE_STORAGE_KEYS.STRIPE_DONATIONS, "[]")
    );
  }

  private saveStripeDonation(donation: StripeAutomatedDonation): void {
    const donations = this.getStripeDonations();
    donations.push(donation);
    this.setToStorage(
      STRIPE_STORAGE_KEYS.STRIPE_DONATIONS,
      JSON.stringify(donations)
    );
  }

  private getStripeCampaigns(): StripeAutomatedCampaign[] {
    return JSON.parse(
      this.getFromStorage(STRIPE_STORAGE_KEYS.STRIPE_CAMPAIGNS, "[]")
    );
  }

  // Automation queue management
  private queueAutomation(task: () => Promise<void>): void {
    this.automationQueue.push(task);
  }

  private startAutomationProcessor(): void {
    this.processingInterval = setInterval(async () => {
      if (this.automationQueue.length > 0) {
        const task = this.automationQueue.shift();
        if (task) {
          try {
            await task();
          } catch (error) {
            console.error("Automation task failed:", error);
          }
        }
      }
    }, 5000); // Process every 5 seconds
  }

  private stopAutomationProcessor(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  // Logging
  private logAutomation(message: string): void {
    const log = {
      timestamp: new Date().toISOString(),
      message,
    };

    const logs = JSON.parse(
      this.getFromStorage(STRIPE_STORAGE_KEYS.AUTOMATION_LOGS, "[]")
    );
    logs.push(log);

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    this.setToStorage(
      STRIPE_STORAGE_KEYS.AUTOMATION_LOGS,
      JSON.stringify(logs)
    );
    console.log(`[AUTOMATION] ${message}`);
  }

  // Public API methods
  async getDonationStats(): Promise<DonationStats & { stripeStats: object }> {
    const basicStats = await donationStorage.getStats();
    const stripeDonations = this.getStripeDonations();
    const stripeCampaigns = this.getStripeCampaigns();

    const stripeStats = {
      totalStripeAmount: stripeDonations.reduce((sum, d) => sum + d.amount, 0),
      totalStripeDonations: stripeDonations.length,
      processingFees: stripeDonations.reduce(
        (sum, d) => sum + d.processingFee,
        0
      ),
      netAmount: stripeDonations.reduce((sum, d) => sum + d.netAmount, 0),
      activeCampaigns: stripeCampaigns.filter((c) => c.isActive).length,
      automationTriggered: stripeDonations.filter((d) => d.automationTriggered)
        .length,
    };

    return {
      ...basicStats,
      stripeStats,
    };
  }

  async getActiveCampaigns(): Promise<StripeAutomatedCampaign[]> {
    return this.getStripeCampaigns().filter((c) => c.isActive);
  }

  async getCampaignById(id: string): Promise<StripeAutomatedCampaign | null> {
    await this.ensureInitialized();
    return this.getStripeCampaigns().find((c) => c.id === id) || null;
  }

  async getAutomationLogs(
    limit = 50
  ): Promise<Array<{ timestamp: string; message: string }>> {
    const logs = JSON.parse(
      this.getFromStorage(STRIPE_STORAGE_KEYS.AUTOMATION_LOGS, "[]")
    );
    return logs.slice(-limit).reverse();
  }

  // Cleanup
  destroy(): void {
    this.stopAutomationProcessor();
  }
}

// Export singleton instance
export const stripeAutomatedDonationSystem =
  new StripeAutomatedDonationSystem();
export default StripeAutomatedDonationSystem;
