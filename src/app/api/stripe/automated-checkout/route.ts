import { type NextRequest, NextResponse } from "next/server";
import { stripeAutomatedDonationSystem } from "@/lib/stripeAutomatedDonationSystem";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      amount,
      priceId,
      isRecurring,
      customerEmail,
      metadata,
      successUrl,
      cancelUrl,
    } = body;

    // Validate required fields
    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    if (!amount && !priceId) {
      return NextResponse.json(
        { error: "Either amount or priceId is required" },
        { status: 400 }
      );
    }

    console.log("🛒 Creating automated donation checkout:", {
      campaignId,
      amount,
      priceId,
      isRecurring,
      customerEmail,
    });

    // Create checkout session
    const checkout = await stripeAutomatedDonationSystem.createDonationCheckout(
      {
        campaignId,
        amount,
        priceId,
        isRecurring,
        customerEmail,
        metadata: {
          source: "automated_system",
          timestamp: new Date().toISOString(),
          ...metadata,
        },
        successUrl,
        cancelUrl,
      }
    );

    console.log("✅ Checkout session created:", checkout.sessionId);

    return NextResponse.json({
      success: true,
      sessionId: checkout.sessionId,
      checkoutUrl: checkout.url,
      campaignId,
      metadata: {
        amount,
        isRecurring,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Failed to create donation checkout:", error);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get("campaignId");

    if (campaignId) {
      // Get specific campaign
      const campaign =
        await stripeAutomatedDonationSystem.getCampaignById(campaignId);

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        campaign,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Get all active campaigns
      const campaigns =
        await stripeAutomatedDonationSystem.getActiveCampaigns();

      return NextResponse.json({
        success: true,
        campaigns,
        count: campaigns.length,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Failed to fetch campaigns:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch campaigns",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
