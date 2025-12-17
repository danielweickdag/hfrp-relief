import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false) {
      return NextResponse.json(
        { error: "Stripe API key not configured" },
        { status: 503 },
      );
    }
    const stripe = new Stripe(apiKey);
    const body = await request.json();
    const { accountId } = body;

    // Validate required fields
    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // Get the domain from environment or use localhost for development
    const domain = process.env.DOMAIN || "http://localhost:3005";

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${domain}/admin/connect`,
      return_url: `${domain}/admin/connect/success?accountId=${accountId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      accountId: accountId,
    });
  } catch (error) {
    console.error("Create account link error:", error);

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
