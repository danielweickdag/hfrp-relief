"use client";

import { useEffect, useState } from "react";

type StripeStatus = {
  ok: boolean;
  checkout_locale: string;
  publishableKey_present: boolean;
  secretKey_present: boolean;
  publishableKey_prefix: string | null;
  secretKey_prefix: string | null;
  mode: "live" | "test" | "unknown" | "mismatch";
  modeMismatch: boolean;
  webhook: {
    live_present: boolean;
    test_present: boolean;
    configured_for_mode: boolean;
  };
};

type Health = {
  ok: boolean;
  node: string;
  uptime_s: number;
  stripe: {
    publishableKey_present: boolean;
    secretKey_present: boolean;
    publishableKey_prefix: string | null;
    secretKey_prefix: string | null;
    mode: "live" | "test" | "unknown" | "mismatch";
    modeMismatch: boolean;
    webhook: {
      live_present: boolean;
      test_present: boolean;
      configured_for_mode: boolean;
    };
  };
  assets: {
    bgVideoPath: string;
    bgVideoResolved: string | null;
    bgVideoExists: boolean;
  };
};

export default function HealthStatus() {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, hRes] = await Promise.all([
          fetch("/api/stripe/status"),
          fetch("/api/health"),
        ]);
        if (sRes.ok) {
          setStripeStatus(await sRes.json());
        }
        if (hRes.ok) {
          setHealth(await hRes.json());
        }
      } catch {}
    })();
  }, []);

  const modeLabel = (m: StripeStatus["mode"]) =>
    m === "mismatch"
      ? "Mode Mismatch"
      : m === "live"
        ? "Live Mode"
        : m === "test"
          ? "Test Mode"
          : "Unknown Mode";

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        System Health
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {stripeStatus ? (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stripeStatus.mode === "live" ? "bg-green-100 text-green-800" : stripeStatus.mode === "test" ? "bg-yellow-100 text-yellow-800" : stripeStatus.mode === "mismatch" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
          >
            {modeLabel(stripeStatus.mode)}
          </span>
        ) : null}

        {stripeStatus && stripeStatus.modeMismatch ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Keys Mismatch
          </span>
        ) : stripeStatus ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Keys Aligned
          </span>
        ) : null}

        {(stripeStatus?.webhook?.configured_for_mode ?? false) ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Webhook Ready
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Webhook Missing
          </span>
        )}

        {health ? (
          health.assets.bgVideoExists ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Background Video Found
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Background Video Missing
            </span>
          )
        ) : null}
      </div>
      {health ? (
        <div className="mt-2 text-xs text-gray-600">
          Node {health.node} • Uptime {health.uptime_s}s
        </div>
      ) : null}
    </div>
  );
}
