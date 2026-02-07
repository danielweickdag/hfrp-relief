import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";
import { getStripeAutomation } from "@/lib/stripeAutomation";

// Force dynamic to prevent static optimization of webhook route
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 1. Safe Configuration Loading
  // Using the manager ensures we handle env vars consistently and safely during build/runtime
  const configManager = getStripeConfigManager();
  
  if (!configManager) {
    console.error("❌ Stripe Webhook: Config manager initialization failed");
    return NextResponse.json(
      { error: "Internal configuration error" },
      { status: 500 }
    );
  }

  const config = configManager.getConfig();

  if (!config.secretKey || !config.webhookSecret) {
    console.error("❌ Stripe Webhook: Missing configuration (keys)");
    return NextResponse.json(
      { error: "Stripe configuration missing" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(config.secretKey, {
    apiVersion: "2025-01-27.acacia" as any, // Pin version for stability
    typescript: true,
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  let body: string;

  try {
    // 2. Validate Signature
    body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, config.webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`❌ Webhook Signature Verification Failed: ${msg}`);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // 3. Automated Processing
  console.log(`✅ Webhook Received: ${event.type} [${event.id}]`);

  try {
    const automation = getStripeAutomation();
    if (automation) {
      // Use the enhanced automation service to process the webhook
      const result = await automation.processWebhookAutomatically(
        event,
        sig,
        Buffer.from(body) // Convert string body to Buffer as expected by some internal methods if needed
      );
      
      if (!result.success && result.error) {
        console.warn(`⚠️ Automation processing warning: ${result.error}`);
      } else {
        console.log(`✨ Automation processed: ${result.eventType}`);
      }
    } else {
      // Fallback manual processing if automation service fails to initialize
      console.log("ℹ️ Automation service unavailable, skipping enhanced processing");
    }
  } catch (error) {
    console.error("❌ Webhook Processing Error:", error);
    // Return 500 to trigger Stripe retry
    return NextResponse.json(
      { error: "Internal processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}