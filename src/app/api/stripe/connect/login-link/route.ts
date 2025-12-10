import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId } = body as { accountId?: string };

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 },
      );
    }

    const link = await stripe.accounts.createLoginLink(accountId);

    return NextResponse.json({ success: true, url: link.url });
  } catch (error) {
    console.error("Create login link error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create login link",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
