"use client";

import { useState } from "react";
import StripeButton from "../_components/StripeButton";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export default function DonatePage() {
  const config = stripeEnhanced.getConfig();
  const campaignId =
    process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN || "haiti-relief-main";

  const [customAmount, setCustomAmount] = useState<string>("");
  const minAmount = config.minimumAmount || 1;
  const parsedAmount = Number(customAmount);
  const customValid = !isNaN(parsedAmount) && parsedAmount >= minAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top status badge */}
        <div className="mb-6">
          {config.testMode ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">🧪 Test Mode</span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">🔴 Live Mode</span>
          )}
        </div>

        {/* Hero header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Support Haitian Families</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your gift provides food, clean water, medical care, and education.
            Choose the simple Daily 50¢ plan or make a custom one-time donation.
          </p>
        </div>

        {/* Two-column donate options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily 50¢ Recurring */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-4">
              <div className="text-sm font-semibold text-blue-700">Recurring Support</div>
              <h2 className="text-2xl font-bold text-gray-900">Daily 50¢ Plan</h2>
            </div>
            <p className="text-gray-600 mb-6">Join a community of monthly supporters by contributing just 50¢ per day. Small daily support adds up to big impact across the year.</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-600"></div> Billed daily via Stripe</li>
              <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-600"></div> Cancel anytime</li>
              <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-600"></div> Supports food and healthcare</li>
            </ul>
            <StripeButton
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg text-lg"
              campaignId={campaignId}
              amount={0.5}
              recurring
              interval="day"
            >
              Donate 50¢/day
            </StripeButton>
          </div>

          {/* Custom One-Time Donation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-4">
              <div className="text-sm font-semibold text-red-700">One-Time Gift</div>
              <h2 className="text-2xl font-bold text-gray-900">Custom One-Time</h2>
            </div>
            <p className="text-gray-600 mb-4">Make a one-time donation of any amount to support urgent needs.</p>

            <div className="mb-4">
              <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">Amount (minimum ${minAmount})</label>
              <div className="flex gap-3">
                <input
                  id="customAmount"
                  type="number"
                  min={minAmount}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter amount in USD"
                />
              </div>
              {!customValid && customAmount && (
                <p className="text-sm text-red-600 mt-2">Please enter an amount of at least ${minAmount}.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {[25, 50, 100, 250].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomAmount(String(preset))}
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                >
                  ${preset}
                </button>
              ))}
            </div>

            <StripeButton
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg text-lg"
              campaignId={campaignId}
              amount={customValid ? parsedAmount : undefined}
              disabled={!customValid}
            >
              {customValid ? `Donate $${parsedAmount.toFixed(2)}` : `Enter at least $${minAmount}`}
            </StripeButton>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-10 text-sm text-gray-500 text-center">
          Payments are processed securely by Stripe. No sensitive information is stored on our servers.
        </div>
      </div>
    </div>
  );
}
