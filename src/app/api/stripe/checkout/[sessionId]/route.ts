
import { type NextRequest, NextResponse } from "next/server";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const stripeConfigManager = getStripeConfigManager();
    const stripe = stripeConfigManager?.getStripeInstance();

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not properly configured" },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const paymentIntent = session.payment_intent as any;

    return NextResponse.json({
      amount: session.amount_total,
      campaign: session.metadata?.campaignId || "Unknown Campaign",
      transactionId: paymentIntent?.id || session.id,
      date: paymentIntent?.created ? new Date(paymentIntent.created * 1000) : new Date(),
    });
  } catch (error) {
    console.error("Stripe checkout GET error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
