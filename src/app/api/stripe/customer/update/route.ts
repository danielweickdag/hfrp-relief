import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, accountId, address, validateLocation, requestId } =
      body as {
        customerId?: string;
        accountId?: string;
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
        };
        validateLocation?: Stripe.CustomerUpdateParams.Tax.ValidateLocation;
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
    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 },
      );
    }

    const updateParams: Stripe.CustomerUpdateParams = {
      ...(address ? { address } : {}),
      ...(validateLocation
        ? { tax: { validate_location: validateLocation } }
        : {}),
    };

    const customer = await stripe.customers.update(customerId, updateParams, {
      stripeAccount: accountIdFinal,
      ...(requestId ? { idempotencyKey: String(requestId) } : {}),
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        address: customer.address,
        tax: customer.tax,
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);
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
