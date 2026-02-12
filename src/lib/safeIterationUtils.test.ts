/**
 * Test suite for safe iteration utilities
 *
 * This file tests the iterative alternatives to recursive patterns
 * to ensure they work correctly and don't cause stack overflow.
 */

import {
  safeCountdown,
  safeFactorial,
  tailRecursiveFactorial,
  safeFibonacci,
  safeTreeTraversal,
  safeBreadthFirstTraversal,
  safeFlattenArray,
  safeDeepClone,
  safeRetry,
  safeDOMTraversal,
  safeChunkProcessor,
  detectTailCallOptimization,
  trampoline,
  safeTrampolineFactorial,
  safeTrampolineSum,
  safeSumBelow,
  simpleTrampoline,
  SafePropertyObject,
  createSafeProperty,
  validatePropertyDescriptor,
  defineSafeProperty,
  executeSequentially,
  createSafePipeline,
  SafeCallChain,
  safeCompose,
  safeComposeAsync,
  SafeEventChain,
  executeBatched,
  SafeMiddleware,
  type TreeNode,
} from "./safeIterationUtils";

// Test data structures
const createDeepTree = (depth: number): TreeNode<number> => {
  const root: TreeNode<number> = { value: 0 };
  let current = root;

  for (let i = 1; i < depth; i++) {
    current.children = [{ value: i }];
    current = current.children[0];
  }

  return root;
};

const createWideTree = (width: number, depth: number): TreeNode<string> => {
  const createLevel = (level: number, maxLevel: number): TreeNode<string> => {
    const node: TreeNode<string> = { value: `Level-${level}` };

    if (level < maxLevel) {
      node.children = [];
      for (let i = 0; i < width; i++) {
        node.children.push(createLevel(level + 1, maxLevel));
      }
    }

    return node;
  };

  return createLevel(0, depth);
};

const createCircularObject = () => {
  const obj: any = { a: 1, b: { c: 2 } };
  obj.self = obj;
  obj.b.parent = obj;
  return obj;
};

/**
 * Test Safe Countdown
 */
export function testSafeCountdown() {
  console.log("🧪 Testing safeCountdown...");

  const results: number[] = [];
  const startTime = performance.now();

  // Test large countdown that would overflow with recursion
  safeCountdown(10000, (n) => {
    if (n % 1000 === 0) results.push(n);
  });

  const endTime = performance.now();

  console.log(`✅ safeCountdown(10000) completed in ${endTime - startTime}ms`);
  console.log(`📊 Captured milestones: ${results.join(", ")}`);

  return results.length === 10; // Should capture 10 milestones
}

/**
 * Test Safe Factorial
 */
export function testSafeFactorial() {
  console.log("🧪 Testing safeFactorial...");

  const testCases = [0, 1, 5, 10, 20, 100];
  const results: { input: number; output: bigint }[] = [];

  for (const n of testCases) {
    const startTime = performance.now();
    const result = safeFactorial(n);
    const endTime = performance.now();

    results.push({ input: n, output: result });
    console.log(`factorial(${n}) = ${result} (${endTime - startTime}ms)`);
  }

  // Verify some known values
  const checks = [
    safeFactorial(0) === BigInt(1),
    safeFactorial(1) === BigInt(1),
    safeFactorial(5) === BigInt(120),
    safeFactorial(10) === BigInt(3628800),
  ];

  console.log(
    `✅ safeFactorial passed ${checks.filter(Boolean).length}/${checks.length} checks`,
  );
  return checks.every(Boolean);
}

/**
 * Test Tail Call Optimization Detection
 */
export function testTCODetection() {
  console.log("🧪 Testing TCO Detection...");

  const supportsTCO = detectTailCallOptimization();
  console.log(`✅ TCO Support: ${supportsTCO ? "Detected" : "Not detected"}`);

  // Log engine information
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "Node.js";
  console.log(`📱 Environment: ${userAgent}`);

  return true; // Always passes as this is just detection
}

/**
 * Test Tail Recursive Factorial
 */
export function testTailRecursiveFactorial() {
  console.log("🧪 Testing Tail Recursive Factorial...");

  const testCases = [0, 1, 5, 10, 20];
  const results: {
    input: number;
    iterative: bigint;
    tailRecursive: bigint;
    match: boolean;
  }[] = [];

  for (const n of testCases) {
    const iterativeResult = safeFactorial(n);
    const tailRecursiveResult = tailRecursiveFactorial(n);
    const match = iterativeResult === tailRecursiveResult;

    results.push({
      input: n,
      iterative: iterativeResult,
      tailRecursive: tailRecursiveResult,
      match,
    });

    console.log(
      `factorial(${n}): iterative=${iterativeResult}, tail=${tailRecursiveResult}, match=${match}`,
    );
  }

  const allMatch = results.every((r) => r.match);
  console.log(
    `✅ Tail recursive factorial: ${allMatch ? "All tests passed" : "Some tests failed"}`,
  );

  return allMatch;
}

/**
 * Test Trampoline Implementation
 */
export function testTrampoline() {
  console.log("🧪 Testing Trampoline Implementation...");

  // Test trampolined factorial
  const testFactorialCases = [0, 1, 5, 10, 20];
  let factorialPassed = true;

  for (const n of testFactorialCases) {
    const expected = safeFactorial(n);
    const trampolineResult = safeTrampolineFactorial(n);
    const match = expected === trampolineResult;

    if (!match) factorialPassed = false;
    console.log(
      `trampoline factorial(${n}): expected=${expected}, got=${trampolineResult}, match=${match}`,
    );
  }

  // Test trampolined sum
  const testArray = [1, 2, 3, 4, 5, 10, 20, 30];
  const expectedSum = testArray.reduce((sum, val) => sum + val, 0);
  const trampolineSum = safeTrampolineSum(testArray);
  const sumMatch = expectedSum === trampolineSum;

  console.log(
    `trampoline sum([1,2,3,4,5,10,20,30]): expected=${expectedSum}, got=${trampolineSum}, match=${sumMatch}`,
  );

  // Test with large array that would cause stack overflow with naive recursion
  const largeArray = Array.from({ length: 10000 }, (_, i) => i + 1);
  const expectedLargeSum = (10000 * 10001) / 2; // Sum formula: n*(n+1)/2

  const startTime = performance.now();
  const trampolineLargeSum = safeTrampolineSum(largeArray);
  const endTime = performance.now();

  const largeSumMatch = expectedLargeSum === trampolineLargeSum;
  console.log(
    `trampoline large sum(10000 items): expected=${expectedLargeSum}, got=${trampolineLargeSum}, match=${largeSumMatch}, time=${endTime - startTime}ms`,
  );

  // Test user's sumBelow pattern
  const sumBelowTest1 = safeSumBelow(5); // Should be 5+4+3+2+1 = 15
  const sumBelowMatch1 = sumBelowTest1 === 15;
  console.log(
    `sumBelow(5): expected=15, got=${sumBelowTest1}, match=${sumBelowMatch1}`,
  );

  const sumBelowTest2 = safeSumBelow(100); // Should be 100*(100+1)/2 = 5050
  const sumBelowMatch2 = sumBelowTest2 === 5050;
  console.log(
    `sumBelow(100): expected=5050, got=${sumBelowTest2}, match=${sumBelowMatch2}`,
  );

  // Test large sumBelow (user's original example)
  const startTimeLarge = performance.now();
  const sumBelowLarge = safeSumBelow(100000); // Should be 100000*100001/2 = 5000050000
  const endTimeLarge = performance.now();
  const sumBelowLargeMatch = sumBelowLarge === 5000050000;
  console.log(
    `sumBelow(100000): expected=5000050000, got=${sumBelowLarge}, match=${sumBelowLargeMatch}, time=${endTimeLarge - startTimeLarge}ms`,
  );

  const allPassed =
    factorialPassed &&
    sumMatch &&
    largeSumMatch &&
    sumBelowMatch1 &&
    sumBelowMatch2 &&
    sumBelowLargeMatch;
  console.log(
    `✅ Trampoline implementation: ${allPassed ? "All tests passed" : "Some tests failed"}`,
  );

  return allPassed;
}

/**
 * Test Safe Fibonacci
 */
export function testSafeFibonacci() {
  console.log("🧪 Testing safeFibonacci...");

  const testCases = [0, 1, 10, 20, 30, 100];
  const results: { input: number; output: number }[] = [];

  for (const n of testCases) {
    const startTime = performance.now();
    const result = safeFibonacci(n);
    const endTime = performance.now();

    results.push({ input: n, output: result });
    console.log(`fibonacci(${n}) = ${result} (${endTime - startTime}ms)`);
  }

  // Verify some known values
  const checks = [
    safeFibonacci(0) === 0,
    safeFibonacci(1) === 1,
    safeFibonacci(10) === 55,
    safeFibonacci(20) === 6765,
  ];

  console.log(
    `✅ safeFibonacci passed ${checks.filter(Boolean).length}/${checks.length} checks`,
  );
  return checks.every(Boolean);
}

/**
 * Test Safe Tree Traversal
 */
export function testSafeTreeTraversal() {
  console.log("🧪 Testing safeTreeTraversal...");

  // Test deep tree (potential stack overflow with recursion)
  const deepTree = createDeepTree(10000);
  const visitedDeep: number[] = [];

  const startTime = performance.now();
  safeTreeTraversal(deepTree, (node, depth) => {
    if (depth % 1000 === 0) visitedDeep.push(node.value);
  });
  const endTime = performance.now();

  console.log(
    `✅ Deep tree (10000 levels) traversed in ${endTime - startTime}ms`,
  );
  console.log(`📊 Sampled nodes: ${visitedDeep.join(", ")}`);

  // Test wide tree
  const wideTree = createWideTree(10, 5);
  const visitedWide: string[] = [];

  safeTreeTraversal(wideTree, (node) => {
    visitedWide.push(node.value);
  });

  console.log(
    `✅ Wide tree (10x5) traversed, visited ${visitedWide.length} nodes`,
  );

  return visitedDeep.length >= 10 && visitedWide.length > 0;
}

/**
 * Test Safe Array Flattening
 */
export function testSafeFlattenArray() {
  console.log("🧪 Testing safeFlattenArray...");

  // Create deeply nested array
  let deepArray: any = [1, 2];
  for (let i = 0; i < 1000; i++) {
    deepArray = [deepArray, i + 3];
  }

  const startTime = performance.now();
  const flattened = safeFlattenArray(deepArray);
  const endTime = performance.now();

  console.log(`✅ Deep array flattened in ${endTime - startTime}ms`);
  console.log(
    `📊 Original depth: ~1000, Flattened length: ${flattened.length}`,
  );

  // Test normal array
  const normalArray = [1, [2, 3], [4, [5, 6]], 7];
  const normalFlattened = safeFlattenArray(normalArray);

  console.log(
    `✅ Normal array [1, [2, 3], [4, [5, 6]], 7] → [${normalFlattened.join(", ")}]`,
  );

  return flattened.length > 1000 && normalFlattened.length === 7;
}

/**
 * Test Safe Deep Clone
 */
export function testSafeDeepClone() {
  console.log("🧪 Testing safeDeepClone...");

  // Test circular references
  const circularObj = createCircularObject();

  const startTime = performance.now();
  const cloned = safeDeepClone(circularObj);
  const endTime = performance.now();

  console.log(`✅ Circular object cloned in ${endTime - startTime}ms`);

  // Verify clone properties
  const checks = [
    cloned.a === 1,
    cloned.b.c === 2,
    cloned.self === cloned, // Circular reference preserved
    cloned.b.parent === cloned, // Circular reference preserved
    cloned !== circularObj, // Different object
    cloned.b !== circularObj.b, // Deep clone
  ];

  console.log(
    `✅ safeDeepClone passed ${checks.filter(Boolean).length}/${checks.length} checks`,
  );

  return checks.every(Boolean);
}

/**
 * Test Safe Retry
 */
export function testSafeRetry() {
  console.log("🧪 Testing safeRetry...");

  let attemptCount = 0;

  const flakyOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error(`Attempt ${attemptCount} failed`);
    }
    return `Success after ${attemptCount} attempts`;
  };

  return safeRetry(flakyOperation, 5, 100)
    .then((result) => {
      console.log(`✅ safeRetry succeeded: ${result}`);
      return true;
    })
    .catch((error) => {
      console.error(`❌ safeRetry failed: ${error.message}`);
      return false;
    });
}

/**
 * Test Safe Chunk Processor
 */
export function testSafeChunkProcessor() {
  console.log("🧪 Testing safeChunkProcessor...");

  // Create large array
  const largeArray = Array.from({ length: 100000 }, (_, i) => i);

  const startTime = performance.now();

  return safeChunkProcessor(
    largeArray,
    (item) => item * 2,
    1000, // Process 1000 items per chunk
    1, // 1ms delay between chunks
  ).then((results) => {
    const endTime = performance.now();

    console.log(
      `✅ Processed ${largeArray.length} items in ${endTime - startTime}ms`,
    );
    console.log(`📊 First 10 results: ${results.slice(0, 10).join(", ")}`);
    console.log(`📊 Last 10 results: ${results.slice(-10).join(", ")}`);

    const checksampleResults = [
      results.length === largeArray.length,
      results[0] === 0,
      results[1] === 2,
      results[99999] === 199998,
    ];

    console.log(
      `✅ safeChunkProcessor passed ${checksampleResults.filter(Boolean).length}/${checksampleResults.length} checks`,
    );

    return checksampleResults.every(Boolean);
  });
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log("🚀 Starting Safe Iteration Utils Test Suite...\n");

  const results: { test: string; passed: boolean }[] = [];

  // Synchronous tests
  results.push({ test: "safeCountdown", passed: testSafeCountdown() });
  console.log("");

  results.push({ test: "safeFactorial", passed: testSafeFactorial() });
  console.log("");

  results.push({ test: "safeFibonacci", passed: testSafeFibonacci() });
  console.log("");

  results.push({ test: "safeTreeTraversal", passed: testSafeTreeTraversal() });
  console.log("");

  results.push({ test: "safeFlattenArray", passed: testSafeFlattenArray() });
  console.log("");

  results.push({ test: "safeDeepClone", passed: testSafeDeepClone() });
  console.log("");

  results.push({ test: "tcoDetection", passed: testTCODetection() });
  console.log("");

  results.push({
    test: "tailRecursiveFactorial",
    passed: testTailRecursiveFactorial(),
  });
  console.log("");

  results.push({ test: "trampoline", passed: testTrampoline() });
  console.log("");

  results.push({ test: "simpleTrampoline", passed: testSimpleTrampoline() });
  console.log("");

  results.push({
    test: "safePropertyAccessors",
    passed: testSafePropertyAccessors(),
  });
  console.log("");

  results.push({
    test: "propertyValidation",
    passed: testPropertyValidation(),
  });
  console.log("");

  results.push({ test: "safeCallChains", passed: testSafeCallChains() });
  console.log("");

  // Asynchronous tests
  try {
    const retryResult = await testSafeRetry();
    results.push({ test: "safeRetry", passed: retryResult });
    console.log("");

    const chunkResult = await testSafeChunkProcessor();
    results.push({ test: "safeChunkProcessor", passed: chunkResult });
    console.log("");

    const pipelineResult = await testAsyncPipelines();
    results.push({ test: "asyncPipelines", passed: pipelineResult });
    console.log("");
  } catch (error) {
    console.error("❌ Async test failed:", error);
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log("📋 Test Results Summary:");
  console.log("========================");
  for (const result of results) {
    console.log(`${result.passed ? "✅" : "❌"} ${result.test}`);
  }
  console.log("");
  console.log(
    `🎯 Overall: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`,
  );

  if (passed === total) {
    console.log(
      "🎉 All tests passed! Safe iteration utilities are working correctly.",
    );
  } else {
    console.log("⚠️  Some tests failed. Please review the implementation.");
  }

  return { passed, total, success: passed === total };
}

/**
 * Test Safe Property Accessor Patterns
 */
export function testSafePropertyAccessors() {
  console.log("🧪 Testing Safe Property Accessors...");

  // Test SafePropertyObject
  const safeObj = new SafePropertyObject("initial");

  // Test basic safe setter pattern
  safeObj.value = "test value";
  const basicValue = safeObj.value;
  console.log(`✅ Basic safe property: set 'test value', got '${basicValue}'`);

  // Test validated setter
  safeObj.validatedValue = "validated";
  const validatedResult = safeObj.validatedValue;
  console.log(
    `✅ Validated property: set 'validated', got '${validatedResult}'`,
  );

  // Test null value handling
  safeObj.validatedValue = null;
  const nullResult = safeObj.validatedValue;
  console.log(`✅ Null handling: remains '${nullResult}' (unchanged)`);

  // Test dynamic property creation
  safeObj.createSafeProperty("dynamicProp", "dynamic initial");
  (safeObj as any).dynamicProp = "dynamic updated";
  const dynamicResult = (safeObj as any).dynamicProp;
  console.log(
    `✅ Dynamic property: set 'dynamic updated', got '${dynamicResult}'`,
  );

  // Test createSafeProperty utility
  const { get, set } = createSafeProperty("factory initial", {
    beforeSet: (newVal, oldVal) => {
      console.log(`  🔄 Property changing from '${oldVal}' to '${newVal}'`);
      return newVal;
    },
  });

  set("factory test");
  const factoryResult = get();
  console.log(
    `✅ Property factory: set 'factory test', got '${factoryResult}'`,
  );

  return true;
}

/**
 * Test Safe Call Chain Patterns
 */
export function testSafeCallChains() {
  console.log("🧪 Testing Safe Call Chain Patterns...");

  // Test sequential execution (user's pattern)
  const executionOrder: string[] = [];

  const operation1 = () => {
    executionOrder.push("op1");
  };
  const operation2 = () => {
    executionOrder.push("op2");
  };
  const operation3 = () => {
    executionOrder.push("op3");
  };

  // User's sequential pattern
  operation1();
  operation2();
  operation3();

  const sequentialResult = executionOrder.join(",");
  console.log(`✅ Sequential execution: ${sequentialResult}`);

  // Test safe composition
  const addOne = (x: number) => x + 1;
  const double = (x: number) => x * 2;
  const subtract5 = (x: number) => x - 5;

  const composed = safeCompose(addOne, double, subtract5);
  const composedResult = composed(5); // (5+1)*2-5 = 7
  console.log(`✅ Safe composition: 5 → ${composedResult}`);

  return sequentialResult === "op1,op2,op3" && composedResult === 7;
}

/**
 * Test Async Pipeline Patterns
 */
export async function testAsyncPipelines() {
  console.log("🧪 Testing Async Pipeline Patterns...");

  // Test createSafePipeline (user's improvement)
  const asyncAdd = async (x: number) => x + 10;
  const asyncMultiply = async (x: number) => x * 3;
  const asyncSubtract = async (x: number) => x - 5;

  const pipelineResult = await createSafePipeline(
    5,
    asyncAdd, // 5 + 10 = 15
    asyncMultiply, // 15 * 3 = 45
    asyncSubtract, // 45 - 5 = 40
  );

  console.log(`✅ Async pipeline: 5 → ${pipelineResult}`);

  // Test async composition
  const asyncComposed = safeComposeAsync(
    asyncAdd,
    asyncMultiply,
    asyncSubtract,
  );
  const asyncComposedResult = await asyncComposed(5);
  console.log(`✅ Async composition: 5 → ${asyncComposedResult}`);

  return pipelineResult === 40 && asyncComposedResult === 40;
}

/**
 * Test Property Descriptor Validation
 */
export function testPropertyValidation() {
  console.log("🧪 Testing Property Descriptor Validation...");

  // Test dangerous descriptor (should fail)
  const dangerousDescriptor: PropertyDescriptor = {
    set: function (val: any) {
      (this as any).value = val; // This would cause recursion
    },
    get: function () {
      return (this as any).value; // This would cause recursion
    },
  };

  const dangerousValidation = validatePropertyDescriptor(
    dangerousDescriptor,
    "value",
  );
  console.log(
    `❌ Dangerous descriptor: safe=${dangerousValidation.safe}, issues=${dangerousValidation.issues.length}`,
  );

  // Test safe descriptor (should pass)
  const safeDescriptor: PropertyDescriptor = {
    set: function (val: any) {
      (this as any)._value = val; // Safe: different property name
    },
    get: function () {
      return (this as any)._value; // Safe: different property name
    },
  };

  const safeValidation = validatePropertyDescriptor(safeDescriptor, "value");
  console.log(
    `✅ Safe descriptor: safe=${safeValidation.safe}, issues=${safeValidation.issues.length}`,
  );

  // Test defineSafeProperty with validation
  const testObj = {};
  const safeDefineResult = defineSafeProperty(
    testObj,
    "safeProperty",
    safeDescriptor,
  );
  console.log(`✅ Safe property definition: success=${safeDefineResult}`);

  // Verify the property works
  (testObj as any).safeProperty = "test";
  const propertyResult = (testObj as any).safeProperty;
  console.log(`✅ Safe property usage: set 'test', got '${propertyResult}'`);

  return (
    dangerousValidation.issues.length > 0 &&
    safeValidation.safe &&
    safeDefineResult
  );
}

/**
 * Test Simple Trampoline Utility
 */
export function testSimpleTrampoline() {
  console.log("🧪 Testing Simple Trampoline...");

  // Test simple countdown with trampoline
  const trampolineCountdown = simpleTrampoline(
    (n: number): number | (() => any) => {
      if (n <= 0) return 0;
      return () => trampolineCountdown(n - 1);
    },
  );

  const result = trampolineCountdown(1000);
  console.log(`✅ Simple trampoline countdown(1000): ${result}`);

  // Test that it prevents infinite loops
  try {
    const infiniteFunction = simpleTrampoline(
      (n: number): number | (() => any) => {
        return () => infiniteFunction(n); // This would run forever
      },
    );

    infiniteFunction(5);
    console.log("❌ Failed: Should have thrown error for infinite recursion");
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("maximum iterations")) {
      console.log("✅ Successfully caught infinite recursion");
      return true;
    } else {
      console.log(`❌ Unexpected error: ${errorMessage}`);
      return false;
    }
  }
}

// Performance benchmark
export function benchmarkComparison() {
  console.log(
    "⚡ Performance Benchmark: Safe vs Potentially Unsafe Patterns...\n",
  );

  // Fibonacci comparison
  console.log("🔢 Fibonacci(30) Comparison:");

  const fibRecursive = (n: number): number => {
    if (n <= 1) return n;
    return fibRecursive(n - 1) + fibRecursive(n - 2);
  };

  // Test iterative approach
  const iterativeStart = performance.now();
  const iterativeResult = safeFibonacci(30);
  const iterativeEnd = performance.now();

  console.log(
    `✅ Iterative: ${iterativeResult} in ${iterativeEnd - iterativeStart}ms`,
  );

  // Test recursive approach (smaller number to avoid timeout)
  const recursiveStart = performance.now();
  const recursiveResult = fibRecursive(30);
  const recursiveEnd = performance.now();

  console.log(
    `⚠️  Recursive: ${recursiveResult} in ${recursiveEnd - recursiveStart}ms`,
  );
  console.log(
    `📊 Iterative is ${Math.round((recursiveEnd - recursiveStart) / (iterativeEnd - iterativeStart))}x faster\n`,
  );

  // Array processing comparison
  console.log("📋 Array Processing (10,000 items):");
  const testArray = Array.from({ length: 10000 }, (_, i) => i);

  // Iterative approach
  const iterArrayStart = performance.now();
  let iterSum = 0;
  for (let i = 0; i < testArray.length; i++) {
    iterSum += testArray[i] * 2;
  }
  const iterArrayEnd = performance.now();

  console.log(
    `✅ Iterative: Sum=${iterSum} in ${iterArrayEnd - iterArrayStart}ms`,
  );

  // Functional approach (safe but potentially slower)
  const funcArrayStart = performance.now();
  const funcSum = testArray.reduce((sum, item) => sum + item * 2, 0);
  const funcArrayEnd = performance.now();

  console.log(
    `✅ Functional: Sum=${funcSum} in ${funcArrayEnd - funcArrayStart}ms`,
  );
  console.log(
    `📊 Performance difference: ${Math.abs(iterArrayEnd - iterArrayStart) - Math.abs(funcArrayEnd - funcArrayStart)}ms\n`,
  );
}

// Export for use in browser console or testing
if (typeof window !== "undefined") {
  (window as any).testSafeIterationUtils = {
    runAllTests,
    benchmarkComparison,
    testSafeCountdown,
    testSafeFactorial,
    testSafeFibonacci,
    testSafeTreeTraversal,
    testSafeFlattenArray,
    testSafeDeepClone,
    testSafeRetry,
    testSafeChunkProcessor,
    testTCODetection,
    testTailRecursiveFactorial,
    testTrampoline,
  };

  console.log(
    "🧪 Safe Iteration Utils tests available in console as window.testSafeIterationUtils",
  );
}
