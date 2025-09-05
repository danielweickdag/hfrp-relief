/**
 * Stack Inspection Utilities - Live Demonstration
 * Based on user's debugging patterns: console.trace() and new Error().stack
 */

// Your original patterns for stack inspection
function basicStackInspection() {
  console.log("🔍 Basic Stack Inspection (User's Patterns):");

  // Pattern 1: console.trace() - logs current stack trace
  console.log("\n1️⃣ Using console.trace():");
  console.trace("Stack trace from basicStackInspection");

  // Pattern 2: new Error().stack - inspect stack depth
  console.log("\n2️⃣ Using new Error().stack:");
  console.log(new Error().stack);
}

// Enhanced stack analysis utilities
function analyzeStackDepth() {
  const stack = new Error().stack;
  const lines = stack.split("\n").filter((line) => line.trim());
  return {
    depth: lines.length - 1, // Subtract 1 for the Error constructor line
    frames: lines,
    currentFunction: lines[1] || "unknown",
  };
}

function logStackInfo(label = "Stack Info") {
  const info = analyzeStackDepth();
  console.log(`📊 ${label}:`);
  console.log(`  Depth: ${info.depth} frames`);
  console.log(`  Current: ${info.currentFunction.trim()}`);
  return info;
}

// Demonstrate stack growth in nested calls
function level1() {
  console.log("\n🔄 Stack Growth Demonstration:");
  logStackInfo("Level 1");
  level2();
}

function level2() {
  logStackInfo("Level 2");
  level3();
}

function level3() {
  logStackInfo("Level 3");
  console.log("\n📋 Complete stack trace at deepest level:");
  console.trace("Full trace from level3");
}

// Stack monitoring during recursion
function monitoredRecursion(n, maxDepth = 10) {
  const stackInfo = analyzeStackDepth();

  console.log(
    `🔢 Recursion step ${maxDepth - n + 1}: depth=${stackInfo.depth}`
  );

  if (stackInfo.depth > 20) {
    console.warn("⚠️  Stack getting deep, stopping recursion");
    return stackInfo.depth;
  }

  if (n <= 0) {
    console.log("🎯 Base case reached");
    return stackInfo.depth;
  }

  return monitoredRecursion(n - 1, maxDepth);
}

// Compare recursive vs iterative stack usage
function recursiveApproach(n, label = "") {
  if (label) console.log(`\n${label}:`);

  const stackInfo = analyzeStackDepth();
  console.log(`  Stack depth: ${stackInfo.depth}`);

  if (n <= 0) return stackInfo.depth;
  return recursiveApproach(n - 1);
}

function iterativeApproach(n) {
  console.log("\nIterative approach:");
  const stackInfo = analyzeStackDepth();
  console.log(`  Stack depth: ${stackInfo.depth} (constant)`);

  while (n > 0) {
    n--;
  }

  return stackInfo.depth;
}

// Advanced stack utilities inspired by your patterns
class StackMonitor {
  constructor() {
    this.maxDepthSeen = 0;
    this.calls = [];
  }

  getCurrentDepth() {
    const stack = new Error().stack;
    return stack.split("\n").length - 1;
  }

  logCall(functionName) {
    const depth = this.getCurrentDepth();
    this.maxDepthSeen = Math.max(this.maxDepthSeen, depth);

    const call = {
      function: functionName,
      depth: depth,
      timestamp: Date.now(),
    };

    this.calls.push(call);
    console.log(`📞 ${functionName} called at depth ${depth}`);

    return call;
  }

  getReport() {
    return {
      totalCalls: this.calls.length,
      maxDepth: this.maxDepthSeen,
      averageDepth:
        this.calls.reduce((sum, call) => sum + call.depth, 0) /
        this.calls.length,
    };
  }

  trace(message) {
    console.trace(`🔍 ${message} - Depth: ${this.getCurrentDepth()}`);
  }
}

// Memory and stack usage comparison
function compareStackUsage() {
  console.log("\n🚀 STACK USAGE COMPARISON:");

  const monitor = new StackMonitor();

  // Test recursive approach
  console.log("\n📈 Testing recursive approach:");
  const recursiveDepth = recursiveApproach(5, "Recursive countdown");

  // Test iterative approach
  const iterativeDepth = iterativeApproach(5);

  console.log("\n📊 Comparison results:");
  console.log(`  Recursive max depth: ${recursiveDepth}`);
  console.log(`  Iterative depth: ${iterativeDepth}`);
  console.log(`  Stack overhead: ${recursiveDepth - iterativeDepth} frames`);
}

// Performance monitoring with stack inspection
function performanceWithStackMonitoring() {
  console.log("\n⚡ PERFORMANCE WITH STACK MONITORING:");

  const monitor = new StackMonitor();

  console.time("Monitored execution");

  function monitoredFunction(n) {
    monitor.logCall(`monitoredFunction(${n})`);

    if (n <= 0) return 0;
    return n + monitoredFunction(n - 1);
  }

  const result = monitoredFunction(3);
  console.timeEnd("Monitored execution");

  const report = monitor.getReport();
  console.log("\n📈 Monitoring report:");
  console.log(`  Result: ${result}`);
  console.log(`  Total calls: ${report.totalCalls}`);
  console.log(`  Max depth: ${report.maxDepth}`);
  console.log(`  Average depth: ${report.averageDepth.toFixed(2)}`);
}

// Main demonstration
console.log("🚀 STACK INSPECTION UTILITIES DEMONSTRATION");
console.log(
  "Based on user's patterns: console.trace() and new Error().stack\n"
);

// Run demonstrations
basicStackInspection();
level1();

console.log("\n🔢 Testing monitored recursion:");
monitoredRecursion(3);

compareStackUsage();
performanceWithStackMonitoring();

console.log("\n✅ STACK INSPECTION BENEFITS:");
console.log("  • Real-time stack depth monitoring");
console.log("  • Early detection of potential stack overflow");
console.log("  • Performance analysis of recursive vs iterative");
console.log("  • Debugging aid for complex call chains");
console.log("  • Memory usage optimization insights");
console.log("\n🎯 Your patterns provide essential debugging capabilities:");
console.log("  • console.trace(): Quick stack visualization");
console.log("  • new Error().stack: Programmatic stack analysis");
console.log("  • Perfect for recursion safety monitoring!");
