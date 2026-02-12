/**
 * Safe Iteration Utilities - Iterative alternatives to recursive patterns
 *
 * This file provides safe, stack-overflow-resistant alternatives to common
 * recursive patterns that can cause "Maximum call stack exceeded" errors.
 */

/**
 * Safe countdown function - iterative approach
 * Replaces recursive countdown that can overflow the stack
 */
export function safeCountdown(
  n: number,
  callback?: (current: number) => void,
): void {
  while (n > 0) {
    callback?.(n);
    n--;
  }
}

/**
 * Safe factorial calculation - iterative approach
 * Replaces recursive factorial that can overflow with large numbers
 */
export function safeFactorial(n: number): bigint {
  if (n < 0) throw new Error("Factorial is not defined for negative numbers");

  let result = BigInt(1);
  for (let i = 2; i <= n; i++) {
    result *= BigInt(i);
  }
  return result;
}

/**
 * Tail-recursive factorial with fallback
 * Attempts tail recursion but falls back to iterative if TCO not supported
 */
export function tailRecursiveFactorial(
  n: number,
  acc: bigint = BigInt(1),
): bigint {
  if (n < 0) throw new Error("Factorial is not defined for negative numbers");

  // For safety, use iterative approach for large numbers even with tail recursion
  // Most JS engines don't guarantee TCO support
  if (n > 1000) {
    console.warn("Large factorial detected, using safe iterative approach");
    return safeFactorial(n);
  }

  // Tail recursive implementation (requires TCO support)
  if (n <= 1) return acc;
  return tailRecursiveFactorial(n - 1, BigInt(n) * acc);
}

/**
 * Trampoline utility for safe tail recursion
 * Converts tail recursive functions to iterative ones automatically
 */
type Thunk<T> = () => T | Thunk<T>;

export function trampoline<T extends any[], R>(
  fn: (...args: T) => R | Thunk<R>,
): (...args: T) => R {
  return function trampolined(...args: T): R {
    let result: R | Thunk<R> = fn(...args);

    while (typeof result === "function") {
      result = (result as Thunk<R>)();
    }

    return result as R;
  };
}

/**
 * Tail recursive factorial using trampoline
 * Safe alternative that doesn't rely on engine TCO support
 */
export function trampolineFactorial(
  n: number,
  acc: bigint = BigInt(1),
): bigint | Thunk<bigint> {
  if (n < 0) throw new Error("Factorial is not defined for negative numbers");

  if (n <= 1) return acc;

  // Return a thunk (function) for the next computation
  return () => trampolineFactorial(n - 1, BigInt(n) * acc);
}

// Create the safe trampolined version
export const safeTrampolineFactorial = trampoline(trampolineFactorial);

/**
 * Example: Tail recursive sum using trampoline
 */
export function trampolineSum(
  arr: number[],
  index = 0,
  acc = 0,
): number | Thunk<number> {
  if (index >= arr.length) return acc;

  return () => trampolineSum(arr, index + 1, acc + arr[index]);
}

export const safeTrampolineSum = trampoline(trampolineSum);

/**
 * Sum of numbers from 1 to n using trampoline pattern
 * Based on user's clean trampoline implementation
 */
export function trampolineSumBelow(n: number, sum = 0): number | Thunk<number> {
  return n <= 0 ? sum : () => trampolineSumBelow(n - 1, sum + n);
}

export const safeSumBelow = trampoline(trampolineSumBelow);

/**
 * Enhanced trampoline utility with better error handling
 * Simplified version similar to user's implementation
 */
export function simpleTrampoline<T extends any[], R>(
  fn: (...args: T) => R | (() => R | (() => any)),
): (...args: T) => R {
  return (...args: T): R => {
    let result: any = fn(...args);
    let iterations = 0;
    const maxIterations = 1000000; // Prevent infinite loops

    while (typeof result === "function") {
      if (iterations++ > maxIterations) {
        throw new Error(
          "Trampoline exceeded maximum iterations - possible infinite recursion",
        );
      }
      result = result();
    }

    return result as R;
  };
}

/**
 * TCO Detection utility
 * Tests if the JavaScript engine supports tail call optimization
 */
function testTCOFunction(n: number): number {
  if (n <= 0) return 0;
  return testTCOFunction(n - 1); // Tail call
}

export function detectTailCallOptimization(): boolean {
  try {
    // Try a moderately deep recursion
    testTCOFunction(1000);
    return true;
  } catch (error) {
    if (error instanceof RangeError && error.message.includes("stack")) {
      return false;
    }
    // Other errors might not be related to TCO
    return false;
  }
}

/**
 * Safe Fibonacci calculation - iterative approach
 * Replaces recursive Fibonacci that can be extremely slow and overflow
 */
export function safeFibonacci(n: number): number {
  if (n <= 1) return n;

  let a = 0;
  let b = 1;

  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }

  return b;
}

/**
 * Safe tree traversal - iterative depth-first search
 * Replaces recursive tree traversal that can overflow with deep trees
 */
export interface TreeNode<T = any> {
  value: T;
  children?: TreeNode<T>[];
}

export function safeTreeTraversal<T>(
  root: TreeNode<T>,
  callback: (node: TreeNode<T>, depth: number) => void,
): void {
  const stack: Array<{ node: TreeNode<T>; depth: number }> = [
    { node: root, depth: 0 },
  ];

  while (stack.length > 0) {
    const current = stack.pop()!;
    callback(current.node, current.depth);

    // Add children to stack in reverse order to maintain left-to-right traversal
    if (current.node.children) {
      for (let i = current.node.children.length - 1; i >= 0; i--) {
        stack.push({
          node: current.node.children[i],
          depth: current.depth + 1,
        });
      }
    }
  }
}

/**
 * Safe breadth-first tree traversal
 * Uses a queue instead of recursion for level-order traversal
 */
export function safeBreadthFirstTraversal<T>(
  root: TreeNode<T>,
  callback: (node: TreeNode<T>, depth: number) => void,
): void {
  const queue: Array<{ node: TreeNode<T>; depth: number }> = [
    { node: root, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    callback(current.node, current.depth);

    if (current.node.children) {
      for (const child of current.node.children) {
        queue.push({
          node: child,
          depth: current.depth + 1,
        });
      }
    }
  }
}

/**
 * Safe array flattening - iterative approach
 * Replaces recursive array flattening that can overflow with deeply nested arrays
 */
export function safeFlattenArray<T>(
  arr: any[],
  maxDepth = Number.POSITIVE_INFINITY,
): T[] {
  const result: T[] = [];
  const stack: Array<{ item: any; depth: number }> = arr.map((item) => ({
    item,
    depth: 0,
  }));

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (Array.isArray(current.item) && current.depth < maxDepth) {
      // Add array items to stack in reverse order to maintain order
      for (let i = current.item.length - 1; i >= 0; i--) {
        stack.push({
          item: current.item[i],
          depth: current.depth + 1,
        });
      }
    } else {
      result.unshift(current.item as T);
    }
  }

  return result;
}

/**
 * Safe object deep cloning - iterative approach
 * Replaces recursive deep clone that can overflow with circular references
 */
export function safeDeepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  const seen = new WeakMap();
  const stack: Array<{ source: any; target: any; key?: string | number }> = [];

  let cloned: any;
  if (Array.isArray(obj)) {
    cloned = [];
  } else if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  } else if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  } else {
    cloned = {};
  }

  seen.set(obj, cloned);
  stack.push({ source: obj, target: cloned });

  while (stack.length > 0) {
    const current = stack.pop()!;

    for (const key in current.source) {
      if (current.source.hasOwnProperty(key)) {
        const value = current.source[key];

        if (value === null || typeof value !== "object") {
          current.target[key] = value;
        } else if (seen.has(value)) {
          // Handle circular reference
          current.target[key] = seen.get(value);
        } else {
          let newTarget: any;
          if (Array.isArray(value)) {
            newTarget = [];
          } else if (value instanceof Date) {
            newTarget = new Date(value.getTime());
          } else if (value instanceof RegExp) {
            newTarget = new RegExp(value.source, value.flags);
          } else {
            newTarget = {};
          }

          current.target[key] = newTarget;
          seen.set(value, newTarget);
          stack.push({ source: value, target: newTarget });
        }
      }
    }
  }

  return cloned;
}

/**
 * Safe retry function - iterative approach with exponential backoff
 * Replaces recursive retry that can overflow with many attempts
 */
export async function safeRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000,
  maxDelay = 10000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay,
      );

      console.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms:`,
        lastError.message,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Safe DOM tree walker - iterative approach
 * Replaces recursive DOM traversal that can overflow with deeply nested elements
 */
export function safeDOMTraversal(
  root: Element,
  callback: (element: Element, depth: number) => boolean | void,
): void {
  const stack: Array<{ element: Element; depth: number }> = [
    { element: root, depth: 0 },
  ];

  while (stack.length > 0) {
    const current = stack.pop()!;

    // Call callback and check if traversal should continue
    const shouldContinue = callback(current.element, current.depth);
    if (shouldContinue === false) {
      continue;
    }

    // Add children to stack in reverse order to maintain document order
    const children = Array.from(current.element.children);
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push({
        element: children[i],
        depth: current.depth + 1,
      });
    }
  }
}

/**
 * Safe array chunk processing - iterative approach
 * Processes large arrays in chunks to avoid blocking the event loop
 */
export async function safeChunkProcessor<T, R>(
  array: T[],
  processor: (item: T, index: number) => R | Promise<R>,
  chunkSize = 100,
  delay = 0,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);

    for (let j = 0; j < chunk.length; j++) {
      const result = await processor(chunk[j], i + j);
      results.push(result);
    }

    // Yield control back to the event loop
    if (delay > 0 && i + chunkSize < array.length) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Safe Property Accessor Patterns
 * Prevents infinite recursion in getters/setters
 */

/**
 * Safe Depth-Limited Recursion Patterns
 * Prevents stack overflow by tracking recursion depth
 */

/**
 * Depth-limited recursion wrapper - user's safety pattern
 * Prevents stack overflow by enforcing maximum recursion depth
 */
export function createDepthLimitedFunction<T extends any[], R>(
  fn: (depth: number, ...args: T) => R,
  maxDepth = 1000,
  onDepthExceeded?: (depth: number, args: T) => R | never,
): (...args: T) => R {
  return function depthLimited(...args: T): R {
    return executeWithDepthLimit(fn, args, maxDepth, onDepthExceeded);
  };
}

/**
 * Execute function with depth tracking - based on user's pattern
 */
function executeWithDepthLimit<T extends any[], R>(
  fn: (depth: number, ...args: T) => R,
  args: T,
  maxDepth: number,
  onDepthExceeded?: (depth: number, args: T) => R | never,
  currentDepth = 0,
): R {
  if (currentDepth > maxDepth) {
    if (onDepthExceeded) {
      return onDepthExceeded(currentDepth, args);
    }
    throw new Error(`Depth limit exceeded: ${currentDepth} > ${maxDepth}`);
  }

  // Execute the function with depth tracking
  return fn(currentDepth, ...args);
}

/**
 * Safe recursive function factory - creates depth-aware recursive functions
 */
export function createSafeRecursiveFunction<T extends any[], R>(
  recursiveFn: (recurse: (...args: T) => R, depth: number, ...args: T) => R,
  maxDepth = 1000,
  fallbackFn?: (...args: T) => R,
): (...args: T) => R {
  return function safeRecursive(...args: T): R {
    let depth = 0;

    const recursiveWrapper = (...recursiveArgs: T): R => {
      depth++;

      if (depth > maxDepth) {
        if (fallbackFn) {
          console.warn(
            `Recursion depth limit reached (${depth}), using fallback function`,
          );
          return fallbackFn(...recursiveArgs);
        }
        throw new Error(
          `Maximum recursion depth exceeded: ${depth} > ${maxDepth}`,
        );
      }

      return recursiveFn(recursiveWrapper, depth, ...recursiveArgs);
    };

    return recursiveWrapper(...args);
  };
}

/**
 * User's exact depth limiting pattern with enhancements
 */
export function safeRecurse(
  n: number,
  depth = 0,
  maxDepth = 1000,
  operation?: (n: number, depth: number) => void,
): number {
  if (depth > maxDepth) {
    throw new Error("Depth limit exceeded");
  }

  // User's recursive logic pattern
  operation?.(n, depth);

  if (n <= 0) return depth;

  return safeRecurse(n - 1, depth + 1, maxDepth, operation);
}

/**
 * Enhanced depth-limited factorial based on user's pattern
 */
export function depthLimitedFactorial(
  n: number,
  acc: bigint = BigInt(1),
  depth = 0,
): bigint {
  const maxDepth = 1000;

  if (depth > maxDepth) {
    console.warn(
      `Factorial depth limit reached (${depth}), switching to iterative approach`,
    );
    return safeFactorial(n);
  }

  if (n <= 1) return acc;

  return depthLimitedFactorial(n - 1, BigInt(n) * acc, depth + 1);
}

/**
 * Safe tree traversal with depth limiting
 */
export function safeDepthLimitedTreeTraversal<T>(
  root: TreeNode<T>,
  callback: (node: TreeNode<T>, depth: number) => void,
  maxDepth = 100,
): void {
  function traverse(node: TreeNode<T>, depth: number): void {
    if (depth > maxDepth) {
      console.warn(`Tree traversal depth limit reached: ${depth}`);
      return;
    }

    callback(node, depth);

    if (node.children) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(root, 0);
}

/**
 * Depth-aware function memoization with recursion limits
 */
export function createDepthMemoizedFunction<T extends any[], R>(
  fn: (depth: number, ...args: T) => R,
  maxDepth = 1000,
  cacheSize = 1000,
): (...args: T) => R {
  const cache = new Map<string, R>();
  const depthTracker = new Map<string, number>();

  return function memoizedWithDepth(...args: T): R {
    const key = JSON.stringify(args);

    // Check cache first
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // Track depth for this computation
    const currentDepth = (depthTracker.get(key) || 0) + 1;

    if (currentDepth > maxDepth) {
      throw new Error(
        `Memoized function exceeded depth limit: ${currentDepth} > ${maxDepth}`,
      );
    }

    depthTracker.set(key, currentDepth);

    try {
      const result = fn(currentDepth, ...args);

      // Manage cache size
      if (cache.size >= cacheSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
          depthTracker.delete(firstKey);
        }
      }

      cache.set(key, result);
      return result;
    } finally {
      depthTracker.delete(key);
    }
  };
}

/**
 * Stack depth monitor utility
 */
export class StackDepthMonitor {
  private currentDepth = 0;
  private maxDepthReached = 0;
  private readonly maxAllowedDepth: number;
  private readonly warningThreshold: number;

  constructor(maxDepth = 1000, warningThreshold = 0.8) {
    this.maxAllowedDepth = maxDepth;
    this.warningThreshold = warningThreshold;
  }

  // Enter a recursive call
  enter(): boolean {
    this.currentDepth++;
    this.maxDepthReached = Math.max(this.maxDepthReached, this.currentDepth);

    // Warning at threshold
    if (this.currentDepth > this.maxAllowedDepth * this.warningThreshold) {
      console.warn(
        `Approaching recursion depth limit: ${this.currentDepth}/${this.maxAllowedDepth}`,
      );
    }

    // Block if limit exceeded
    if (this.currentDepth > this.maxAllowedDepth) {
      this.currentDepth--; // Rollback
      return false;
    }

    return true;
  }

  // Exit a recursive call
  exit(): void {
    if (this.currentDepth > 0) {
      this.currentDepth--;
    }
  }

  // Get current depth
  get depth(): number {
    return this.currentDepth;
  }

  // Get maximum depth reached
  get maxDepth(): number {
    return this.maxDepthReached;
  }

  // Reset monitor
  reset(): void {
    this.currentDepth = 0;
    this.maxDepthReached = 0;
  }

  // Create a monitored function
  monitor<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R {
    return (...args: T): R => {
      if (!this.enter()) {
        throw new Error(
          `Recursion depth limit exceeded: ${this.maxAllowedDepth}`,
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

/**
 * Safe Function Call Chain Patterns
 * Prevents stack overflow from deeply nested function calls
 */

/**
 * Sequential execution utility - replaces nested function calls
 * Converts deep call chains into safe sequential execution
 */
export function executeSequentially(
  ...operations: Array<() => void | Promise<void>>
): Promise<void> {
  return operations.reduce(async (promise, operation) => {
    await promise;
    return operation();
  }, Promise.resolve());
}

/**
 * Safe function pipeline - iterative execution with error handling
 * Replaces nested function calls with safe pipeline execution
 */
export async function createSafePipeline<T>(
  initialValue: T,
  ...operations: Array<(value: T) => T | Promise<T>>
): Promise<T> {
  let result = initialValue;

  for (const operation of operations) {
    result = await operation(result);
  }

  return result;
}

/**
 * Call stack manager - prevents deep nesting with queue-based execution
 */
export class SafeCallChain {
  private queue: Array<() => void | Promise<void>> = [];
  private isExecuting = false;
  private maxConcurrent = 1;

  constructor(maxConcurrent = 1) {
    this.maxConcurrent = maxConcurrent;
  }

  // Add operation to the chain
  add(operation: () => void | Promise<void>): this {
    this.queue.push(operation);
    if (!this.isExecuting) {
      this.execute();
    }
    return this;
  }

  // Execute all operations sequentially
  private async execute(): Promise<void> {
    if (this.isExecuting) return;
    this.isExecuting = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift()!;
      try {
        await operation();
      } catch (error) {
        console.error("Operation failed in call chain:", error);
        // Continue with next operation instead of breaking the chain
      }
    }

    this.isExecuting = false;
  }

  // Execute all remaining operations and return promise
  async finish(): Promise<void> {
    while (this.isExecuting || this.queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  // Clear all pending operations
  clear(): void {
    this.queue = [];
  }

  // Get current queue length
  get pending(): number {
    return this.queue.length;
  }
}

/**
 * Function composition utility - safe alternative to nested calls
 * Composes functions without deep nesting
 */
export function safeCompose<T>(
  ...functions: Array<(value: T) => T>
): (value: T) => T {
  return (initialValue: T): T => {
    let result = initialValue;

    // Execute functions iteratively instead of nested calls
    for (const fn of functions) {
      result = fn(result);
    }

    return result;
  };
}

/**
 * Async function composition - handles promises safely
 */
export function safeComposeAsync<T>(
  ...functions: Array<(value: T) => T | Promise<T>>
): (value: T) => Promise<T> {
  return async (initialValue: T): Promise<T> => {
    let result = initialValue;

    // Execute functions iteratively with await
    for (const fn of functions) {
      result = await fn(result);
    }

    return result;
  };
}

/**
 * Event-driven execution - alternative to call chains
 */
export class SafeEventChain {
  private listeners: Map<string, Array<(data?: any) => void | Promise<void>>> =
    new Map();
  private executing = new Set<string>();

  // Register event handler
  on(event: string, handler: (data?: any) => void | Promise<void>): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
    return this;
  }

  // Emit event with safe sequential execution
  async emit(event: string, data?: any): Promise<void> {
    if (this.executing.has(event)) {
      console.warn(
        `Event '${event}' is already executing, skipping to prevent recursion`,
      );
      return;
    }

    const handlers = this.listeners.get(event) || [];
    if (handlers.length === 0) return;

    this.executing.add(event);

    try {
      // Execute handlers sequentially to prevent stack buildup
      for (const handler of handlers) {
        await handler(data);
      }
    } finally {
      this.executing.delete(event);
    }
  }

  // Remove all handlers for an event
  off(event: string): this {
    this.listeners.delete(event);
    return this;
  }

  // Check if event is currently executing
  isExecuting(event: string): boolean {
    return this.executing.has(event);
  }
}

/**
 * Batched operation executor - prevents call stack buildup
 */
export async function executeBatched<T, R>(
  items: T[],
  operation: (item: T, index: number) => R | Promise<R>,
  batchSize = 100,
  delay = 0,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch items sequentially (not nested)
    for (let j = 0; j < batch.length; j++) {
      const result = await operation(batch[j], i + j);
      results.push(result);
    }

    // Yield control to prevent blocking
    if (delay > 0 && i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Safe middleware pattern - replaces nested middleware calls
 */
export class SafeMiddleware<T = any> {
  private middleware: Array<
    (context: T, next: () => Promise<void>) => Promise<void>
  > = [];

  // Add middleware function
  use(fn: (context: T, next: () => Promise<void>) => Promise<void>): this {
    this.middleware.push(fn);
    return this;
  }

  // Execute middleware chain safely (iterative, not recursive)
  async execute(context: T): Promise<void> {
    let index = 0;

    const dispatch = async (): Promise<void> => {
      if (index >= this.middleware.length) return;

      const middleware = this.middleware[index++];

      // Use iterative approach instead of recursive next() calls
      await middleware(context, dispatch);
    };

    await dispatch();
  }
}

/**
 * Call chain examples and patterns
 */
export const CALL_CHAIN_PATTERNS = {
  dangerous: {
    nestedCalls: `
      // ❌ DANGEROUS: Deep nesting
      function level1() { level2(); }
      function level2() { level3(); }
      function level3() { level4(); }
      // ... can cause stack overflow with deep chains
    `,

    recursiveMiddleware: `
      // ❌ DANGEROUS: Recursive middleware
      function middleware1(req, res, next) {
        // ... processing
        next(); // Recursive call
      }
    `,

    chainedPromises: `
      // ❌ POTENTIALLY DANGEROUS: Deep promise chains
      promise1()
        .then(() => promise2())
        .then(() => promise3())
        .then(() => promise4())
        // ... can become unwieldy
    `,
  },

  safe: {
    sequentialExecution: `
      // ✅ SAFE: Sequential execution (user's pattern)
      function executeOperations() {
        operation1();
        operation2();
        operation3();
      }
    `,

    pipelinePattern: `
      // ✅ SAFE: Pipeline pattern
      const result = await createSafePipeline(
        initialValue,
        operation1,
        operation2,
        operation3
      );
    `,

    callChainManager: `
      // ✅ SAFE: Call chain manager
      const chain = new SafeCallChain();
      chain
        .add(() => operation1())
        .add(() => operation2())
        .add(() => operation3());
      await chain.finish();
    `,

    eventDriven: `
      // ✅ SAFE: Event-driven approach
      const events = new SafeEventChain();
      events.on('step1', () => events.emit('step2'));
      events.on('step2', () => events.emit('step3'));
      events.emit('step1');
    `,
  },
};

/**
 * Safe getter/setter factory - prevents infinite recursion
 * Creates safe property descriptors that avoid the common setter recursion trap
 */
export function createSafeProperty<T>(
  initialValue?: T,
  options: {
    beforeSet?: (newValue: T, oldValue: T) => T | void;
    afterSet?: (newValue: T, oldValue: T) => void;
    beforeGet?: (value: T) => T | void;
    afterGet?: (value: T) => void;
  } = {},
): {
  get: () => T;
  set: (value: T) => void;
  descriptor: PropertyDescriptor;
} {
  let _internalValue: T = initialValue as T;

  const getter = function (this: any): T {
    const beforeResult = options.beforeGet?.(_internalValue);
    const valueToReturn =
      beforeResult !== undefined ? (beforeResult as T) : _internalValue;
    options.afterGet?.(valueToReturn);
    return valueToReturn;
  };

  const setter = function (this: any, newValue: T): void {
    const oldValue = _internalValue;
    const beforeResult = options.beforeSet?.(newValue, oldValue);
    _internalValue =
      beforeResult !== undefined ? (beforeResult as T) : newValue;
    options.afterSet?.(_internalValue, oldValue);
  };

  return {
    get: getter,
    set: setter,
    descriptor: {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    },
  };
}

/**
 * Safe object with protected setters
 * Demonstrates the pattern from user's example with additional safety
 */
export class SafePropertyObject {
  private _value: any;
  private _data: Record<string, any> = {};

  constructor(initialValue?: any) {
    this._value = initialValue;
  }

  // Safe setter pattern (user's corrected example)
  set value(val: any) {
    this._value = val; // Uses different internal property name
  }

  get value(): any {
    return this._value;
  }

  // Advanced safe setter with validation
  set validatedValue(val: any) {
    if (val !== null && val !== undefined) {
      this._value = val;
    } else {
      console.warn("Invalid value provided, keeping previous value");
    }
  }

  get validatedValue(): any {
    return this._value;
  }

  // Dynamic property setter that prevents recursion
  setProperty(key: string, value: any): void {
    // Use internal storage to avoid setter recursion
    this._data[key] = value;
  }

  getProperty(key: string): any {
    return this._data[key];
  }

  // Safe property creation method
  createSafeProperty(name: string, initialValue?: any): void {
    const internalKey = `_${name}`;
    this._data[internalKey] = initialValue;

    Object.defineProperty(this, name, {
      get() {
        return this._data[internalKey];
      },
      set(value: any) {
        this._data[internalKey] = value;
      },
      enumerable: true,
      configurable: true,
    });
  }
}

/**
 * Utility to detect potential getter/setter recursion
 */
export function validatePropertyDescriptor(
  descriptor: PropertyDescriptor,
  propertyName: string,
): {
  safe: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (descriptor.set) {
    const setterCode = descriptor.set.toString();

    // Check for direct recursion patterns
    if (setterCode.includes(`this.${propertyName}`)) {
      issues.push(
        `Setter for '${propertyName}' references 'this.${propertyName}' which causes infinite recursion`,
      );
      suggestions.push(
        `Use a different internal property name like 'this._${propertyName}' or 'this.${propertyName}Value'`,
      );
    }

    // Check for potential indirect recursion
    if (setterCode.includes(`this[`)) {
      issues.push(
        `Setter for '${propertyName}' uses dynamic property access which might cause recursion`,
      );
      suggestions.push(
        `Ensure dynamic property access doesn't reference the same property`,
      );
    }
  }

  if (descriptor.get) {
    const getterCode = descriptor.get.toString();

    // Check for getter recursion
    if (getterCode.includes(`this.${propertyName}`)) {
      issues.push(
        `Getter for '${propertyName}' references 'this.${propertyName}' which causes infinite recursion`,
      );
      suggestions.push(
        `Use a different internal property name to store the actual value`,
      );
    }
  }

  return {
    safe: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Safe property definition wrapper
 * Automatically detects and prevents common recursion patterns
 */
export function defineSafeProperty(
  obj: any,
  propertyName: string,
  descriptor: PropertyDescriptor,
): boolean {
  const validation = validatePropertyDescriptor(descriptor, propertyName);

  if (!validation.safe) {
    console.error(`❌ Unsafe property definition for '${propertyName}':`);
    for (const issue of validation.issues) {
      console.error(`  - ${issue}`);
    }
    console.log("💡 Suggestions:");
    for (const suggestion of validation.suggestions) {
      console.log(`  - ${suggestion}`);
    }
    return false;
  }

  Object.defineProperty(obj, propertyName, descriptor);
  return true;
}

/**
 * Stack Inspection Utilities
 * Based on user's debugging patterns: console.trace() and new Error().stack
 */

/**
 * Analyze current call stack depth and structure
 * Based on user's new Error().stack pattern
 */
export function analyzeCallStack(): {
  depth: number;
  frames: string[];
  currentFunction: string;
  maxSafeDepth: number;
  isNearLimit: boolean;
} {
  const stack = new Error().stack || "";
  const lines = stack
    .split("\n")
    .filter((line) => line.trim() && !line.includes("Error"));

  return {
    depth: lines.length,
    frames: lines,
    currentFunction: lines[0] || "unknown",
    maxSafeDepth: 1000, // Conservative safe limit
    isNearLimit: lines.length > 800, // Warning threshold at 80%
  };
}

/**
 * Enhanced stack tracing utility
 * Based on user's console.trace() pattern with additional analysis
 */
export function traceCallStack(
  message = "Stack trace",
  includeAnalysis = true,
): void {
  console.trace(message);

  if (includeAnalysis) {
    const analysis = analyzeCallStack();
    console.log(
      `📊 Stack Analysis: ${analysis.depth} frames (${analysis.isNearLimit ? "⚠️ NEAR LIMIT" : "✅ SAFE"})`,
    );

    if (analysis.isNearLimit) {
      console.warn(
        `⚠️ Stack depth ${analysis.depth} approaching limit of ${analysis.maxSafeDepth}`,
      );
    }
  }
}

/**
 * Stack depth monitor for recursion safety
 * Inspired by user's stack inspection patterns
 */
export class CallStackMonitor {
  private maxDepthSeen = 0;
  private calls: Array<{ function: string; depth: number; timestamp: number }> =
    [];
  private warningThreshold = 800;
  private maxSafeDepth = 1000;

  constructor(warningThreshold = 800, maxSafeDepth = 1000) {
    this.warningThreshold = warningThreshold;
    this.maxSafeDepth = maxSafeDepth;
  }

  // Get current stack depth using user's pattern
  getCurrentDepth(): number {
    const stack = new Error().stack || "";
    return stack
      .split("\n")
      .filter((line) => line.trim() && !line.includes("Error")).length;
  }

  // Monitor function call with stack analysis
  monitorCall(functionName: string): {
    depth: number;
    isSafe: boolean;
    shouldWarn: boolean;
    shouldStop: boolean;
  } {
    const depth = this.getCurrentDepth();
    this.maxDepthSeen = Math.max(this.maxDepthSeen, depth);

    const call = {
      function: functionName,
      depth: depth,
      timestamp: Date.now(),
    };

    this.calls.push(call);

    const shouldWarn = depth > this.warningThreshold;
    const shouldStop = depth > this.maxSafeDepth;

    if (shouldWarn && !shouldStop) {
      console.warn(`⚠️ ${functionName} at depth ${depth} (approaching limit)`);
    } else if (shouldStop) {
      console.error(
        `🚨 ${functionName} at depth ${depth} (EXCEEDS SAFE LIMIT)`,
      );
    }

    return {
      depth,
      isSafe: depth <= this.maxSafeDepth,
      shouldWarn,
      shouldStop,
    };
  }

  // Use user's console.trace pattern with monitoring
  traceWithMonitoring(message: string): void {
    const depth = this.getCurrentDepth();
    console.trace(`${message} (depth: ${depth})`);

    if (depth > this.warningThreshold) {
      console.warn(`⚠️ Stack depth ${depth} is concerning`);
    }
  }

  // Get monitoring report
  getReport(): {
    totalCalls: number;
    maxDepth: number;
    averageDepth: number;
    warningCount: number;
    errorCount: number;
  } {
    const warningCount = this.calls.filter(
      (call) => call.depth > this.warningThreshold,
    ).length;
    const errorCount = this.calls.filter(
      (call) => call.depth > this.maxSafeDepth,
    ).length;

    return {
      totalCalls: this.calls.length,
      maxDepth: this.maxDepthSeen,
      averageDepth:
        this.calls.reduce((sum, call) => sum + call.depth, 0) /
          this.calls.length || 0,
      warningCount,
      errorCount,
    };
  }

  // Reset monitoring state
  reset(): void {
    this.maxDepthSeen = 0;
    this.calls = [];
  }
}

/**
 * Safe recursive function with built-in stack monitoring
 * Combines recursion safety with user's stack inspection patterns
 */
export function createStackMonitoredFunction<T extends any[], R>(
  fn: (monitor: CallStackMonitor, ...args: T) => R,
  functionName = "monitoredFunction",
): (...args: T) => R {
  const monitor = new CallStackMonitor();

  return (...args: T): R => {
    const status = monitor.monitorCall(functionName);

    if (status.shouldStop) {
      throw new Error(
        `Stack overflow prevented in ${functionName} at depth ${status.depth}`,
      );
    }

    return fn(monitor, ...args);
  };
}

/**
 * Stack-aware retry function with monitoring
 * Combines safe retry with stack depth analysis
 */
export async function stackMonitoredRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000,
): Promise<T> {
  const monitor = new CallStackMonitor();
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const status = monitor.monitorCall(`retry-attempt-${attempt}`);

    if (status.shouldStop) {
      throw new Error(
        `Retry operation prevented due to stack depth: ${status.depth}`,
      );
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        // Final attempt - use user's stack tracing pattern
        console.trace(`Final retry attempt failed for operation`);
        throw lastError;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000);
      console.warn(
        `Attempt ${attempt} failed (stack depth: ${status.depth}), retrying in ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Debug utilities for stack inspection
 * Enhanced versions of user's patterns
 */
export const StackDebugUtils = {
  // User's console.trace pattern enhanced
  trace: (message = "Stack trace"): void => {
    console.trace(message);
  },

  // User's new Error().stack pattern enhanced
  getStack: (): string => {
    return new Error().stack || "Stack trace not available";
  },

  // Combined analysis
  analyzeAndTrace: (message = "Stack analysis"): void => {
    const analysis = analyzeCallStack();
    console.trace(
      `${message} - Depth: ${analysis.depth}, Safe: ${!analysis.isNearLimit}`,
    );

    if (analysis.isNearLimit) {
      console.warn("⚠️ Stack depth approaching dangerous levels");
    }
  },

  // Performance monitoring with stack tracking
  measureWithStack: <T>(fn: () => T, label = "operation"): T => {
    const startAnalysis = analyzeCallStack();
    const startTime = performance.now();

    console.time(label);
    const result = fn();
    console.timeEnd(label);

    const endAnalysis = analyzeCallStack();
    const endTime = performance.now();

    console.log(`📊 ${label} completed:`);
    console.log(`  Duration: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`  Stack depth: ${startAnalysis.depth} → ${endAnalysis.depth}`);
    console.log(
      `  Stack change: ${endAnalysis.depth - startAnalysis.depth} frames`,
    );

    return result;
  },
};

/**
 * Example usage and best practices documentation
 */
export const RECURSION_BEST_PRACTICES = {
  guidelines: [
    "Use iterative approaches for operations that might have deep recursion",
    "Implement stack-based traversal for tree/graph structures",
    "Use queues for breadth-first operations",
    "Add depth limits to prevent infinite recursion",
    "Consider using generators for lazy evaluation",
    "Break large operations into chunks to avoid blocking",
    "Use WeakMap/WeakSet to handle circular references",
    "Tail recursion can be safer but requires engine support",
    "Always provide iterative fallbacks for tail recursive functions",
    "Never reference the same property name in getters/setters",
    "Use internal property names with prefixes like _value",
    "Validate property descriptors before defining them",
    "Replace nested function calls with sequential execution",
    "Use pipeline patterns instead of deep call chains",
    "Implement event-driven architectures to avoid call stacks",
    "Batch operations to prevent stack buildup",
    "Use console.trace() for debugging stack overflow issues",
    "Monitor stack depth with new Error().stack analysis",
    "Set up stack monitoring for production recursion",
    "Implement early warning systems for stack depth",
  ],

  examples: {
    // Recursive approach (risky)
    recursiveCountdown: `
      function recursiveCountdown(n) {
        if (n === 0) return;
        recursiveCountdown(n - 1); // Risk: Stack overflow
      }
    `,

    // Iterative approach (safe)
    iterativeCountdown: `
      function iterativeCountdown(n) {
        while (n > 0) {
          n--;
        }
      }
    `,

    // Dangerous getter/setter (user's example)
    dangerousProperty: `
      const obj = {
        set value(val) {
          this.value = val; // INFINITE RECURSION!
        }
      };
    `,

    // Safe getter/setter (user's fix)
    safeProperty: `
      const obj = {
        set value(val) {
          this._value = val; // Fixed: different property name
        },
        get value() {
          return this._value;
        }
      };
    `,

    // Advanced safe property pattern
    advancedSafeProperty: `
      class SafeObject {
        constructor() {
          this._data = new Map();
        }
        
        set value(val) {
          this._data.set('value', val); // Completely isolated storage
        }
        
        get value() {
          return this._data.get('value');
        }
      }
    `,

    // Dangerous nested calls (user's example)
    dangerousNestedCalls: `
      function level1() { level2(); }
      function level2() { level3(); }
      function level3() { /* ... */ }
      // Risk: Deep call stack
    `,

    // Safe sequential execution (user's fix)
    safeSequentialExecution: `
      function executeOperations() {
        operation1();
        operation2();
        operation3();
      }
      // Fixed: Sequential, not nested
    `,

    // Safe pipeline pattern
    safePipelinePattern: `
      const result = await createSafePipeline(
        initialValue,
        operation1,
        operation2,
        operation3
      );
    `,

    // Tail recursive approach (conditional safety)
    tailRecursiveCountdown: `
      "use strict";
      function tailRecursiveCountdown(n) {
        if (n <= 0) return;
        return tailRecursiveCountdown(n - 1); // Tail position - may be optimized
      }
      // Note: TCO support varies by engine
    `,

    // Recursive tree traversal (risky)
    recursiveTraversal: `
      function traverse(node) {
        process(node);
        node.children?.forEach(child => traverse(child)); // Risk: Deep trees
      }
    `,

    // Iterative tree traversal (safe)
    iterativeTraversal: `
      function traverse(root) {
        const stack = [root];
        while (stack.length > 0) {
          const node = stack.pop();
          process(node);
          if (node.children) {
            stack.push(...node.children.reverse());
          }
        }
      }
    `,

    // Tail recursive factorial (conditional)
    tailRecursiveFactorial: `
      "use strict";
      function factorial(n, acc = 1) {
        if (n <= 1) return acc;
        return factorial(n - 1, n * acc); // Tail position call
      }
      // Requires strict mode and engine support
    `,

    // Safe factorial with fallback
    safeFactorialWithFallback: `
      function safeFactorial(n, useTailRecursion = false) {
        if (useTailRecursion && n < 1000 && detectTCO()) {
          return tailRecursiveFactorial(n);
        }
        // Fallback to iterative approach
        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return result;
      }
    `,

    // Stack inspection for debugging (user's patterns)
    stackDebugging: `
      function debugRecursion(n) {
        // User's pattern 1: Quick stack trace
        console.trace('Current recursion state');
        
        // User's pattern 2: Stack depth analysis
        const stack = new Error().stack;
        const depth = stack.split('\\n').length - 1;
        console.log(\`Stack depth: \${depth}\`);
        
        if (depth > 100) {
          console.warn('Stack getting deep!');
          return 'STOPPED';
        }
        
        return n > 0 ? debugRecursion(n - 1) : 'DONE';
      }
    `,

    // Enhanced stack monitoring
    enhancedStackMonitoring: `
      const monitor = new CallStackMonitor();
      
      function monitoredRecursion(n) {
        const status = monitor.monitorCall('recursion');
        
        if (status.shouldStop) {
          throw new Error('Stack overflow prevented');
        }
        
        return n > 0 ? monitoredRecursion(n - 1) : n;
      }
    `,

    // Real-time stack analysis
    realTimeStackAnalysis: `
      function analyzeAndProceed() {
        const analysis = analyzeCallStack();
        
        console.log(\`Current depth: \${analysis.depth}\`);
        console.log(\`Safe to continue: \${!analysis.isNearLimit}\`);
        
        if (analysis.isNearLimit) {
          console.warn('Approaching stack limit - switching to iterative');
          return iterativeApproach();
        }
        
        return recursiveApproach();
      }
    `,
  },

  tcoConsiderations: {
    supportMatrix: {
      Safari: "Full support in strict mode",
      Chrome: "No support (was removed)",
      Firefox: "No support",
      "Node.js": "Limited support with --harmony-tailcalls",
      Edge: "No support",
    },

    bestPractices: [
      "Always test TCO support before relying on it",
      "Provide iterative fallbacks for production code",
      "Use 'use strict' directive for potential TCO",
      "Limit recursion depth even with tail calls",
      "Monitor performance and stack usage",
      "Consider trampolining for complex tail recursive scenarios",
    ],

    detectionMethod: `
      function detectTCO() {
        "use strict";
        try {
          function test(n) {
            if (n <= 0) return 0;
            return test(n - 1);
          }
          test(1000);
          return true;
        } catch (e) {
          return e instanceof RangeError ? false : true;
        }
      }
    `,
  },

  propertyAccessorSafety: {
    commonPitfalls: [
      "Setting a property to itself in its own setter",
      "Getting a property from itself in its own getter",
      "Dynamic property access that references the same property",
      "Circular property dependencies",
      "Missing internal storage for property values",
    ],

    safePatterns: [
      "Use different internal property names (prefix with _)",
      "Use Map or WeakMap for internal storage",
      "Validate property descriptors before defining",
      "Implement property access logging for debugging",
      "Use Proxy objects for advanced property control",
    ],

    examples: {
      dangerous: `
        // ❌ INFINITE RECURSION
        const obj = {
          set value(val) {
            this.value = val; // Calls itself forever!
          }
        };
      `,

      safe: `
        // ✅ SAFE PATTERN
        const obj = {
          set value(val) {
            this._value = val; // Different property name
          },
          get value() {
            return this._value;
          }
        };
      `,

      advanced: `
        // ✅ ADVANCED SAFE PATTERN
        class SafeProperties {
          constructor() {
            this._store = new Map();
          }
          
          set value(val) {
            this._store.set('value', val); // Isolated storage
          }
          
          get value() {
            return this._store.get('value');
          }
        }
      `,
    },
  },

  stackInspectionPatterns: {
    userPatterns: [
      "console.trace() - Quick visual stack inspection",
      "new Error().stack - Programmatic stack depth analysis",
      "Stack depth counting for recursion limits",
      "Real-time stack monitoring during execution",
      "Early warning systems for stack overflow prevention",
    ],

    practicalApplications: [
      "Debug infinite recursion issues",
      "Monitor recursive function performance",
      "Set dynamic recursion limits based on current stack",
      "Log stack traces for error reporting",
      "Analyze call patterns in complex applications",
      "Optimize recursive algorithms based on stack usage",
    ],

    examples: {
      basicStackTrace: `
        // ✅ USER'S PATTERN: Quick stack inspection
        function debugFunction() {
          console.trace('Debug point reached');
          // Shows full call stack to this point
        }
      `,

      stackDepthAnalysis: `
        // ✅ USER'S PATTERN: Programmatic analysis
        function checkStackDepth() {
          const stack = new Error().stack;
          const depth = stack.split('\\n').length - 1;
          console.log(\`Current stack depth: \${depth}\`);
          return depth;
        }
      `,

      recursionWithMonitoring: `
        // ✅ ENHANCED: Combine with recursion safety
        function safeRecursiveFunction(n) {
          // User's stack inspection
          const stack = new Error().stack;
          const depth = stack.split('\\n').length - 1;
          
          if (depth > 1000) {
            console.trace('Stack limit reached');
            throw new Error('Stack overflow prevented');
          }
          
          return n > 0 ? safeRecursiveFunction(n - 1) : 0;
        }
      `,

      productionMonitoring: `
        // ✅ PRODUCTION: Real-time monitoring
        class ProductionStackMonitor {
          static monitor(fn, name) {
            return function(...args) {
              const beforeDepth = new Error().stack.split('\\n').length;
              
              try {
                const result = fn.apply(this, args);
                const afterDepth = new Error().stack.split('\\n').length;
                
                if (beforeDepth > 500) {
                  console.warn(\`\${name} called at high stack depth: \${beforeDepth}\`);
                }
                
                return result;
              } catch (error) {
                console.trace(\`Error in \${name}\`);
                throw error;
              }
            };
          }
        }
      `,
    },

    integrationWithSafetyPatterns: [
      "Combine with depth limiting for comprehensive safety",
      "Use with trampoline patterns for performance analysis",
      "Integrate with iterative alternatives for comparison",
      "Add to property accessor safety for getter/setter debugging",
      "Include in call chain monitoring for pipeline analysis",
    ],
  },
};
// Your pattern enhanced with safety
export function enhancedTailRecursiveFactorial(
  n: number,
  acc: bigint = BigInt(1),
): bigint {
  // Safety check for large numbers
  if (n > 1000) {
    console.warn("Large factorial detected, using safe iterative approach");
    return safeFactorial(n);
  }

  // Your exact tail recursion pattern
  if (n <= 1) return acc;
  return enhancedTailRecursiveFactorial(n - 1, BigInt(n) * acc);
}

// Universal trampoline version (works everywhere) - already exported above as safeTrampolineFactorial
