import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}) as unknown);
    let action: string | undefined;
    if (typeof raw === "object" && raw !== null && "action" in raw) {
      const val = (raw as { action?: unknown }).action;
      action = typeof val === "string" ? val : undefined;
    }

    // Optional: generate sample events for diagnostics
    if (action === "generate") {
      const dir = path.join(process.cwd(), "data", "logs");
      await fs.mkdir(dir, { recursive: true });
      const filePath = path.join(dir, "stripe-events.json");

      const sampleEvents = [
        {
          id: `evt_test_${Date.now()}`,
          type: "payment_intent.succeeded",
          api_version: "test",
          createdAt: new Date().toISOString(),
          data: {
            object: {
              id: `pi_test_${Date.now()}`,
              amount: 2500,
              currency: "usd",
              customer: "cus_test_123",
              metadata: { campaignId: "haiti-relief-membership" },
            },
          },
        },
        {
          id: `evt_test_${Date.now() + 1}`,
          type: "invoice.payment_succeeded",
          api_version: "test",
          createdAt: new Date().toISOString(),
          data: {
            object: {
              id: `in_test_${Date.now()}`,
              amount_paid: 1500,
              customer: "cus_test_123",
              subscription: "sub_test_456",
            },
          },
        },
      ];

      let existing: unknown[] = [];
      try {
        const raw = await fs.readFile(filePath, "utf8");
        existing = JSON.parse(raw);
        if (!Array.isArray(existing)) existing = [];
      } catch {
        existing = [];
      }

      await fs.writeFile(
        filePath,
        JSON.stringify([...existing, ...sampleEvents], null, 2),
      );

      return NextResponse.json({
        message: "Generated sample webhook events",
        count: sampleEvents.length,
        file: filePath,
      });
    }

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
      { status: 500 },
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
