import { NextResponse } from "next/server";

function prefix(key?: string | null, len = 8): string | null {
  if (!key) return null;
  return key.slice(0, len);
}

export async function GET() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecretLive =
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ||
    "";
  const webhookSecretTest = process.env.STRIPE_WEBHOOK_SECRET_TEST || "";

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

  const data = {
    ok: true,
    checkout_locale: "auto",
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
  };

  return NextResponse.json(data);
}
