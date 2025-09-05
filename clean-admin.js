#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 Creating clean admin page...");

// Read the current admin page
const adminPagePath = path.join(__dirname, "src/app/admin/page.tsx");
const backupPath = path.join(__dirname, "src/app/admin/page.tsx.backup");

try {
  let content = fs.readFileSync(backupPath, "utf8");

  // Clean up any problematic characters and patterns
  content = content
    .replace(/[←→]/g, "") // Remove arrow characters
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n") // Normalize line endings
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
    .replace(/[\u2000-\u206F]/g, " ") // Replace unusual spaces with normal spaces
    .trim();

  // Ensure proper file ending
  if (!content.endsWith("\n")) {
    content += "\n";
  }

  // Write the cleaned content
  fs.writeFileSync(adminPagePath, content, "utf8");
  console.log("✅ Clean admin page created");

  // Also fix next.config.js
  const nextConfigPath = path.join(__dirname, "next.config.js");
  let nextConfig = fs.readFileSync(nextConfigPath, "utf8");

  // Remove the invalid generateMetadata configuration
  nextConfig = nextConfig.replace(
    /\s*\/\/ Fix metadata base warning[\s\S]*?},/g,
    ""
  );
  nextConfig = nextConfig.replace(/async generateMetadata\(\)[\s\S]*?},/g, "");

  fs.writeFileSync(nextConfigPath, nextConfig, "utf8");
  console.log("✅ next.config.js fixed");
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("🎉 All fixes applied!");
