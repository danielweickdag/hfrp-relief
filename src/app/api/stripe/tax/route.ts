import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || (apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false)) {
      return NextResponse.json({ success: false, error: "Stripe API key not configured" }, { status: 503 });
    }
    const stripe = new Stripe(apiKey);
    // Get current tax settings
    const taxSettings = await stripe.tax.settings.retrieve();

    return NextResponse.json({
      success: true,
      taxSettings,
      configured: taxSettings.status === "active",
      message:
        taxSettings.status === "pending"
          ? "Tax settings are pending - head office configuration required"
          : "Tax settings are active",
    });
  } catch (error) {
    console.error("Failed to retrieve tax settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve tax settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || (apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false)) {
      return NextResponse.json({ success: false, error: "Stripe API key not configured" }, { status: 503 });
    }
    const stripe = new Stripe(apiKey);
    const {
      amount,
      currency = "usd",
      donationType,
      customerEmail,
      customerDetails,
    } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
        { status: 400 },
      );
    }

    // Default customer details for tax calculation
    const defaultCustomerDetails = {
      address: {
        line1: "123 Main St",
        city: "Boston",
        state: "MA",
        postal_code: "02101",
        country: "US",
      },
      address_source: "billing" as const,
    };

    // For charitable donations, we typically set them as tax-exempt
    // But we can still calculate what tax would be for transparency
    const taxCalculation = await stripe.tax.calculations.create({
      currency: currency.toLowerCase(),
      customer_details: customerDetails || defaultCustomerDetails,
      line_items: [
        {
          amount: Math.round(amount * 100), // Convert to cents
          reference: `donation-${donationType || "general"}`,
          tax_behavior:
            (process.env.STRIPE_TAX_BEHAVIOR as "inclusive" | "exclusive") ||
            "exclusive",
          tax_code: process.env.STRIPE_TAX_CODE || "txcd_99999999", // General tax code
        },
      ],
      shipping_cost: {
        amount: 0,
      },
      expand: ["line_items.data.tax_breakdown"],
    });

    return NextResponse.json({
      success: true,
      taxCalculation: {
        id: taxCalculation.id,
        amount_total: taxCalculation.amount_total,
        tax_amount_exclusive: taxCalculation.tax_amount_exclusive,
        tax_amount_inclusive: taxCalculation.tax_amount_inclusive,
        currency: taxCalculation.currency,
        line_items: taxCalculation.line_items?.data,
        tax_code: process.env.STRIPE_TAX_CODE || "txcd_99999999",
        is_tax_exempt: process.env.STRIPE_TAX_EXEMPT_STATUS === "true",
      },
      message:
        "Tax calculation completed (typically $0 for charitable donations)",
    });
  } catch (error) {
    console.error("Failed to calculate tax:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate tax",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || (apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false)) {
      return NextResponse.json({ success: false, error: "Stripe API key not configured" }, { status: 503 });
    }
    const stripe = new Stripe(apiKey);
    const body = await request.json();
    const { headOffice, taxBehavior = "exclusive" } = body;

    if (!headOffice) {
      return NextResponse.json(
        {
          success: false,
          error: "Head office information is required",
        },
        { status: 400 },
      );
    }

    // Update tax settings with head office
    const updatedSettings = await stripe.tax.settings.update({
      head_office: {
        address: {
          line1: headOffice.line1,
          city: headOffice.city,
          state: headOffice.state,
          postal_code: headOffice.postal_code,
          country: headOffice.country || "US",
        },
      },
      defaults: {
        tax_behavior: taxBehavior,
        tax_code: "txcd_99999999", // Tax-exempt charitable donations
      },
    });

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: "Tax settings updated successfully",
    });
  } catch (error) {
    console.error("Failed to update tax settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update tax settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
