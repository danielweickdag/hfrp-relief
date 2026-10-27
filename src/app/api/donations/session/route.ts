import { createStripeDonationRepository } from "@/lib/stripeDonationRepository";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId || !/^cs_(test_|live_)[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json(
      { error: "Invalid Checkout Session ID" },
      { status: 400 },
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || !/^sk_(test|live)_/.test(secretKey)) {
    return NextResponse.json(
      { error: "Stripe verification is unavailable" },
      { status: 503 },
    );
  }

  const deploymentEnvironment = process.env.VERCEL_ENV || process.env.NODE_ENV;
  if (
    (deploymentEnvironment === "preview" &&
      !secretKey.startsWith("sk_test_")) ||
    (deploymentEnvironment === "production" &&
      !secretKey.startsWith("sk_live_")) ||
    (deploymentEnvironment !== "preview" &&
      deploymentEnvironment !== "production" &&
      deploymentEnvironment !== "development" &&
      deploymentEnvironment !== "test")
  ) {
    return NextResponse.json(
      { error: "Stripe key does not match deployment environment" },
      { status: 503 },
    );
  }

  if (
    (sessionId.startsWith("cs_test_") && !secretKey.startsWith("sk_test_")) ||
    (sessionId.startsWith("cs_live_") && !secretKey.startsWith("sk_live_"))
  ) {
    return NextResponse.json(
      { error: "Checkout environment mismatch" },
      { status: 400 },
    );
  }

  try {
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    const isPaid =
      session.status === "complete" && session.payment_status === "paid";

    if (!isPaid) {
      return NextResponse.json(
        { status: "pending" },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const referenceId = (value: string | { id: string } | null) =>
      typeof value === "string" ? value : (value?.id ?? null);
    const persisted =
      await createStripeDonationRepository().hasPersistedPaidDonation({
        checkoutSessionId: session.id,
        paymentIntentId: referenceId(session.payment_intent),
        subscriptionId: referenceId(session.subscription),
      });
    if (!persisted) {
      return NextResponse.json(
        {
          status: "pending",
          paymentStatus: "paid",
          persistenceStatus: "pending",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const lineItem = session.line_items?.data[0];

    const amount = (session.amount_total ?? 0) / 100;

    const campaign =
      session.metadata?.category ||
      lineItem?.description ||
      "Haitian Family Relief Donation";

    const frequency = session.mode === "subscription" ? "monthly" : "once";

    return NextResponse.json(
      {
        status: "paid",
        persistenceStatus: "persisted",
        amount,
        currency: (session.currency || "usd").toUpperCase(),
        campaign,
        frequency,
        date: new Date(session.created * 1000).toISOString().slice(0, 10),
        reference: session.id.slice(0, 12),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Stripe session verification failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "Unable to verify donation" },
      { status: 502 },
    );
  }
}
