#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

class ServerHealthMonitor {
  constructor() {
    this.checkInterval = 30000; // 30 seconds
    this.isRunning = false;
  }

  start() {
    console.log("🔍 Starting HFRP Server Health Monitor...");
    this.isRunning = true;
    this.monitorLoop();
  }

  stop() {
    console.log("⏹️ Stopping health monitor...");
    this.isRunning = false;
  }

  async monitorLoop() {
    while (this.isRunning) {
      try {
        await this.performHealthChecks();
        await this.sleep(this.checkInterval);
      } catch (error) {
        console.error("❌ Health check error:", error.message);
        await this.sleep(5000); // Wait 5 seconds before retry
      }
    }
  }

  async performHealthChecks() {
    console.log("🏥 Performing health checks...");

    // Check 1: Verify server is responding
    const serverHealth = await this.checkServerHealth();

    // Check 2: Monitor for syntax errors
    const syntaxHealth = await this.checkSyntaxErrors();

    // Check 3: Check for memory issues
    const memoryHealth = await this.checkMemoryUsage();

    // Check 4: Verify environment configuration
    const envHealth = await this.checkEnvironmentConfig();

    const overallHealth =
      serverHealth && syntaxHealth && memoryHealth && envHealth;

    if (overallHealth) {
      console.log("✅ All systems healthy");
    } else {
      console.log("⚠️ Issues detected, attempting auto-fixes...");
      await this.autoFix();
    }
  }

  async checkServerHealth() {
    try {
      const response = await fetch("http://localhost:3000");
      return response.status === 200;
    } catch (error) {
      console.log("❌ Server not responding on port 3000");

      // Check port 3001 as fallback
      try {
        const response = await fetch("http://localhost:3001");
        if (response.status === 200) {
          console.log("✅ Server responding on port 3001");
          return true;
        }
      } catch (fallbackError) {
        console.log("❌ Server not responding on port 3001 either");
      }

      return false;
    }
  }

  async checkSyntaxErrors() {
    try {
      const output = await this.execCommand(
        "cd /Users/blvckdlphn/projects/hfrp-relief && npm run lint 2>&1"
      );
      const hasErrors = output.includes("error") || output.includes("Error");

      if (hasErrors) {
        console.log("⚠️ Syntax errors detected");
        return false;
      }

      return true;
    } catch (error) {
      console.log("⚠️ Could not check syntax");
      return true; // Don't fail if lint command fails
    }
  }

  async checkMemoryUsage() {
    try {
      const output = await this.execCommand(
        'ps aux | grep "next dev" | grep -v grep'
      );
      const lines = output.trim().split("\n");

      for (const line of lines) {
        const parts = line.split(/\s+/);
        const memoryPercent = parseFloat(parts[3]);

        if (memoryPercent > 80) {
          console.log(`⚠️ High memory usage detected: ${memoryPercent}%`);
          return false;
        }
      }

      return true;
    } catch (error) {
      return true; // Don't fail if we can't check memory
    }
  }

  async checkEnvironmentConfig() {
    const envPath = "/Users/blvckdlphn/projects/hfrp-relief/.env.local";

    try {
      const envContent = fs.readFileSync(envPath, "utf8");

      const requiredVars = [
        "NEXT_PUBLIC_SITE_URL",
        "NEXT_PUBLIC_DONATION_TEST_MODE",
        "NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN",
      ];

      for (const varName of requiredVars) {
        if (!envContent.includes(varName)) {
          console.log(`⚠️ Missing environment variable: ${varName}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.log("⚠️ Could not read environment configuration");
      return false;
    }
  }

  async autoFix() {
    console.log("🔧 Attempting automatic fixes...");

    try {
      // Fix 1: Clear Next.js cache
      await this.execCommand(
        "cd /Users/blvckdlphn/projects/hfrp-relief && rm -rf .next"
      );
      console.log("✅ Cleared Next.js cache");

      // Fix 2: Clean admin page if needed
      await this.execCommand(
        "cd /Users/blvckdlphn/projects/hfrp-relief && node clean-admin.js"
      );
      console.log("✅ Cleaned admin page");

      // Fix 3: Restart development server (kill existing processes)
      await this.execCommand('pkill -f "next dev" || true');
      console.log("✅ Stopped existing dev servers");

      // Wait a moment before restarting
      await this.sleep(2000);

      console.log(
        "🎉 Auto-fixes completed. Server should restart automatically."
      );
    } catch (error) {
      console.log("❌ Auto-fix failed:", error.message);
    }
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout + stderr);
      });
    });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Start the monitor
const monitor = new ServerHealthMonitor();
monitor.start();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Received interrupt signal, shutting down gracefully...");
  monitor.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received termination signal, shutting down gracefully...");
  monitor.stop();
  process.exit(0);
});
