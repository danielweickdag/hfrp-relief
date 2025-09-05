/**
 * Call Chain Recursion Demo
 *
 * This demonstrates the user's example of nested function calls
 * and shows multiple safe alternatives to prevent stack overflow.
 */

console.log("🔗 Function Call Chain Patterns Demo");
console.log("===================================\n");

// 🚨 DANGEROUS PATTERN (User's "Before" example)
console.log("❌ DANGEROUS: Nested Function Calls");
console.log("// Before: Nested function calls");
console.log("function level1() { level2(); }");
console.log("function level2() { level3(); }");
console.log("function level3() { /* ... */ }");
console.log("");

// Simulate the dangerous pattern with limited depth
let callDepth = 0;
const maxDepth = 5; // Prevent actual overflow in demo

function dangerousLevel1() {
  callDepth++;
  console.log(`🔄 Call depth: ${callDepth}`);
  if (callDepth < maxDepth) {
    dangerousLevel2();
  } else {
    console.log("🚨 Stopped before stack overflow!");
  }
}

function dangerousLevel2() {
  callDepth++;
  console.log(`🔄 Call depth: ${callDepth}`);
  if (callDepth < maxDepth) {
    dangerousLevel3();
  }
}

function dangerousLevel3() {
  callDepth++;
  console.log(`🔄 Call depth: ${callDepth}`);
  console.log("💀 This pattern would cause stack overflow with deep nesting\n");
}

console.log("🎯 Demonstrating the problem:");
dangerousLevel1();

// ✅ SAFE PATTERN (User's "After" example)
console.log("✅ SAFE: User's Sequential Execution");
console.log("// After: Sequential execution");
console.log("function executeOperations() {");
console.log("  operation1();");
console.log("  operation2();");
console.log("  operation3();");
console.log("}");
console.log("");

// Demonstrate the working version
let operationOrder = [];

function operation1() {
  operationOrder.push("Operation 1 executed");
  console.log("✅ Operation 1 executed");
}

function operation2() {
  operationOrder.push("Operation 2 executed");
  console.log("✅ Operation 2 executed");
}

function operation3() {
  operationOrder.push("Operation 3 executed");
  console.log("✅ Operation 3 executed");
}

// User's sequential pattern
function executeOperations() {
  operation1();
  operation2();
  operation3();
}

console.log("🚀 Running user's solution:");
executeOperations();
console.log(`✅ Result: ${operationOrder.join(" → ")}\n`);

// 🎯 ADDITIONAL SAFE PATTERNS
console.log("🎯 Additional Safe Patterns:\n");

// Pattern 1: Function composition
console.log("🔧 Pattern 1: Safe Function Composition");

// Simple compose function (like our safeCompose)
function simpleCompose(...functions) {
  return function (initialValue) {
    let result = initialValue;
    for (const fn of functions) {
      result = fn(result);
    }
    return result;
  };
}

const step1 = (x) => {
  console.log(`Step 1: ${x}`);
  return x + 1;
};
const step2 = (x) => {
  console.log(`Step 2: ${x}`);
  return x * 2;
};
const step3 = (x) => {
  console.log(`Step 3: ${x}`);
  return x - 3;
};

const composedFunction = simpleCompose(step1, step2, step3);
const compositionResult = composedFunction(5);
console.log(`✅ Composition result: 5 → ${compositionResult}\n`);

// Pattern 2: Pipeline execution
console.log("⚡ Pattern 2: Async Pipeline");

// Simple pipeline function (like our createSafePipeline)
async function simplePipeline(initialValue, ...operations) {
  let result = initialValue;
  for (const operation of operations) {
    result = await operation(result);
  }
  return result;
}

const asyncStep1 = async (x) => {
  console.log(`Async Step 1: ${x}`);
  await new Promise((resolve) => setTimeout(resolve, 10));
  return x + 10;
};
const asyncStep2 = async (x) => {
  console.log(`Async Step 2: ${x}`);
  await new Promise((resolve) => setTimeout(resolve, 10));
  return x * 3;
};
const asyncStep3 = async (x) => {
  console.log(`Async Step 3: ${x}`);
  await new Promise((resolve) => setTimeout(resolve, 10));
  return x - 5;
};

simplePipeline(5, asyncStep1, asyncStep2, asyncStep3).then((result) => {
  console.log(`✅ Pipeline result: 5 → ${result}\n`);
});

// Pattern 3: Call chain manager
console.log("📋 Pattern 3: Call Chain Manager");

// Simple call chain class (like our SafeCallChain)
class SimpleCallChain {
  constructor() {
    this.queue = [];
    this.isExecuting = false;
  }

  add(operation) {
    this.queue.push(operation);
    if (!this.isExecuting) {
      this.execute();
    }
    return this;
  }

  async execute() {
    if (this.isExecuting) return;
    this.isExecuting = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      try {
        await operation();
      } catch (error) {
        console.error("Operation failed:", error);
      }
    }

    this.isExecuting = false;
  }
}

const chain = new SimpleCallChain();
let chainResults = [];

chain
  .add(() => {
    chainResults.push("Chain operation 1");
    console.log("✅ Chain operation 1");
  })
  .add(() => {
    chainResults.push("Chain operation 2");
    console.log("✅ Chain operation 2");
  })
  .add(() => {
    chainResults.push("Chain operation 3");
    console.log("✅ Chain operation 3");
  });

setTimeout(() => {
  console.log(`✅ Chain result: ${chainResults.join(" → ")}\n`);
}, 100);

// Pattern 4: Event-driven approach
console.log("📡 Pattern 4: Event-Driven Architecture");

// Simple event chain class (like our SafeEventChain)
class SimpleEventChain {
  constructor() {
    this.listeners = new Map();
    this.executing = new Set();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return this;
  }

  async emit(event, data) {
    if (this.executing.has(event)) {
      console.warn(`Event '${event}' already executing, skipping`);
      return;
    }

    const handlers = this.listeners.get(event) || [];
    if (handlers.length === 0) return;

    this.executing.add(event);

    try {
      for (const handler of handlers) {
        await handler(data);
      }
    } finally {
      this.executing.delete(event);
    }
  }
}

const eventChain = new SimpleEventChain();
let eventResults = [];

eventChain
  .on("start", async () => {
    eventResults.push("Started");
    console.log("✅ Event: Started");
    await eventChain.emit("process");
  })
  .on("process", async () => {
    eventResults.push("Processing");
    console.log("✅ Event: Processing");
    await eventChain.emit("complete");
  })
  .on("complete", () => {
    eventResults.push("Completed");
    console.log("✅ Event: Completed");
    console.log(`✅ Event chain result: ${eventResults.join(" → ")}\n`);
  });

eventChain.emit("start");

// 🔍 ADVANCED PATTERN: Middleware without recursion
console.log("🔍 Advanced Pattern: Safe Middleware");

class SafeMiddlewareDemo {
  constructor() {
    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
    return this;
  }

  async execute(context) {
    console.log("🚀 Executing middleware chain...");

    // Execute middleware iteratively, not recursively
    for (let i = 0; i < this.middleware.length; i++) {
      const middleware = this.middleware[i];
      console.log(`📋 Middleware ${i + 1} executing...`);

      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await middleware(context, next);

      if (!nextCalled) {
        console.log(`⏹️  Middleware ${i + 1} stopped the chain`);
        break;
      }
    }

    console.log("✅ Middleware chain completed");
  }
}

const middleware = new SafeMiddlewareDemo();
middleware
  .use(async (ctx, next) => {
    ctx.step1 = "Authentication passed";
    console.log("🔐 Authentication middleware");
    next();
  })
  .use(async (ctx, next) => {
    ctx.step2 = "Validation passed";
    console.log("✅ Validation middleware");
    next();
  })
  .use(async (ctx, next) => {
    ctx.step3 = "Processing completed";
    console.log("⚙️  Processing middleware");
    next();
  });

const context = {};
middleware.execute(context).then(() => {
  console.log("📊 Final context:", context);
});

// 🎯 PERFORMANCE COMPARISON
setTimeout(() => {
  console.log("\n⚡ Performance Comparison");
  console.log("========================");

  const iterations = 10000;

  // Test 1: Sequential execution (user's pattern)
  const sequentialStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const dummy1 = () => i + 1;
    const dummy2 = () => i + 2;
    const dummy3 = () => i + 3;

    dummy1();
    dummy2();
    dummy3();
  }
  const sequentialEnd = performance.now();
  console.log(
    `Sequential execution: ${(sequentialEnd - sequentialStart).toFixed(2)}ms`
  );

  // Test 2: Composed functions
  const composedStart = performance.now();
  const testCompose = simpleCompose(
    (x) => x + 1,
    (x) => x + 2,
    (x) => x + 3
  );
  for (let i = 0; i < iterations; i++) {
    testCompose(i);
  }
  const composedEnd = performance.now();
  console.log(
    `Composed functions: ${(composedEnd - composedStart).toFixed(2)}ms`
  );

  console.log("\n📊 Performance Results:");
  console.log(`- User's sequential pattern: excellent performance baseline`);
  console.log(
    `- Composed functions: ${(((composedEnd - composedStart) / (sequentialEnd - sequentialStart)) * 100).toFixed(1)}% of sequential speed`
  );
  console.log("- Both approaches prevent stack overflow effectively");

  // 🎉 CONCLUSION
  console.log("\n🎉 Conclusion");
  console.log("=============");
  console.log("✅ User's sequential pattern is excellent for simple cases");
  console.log("✅ Composition patterns provide reusability and modularity");
  console.log("✅ Event-driven approaches work well for complex workflows");
  console.log("✅ All patterns prevent stack overflow effectively");
  console.log("");
  console.log("💡 Key Lesson: Your solution sets the foundation!");
  console.log(
    "   Sequential execution is the safest, most readable approach. 🚀"
  );
}, 200);
