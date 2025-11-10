"use client";

import { useEffect, useState } from "react";
import { getStripeEnhanced } from "@/lib/stripeEnhanced";
import Link from "next/link";

export default function WebhookTestPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState<boolean>(false);

  // SSR-stable test mode indicator: derive from env, update after mount
  const initialTestMode = (() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    const flag = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";
    if (key.startsWith("pk_live_")) return false;
    if (key.startsWith("pk_test_")) return true;
    return flag;
  })();
  const [testMode, setTestMode] = useState<boolean>(initialTestMode);

  useEffect(() => {
    const se = getStripeEnhanced();
    if (!se) return;
    try {
      se.loadConfig();
      const cfg = se.getConfig();
      if (cfg && typeof cfg.testMode === "boolean") {
        setTestMode(cfg.testMode);
      }
    } catch {}
  }, []);

  // Fetch server-computed webhook configuration status for SSR-stable rendering
  useEffect(() => {
    fetch('/api/stripe/webhook')
      .then(res => res.json())
      .then(data => {
        if (typeof data.webhookSecretConfigured === 'boolean') {
          setWebhookConfigured(data.webhookSecretConfigured);
        }
      })
      .catch(() => {});
  }, []);

  const testWebhook = async () => {
    setIsLoading(true);
    setTestResult("Testing webhook endpoint...");

    try {
      const response = await fetch("/api/stripe/webhook-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult(
          `✅ Webhook endpoint is working!\n\nResponse: ${JSON.stringify(result, null, 2)}`
        );
      } else {
        setTestResult(
          `❌ Webhook test failed:\n\n${JSON.stringify(result, null, 2)}`
        );
      }
    } catch (error) {
      setTestResult(
        `❌ Error testing webhook:\n\n${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔗 Webhook Configuration Test
          </h1>

          <div className="space-y-6">
            {/* Current Configuration */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Webhook Endpoint Information
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Endpoint URL:</strong>{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    /api/stripe/webhook
                  </code>
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {webhookConfigured ? "✅ Configured" : "⚠️ Missing webhook secret"}
                </p>
                <p>
                  <strong>Environment:</strong>{" "}
                  {testMode ? "🧪 Test Mode" : "🔴 Live Mode"}
                </p>
              </div>
            </div>

            {/* Supported Events */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Supported Webhook Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  checkout.session.completed
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  payment_intent.succeeded
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  payment_intent.payment_failed
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  customer.subscription.created
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  customer.subscription.updated
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  customer.subscription.deleted
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  invoice.payment_succeeded
                </div>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                Stripe Dashboard Setup
              </h2>
              <div className="space-y-2 text-sm text-yellow-800">
                <p>
                  1. Go to{" "}
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    className="text-blue-600 underline" rel="noreferrer"
                  >
                    Stripe Dashboard
                  </a>
                </p>
                <p>
                  2. Make sure you're in <strong>LIVE mode</strong>
                </p>
                <p>
                  3. Navigate to <strong>Developers</strong> →{" "}
                  <strong>Webhooks</strong>
                </p>
                <p>
                  4. Add endpoint:{" "}
                  <code className="bg-yellow-100 px-1 rounded">
                    https://your-domain.com/api/stripe/webhook
                  </code>
                </p>
                <p>5. Select the events listed above</p>
                <p>
                  6. Copy the webhook signing secret to your environment
                  variables
                </p>
              </div>
            </div>

            {/* Test Button */}
            <div className="text-center">
              <button
                onClick={testWebhook}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? "Testing..." : "Test Webhook Endpoint"}
              </button>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Test Results
                </h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-3 rounded border overflow-auto">
                  {testResult}
                </pre>
              </div>
            )}

            {/* Environment Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Environment Status
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Stripe Test Mode:</span>
                  <span className={testMode ? "text-yellow-600" : "text-red-600"}>
                    {testMode ? "🧪 Enabled" : "🔴 Disabled (Live Mode)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Publishable Key:</span>
                  <span className="text-green-600">✅ Configured</span>
                </div>
                <div className="flex justify-between">
                  <span>Webhook Secret:</span>
                  <span className={webhookConfigured ? "text-green-600" : "text-red-600"}>
                    {webhookConfigured ? "✅ Configured" : "❌ Missing"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <span className="mr-2">⚙️</span>
                  Manage in Admin Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
