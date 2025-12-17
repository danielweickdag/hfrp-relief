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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 },
      );
    }

    // Create a Connect account
    const account = await stripe.accounts.create({
      type: "express",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "non_profit",
      metadata: {
        created_by: "hfrp_relief_platform",
        organization_type: "relief_partner",
      },
    });

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/connect?refresh=${account.id}`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/connect?success=${account.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        business_profile: account.business_profile,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        created: account.created,
      },
      onboarding_url: accountLink.url,
      message: "Connect account created successfully",
    });
  } catch (error) {
    console.error("Connect account creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create Connect account",
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

    // Retrieve account information
    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        business_profile: account.business_profile,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        created: account.created,
      },
    });
  } catch (error) {
    console.error("Connect account retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve Connect account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
