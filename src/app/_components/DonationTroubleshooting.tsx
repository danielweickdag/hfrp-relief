"use client";

import { useState } from "react";
import StripeStatus from "./StripeStatus";

export default function DonationTroubleshooting() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Donation System Status
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? "Hide Details" : "Show Troubleshooting"}
        </button>
      </div>

      {/* Always show status */}
      <StripeStatus showDetails={true} className="mb-4" />

      {/* Troubleshooting details */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-6">
          {/* Common Issues */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Common Issues & Solutions
            </h4>
            <div className="space-y-4">
              {/* Ad Blocker Issue */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <h5 className="font-semibold text-orange-900 mb-2">
                      Ad Blocker Detected
                    </h5>
                    <p className="text-orange-800 text-sm mb-3">
                      Some ad blockers can interfere with third-party widgets. We use
                      Stripe Checkout, so donations still work perfectly even if
                      embedded experiences are limited.
                    </p>
                    <div className="space-y-2 text-sm text-orange-700">
                      <div>
                        ✅ <strong>What happens:</strong> Donation buttons open
                        Stripe Checkout securely in a new tab
                      </div>
                      <div>
                        ✅ <strong>User experience:</strong> Slightly different
                        but fully functional
                      </div>
                      <div>
                        ✅ <strong>Security:</strong> All donations are still
                        securely processed by Stripe
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-orange-100 rounded text-sm text-orange-800">
                      <strong>For users:</strong> You can whitelist this site in
                      your ad blocker if you prefer embedded experiences.
                    </div>
                  </div>
                </div>
              </div>

              {/* Slow Loading */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">⏰</span>
                  <div>
                    <h5 className="font-semibold text-yellow-900 mb-2">
                      Slow Network
                    </h5>
                    <p className="text-yellow-800 text-sm mb-2">
                      Your connection is slower than expected.
                    </p>
                    <div className="space-y-1 text-sm text-yellow-700">
                      <div>• Usually caused by slow internet connection</div>
                      <div>
                        • System automatically opens Stripe Checkout directly
                      </div>
                      <div>• No impact on donation functionality</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pop-up Blocked */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🚫</span>
                  <div>
                    <h5 className="font-semibold text-blue-900 mb-2">
                      Pop-up Blocker
                    </h5>
                    <p className="text-blue-800 text-sm mb-2">
                      Browser is blocking donation form pop-ups.
                    </p>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div>
                        • System automatically redirects to donation page or opens a secure tab
                      </div>
                      <div>• Users can allow pop-ups for better experience</div>
                      <div>
                        • All donations work regardless of pop-up settings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Test Mode</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">🧪</span>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">
                    Current Status:{" "}
                    {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true"
                      ? "ENABLED"
                      : "DISABLED"}
                  </h5>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>• Test mode prevents real charges from being made</div>
                    <div>• All buttons show [TEST] indicators</div>
                    <div>• Analytics still track test interactions</div>
                    <div>
                      • Toggle in environment variables
                      (NEXT_PUBLIC_STRIPE_TEST_MODE)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Technical Details
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-semibold mb-2">Environment</div>
                  <div>
                    Test Mode:{" "}
                    {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE || "false"}
                  </div>
                  <div>
                    Campaign ID:{" "}
                    {process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN || process.env.NEXT_PUBLIC_STRIPE_CAMPAIGN_ID || "Not Set"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Checkout Status</div>
                  <div>Platform: Stripe Checkout</div>
                  <div>Mode: {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true" ? "Test" : "Live"}</div>
                  <div>Fallback: Redirect to donation page</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Guidelines */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              User Guidelines
            </h4>
            <div className="prose prose-sm text-gray-600">
              <ul>
                <li>
                  <strong>For donors with ad blockers:</strong> Donation buttons
                  may open Stripe Checkout in a new tab rather than embedded.
                  This is completely normal and secure.
                </li>
                <li>
                  <strong>For pop-up issues:</strong> If clicking donate doesn't
                  open anything, the system will automatically redirect to the
                  donation page.
                </li>
                <li>
                  <strong>For mobile users:</strong> All donation flows are
                  optimized for mobile devices with appropriate window sizing.
                </li>
                <li>
                  <strong>For accessibility:</strong> All buttons include proper
                  ARIA labels and work with screen readers.
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Refresh Status
            </button>
            <button
              onClick={() => {
                console.log("Donation System Debug Info:", {
                  testMode: process.env.NEXT_PUBLIC_STRIPE_TEST_MODE,
                  campaignId:
                    process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN ||
                    process.env.NEXT_PUBLIC_STRIPE_CAMPAIGN_ID,
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString(),
                });
                alert(
                  "Debug information logged to console. Open developer tools to view."
                );
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              Debug Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
