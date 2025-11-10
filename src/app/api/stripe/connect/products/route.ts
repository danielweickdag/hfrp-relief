import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID is required'
      }, { status: 400 });
    }

    // List products for the connected account
    const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price'],
    }, {
      stripeAccount: accountId,
    });

    const formattedProducts = products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      default_price: product.default_price ? {
        id: (product.default_price as Stripe.Price).id,
        unit_amount: (product.default_price as Stripe.Price).unit_amount,
        currency: (product.default_price as Stripe.Price).currency,
        recurring: (product.default_price as Stripe.Price).recurring,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts
    });

  } catch (error) {
    console.error('Products retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}