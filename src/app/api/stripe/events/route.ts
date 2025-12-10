import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function toEntry(evt: Stripe.Event) {
  return {
    id: evt.id,
    type: evt.type,
    api_version: evt.api_version,
    createdAt: evt.created
      ? new Date(evt.created * 1000).toISOString()
      : new Date().toISOString(),
    data: evt.data,
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || undefined;
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 100)
      : 50;

    const createdGte = url.searchParams.get("created_gte");
    const createdLte = url.searchParams.get("created_lte");

    const created: Stripe.EventListParams["created"] = {};
    if (createdGte) {
      const ts = Math.floor(new Date(createdGte).getTime() / 1000);
      if (Number.isFinite(ts)) created.gte = ts;
    }
    if (createdLte) {
      const ts = Math.floor(new Date(createdLte).getTime() / 1000);
      if (Number.isFinite(ts)) created.lte = ts;
    }
    const createdFilter = Object.keys(created).length > 0 ? created : undefined;

    const params: Stripe.EventListParams = {
      limit,
      ...(type ? { type } : {}),
      ...(createdFilter ? { created: createdFilter } : {}),
    };

    const events = await stripe.events.list(params);
    const data = events.data.map(toEntry);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Stripe events list error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to list events";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
