"use client";

import { useState, useEffect } from "react";
import {
  getStripeEnhanced,
  type StripeCampaign,
  type StripeEvent,
} from "@/lib/stripeEnhanced";
import StripeButton from "./StripeButton";

interface StripeDashboardProps {
  className?: string;
}

export default function StripeDashboard({
  className = "",
}: StripeDashboardProps) {
  const stripe = getStripeEnhanced();
  const [campaigns, setCampaigns] = useState<StripeCampaign[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    totalDonors: 0,
    averageDonation: 0,
  });
  const [config, setConfig] = useState(
    () => stripe?.getConfig() ?? ({ testMode: false } as any),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  // SSR-stable test mode badge: derive from env, then update after mount
  const initialTestMode = (() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    const flag = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";
    if (key.startsWith("pk_live_")) return false;
    if (key.startsWith("pk_test_")) return true;
    return flag;
  })();
  const [testMode, setTestMode] = useState<boolean>(initialTestMode);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);

    // Ensure latest config, then update SSR-stable testMode state
    try {
      stripe?.loadConfig();
      const cfg = stripe?.getConfig();
      if (cfg) {
        setConfig(cfg);
        setTestMode(cfg.testMode);
      }
    } catch {}

    // Load campaigns
    const campaignData = stripe?.getCampaigns() ?? [];
    setCampaigns(campaignData);

    // Update stats
    const statsData = stripe?.getDonationStats() ?? {
      totalDonations: 0,
      totalAmount: 0,
      totalDonors: 0,
      averageDonation: 0,
    };
    setStats(statsData);

    // Set default campaign
    if (campaignData.length > 0 && !selectedCampaign) {
      setSelectedCampaign(campaignData[0].id);
    }

    setIsLoading(false);
  };

  const updateConfig = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    stripe?.updateConfig(updates);
  };

  const validation = stripe?.validateConfig() ?? { isValid: false };
  const validationErrors =
    !validation.isValid && Array.isArray((validation as any).errors)
      ? ((validation as any).errors as unknown[])
      : ([] as unknown[]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading Stripe Dashboard...</span>
      </div>
    );
  }

  if (!stripe) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Stripe Not Configured
          </h2>
          <p className="text-gray-600">
            Please check your Stripe environment variables and configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Stripe Dashboard
            </h2>
            <p className="text-gray-600">
              Manage donations, campaigns, and settings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {testMode ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                🧪 Test Mode
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🔴 Live Mode
              </span>
            )}

            {!validation.isValid && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                ⚠️ Config Issues
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Raised</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-medium">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Donations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalDonations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-medium">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Donors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalDonors.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-medium">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.averageDonation.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Campaigns
            </h3>
            <p className="text-sm text-gray-600">
              Manage your donation campaigns
            </p>
          </div>
          <div className="p-6 space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCampaign === campaign.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedCampaign(campaign.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {campaign.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {campaign.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>${campaign.raised.toLocaleString()}</span>
                    <span>${campaign.goal.toLocaleString()} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Testing */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Test Donations
            </h3>
            <p className="text-sm text-gray-600">
              Test your Stripe integration
            </p>
          </div>
          <div className="p-6 space-y-4">
            {selectedCampaign && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Campaign
                  </label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    One-time Donations
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[25, 50, 100, 250].map((amount) => (
                      <StripeButton
                        key={amount}
                        campaignId={selectedCampaign}
                        amount={amount}
                        className="text-sm"
                      >
                        ${amount}
                      </StripeButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Monthly Recurring
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[15, 25, 50, 100].map((amount) => (
                      <StripeButton
                        key={`recurring-${amount}`}
                        campaignId={selectedCampaign}
                        amount={amount}
                        recurring={true}
                        interval="month"
                        className="text-sm"
                      >
                        ${amount}/mo
                      </StripeButton>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Test Cards Info */}
            {testMode && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2">Test Cards</h5>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>
                    <strong>Success:</strong> 4242 4242 4242 4242
                  </p>
                  <p>
                    <strong>Declined:</strong> 4000 0000 0000 0002
                  </p>
                  <p>
                    <strong>3D Secure:</strong> 4000 0025 0000 3155
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
          <p className="text-sm text-gray-600">Manage Stripe settings</p>
        </div>
        <div className="p-6 space-y-4">
          {/* Test Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Test Mode
              </label>
              <p className="text-xs text-gray-500">
                Use test API keys and test cards
              </p>
            </div>
            <button
              onClick={() => updateConfig({ testMode: !config.testMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.testMode ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.testMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Publishable Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publishable Key
            </label>
            <input
              type="text"
              value={config.publishableKey}
              onChange={(e) => updateConfig({ publishableKey: e.target.value })}
              placeholder="pk_test_..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Validation Errors */}
          {!validation.isValid && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h5 className="font-medium text-red-800 mb-2">
                Configuration Issues
              </h5>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error: any, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success State */}
          {validation.isValid && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Stripe configuration is valid and ready to use!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
