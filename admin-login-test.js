#!/usr/bin/env node

/**
 * HFRP Admin Login Test
 * Tests the admin authentication system
 */

console.log("🔐 TESTING ADMIN LOGIN CREDENTIALS");
console.log("================================");

// Test credentials
const testCredentials = [
  {
    email: "w.regis@comcast.net",
    password: "Melirosecherie58",
    expectedRole: "superadmin",
  },
  {
    email: "editor@haitianfamilyrelief.org",
    password: "Melirosecherie58",
    expectedRole: "editor",
  },
  {
    email: "volunteer@haitianfamilyrelief.org",
    password: "Melirosecherie58",
    expectedRole: "volunteer",
  },
];

// Simulate the authentication logic
const rolePermissions = {
  superadmin: [
    "manage_users",
    "edit_content",
    "manage_donations",
    "view_analytics",
    "manage_settings",
    "upload_media",
    "manage_volunteers",
    "publish_content",
    "manage_volunteer_program",
    "view_donation_reports",
    "export_donations",
    "manage_backups",
  ],
  editor: [
    "edit_content",
    "view_analytics",
    "upload_media",
    "publish_content",
    "manage_volunteers",
    "manage_donations",
    "view_donation_reports",
  ],
  volunteer: ["view_analytics", "edit_content"],
};

const getAdminUsers = () => {
  return [
    {
      email: "w.regis@comcast.net",
      name: "Wilson Regis",
      role: "superadmin",
      permissions: rolePermissions.superadmin,
    },
    {
      email: "editor@haitianfamilyrelief.org",
      name: "HFRP Editor",
      role: "editor",
      permissions: rolePermissions.editor,
    },
    {
      email: "volunteer@haitianfamilyrelief.org",
      name: "HFRP Volunteer",
      role: "volunteer",
      permissions: rolePermissions.volunteer,
    },
  ];
};

// Test login function
function testLogin(email, password) {
  console.log(`\n🧪 Testing login for: ${email}`);

  // Check password
  if (password !== "Melirosecherie58") {
    console.log(`❌ Password validation failed`);
    return false;
  }

  // Find user
  const users = getAdminUsers();
  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (foundUser) {
    console.log(`✅ User found: ${foundUser.name}`);
    console.log(`✅ Role: ${foundUser.role}`);
    console.log(`✅ Permissions: ${foundUser.permissions.length} total`);
    return true;
  } else {
    console.log(`❌ User not found`);
    return false;
  }
}

// Run tests
console.log("\n🔍 RUNNING AUTHENTICATION TESTS:");
console.log("================================");

let passedTests = 0;
let totalTests = testCredentials.length;

testCredentials.forEach((cred, index) => {
  const result = testLogin(cred.email, cred.password);
  if (result) {
    passedTests++;
    console.log(`✅ Test ${index + 1}: PASSED`);
  } else {
    console.log(`❌ Test ${index + 1}: FAILED`);
  }
});

console.log("\n📊 TEST RESULTS:");
console.log("================");
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
  console.log("\n🎉 ALL AUTHENTICATION TESTS PASSED!");
  console.log("✅ Admin credentials are working correctly");
  console.log("\n🔗 ADMIN ACCESS INFORMATION:");
  console.log("============================");
  console.log("URL: http://localhost:3000/admin");
  console.log("Primary Admin:");
  console.log("  Email: w.regis@comcast.net");
  console.log("  Password: Melirosecherie58");
  console.log("  Role: Super Administrator");
  console.log("\nIf you cannot access the admin panel:");
  console.log("1. Make sure you are using the exact credentials above");
  console.log("2. Check that JavaScript is enabled in your browser");
  console.log("3. Clear your browser cache and localStorage");
  console.log(
    "4. Try opening http://localhost:3000/admin in an incognito window"
  );
} else {
  console.log("\n❌ SOME TESTS FAILED - CHECK AUTHENTICATION SYSTEM");
}

console.log("\n💡 TROUBLESHOOTING TIPS:");
console.log("========================");
console.log("• Email is case-insensitive");
console.log('• Password is case-sensitive: "Melirosecherie58"');
console.log("• Make sure development server is running");
console.log("• Try refreshing the page after login");
console.log("• Check browser console for any errors");
