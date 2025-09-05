// Stripe configuration for donations

export interface StripeConfig {
  publishableKey: string;
  secretKey?: string; // Only for server-side
  webhookSecret?: string;
  currency: string;
  country: string;
  isTestMode: boolean;
}

// Default Stripe configuration
const defaultConfig: StripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  currency: "usd",
  country: "US",
  isTestMode: true,
};

class StripeService {
  private config: StripeConfig;

  constructor(config: StripeConfig = defaultConfig) {
    this.config = config;
  }

  // Get Stripe configuration
  getConfig(): StripeConfig {
    return this.config;
  }

  // Update configuration
  updateConfig(updates: Partial<StripeConfig>) {
    this.config = { ...this.config, ...updates };
    // Save to localStorage for persistence
    localStorage.setItem("hfrp_stripe_config", JSON.stringify(this.config));
  }

  // Load configuration from storage
  loadConfig() {
    const stored = localStorage.getItem("hfrp_stripe_config");
    if (stored) {
      try {
        this.config = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to load Stripe config:", error);
      }
    }
  }

  // Validate configuration
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.publishableKey) {
      errors.push("Stripe publishable key is required");
    }

    if (!this.config.publishableKey.startsWith("pk_")) {
      errors.push("Invalid Stripe publishable key format");
    }

    if (
      this.config.isTestMode &&
      !this.config.publishableKey.includes("test")
    ) {
      errors.push("Test mode enabled but using live key");
    }

    if (
      !this.config.isTestMode &&
      this.config.publishableKey.includes("test")
    ) {
      errors.push("Live mode enabled but using test key");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Format amount for Stripe (convert to cents)
  formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  // Parse amount from Stripe (convert from cents)
  parseAmount(amount: number): number {
    return amount / 100;
  }

  // Get donation amounts
  getDonationAmounts(): number[] {
    return [10, 25, 50, 100, 250, 500];
  }

  // Create payment intent (mock for client-side)
  async createPaymentIntent(
    amount: number,
    metadata?: Record<string, string>,
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    // In production, this would be a server-side API call
    console.log("Creating payment intent for amount:", amount, metadata);

    // Mock response
    return {
      clientSecret: `pi_mock_${Date.now()}_secret`,
      paymentIntentId: `pi_mock_${Date.now()}`,
    };
  }

  // Process webhook (mock for client-side)
  async processWebhook(
    payload: any,
    signature: string,
  ): Promise<{
    success: boolean;
    event?: any;
    error?: string;
  }> {
    // In production, this would be server-side webhook processing
    console.log("Processing webhook:", payload, signature);

    return {
      success: true,
      event: payload,
    };
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Load configuration on initialization
if (typeof window !== "undefined") {
  stripeService.loadConfig();
}
