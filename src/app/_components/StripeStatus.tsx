"use client";

import { stripeEnhanced } from "@/lib/stripeEnhanced";

interface StripeStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function StripeStatus({
  showDetails = true,
  className = "",
}: StripeStatusProps) {
  const config = stripeEnhanced.getConfig();
  const validation = stripeEnhanced.validateConfig();

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <h4 className="font-semibold text-gray-900">Stripe Integration Status</h4>
        </div>
        {config.testMode ? (
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
                {validation.errors.map((e, i) => (
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
                {validation.warnings.map((w, i) => (
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