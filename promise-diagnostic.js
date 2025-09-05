/**
 * Promise Rejection Diagnostic Script
 * Tests various scenarios that could cause promise rejections
 */

console.log("🔍 Starting Promise Rejection Diagnostics...");

// Test 1: Empty object rejection (the original issue)
setTimeout(() => {
  console.log("Test 1: Simulating empty object promise rejection...");
  Promise.reject({}).catch(() => {
    console.log("✅ Empty object rejection handled by catch");
  });
}, 1000);

// Test 2: String rejection
setTimeout(() => {
  console.log("Test 2: Simulating string promise rejection...");
  Promise.reject("Test error message").catch(() => {
    console.log("✅ String rejection handled by catch");
  });
}, 2000);

// Test 3: Error object rejection
setTimeout(() => {
  console.log("Test 3: Simulating Error object promise rejection...");
  Promise.reject(new Error("Test error")).catch(() => {
    console.log("✅ Error object rejection handled by catch");
  });
}, 3000);

// Test 4: API-like failure (simulates Resend API failure)
setTimeout(async () => {
  console.log("Test 4: Simulating API failure...");
  try {
    const response = await fetch("/api/nonexistent");
    console.log("Unexpected success:", response.status);
  } catch (error) {
    console.log("✅ API failure handled:", error.message);
  }
}, 4000);

// Test 5: Async function that throws
setTimeout(async () => {
  console.log("Test 5: Simulating async function rejection...");
  async function failingFunction() {
    throw new Error("Async function failed");
  }

  try {
    await failingFunction();
  } catch (error) {
    console.log("✅ Async function rejection handled:", error.message);
  }
}, 5000);

// Test 6: Unhandled rejection (should be caught by ErrorMonitor)
setTimeout(() => {
  console.log("Test 6: Creating unhandled promise rejection...");
  Promise.reject("This should be caught by ErrorMonitor");
}, 6000);

// Summary
setTimeout(() => {
  console.log("🎯 Promise Rejection Diagnostics Complete!");
  console.log("Check the ErrorMonitor component for any unhandled rejections.");
}, 7000);
