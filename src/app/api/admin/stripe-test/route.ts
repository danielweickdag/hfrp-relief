import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  // Simple auth check - could be more robust
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const liveMode = process.env.NEXT_PUBLIC_STRIPE_LIVE_MODE === "true";

  if (!secretKey) {
    return NextResponse.json({ 
        ok: false, 
        error: "Missing STRIPE_SECRET_KEY in environment variables." 
    }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-04-10",
    });

    const account = await stripe.accounts.retrieve();
    const balance = await stripe.balance.retrieve();

    return NextResponse.json({
      ok: true,
      mode: liveMode ? "live" : "test",
      publishableKey: publishableKey ? `${publishableKey.substring(0, 8)}...` : "missing",
      account: {
        id: account.id,
        name: account.business_profile?.name || account.email || account.id,
        country: account.country,
        currency: account.default_currency,
      },
      balance: {
        amount: balance.available[0]?.amount / 100,
        currency: balance.available[0]?.currency.toUpperCase(),
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      code: error.code,
      type: error.type
    }, { status: 400 });
  }
}
