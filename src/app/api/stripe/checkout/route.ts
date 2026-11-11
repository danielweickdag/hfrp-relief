import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// This is the only place the secret key is used.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, recurring } = await request.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to Haitian Family Relief Project',
            },
            unit_amount: Math.round(amount * 100), // Amount in cents
            recurring: recurring ? { interval: 'month' } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: recurring ? 'subscription' : 'payment',
      success_url: `${request.headers.get('origin')}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/donate`,
    };

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error("STRIPE_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// This handles retrieving the session details for the success page.
export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return NextResponse.json(session);
    } catch (error: any) {
        console.error(`Failed to retrieve session ${sessionId}:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
