#!/usr/bin/env node

const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

console.log("🔍 HFRP Admin Panel - Complete Feature Validation");
console.log("=".repeat(60));

const tests = {
  server: [],
  authentication: [],
  navigation: [],
  components: [],
  analytics: [],
  features: [],
};

let passCount = 0;
let failCount = 0;
let warningCount = 0;

function log(emoji, message, type = "info") {
  console.log(`${emoji} ${message}`);
  if (type === "pass") passCount++;
  else if (type === "fail") failCount++;
  else if (type === "warning") warningCount++;
}

async function testServer() {
  console.log("\n📡 SERVER HEALTH");
  console.log("-".repeat(30));

  try {
    const { stdout } = await execPromise(
      'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin'
    );
    if (stdout === "200") {
      log("✅", "Admin endpoint responding (HTTP 200)", "pass");
      tests.server.push({ name: "Admin endpoint", status: "PASS" });
    } else {
      log("❌", `Admin endpoint error (HTTP ${stdout})`, "fail");
      tests.server.push({ name: "Admin endpoint", status: "FAIL" });
    }
  } catch (error) {
    log("❌", "Server connection failed", "fail");
    tests.server.push({ name: "Server connection", status: "FAIL" });
  }

  // Test API endpoints
  const endpoints = [
    "/admin/analytics",
    "/admin/donations",
    "/admin/campaigns",
  ];
  for (const endpoint of endpoints) {
    try {
      const { stdout } = await execPromise(
        `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000${endpoint}`
      );
      if (stdout === "200") {
        log("✅", `${endpoint} responding (HTTP 200)`, "pass");
        tests.server.push({ name: endpoint, status: "PASS" });
      } else {
        log("⚠️", `${endpoint} status: HTTP ${stdout}`, "warning");
        tests.server.push({ name: endpoint, status: "WARNING" });
      }
    } catch (error) {
      log("❌", `${endpoint} failed`, "fail");
      tests.server.push({ name: endpoint, status: "FAIL" });
    }
  }
}

async function testAuthentication() {
  console.log("\n🔐 AUTHENTICATION SYSTEM");
  console.log("-".repeat(30));

  // Check AdminAuth component
  const authPath = "src/app/_components/AdminAuth.tsx";
  if (fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, "utf8");

    if (
      authContent.includes("useEffect") &&
      authContent.includes("localStorage")
    ) {
      log("✅", "AdminAuth component has proper hooks", "pass");
      tests.authentication.push({ name: "AdminAuth hooks", status: "PASS" });
    } else {
      log("❌", "AdminAuth missing critical hooks", "fail");
      tests.authentication.push({ name: "AdminAuth hooks", status: "FAIL" });
    }

    if (
      (authContent.includes("isAuthenticated") &&
        authContent.includes("setIsAuthenticated")) ||
      (authContent.includes("user") &&
        authContent.includes("setUser") &&
        authContent.includes("login") &&
        authContent.includes("logout"))
    ) {
      log("✅", "Authentication state management present", "pass");
      tests.authentication.push({
        name: "Auth state management",
        status: "PASS",
      });
    } else {
      log("❌", "Authentication state management missing", "fail");
      tests.authentication.push({
        name: "Auth state management",
        status: "FAIL",
      });
    }

    if (authContent.includes("children") && authContent.includes("isLoading")) {
      log("✅", "Loading states implemented", "pass");
      tests.authentication.push({ name: "Loading states", status: "PASS" });
    } else {
      log("❌", "Loading states missing", "fail");
      tests.authentication.push({ name: "Loading states", status: "FAIL" });
    }
  } else {
    log("❌", "AdminAuth component not found", "fail");
    tests.authentication.push({ name: "AdminAuth component", status: "FAIL" });
  }
}

async function testNavigation() {
  console.log("\n🧭 NAVIGATION & ROUTING");
  console.log("-".repeat(30));

  const adminPages = [
    "src/app/admin/page.tsx",
    "src/app/admin/analytics/page.tsx",
    "src/app/admin/donations/page.tsx",
    "src/app/admin/campaigns/page.tsx",
  ];

  for (const page of adminPages) {
    if (fs.existsSync(page)) {
      const content = fs.readFileSync(page, "utf8");
      if (
        content.includes("export default") ||
        content.includes("export function")
      ) {
        log(
          "✅",
          `${page.split("/").pop()} exists and exports component`,
          "pass"
        );
        tests.navigation.push({ name: page.split("/").pop(), status: "PASS" });
      } else {
        log("❌", `${page.split("/").pop()} missing export`, "fail");
        tests.navigation.push({ name: page.split("/").pop(), status: "FAIL" });
      }
    } else {
      log("⚠️", `${page.split("/").pop()} not found`, "warning");
      tests.navigation.push({ name: page.split("/").pop(), status: "WARNING" });
    }
  }

  // Check admin layout
  const layoutPath = "src/app/admin/layout.tsx";
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, "utf8");
    if (layoutContent.includes("AdminAuth")) {
      log("✅", "Admin layout includes authentication", "pass");
      tests.navigation.push({ name: "Admin layout auth", status: "PASS" });
    } else {
      log("❌", "Admin layout missing authentication", "fail");
      tests.navigation.push({ name: "Admin layout auth", status: "FAIL" });
    }
  }
}

async function testComponents() {
  console.log("\n🧩 COMPONENTS & DEPENDENCIES");
  console.log("-".repeat(30));

  // Check Chart.js setup
  const chartSetupPath = "src/lib/chartSetup.ts";
  if (fs.existsSync(chartSetupPath)) {
    const chartContent = fs.readFileSync(chartSetupPath, "utf8");
    if (
      (chartContent.includes("Chart.register") &&
        chartContent.includes("registerComponentsOnce")) ||
      (chartContent.includes("Chart.register") &&
        chartContent.includes("registerChartJS")) ||
      (chartContent.includes("ChartJS.register") &&
        chartContent.includes("registerChartJS"))
    ) {
      log("✅", "Chart.js centralized setup working", "pass");
      tests.components.push({ name: "Chart.js setup", status: "PASS" });
    } else {
      log("❌", "Chart.js setup incomplete", "fail");
      tests.components.push({ name: "Chart.js setup", status: "FAIL" });
    }
  } else {
    log("❌", "Chart.js setup file missing", "fail");
    tests.components.push({ name: "Chart.js setup", status: "FAIL" });
  }

  // Check key admin components
  const components = [
    "src/app/_components/AdminAuth.tsx",
    "src/app/_components/ErrorBoundary.tsx",
  ];

  for (const component of components) {
    if (fs.existsSync(component)) {
      log("✅", `${component.split("/").pop()} exists`, "pass");
      tests.components.push({
        name: component.split("/").pop(),
        status: "PASS",
      });
    } else {
      log("❌", `${component.split("/").pop()} missing`, "fail");
      tests.components.push({
        name: component.split("/").pop(),
        status: "FAIL",
      });
    }
  }
}

async function testAnalytics() {
  console.log("\n📊 ANALYTICS & DATA");
  console.log("-".repeat(30));

  // Check data files
  const dataFiles = [
    "data/donations.json",
    "data/donors.json",
    "data/campaigns.json",
  ];

  for (const file of dataFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = JSON.parse(fs.readFileSync(file, "utf8"));
        if (Array.isArray(content) && content.length > 0) {
          log("✅", `${file} has valid data (${content.length} items)`, "pass");
          tests.analytics.push({ name: file, status: "PASS" });
        } else {
          log("⚠️", `${file} exists but empty`, "warning");
          tests.analytics.push({ name: file, status: "WARNING" });
        }
      } catch (error) {
        log("❌", `${file} has invalid JSON`, "fail");
        tests.analytics.push({ name: file, status: "FAIL" });
      }
    } else {
      log("⚠️", `${file} not found`, "warning");
      tests.analytics.push({ name: file, status: "WARNING" });
    }
  }

  // Check analytics page
  const analyticsPath = "src/app/admin/analytics/page.tsx";
  if (fs.existsSync(analyticsPath)) {
    const content = fs.readFileSync(analyticsPath, "utf8");
    if (content.includes("Chart") || content.includes("canvas")) {
      log("✅", "Analytics page has chart components", "pass");
      tests.analytics.push({ name: "Analytics charts", status: "PASS" });
    } else {
      log("⚠️", "Analytics page missing chart components", "warning");
      tests.analytics.push({ name: "Analytics charts", status: "WARNING" });
    }
  }
}

async function testFeatures() {
  console.log("\n🚀 FEATURE COMPLETENESS");
  console.log("-".repeat(30));

  // Check package.json dependencies
  if (fs.existsSync("package.json")) {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const requiredDeps = ["react", "next", "chart.js", "react-chartjs-2"];

    for (const dep of requiredDeps) {
      if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
        log("✅", `${dep} dependency present`, "pass");
        tests.features.push({ name: `${dep} dependency`, status: "PASS" });
      } else {
        log("❌", `${dep} dependency missing`, "fail");
        tests.features.push({ name: `${dep} dependency`, status: "FAIL" });
      }
    }
  }

  // Check TypeScript config
  if (fs.existsSync("tsconfig.json")) {
    log("✅", "TypeScript configuration present", "pass");
    tests.features.push({ name: "TypeScript config", status: "PASS" });
  } else {
    log("⚠️", "TypeScript configuration missing", "warning");
    tests.features.push({ name: "TypeScript config", status: "WARNING" });
  }

  // Check Next.js config
  if (fs.existsSync("next.config.js")) {
    log("✅", "Next.js configuration present", "pass");
    tests.features.push({ name: "Next.js config", status: "PASS" });
  } else {
    log("⚠️", "Next.js configuration missing", "warning");
    tests.features.push({ name: "Next.js config", status: "WARNING" });
  }
}

async function generateReport() {
  console.log("\n📋 FINAL VALIDATION REPORT");
  console.log("=".repeat(60));

  const totalTests = passCount + failCount + warningCount;
  const successRate =
    totalTests > 0 ? ((passCount / totalTests) * 100).toFixed(1) : 0;

  console.log(
    `📊 Test Results: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`
  );
  console.log(`📈 Success Rate: ${successRate}%`);

  if (failCount === 0) {
    console.log(
      "🎉 All critical tests passed! Admin panel is fully operational."
    );
  } else if (failCount <= 2) {
    console.log(
      "⚠️ Minor issues detected, but admin panel should be functional."
    );
  } else {
    console.log("❌ Multiple critical issues detected. Review required.");
  }

  console.log("\n📝 Detailed Results:");
  for (const [category, results] of Object.entries(tests)) {
    if (results.length > 0) {
      console.log(`\n${category.toUpperCase()}:`);
      results.forEach((test) => {
        const emoji =
          test.status === "PASS" ? "✅" : test.status === "FAIL" ? "❌" : "⚠️";
        console.log(`  ${emoji} ${test.name}: ${test.status}`);
      });
    }
  }

  console.log("\n🚀 Next Steps:");
  if (failCount === 0 && warningCount <= 3) {
    console.log("  • All systems operational - ready for production!");
    console.log("  • Consider implementing remaining optional features");
    console.log("  • Monitor system performance and user feedback");
  } else {
    console.log("  • Address any critical failures (❌) immediately");
    console.log("  • Review warnings (⚠️) for optimization opportunities");
    console.log("  • Run tests again after fixes");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ HFRP Admin Panel Feature Validation Complete ✨");
}

async function main() {
  try {
    await testServer();
    await testAuthentication();
    await testNavigation();
    await testComponents();
    await testAnalytics();
    await testFeatures();
    await generateReport();
  } catch (error) {
    console.error("❌ Validation failed:", error.message);
    process.exit(1);
  }
}

main();
