import { type NextRequest, NextResponse } from "next/server";
import { stripeCampaignSync } from "@/lib/stripeCampaignSync";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting campaign and plan sync...");

    const body = await request.json().catch(() => ({}));
    const { autoSync = false, action = "default" } = body;

    let result;

    switch (action) {
      case "full-sync":
        result = await handleFullSync();
        break;
      case "sync-campaigns":
        result = await handleCampaignSync();
        break;
      case "sync-plans":
        result = await handlePlanSync();
        break;
      default:
        if (autoSync) {
          await stripeCampaignSync.autoSync();
          result = { success: true, message: "Auto-sync completed" };
        } else {
          result = await stripeCampaignSync.syncWithStripe();
        }
        break;
    }

    return NextResponse.json({
      success: true,
      message: "Sync completed",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Sync API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function handleFullSync() {
  try {
    console.log("🔄 Starting full Stripe sync...");

    // Sync plans first
    await stripeEnhanced.syncPlans();
    const plans = stripeEnhanced.getPlans();

    // Get campaigns
    const campaigns = stripeEnhanced.getCampaigns();

    // Run existing campaign sync
    const campaignSyncResult = await stripeCampaignSync.syncWithStripe();

    const syncResult = {
      timestamp: new Date().toISOString(),
      campaigns: campaigns.length,
      plans: plans.length,
      campaignSyncResult,
      success: true,
    };

    console.log("✅ Full Stripe sync completed");
    return syncResult;
  } catch (error) {
    console.error("Full sync error:", error);
    throw error;
  }
}

async function handleCampaignSync() {
  try {
    const campaigns = stripeEnhanced.getCampaigns();

    // Update campaign data with latest info
    const updatedCampaigns = campaigns.map((campaign) => ({
      ...campaign,
      syncedAt: new Date().toISOString(),
      status: campaign.status || "active",
    }));

    return {
      message: "Campaign sync completed",
      campaigns: updatedCampaigns.length,
      success: true,
    };
  } catch (error) {
    console.error("Campaign sync error:", error);
    throw error;
  }
}

async function handlePlanSync() {
  try {
    await stripeEnhanced.syncPlans();
    const plans = stripeEnhanced.getPlans();

    return {
      message: "Plan sync completed",
      plans: plans.length,
      success: true,
    };
  } catch (error) {
    console.error("Plan sync error:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "status":
        const status = await stripeCampaignSync.getSyncStatus();
        return NextResponse.json({
          success: true,
          data: status,
          timestamp: new Date().toISOString(),
        });

      case "plans":
        const plans = stripeCampaignSync.getPlans();
        return NextResponse.json({
          success: true,
          data: plans,
          count: plans.length,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          message: "Campaign sync API",
          endpoints: {
            "POST /api/stripe/sync": "Sync campaigns and plans",
            "GET /api/stripe/sync?action=status": "Get sync status",
            "GET /api/stripe/sync?action=plans": "Get all plans",
          },
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("❌ Sync API GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
