import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

function prefix(key?: string | null, len = 8): string | null {
  if (!key) return null;
  return key.slice(0, len);
}

export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecretLive = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_LIVE || "";
  const webhookSecretTest = process.env.STRIPE_WEBHOOK_SECRET_TEST || "";
  const bgVideoPath = process.env.NEXT_PUBLIC_BG_VIDEO_PATH || "";

  const publishableMode = publishableKey.startsWith("pk_live_")
    ? "live"
    : publishableKey.startsWith("pk_test_")
      ? "test"
      : "unknown";
  const secretMode = secretKey.startsWith("sk_live_")
    ? "live"
    : secretKey.startsWith("sk_test_")
      ? "test"
      : "unknown";

  const modeMismatch =
    publishableMode !== "unknown" &&
    secretMode !== "unknown" &&
    publishableMode !== secretMode;

  const webhookConfiguredForMode =
    (publishableMode === "live" && !!webhookSecretLive) ||
    (publishableMode === "test" && !!webhookSecretTest);

  // Background video asset existence check under public/
  let bgVideoExists = false;
  let bgVideoResolved: string | null = null;
  if (bgVideoPath) {
    try {
      const rel = bgVideoPath.startsWith("/") ? bgVideoPath.slice(1) : bgVideoPath;
      const full = path.join(process.cwd(), "public", rel);
      bgVideoResolved = full;
      await fs.access(full);
      bgVideoExists = true;
    } catch {
      bgVideoExists = false;
    }
  }

  const data = {
    ok: true,
    node: process.version,
    uptime_s: Math.floor(process.uptime()),
    stripe: {
      publishableKey_present: !!publishableKey,
      secretKey_present: !!secretKey,
      publishableKey_prefix: prefix(publishableKey),
      secretKey_prefix: prefix(secretKey),
      mode: modeMismatch ? "mismatch" : publishableMode,
      modeMismatch,
      webhook: {
        live_present: !!webhookSecretLive,
        test_present: !!webhookSecretTest,
        configured_for_mode: webhookConfiguredForMode,
      },
    },
    assets: {
      bgVideoPath,
      bgVideoResolved,
      bgVideoExists,
    },
  };

  return NextResponse.json(data);
}

