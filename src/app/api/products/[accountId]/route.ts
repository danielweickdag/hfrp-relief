import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } },
) {
  try {
    const { accountId } = params;

    // Validate account ID
    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    // Determine if this is for platform or connected account
    const options: { stripeAccount?: string } = {};
    if (accountId !== "platform") {
      options.stripeAccount = accountId;
    }

    // Fetch prices with expanded product data
    const prices = await stripe.prices.list(
      {
        expand: ["data.product"],
        active: true,
        limit: 100,
      },
      options,
    );

    // Transform the data to match the expected format
    const products = prices.data
      .filter(
        (price) =>
          typeof price.product === "object" &&
          price.product &&
          !price.product.deleted,
      )
      .map((price) => {
        const product = price.product as Stripe.Product;
        return {
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: price.unit_amount,
          priceId: price.id,
          image: "https://i.imgur.com/6Mvijcm.png", // Default image
          currency: price.currency,
          type: price.type, // 'one_time' or 'recurring'
          recurring: price.recurring
            ? {
                interval: price.recurring.interval,
                interval_count: price.recurring.interval_count,
              }
            : null,
        };
      });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);

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
