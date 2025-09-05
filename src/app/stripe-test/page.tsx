"use client";

import { useState } from "react";
import StripeButton from "@/app/_components/StripeButton";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export default function StripeTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  // Get available campaign IDs
  const availableCampaignIds = stripeEnhanced.getCampaignIds();
  const campaigns = stripeEnhanced.getCampaigns();

  // Test fallback behavior
  const testCampaignFallback = async (campaignId: string) => {
    try {
      const result = await stripeEnhanced.testCampaignFallback(campaignId);
      const message = `✅ Campaign "${campaignId}": ${result.originalExists ? "Found original" : "Used fallback"} - ${result.campaignUsed.name}`;
      setTestResults((prev) => [...prev, message]);
      console.log(message, result);
    } catch (error) {
      const message = `❌ Campaign "${campaignId}": ${error instanceof Error ? error.message : "Unknown error"}`;
      setTestResults((prev) => [...prev, message]);
      console.error(message);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);

    // Test with valid campaign IDs
    for (const campaignId of availableCampaignIds.slice(0, 2)) {
      await testCampaignFallback(campaignId);
    }

    // Test with invalid campaign IDs
    await testCampaignFallback("invalid-campaign-1");
    await testCampaignFallback("non-existent-campaign");
    await testCampaignFallback("test-fallback-campaign");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Stripe Button Testing</h1>
        <p className="text-xl text-gray-600">
          Test the StripeButton component with various campaign configurations
        </p>
      </div>

      {/* Available Campaigns */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Available Campaigns</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">Campaign IDs:</h3>
            <ul className="text-sm space-y-1">
              {availableCampaignIds.map((id) => (
                <li key={id} className="font-mono bg-white px-2 py-1 rounded">
                  {id}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Campaign Details:</h3>
            <div className="text-sm space-y-2">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white p-2 rounded">
                  <div className="font-semibold">{campaign.name}</div>
                  <div className="text-gray-600 text-xs">ID: {campaign.id}</div>
                  <div className="text-gray-600 text-xs">
                    Status: {campaign.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Method Testing */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">API Method Testing</h2>
          <button
            onClick={runAllTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Fallback Tests
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="text-sm space-y-1 font-mono">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    result.includes("✅")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test with Valid Campaign IDs */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Test with Valid Campaign IDs</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{campaign.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {campaign.description}
              </p>

              <div className="space-y-2">
                <StripeButton campaignId={campaign.id} amount={50}>
                  Donate $50
                </StripeButton>

                <StripeButton
                  campaignId={campaign.id}
                  amount={25}
                  recurring={true}
                >
                  $25/month
                </StripeButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test with Invalid Campaign ID */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Test with Invalid Campaign ID</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Non-existent Campaign</h3>
          <p className="text-sm text-gray-600 mb-4">
            This should use fallback campaign logic since "invalid-campaign-id"
            doesn't exist.
          </p>

          <div className="space-y-2">
            <StripeButton campaignId="invalid-campaign-id" amount={25}>
              Test Invalid Campaign
            </StripeButton>

            <StripeButton
              campaignId="another-invalid-id"
              amount={100}
              recurring={true}
            >
              Test Another Invalid ID
            </StripeButton>
          </div>
        </div>
      </div>

      {/* Test Different Amounts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Test Different Amounts</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[10, 25, 50, 100].map((amount) => (
            <div key={amount} className="bg-white border rounded-lg p-4">
              <StripeButton campaignId="haiti-relief-main" amount={amount}>
                ${amount} Donation
              </StripeButton>
            </div>
          ))}
        </div>
      </div>

      {/* Test Recurring vs One-time */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Test Recurring vs One-time</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">One-time Donations</h3>
            <div className="space-y-2">
              <StripeButton campaignId="haiti-relief-main" amount={25}>
                One-time $25
              </StripeButton>
              <StripeButton campaignId="haiti-relief-main" amount={50}>
                One-time $50
              </StripeButton>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Recurring Donations</h3>
            <div className="space-y-2">
              <StripeButton
                campaignId="haiti-relief-main"
                amount={25}
                recurring={true}
              >
                $25/month
              </StripeButton>
              <StripeButton
                campaignId="haiti-relief-main"
                amount={50}
                recurring={true}
                interval="year"
              >
                $50/year
              </StripeButton>
            </div>
          </div>
        </div>
      </div>

      {/* Console Output Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Testing Instructions</h3>
        <ul className="text-sm space-y-1">
          <li>• Open browser developer tools to see console output</li>
          <li>
            • Click buttons to test campaign validation and fallback logic
          </li>
          <li>
            • Invalid campaign IDs should show warning messages and use fallback
          </li>
          <li>• Valid campaign IDs should proceed normally</li>
          <li>
            • Check for "Available campaign IDs" in console when fallback is
            used
          </li>
        </ul>
      </div>
    </div>
  );
}
