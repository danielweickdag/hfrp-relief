// Enhanced Stripe Configuration Manager
import Stripe from "stripe";

export interface StripeEnvironmentConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  testMode: boolean;
  environment: "development" | "staging" | "production";
}

export interface StripeAutomationConfig {
  enableAutoRetry: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
  enableWebhookValidation: boolean;
  enableRealTimeSync: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  autoCreateCustomers: boolean;
  autoSendReceipts: boolean;
  enableSubscriptionManagement: boolean;
}

export interface StripeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  configStatus: {
    secretKey: boolean;
    publishableKey: boolean;
    webhookSecret: boolean;
    testMode: boolean;
    apiConnection: boolean;
  };
}

class StripeConfigManager {
  private config: StripeEnvironmentConfig;
  private automationConfig: StripeAutomationConfig;
  private stripe: Stripe | null = null;
  private isInitialized = false;

  constructor() {
    this.config = this.loadEnvironmentConfig();
    this.automationConfig = this.loadAutomationConfig();
    this.initializeStripe();
  }

  private loadEnvironmentConfig(): StripeEnvironmentConfig {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    const testModeFlag = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";
    // Prefer choosing a secret that matches the current publishable key mode
    const webhookSecret = (() => {
      const testSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST || "";
      const liveSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE || "";
      const defaultSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
      if (publishableKey.startsWith("pk_live_"))
        return liveSecret || defaultSecret;
      if (publishableKey.startsWith("pk_test_"))
        return testSecret || defaultSecret;
      // Fallback to flag when key prefix is ambiguous
      return testModeFlag
        ? testSecret || defaultSecret
        : liveSecret || defaultSecret;
    })();

    return {
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      publishableKey,
      webhookSecret,
      testMode: testModeFlag,
      environment:
        (process.env.NODE_ENV as "development" | "staging" | "production") ||
        "development",
    };
  }

  private loadAutomationConfig(): StripeAutomationConfig {
    return {
      enableAutoRetry: process.env.STRIPE_AUTO_RETRY !== "false",
      maxRetryAttempts: Number.parseInt(process.env.STRIPE_MAX_RETRIES || "3"),
      retryDelayMs: Number.parseInt(process.env.STRIPE_RETRY_DELAY || "1000"),
      enableWebhookValidation:
        process.env.STRIPE_WEBHOOK_VALIDATION !== "false",
      enableRealTimeSync: process.env.STRIPE_REALTIME_SYNC !== "false",
      enableAnalytics: process.env.STRIPE_ANALYTICS !== "false",
      enableErrorReporting: process.env.STRIPE_ERROR_REPORTING !== "false",
      autoCreateCustomers: process.env.STRIPE_AUTO_CREATE_CUSTOMERS !== "false",
      autoSendReceipts: process.env.STRIPE_AUTO_SEND_RECEIPTS !== "false",
      enableSubscriptionManagement:
        process.env.STRIPE_SUBSCRIPTION_MANAGEMENT !== "false",
    };
  }

  private initializeStripe(): void {
    if (
      this.config.secretKey &&
      this.config.secretKey !== "your_stripe_secret_key_here"
    ) {
      try {
        this.stripe = new Stripe(this.config.secretKey, {
          typescript: true,
        });
        this.isInitialized = true;
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
        this.isInitialized = false;
      }
    }
  }

  public async validateConfiguration(): Promise<StripeValidationResult> {
    const result: StripeValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      configStatus: {
        secretKey: false,
        publishableKey: false,
        webhookSecret: false,
        testMode: this.config.testMode,
        apiConnection: false,
      },
    };

    // Validate secret key
    if (!this.config.secretKey) {
      result.errors.push("STRIPE_SECRET_KEY is not configured");
      result.isValid = false;
    } else if (this.config.secretKey === "your_stripe_secret_key_here") {
      result.errors.push("STRIPE_SECRET_KEY contains placeholder value");
      result.isValid = false;
    } else {
      result.configStatus.secretKey = true;

      // Validate key format
      const expectedPrefix = this.config.testMode ? "sk_test_" : "sk_live_";
      if (!this.config.secretKey.startsWith(expectedPrefix)) {
        result.warnings.push(
          `Secret key should start with ${expectedPrefix} for ${this.config.testMode ? "test" : "live"} mode`,
        );
      }
    }

    // Validate publishable key
    if (!this.config.publishableKey) {
      result.errors.push(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured",
      );
      result.isValid = false;
    } else if (
      this.config.publishableKey === "your_stripe_publishable_key_here"
    ) {
      result.errors.push(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY contains placeholder value",
      );
      result.isValid = false;
    } else {
      result.configStatus.publishableKey = true;

      // Validate key format
      const expectedPrefix = this.config.testMode ? "pk_test_" : "pk_live_";
      if (!this.config.publishableKey.startsWith(expectedPrefix)) {
        result.warnings.push(
          `Publishable key should start with ${expectedPrefix} for ${this.config.testMode ? "test" : "live"} mode`,
        );
      }
    }

    // Validate webhook secret
    if (!this.config.webhookSecret) {
      result.warnings.push(
        "STRIPE_WEBHOOK_SECRET is not configured - webhooks will not work",
      );
    } else if (this.config.webhookSecret.startsWith("whsec_")) {
      result.configStatus.webhookSecret = true;
    } else {
      result.warnings.push(
        "STRIPE_WEBHOOK_SECRET format appears invalid (should start with whsec_)",
      );
    }

    // Test API connection
    if (this.stripe && result.configStatus.secretKey) {
      try {
        await this.stripe.balance.retrieve();
        result.configStatus.apiConnection = true;
      } catch (error) {
        result.errors.push(
          `Stripe API connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        result.isValid = false;
      }
    }

    // Add suggestions
    if (this.config.testMode && this.config.environment === "production") {
      result.suggestions.push(
        "Consider disabling test mode for production environment",
      );
    }

    if (!this.config.testMode && this.config.environment === "development") {
      result.suggestions.push(
        "Consider enabling test mode for development environment",
      );
    }

    if (!this.automationConfig.enableWebhookValidation) {
      result.suggestions.push("Enable webhook validation for better security");
    }

    return result;
  }

  public getStripeInstance(): Stripe | null {
    return this.stripe;
  }

  public getConfig(): StripeEnvironmentConfig {
    return { ...this.config };
  }

  public getAutomationConfig(): StripeAutomationConfig {
    return { ...this.automationConfig };
  }

  public isConfigured(): boolean {
    return (
      this.isInitialized &&
      this.config.secretKey !== "" &&
      this.config.secretKey !== "your_stripe_secret_key_here" &&
      this.config.publishableKey !== "" &&
      this.config.publishableKey !== "your_stripe_publishable_key_here"
    );
  }

  public async updateConfiguration(
    updates: Partial<StripeEnvironmentConfig>,
  ): Promise<void> {
    this.config = { ...this.config, ...updates };

    if (updates.secretKey) {
      this.initializeStripe();
    }
  }

  public async testWebhookEndpoint(
    webhookUrl: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      return { success: false, error: "Stripe not initialized" };
    }

    try {
      // Create a test webhook endpoint
      const endpoint = await this.stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: ["payment_intent.succeeded"],
        description: "Test endpoint for validation",
      });

      // Clean up test endpoint
      await this.stripe.webhookEndpoints.del(endpoint.id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public generateConfigReport(): string {
    const report = [
      "=== Stripe Configuration Report ===",
      `Environment: ${this.config.environment}`,
      `Test Mode: ${this.config.testMode ? "Enabled" : "Disabled"}`,
      `Initialized: ${this.isInitialized ? "Yes" : "No"}`,
      `Configured: ${this.isConfigured() ? "Yes" : "No"}`,
      "",
      "=== Configuration Status ===",
      `Secret Key: ${this.config.secretKey ? (this.config.secretKey === "your_stripe_secret_key_here" ? "Placeholder" : "Configured") : "Missing"}`,
      `Publishable Key: ${this.config.publishableKey ? (this.config.publishableKey === "your_stripe_publishable_key_here" ? "Placeholder" : "Configured") : "Missing"}`,
      `Webhook Secret: ${this.config.webhookSecret ? "Configured" : "Missing"}`,
      "",
      "=== Automation Features ===",
      `Auto Retry: ${this.automationConfig.enableAutoRetry ? "Enabled" : "Disabled"}`,
      `Webhook Validation: ${this.automationConfig.enableWebhookValidation ? "Enabled" : "Disabled"}`,
      `Real-time Sync: ${this.automationConfig.enableRealTimeSync ? "Enabled" : "Disabled"}`,
      `Analytics: ${this.automationConfig.enableAnalytics ? "Enabled" : "Disabled"}`,
      `Auto Customer Creation: ${this.automationConfig.autoCreateCustomers ? "Enabled" : "Disabled"}`,
      `Auto Receipt Sending: ${this.automationConfig.autoSendReceipts ? "Enabled" : "Disabled"}`,
      `Subscription Management: ${this.automationConfig.enableSubscriptionManagement ? "Enabled" : "Disabled"}`,
    ];

    return report.join("\n");
  }
}

// Lazy singleton instance
let stripeConfigManagerInstance: StripeConfigManager | null = null;

export function getStripeConfigManager(): StripeConfigManager | null {
  // Return null if required environment variables are not available (e.g., in CI)
  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "your_stripe_secret_key_here"
  ) {
    return null;
  }

  if (!stripeConfigManagerInstance) {
    stripeConfigManagerInstance = new StripeConfigManager();
  }

  return stripeConfigManagerInstance;
}

// For backward compatibility, export the lazy getter as default
export default getStripeConfigManager;
