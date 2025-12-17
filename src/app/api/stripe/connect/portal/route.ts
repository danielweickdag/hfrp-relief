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
    const { sessionId, accountId, returnUrl } = body as {
      sessionId?: string;
      accountId?: string;
      returnUrl?: string;
    };

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required" },
        { status: 400 },
      );
    }
    // Default to configured connected account if not provided
    const defaultAccountId =
      process.env.STRIPE_CONNECTED_ACCOUNT_ID ||
      process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID ||
      undefined;
    const accountIdFinal = accountId || defaultAccountId;
    if (!accountIdFinal) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 },
      );
    }

    // Retrieve the checkout session on the connected account to get the customer
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      stripeAccount: accountIdFinal,
    });

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Customer not found for session" },
        { status: 400 },
      );
    }

    // Create a Billing Portal session for the connected account's customer
    const portal = await stripe.billingPortal.sessions.create(
      {
        customer: customerId,
        return_url:
          returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/admin/connect`,
      },
      { stripeAccount: accountIdFinal },
    );

    return NextResponse.json({ success: true, url: portal.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create portal session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
