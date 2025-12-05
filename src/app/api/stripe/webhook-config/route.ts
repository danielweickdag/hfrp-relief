import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

// Minimal, efficient event set for HFRP donation flow
type EnabledEvent = Stripe.WebhookEndpointCreateParams.EnabledEvent;
const DEFAULT_WEBHOOK_EVENTS: EnabledEvent[] = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "invoice.payment_succeeded",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!key || key === "your_stripe_secret_key_here") return null;
  try {
    return new Stripe(key, { typescript: true });
  } catch {
    return null;
  }
}

function getSiteUrl(req?: NextRequest): string {
  // Prefer explicit env; fallback to localhost with dev port
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.DOMAIN;
  if (envUrl) return envUrl;
  // Try to infer from request headers (for preview/local)
  const host = req?.headers.get("host") || "localhost:3005";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

function isDevUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    !u.startsWith("https://") ||
    u.includes("localhost") ||
    u.includes("127.0.0.1") ||
    u.includes("0.0.0.0")
  );
}

const ALLOWED_EVENTS: EnabledEvent[] = [
  ...DEFAULT_WEBHOOK_EVENTS,
  // permit additional safe events if needed
  "payment_intent.payment_failed",
  "invoice.payment_failed",
  "customer.created",
  "customer.updated",
];

function isEnabledEvent(e: unknown): e is EnabledEvent {
  return (
    typeof e === "string" && (ALLOWED_EVENTS as readonly string[]).includes(e)
  );
}

function validateEvents(requested?: unknown): EnabledEvent[] {
  if (!Array.isArray(requested)) return DEFAULT_WEBHOOK_EVENTS;
  const filtered = requested.filter(isEnabledEvent);
  return filtered.length ? filtered : DEFAULT_WEBHOOK_EVENTS;
}

export async function GET(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", configured: false },
      { status: 503 }
    );
  }

  const siteUrl = getSiteUrl(req);
  const targetUrl = `${siteUrl}/api/stripe/webhook`;

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const matching = endpoints.data.filter((e) => e.url === targetUrl);

    return NextResponse.json({
      configured: matching.length > 0,
      count: matching.length,
      targetUrl,
      endpoints: matching.map((e) => ({
        id: e.id,
        status: e.status,
        enabled_events: e.enabled_events,
      })),
      recommended_events: DEFAULT_WEBHOOK_EVENTS,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list webhook endpoints",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", configured: false },
      { status: 503 }
    );
  }

  let payload: { events?: unknown } = {};
  try {
    payload = await req.json();
  } catch {
    // ignore; use defaults
  }

  const enabled_events = validateEvents(payload.events);
  const siteUrl = getSiteUrl(req);
  const targetUrl = `${siteUrl}/api/stripe/webhook`;

  // In development/local environments, Stripe cannot create webhook endpoints
  // for non-public or non-HTTPS URLs. Provide guidance instead of erroring.
  if (isDevUrl(siteUrl) || process.env.NODE_ENV !== "production") {
    return NextResponse.json({
      dev_mode: true,
      action: "noop",
      targetUrl,
      enabled_events,
      message:
        "Development environment detected. Use Stripe CLI to forward events (stripe listen --forward-to /api/stripe/webhook) or set NEXT_PUBLIC_SITE_URL to a public HTTPS domain before configuring endpoints.",
      docs: {
        stripe_cli: "https://stripe.com/docs/stripe-cli#listen",
        webhooks: "https://stripe.com/docs/webhooks",
      },
    });
  }

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const existing = endpoints.data.find((e) => e.url === targetUrl);

    if (existing) {
      const updated = await stripe.webhookEndpoints.update(existing.id, {
        enabled_events,
        description: "HFRP Webhook (auto-configured)",
      });
      return NextResponse.json({
        action: "updated",
        id: updated.id,
        url: updated.url,
        enabled_events: updated.enabled_events,
        status: updated.status,
      });
    }

    const created = await stripe.webhookEndpoints.create({
      url: targetUrl,
      enabled_events,
      description: "HFRP Webhook (auto-configured)",
    });

    return NextResponse.json({
      action: "created",
      id: created.id,
      url: created.url,
      enabled_events: created.enabled_events,
      status: created.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to configure webhook endpoint",
      },
      { status: 500 }
    );
  }
}
