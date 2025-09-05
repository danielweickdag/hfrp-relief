"use client";

import { useEffect, useState } from "react";
import { useAnalytics } from "./AnalyticsProvider";

interface DonorboxButtonProps {
  className?: string;
  children: React.ReactNode;
  campaignId?: string;
  amount?: number;
  recurring?: boolean;
  variant?: "popup" | "redirect" | "embed";
}

export default function DonorboxButton({
  className = "",
  children,
  campaignId, // Will be set based on context or default to main campaign
  amount,
  recurring = false,
  variant = "popup",
}: DonorboxButtonProps) {
  // Use environment variables for campaign IDs
  const defaultCampaignId =
    process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN || "hfrp-haiti-relief-fund";
  const finalCampaignId = campaignId || defaultCampaignId;

  // Test mode detection - controlled by environment variable
  const isTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";
  const [isLoading, setIsLoading] = useState(false);

  // Analytics integration - with fallback if provider not available
  let trackDonationClick:
    | ((
        amount: number,
        type: "one_time" | "recurring",
        buttonId: string
      ) => void)
    | undefined;
  let trackDonationIntent:
    | ((amount: number, type: "one_time" | "recurring", source: string) => void)
    | undefined;
  let trackDonationFormOpen:
    | ((amount: number, type: "one_time" | "recurring") => void)
    | undefined;

  try {
    const analytics = useAnalytics();
    trackDonationClick = analytics.trackDonationClick;
    trackDonationIntent = analytics.trackDonationIntent;
    trackDonationFormOpen = analytics.trackDonationFormOpen;
  } catch (error) {
    // Fallback functions if AnalyticsProvider is not available
    trackDonationClick = (
      amount: number,
      type: "one_time" | "recurring",
      buttonId: string
    ) => {};
    trackDonationIntent = (
      amount: number,
      type: "one_time" | "recurring",
      source: string
    ) => {};
    trackDonationFormOpen = (
      amount: number,
      type: "one_time" | "recurring"
    ) => {};
  }

  useEffect(() => {
    // Load Donorbox script with enhanced browser compatibility and fallback handling
    if (
      typeof window !== "undefined" &&
      !document.querySelector('script[src*="donorbox"]')
    ) {
      const script = document.createElement("script");
      script.src = "https://donorbox.org/widget.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        console.log("✅ Donorbox script loaded successfully");
        // Test if Donorbox API is available
        if (window.Donorbox) {
          console.log("✅ Donorbox API ready");
          window.donorboxReady = true;
        }
      };

      script.onerror = () => {
        console.warn(
          "⚠️ Donorbox script blocked (likely by ad blocker) - using direct link fallback"
        );
        // Set fallback flag for better error handling
        window.donorboxBlocked = true;
        window.donorboxReady = false;
      };

      document.head.appendChild(script);

      // Timeout fallback for slow networks
      setTimeout(() => {
        if (!window.Donorbox && !window.donorboxBlocked) {
          console.warn(
            "⏰ Donorbox script taking too long to load - enabling direct link mode"
          );
          window.donorboxSlow = true;
          window.donorboxReady = false;
        }
      }, 3000); // Reduced timeout for better UX
    }
  }, []);

  const openDonorbox = () => {
    console.log("🎯 DonorboxButton clicked!", {
      campaignId: finalCampaignId,
      isTestMode,
      amount,
      recurring,
      donorboxReady: window.donorboxReady,
      donorboxBlocked: window.donorboxBlocked,
    });

    if (typeof window === "undefined") {
      console.error("Window not available");
      return;
    }

    setIsLoading(true);

    // Generate unique button ID for tracking
    const buttonId = `${amount ? `amount-${amount}` : "custom"}-${recurring ? "recurring" : "one-time"}`;

    // Track donation intent and button click
    if (amount) {
      trackDonationIntent(
        amount,
        recurring ? "recurring" : "one_time",
        window.location.pathname
      );
      trackDonationClick(
        amount,
        recurring ? "recurring" : "one_time",
        buttonId
      );
    }

    try {
      // Check if Donorbox is blocked or unavailable
      const isScriptBlocked =
        window.donorboxBlocked || window.donorboxSlow || !window.donorboxReady;

      if (isScriptBlocked) {
        console.log("🔄 Using direct link method (script unavailable)");
      }

      // Build URL with proper Donorbox format
      let donorboxUrl: string;

      if (isTestMode) {
        // Test mode - use a reliable test campaign
        donorboxUrl = "https://donorbox.org/embed/test-campaign";
      } else {
        // Production mode - use the real campaign
        donorboxUrl = `https://donorbox.org/${finalCampaignId}`;
      }

      // Build query parameters
      const params = new URLSearchParams();

      if (isTestMode) {
        params.append("test", "true");
      }

      if (amount) {
        params.append("amount", amount.toString());
      }

      if (recurring) {
        params.append("recurring", "true");
      }

      // Append parameters to URL
      const finalUrl = `${donorboxUrl}?${params.toString()}`;

      // Log for debugging
      console.log("🌐 Opening Donorbox URL:", finalUrl);

      if (isTestMode) {
        console.log("🧪 DONATION TEST MODE - No real charges will be made");
        console.log("📋 Test Parameters:", {
          amount,
          recurring,
          campaign: finalCampaignId,
        });
      }

      // Show user notification if script is blocked
      if (isScriptBlocked && !isTestMode) {
        console.log(
          "ℹ️ Note: Using direct donation page (ad blocker detected)"
        );
      }

      // Open donation form in new tab
      const newWindow = window.open(
        finalUrl,
        "_blank",
        "noopener,noreferrer,width=900,height=700,scrollbars=yes,resizable=yes"
      );

      if (!newWindow) {
        console.warn("Pop-up blocked by browser - trying direct navigation");
        // Fallback: try direct navigation
        window.location.href = finalUrl;
      } else {
        // Track successful form opening
        if (amount) {
          trackDonationFormOpen(amount, recurring ? "recurring" : "one_time");
        }

        console.log("✅ Donation form opened successfully");
      }

      // Analytics tracking
      if (window.gtag) {
        window.gtag("event", "donate_button_click", {
          event_category: "Donations",
          event_label: `${finalCampaignId}_${variant}`,
          value: amount || 0,
          donation_type: recurring ? "recurring" : "one_time",
          script_status: isScriptBlocked ? "blocked" : "loaded",
        });
      }
    } catch (error) {
      console.error("❌ Error opening Donorbox:", error);

      // User-friendly error handling with better messaging
      let errorMessage: string;

      if (isTestMode) {
        errorMessage =
          "Test donation form temporarily unavailable. This is normal in test mode.";
      } else if (window.donorboxBlocked) {
        errorMessage =
          "Unable to load donation widget. Please disable your ad blocker and try again, or contact us directly for donation assistance.";
      } else {
        errorMessage =
          "Unable to open donation form. Please try refreshing the page or contact support.";
      }

      // Show user-friendly error dialog
      if (
        confirm(
          `${errorMessage}\n\nWould you like to visit our donation page directly?`
        )
      ) {
        // Direct fallback to Donorbox page
        const fallbackUrl = isTestMode
          ? "https://donorbox.org/embed/test-campaign"
          : `https://donorbox.org/${finalCampaignId}`;
        window.open(fallbackUrl, "_blank");
      }
    } finally {
      setTimeout(() => setIsLoading(false), 1000); // Faster reset for better UX
    }
  };

  return (
    <div className="relative">
      {isTestMode && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full z-10">
          TEST
        </div>
      )}

      {/* Ad blocker detection indicator */}
      {typeof window !== "undefined" && window.donorboxBlocked && (
        <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-10 animate-pulse">
          🛡️
        </div>
      )}

      <button
        onClick={openDonorbox}
        className={`${className} ${isLoading ? "opacity-75 cursor-wait" : ""} ${isTestMode ? "ring-2 ring-yellow-400" : ""} ${typeof window !== "undefined" && window.donorboxBlocked ? "ring-2 ring-orange-400" : ""}`}
        type="button"
        disabled={isLoading}
        data-track="donate"
        data-campaign={finalCampaignId}
        title={
          typeof window !== "undefined" && window.donorboxBlocked
            ? "Ad blocker detected - will use direct donation page"
            : undefined
        }
        aria-label={`${isTestMode ? "[TEST] " : ""}${typeof window !== "undefined" && window.donorboxBlocked ? "[Direct Link Mode] " : ""}Donate to Haitian Family Relief Project`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Opening donation form...
          </span>
        ) : (
          children
        )}
      </button>
    </div>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    Donorbox?: {
      open: (options: { link: string; new_tab: boolean }) => void;
    };
    gtag?: (
      command: string,
      action: string,
      parameters: Record<string, unknown>
    ) => void;
    donorboxBlocked?: boolean;
    donorboxSlow?: boolean;
    donorboxReady?: boolean;
  }
}
