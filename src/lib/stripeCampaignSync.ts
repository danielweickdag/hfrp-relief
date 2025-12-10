// Stripe Campaign and Plan Sync Service
// Automatically syncs campaigns and subscription plans with Stripe

import Stripe from "stripe";
import {
  getStripeEnhanced,
  type StripeCampaign,
  StripeEvent,
} from "./stripeEnhanced";

export interface StripePlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  intervalCount?: number;
  trialPeriodDays?: number;
  stripeProductId?: string;
  stripePriceId?: string;
  active: boolean;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  campaigns: StripeCampaign[];
  plans: StripePlan[];
  products: Stripe.Product[];
  prices: Stripe.Price[];
}

class StripeCampaignSync {
  private stripe: Stripe;
  private plans: Map<string, StripePlan> = new Map();

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }

    this.stripe = new Stripe(secretKey);

    this.initializePlans();
  }

  private initializePlans() {
    // Default membership plans
    const defaultPlans: StripePlan[] = [
      {
        id: "basic-monthly",
        name: "Basic Monthly Support",
        description: "16¢ per day helps provide clean water",
        amount: 4.8,
        currency: "usd",
        interval: "month",
        active: true,
        campaignId: "haiti-relief-membership",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "standard-monthly",
        name: "Standard Monthly Support",
        description: "50¢ per day provides meals & education",
        amount: 15.0,
        currency: "usd",
        interval: "month",
        active: true,
        campaignId: "haiti-relief-membership",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "premium-monthly",
        name: "Premium Monthly Support",
        description: "$1.67 per day supports entire families",
        amount: 50.0,
        currency: "usd",
        interval: "month",
        active: true,
        campaignId: "haiti-relief-membership",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "basic-annual",
        name: "Basic Annual Support",
        description: "Annual basic support with 10% savings",
        amount: 51.84,
        currency: "usd",
        interval: "year",
        active: true,
        campaignId: "haiti-relief-membership",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "standard-annual",
        name: "Standard Annual Support",
        description: "Annual standard support with 10% savings",
        amount: 162.0,
        currency: "usd",
        interval: "year",
        active: true,
        campaignId: "haiti-relief-membership",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "premium-annual",
        name: "Premium Annual Support",
        description: "Annual premium support with 10% savings",
        amount: 540.0,
        currency: "usd",
        interval: "year",
        active: true,
        campaignId: "haiti-relief-membership",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultPlans.forEach((plan) => {
      this.plans.set(plan.id, plan);
    });
  }

  // Get all plans
  getPlans(): StripePlan[] {
    return Array.from(this.plans.values());
  }

  // Get plan by ID
  getPlan(id: string): StripePlan | undefined {
    return this.plans.get(id);
  }

  // Create or update plan
  createPlan(plan: Omit<StripePlan, "createdAt" | "updatedAt">): StripePlan {
    const newPlan: StripePlan = {
      ...plan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.plans.set(plan.id, newPlan);
    return newPlan;
  }

  // Sync all campaigns and plans with Stripe
  async syncWithStripe(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      errors: [],
      campaigns: [],
      plans: [],
      products: [],
      prices: [],
    };

    try {
      console.log("🔄 Starting Stripe campaign and plan sync...");

      // Step 1: Sync campaigns as products
      const stripeEnhanced = getStripeEnhanced();
      if (!stripeEnhanced) {
        throw new Error("StripeEnhanced not available");
      }
      const campaigns = stripeEnhanced.getCampaigns();
      for (const campaign of campaigns) {
        try {
          const product = await this.syncCampaignAsProduct(campaign);
          result.products.push(product);
          result.campaigns.push(campaign);
          result.synced++;
        } catch (error) {
          const errorMsg = `Failed to sync campaign ${campaign.id}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Step 2: Sync plans as prices
      const plans = this.getPlans();
      for (const plan of plans) {
        try {
          const price = await this.syncPlanAsPrice(plan);
          result.prices.push(price);
          result.plans.push(plan);
          result.synced++;
        } catch (error) {
          const errorMsg = `Failed to sync plan ${plan.id}: ${error}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      // Step 3: Create one-time donation products and prices
      await this.createOneTimeDonationProducts(result);

      result.success = result.errors.length === 0;

      if (result.success) {
        console.log(
          `✅ Sync completed successfully! Synced ${result.synced} items.`,
        );
      } else {
        console.warn(`⚠️ Sync completed with ${result.errors.length} errors.`);
      }

      return result;
    } catch (error) {
      console.error("❌ Sync failed:", error);
      result.errors.push(`Sync failed: ${error}`);
      return result;
    }
  }

  // Sync campaign as Stripe product
  private async syncCampaignAsProduct(
    campaign: StripeCampaign,
  ): Promise<Stripe.Product> {
    try {
      // Check if product already exists
      if (campaign.stripeProductId) {
        try {
          const existingProduct = await this.stripe.products.retrieve(
            campaign.stripeProductId,
          );
          console.log(`📦 Product already exists for campaign ${campaign.id}`);
          return existingProduct;
        } catch (error) {
          console.log(
            `🔄 Product not found, creating new one for campaign ${campaign.id}`,
          );
        }
      }

      // Create new product
      const product = await this.stripe.products.create({
        name: campaign.name,
        description: campaign.description,
        metadata: {
          campaignId: campaign.id,
          goal: campaign.goal.toString(),
          raised: campaign.raised.toString(),
          type: "campaign",
        },
        active: campaign.status === "active",
      });

      // Update campaign with Stripe product ID
      const stripeEnhanced = getStripeEnhanced();
      if (stripeEnhanced) {
        stripeEnhanced.updateCampaign(campaign.id, {
          stripeProductId: product.id,
        });
      }

      console.log(
        `✅ Created Stripe product ${product.id} for campaign ${campaign.id}`,
      );
      return product;
    } catch (error) {
      throw new Error(`Failed to sync campaign ${campaign.id}: ${error}`);
    }
  }

  // Sync plan as Stripe price
  private async syncPlanAsPrice(plan: StripePlan): Promise<Stripe.Price> {
    try {
      // Check if price already exists
      if (plan.stripePriceId) {
        try {
          const existingPrice = await this.stripe.prices.retrieve(
            plan.stripePriceId,
          );
          console.log(`💰 Price already exists for plan ${plan.id}`);
          return existingPrice;
        } catch (error) {
          console.log(
            `🔄 Price not found, creating new one for plan ${plan.id}`,
          );
        }
      }

      // Get or create product for the plan's campaign
      let productId = plan.stripeProductId;

      if (!productId && plan.campaignId) {
        const stripeEnhanced = getStripeEnhanced();
        if (stripeEnhanced) {
          const campaign = stripeEnhanced.getCampaign(plan.campaignId);
          if (campaign) {
            const product = await this.syncCampaignAsProduct(campaign);
            productId = product.id;
          }
        }
      }

      if (!productId) {
        // Create a generic product for standalone plans
        const product = await this.stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            planId: plan.id,
            type: "subscription",
          },
        });
        productId = product.id;
      }

      // Create recurring price
      const price = await this.stripe.prices.create({
        unit_amount: Math.round(plan.amount * 100), // Convert to cents
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
          interval_count: plan.intervalCount || 1,
        },
        product: productId,
        metadata: {
          planId: plan.id,
          campaignId: plan.campaignId || "",
        },
      });

      // Update plan with Stripe price ID
      plan.stripePriceId = price.id;
      plan.stripeProductId = productId;
      plan.updatedAt = new Date().toISOString();
      this.plans.set(plan.id, plan);

      console.log(`✅ Created Stripe price ${price.id} for plan ${plan.id}`);
      return price;
    } catch (error) {
      throw new Error(`Failed to sync plan ${plan.id}: ${error}`);
    }
  }

  // Create one-time donation products and prices
  private async createOneTimeDonationProducts(result: SyncResult) {
    const donationAmounts = [5, 10, 15, 25, 50, 100, 250, 500];

    // Create main donation product
    const donationProduct = await this.stripe.products.create({
      name: "Haiti Relief Donation",
      description: "One-time donation to support families in Haiti",
      metadata: {
        type: "one-time-donation",
        campaignId: "haiti-relief-main",
      },
    });

    result.products.push(donationProduct);

    // Create prices for different amounts
    for (const amount of donationAmounts) {
      try {
        const price = await this.stripe.prices.create({
          unit_amount: amount * 100, // Convert to cents
          currency: "usd",
          product: donationProduct.id,
          metadata: {
            amount: amount.toString(),
            type: "one-time-donation",
          },
        });

        result.prices.push(price);
        console.log(`✅ Created one-time donation price $${amount}`);
      } catch (error) {
        console.error(`❌ Failed to create price for $${amount}:`, error);
        result.errors.push(`Failed to create price for $${amount}: ${error}`);
      }
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    lastSync: string;
    totalCampaigns: number;
    totalPlans: number;
    stripeProducts: number;
    stripePrices: number;
  }> {
    try {
      const products = await this.stripe.products.list({ limit: 100 });
      const prices = await this.stripe.prices.list({ limit: 100 });

      const stripeEnhanced = getStripeEnhanced();
      return {
        lastSync: new Date().toISOString(),
        totalCampaigns: stripeEnhanced
          ? stripeEnhanced.getCampaigns().length
          : 0,
        totalPlans: this.getPlans().length,
        stripeProducts: products.data.length,
        stripePrices: prices.data.length,
      };
    } catch (error) {
      throw new Error(`Failed to get sync status: ${error}`);
    }
  }

  // Auto-sync function (can be called periodically)
  async autoSync(): Promise<void> {
    try {
      console.log("🤖 Running auto-sync...");
      const result = await this.syncWithStripe();

      // Save sync report
      const report = {
        timestamp: new Date().toISOString(),
        result,
        status: result.success ? "success" : "partial",
      };

      // You could save this to a database or file
      console.log("📊 Auto-sync report:", JSON.stringify(report, null, 2));
    } catch (error) {
      console.error("❌ Auto-sync failed:", error);
    }
  }
}

// Lazy initialization to prevent build-time failures
let stripeCampaignSyncInstance: StripeCampaignSync | null = null;

export function getStripeCampaignSync(): StripeCampaignSync | null {
  // Return null if STRIPE_SECRET_KEY is not set or is a placeholder
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "your_stripe_secret_key_here") {
    return null;
  }

  // Create instance only when needed and environment is properly configured
  if (!stripeCampaignSyncInstance) {
    stripeCampaignSyncInstance = new StripeCampaignSync();
  }

  return stripeCampaignSyncInstance;
}

// Export default getter function
export default getStripeCampaignSync;
