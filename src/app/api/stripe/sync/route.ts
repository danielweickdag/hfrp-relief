import { type NextRequest, NextResponse } from "next/server";
import { stripeCampaignSync } from "@/lib/stripeCampaignSync";
import { stripeEnhanced } from "@/lib/stripeEnhanced";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    switch (action) {
      case "plans": {
        const plans = stripeCampaignSync.getPlans();
        return NextResponse.json({ success: true, data: plans });
      }
      case "status": {
        const status = await stripeCampaignSync.getSyncStatus();
        return NextResponse.json({ success: true, data: status });
      }
      case "campaigns": {
        const campaigns = stripeEnhanced.getCampaigns();
        return NextResponse.json({ success: true, data: campaigns });
      }
      case "events": {
        try {
          const filePath = path.join(process.cwd(), "data", "logs", "stripe-events.json");
          const raw = await fs.readFile(filePath, "utf8").catch(() => "[]");
          const events = JSON.parse(raw);
          return NextResponse.json({ success: true, data: events });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to load events";
          return NextResponse.json({ success: false, error: message }, { status: 500 });
        }
      }
      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}));
    const body = raw as unknown;
    let action = "sync";
    if (typeof body === "object" && body !== null && "action" in body) {
      const val = (body as Record<string, unknown>).action;
      if (typeof val === "string") action = val;
    }

    switch (action) {
      case "sync":
      case "all": {
        const result = await stripeCampaignSync.syncWithStripe();
        return NextResponse.json({ success: result.success, data: result });
      }
      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
