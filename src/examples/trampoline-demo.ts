/**
 * Trampoline Pattern Demo
 *
 * This file demonstrates the trampoline pattern as shown by the user,
 * including practical examples and performance comparisons.
 */

import {
  safeSumBelow,
  simpleTrampoline,
  safeTrampolineFactorial,
  safeFactorial,
} from "../lib/safeIterationUtils";

// User's exact trampoline implementation
function trampoline(fn: Function) {
  return (...args: any[]) => {
    let result = fn(...args);
    while (typeof result === "function") {
      result = result();
    }
    return result;
  };
}

// User's exact sumBelow implementation
const sumBelow = trampoline((
  n: number,
  sum = 0
): number | (() => any) => n <= 0 ? sum : () => sumBelow(n - 1, sum + n));

/**
 * Additional trampoline examples inspired by the user's pattern
 */

// Trampoline multiplication (product of 1 to n)
const productBelow = trampoline((
  n: number,
  product = 1
): number | (() => any) => n <= 1 ? product : () => productBelow(n - 1, product * n));

// Trampoline power calculation
const trampolinePower = trampoline((
  base: number,
  exp: number,
  acc = 1
): number | (() => any) => exp <= 0 ? acc : () => trampolinePower(base, exp - 1, acc * base));

// Trampoline array sum with index
const trampolineArraySum = trampoline((
  arr: number[],
  index = 0,
  sum = 0
): number | (() => any) => index >= arr.length
    ? sum
    : () => trampolineArraySum(arr, index + 1, sum + arr[index]));

// Trampoline greatest common divisor (Euclidean algorithm)
const trampolineGCD = trampoline((
  a: number,
  b: number
): number | (() => any) => b === 0 ? a : () => trampolineGCD(b, a % b));

// Trampoline string reversal
const trampolineReverse = trampoline((
  str: string,
  acc = ""
): string | (() => any) => str.length === 0
    ? acc
    : () => trampolineReverse(str.slice(1), str[0] + acc));

/**
 * Demo functions
 */
export function demonstrateUserPattern() {
  console.log("🎯 User's Trampoline Pattern Demo\n");
  console.log("================================\n");

  // Test user's exact example
  console.log("📝 User's Original Example:");
  console.log("function trampoline(fn) {");
  console.log("  return (...args) => {");
  console.log("    let result = fn(...args);");
  console.log("    while (typeof result === 'function') {");
  console.log("      result = result();");
  console.log("    }");
  console.log("    return result;");
  console.log("  };");
  console.log("}");
  console.log("");
  console.log("const sumBelow = trampoline(function (n, sum = 0) {");
  console.log("  return n <= 0 ? sum : () => sumBelow(n - 1, sum + n);");
  console.log("});");
  console.log("");
  console.log("console.log(sumBelow(100000)); // Works without stack overflow");
  console.log("");

  // Run the example
  console.log("🚀 Running the example:");
  const startTime = performance.now();
  const result = sumBelow(100000);
  const endTime = performance.now();

  console.log(`✅ sumBelow(100000) = ${result}`);
  console.log(`⏱️  Execution time: ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`🧮 Expected: ${(100000 * 100001) / 2} (formula: n*(n+1)/2)`);
  console.log(
    `✓ Correct: ${result === (100000 * 100001) / 2 ? "Yes" : "No"}\n`
  );
}

export function demonstrateMoreExamples() {
  console.log("🎨 More Trampoline Examples\n");
  console.log("============================\n");

  // Product example
  console.log("📊 Product of numbers 1 to 10:");
  const product = productBelow(10);
  console.log(`productBelow(10) = ${product}`);
  console.log(`Expected factorial(10) = ${safeFactorial(10)}`);
  console.log(
    `✓ Match: ${product.toString() === safeFactorial(10).toString() ? "Yes" : "No"}\n`
  );

  // Power example
  console.log("⚡ Power calculation (2^10):");
  const power = trampolinePower(2, 10);
  console.log(`trampolinePower(2, 10) = ${power}`);
  console.log(`Expected: 1024`);
  console.log(`✓ Correct: ${power === 1024 ? "Yes" : "No"}\n`);

  // Array sum example
  console.log("📋 Array sum with trampoline:");
  const testArray = [1, 2, 3, 4, 5, 10, 20, 30];
  const arraySum = trampolineArraySum(testArray);
  const expectedSum = testArray.reduce((sum, val) => sum + val, 0);
  console.log(`trampolineArraySum([${testArray.join(", ")}]) = ${arraySum}`);
  console.log(`Expected: ${expectedSum}`);
  console.log(`✓ Correct: ${arraySum === expectedSum ? "Yes" : "No"}\n`);

  // GCD example
  console.log("🔢 Greatest Common Divisor (48, 18):");
  const gcd = trampolineGCD(48, 18);
  console.log(`trampolineGCD(48, 18) = ${gcd}`);
  console.log(`Expected: 6`);
  console.log(`✓ Correct: ${gcd === 6 ? "Yes" : "No"}\n`);

  // String reversal example
  console.log("🔄 String reversal with trampoline:");
  const original = "Hello, World!";
  const reversed = trampolineReverse(original);
  const expected = original.split("").reverse().join("");
  console.log(`trampolineReverse("${original}") = "${reversed}"`);
  console.log(`Expected: "${expected}"`);
  console.log(`✓ Correct: ${reversed === expected ? "Yes" : "No"}\n`);
}

export function compareWithSafeUtils() {
  console.log("⚖️  Comparison with Safe Utils\n");
  console.log("==============================\n");

  // Compare sumBelow implementations
  console.log("🔄 Comparing sumBelow implementations:");

  const testCases = [100, 1000, 10000];

  for (const n of testCases) {
    console.log(`\n📊 Testing with n = ${n}:`);

    // User's trampoline version
    const start1 = performance.now();
    const result1 = sumBelow(n);
    const end1 = performance.now();

    // Our safe utils version
    const start2 = performance.now();
    const result2 = safeSumBelow(n);
    const end2 = performance.now();

    console.log(
      `  User's trampoline: ${result1} (${(end1 - start1).toFixed(3)}ms)`
    );
    console.log(
      `  Safe utils version: ${result2} (${(end2 - start2).toFixed(3)}ms)`
    );
    console.log(`  ✓ Results match: ${result1 === result2 ? "Yes" : "No"}`);
    console.log(
      `  📈 Performance: ${end1 - start1 < end2 - start2 ? "User's is faster" : "Safe utils is faster"}`
    );
  }
}

export function demonstrateSafetyFeatures() {
  console.log("\n🛡️  Safety Features Demo\n");
  console.log("========================\n");

  console.log("🚨 Testing infinite recursion protection:");

  try {
    // Create an infinite trampoline function
    const infiniteTrampoline = simpleTrampoline(
      (n: number): number | (() => any) => {
        return () => infiniteTrampoline(n); // Always returns a function
      }
    );

    console.log("Attempting infinite recursion...");
    infiniteTrampoline(5);
    console.log("❌ Failed: Should have thrown an error");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`✅ Successfully caught infinite recursion: ${message}`);
  }

  console.log("\n🔧 Demonstrating enhanced error handling:");
  console.log("- Maximum iteration limits prevent infinite loops");
  console.log("- Clear error messages help with debugging");
  console.log("- TypeScript types ensure type safety");
  console.log("- Performance monitoring built-in");
}

/**
 * Run all demonstrations
 */
export function runTrampolineDemo() {
  console.log("🎪 Complete Trampoline Pattern Demonstration\n");
  console.log("===========================================\n");

  demonstrateUserPattern();
  demonstrateMoreExamples();
  compareWithSafeUtils();
  demonstrateSafetyFeatures();

  console.log("\n🎉 Demo completed successfully!");
  console.log("\n💡 Key Takeaways:");
  console.log("- Trampoline pattern prevents stack overflow");
  console.log("- Works for any tail-recursive function");
  console.log("- Performance is comparable to iterative approaches");
  console.log("- Can be enhanced with safety features and type checking");
  console.log("- Universal compatibility across JavaScript engines");
}

// Export for browser console or Node.js testing
if (typeof window !== "undefined") {
  (window as any).trampolineDemo = {
    runTrampolineDemo,
    demonstrateUserPattern,
    demonstrateMoreExamples,
    compareWithSafeUtils,
    demonstrateSafetyFeatures,
    sumBelow,
    productBelow,
    trampolinePower,
    trampolineArraySum,
    trampolineGCD,
    trampolineReverse,
  };
}

// Auto-run in Node.js environment
if (typeof module !== "undefined" && require.main === module) {
  runTrampolineDemo();
}
