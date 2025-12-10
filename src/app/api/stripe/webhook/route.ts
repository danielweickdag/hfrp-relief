import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";
import { getStripeAutomation } from "@/lib/stripeAutomation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Collect possible webhook secrets for dual-mode validation (test/live/fallback)
const WEBHOOK_SECRET_DEFAULT = process.env.STRIPE_WEBHOOK_SECRET || "";
const WEBHOOK_SECRET_TEST = process.env.STRIPE_WEBHOOK_SECRET_TEST || "";
const WEBHOOK_SECRET_LIVE = process.env.STRIPE_WEBHOOK_SECRET_LIVE || "";
// Optional: restrict processing to a specific connected account
const ALLOWED_ACCOUNT_ID =
  process.env.STRIPE_CONNECTED_ACCOUNT_ID ||
  process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID ||
  "";

function resolveWebhookSecrets(primary?: string): string[] {
  const candidates = [
    ...(primary ? [primary] : []),
    WEBHOOK_SECRET_TEST,
    WEBHOOK_SECRET_LIVE,
    WEBHOOK_SECRET_DEFAULT,
  ].filter((s, i, arr) => !!s && arr.indexOf(s) === i);
  // Normalize by trimming potential whitespace/newlines from env parsing
  return candidates.map((s) => s.trim());
}

// Webhook event handlers
const eventHandlers = {
  "payment_intent.succeeded": handlePaymentIntentSucceeded,
  "payment_intent.payment_failed": handlePaymentIntentFailed,
  "customer.created": handleCustomerCreated,
  "customer.updated": handleCustomerUpdated,
  "invoice.payment_succeeded": handleInvoicePaymentSucceeded,
  "invoice.payment_failed": handleInvoicePaymentFailed,
  "customer.subscription.created": handleSubscriptionCreated,
  "customer.subscription.updated": handleSubscriptionUpdated,
  "customer.subscription.deleted": handleSubscriptionDeleted,
  "checkout.session.completed": handleCheckoutSessionCompleted,
};

export async function POST(request: NextRequest) {
  try {
    // Get raw body as buffer for signature verification
    const buf = await request.arrayBuffer();
    const body = Buffer.from(buf);
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");
    const isServerless =
      process.env.VERCEL === "1" || process.env.NETLIFY === "true";

    const configuredSecrets = resolveWebhookSecrets(
      getStripeConfigManager()?.getConfig().webhookSecret,
    );
    if (configuredSecrets.length === 0) {
      console.warn(
        "No Stripe webhook secret configured; strict verification will fail",
      );
    }
    if (
      (process.env.WEBHOOK_DEBUG_SIGNATURE === "true" ||
        process.env.WEBHOOK_DEBUG_SIGNATURE === "1") &&
      process.env.NODE_ENV === "production"
    ) {
      console.warn(
        "Signature debug is enabled in production; disable WEBHOOK_DEBUG_SIGNATURE",
      );
    }
    if (process.env.ENABLE_DEV_WEBHOOK_BYPASS === "true") {
      console.warn(
        "ENABLE_DEV_WEBHOOK_BYPASS is set but bypass support has been removed; ignored.",
      );
    }

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 },
      );
    }

    // Get the config manager instance
    const stripeConfigManager = getStripeConfigManager();
    if (!stripeConfigManager) {
      return NextResponse.json(
        { error: "Stripe service is not configured" },
        { status: 503 },
      );
    }

    // Validate configuration (but allow dual-secret fallback if env provides one)
    const validation = await stripeConfigManager.validateConfiguration();

    // Prepare event and diagnostics without using explicit 'any' types
    let event: Stripe.Event | null = null;
    type SecretVariant = "config" | "test" | "live" | "default";
    let matchedVariant: SecretVariant | null = null;

    try {
      {
        // Verify webhook signature. Try primary from config first, then fall back to env-provided test/live/default secrets.
        const config = stripeConfigManager.getConfig();
        const candidateSecrets = resolveWebhookSecrets(config.webhookSecret);
        console.log("Processing webhook with enhanced automation...");
        let lastError: unknown = null;

        // Optional signature debugging in non-serverless environments
        const debugSig =
          headersList.get("x-debug-signature") === "1" ||
          process.env.WEBHOOK_DEBUG_SIGNATURE === "1";
        const bodyStr = body.toString("utf8");
        let headerTs: string | null = null;
        try {
          const m = /t=(\d+)/.exec(signature || "");
          headerTs = m && m[1] ? m[1] : null;
        } catch {}
        if (debugSig && headerTs) {
          try {
            for (const secret of candidateSecrets) {
              const expected = crypto
                .createHmac("sha256", secret)
                .update(`${headerTs}.${bodyStr}`)
                .digest("hex");
              console.log(
                `[sig-debug] expected v1 using secret suffix '${secret.slice(-6)}': ${expected}`,
              );
            }
            console.log("[sig-debug] header:", signature);
            console.log("[sig-debug] payload length:", bodyStr.length);
          } catch (e) {
            console.warn(
              "[sig-debug] failed to compute expected signature:",
              e,
            );
          }
        }
        for (const secret of candidateSecrets) {
          try {
            // Use the raw Buffer for verification per Stripe docs
            const verified = stripe.webhooks.constructEvent(
              body,
              signature,
              secret,
            );
            event = verified;
            matchedVariant =
              secret === config.webhookSecret
                ? "config"
                : secret === WEBHOOK_SECRET_TEST
                  ? "test"
                  : secret === WEBHOOK_SECRET_LIVE
                    ? "live"
                    : "default";
            console.log(
              `✅ Webhook signature verified using '${matchedVariant}' secret variant`,
            );
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
          }
        }
        if (event === null) {
          throw (
            lastError ||
            new Error(
              "Webhook signature verification failed for all candidate secrets",
            )
          );
        }
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        webhookSecretConfigured: !!resolveWebhookSecrets(
          getStripeConfigManager()?.getConfig().webhookSecret,
        ).length,
        signaturePresent: !!signature,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Type guard to satisfy strict initialization checks
    if (event === null) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(
      `Received webhook event: ${event.type}${matchedVariant ? ` (secret=${matchedVariant})` : ""}`,
    );

    // If an allowed connected account ID is configured, only process events from that account
    if (ALLOWED_ACCOUNT_ID) {
      const eventAccount =
        typeof event.account === "string" ? event.account : null;
      if (!eventAccount || eventAccount !== ALLOWED_ACCOUNT_ID) {
        console.warn(
          `Skipping event ${event.type} due to account mismatch: expected=${ALLOWED_ACCOUNT_ID}, got=${eventAccount ?? "none"}`,
        );
        // Persist for diagnostics but mark as skipped
        await saveWebhookEvent(event);
        return NextResponse.json({
          received: true,
          processed: false,
          skipped: true,
          reason: "account_mismatch",
          expectedAccountId: ALLOWED_ACCOUNT_ID,
          eventAccountId: eventAccount,
        });
      }
    }

    // Get the automation service
    const stripeAutomation = getStripeAutomation();
    if (!stripeAutomation) {
      console.error("Stripe automation service is not available");
      return NextResponse.json(
        { error: "Stripe automation service is not available" },
        { status: 503 },
      );
    }

    // Use enhanced automation system for processing
    try {
      const result = await stripeAutomation.processWebhookAutomatically(
        event,
        signature,
        body,
      );

      if (result.success) {
        console.log(`Successfully processed ${event.type} with automation`);
      } else {
        console.warn(
          `Automation processing failed for ${event.type}:`,
          result.error,
        );

        // Fallback to legacy handlers if automation fails
        const handler = eventHandlers[event.type as keyof typeof eventHandlers];
        if (handler) {
          await handler(event);
          console.log(`Fallback handler succeeded for ${event.type}`);
        }
      }
    } catch (error) {
      console.error(
        `Error in automated webhook processing for ${event.type}:`,
        error,
      );

      // Fallback to legacy handlers
      const handler = eventHandlers[event.type as keyof typeof eventHandlers];
      if (handler) {
        try {
          await handler(event);
          console.log(`Fallback handler succeeded for ${event.type}`);
        } catch (fallbackError) {
          console.error(
            `Both automation and fallback failed for ${event.type}:`,
            fallbackError,
          );
          return NextResponse.json(
            { error: `Failed to handle ${event.type}` },
            { status: 500 },
          );
        }
      } else {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    // Persist the event to local JSON log for diagnostics and sync API
    await saveWebhookEvent(event);

    return NextResponse.json({
      received: true,
      processed: true,
      automation: "enhanced",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const manager = getStripeConfigManager();
  const cfg = manager?.getConfig();
  const secrets = resolveWebhookSecrets(cfg?.webhookSecret);
  const publishableKey =
    cfg?.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const modeFromKey = publishableKey.startsWith("pk_live_")
    ? "live"
    : publishableKey.startsWith("pk_test_")
      ? "test"
      : "unknown";
  return NextResponse.json({
    message: "Stripe webhook endpoint",
    status: "active",
    supportedEvents: Object.keys(eventHandlers),
    webhookSecretConfigured: secrets.length > 0,
    secretsAvailable: secrets.length,
    modeFromKey,
    accountEventFilterEnabled: !!ALLOWED_ACCOUNT_ID,
    allowedAccountId: ALLOWED_ACCOUNT_ID || null,
  });
}

// Event handler functions
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log("Payment succeeded:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customer: paymentIntent.customer,
  });

  // TODO: Update donation records, send thank you email, etc.
  await logDonation({
    stripePaymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100, // Convert from cents
    currency: paymentIntent.currency,
    customerId: paymentIntent.customer as string,
    status: "completed",
    timestamp: new Date().toISOString(),
  });
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  console.log("Payment failed:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customer: paymentIntent.customer,
    lastPaymentError: paymentIntent.last_payment_error,
  });

  // TODO: Log failed payment, send notification, etc.
}

async function handleCustomerCreated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;

  console.log("Customer created:", {
    id: customer.id,
    email: customer.email,
    name: customer.name,
  });

  // TODO: Add to donor database, send welcome email, etc.
}

async function handleCustomerUpdated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;

  console.log("Customer updated:", {
    id: customer.id,
    email: customer.email,
    name: customer.name,
  });

  // TODO: Update donor information in database
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  console.log("Invoice payment succeeded:", {
    id: invoice.id,
    amount: invoice.amount_paid,
    customer: invoice.customer,
  });

  // TODO: Handle recurring donation success
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;

  console.log("Invoice payment failed:", {
    id: invoice.id,
    amount: invoice.amount_due,
    customer: invoice.customer,
  });

  // TODO: Handle recurring donation failure, send notification
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  console.log("Subscription created:", {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
  });

  // TODO: Set up recurring donation tracking
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  console.log("Subscription updated:", {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
  });

  // TODO: Update recurring donation status
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  console.log("Subscription deleted:", {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
  });

  // TODO: Handle subscription cancellation
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  console.log("Checkout session completed:", {
    id: session.id,
    customer: session.customer,
    paymentIntent: session.payment_intent,
    amountTotal: session.amount_total,
  });

  // TODO: Process completed checkout
}

// Helper function to log donations
async function logDonation(donation: {
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  customerId: string;
  status: string;
  timestamp: string;
}) {
  try {
    // TODO: Implement actual database logging
    console.log("Logging donation:", donation);

    // For now, we'll just log to console
    // In a real implementation, you would save to your database
  } catch (error) {
    console.error("Failed to log donation:", error);
  }
}

// Persist webhook events to data/logs/stripe-events.json (dev/local only)
async function saveWebhookEvent(event: Stripe.Event) {
  // Avoid file writes on serverless/read-only platforms.
  // Allow local dev writes even if NODE_ENV is set to 'production' in .env.
  const isServerless =
    process.env.VERCEL === "1" || process.env.NETLIFY === "true";
  if (isServerless) {
    // In production, rely on the Stripe Events API via /api/stripe/events
    // rather than attempting non-durable local writes.
    return;
  }
  try {
    const dir = path.join(process.cwd(), "data", "logs");
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, "stripe-events.json");

    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(filePath, "utf8");
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch {
      // No existing file; start fresh
      existing = [];
    }

    const entry = {
      id: event.id,
      type: event.type,
      api_version: event.api_version,
      createdAt: new Date().toISOString(),
      data: event.data,
    };

    existing.push(entry);
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("Failed to persist webhook event:", err);
  }
}
