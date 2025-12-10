import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, productDescription, productPrice, accountId } = body;

    // Validate required fields
    if (!productName || !productPrice || !accountId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productName, productPrice, accountId",
        },
        { status: 400 },
      );
    }

    // Validate price is a positive integer (in cents)
    const priceInCents = Number.parseInt(productPrice);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      return NextResponse.json(
        { error: "Product price must be a positive number in cents" },
        { status: 400 },
      );
    }

    // Create the product on the connected account
    const product = await stripe.products.create(
      {
        name: productName,
        description: productDescription || "",
      },
      { stripeAccount: accountId },
    );

    // Create a price for the product on the connected account
    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: priceInCents,
        currency: "usd",
      },
      { stripeAccount: accountId },
    );

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: productName,
        description: productDescription,
        price: priceInCents,
        priceId: price.id,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);

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
