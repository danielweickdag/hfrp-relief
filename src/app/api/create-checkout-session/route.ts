import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      priceId,
      accountId,
      applicationFeeAmount,
      requestId,
      automaticTaxEnabled,
      priceData,
    } = body as {
      priceId?: string;
      accountId?: string;
      applicationFeeAmount?: string | number;
      requestId?: string | number;
      automaticTaxEnabled?: boolean;
      priceData?: {
        currency?: string;
        unitAmount?: number;
        productName?: string;
        taxCode?: string;
        taxBehavior?: "exclusive" | "inclusive" | "unspecified";
        quantity?: number;
      };
    };

    // Default to configured connected account if not provided
    const defaultAccountId =
      process.env.STRIPE_CONNECTED_ACCOUNT_ID ||
      process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID ||
      undefined;
    const accountIdFinal = accountId || defaultAccountId;

    // Validate required fields for either priceId or inline priceData
    const hasInlinePrice = !!priceData && typeof priceData === "object";
    const quantity =
      hasInlinePrice && priceData?.quantity && priceData.quantity > 0
        ? priceData.quantity
        : 1;
    if (!accountIdFinal) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }
    if (!priceId && !hasInlinePrice) {
      return NextResponse.json(
        { error: "Either priceId or priceData is required" },
        { status: 400 },
      );
    }

    // Get the domain from environment or use localhost for development
    const domain =
      process.env.DOMAIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3005";

    let mode: "payment" | "subscription" = "payment";
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (priceId) {
      // Get the price to determine if it's recurring or one-time
      const price = await stripe.prices.retrieve(priceId, {
        stripeAccount: accountIdFinal,
      });
      mode = price.type === "recurring" ? "subscription" : "payment";
      lineItems = [
        {
          price: priceId,
          quantity,
        },
      ];
    } else if (hasInlinePrice) {
      // Build an inline price using price_data
      const currency = priceData?.currency;
      const unitAmount = priceData?.unitAmount;
      const productName = priceData?.productName;
      const taxBehavior = priceData?.taxBehavior;
      const taxCode = priceData?.taxCode;

      if (!currency || !unitAmount || !productName) {
        return NextResponse.json(
          {
            error:
              "priceData.currency, priceData.unitAmount, and priceData.productName are required",
          },
          { status: 400 },
        );
      }

      lineItems = [
        {
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: productName,
              ...(taxCode ? { tax_code: taxCode } : {}),
            },
            ...(taxBehavior ? { tax_behavior: taxBehavior } : {}),
          },
          quantity,
        },
      ];
      mode = "payment";
    }

    // Base session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode,
      success_url: `${domain}/admin/connect/success?session_id={CHECKOUT_SESSION_ID}&accountId=${accountIdFinal}`,
      cancel_url: `${domain}/admin/connect`,
      ...((automaticTaxEnabled ?? true)
        ? { automatic_tax: { enabled: true } }
        : {}),
    };

    // Add application fee for payment mode (not supported for subscriptions on connected accounts)
    if (
      mode === "payment" &&
      applicationFeeAmount !== undefined &&
      applicationFeeAmount !== null
    ) {
      const feeAmount =
        typeof applicationFeeAmount === "string"
          ? Number.parseInt(applicationFeeAmount, 10)
          : Math.trunc(applicationFeeAmount);
      if (Number.isFinite(feeAmount) && feeAmount > 0) {
        sessionParams.payment_intent_data = {
          application_fee_amount: feeAmount,
        };
      }
    }

    // Create checkout session on the connected account
    const session = await stripe.checkout.sessions.create(sessionParams, {
      stripeAccount: accountIdFinal,
      ...(requestId ? { idempotencyKey: String(requestId) } : {}),
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      mode: mode,
      accountId: accountIdFinal,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);

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
