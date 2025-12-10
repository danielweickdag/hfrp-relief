import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, priceId, quantity, accountId, requestId } = body as {
      customerId?: string;
      priceId?: string;
      quantity?: number;
      accountId?: string;
      requestId?: string | number;
    };

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
    if (!customerId || !priceId) {
      return NextResponse.json(
        { error: "customerId and priceId are required" },
        { status: 400 },
      );
    }

    // Preview upcoming invoice to estimate totals including automatic tax
    const upcoming = await (stripe.invoices as any).retrieveUpcoming(
      {
        customer: customerId,
        subscription_items: [
          { price: priceId, quantity: quantity && quantity > 0 ? quantity : 1 },
        ],
        automatic_tax: { enabled: true },
        expand: ["total_details.breakdown"],
      },
      {
        stripeAccount: accountIdFinal,
        ...(requestId ? { idempotencyKey: String(requestId) } : {}),
      },
    );

    const total =
      upcoming.amount_due ?? upcoming.amount_remaining ?? upcoming.total ?? 0;
    const currency = upcoming.currency || "usd";
    const taxAmount = upcoming.total_details?.amount_tax ?? 0;
    const subtotal = (upcoming.total ?? 0) - taxAmount;

    return NextResponse.json({
      success: true,
      estimate: {
        subtotal,
        tax: taxAmount,
        total,
        currency,
      },
    });
  } catch (error) {
    console.error("Estimate subscription error:", error);
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({ status: "ok" });
}
