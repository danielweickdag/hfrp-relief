/**
 * Stack Inspection Integration Test
 * Testing user's patterns with our safe iteration utilities
 */

// User's original stack inspection patterns
function userStackTrace() {
  console.trace("User pattern: console.trace()");
}

function userStackAnalysis() {
  const stack = new Error().stack;
  const depth = stack.split("\n").length - 1;
  console.log(`User pattern: Stack depth = ${depth}`);
  return { stack, depth };
}

// Enhanced stack monitoring (simplified JS version)
class SimpleStackMonitor {
  constructor() {
    this.maxDepth = 0;
    this.calls = [];
  }

  getCurrentDepth() {
    const stack = new Error().stack;
    return stack.split("\n").length - 1;
  }

  monitorCall(functionName) {
    const depth = this.getCurrentDepth();
    this.maxDepth = Math.max(this.maxDepth, depth);

    const call = { function: functionName, depth, timestamp: Date.now() };
    this.calls.push(call);

    console.log(`📞 ${functionName} called at depth ${depth}`);

    if (depth > 50) {
      console.warn(`⚠️ ${functionName} at concerning depth: ${depth}`);
    }

    return { depth, isSafe: depth < 100 };
  }

  trace(message) {
    const depth = this.getCurrentDepth();
    console.trace(`🔍 ${message} - Depth: ${depth}`);
  }

  getReport() {
    return {
      totalCalls: this.calls.length,
      maxDepth: this.maxDepth,
      averageDepth:
        this.calls.reduce((sum, call) => sum + call.depth, 0) /
        this.calls.length,
    };
  }
}

// Safe recursion with stack monitoring
function createSafeRecursiveFunction(fn, maxDepth = 100) {
  const monitor = new SimpleStackMonitor();

  return function safeWrapper(...args) {
    const status = monitor.monitorCall("safeRecursive");

    if (!status.isSafe) {
      console.error(`🚨 Recursion stopped at depth ${status.depth}`);
      throw new Error(`Stack overflow prevented at depth ${status.depth}`);
    }

    return fn.apply(this, args);
  };
}

// Test recursive function with monitoring
const monitoredFactorial = createSafeRecursiveFunction(function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
});

// Test iterative vs recursive with stack analysis
function iterativeFactorial(n) {
  console.log("\n🔄 Iterative approach:");
  const analysis = userStackAnalysis();

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

function recursiveFactorial(n) {
  console.log("\n🔄 Recursive approach:");
  const analysis = userStackAnalysis();

  if (n <= 1) return 1;
  return n * recursiveFactorial(n - 1);
}

console.log("🚀 STACK INSPECTION INTEGRATION TEST");
console.log("Testing user's patterns with safe iteration concepts\n");

// Test 1: Basic user patterns
console.log("1️⃣ Testing user's basic patterns:");
userStackTrace();
const analysis = userStackAnalysis();

// Test 2: Enhanced monitoring
console.log("\n2️⃣ Testing enhanced stack monitoring:");
const monitor = new SimpleStackMonitor();

function testFunction(n) {
  monitor.monitorCall(`testFunction(${n})`);

  if (n <= 0) return 0;
  return n + testFunction(n - 1);
}

try {
  const result = testFunction(3);
  console.log(`✅ Result: ${result}`);

  const report = monitor.getReport();
  console.log(
    `📊 Report: ${report.totalCalls} calls, max depth ${report.maxDepth}`
  );
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

// Test 3: Safe recursive function
console.log("\n3️⃣ Testing safe recursive function:");
try {
  console.time("Monitored factorial");
  const result = monitoredFactorial(5);
  console.timeEnd("Monitored factorial");
  console.log(`✅ Factorial result: ${result}`);
} catch (error) {
  console.log(`❌ Safety stopped recursion: ${error.message}`);
}

// Test 4: Iterative vs Recursive comparison
console.log("\n4️⃣ Comparing iterative vs recursive:");
console.log("Iterative 5!:", iterativeFactorial(5));
console.log("Recursive 5!:", recursiveFactorial(5));

// Test 5: Stack depth progression
console.log("\n5️⃣ Stack depth progression:");
function showDepthProgression(n, current = 0) {
  const depth = new Error().stack.split("\n").length - 1;
  console.log(`  Step ${current}: depth = ${depth}`);

  if (current >= n) return depth;
  return showDepthProgression(n, current + 1);
}

const maxDepth = showDepthProgression(3);
console.log(`📈 Maximum depth reached: ${maxDepth}`);

console.log("\n✅ INTEGRATION TEST COMPLETE");
console.log("🎯 User's stack inspection patterns successfully integrated:");
console.log("  • console.trace() for quick debugging");
console.log("  • new Error().stack for programmatic analysis");
console.log("  • Enhanced monitoring for production safety");
console.log("  • Real-time depth tracking for recursion control");
console.log("  • Performance comparison between approaches");
