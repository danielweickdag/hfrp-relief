import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, priceId, quantity = 1, customerEmail, successUrl, cancelUrl, requestId } = body;

    if (!accountId || !priceId) {
      return NextResponse.json({
        success: false,
        error: 'Account ID and Price ID are required'
      }, { status: 400 });
    }

    // Create checkout session on the connected account
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/admin/connect?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/admin/connect?canceled=true`,
      customer_email: customerEmail,
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
      payment_intent_data: {
        application_fee_amount: Math.round((body.amount || 0) * 0.025), // 2.5% platform fee
        metadata: {
          platform: 'hfrp_relief',
          account_id: accountId,
        },
      },
      metadata: {
        platform: 'hfrp_relief',
        account_id: accountId,
        donation_type: 'connect_product',
      },
    }, {
      stripeAccount: accountId,
      ...(requestId ? { idempotencyKey: String(requestId) } : {}),
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        url: session.url,
        payment_status: session.payment_status,
      },
      message: 'Checkout session created successfully'
    });

  } catch (error) {
    console.error('Connect checkout session creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}