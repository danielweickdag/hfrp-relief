import { type NextRequest, NextResponse } from "next/server";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      amount,
      campaignId = "general-fund",
      customerEmail,
      metadata = {},
      mode = "payment",
      planId,
      priceId,
      returnUrl,
    } = body;

    // Validate required fields
    // For subscription mode, amount validation is skipped as it's handled by the plan
    if (mode === "payment" && (!amount || amount < 1)) {
      return NextResponse.json(
        { error: "Amount must be at least $1" },
        { status: 400 }
      );
    }

    // Get campaign details
    const campaign = stripeEnhanced.getCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Create checkout session
    const session = await stripeEnhanced.createCheckoutSession({
      amount,
      campaignId,
      customerEmail,
      metadata: {
        ...metadata,
        campaignName: campaign.name,
        source: "web_checkout",
      },
      mode,
      planId,
      priceId,
      successUrl:
        returnUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:
        returnUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cancel`,
    });

    // Log checkout attempt
    console.log(
      `Checkout session created: ${session.id} for campaign: ${campaignId}`
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      success: true,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for checkout session details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve session details from Stripe
    const session = await stripeEnhanced.getCheckoutSession(sessionId);

    return NextResponse.json({
      session,
      success: true,
    });
  } catch (error) {
    console.error("Checkout session retrieval error:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
