"use client";

import { useState } from "react";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

interface StripeButtonProps {
  className?: string;
  children: React.ReactNode;
  campaignId: string;
  amount?: number;
  recurring?: boolean;
  interval?: "day" | "month" | "year";
  variant?: "popup" | "redirect";
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripeButton({
  className = "",
  children,
  campaignId,
  amount,
  recurring = false,
  interval = "month",
  variant = "redirect",
  disabled = false,
  onSuccess,
  onError,
}: StripeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = stripeEnhanced.getConfig();
  const campaign = stripeEnhanced.getCampaign(campaignId);

  // Validate configuration with enhanced feedback
  const validation = stripeEnhanced.validateConfig();
  if (!validation.isValid) {
    console.error("Stripe configuration errors:", validation.errors);
  }
  if (validation.warnings && validation.warnings.length > 0) {
    console.warn("Stripe configuration warnings:", validation.warnings);
  }

  // Get display campaign (original or fallback)
  const getDisplayCampaign = () => {
    if (campaign) return campaign;

    // Return fallback campaign info for display
    return {
      id: campaignId,
      name: `Campaign ${campaignId}`,
      description: `Support for ${campaignId}`,
    };
  };

  const displayCampaign = getDisplayCampaign();

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      // Validate campaign exists or use fallback
      let targetCampaign = campaign;

      if (!targetCampaign) {
        console.warn(
          `Campaign "${campaignId}" not found, checking available campaigns...`
        );

        // Get all available campaign IDs for debugging
        const availableCampaignIds = stripeEnhanced.getCampaignIds();
        console.log("Available campaign IDs:", availableCampaignIds);

        // Try to find a fallback campaign or create a generic one
        const availableCampaigns = stripeEnhanced.getCampaigns();
        targetCampaign = availableCampaigns.find(
          (c) => c.status === "active"
        ) || {
          id: campaignId,
          name: `Campaign ${campaignId}`,
          description: `Support for ${campaignId}`,
          goal: 10000,
          raised: 0,
          stripePriceIds: [],
          suggestedAmounts: [25, 50, 100, 250],
          currency: "USD",
          allowCustomAmount: true,
          enableRecurring: false,
          status: "active" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log(`Using fallback campaign:`, targetCampaign.name);
      }

      // Generate unique button ID for tracking
      const buttonId = `${amount ? `amount-${amount}` : "custom"}-${recurring ? "recurring" : "one-time"}`;

      // Track donation intent
      console.log("🎯 StripeButton clicked!", {
        campaignId,
        amount,
        recurring,
        interval,
        buttonId,
        testMode: config.testMode,
      });

      // Log test mode status
      if (config.testMode) {
        console.log("🧪 STRIPE TEST MODE - No real charges will be made");
        console.log("📋 Test Parameters:", {
          amount,
          recurring,
          campaign: targetCampaign.name,
          interval,
        });
      }

      // Always use the real Stripe API for checkout sessions
      if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
        throw new Error("Please provide a valid donation amount");
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amount,
          recurring,
          interval,
          successUrl: `${window.location.origin}${config.defaultSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&campaign=${campaignId}&amount=${amount}`,
          cancelUrl: `${window.location.origin}${config.defaultCancelUrl}`,
          metadata: {
            source: "website",
            buttonId,
            campaign: targetCampaign.name,
          },
        }),
      });

      const raw = await response.json().catch(() => null);
      const data: { url?: string; id?: string; error?: string } =
        raw && typeof raw === "object" ? (raw as { url?: string; id?: string; error?: string }) : {};
      if (!response.ok || typeof data.url !== "string") {
        throw new Error(data.error || "Failed to create Stripe checkout session");
      }
      const checkoutUrl = data.url;

      console.log("🌐 Opening Stripe Checkout:", checkoutUrl);

      // Handle different variants
      if (variant === "popup") {
        // Open in popup
        const popup = window.open(
          checkoutUrl,
          "stripe-checkout",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        if (!popup) {
          console.warn("Popup blocked - redirecting to checkout");
          window.location.href = checkoutUrl;
        } else {
          console.log("✅ Stripe Checkout opened in popup");
        }
      } else {
        // Redirect to checkout
        window.location.href = checkoutUrl;
      }

      // Track successful checkout opening
      if (window.gtag) {
        window.gtag("event", "stripe_checkout_started", {
          event_category: "Donations",
          event_label: `${campaignId}_${variant}`,
          value: amount || 0,
          donation_type: recurring ? "recurring" : "one_time",
          campaign_name: targetCampaign.name,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("❌ Error creating Stripe checkout:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to open donation form";

      // User-friendly error handling
      if (config.testMode) {
        alert(
          `Test mode error: ${errorMessage}\n\nThis is normal during development.`
        );
      } else {
        const userConfirmed = confirm(
          `${errorMessage}\n\nWould you like to try again or contact support?`
        );

        if (userConfirmed) {
          // Retry or redirect to fallback
          window.location.href = `/donate?campaign=${campaignId}&amount=${amount}`;
        }
      }

      onError?.(errorMessage);

      // Track error
      if (window.gtag) {
        window.gtag("event", "stripe_checkout_error", {
          event_category: "Errors",
          event_label: errorMessage,
          campaign_id: campaignId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button appearance based on state
  const getButtonClasses = () => {
    // If custom className is provided, use it as-is with minimal base classes
    if (className && className.trim() !== "") {
      const baseClasses = `
        inline-flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${className}
      `;
      
      if (disabled || isLoading) {
        return `${baseClasses} opacity-50 cursor-not-allowed`;
      }
      
      return baseClasses;
    }

    // Default styling when no custom className is provided
    const baseClasses = `
      inline-flex items-center justify-center
      px-6 py-3 text-base font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
    `;

    if (disabled || isLoading) {
      return `${baseClasses} bg-gray-400 text-gray-700 cursor-not-allowed`;
    }

    if (recurring) {
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
    }

    return `${baseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
  };

  return (
    <div className="relative">
      {/* Test Mode Badge */}
      {config.testMode && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full z-10">
          TEST
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={getButtonClasses()}
        aria-label={`Donate ${amount ? `$${amount}` : "custom amount"} to ${displayCampaign.name}`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Opening...
          </>
        ) : (
          children
        )}
      </button>

      {/* Campaign Info */}
      <div className="mt-2 text-sm text-gray-600">
        <div className="font-medium">{displayCampaign.name}</div>
        {amount && (
          <div className="text-gray-500">
            {recurring
              ? `$${amount}/${interval}`
              : `One-time: $${amount}`}
          </div>
        )}
        {!campaign && (
          <div className="text-xs text-orange-600 mt-1">
            Using fallback campaign configuration
          </div>
        )}
      </div>

      {/* Stripe Security Badge */}
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Secured by Stripe
      </div>

      {/* Validation Errors */}
      {!validation.isValid && config.testMode && (
        <div className="mt-2 text-xs text-red-600">
          Configuration issues: {validation.errors.join(", ")}
        </div>
      )}
    </div>
  );
}
