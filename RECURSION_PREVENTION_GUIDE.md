# Recursion Prevention Guide

## Overview

This guide documents best practices for preventing "Maximum call stack exceeded" errors in the HFRP Relief project, with safe iterative alternatives to common recursive patterns.

## Common Recursive Patterns and Safe Alternatives

### 1. Countdown Functions

**❌ Recursive (Risky)**

```javascript
function recursiveCountdown(n) {
  if (n === 0) return;
  console.log(n);
  recursiveCountdown(n - 1); // Risk: Stack overflow with large n
}
```

**✅ Iterative (Safe)**

```javascript
function iterativeCountdown(n) {
  while (n > 0) {
    console.log(n);
    n--;
  }
}
```

### 2. Tree/DOM Traversal

**❌ Recursive (Risky)**

```javascript
function traverseDOM(element) {
  processElement(element);
  element.children.forEach((child) => traverseDOM(child)); // Risk: Deep DOM trees
}
```

**✅ Iterative (Safe)**

```javascript
function traverseDOM(root) {
  const stack = [root];
  while (stack.length > 0) {
    const element = stack.pop();
    processElement(element);
    // Add children in reverse order to maintain traversal order
    for (let i = element.children.length - 1; i >= 0; i--) {
      stack.push(element.children[i]);
    }
  }
}
```

### 3. React useEffect Dependencies

**❌ Recursive (Risky)**

```javascript
useEffect(() => {
  if (condition) {
    setCondition(!condition); // Risk: Infinite re-renders
  }
}, [condition]); // Dangerous dependency
```

**✅ Safe Dependencies**

```javascript
useEffect(() => {
  // Use ref for mutable values
  const shouldCheck = checkSomeCondition();
  if (shouldCheck) {
    performAction();
  }
}, []); // Empty dependency array or carefully managed dependencies
```

### 4. API Retry Logic

**❌ Recursive (Risky)**

```javascript
async function fetchWithRetry(url, retries = 3) {
  try {
    return await fetch(url);
  } catch (error) {
    if (retries > 0) {
      return fetchWithRetry(url, retries - 1); // Risk: Deep call stack
    }
    throw error;
  }
}
```

**✅ Iterative (Safe)**

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

### 5. Array Processing

**❌ Recursive (Risky)**

```javascript
function processArrayRecursive(arr, index = 0) {
  if (index >= arr.length) return;

  processItem(arr[index]);
  processArrayRecursive(arr, index + 1); // Risk: Large arrays
}
```

**✅ Iterative (Safe)**

```javascript
function processArrayIterative(arr) {
  for (let i = 0; i < arr.length; i++) {
    processItem(arr[i]);
  }
}

// Or for async processing with chunking
async function processArrayChunked(arr, chunkSize = 100) {
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    await Promise.all(chunk.map((item) => processItem(item)));

    // Yield control to prevent blocking
    if (i + chunkSize < arr.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}
```

**⚠️ Engine-Dependent (Conditional Safety)**

```javascript
"use strict";
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc); // Tail position call
}
// Requires strict mode and engine support
```

**✅ Trampoline (Engine-Independent Safety)**

```javascript
function trampoline(fn) {
  return function (...args) {
    let result = fn(...args);
    while (typeof result === "function") {
      result = result();
    }
    return result;
  };
}

function trampolineFactorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => trampolineFactorial(n - 1, n * acc);
}

const safeFactorial = trampoline(trampolineFactorial);
```

**✅ Iterative with Fallback**

```javascript
function smartFactorial(n, preferTailRecursion = false) {
  // Detection and fallback logic
  if (preferTailRecursion && detectTCO() && n < 1000) {
    return tailRecursiveFactorial(n);
  }
  // Safe iterative fallback
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

**❌ Recursive (Risky)**

```javascript
function processArrayRecursive(arr, index = 0) {
  if (index >= arr.length) return;

  processItem(arr[index]);
  processArrayRecursive(arr, index + 1); // Risk: Large arrays
}
```

**✅ Iterative (Safe)**

```javascript
function processArrayIterative(arr) {
  for (let i = 0; i < arr.length; i++) {
    processItem(arr[i]);
  }
}

// Or for async processing with chunking
async function processArrayChunked(arr, chunkSize = 100) {
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    await Promise.all(chunk.map((item) => processItem(item)));

    // Yield control to prevent blocking
    if (i + chunkSize < arr.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}
```

## Project-Specific Patterns

### AdminAuth Provider (Fixed)

The `AdminAuth.tsx` component was causing stack overflow due to infinite useEffect loops. Fixed by:

- Simplifying dependency arrays
- Using proper initial state
- Avoiding recursive state updates

### Error Boundary Implementation

The `ErrorBoundary.tsx` components use proper class-based error catching without recursion risks.

### CSS Fallback System

The admin layout CSS fallback system uses iterative checking with timeouts instead of recursive polling.

## Best Practices Checklist

### ✅ Do:

- Use `for` loops and `while` loops for repetitive operations
- Implement stack-based algorithms for tree traversal
- Use queues for breadth-first operations
- Add depth limits to prevent infinite operations
- Use `setTimeout` for yielding control in long operations
- Implement proper error boundaries
- Use WeakMap/WeakSet for circular reference handling

### ❌ Don't:

- Create functions that call themselves without guaranteed termination
- Use recursive algorithms for potentially large datasets
- Create infinite useEffect dependency loops
- Implement deep recursion without stack limits
- Use recursive JSON parsing on untrusted data
- Create recursive API calls without exponential backoff

## Detection and Monitoring

### Error Signatures to Watch For:

- "Maximum call stack size exceeded"
- "RangeError: Maximum call stack size exceeded"
- Browser freezing during operations
- Exponentially growing memory usage

### Debugging Tools:

1. **Chrome DevTools Call Stack**: Monitor function call depth
2. **React DevTools Profiler**: Detect infinite re-renders
3. **Console Logging**: Add depth counters to suspicious functions
4. **Performance Monitoring**: Track CPU usage spikes

### Example Debugging Code:

```javascript
function debugRecursion(func, maxDepth = 100) {
  let depth = 0;

  return function wrapper(...args) {
    if (depth++ > maxDepth) {
      console.error(`Recursion depth exceeded: ${maxDepth}`);
      throw new Error(`Maximum recursion depth exceeded`);
    }

    try {
      const result = func.apply(this, args);
      depth--;
      return result;
    } catch (error) {
      depth--;
      throw error;
    }
  };
}
```

## Implementation in HFRP Relief

### Current Safe Patterns:

1. **Admin Authentication**: Uses proper useEffect patterns
2. **Error Boundaries**: Class-based error catching
3. **CSS Fallback**: Iterative style checking
4. **Promise Utils**: Iterative retry logic
5. **DOM Operations**: Stack-based traversal where needed

### Files to Monitor:

- `src/app/_components/AdminAuth.tsx`
- `src/app/_components/ErrorBoundary.tsx`
- `src/lib/promiseUtils.ts`
- `src/lib/safeIterationUtils.ts`

## Testing Stack Overflow Resistance

### Test Cases:

```javascript
// Test large countdown
safeCountdown(10000);

// Test deep object cloning
const deepObject = { level: 0 };
let current = deepObject;
for (let i = 1; i < 1000; i++) {
  current.next = { level: i };
  current = current.next;
}
const cloned = safeDeepClone(deepObject);

// Test large array processing
const largeArray = Array.from({ length: 100000 }, (_, i) => i);
await safeChunkProcessor(largeArray, (item) => item * 2);
```

## Resources and References

- [MDN: Maximum call stack size exceeded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion)
- [React: Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)
- [JavaScript: Understanding the Call Stack](https://blog.bitsrc.io/understanding-call-stack-and-heap-memory-in-js-e34bf8d3c3a4)

---

**Last Updated**: August 15, 2025  
**Status**: ✅ No recursive patterns detected in current codebase  
**Next Review**: Monitor for new recursive patterns during development
