import { type NextRequest, NextResponse } from "next/server";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export async function GET(_request: NextRequest) {
  try {
    const campaigns = stripeEnhanced.getCampaigns();
    const plans = stripeEnhanced.getPlans();
    const events = stripeEnhanced.getEvents();
    return NextResponse.json({ success: true, data: { campaigns, plans, events } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load campaigns";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}));
    const body = raw as unknown;
    let campaign: unknown = undefined;
    if (typeof body === "object" && body !== null && "campaign" in body) {
      campaign = (body as Record<string, unknown>).campaign;
    }
    if (!campaign || !campaign.id) {
      return NextResponse.json(
        { success: false, error: "Missing campaign payload with id" },
        { status: 400 }
      );
    }
    const created = stripeEnhanced.createCampaign(campaign as any);
    return NextResponse.json({ success: true, data: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create campaign";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
