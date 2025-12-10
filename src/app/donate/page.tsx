"use client";

import { useState, useRef, useEffect } from "react";
import StripeButton from "../_components/StripeButton";
import { getStripeEnhanced } from "@/lib/stripeEnhanced";

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

export default function DonatePage() {
  const stripeEnhanced = getStripeEnhanced();
  const campaignId =
    process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN || "haiti-relief-main";

  const [customAmount, setCustomAmount] = useState<string>("");
  const recurringCardRef = useRef<HTMLDivElement>(null);
  const oneTimeCardRef = useRef<HTMLDivElement>(null);
  const [webhookConfigured, setWebhookConfigured] = useState<boolean>(false);
  const [configStatus, setConfigStatus] = useState<StripeStatus | null>(null);

  // Stabilize SSR/CSR by using an env-derived initial test mode, then update on mount
  const [testMode, setTestMode] = useState<boolean>(
    process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true",
  );
  useEffect(() => {
    if (stripeEnhanced) {
      try {
        const cfg = stripeEnhanced.getConfig();
        setTestMode(!!cfg.testMode);
      } catch {}
    }
  }, [stripeEnhanced]);

  // Fetch webhook configuration status for a small header chip
  useEffect(() => {
    const fetchWebhookStatus = async () => {
      try {
        const res = await fetch("/api/stripe/webhook");
        const data = await res.json();
        if (typeof data.webhookSecretConfigured === "boolean") {
          setWebhookConfigured(data.webhookSecretConfigured);
        }
      } catch {
        // leave default false on error
      }
    };
    fetchWebhookStatus();
  }, []);

  // Fetch broader Stripe configuration status (keys, mode, webhook by mode)
  useEffect(() => {
    const fetchConfigStatus = async () => {
      try {
        const res = await fetch("/api/stripe/status");
        if (res.ok) {
          const data: StripeStatus = await res.json();
          setConfigStatus(data);
        }
      } catch {
        // ignore
      }
    };
    fetchConfigStatus();
  }, []);

  const triggerContainedStripeButton = (container: HTMLDivElement | null) => {
    if (!container) return;
    const stripeButtonWrapper = container.querySelector(
      '[data-automation="stripe-button-recurring"], [data-automation="stripe-button-one-time"]',
    );
    const button = stripeButtonWrapper?.querySelector("button");
    if (button instanceof HTMLButtonElement) {
      button.click();
    }
  };

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "recurring" | "one-time",
  ) => {
    const target = e.target as HTMLElement;
    // If the click originates from any interactive element, let it handle itself
    if (target.closest("button, input, a, select, textarea, label")) return;
    // Otherwise, trigger the contained Stripe button for the respective card
    if (type === "recurring") {
      triggerContainedStripeButton(recurringCardRef.current);
    } else {
      // If one-time amount is invalid/empty, auto-fill a sensible default then proceed
      if (!customValid) {
        const defaultAmount = Math.max(minAmount, 25);
        setCustomAmount(String(defaultAmount));
        // Defer click until state updates
        setTimeout(
          () => triggerContainedStripeButton(oneTimeCardRef.current),
          0,
        );
        return;
      }
      triggerContainedStripeButton(oneTimeCardRef.current);
    }
  };

  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    type: "recurring" | "one-time",
  ) => {
    // Activate on Enter or Space
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (type === "recurring") {
        triggerContainedStripeButton(recurringCardRef.current);
      } else {
        if (!customValid) {
          const defaultAmount = Math.max(minAmount, 25);
          setCustomAmount(String(defaultAmount));
          setTimeout(
            () => triggerContainedStripeButton(oneTimeCardRef.current),
            0,
          );
          return;
        }
        triggerContainedStripeButton(oneTimeCardRef.current);
      }
    }
  };

  // Allow pressing Enter in the input to proceed with a valid custom amount
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (customValid) {
        triggerContainedStripeButton(oneTimeCardRef.current);
      }
    }
  };

  if (!stripeEnhanced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Donations Unavailable
          </h1>
          <p className="text-gray-600 mb-4">
            Stripe payment processing is not currently configured. Please
            contact support.
          </p>
        </div>
      </div>
    );
  }

  const config = stripeEnhanced.getConfig();
  const minAmount = config.minimumAmount || 1;
  const parsedAmount = Number(customAmount);
  const customValid = !isNaN(parsedAmount) && parsedAmount >= minAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top status badges (SSR-stable for mode; webhook fetched on mount) */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {testMode ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                🧪 Test Mode
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🔴 Live Mode
              </span>
            )}
            {configStatus?.modeMismatch ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Mode Mismatch
              </span>
            ) : configStatus ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Keys Aligned
              </span>
            ) : null}
            {(configStatus?.webhook?.configured_for_mode ??
            webhookConfigured) ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Webhook Ready
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Webhook Missing
              </span>
            )}
          </div>
        </div>

        {/* Hero header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Support Haitian Families
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your gift provides food, clean water, medical care, and education.
            Choose the simple Daily 50¢ plan or make a custom one-time donation.
          </p>
        </div>

        {/* Two-column donate options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily 50¢ Recurring */}
          <div
            ref={recurringCardRef}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Donate 50 cents per day"
            data-automation="recurring-card"
            onClick={(e) => handleCardClick(e, "recurring")}
            onKeyDown={(e) => handleCardKeyDown(e, "recurring")}
          >
            <div className="mb-4">
              <div className="text-sm font-semibold text-blue-700">
                Recurring Support
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Daily 50¢ Plan
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Join a community of monthly supporters by contributing just 50¢
              per day. Small daily support adds up to big impact across the
              year.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div> Billed
                daily via Stripe
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div> Cancel
                anytime
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>{" "}
                Supports food and healthcare
              </li>
            </ul>
            <div data-automation="stripe-button-recurring">
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
          </div>

          {/* Custom One-Time Donation */}
          <div
            ref={oneTimeCardRef}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Make a one-time donation"
            data-automation="one-time-card"
            onClick={(e) => handleCardClick(e, "one-time")}
            onKeyDown={(e) => handleCardKeyDown(e, "one-time")}
          >
            <div className="mb-4">
              <div className="text-sm font-semibold text-red-700">
                One-Time Gift
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Custom One-Time
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Make a one-time donation of any amount to support urgent needs.
            </p>

            <div className="mb-4">
              <label
                htmlFor="customAmount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount (minimum ${minAmount})
              </label>
              <div className="flex gap-3">
                <input
                  id="customAmount"
                  type="number"
                  min={minAmount}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter amount in USD"
                />
              </div>
              {!customValid && customAmount && (
                <p className="text-sm text-red-600 mt-2">
                  Please enter an amount of at least ${minAmount}.
                </p>
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

            <div data-automation="stripe-button-one-time">
              <StripeButton
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg text-lg"
                campaignId={campaignId}
                amount={customValid ? parsedAmount : undefined}
                disabled={!customValid}
              >
                {customValid
                  ? `Donate $${parsedAmount.toFixed(2)}`
                  : `Enter at least $${minAmount}`}
              </StripeButton>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-10 text-sm text-gray-500 text-center">
          Payments are processed securely by Stripe. No sensitive information is
          stored on our servers.
        </div>
      </div>
    </div>
  );
}
