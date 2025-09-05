/**
 * Property Accessor Recursion Demo
 * 
 * This demonstrates the user's example of infinite recursion in getters/setters
 * and showsfunction createSafeObconst pclass AdvancedSafeProperty {
  constructor() {
    this._value = undefined;
        this._history = [];
  }yObj = createSafeObject();ect(initialValue) {multiple ways to fix it safely.
 */

console.log("🔄 Property Accessor Recursion Patterns Demo");
console.log("===========================================\n");

// 🚨 DANGEROUS PATTERN (User's "Before" example)
console.log("❌ DANGEROUS: Infinite Recursion Pattern");
console.log("// Before: Recursive setter");
console.log("const obj = {");
console.log("  set value(val) {");
console.log("    this.value = val; // INFINITE RECURSION");
console.log("  }");
console.log("};");
console.log("");

// Let's demonstrate what happens (safely)
try {
  const badObj = {
    _recursionCount: 0,
    set value(val) {
      this._recursionCount++;
      if (this._recursionCount > 5) {
        throw new Error(
          `Stopped infinite recursion after ${this._recursionCount} calls`
        );
      }
      this.value = val; // This would normally cause infinite recursion
    },
  };

  badObj.value = "test";
} catch (error) {
  console.log(`🚨 Caught recursion: ${error.message}\n`);
}

// ✅ SAFE PATTERN (User's "After" example)
console.log("✅ SAFE: User's Fixed Pattern");
console.log("// After: Use different property name");
console.log("const obj = {");
console.log("  set value(val) {");
console.log("    this._value = val; // Fixed");
console.log("  },");
console.log("  get value() {");
console.log("    return this._value;");
console.log("  }");
console.log("};");
console.log("");

// Demonstrate the working version
const goodObj = {
  _value: undefined,
  set value(val) {
    this._value = val; // User's fix: different property name
  },
  get value() {
    return this._value;
  },
};

goodObj.value = "User's solution works!";
console.log(`✅ Testing user's solution: "${goodObj.value}"\n`);

// 🎯 ADDITIONAL SAFE PATTERNS
console.log("🎯 Additional Safe Patterns:\n");

// Pattern 1: Map-based storage
console.log("📦 Pattern 1: Map-based Storage");
class MapBasedStorage {
  constructor() {
    this._storage = new Map();
  }

  set value(val) {
    this._storage.set("value", val);
  }

  get value() {
    return this._storage.get("value");
  }
}

const mapObj = new MapBasedStorage();
mapObj.value = "Map storage works!";
console.log(`✅ Map storage: "${mapObj.value}"`);
console.log("");

// Pattern 2: WeakMap for privacy
console.log("🔒 Pattern 2: WeakMap for Privacy");
const privateStore = new WeakMap();

class WeakMapStorage {
  constructor() {
    privateStore.set(this, {});
  }

  set value(val) {
    const data = privateStore.get(this);
    data.value = val;
  }

  get value() {
    const data = privateStore.get(this);
    return data.value;
  }
}

const weakMapObj = new WeakMapStorage();
weakMapObj.value = "WeakMap privacy works!";
console.log(`✅ WeakMap storage: "${weakMapObj.value}"`);
console.log("");

// Pattern 3: Symbol-based properties
console.log("🔑 Pattern 3: Symbol-based Private Properties");
const valueSymbol = Symbol("value");

class SymbolStorage {
  [valueSymbol];

  set value(val) {
    this[valueSymbol] = val;
  }

  get value() {
    return this[valueSymbol];
  }
}

const symbolObj = new SymbolStorage();
symbolObj.value = "Symbol storage works!";
console.log(`✅ Symbol storage: "${symbolObj.value}"`);
console.log("");

// Pattern 4: Proxy-based approach
console.log("🎭 Pattern 4: Proxy-based Approach");
function createSafeObject(initialValue) {
  const internalStore = { value: initialValue };

  return new Proxy(
    {},
    {
      set(target, prop, value) {
        if (prop === "value") {
          internalStore.value = value;
          return true;
        }
        return Reflect.set(target, prop, value);
      },

      get(target, prop) {
        if (prop === "value") {
          return internalStore.value;
        }
        return Reflect.get(target, prop);
      },
    }
  );
}

const proxyObj = createSafeObject();
proxyObj.value = "Proxy approach works!";
console.log(`✅ Proxy storage: "${proxyObj.value}"`);
console.log("");

// 🔍 ADVANCED PATTERN: Validation and hooks
console.log("🔍 Advanced Pattern: Validation and Hooks");
class AdvancedSafeProperty {
  constructor() {
    this._value = undefined;
    this._history = [];
  }

  set value(val) {
    // Validation
    if (val === null || val === undefined) {
      console.log("⚠️  Warning: Setting null/undefined value");
    }

    // Store history
    if (this._value !== undefined) {
      this._history.push(this._value);
    }

    // Before hook
    console.log(`🔄 Changing value from "${this._value}" to "${val}"`);

    // Set value
    this._value = val;

    // After hook
    console.log(`✅ Value changed successfully`);
  }

  get value() {
    return this._value;
  }

  get history() {
    return [...this._history]; // Return copy to prevent modification
  }
}

const advancedObj = new AdvancedSafeProperty();
advancedObj.value = "First value";
advancedObj.value = "Second value";
console.log(`📊 Current: "${advancedObj.value}"`);
console.log(
  `📜 History: [${advancedObj.history.map((v) => `"${v}"`).join(", ")}]`
);
console.log("");

// 🎯 PERFORMANCE COMPARISON
console.log("⚡ Performance Comparison");
console.log("========================");

const iterations = 100000;

// Test 1: Direct property access (baseline)
const directObj = { _value: 0 };
const directStart = performance.now();
for (let i = 0; i < iterations; i++) {
  directObj._value = i;
}
const directEnd = performance.now();
console.log(`Direct property: ${(directEnd - directStart).toFixed(2)}ms`);

// Test 2: Safe getter/setter (user's pattern)
const safeObj = {
  _value: 0,
  set value(val) {
    this._value = val;
  },
  get value() {
    return this._value;
  },
};
const safeStart = performance.now();
for (let i = 0; i < iterations; i++) {
  safeObj.value = i;
}
const safeEnd = performance.now();
console.log(`Safe getter/setter: ${(safeEnd - safeStart).toFixed(2)}ms`);

// Test 3: Map-based storage
const mapBasedObj = new MapBasedStorage();
const mapStart = performance.now();
for (let i = 0; i < iterations; i++) {
  mapBasedObj.value = i;
}
const mapEnd = performance.now();
console.log(`Map-based storage: ${(mapEnd - mapStart).toFixed(2)}ms`);

console.log("");
console.log("📊 Performance Results:");
console.log(
  `- User's safe pattern is ${(((safeEnd - safeStart) / (directEnd - directStart)) * 100).toFixed(1)}% of direct access speed`
);
console.log(
  `- Map-based storage is ${(((mapEnd - mapStart) / (directEnd - directStart)) * 100).toFixed(1)}% of direct access speed`
);
console.log("");

// 🎉 CONCLUSION
console.log("🎉 Conclusion");
console.log("=============");
console.log("✅ User's fix is excellent: simple, fast, and effective");
console.log(
  '✅ The pattern "use different internal property name" is the best practice'
);
console.log("✅ Advanced patterns provide additional features when needed");
console.log("✅ Performance impact is minimal for the basic safe pattern");
console.log("");
console.log("💡 Key Lesson: Your solution is the recommended approach!");
console.log("   Simple, readable, and performant. 🚀");
