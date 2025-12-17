import Stripe from "stripe";

export const dynamic = "force-dynamic";

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn("⚠️ Stripe environment variables missing during build.");
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY || "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!key || !secret) {
    return new Response("Missing Stripe environment variables", { status: 500 });
  }

  const stripe = new Stripe(key);
  const sig = req.headers.get("stripe-signature") || "";

  try {
    await stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  return new Response("success", { status: 200 });
}