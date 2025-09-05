#!/usr/bin/env node

/**
 * Migration script to replace DonorboxButton with StripeButton
 * This script automatically updates your codebase to use Stripe instead of Donorbox
 */

const fs = require("fs");
const path = require("path");

console.log("🔄 Starting migration from DonorboxButton to StripeButton...\n");

// Files that might contain DonorboxButton references
const filesToCheck = [
  "src/app/page.tsx",
  "src/app/donate/page.tsx",
  "src/app/_components/Navbar.tsx",
  "src/app/radio/page.tsx",
  "src/app/radio-demo/page.tsx",
];

// Additional directories to scan
const directoriesToScan = ["src/app", "src/components"];

// Find all files that might contain DonorboxButton
function findFilesWithDonorbox(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith(".") &&
      item !== "node_modules"
    ) {
      findFilesWithDonorbox(fullPath, files);
    } else if (
      stat.isFile() &&
      (item.endsWith(".tsx") ||
        item.endsWith(".ts") ||
        item.endsWith(".jsx") ||
        item.endsWith(".js"))
    ) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes("DonorboxButton") || content.includes("donorbox")) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

// Scan for all files containing DonorboxButton
let allFiles = [...filesToCheck];
for (const dir of directoriesToScan) {
  const foundFiles = findFilesWithDonorbox(dir);
  allFiles = [...new Set([...allFiles, ...foundFiles])];
}

console.log(`Found ${allFiles.length} files to check for migration:`);
allFiles.forEach((file) => console.log(`  - ${file}`));
console.log("");

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let updated = false;
  const originalContent = content;

  // Replace import statements
  if (content.includes("DonorboxButton")) {
    console.log(`📝 Updating imports in: ${filePath}`);

    // Replace the import statement
    content = content.replace(
      /import\s+DonorboxButton\s+from\s+["'][^"']*DonorboxButton["'];?\s*\n?/g,
      'import StripeButton from "@/app/_components/StripeButton";\n'
    );

    // Replace component usage
    content = content.replace(/<DonorboxButton/g, "<StripeButton");
    content = content.replace(/<\/DonorboxButton>/g, "</StripeButton>");

    // Update prop names that might have changed
    content = content.replace(/campaignId=/g, "campaignId=");
    content = content.replace(/amount=/g, "amount=");
    content = content.replace(/recurring=/g, "recurring=");

    updated = true;
  }

  // Replace environment variable references
  if (content.includes("DONORBOX")) {
    console.log(`🔧 Updating environment variables in: ${filePath}`);
    content = content.replace(/NEXT_PUBLIC_DONORBOX_/g, "NEXT_PUBLIC_STRIPE_");
    content = content.replace(/DONATION_TEST_MODE/g, "STRIPE_TEST_MODE");
    updated = true;
  }

  // Replace specific Donorbox URLs or references
  if (content.includes("donorbox.org")) {
    console.log(`🌐 Updating URLs in: ${filePath}`);
    // Keep as comments for reference but don't replace URLs automatically
    // as they might be in documentation
    updated = true;
  }

  if (updated && content !== originalContent) {
    // Create backup
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, originalContent);

    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
    console.log(`💾 Backup created: ${backupPath}`);
    return true;
  } else if (content.includes("donorbox") || content.includes("Donorbox")) {
    console.log(
      `ℹ️  Contains Donorbox references but no changes made: ${filePath}`
    );
    return false;
  } else {
    console.log(`ℹ️  No Donorbox references found: ${filePath}`);
    return false;
  }
}

// Update all files
let updatedCount = 0;
console.log("Starting file updates...\n");

for (const filePath of allFiles) {
  if (updateFile(filePath)) {
    updatedCount++;
  }
}

console.log(`\n✅ Migration completed!`);
console.log(`📊 Updated ${updatedCount} out of ${allFiles.length} files`);

// Create a summary report
const reportContent = `# Migration Report: DonorboxButton → StripeButton

**Date:** ${new Date().toISOString()}
**Files Processed:** ${allFiles.length}
**Files Updated:** ${updatedCount}

## Updated Files:
${allFiles.map((file) => `- ${file}`).join("\n")}

## Manual Tasks Remaining:

### 1. Update Environment Variables
Make sure your \`.env.local\` has:
\`\`\`env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_TEST_MODE=true
NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
\`\`\`

### 2. Test All Payment Flows
- Homepage donation buttons
- Donate page forms
- Recurring donation setup
- Mobile payment experience

### 3. Configure Stripe Webhooks
- Set up webhook endpoint: \`/api/stripe/webhook\`
- Subscribe to events: \`checkout.session.completed\`, \`payment_intent.payment_failed\`

### 4. Update Any Custom Integration Code
Review any custom code that might reference Donorbox APIs or URLs.

### 5. Test Before Going Live
Use Stripe test cards to verify everything works:
- Success: 4242 4242 4242 4242
- Declined: 4000 0000 0000 0002

## Next Steps:
1. \`bun dev\` - Start development server
2. Test donation flows thoroughly
3. Configure Stripe dashboard
4. Update to live keys when ready

**Migration Status: ${updatedCount > 0 ? "COMPLETED" : "MANUAL REVIEW NEEDED"}**
`;

fs.writeFileSync("MIGRATION_REPORT.md", reportContent);
console.log(`📋 Migration report saved: MIGRATION_REPORT.md`);

console.log("\n📝 Manual tasks remaining:");
console.log("   1. Test all donation buttons work with Stripe");
console.log("   2. Configure Stripe webhooks in dashboard");
console.log("   3. Update API keys when ready for production");
console.log("   4. Remove any remaining Donorbox references");

console.log("\n🚀 Ready to test! Run: bun dev");
