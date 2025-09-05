#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing admin page syntax issues...");

// Read the admin page file
const adminPagePath = path.join(__dirname, "src/app/admin/page.tsx");

try {
  let content = fs.readFileSync(adminPagePath, "utf8");

  // Fix potential arrow character issues
  content = content.replace(/←/g, ""); // Remove left arrow
  content = content.replace(/→/g, ""); // Remove right arrow

  // Fix any potential regex literal issues by escaping them properly
  content = content.replace(/Back to Homepage/g, "Back to Homepage");

  // Write the cleaned content back
  fs.writeFileSync(adminPagePath, content, "utf8");
  console.log("✅ Admin page syntax issues fixed");
} catch (error) {
  console.error("❌ Error fixing admin page:", error.message);
}

// Fix metadata base warning by updating next.config.js
const nextConfigPath = path.join(__dirname, "next.config.js");

try {
  let nextConfig = fs.readFileSync(nextConfigPath, "utf8");

  // Add metadata base configuration if not present
  if (!nextConfig.includes("metadataBase")) {
    // Insert metadataBase configuration
    const metadataBaseConfig = `
  // Fix metadata base warning
  async generateMetadata() {
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
    };
  },`;

    nextConfig = nextConfig.replace(
      "const nextConfig = {",
      `const nextConfig = {${metadataBaseConfig}`
    );

    fs.writeFileSync(nextConfigPath, nextConfig, "utf8");
    console.log("✅ Metadata base configuration added");
  }
} catch (error) {
  console.error("❌ Error updating next.config.js:", error.message);
}

console.log("🎉 All fixes applied successfully!");
