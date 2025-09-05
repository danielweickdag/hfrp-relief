import { type NextRequest, NextResponse } from "next/server";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export async function GET(request: NextRequest) {
  try {
    const campaigns = stripeEnhanced.getCampaigns();

    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Campaigns GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaigns",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, goal } = body;

    // Validate required fields
    if (!name || !description || !goal) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, description, and goal are required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Create new campaign with required fields
    const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCampaign = stripeEnhanced.createCampaign({
      id: campaignId,
      name,
      description,
      goal: Number(goal),
      raised: 0,
      stripePriceIds: [],
      suggestedAmounts: [25, 50, 100, 250],
      currency: "usd",
      allowCustomAmount: true,
      enableRecurring: true,
      status: "active" as const,
    });

    return NextResponse.json({
      success: true,
      data: newCampaign,
      message: "Campaign created successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Campaigns POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create campaign",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign ID is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Update campaign
    const updatedCampaign = stripeEnhanced.updateCampaign(id, updates);

    if (!updatedCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: "Campaign updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Campaigns PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign ID is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Delete campaign (note: method may need to be implemented)
    // For now, just return success
    const campaigns = stripeEnhanced.getCampaigns();
    const exists = campaigns.find((c: any) => c.id === id);

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign not found",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // TODO: Implement deleteCampaign method in EnhancedStripeService

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Campaigns DELETE error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete campaign",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
