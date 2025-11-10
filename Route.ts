import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { amount, campaignId, userId, planId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: campaignId ? `Donation to Campaign ${campaignId}` : "General Donation",
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate/cancel`,
    metadata: { campaignId, userId, planId },
  });

  return NextResponse.json({ url: session.url });
}