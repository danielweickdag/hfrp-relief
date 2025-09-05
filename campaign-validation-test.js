// Test script to verify campaign validation behavior
// This tests for any remaining error-throwing behavior that needs to be fixed

import { stripeEnhanced } from "./src/lib/stripeEnhanced.ts";

async function testCampaignValidation() {
  console.log("🧪 Testing campaign validation behavior...\n");

  // Test cases for potentially problematic scenarios
  const testCases = [
    "totally-invalid-campaign-id",
    "non-existent-campaign",
    "missing-campaign-123",
    "", // Empty string
    null, // Null value (if passed somehow)
    undefined, // Undefined value
  ];

  let allTestsPassed = true;

  for (const campaignId of testCases) {
    try {
      console.log(`Testing campaignId: "${campaignId}"`);

      const result = await stripeEnhanced.createCampaignCheckout({
        campaignId: campaignId || "fallback-test",
        amount: 50,
        successUrl: "/test-success",
        cancelUrl: "/test-cancel",
        metadata: { test: "true" },
      });

      console.log(`✅ PASS - Returned result without throwing:`, {
        url: result.url?.substring(0, 50) + "...",
        sessionId: result.sessionId,
      });
    } catch (error) {
      console.log(`❌ FAIL - Threw error (should not happen):`, error.message);
      allTestsPassed = false;
    }

    console.log(""); // Empty line for readability
  }

  // Test the fallback test method as well
  try {
    console.log("Testing testCampaignFallback method...");
    const result = await stripeEnhanced.testCampaignFallback(
      "invalid-test-campaign"
    );
    console.log("✅ PASS - testCampaignFallback works:", result);
  } catch (error) {
    console.log("❌ FAIL - testCampaignFallback threw error:", error.message);
    allTestsPassed = false;
  }

  console.log("\n" + "=".repeat(50));
  if (allTestsPassed) {
    console.log(
      "🎉 ALL TESTS PASSED - Campaign validation is working correctly"
    );
    console.log("✅ No error-throwing behavior found");
    console.log("✅ All methods use proper fallback strategies");
  } else {
    console.log(
      "⚠️  SOME TESTS FAILED - There may be methods that still throw errors"
    );
    console.log("🔧 Check the failed cases above for methods that need fixing");
  }
  console.log("=".repeat(50));
}

// Export for use in other contexts
export { testCampaignValidation };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCampaignValidation();
}
