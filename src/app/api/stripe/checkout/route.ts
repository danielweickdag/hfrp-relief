import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";
import { getStripeAutomation } from "@/lib/stripeAutomation";

export async function POST(request: NextRequest) {
  try {
    // Get the config manager instance
    const stripeConfigManager = getStripeConfigManager();
    if (!stripeConfigManager) {
      return NextResponse.json(
        { error: "Stripe service is not configured" },
        { status: 503 },
      );
    }

    // Use the new config manager for validation
    const validation = await stripeConfigManager.validateConfiguration();
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Stripe is not properly configured",
          details: validation.errors,
        },
        { status: 503 },
      );
    }

    const stripe = stripeConfigManager.getStripeInstance();
    if (!stripe) {
      return NextResponse.json(
        { error: "Failed to initialize Stripe instance" },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      amount,
      campaignId,
      recurring,
      interval = "month",
      successUrl,
      cancelUrl,
      metadata = {},
      currency = "usd",
    } = body as {
      amount?: number;
      campaignId?: string;
      recurring?: boolean;
      interval?: "day" | "week" | "month" | "year";
      successUrl?: string;
      cancelUrl?: string;
      metadata?: Record<string, string>;
      currency?: string;
    };

    if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const resolvedSuccessUrl =
      typeof successUrl === "string" && successUrl.length > 0
        ? successUrl
        : `${origin}/donation/success?session_id={CHECKOUT_SESSION_ID}&campaign=${encodeURIComponent(
            campaignId || "general",
          )}&amount=${encodeURIComponent(String(amount))}`;
    const resolvedCancelUrl =
      typeof cancelUrl === "string" && cancelUrl.length > 0
        ? cancelUrl
        : `${origin}/donation/cancelled?campaign=${encodeURIComponent(
            campaignId || "general",
          )}`;

    const unitAmount = Math.round(amount * 100);

    // Build line item price_data
    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency,
      unit_amount: unitAmount,
      product_data: {
        name: campaignId ? `Donation to ${campaignId}` : "HFRP Donation",
      },
    };

    // If recurring, add subscription details
    const isRecurring = !!recurring;
    if (isRecurring) {
      priceData.recurring = {
        interval,
        interval_count: 1,
      };
    }

    // Use automation system for enhanced donation creation
    const stripeAutomation = getStripeAutomation();
    if (!stripeAutomation) {
      return NextResponse.json(
        { error: "Stripe automation service is not available" },
        { status: 503 },
      );
    }

    let session: Stripe.Checkout.Session;

    if (isRecurring) {
      // Create recurring donation using automation
      const donation = await stripeAutomation.createRecurringDonation({
        amount: unitAmount,
        currency,
        interval,
        donorEmail: "checkout@pending.com", // Placeholder - will be updated after checkout
        campaignId: campaignId || "general",
        metadata: {
          ...metadata,
          source: "checkout_api",
          email_pending: "true",
        },
      });

      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: donation.priceId,
            quantity: 1,
          },
        ],
        locale: "auto",
        success_url: resolvedSuccessUrl,
        cancel_url: resolvedCancelUrl,
        allow_promotion_codes: true,
        automatic_tax: {
          enabled: process.env.AUTO_CALCULATE_TAX === "true",
        },
        tax_id_collection: {
          enabled: false, // Typically not needed for charitable donations
        },
        metadata: {
          ...(campaignId ? { campaignId } : {}),
          donation_type: "recurring",
          automation_id: donation.id,
          tax_exempt: process.env.TAX_EXEMPT_STATUS || "true",
          tax_deductible: process.env.TAX_DEDUCTIBLE_DONATIONS || "true",
          ...metadata,
        },
      });
    } else {
      // Create one-time donation using automation
      const donation = await stripeAutomation.createOneTimeDonation({
        amount: unitAmount,
        currency,
        donorEmail: "checkout@pending.com", // Placeholder - will be updated after checkout
        campaignId: campaignId || "general",
        metadata: {
          ...metadata,
          source: "checkout_api",
          email_pending: "true",
        },
      });

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],
        locale: "auto",
        success_url: resolvedSuccessUrl,
        cancel_url: resolvedCancelUrl,
        allow_promotion_codes: true,
        automatic_tax: {
          enabled: process.env.AUTO_CALCULATE_TAX === "true",
        },
        tax_id_collection: {
          enabled: false, // Typically not needed for charitable donations
        },
        metadata: {
          ...(campaignId ? { campaignId } : {}),
          donation_type: "one_time",
          automation_id: donation.id,
          tax_exempt: process.env.TAX_EXEMPT_STATUS || "true",
          tax_deductible: process.env.TAX_DEDUCTIBLE_DONATIONS || "true",
          ...metadata,
        },
      });
    }

    return NextResponse.json({
      url: session.url,
      id: session.id,
      automationEnabled: true,
      donationType: isRecurring ? "recurring" : "one_time",
    });
  } catch (error) {
    console.error("Stripe checkout POST error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Stripe checkout endpoint ready",
  });
}
