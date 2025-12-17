import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || (apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false)) {
      return NextResponse.json({ success: false, error: "Stripe API key not configured" }, { status: 503 });
    }
    const stripe = new Stripe(apiKey);
    const body = await request.json();
    const {
      accountId,
      name,
      description,
      price,
      currency = "usd",
      recurring,
    } = body;

    if (!accountId || !name || !price) {
      return NextResponse.json(
        {
          success: false,
          error: "Account ID, name, and price are required",
        },
        { status: 400 },
      );
    }

    // Create product on the connected account
    const product = await stripe.products.create(
      {
        name,
        description: description || undefined,
        images: ["https://i.imgur.com/6Mvijcm.png"], // Default relief image
        metadata: {
          created_by: "hfrp_relief_platform",
          account_id: accountId,
        },
      },
      {
        stripeAccount: accountId,
      },
    );

    // Create price for the product
    const priceData: Stripe.PriceCreateParams = {
      unit_amount: price,
      currency,
      product: product.id,
      tax_behavior: "exclusive", // Align with our tax configuration
      metadata: {
        created_by: "hfrp_relief_platform",
        tax_exempt: "true", // Relief products are typically tax-exempt
      },
    };

    if (recurring) {
      priceData.recurring = {
        interval: recurring.interval || "month",
      };
    }

    const priceObject = await stripe.prices.create(priceData, {
      stripeAccount: accountId,
    });

    // Update product with default price
    const updatedProduct = await stripe.products.update(
      product.id,
      {
        default_price: priceObject.id,
      },
      {
        stripeAccount: accountId,
      },
    );

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        images: updatedProduct.images,
        default_price: {
          id: priceObject.id,
          unit_amount: priceObject.unit_amount,
          currency: priceObject.currency,
          recurring: priceObject.recurring,
        },
      },
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey || (apiKey.startsWith("sk_live_") === false && apiKey.startsWith("sk_test_") === false)) {
      return NextResponse.json({ success: false, error: "Stripe API key not configured" }, { status: 503 });
    }
    const stripe = new Stripe(apiKey);
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: "Account ID is required",
        },
        { status: 400 },
      );
    }

    // List products for the connected account
    const products = await stripe.products.list(
      {
        limit: 100,
        expand: ["data.default_price"],
      },
      {
        stripeAccount: accountId,
      },
    );

    const formattedProducts = products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      default_price: product.default_price
        ? {
            id: (product.default_price as Stripe.Price).id,
            unit_amount: (product.default_price as Stripe.Price).unit_amount,
            currency: (product.default_price as Stripe.Price).currency,
            recurring: (product.default_price as Stripe.Price).recurring,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Products retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
