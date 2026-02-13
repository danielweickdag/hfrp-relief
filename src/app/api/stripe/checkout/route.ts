import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";
import { getStripeAutomation } from "@/lib/stripeAutomation";

export async function POST(request: NextRequest) {
  try {
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

    // Special handling for "Daily Hope" plan
    // Frontend sends 0.50 / day, but we want to bill $15.00 / month
    let finalAmount = amount;
    let finalInterval = interval;

    if (recurring && Math.abs(amount - 0.50) < 0.01 && interval === "day") {
      console.log(
        "Converting Daily Hope plan ($0.50/day) to Monthly billing ($15.00/month)",
      );
      finalAmount = 15.00;
      finalInterval = "month";
    }

    // Get the config manager instance
    const stripeConfigManager = getStripeConfigManager();
    const isTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";
    let isValid = false;
    let validationErrors: string[] = [];

    if (stripeConfigManager) {
      // Use the new config manager for validation
      const validation = await stripeConfigManager.validateConfiguration();
      isValid = validation.isValid;
      validationErrors = validation.errors;
    } else {
      validationErrors = ["Stripe service is not initialized"];
    }

    // Handle configuration failures with Mock Mode fallback
    if (!isValid) {
      if (isTestMode) {
        console.warn(
          "⚠️ Stripe configuration invalid, falling back to MOCK mode for testing.",
        );
        console.warn("Validation errors:", validationErrors);

        const origin = new URL(request.url).origin;
        const mockSuccessUrl =
          typeof successUrl === "string" && successUrl.length > 0
            ? successUrl
            : `${origin}/donation/success?session_id=mock_session_${Date.now()}&campaign=${encodeURIComponent(
                campaignId || "general",
              )}&amount=${encodeURIComponent(String(finalAmount))}&mock=true`;

        // Return a mock response that simulates a successful session creation
        // This redirects the user directly to the success page
        return NextResponse.json({
          url: mockSuccessUrl,
          id: `cs_mock_${Date.now()}`,
          automationEnabled: false,
          donationType: recurring ? "recurring" : "one_time",
          mock: true,
        });
      }

      // If not in test mode, return the actual error
      return NextResponse.json(
        {
          error: "Stripe is not properly configured",
          details: validationErrors,
        },
        { status: 503 },
      );
    }

    // --- Real Stripe Logic ---
    // If we are here, configuration is valid

    const stripe = stripeConfigManager?.getStripeInstance();
    if (!stripe) {
      return NextResponse.json(
        { error: "Failed to initialize Stripe instance" },
        { status: 503 },
      );
    }

    // Ensure a Customer object exists to avoid "missing customer" errors in Test Mode
    // This is often required for certain payment methods or configurations like tax calculation
    let customerId: string | undefined;
    /*
    // DISABLED: Do not pre-create guest customers. Let Stripe handle customer creation.
    try {
      // Create a guest customer for this session if one doesn't exist
      // In a real app, you would look this up from your database or auth system
      const customer = await stripe.customers.create({
        email: "guest@example.com", // Default for guest checkout
        name: "Guest Donor",
        metadata: {
          source: "checkout_api_guest",
        },
      });
      customerId = customer.id;
      console.log("Created guest customer:", customerId);
    } catch (e) {
      console.warn("Failed to create guest customer, proceeding without one:", e);
    }
    */

    const origin = new URL(request.url).origin;
    const resolvedSuccessUrl =
      typeof successUrl === "string" && successUrl.length > 0
        ? successUrl
        : `${origin}/donation/success?session_id={CHECKOUT_SESSION_ID}&campaign=${encodeURIComponent(
            campaignId || "general",
          )}&amount=${encodeURIComponent(String(finalAmount))}`;
    const resolvedCancelUrl =
      typeof cancelUrl === "string" && cancelUrl.length > 0
        ? cancelUrl
        : `${origin}/donation/cancelled?campaign=${encodeURIComponent(
            campaignId || "general",
          )}`;

    const unitAmount = Math.round(finalAmount * 100);

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
        interval: finalInterval,
        interval_count: 1,
      };
    }

    // Use automation system for enhanced donation creation
    const stripeAutomation = getStripeAutomation();
    if (!stripeAutomation) {
      // Fallback if automation is not available but basic stripe is working
      console.warn("Stripe automation not available, using basic session creation");
    }

    let session: Stripe.Checkout.Session;

    if (isRecurring && stripeAutomation) {
      // Create recurring donation using automation
      // Note: createRecurringDonation expects an integer amount in cents if using unit_amount in price creation
      // However, the function signature and internal usage needs careful handling.
      // Based on stripeAutomation.ts, it passes unit_amount directly.
      // We already calculated unitAmount = Math.round(amount * 100).
      
      const donation = await stripeAutomation.createRecurringDonation({
        amount: unitAmount, // Pass amount in cents
        currency,
        interval: finalInterval,
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
        // customer: customerId, // Let Stripe create the customer
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
    } else if (!isRecurring && stripeAutomation) {
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
        // customer: customerId, // Let Stripe create the customer
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
    } else {
      // Basic fallback without automation
      session = await stripe.checkout.sessions.create({
        mode: isRecurring ? "subscription" : "payment",
        payment_method_types: ["card"],
        // customer: customerId, // Let Stripe create the customer
        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],
        locale: "auto",
        success_url: resolvedSuccessUrl,
        cancel_url: resolvedCancelUrl,
        metadata: {
          ...(campaignId ? { campaignId } : {}),
          donation_type: isRecurring ? "recurring" : "one_time",
          ...metadata,
        },
      });
    }

    return NextResponse.json({
      url: session.url,
      id: session.id,
      automationEnabled: !!stripeAutomation,
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
