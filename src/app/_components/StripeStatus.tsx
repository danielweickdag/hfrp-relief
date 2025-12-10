"use client";

import { useEffect, useState } from "react";
import { getStripeEnhanced } from "@/lib/stripeEnhanced";

interface StripeStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function StripeStatus({
  showDetails = true,
  className = "",
}: StripeStatusProps) {
  const stripeEnhanced = getStripeEnhanced();

  // SSR-stable test mode: derive from env, then update after mount
  const initialTestMode = (() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    const flag = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";
    if (key.startsWith("pk_live_")) return false;
    if (key.startsWith("pk_test_")) return true;
    return flag;
  })();
  const [testMode, setTestMode] = useState<boolean>(initialTestMode);

  if (!stripeEnhanced) {
    return (
      <div
        className={`bg-red-50 rounded-lg border border-red-200 p-4 ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">❌</span>
          <h4 className="font-semibold text-red-900">Stripe Not Configured</h4>
        </div>
        <p className="text-red-800 text-sm">
          Stripe integration is not available. Please configure your Stripe
          environment variables.
        </p>
      </div>
    );
  }

  const config = stripeEnhanced.getConfig();
  const validation = stripeEnhanced.validateConfig();

  useEffect(() => {
    try {
      stripeEnhanced.loadConfig();
      const cfg = stripeEnhanced.getConfig();
      setTestMode(cfg.testMode);
    } catch {}
  }, []);

  return (
    <div
      className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <h4 className="font-semibold text-gray-900">
            Stripe Integration Status
          </h4>
        </div>
        {testMode ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Test Mode
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Live Mode
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-600">Publishable Key</div>
          <div className="font-mono text-gray-900 break-all">
            {config.publishableKey ? config.publishableKey : "Not configured"}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Webhook Secret</div>
          <div className="font-mono text-gray-900 break-all">
            {config.webhookSecret ? "Configured" : "Not configured"}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4">
          {!validation.isValid ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
              <div className="font-semibold mb-1">Configuration Issues</div>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
              ✅ Stripe configuration looks good
            </div>
          )}

          {validation.warnings && validation.warnings.length > 0 && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              <div className="font-semibold mb-1">Warnings</div>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
