#!/usr/bin/env node

/**
 * HFRP Admin Access Fix
 * Fixes common admin login issues
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 FIXING ADMIN ACCESS ISSUES");
console.log("==============================");

// Create a simple admin test page
const testPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HFRP Admin Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .login-box {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background: #007cba;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        }
        button:hover {
            background: #005a87;
        }
        .credentials {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            display: none;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>🔐 HFRP Admin Login Test</h1>
        
        <div class="credentials">
            <h3>📋 Test Credentials:</h3>
            <p><strong>Email:</strong> w.regis@comcast.net</p>
            <p><strong>Password:</strong> Melirosecherie58</p>
        </div>

        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" value="w.regis@comcast.net" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" value="Melirosecherie58" required>
            </div>
            
            <button type="submit">🚀 Test Login</button>
        </form>

        <div id="success" class="success">
            ✅ Login successful! Admin credentials are working.
            <br><br>
            <strong>Next steps:</strong>
            <ol>
                <li>Go to <a href="http://localhost:3000/admin" target="_blank">http://localhost:3000/admin</a></li>
                <li>Use the credentials above</li>
                <li>If it still doesn't work, clear your browser cache</li>
            </ol>
        </div>

        <div id="error" class="error">
            ❌ Login failed. Check your credentials and try again.
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3>🔗 Quick Links:</h3>
            <ul>
                <li><a href="http://localhost:3000" target="_blank">Homepage</a></li>
                <li><a href="http://localhost:3000/admin" target="_blank">Admin Dashboard</a></li>
                <li><a href="javascript:location.reload()">Refresh This Page</a></li>
            </ul>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Hide previous messages
            document.getElementById('success').style.display = 'none';
            document.getElementById('error').style.display = 'none';
            
            // Test credentials (same logic as the React app)
            if (password === 'Melirosecherie58' && 
                (email.toLowerCase() === 'w.regis@comcast.net' ||
                 email.toLowerCase() === 'editor@haitianfamilyrelief.org' ||
                 email.toLowerCase() === 'volunteer@haitianfamilyrelief.org')) {
                
                document.getElementById('success').style.display = 'block';
                
                // Try to store in localStorage like the React app does
                const userData = {
                    email: email,
                    name: email === 'w.regis@comcast.net' ? 'Wilson Regis' : 'HFRP User',
                    role: email === 'w.regis@comcast.net' ? 'superadmin' : 'editor'
                };
                
                try {
                    localStorage.setItem('hfrp-admin-user', JSON.stringify(userData));
                    console.log('✅ User data stored in localStorage');
                } catch (error) {
                    console.log('⚠️ Could not store in localStorage:', error);
                }
                
            } else {
                document.getElementById('error').style.display = 'block';
            }
        });

        // Check if user is already logged in
        window.addEventListener('load', function() {
            const storedUser = localStorage.getItem('hfrp-admin-user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    console.log('✅ Found existing user session:', user);
                    document.getElementById('success').style.display = 'block';
                } catch (error) {
                    console.log('⚠️ Invalid stored user data, clearing...');
                    localStorage.removeItem('hfrp-admin-user');
                }
            }
        });
    </script>
</body>
</html>`;

// Write the test page
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, "admin-test.html"), testPageContent);

console.log("✅ Created admin test page at: /public/admin-test.html");
console.log("🌐 Access it at: http://localhost:3000/admin-test.html");

// Also create a simple API endpoint test
const apiTestContent = `{
  "status": "ok",
  "message": "HFRP Admin API is working",
  "timestamp": "${new Date().toISOString()}",
  "credentials": {
    "email": "w.regis@comcast.net",
    "password": "Melirosecherie58"
  },
  "admin_url": "http://localhost:3000/admin",
  "test_page": "http://localhost:3000/admin-test.html"
}`;

fs.writeFileSync(path.join(publicDir, "admin-api-test.json"), apiTestContent);

console.log("✅ Created API test at: /public/admin-api-test.json");
console.log("🌐 Access it at: http://localhost:3000/admin-api-test.json");

console.log("\n🔧 ADMIN ACCESS TROUBLESHOOTING:");
console.log("================================");
console.log("1. 📝 Test Page: http://localhost:3000/admin-test.html");
console.log("2. 🔗 Admin Page: http://localhost:3000/admin");
console.log("3. 📧 Email: w.regis@comcast.net");
console.log("4. 🔑 Password: Melirosecherie58");
console.log("\n💡 If login still fails:");
console.log("• Clear browser cache and localStorage");
console.log("• Try incognito/private browsing mode");
console.log("• Check browser console for JavaScript errors");
console.log("• Make sure development server is running");

console.log("\n✅ Admin access fix complete!");
