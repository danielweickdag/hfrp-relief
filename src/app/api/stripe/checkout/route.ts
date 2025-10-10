import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Stripe is not configured (missing STRIPE_SECRET_KEY)" },
        { status: 503 }
      );
    }

    const stripe = new Stripe(secret, {
      apiVersion: "2025-08-27.basil",
    });

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
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const resolvedSuccessUrl =
      typeof successUrl === "string" && successUrl.length > 0
        ? successUrl
        : `${origin}/donation/success?session_id={CHECKOUT_SESSION_ID}&campaign=${encodeURIComponent(
            campaignId || "general"
          )}&amount=${encodeURIComponent(String(amount))}`;
    const resolvedCancelUrl =
      typeof cancelUrl === "string" && cancelUrl.length > 0
        ? cancelUrl
        : `${origin}/donation/cancelled?campaign=${encodeURIComponent(
            campaignId || "general"
          )}`;

    const unitAmount = Math.round(amount * 100);

    // Build line item price_data
    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency,
      unit_amount: unitAmount,
      product_data: {
        name: campaignId
          ? `Donation to ${campaignId}`
          : "HFRP Donation",
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

    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      allow_promotion_codes: true,
      metadata: {
        ...(campaignId ? { campaignId } : {}),
        donation_type: isRecurring ? "recurring" : "one_time",
        ...metadata,
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Stripe checkout POST error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Stripe checkout endpoint ready",
  });
}
