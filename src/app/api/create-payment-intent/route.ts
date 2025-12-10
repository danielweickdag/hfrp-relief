import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount, // in dollars
      amountCents, // in cents, takes precedence if provided
      currency,
      accountId,
      automaticTaxEnabled,
      customerId,
      receiptEmail,
      metadata,
      requestId,
    } = body as {
      amount?: number;
      amountCents?: number;
      currency?: string;
      accountId?: string;
      automaticTaxEnabled?: boolean;
      customerId?: string;
      receiptEmail?: string;
      metadata?: Record<string, string>;
      requestId?: string | number;
    };

    // Resolve connected account default
    const defaultAccountId =
      process.env.STRIPE_CONNECTED_ACCOUNT_ID ||
      process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID ||
      undefined;
    const accountIdFinal = accountId || defaultAccountId;

    if (!accountIdFinal) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    const resolvedCurrency = (currency || "usd").toLowerCase();
    const cents =
      typeof amountCents === "number" && Number.isFinite(amountCents)
        ? Math.max(0, Math.trunc(amountCents))
        : typeof amount === "number" && Number.isFinite(amount)
          ? Math.max(0, Math.round(amount * 100))
          : 0;

    if (cents <= 0) {
      return NextResponse.json(
        { error: "amount or amountCents must be a positive value" },
        { status: 400 },
      );
    }

    const createParams: Stripe.PaymentIntentCreateParams = {
      amount: cents,
      currency: resolvedCurrency,
      payment_method_types: ["card"],
      ...((automaticTaxEnabled ?? true)
        ? { automatic_tax: { enabled: true } }
        : {}),
      ...(customerId ? { customer: customerId } : {}),
      ...(receiptEmail ? { receipt_email: receiptEmail } : {}),
      ...(metadata ? { metadata } : {}),
    };

    // Derive whether automatic tax was applied based on input flag
    const automaticTaxEnabledApplied = !!(automaticTaxEnabled ?? true);

    // Create PaymentIntent on the connected account
    const pi = await stripe.paymentIntents.create(createParams, {
      stripeAccount: accountIdFinal,
      ...(requestId ? { idempotencyKey: String(requestId) } : {}),
    });

    return NextResponse.json({
      success: true,
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      accountId: accountIdFinal,
      automaticTaxEnabled: automaticTaxEnabledApplied,
    });
  } catch (error) {
    console.error("Create PaymentIntent error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    modeFromKey: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
      ? "live"
      : "test",
    accountDefault:
      process.env.STRIPE_CONNECTED_ACCOUNT_ID ||
      process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID ||
      null,
  });
}
