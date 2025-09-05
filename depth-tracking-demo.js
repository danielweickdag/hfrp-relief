/**
 * Depth Tracking Recursion Prevention - Live Demonstration
 * Based on user's safeRecurse pattern: explicit depth tracking for safety
 */

// Your original pattern
function userSafeRecurse(n, depth = 0) {
  if (depth > 1000) throw "Depth limit exceeded";
  console.log(`Processing n=${n}, depth=${depth}`);

  if (n <= 0) return depth;
  return userSafeRecurse(n - 1, depth + 1);
}

// Enhanced version with configurable limits and callbacks
function enhancedSafeRecurse(n, depth = 0, maxDepth = 1000, operation) {
  if (depth > maxDepth) {
    throw new Error(`Depth limit exceeded: ${depth} > ${maxDepth}`);
  }

  // Optional operation callback
  operation?.(n, depth);

  if (n <= 0) return depth;

  return enhancedSafeRecurse(n - 1, depth + 1, maxDepth, operation);
}

// Depth-limited factorial based on your pattern
function depthLimitedFactorial(n, acc = 1, depth = 0, maxDepth = 1000) {
  if (depth > maxDepth) {
    console.warn(
      `Factorial depth limit reached (${depth}), switching to iterative approach`
    );
    // Fallback to iterative
    let result = acc;
    for (let i = n; i > 1; i--) {
      result *= i;
    }
    return result;
  }

  if (n <= 1) return acc;

  return depthLimitedFactorial(n - 1, n * acc, depth + 1, maxDepth);
}

// Advanced depth monitor class inspired by your pattern
class StackDepthMonitor {
  constructor(maxDepth = 1000, warningThreshold = 0.8) {
    this.maxAllowedDepth = maxDepth;
    this.warningThreshold = warningThreshold;
    this.currentDepth = 0;
    this.maxDepthReached = 0;
  }

  enter() {
    this.currentDepth++;
    this.maxDepthReached = Math.max(this.maxDepthReached, this.currentDepth);

    // Warning at threshold
    if (this.currentDepth > this.maxAllowedDepth * this.warningThreshold) {
      console.warn(
        `⚠️  Approaching depth limit: ${this.currentDepth}/${this.maxAllowedDepth}`
      );
    }

    // Block if limit exceeded
    if (this.currentDepth > this.maxAllowedDepth) {
      this.currentDepth--; // Rollback
      return false;
    }

    return true;
  }

  exit() {
    if (this.currentDepth > 0) {
      this.currentDepth--;
    }
  }

  monitor(fn) {
    return (...args) => {
      if (!this.enter()) {
        throw new Error(
          `Recursion depth limit exceeded: ${this.maxAllowedDepth}`
        );
      }

      try {
        return fn(...args);
      } finally {
        this.exit();
      }
    };
  }
}

// Demonstration
console.log("🎯 DEPTH TRACKING RECURSION PREVENTION DEMO");
console.log("Based on user's safeRecurse pattern\n");

// Test 1: Your original pattern
console.log("1️⃣ Testing your original safeRecurse pattern:");
try {
  const result = userSafeRecurse(5);
  console.log(`✅ Result: ${result}\n`);
} catch (error) {
  console.log(`❌ Error: ${error}\n`);
}

// Test 2: Enhanced version with callback
console.log("2️⃣ Testing enhanced version with operation callback:");
const operations = [];
try {
  const result = enhancedSafeRecurse(7, 0, 1000, (n, depth) => {
    operations.push(`n=${n}, depth=${depth}`);
  });
  console.log(`✅ Result: ${result}`);
  console.log(
    `📋 Operations tracked: ${operations.slice(0, 5).join("; ")}...\n`
  );
} catch (error) {
  console.log(`❌ Error: ${error}\n`);
}

// Test 3: Depth-limited factorial
console.log("3️⃣ Testing depth-limited factorial:");
console.time("DepthLimitedFactorial");
try {
  const result = depthLimitedFactorial(10);
  console.log(`✅ 10! = ${result}`);
} catch (error) {
  console.log(`❌ Error: ${error}`);
}
console.timeEnd("DepthLimitedFactorial");
console.log();

// Test 4: Stack depth monitor
console.log("4️⃣ Testing stack depth monitor:");
const monitor = new StackDepthMonitor(50, 0.8); // Lower limit for demo

function monitoredRecursion(n, operation) {
  operation?.(n, monitor.currentDepth);

  if (n <= 0) return monitor.maxDepthReached;

  return monitoredRecursion(n - 1, operation);
}

const safeMonitoredRecursion = monitor.monitor(monitoredRecursion);

try {
  const result = safeMonitoredRecursion(30, (n, depth) => {
    if (n % 10 === 0) console.log(`  Processing n=${n}, depth=${depth}`);
  });
  console.log(`✅ Max depth reached: ${result}`);
} catch (error) {
  console.log(`❌ Monitor blocked: ${error.message}`);
}
console.log();

// Test 5: Comparing approaches
console.log("5️⃣ Performance comparison:");

// Depth tracking approach (your pattern)
console.time("DepthTracking");
try {
  enhancedSafeRecurse(1000);
  console.log("✅ Depth tracking: Completed successfully");
} catch (error) {
  console.log(`❌ Depth tracking: ${error.message}`);
}
console.timeEnd("DepthTracking");

// Iterative approach (for comparison)
console.time("Iterative");
function iterativeApproach(n) {
  let depth = 0;
  while (n > 0) {
    n--;
    depth++;
  }
  return depth;
}
const iterativeResult = iterativeApproach(1000);
console.log(`✅ Iterative: Result = ${iterativeResult}`);
console.timeEnd("Iterative");

console.log("\n📊 DEPTH TRACKING PATTERN ANALYSIS:");
console.log("✅ Benefits:");
console.log("  • Explicit recursion control");
console.log("  • Configurable depth limits");
console.log("  • Early termination prevents stack overflow");
console.log("  • Great for debugging recursion depth");
console.log("  • Can provide fallback mechanisms");
console.log("");
console.log("🎯 Your pattern excels at:");
console.log("  • Controlled recursive algorithms");
console.log("  • Deep tree/graph traversals");
console.log("  • Mathematical computations with known bounds");
console.log("  • Algorithms where depth tracking adds value");
console.log("");
console.log("💡 Enhanced features we added:");
console.log("  • Configurable depth limits");
console.log("  • Operation callbacks for monitoring");
console.log("  • Warning thresholds before limits");
console.log("  • Automatic fallback mechanisms");
console.log("  • Class-based depth monitoring");
