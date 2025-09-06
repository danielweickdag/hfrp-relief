import { NextRequest, NextResponse } from "next/server";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const campaignId = searchParams.get("campaignId");

    // If requesting specific campaign analytics
    if (campaignId) {
      const campaigns = stripeEnhanced.getCampaigns();
      const campaign = campaigns.find((c: any) => c.id === campaignId);

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        campaign: {
          id: campaign.id,
          name: campaign.name,
          raised: campaign.raised || 0,
          goal: campaign.goal || 0,
          progress:
            campaign.goal > 0
              ? ((campaign.raised || 0) / campaign.goal) * 100
              : 0,
          donors: 0, // Would come from actual data
          averageDonation: 0,
        },
        success: true,
      });
    }

    // Overall analytics
    const campaigns = stripeEnhanced.getCampaigns();

    // Calculate totals
    const analytics = {
      totalAmount: 0,
      totalDonations: 0,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === "active")
        .length,
      topCampaigns: [] as any[],
      recentDonations: [] as any[],
      averageDonation: 0,
      donorsCount: 0,
      conversionRate: 85.2, // Mock data
      period,
    };

    // Calculate totals from campaigns
    if (campaigns.length > 0) {
      analytics.totalAmount = campaigns.reduce(
        (sum: number, campaign: any) => sum + (campaign.raised || 0),
        0
      );
      analytics.totalDonations = campaigns.length * 5; // Mock data
      analytics.averageDonation =
        analytics.totalDonations > 0
          ? analytics.totalAmount / analytics.totalDonations
          : 0;

      // Top campaigns
      analytics.topCampaigns = campaigns
        .sort((a: any, b: any) => (b.raised || 0) - (a.raised || 0))
        .slice(0, 5)
        .map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          raised: campaign.raised || 0,
          goal: campaign.goal || 0,
          progress:
            campaign.goal > 0
              ? ((campaign.raised || 0) / campaign.goal) * 100
              : 0,
        }));
    }

    // Mock recent donations
    analytics.recentDonations = [
      {
        id: "don_1",
        amount: 100,
        currency: "usd",
        campaignName: "Haiti Relief Fund",
        donorName: "Anonymous",
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      },
      {
        id: "don_2",
        amount: 500,
        currency: "usd",
        campaignName: "Emergency Relief",
        donorName: "John D.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
      {
        id: "don_3",
        amount: 250,
        currency: "usd",
        campaignName: "Education Support",
        donorName: "Sarah M.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      },
      {
        id: "don_4",
        amount: 0.5,
        currency: "usd",
        campaignName: "Daily Support Program",
        donorName: "Daily Supporter",
        date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        type: "subscription",
      },
    ];

    analytics.donorsCount = analytics.recentDonations.length;

    // Add automation sync status
    analytics.lastSync = new Date().toISOString();
    analytics.systemHealth = "operational";
    analytics.automationEnabled = true;

    return NextResponse.json({
      analytics,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle POST requests for updating analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    // Process analytics events
    switch (event) {
      case "donation.completed":
        console.log("Analytics: Recording donation completion", data);
        break;
      case "campaign.created":
        console.log("Analytics: Recording campaign creation", data);
        break;
      case "user.signup":
        console.log("Analytics: Recording user signup", data);
        break;
      default:
        console.log("Analytics: Unknown event", event);
    }

    return NextResponse.json({
      success: true,
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics POST error:", error);

    return NextResponse.json(
      {
        error: "Failed to process analytics event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
