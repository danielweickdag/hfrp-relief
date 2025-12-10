import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      priceId,
      accountId,
      automaticTaxEnabled,
      quantity,
      requestId,
      metadata,
      saveDefaultPaymentMethod,
    } = body as {
      customerId?: string;
      priceId?: string;
      accountId?: string;
      automaticTaxEnabled?: boolean;
      quantity?: number;
      requestId?: string | number;
      metadata?: Record<string, string>;
      saveDefaultPaymentMethod?: "on_subscription" | "off";
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

    const subParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [
        { price: priceId, quantity: quantity && quantity > 0 ? quantity : 1 },
      ],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      ...((automaticTaxEnabled ?? true)
        ? { automatic_tax: { enabled: true } }
        : {}),
      payment_settings: {
        save_default_payment_method:
          saveDefaultPaymentMethod === "on_subscription"
            ? "on_subscription"
            : undefined,
      },
      ...(metadata ? { metadata } : {}),
    };

    const subscription = await stripe.subscriptions.create(subParams, {
      stripeAccount: accountIdFinal,
      ...(requestId ? { idempotencyKey: String(requestId) } : {}),
    });

    const latestInvoiceRaw = subscription.latest_invoice;
    let clientSecret: string | null = null;

    if (latestInvoiceRaw && typeof latestInvoiceRaw !== "string") {
      const invoice = latestInvoiceRaw as Stripe.Invoice & {
        payment_intent?: Stripe.PaymentIntent | string | null;
      };
      const pi = invoice.payment_intent;
      if (pi && typeof pi !== "string") {
        clientSecret = pi.client_secret ?? null;
      } else if (typeof pi === "string") {
        const piObj = await stripe.paymentIntents.retrieve(pi, {
          stripeAccount: accountIdFinal,
        });
        clientSecret = piObj.client_secret ?? null;
      }
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret,
      accountId: accountIdFinal,
      automaticTaxEnabled: !!subParams.automatic_tax?.enabled,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
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
