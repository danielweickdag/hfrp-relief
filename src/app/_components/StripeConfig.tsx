"use client";

import { useState, useEffect } from "react";
import { stripeService } from "@/lib/stripeConfig";

export default function StripeConfig() {
  const [config, setConfig] = useState(stripeService.getConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testConnection, setTestConnection] = useState<{
    testing: boolean;
    success?: boolean;
    error?: string;
  }>({ testing: false });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      stripeService.updateConfig(config);
      alert("Stripe configuration saved successfully!");
    } catch (error) {
      alert("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestConnection({ testing: true });

    try {
      // Validate configuration
      const validation = stripeService.validateConfig();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Test creating a payment intent
      await stripeService.createPaymentIntent(100); // Test with $1.00

      setTestConnection({ testing: false, success: true });
    } catch (error) {
      setTestConnection({
        testing: false,
        success: false,
        error:
          error instanceof Error ? error.message : "Connection test failed",
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Stripe Configuration</h2>

      <div className="space-y-4">
        {/* Test Mode Toggle */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.isTestMode}
              onChange={(e) =>
                setConfig({ ...config, isTestMode: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm">Test Mode</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Enable test mode to use Stripe test keys and process test payments
          </p>
        </div>

        {/* Publishable Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Publishable Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={config.publishableKey}
              onChange={(e) =>
                setConfig({ ...config, publishableKey: e.target.value })
              }
              placeholder={config.isTestMode ? "pk_test_..." : "pk_live_xxx_REDACTED_xxx..."}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              {showKey ? "🙈" : "👁️"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your Stripe publishable key (starts with pk_test_ or pk_live_xxx_REDACTED_xxx)
          </p>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={config.currency}
            onChange={(e) => setConfig({ ...config, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="usd">USD - US Dollar</option>
            <option value="eur">EUR - Euro</option>
            <option value="gbp">GBP - British Pound</option>
            <option value="cad">CAD - Canadian Dollar</option>
            <option value="aud">AUD - Australian Dollar</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            value={config.country}
            onChange={(e) => setConfig({ ...config, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="EU">European Union</option>
            <option value="AU">Australia</option>
          </select>
        </div>

        {/* Test Connection */}
        <div className="pt-4 border-t">
          <button
            onClick={handleTestConnection}
            disabled={testConnection.testing}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {testConnection.testing ? "Testing..." : "Test Connection"}
          </button>

          {testConnection.success && (
            <p className="mt-2 text-sm text-green-600">
              ✓ Connection successful!
            </p>
          )}

          {testConnection.error && (
            <p className="mt-2 text-sm text-red-600">
              ✗ {testConnection.error}
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-medium text-blue-900 mb-2">Setup Instructions:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>
            Create a Stripe account at{" "}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              stripe.com
            </a>
          </li>
          <li>Get your API keys from the Stripe Dashboard</li>
          <li>Use test keys (pk_test_) for development</li>
          <li>Switch to live keys (pk_live_xxx_REDACTED_xxx) for production</li>
          <li>
            Configure webhooks in Stripe Dashboard for donation notifications
          </li>
        </ol>
      </div>
    </div>
  );
}
