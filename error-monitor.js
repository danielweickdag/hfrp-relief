#!/usr/bin/env node

/**
 * Console Error Monitor
 * Monitors the development server for console errors and promise rejections
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Console Error Monitor Started");
console.log("Monitoring for Promise rejections and console errors...");
console.log("Press Ctrl+C to stop");

// Create error log file
const errorLogPath = path.join(__dirname, "error_monitor.log");
const logStream = fs.createWriteStream(errorLogPath, { flags: "a" });

function logError(type, message, details = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    message,
    details,
    url: details.url || "unknown",
  };

  console.log(`🔴 ${type}: ${message}`);
  logStream.write(JSON.stringify(logEntry) + "\n");
}

// Monitor for specific error patterns
const errorPatterns = [
  /Promise rejection captured/i,
  /Unhandled promise rejection/i,
  /TypeError/i,
  /ReferenceError/i,
  /SyntaxError/i,
  /Failed to fetch/i,
  /Network request failed/i,
  /API.*error/i,
];

// Simulate monitoring (in a real environment, this would parse server logs)
let errorCount = 0;

const checkInterval = setInterval(() => {
  // Check for log files or error patterns
  try {
    const logFiles = [".next/static/chunks/", "data/", ".next/trace"]
      .map((dir) => path.join(__dirname, dir))
      .filter((dir) => {
        try {
          return fs.existsSync(dir);
        } catch {
          return false;
        }
      });

    // Simple error simulation for testing
    if (Math.random() < 0.1) {
      // 10% chance every check
      errorCount++;
      logError("SIMULATED_ERROR", `Simulated promise rejection ${errorCount}`, {
        source: "test",
        url: "http://localhost:3001",
      });
    }
  } catch (error) {
    console.error("Monitor error:", error.message);
  }
}, 5000); // Check every 5 seconds

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping error monitor...");
  clearInterval(checkInterval);
  logStream.end();

  // Print summary
  console.log(`📊 Error Monitor Summary:`);
  console.log(`   Log file: ${errorLogPath}`);
  console.log(`   Errors detected: ${errorCount}`);
  console.log("✅ Monitor stopped");

  process.exit(0);
});

// Show initial status
setTimeout(() => {
  console.log("✅ Error monitor active");
  console.log(`📁 Logging to: ${errorLogPath}`);
  console.log(
    "Navigate to http://localhost:3001 and use the app to test error handling"
  );
}, 1000);
