// 🎯 Stripe Campaign & Event Management API
// Comprehensive automation for fundraising campaigns and events

import { type NextRequest, NextResponse } from "next/server";
import { stripeAutomation } from "@/lib/stripeAutomation";

// Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_campaign":
        const campaign = await stripeAutomation.createCampaign({
          name: body.name,
          description: body.description,
          goalAmount: body.goalAmount,
          suggestedAmounts: body.suggestedAmounts || [15, 25, 50, 100],
          enableRecurring: body.enableRecurring || true,
        });

        return NextResponse.json({
          success: true,
          campaign,
          message: "✅ Campaign created with full automation",
        });

      case "create_event":
        const event = await stripeAutomation.createEvent({
          name: body.name,
          description: body.description,
          date: new Date(body.date),
          ticketPrice: body.ticketPrice,
          maxAttendees: body.maxAttendees,
        });

        return NextResponse.json({
          success: true,
          event,
          message: "🎟️ Event created with automated ticketing",
        });

      case "process_donation":
        const donation = await stripeAutomation.processDonation({
          amount: body.amount,
          donorEmail: body.donorEmail,
          campaignId: body.campaignId,
          isRecurring: body.isRecurring || false,
          donorName: body.donorName,
        });

        return NextResponse.json({
          success: true,
          donation,
          message: "💰 Donation processed with automation",
        });

      case "sync_all":
        const syncReport = await stripeAutomation.syncAllData();

        // Trigger automation workflows
        await Promise.all([
          stripeAutomation.automateWeeklyReports(),
          stripeAutomation.automateSocialMediaPosts(),
        ]);

        return NextResponse.json({
          success: true,
          ...syncReport,
          message: "🔄 Full sync completed with automation",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ Campaign API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get campaigns and events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const syncReport = await stripeAutomation.syncAllData();

    if (type === "campaigns") {
      return NextResponse.json({
        success: true,
        campaigns: syncReport.campaigns,
      });
    }

    if (type === "events") {
      return NextResponse.json({
        success: true,
        events: syncReport.events,
      });
    }

    return NextResponse.json({
      success: true,
      ...syncReport,
    });
  } catch (error) {
    console.error("❌ Get campaigns error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
