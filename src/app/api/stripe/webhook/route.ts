import {
  processStripeDonationEvent,
  resolveStripeWebhookConfig,
} from "@/lib/stripeDonationWebhook";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Force dynamic to prevent static optimization of webhook route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const config = resolveStripeWebhookConfig(process.env);
  if (!config) {
    return NextResponse.json(
      { error: "Stripe webhook configuration is unavailable" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(config.secretKey, { typescript: true });

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, config.webhookSecret);
  } catch (error) {
    console.error(
      "Stripe webhook signature validation failed",
      error instanceof Error ? error.name : "unknown",
    );
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature" },
      { status: 400 },
    );
  }

  if (event.livemode !== config.livemode) {
    return NextResponse.json(
      { error: "Stripe event environment mismatch" },
      { status: 400 },
    );
  }

  try {
    const result = await processStripeDonationEvent(event);
    return NextResponse.json({ received: true, status: result });
  } catch (error) {
    console.error(
      "Stripe webhook processing failed",
      error instanceof Error ? error.name : "unknown",
    );
    return NextResponse.json(
      { error: "Webhook processing failed; Stripe may retry" },
      { status: 500 },
    );
  }
}
