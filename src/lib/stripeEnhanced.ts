// Enhanced Stripe configuration for donations, campaigns, and events
import Stripe from "stripe";

export interface StripeConfig {
  publishableKey: string;
  secretKey?: string;
  webhookSecret?: string;
  testMode: boolean;
  currency: string;
  minimumAmount: number;
  maximumAmount: number;
  supportedPaymentMethods: string[];
  enableApplePay: boolean;
  enableGooglePay: boolean;
  enableSubscriptions: boolean;
  defaultSuccessUrl: string;
  defaultCancelUrl: string;
  // Enhanced configuration options
  enableAutomaticTax?: boolean;
  collectShippingAddress?: boolean;
  allowPromotionCodes?: boolean;
  submitType?: "auto" | "book" | "donate" | "pay";
  billingAddressCollection?: "auto" | "required";
  phoneNumberCollection?: boolean;
  consentCollection?: {
    termsOfService?: "required" | "none";
    promotions?: "auto" | "none";
  };
  customFields?: Array<{
    key: string;
    label: string;
    type: "dropdown" | "numeric" | "text";
    optional?: boolean;
  }>;
  locale?: string;
  appearance?: {
    theme?: "stripe" | "night" | "flat";
    variables?: Record<string, string>;
  };
}

export interface StripeCampaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  stripeProductId?: string;
  stripePriceIds: string[];
  suggestedAmounts: number[];
  currency: string;
  allowCustomAmount: boolean;
  enableRecurring: boolean;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface StripeEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  ticketTypes: TicketType[];
  stripeProductId?: string;
  stripePriceIds: string[];
  maxAttendees?: number;
  currentAttendees: number;
  status: "active" | "sold_out" | "cancelled";
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  stripePriceId?: string;
  quantity: number;
  sold: number;
  maxPerCustomer: number;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  campaignId: string;
  amount: number;
  interval: "day" | "month" | "year";
  status: "active" | "cancelled" | "past_due";
  nextPayment: string;
  stripeSubscriptionId: string;
}

export interface StripeDonation {
  id: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  customerId?: string;
  campaignId?: string;
  eventId?: string;
  subscriptionId?: string;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  metadata: Record<string, string>;
  createdAt: string;
}

// Enhanced Stripe configuration
function getDefaultConfig(): StripeConfig {
  const cfg = {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    testMode: process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true",
    currency: "USD",
    minimumAmount: 1,
    maximumAmount: 999999,
    supportedPaymentMethods: ["card", "apple_pay", "google_pay"],
    enableApplePay: true,
    enableGooglePay: true,
    enableSubscriptions: true,
    defaultSuccessUrl: "/donation/success",
    defaultCancelUrl: "/donation/cancelled",
    // Enhanced defaults for donation system
    enableAutomaticTax: false, // Typically not needed for donations
    collectShippingAddress: false, // Not needed for digital donations
    allowPromotionCodes: false, // Usually not appropriate for donations
    submitType: "donate", // Optimized for donation flows
    billingAddressCollection: "auto", // Let Stripe decide based on payment method
    phoneNumberCollection: false, // Optional for donations
    consentCollection: {
      termsOfService: "none", // Handle separately if needed
      promotions: "none", // Respect donor privacy
    },
    locale: "en", // Default to English, can be overridden
    appearance: {
      theme: "stripe", // Clean, professional theme for donations
      variables: {
        colorPrimary: "#2563eb", // Blue theme for Haiti Relief
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        borderRadius: "8px",
      },
    },
  } as StripeConfig;

  // Debug current env-derived Stripe configuration (helps diagnose live vs test)
  try {
    const modeFromKey = cfg.publishableKey.startsWith("pk_live_")
      ? "live"
      : cfg.publishableKey.startsWith("pk_test_")
        ? "test"
        : "unknown";
    console.log(
      `🔎 Stripe env config: key=${modeFromKey}, testMode=${cfg.testMode}`,
    );
  } catch {}

  return cfg;
}

class EnhancedStripeService {
  private config: StripeConfig;
  private stripe: Stripe | null = null;
  private campaigns: Map<string, StripeCampaign> = new Map();
  private events: Map<string, StripeEvent> = new Map();
  private subscriptions: Map<string, StripeSubscription> = new Map();
  private donations: Map<string, StripeDonation> = new Map();
  // Plan type for subscription pricing metadata
  private plans: Map<
    string,
    {
      id: string;
      name: string;
      description: string;
      amount: number;
      currency: string;
      interval: "day" | "month" | "year";
      active: boolean;
      campaignId: string;
      stripePriceId?: string;
      createdAt: string;
      updatedAt: string;
    }
  > = new Map();

  private analytics: {
    trackCheckoutCreated: (data: {
      sessionId: string;
      amount: number;
      campaignId?: string;
      eventId?: string;
      mode?: string;
      recurring?: boolean;
    }) => void;
    trackPaymentSuccess: (data: StripeDonation) => void;
    trackCampaignCreated: (data: StripeCampaign) => void;
  } = {
    trackCheckoutCreated: (data) => {
      console.log("Analytics: Checkout created", data);
    },
    trackPaymentSuccess: (data) => {
      console.log("Analytics: Payment successful", data);
    },
    trackCampaignCreated: (data) => {
      console.log("Analytics: Campaign created", data);
    },
  };

  constructor(config: StripeConfig = getDefaultConfig()) {
    this.config = config;

    // Initialize Stripe instance if secret key is available
    if (config.secretKey) {
      this.stripe = new Stripe(config.secretKey);
    }

    this.initializeDefaultCampaigns();
    this.initializeDefaultPlans();
  }

  // Initialize default campaigns
  private initializeDefaultCampaigns() {
    const defaultCampaigns: StripeCampaign[] = [
      {
        id: "haiti-relief-main",
        name: "Haiti Relief Fund",
        description:
          "Support families in Haiti with food, water, healthcare, and education",
        goal: 50000,
        raised: 0,
        stripePriceIds: [],
        suggestedAmounts: [25, 50, 100, 250, 500, 1000], // Higher one-time custom donations
        currency: "USD",
        allowCustomAmount: true,
        enableRecurring: false, // Only one-time donations
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "haiti-relief-membership",
        name: "Daily Support Program",
        description:
          "Daily 50¢ support - consistent help that makes a difference",
        goal: 25000,
        raised: 0,
        stripePriceIds: [],
        suggestedAmounts: [0.5], // Only 50 cents daily
        currency: "USD",
        allowCustomAmount: false, // Fixed at 50 cents
        enableRecurring: true,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "hfrp-emergency-relief",
        name: "Emergency Crisis Response",
        description:
          "Immediate assistance for families in urgent crisis situations",
        goal: 100000,
        raised: 0,
        stripePriceIds: [],
        suggestedAmounts: [100, 250, 500, 1000, 2500], // Higher emergency amounts
        currency: "USD",
        allowCustomAmount: true,
        enableRecurring: false, // One-time only
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "haiti-education-fund",
        name: "Education Support Fund",
        description:
          "Provide school supplies, uniforms, and educational resources",
        goal: 30000,
        raised: 0,
        stripePriceIds: [],
        suggestedAmounts: [50, 100, 200, 350, 500], // Education-focused amounts
        currency: "USD",
        allowCustomAmount: true,
        enableRecurring: false, // One-time only
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "haiti-healthcare-initiative",
        name: "Healthcare Access Initiative",
        description:
          "Medical care, medications, and health supplies for families",
        goal: 75000,
        raised: 0,
        stripePriceIds: [],
        suggestedAmounts: [75, 150, 300, 500, 750], // Healthcare-focused amounts
        currency: "USD",
        allowCustomAmount: true,
        enableRecurring: false, // One-time only
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultCampaigns.forEach((campaign) => {
      this.campaigns.set(campaign.id, campaign);
    });
  }

  // Get configuration
  getConfig(): StripeConfig {
    return this.config;
  }

  // Update configuration
  updateConfig(updates: Partial<StripeConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  // Save configuration to localStorage
  private saveConfig() {
    if (typeof window !== "undefined") {
      localStorage.setItem("hfrp_stripe_config", JSON.stringify(this.config));
    }
  }

  // Load configuration from localStorage
  loadConfig() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hfrp_stripe_config");
      const envConfig = getDefaultConfig();

      // Start from env defaults
      this.config = { ...envConfig };

      // Merge any stored overrides
      if (stored) {
        try {
          const saved = JSON.parse(stored);
          this.config = { ...envConfig, ...saved };
        } catch (error) {
          console.error("Failed to load Stripe config:", error);
        }
      }

      // If env is clearly configured for LIVE (live keys, testMode disabled),
      // enforce env precedence over any stored test configuration.
      const envIsLive =
        !!envConfig.publishableKey &&
        envConfig.publishableKey.startsWith("pk_live_") &&
        !!envConfig.secretKey &&
        envConfig.secretKey.startsWith("sk_live_") &&
        envConfig.testMode === false;

      if (envIsLive) {
        try {
          localStorage.removeItem("hfrp_stripe_config");
        } catch {}
        this.config.publishableKey = envConfig.publishableKey;
        this.config.secretKey = envConfig.secretKey;
        this.config.webhookSecret = envConfig.webhookSecret;
        this.config.testMode = false;
      }
    }
  }

  // Enhanced configuration validation
  validateConfig(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!this.config.publishableKey) {
      errors.push("Stripe publishable key is required");
    }

    if (!this.config.publishableKey.startsWith("pk_")) {
      errors.push("Invalid Stripe publishable key format");
    }

    // Live/Test mode validation with helpful messages
    const isLiveKey = this.config.publishableKey.startsWith("pk_live_");
    const isTestKey = this.config.publishableKey.startsWith("pk_test_");

    if (this.config.testMode && isLiveKey) {
      errors.push(
        "⚠️ DANGER: Test mode enabled but using LIVE key - Real charges will be made!",
      );
    }

    // If a test key is detected while testMode is disabled, auto-correct
    if (!this.config.testMode && isTestKey) {
      // Switch to test mode automatically and persist
      this.config.testMode = true;
      try {
        this.saveConfig();
      } catch {
        // ignore persistence issues silently
      }
      warnings.push(
        "Test publishable key detected; switched to test mode automatically",
      );
    }

    // Live key specific validations
    if (isLiveKey) {
      warnings.push(
        "🚀 Live Stripe key detected - Real payments will be processed",
      );
      // Secret key pairing check should only run on the server.
      // In the browser, secret keys are intentionally not exposed.
      if (typeof window === "undefined") {
        if (!this.config.secretKey || !this.config.secretKey.includes("live")) {
          errors.push("Live publishable key requires matching live secret key");
        }
      }

      if (!this.config.webhookSecret) {
        warnings.push("Webhook secret recommended for production payments");
      }
    }

    // Test key specific validations
    if (isTestKey) {
      console.log("🧪 Test mode active - No real charges will be made");
      // If a live secret key is set with a test publishable key, flag as warning
      if (
        typeof window === "undefined" &&
        this.config.secretKey &&
        this.config.secretKey.startsWith("sk_live_")
      ) {
        warnings.push("Live secret key configured with test publishable key");
      }
    }

    // Validate currency format
    if (!/^[A-Z]{3}$/.test(this.config.currency)) {
      errors.push("Currency must be a 3-letter ISO code (e.g., USD, EUR, GBP)");
    }

    // Validate amount ranges
    if (this.config.minimumAmount < 0.5) {
      warnings.push(
        "Minimum amount below $0.50 may not be supported by all payment methods",
      );
    }

    if (this.config.maximumAmount > 999999) {
      warnings.push(
        "Maximum amount above $999,999 may require special approval",
      );
    }

    // Validate payment methods
    const validPaymentMethods = [
      "card",
      "apple_pay",
      "google_pay",
      "link",
      "us_bank_account",
    ];
    const invalidMethods = this.config.supportedPaymentMethods.filter(
      (method) => !validPaymentMethods.includes(method),
    );
    if (invalidMethods.length > 0) {
      warnings.push(
        `Unsupported payment methods: ${invalidMethods.join(", ")}`,
      );
    }

    // Validate URLs
    const urlPattern = /^(https?:\/\/|\/)/;
    if (!urlPattern.test(this.config.defaultSuccessUrl)) {
      errors.push("Default success URL must be a valid URL or path");
    }
    if (!urlPattern.test(this.config.defaultCancelUrl)) {
      errors.push("Default cancel URL must be a valid URL or path");
    }

    // Validate enhanced configurations
    if (
      this.config.locale &&
      !/^[a-z]{2}(-[A-Z]{2})?$/.test(this.config.locale)
    ) {
      warnings.push("Locale should be in format 'en' or 'en-US'");
    }

    if (
      this.config.submitType &&
      !["auto", "book", "donate", "pay"].includes(this.config.submitType)
    ) {
      errors.push("Submit type must be one of: auto, book, donate, pay");
    }

    if (
      this.config.billingAddressCollection &&
      !["auto", "required"].includes(this.config.billingAddressCollection)
    ) {
      errors.push("Billing address collection must be 'auto' or 'required'");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Campaign Management
  getCampaigns(): StripeCampaign[] {
    return Array.from(this.campaigns.values());
  }

  getCampaign(id: string): StripeCampaign | undefined {
    return this.campaigns.get(id);
  }

  // Get all available campaign IDs for debugging
  getCampaignIds(): string[] {
    return Array.from(this.campaigns.keys());
  }

  // Test method to validate fallback behavior
  async testCampaignFallback(campaignId: string): Promise<{
    originalExists: boolean;
    fallbackUsed: boolean;
    campaignUsed: StripeCampaign;
  }> {
    const originalCampaign = this.getCampaign(campaignId);
    const originalExists = !!originalCampaign;

    try {
      const result = await this.createCampaignCheckout({
        campaignId,
        amount: 50,
        successUrl: "/test-success",
        cancelUrl: "/test-cancel",
        metadata: { test: "true" },
      });

      return {
        originalExists,
        fallbackUsed: !originalExists,
        campaignUsed:
          originalCampaign ||
          ({
            id: campaignId,
            name: `Campaign ${campaignId}`,
            description: `Support for ${campaignId}`,
          } as StripeCampaign),
      };
    } catch (error) {
      throw new Error(
        `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  createCampaign(
    campaign: Omit<StripeCampaign, "createdAt" | "updatedAt">,
  ): StripeCampaign {
    const newCampaign: StripeCampaign = {
      ...campaign,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.campaigns.set(campaign.id, newCampaign);
    return newCampaign;
  }

  updateCampaign(
    id: string,
    updates: Partial<StripeCampaign>,
  ): StripeCampaign | null {
    const campaign = this.campaigns.get(id);
    if (!campaign) return null;

    const updatedCampaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  // Plan Management
  initializeDefaultPlans() {
    const defaultPlans: Array<{
      id: string;
      name: string;
      description: string;
      amount: number;
      currency: string;
      interval: "day" | "month" | "year";
      active: boolean;
      campaignId: string;
      stripePriceId?: string;
      createdAt: string;
      updatedAt: string;
    }> = [
      {
        id: "daily-support",
        name: "Daily Support",
        description: "50¢ per day helps provide essential support",
        amount: 0.5,
        currency: "usd",
        interval: "day",
        active: true,
        campaignId: "haiti-relief-membership",
        stripePriceId: "price_1RwDmqDdCPXUlYddrJDwTnCZ",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultPlans.forEach((plan) => {
      this.plans.set(plan.id, plan);
    });
  }

  getPlans(): Array<{
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    interval: "day" | "month" | "year";
    active: boolean;
    campaignId: string;
    stripePriceId?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    return Array.from(this.plans.values());
  }

  getPlan(id: string):
    | {
        id: string;
        name: string;
        description: string;
        amount: number;
        currency: string;
        interval: "day" | "month" | "year";
        active: boolean;
        campaignId: string;
        stripePriceId?: string;
        createdAt: string;
        updatedAt: string;
      }
    | undefined {
    return this.plans.get(id);
  }

  updatePlan(
    id: string,
    updates: Partial<{
      id: string;
      name: string;
      description: string;
      amount: number;
      currency: string;
      interval: "day" | "month" | "year";
      active: boolean;
      campaignId: string;
      stripePriceId?: string;
      createdAt: string;
      updatedAt: string;
    }>,
  ): {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    interval: "day" | "month" | "year";
    active: boolean;
    campaignId: string;
    stripePriceId?: string;
    createdAt: string;
    updatedAt: string;
  } | null {
    const plan = this.plans.get(id);
    if (!plan) return null;

    const updatedPlan = {
      ...plan,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.plans.set(id, updatedPlan);
    return updatedPlan;
  }

  // Sync plans from stripeCampaignSync
  async syncPlans() {
    try {
      console.log("🔄 Syncing plans from API...");

      // Fetch plans from the sync API
      const siteUrl =
        (typeof window !== "undefined" && window.location.origin) ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3003";
      const response = await fetch(`${siteUrl}/api/stripe/sync?action=plans`);
      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error("Failed to fetch plans from sync API");
      }

      const syncedPlans = data.data as Array<{
        id: string;
        name: string;
        description: string;
        amount: number;
        currency: string;
        interval: "day" | "month" | "year";
        active: boolean;
        campaignId: string;
        stripePriceId?: string;
        createdAt: string;
        updatedAt: string;
      }>;
      console.log(
        `📋 Found ${syncedPlans.length} synced plans:`,
        syncedPlans.map((p) => ({
          id: p.id,
          stripePriceId: p.stripePriceId,
        })),
      );

      // Update local plans with synced data
      syncedPlans.forEach((plan) => {
        this.plans.set(plan.id, plan);
      });

      console.log(`✅ Synced ${syncedPlans.length} plans with stripe data`);
      return syncedPlans;
    } catch (error) {
      console.error("Failed to sync plans:", error);
      throw error;
    }
  }

  // Event Management
  getEvents(): StripeEvent[] {
    return Array.from(this.events.values());
  }

  getEvent(id: string): StripeEvent | undefined {
    return this.events.get(id);
  }

  createEvent(event: StripeEvent): StripeEvent {
    this.events.set(event.id, event);
    return event;
  }

  // Payment Processing
  formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  parseAmount(amount: number): number {
    return amount / 100;
  }

  // Create checkout session for campaigns
  async createCampaignCheckout(params: {
    campaignId: string;
    amount?: number;
    recurring?: boolean;
    interval?: "day" | "month" | "year";
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>;
  }): Promise<{ url: string; sessionId: string }> {
    let campaign = this.getCampaign(params.campaignId);

    // Use fallback strategy if campaign not found
    if (!campaign) {
      console.warn(
        `Campaign "${params.campaignId}" not found in stripeEnhanced.createCampaignCheckout, using fallback`,
      );
      console.log("Available campaign IDs:", this.getCampaignIds());

      // Try to find an active campaign as fallback or create a generic one
      const availableCampaigns = this.getCampaigns();
      campaign = availableCampaigns.find((c) => c.status === "active") || {
        id: params.campaignId,
        name: `Campaign ${params.campaignId}`,
        description: `Support for ${params.campaignId}`,
        goal: 10000,
        raised: 0,
        stripePriceIds: [],
        suggestedAmounts: [25, 50, 100, 250],
        currency: "USD",
        allowCustomAmount: true,
        enableRecurring: false,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(`Using fallback campaign: ${campaign.name}`);
    }

    // Simulate checkout session creation
    const sessionId = `cs_${Date.now()}`;
    const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

    // Track analytics
    this.analytics.trackCheckoutCreated({
      sessionId,
      campaignId: params.campaignId,
      amount: params.amount || 0,
      recurring: params.recurring || false,
    });

    return {
      url: checkoutUrl,
      sessionId,
    };
  }

  // Create Stripe Checkout Session
  async createCheckoutSession(params: {
    amount: number;
    campaignId?: string;
    eventId?: string;
    ticketTypeId?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
    mode?: "payment" | "subscription";
    planId?: string;
    priceId?: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ id: string; url: string }> {
    const {
      amount,
      campaignId,
      eventId,
      ticketTypeId,
      customerEmail,
      metadata = {},
      mode = "payment",
      planId,
      priceId,
      successUrl,
      cancelUrl,
    } = params;

    // Check if Stripe is initialized
    if (!this.stripe) {
      throw new Error("Stripe is not initialized. Please check your API keys.");
    }

    try {
      let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      // Handle subscription mode with existing plan or direct price ID
      if (mode === "subscription" && (planId || priceId)) {
        if (priceId) {
          console.log(`💰 Using direct Stripe price ID: ${priceId}`);
          line_items = [
            {
              price: priceId,
              quantity: 1,
            },
          ];
        } else if (planId) {
          console.log(`🔄 Loading subscription plan: ${planId}`);

          // Sync plans to get latest price IDs
          await this.syncPlans();

          const plan = this.plans.get(planId);
          console.log(`📋 Plan found:`, plan);

          if (!plan || !plan.stripePriceId) {
            throw new Error(
              `Plan ${planId} not found or not synced with Stripe. Plan data: ${JSON.stringify(plan)}`,
            );
          }

          console.log(`💰 Using Stripe price ID: ${plan.stripePriceId}`);

          line_items = [
            {
              price: plan.stripePriceId,
              quantity: 1,
            },
          ];
        }
      } else {
        // Handle one-time payment mode
        line_items = [
          {
            price_data: {
              currency: this.config.currency.toLowerCase(),
              product_data: {
                name: campaignId
                  ? `Donation to ${campaignId}`
                  : "General Donation",
                description: campaignId
                  ? `Support for ${campaignId} campaign`
                  : "General donation",
                metadata: {
                  campaignId: campaignId || "",
                  eventId: eventId || "",
                  type: "donation",
                },
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ];
      }

      // Prepare session parameters with enhanced configuration
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items,
        mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
        success_url:
          successUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:
          cancelUrl ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cancel`,
        metadata: {
          ...metadata,
          campaignId: campaignId || "",
          eventId: eventId || "",
          ticketTypeId: ticketTypeId || "",
          planId: planId || "",
        },
        // Enhanced configuration from StripeConfig
        submit_type: this.config.submitType,
        billing_address_collection: this.config.billingAddressCollection,
        phone_number_collection: this.config.phoneNumberCollection
          ? { enabled: true }
          : undefined,
        automatic_tax: this.config.enableAutomaticTax
          ? { enabled: true }
          : undefined,
        shipping_address_collection: this.config.collectShippingAddress
          ? {
              allowed_countries: ["US", "CA", "GB", "AU", "HT"], // Include Haiti for relief donations
            }
          : undefined,
        allow_promotion_codes: this.config.allowPromotionCodes,
        locale: this.config
          .locale as Stripe.Checkout.SessionCreateParams.Locale,
        consent_collection: this.config.consentCollection
          ? {
              terms_of_service:
                this.config.consentCollection.termsOfService === "required"
                  ? ("required" as const)
                  : undefined,
              promotions:
                this.config.consentCollection.promotions === "auto"
                  ? ("auto" as const)
                  : undefined,
            }
          : undefined,
        custom_fields: this.config.customFields?.map((field) => ({
          key: field.key,
          label: { type: "custom" as const, custom: field.label },
          type: field.type,
          optional: field.optional,
        })),
      };

      // Add customer email if provided
      if (customerEmail) {
        sessionParams.customer_email = customerEmail;
      }

      // Create the session
      const session = await this.stripe.checkout.sessions.create(sessionParams);

      // Track session creation
      this.analytics.trackCheckoutCreated({
        sessionId: session.id,
        amount,
        campaignId,
        eventId,
        mode,
      });

      console.log(`✅ Stripe checkout session created: ${session.id}`);

      return {
        id: session.id,
        url: session.url || "",
      };
    } catch (error) {
      console.error("Failed to create Stripe checkout session:", error);
      throw error;
    }
  }

  // Get Stripe Checkout Session
  async getCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    // Check if Stripe is initialized
    if (!this.stripe) {
      throw new Error("Stripe is not initialized. Please check your API keys.");
    }

    try {
      // Retrieve session from Stripe
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "customer"],
      });

      console.log(`✅ Retrieved Stripe checkout session: ${sessionId}`);
      return session;
    } catch (error) {
      console.error("Failed to retrieve Stripe checkout session:", error);
      throw error;
    }
  }

  // Create checkout session for events
  async createEventCheckout(params: {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>;
  }): Promise<{ url: string; sessionId: string }> {
    let event = this.getEvent(params.eventId);

    // Use fallback strategy if event not found
    if (!event) {
      console.warn(
        `Event "${params.eventId}" not found in stripeEnhanced.createEventCheckout, using fallback`,
      );
      console.log(
        "Available events:",
        this.getEvents().map((e) => e.id),
      );

      // Create a fallback event
      event = {
        id: params.eventId,
        name: `Event ${params.eventId}`,
        description: `Tickets for ${params.eventId}`,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        location: "TBD",
        ticketTypes: [
          {
            id: params.ticketTypeId || "general",
            name: "General Admission",
            description: "Standard event ticket",
            price: 25,
            quantity: 100,
            sold: 0,
            maxPerCustomer: 10,
          },
        ],
        stripePriceIds: [],
        maxAttendees: 100,
        currentAttendees: 0,
        status: "active" as const,
      };

      console.log(`Using fallback event: ${event.name}`);
    }

    let ticketType = event.ticketTypes.find(
      (t) => t.id === params.ticketTypeId,
    );

    // Use fallback ticket type if not found
    if (!ticketType) {
      console.warn(
        `Ticket type "${params.ticketTypeId}" not found, using first available or fallback`,
      );

      ticketType = event.ticketTypes[0] || {
        id: params.ticketTypeId || "general",
        name: "General Admission",
        description: "Standard event ticket",
        price: 25,
        quantity: 100,
        sold: 0,
        maxPerCustomer: 10,
      };

      console.log(`Using fallback ticket type: ${ticketType.name}`);
    }

    // In production, this would call Stripe API
    const sessionId = `cs_test_${Date.now()}`;
    const checkoutUrl = `/api/stripe/checkout/${sessionId}`;

    console.log("Creating event checkout:", {
      event: event.name,
      ticketType: ticketType.name,
      quantity: params.quantity,
      sessionId,
    });

    return {
      url: checkoutUrl,
      sessionId,
    };
  }

  // Subscription Management
  async createSubscription(params: {
    campaignId: string;
    amount: number;
    interval: "day" | "month" | "year";
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeSubscription> {
    // In production, this would call Stripe API
    const subscription: StripeSubscription = {
      id: `sub_${Date.now()}`,
      customerId: params.customerId || `cus_${Date.now()}`,
      campaignId: params.campaignId,
      amount: params.amount,
      interval: params.interval,
      status: "active",
      nextPayment: new Date(
        Date.now() +
          (params.interval === "month" ? 30 : 365) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      stripeSubscriptionId: `sub_stripe_${Date.now()}`,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  // Webhook Processing
  async processWebhook(
    payload: Stripe.Event,
    signature: string,
  ): Promise<{
    success: boolean;
    event?: Stripe.Event;
    error?: string;
  }> {
    try {
      // In production, verify webhook signature with Stripe
      console.log("Processing webhook:", payload.type);

      switch (payload.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentSuccess(
            payload.data.object as Stripe.PaymentIntent,
          );
          break;
        case "payment_intent.payment_failed":
          await this.handlePaymentFailure(
            payload.data.object as Stripe.PaymentIntent,
          );
          break;
        case "invoice.payment_succeeded":
          await this.handleSubscriptionPayment(
            payload.data.object as Stripe.Invoice,
          );
          break;
        case "customer.subscription.deleted":
          await this.handleSubscriptionCancellation(
            payload.data.object as Stripe.Subscription,
          );
          break;
        default:
          console.log(`Unhandled webhook event: ${payload.type}`);
      }

      return { success: true, event: payload };
    } catch (error) {
      console.error("Webhook processing error:", error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Webhook Handlers
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const donation: StripeDonation = {
      id: `don_${Date.now()}`,
      amount: this.parseAmount(paymentIntent.amount),
      currency: paymentIntent.currency.toUpperCase(),
      paymentIntentId: paymentIntent.id,
      customerId:
        typeof paymentIntent.customer === "string"
          ? paymentIntent.customer
          : paymentIntent.customer?.id,
      campaignId: paymentIntent.metadata?.campaignId,
      eventId: paymentIntent.metadata?.eventId,
      status: "succeeded",
      metadata: paymentIntent.metadata || {},
      createdAt: new Date().toISOString(),
    };

    this.donations.set(donation.id, donation);

    // Update campaign raised amount
    if (donation.campaignId) {
      const campaign = this.getCampaign(donation.campaignId);
      if (campaign) {
        this.updateCampaign(donation.campaignId, {
          raised: campaign.raised + donation.amount,
        });
      }
    }

    console.log("Payment succeeded:", donation);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    console.log("Payment failed:", paymentIntent.id);
    // Handle failed payment logic
  }

  private async handleSubscriptionPayment(invoice: Stripe.Invoice) {
    console.log("Subscription payment succeeded:", invoice.id);
    // Handle recurring payment logic
  }

  private async handleSubscriptionCancellation(
    subscription: Stripe.Subscription,
  ) {
    console.log("Subscription cancelled:", subscription.id);
    // Handle subscription cancellation logic
  }

  // Analytics
  getDonationStats(): {
    totalDonations: number;
    totalAmount: number;
    totalDonors: number;
    averageDonation: number;
  } {
    const donations = Array.from(this.donations.values());
    const succeededDonations = donations.filter(
      (d) => d.status === "succeeded",
    );

    const totalDonations = succeededDonations.length;
    const totalAmount = succeededDonations.reduce(
      (sum, d) => sum + d.amount,
      0,
    );
    const uniqueDonors = new Set(
      succeededDonations.map((d) => d.customerId).filter(Boolean),
    ).size;
    const averageDonation =
      totalDonations > 0 ? totalAmount / totalDonations : 0;

    return {
      totalDonations,
      totalAmount,
      totalDonors: uniqueDonors,
      averageDonation,
    };
  }

  // Test mode helpers
  getTestCards(): { [key: string]: string } {
    return {
      visa: "4242424242424242",
      visaDebit: "4000056655665556",
      mastercard: "5555555555554444",
      amex: "378282246310005",
      declined: "4000000000000002",
      insufficientFunds: "4000000000009995",
    };
  }
}

// Lazy initialization to prevent build-time failures
let stripeEnhancedInstance: EnhancedStripeService | null = null;

export function getStripeEnhanced(): EnhancedStripeService | null {
  const isBrowser = typeof window !== "undefined";

  // On the server, ensure secret key is configured; on the client, allow usage
  if (!isBrowser) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey === "your_stripe_secret_key_here") {
      return null;
    }
  }

  // Create instance only when needed
  if (!stripeEnhancedInstance) {
    stripeEnhancedInstance = new EnhancedStripeService();

    // Load configuration on initialization (only in browser)
    if (isBrowser) {
      stripeEnhancedInstance.loadConfig();
    }
  }

  return stripeEnhancedInstance;
}

// Export default getter function
export default getStripeEnhanced;
