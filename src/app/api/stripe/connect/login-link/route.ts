import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || (apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false)) {
      return NextResponse.json({ success: false, error: "Stripe API key not configured" }, { status: 503 });
    }
    const stripe = new Stripe(apiKey);
    const body = await request.json();
    const { accountId } = body as { accountId?: string };

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 },
      );
    }

    const link = await stripe.accounts.createLoginLink(accountId);

    return NextResponse.json({ success: true, url: link.url });
  } catch (error) {
    console.error("Create login link error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create login link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
