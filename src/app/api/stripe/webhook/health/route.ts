import { NextResponse } from "next/server";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const adminTokenHeader = request.headers.get("x-admin-health-token") || "";
  const expectedToken = process.env.ADMIN_HEALTH_TOKEN || "";

  if (!expectedToken || adminTokenHeader !== expectedToken) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const isServerless =
    process.env.VERCEL === "1" || process.env.NETLIFY === "true";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const configManager = getStripeConfigManager();
  const config = configManager?.getConfig();

  const secrets = {
    default: !!(process.env.STRIPE_WEBHOOK_SECRET || "").trim(),
    test: !!(process.env.STRIPE_WEBHOOK_SECRET_TEST || "").trim(),
    live: !!(process.env.STRIPE_WEBHOOK_SECRET_LIVE || "").trim(),
    config: !!(config?.webhookSecret || "").trim(),
  };

  const flags = {
    debugSignature:
      process.env.WEBHOOK_DEBUG_SIGNATURE === "true" ||
      process.env.WEBHOOK_DEBUG_SIGNATURE === "1",
    devBypassVarPresent: process.env.ENABLE_DEV_WEBHOOK_BYPASS === "true",
    serverless: isServerless,
  };

  const account =
    process.env.STRIPE_CONNECTED_ACCOUNT_ID ||
    process.env.NEXT_PUBLIC_STRIPE_CONNECTED_ACCOUNT_ID ||
    "";

  return NextResponse.json({
    ok: true,
    publishableKey,
    secrets,
    flags,
    account,
  });
}
