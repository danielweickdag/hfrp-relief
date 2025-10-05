"use client";

import { useState } from "react";
import StripeButton from "../_components/StripeButton";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

export default function DonatePage() {
  const config = stripeEnhanced.getConfig();
  const campaignId =
    process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN || "haiti-relief-main";

  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<"daily" | "custom">("daily");
  const minAmount = config.minimumAmount || 1;
  const parsedAmount = Number(customAmount);
  const customValid = !isNaN(parsedAmount) && parsedAmount >= minAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            {config.testMode ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                🧪 Test Mode
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🔴 Live Mode
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Support Haitian Families
          </h1>
          <p className="text-gray-600 mb-8">
            Your donation provides food, water, healthcare, and education to
            families in Haiti. Choose 50¢ daily support or set a custom one-time amount.
          </p>

          {/* Selection toggle */}
          <div className="mb-6">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-700 mb-2">Choose a donation option</legend>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="donationOption"
                    value="daily"
                    checked={selectedOption === "daily"}
                    onChange={() => setSelectedOption("daily")}
                  />
                  <span className="text-gray-800">Daily 50¢ recurring</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="donationOption"
                    value="custom"
                    checked={selectedOption === "custom"}
                    onChange={() => setSelectedOption("custom")}
                  />
                  <span className="text-gray-800">Custom one-time</span>
                </label>
              </div>
            </fieldset>
          </div>

          {/* Custom amount input (conditional) */}
          {selectedOption === "custom" && (
            <div className="mb-6">
              <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount (minimum ${minAmount})
              </label>
              <input
                id="customAmount"
                type="number"
                min={minAmount}
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter amount (USD)`}
              />
              {!customValid && customAmount && (
                <p className="text-sm text-red-600 mt-2">Please enter an amount of at least ${minAmount}.</p>
              )}
            </div>
          )}

          {/* Single action button */}
          <div className="mb-8">
            {selectedOption === "daily" ? (
              <StripeButton
                campaignId={campaignId}
                amount={0.5}
                recurring
                interval="day"
              >
                Donate 50¢/day
              </StripeButton>
            ) : (
              <StripeButton
                campaignId={campaignId}
                amount={customValid ? parsedAmount : undefined}
                disabled={!customValid}
              >
                {customValid ? `Donate $${parsedAmount.toFixed(2)}` : `Enter at least $${minAmount}`}
              </StripeButton>
            )}
          </div>

          {/* Security note */}
          <div className="mt-8 text-sm text-gray-500">
            Payments are processed securely by Stripe. No sensitive information
            is stored on our servers.
          </div>
        </div>
      </div>
    </div>
  );
}
