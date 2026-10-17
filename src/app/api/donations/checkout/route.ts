import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
const CAMPAIGN = "haiti-relief-main";
const CATEGORIES = ["Meals", "Health", "Education", "Housing", "General", "Daily Hope"] as const;
const PRESETS: Record<string, number> = { Meals: 50, Health: 100, Education: 250, Housing: 500 };

export async function POST(req: NextRequest) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || !/^(sk_test_|sk_live_)/.test(key)) {
      return NextResponse.json({ error: "Stripe server is not configured" }, { status: 503 });
    }
    // Never run a live key on a preview deployment, nor a test key in production.
    const production = process.env.VERCEL_ENV === "production";
    if (process.env.VERCEL_ENV && (production !== key.startsWith("sk_live_"))) {
      return NextResponse.json({ error: "Stripe key does not match deployment environment" }, { status: 503 });
    }
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    const input = body as Record<string, unknown>;
    const category = input.category;
    const frequency = input.frequency;
    const amount = input.amount;
    if (typeof category !== "string" || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      return NextResponse.json({ error: "Invalid donation category" }, { status: 400 });
    }
    if (frequency !== "once" && frequency !== "monthly") {
      return NextResponse.json({ error: "Invalid donation frequency" }, { status: 400 });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || !Number.isInteger(amount * 100) || amount < 5 || amount > 10000) {
      return NextResponse.json({ error: "Donation must be between $5 and $10,000" }, { status: 400 });
    }
    if (category === "Daily Hope" && (frequency !== "monthly" || amount !== 15)) {
      return NextResponse.json({ error: "Daily Hope costs $15 per month" }, { status: 400 });
    }
    if (category in PRESETS && amount !== PRESETS[category]) {
      return NextResponse.json({ error: "Amount does not match selected impact" }, { status: 400 });
    }
    if (category === "General" && amount < 5) {
      return NextResponse.json({ error: "Invalid custom donation" }, { status: 400 });
    }

    const stripe = new Stripe(key);
    const origin = new URL(req.url).origin;
    const metadata = { campaignId: CAMPAIGN, impact_category: category, donation_frequency: frequency };
    const session = await stripe.checkout.sessions.create({
      mode: frequency === "monthly" ? "subscription" : "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: Math.round(amount * 100),
          product_data: { name: `Haitian Family Relief — ${category} Donation` },
          ...(frequency === "monthly" ? { recurring: { interval: "month" as const } } : {}),
        },
        quantity: 1,
      }],
      success_url: `${origin}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate`,
      billing_address_collection: "auto",
      ...(frequency === "monthly" ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
      metadata,
    }, { idempotencyKey: `hfrp-checkout-${crypto.randomUUID()}` });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Donation Checkout error", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 500 });
  }
}
