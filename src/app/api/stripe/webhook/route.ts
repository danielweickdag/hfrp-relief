import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle events: payment, subscription, etc.
  switch (event.type) {
    case "checkout.session.completed":
      // Sync donation/payment to campaign/user plan
      // Example: update DB, send email, etc.
      break;
    // Add more event types as needed
  }

  return NextResponse.json({ received: true });
}