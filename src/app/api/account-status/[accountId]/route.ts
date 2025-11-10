import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;

    // Validate account ID
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Retrieve account information
    const account = await stripe.accounts.retrieve(accountId);

    // Check account capabilities and requirements
    const payoutsEnabled = account.capabilities?.transfers === 'active';
    const chargesEnabled = account.capabilities?.card_payments === 'active';
    
    // Check if details are submitted (no pending requirements)
    const detailsSubmitted = !account.requirements?.currently_due?.length && 
                            !account.requirements?.eventually_due?.length;

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        payoutsEnabled,
        chargesEnabled,
        detailsSubmitted,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pastDue: account.requirements?.past_due || [],
        },
        capabilities: account.capabilities,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        email: account.email,
        country: account.country,
        defaultCurrency: account.default_currency,
      },
    });

  } catch (error) {
    console.error('Account status error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}