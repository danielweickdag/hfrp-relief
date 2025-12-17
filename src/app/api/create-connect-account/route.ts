import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || (apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false)) {
      return NextResponse.json(
        { error: "Stripe API key not configured" },
        { status: 503 },
      );
    }
    const stripe = new Stripe(apiKey);
    const body = await request.json();
    const { email, displayName } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Create Connect account using Express account type (simpler than v2 API)
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: email,
      business_type: "company",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: "daily",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      accountId: account.id,
      email: email,
      displayName: displayName || email,
    });
  } catch (error) {
    console.error("Create Connect account error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
