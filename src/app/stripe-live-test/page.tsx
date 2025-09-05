"use client";

import { useState } from "react";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export default function StripeLiveTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Get current configuration
  const config = stripeEnhanced.getConfig();
  const validation = stripeEnhanced.validateConfig();

  // Detect if using live keys
  const isUsingLiveKey = config.publishableKey.includes("live");
  const isInTestMode = config.testMode;

  const runConfigurationTest = () => {
    const results: string[] = [];

    results.push("🔧 STRIPE CONFIGURATION TEST");
    results.push("================================");

    // Key analysis
    if (isUsingLiveKey) {
      results.push(
        "🚀 LIVE KEY DETECTED: " +
          config.publishableKey.substring(0, 20) +
          "..."
      );
      results.push("⚠️  REAL PAYMENTS WILL BE PROCESSED");
    } else {
      results.push(
        "🧪 TEST KEY: " + config.publishableKey.substring(0, 20) + "..."
      );
      results.push("✅ Safe for testing - No real charges");
    }

    // Mode analysis
    results.push(
      `📊 Test Mode Setting: ${isInTestMode ? "ENABLED" : "DISABLED"}`
    );

    // Validation results
    if (validation.isValid) {
      results.push("✅ Configuration is valid");
    } else {
      results.push("❌ Configuration has errors:");
      validation.errors.forEach((error) => results.push(`   • ${error}`));
    }

    if (validation.warnings && validation.warnings.length > 0) {
      results.push("⚠️  Warnings:");
      validation.warnings.forEach((warning) => results.push(`   • ${warning}`));
    }

    // Live mode recommendations
    if (isUsingLiveKey) {
      results.push("");
      results.push("🔒 LIVE MODE CHECKLIST:");
      results.push("• Ensure you have your secret key (sk_live_xxx_REDACTED_xxx...)");
      results.push("• Set up webhooks in Stripe dashboard");
      results.push("• Test with small amounts first");
      results.push("• Monitor Stripe dashboard closely");
      results.push("• Set NEXT_PUBLIC_STRIPE_TEST_MODE=false");
    }

    setTestResults(results);
  };

  const testCampaignFallback = async () => {
    try {
      const result =
        await stripeEnhanced.testCampaignFallback("test-live-campaign");
      const message = `✅ Campaign fallback test: ${result.fallbackUsed ? "Used fallback" : "Found original"} - ${result.campaignUsed.name}`;
      setTestResults((prev) => [...prev, "", "🧪 CAMPAIGN TEST:", message]);
    } catch (error) {
      const message = `❌ Campaign test failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      setTestResults((prev) => [...prev, "", "🧪 CAMPAIGN TEST:", message]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          {isUsingLiveKey
            ? "🚀 Live Stripe Configuration"
            : "🧪 Test Stripe Configuration"}
        </h1>
        <p className="text-xl text-gray-600">
          {isUsingLiveKey
            ? "⚠️ Live payments are enabled - Real charges will be made!"
            : "Safe testing environment - No real charges will be made"}
        </p>
      </div>

      {/* Configuration Overview */}
      <div
        className={`rounded-lg p-6 ${
          isUsingLiveKey
            ? "bg-red-50 border border-red-200"
            : "bg-blue-50 border border-blue-200"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          {isUsingLiveKey ? "🚀" : "🧪"} Current Configuration
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Key Information</h3>
            <p className="text-sm">
              <span className="font-medium">Publishable Key:</span>{" "}
              {config.publishableKey.substring(0, 25)}...
            </p>
            <p className="text-sm">
              <span className="font-medium">Mode:</span>{" "}
              {isInTestMode ? "Test" : "Live"} Mode
            </p>
            <p className="text-sm">
              <span className="font-medium">Currency:</span> {config.currency}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Status</h3>
            <p
              className={`text-sm font-medium ${
                validation.isValid ? "text-green-600" : "text-red-600"
              }`}
            >
              {validation.isValid
                ? "✅ Valid Configuration"
                : "❌ Configuration Errors"}
            </p>
            {validation.warnings && validation.warnings.length > 0 && (
              <p className="text-sm text-yellow-600">
                ⚠️ {validation.warnings.length} Warning(s)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={runConfigurationTest}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔧 Run Configuration Test
          </button>

          <button
            onClick={testCampaignFallback}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🧪 Test Campaign System
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {testResults.join("\n")}
          </div>
        </div>
      )}

      {/* Live Mode Warning */}
      {isUsingLiveKey && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-800 mb-2">
            ⚠️ LIVE MODE ACTIVE
          </h3>
          <p className="text-red-700 mb-4">
            You are using a live Stripe key. Any donations made will process
            real payments.
          </p>
          <div className="space-y-2 text-sm text-red-600">
            <p>• Make sure you have configured your secret key (sk_live_xxx_REDACTED_xxx...)</p>
            <p>• Set up webhooks in your Stripe dashboard</p>
            <p>• Test with small amounts first ($1-5)</p>
            <p>• Monitor your Stripe dashboard for transactions</p>
          </div>
        </div>
      )}
    </div>
  );
}
