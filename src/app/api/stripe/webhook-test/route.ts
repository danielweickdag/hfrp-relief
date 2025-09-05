import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Simple test to verify webhook endpoint accessibility
    const webhookStatus = {
      status: "operational",
      endpoint: "/api/stripe/webhook",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stripeMode:
        process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true" ? "test" : "live",
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripeSecretConfigured: !!process.env.STRIPE_SECRET_KEY,
      ready: !!(
        process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_SECRET_KEY
      ),
    };

    return NextResponse.json({
      message: "Webhook endpoint is accessible",
      ...webhookStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Webhook test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Webhook endpoint is ready",
    info: "This endpoint handles Stripe webhook events via POST requests",
    setupInstructions:
      "Configure this URL in your Stripe Dashboard webhooks section",
  });
}
