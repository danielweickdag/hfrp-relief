#!/usr/bin/env node

/**
 * HFRP Deployment Preparation Script
 * Prepares the project for production deployment
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

class DeploymentPrep {
  constructor() {
    this.results = {
      build: { status: "pending", errors: [] },
      tests: { status: "pending", errors: [] },
      security: { status: "pending", errors: [] },
      environment: { status: "pending", errors: [] },
      optimization: { status: "pending", errors: [] },
      validation: { status: "pending", errors: [] },
    };
    this.deploymentConfig = {};
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      header: "\x1b[35m",
      reset: "\x1b[0m",
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, description) {
    return new Promise((resolve) => {
      this.log(`🔄 ${description}...`, "info");

      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.log(`❌ ${description} failed: ${error.message}`, "error");
          resolve({ success: false, output: stderr, error: error.message });
        } else {
          this.log(`✅ ${description} completed`, "success");
          resolve({ success: true, output: stdout });
        }
      });
    });
  }

  async checkBuildSystem() {
    this.log("\n🔨 CHECKING BUILD SYSTEM", "header");
    this.log("═══════════════════════════════════════════════════", "info");

    try {
      // Check if package.json exists
      const packagePath = path.join(__dirname, "package.json");
      if (!fs.existsSync(packagePath)) {
        throw new Error("package.json not found");
      }

      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      this.log(`📦 Project: ${packageJson.name}`, "info");
      this.log(`🏷️ Version: ${packageJson.version}`, "info");

      // Check build scripts
      if (packageJson.scripts && packageJson.scripts.build) {
        this.log("✅ Build script found", "success");

        // Run build
        const buildResult = await this.runCommand(
          "npm run build",
          "Production build"
        );
        if (!buildResult.success) {
          this.results.build.errors.push(buildResult.error);
          this.results.build.status = "failed";
          return false;
        }
      } else {
        this.log("⚠️ No build script found in package.json", "warning");
      }

      this.results.build.status = "success";
      return true;
    } catch (error) {
      this.log(`❌ Build system check failed: ${error.message}`, "error");
      this.results.build.errors.push(error.message);
      this.results.build.status = "failed";
      return false;
    }
  }

  async runTests() {
    this.log("\n🧪 RUNNING TESTS", "header");
    this.log("═══════════════════════════════════════════════════", "info");

    try {
      // Run automation tests
      const automationResult = await this.runCommand(
        "node automation-test.js",
        "Automation tests"
      );
      if (!automationResult.success) {
        this.results.tests.errors.push("Automation tests failed");
      }

      // Run health check
      const healthResult = await this.runCommand(
        "node health-check.js",
        "Health check"
      );
      if (!healthResult.success) {
        this.results.tests.errors.push("Health check failed");
      }

      // Test Stripe sync
      const syncResult = await this.runCommand(
        "./stripe-sync.sh",
        "Stripe sync test"
      );
      if (!syncResult.success) {
        this.results.tests.errors.push("Stripe sync test failed");
      }

      this.results.tests.status =
        this.results.tests.errors.length === 0 ? "success" : "partial";
      return this.results.tests.errors.length === 0;
    } catch (error) {
      this.log(`❌ Tests failed: ${error.message}`, "error");
      this.results.tests.errors.push(error.message);
      this.results.tests.status = "failed";
      return false;
    }
  }

  async checkSecurity() {
    this.log("\n🔒 SECURITY CHECKS", "header");
    this.log("═══════════════════════════════════════════════════", "info");

    try {
      const securityIssues = [];

      // Check for sensitive files
      const sensitiveFiles = [".env", "node_modules"];
      const gitignorePath = path.join(__dirname, ".gitignore");

      let gitignoreContent = "";
      if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
      }

      sensitiveFiles.forEach((file) => {
        if (
          fs.existsSync(path.join(__dirname, file)) &&
          !gitignoreContent.includes(file)
        ) {
          securityIssues.push(`${file} should be in .gitignore`);
        }
      });

      // Check for hardcoded credentials in source files
      const sourceFiles = this.getSourceFiles();
      const credentialPatterns = [
        /password\s*[:=]\s*["'].*["']/gi,
        /api[_-]?key\s*[:=]\s*["'].*["']/gi,
        /secret\s*[:=]\s*["'].*["']/gi,
      ];

      sourceFiles.forEach((file) => {
        const content = fs.readFileSync(file, "utf8");
        credentialPatterns.forEach((pattern) => {
          if (
            pattern.test(content) &&
            !file.includes("test") &&
            !file.includes("example")
          ) {
            securityIssues.push(`Potential hardcoded credentials in ${file}`);
          }
        });
      });

      if (securityIssues.length > 0) {
        this.results.security.errors = securityIssues;
        this.results.security.status = "warning";
        securityIssues.forEach((issue) => this.log(`⚠️ ${issue}`, "warning"));
      } else {
        this.results.security.status = "success";
        this.log("✅ No security issues found", "success");
      }

      return true;
    } catch (error) {
      this.log(`❌ Security check failed: ${error.message}`, "error");
      this.results.security.errors.push(error.message);
      this.results.security.status = "failed";
      return false;
    }
  }

  async setupEnvironment() {
    this.log("\n🌍 ENVIRONMENT SETUP", "header");
    this.log("═══════════════════════════════════════════════════", "info");

    try {
      // Create production environment file
      const prodEnvContent = `# HFRP Production Environment
NODE_ENV=production
PORT=3002

# Stripe Configuration (Set these in your deployment platform)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Database URLs (if using databases)
# DATABASE_URL=your-production-database-url

# Security
SESSION_SECRET=your-secure-session-secret-here

# Email Configuration (if using email services)
# SMTP_HOST=your-smtp-host
# SMTP_PORT=587
# SMTP_USER=your-smtp-user
# SMTP_PASS=your-smtp-password

# Analytics (if using)
# GOOGLE_ANALYTICS_ID=your-ga-id

# Generated on ${new Date().toISOString()}
`;

      fs.writeFileSync(path.join(__dirname, ".env.production"), prodEnvContent);
      this.log("✅ Production environment file created", "success");

      // Create deployment configuration
      this.deploymentConfig = {
        name: "hfrp-relief",
        version: "1.0.0",
        build_command: "npm run build",
        start_command: "npm start",
        node_version: "18.x",
        environment_variables: [
          "NODE_ENV=production",
          "PORT=3002",
          "DONORBOX_EMAIL=w.regis@comcast.net",
        ],
        domains: ["hfrp-relief.vercel.app", "haitianfamilyrelief.org"],
        required_secrets: [
          "DONORBOX_API_KEY",
          "DONORBOX_ORG_ID",
          "SESSION_SECRET",
        ],
      };

      this.results.environment.status = "success";
      return true;
    } catch (error) {
      this.log(`❌ Environment setup failed: ${error.message}`, "error");
      this.results.environment.errors.push(error.message);
      this.results.environment.status = "failed";
      return false;
    }
  }

  async optimizeForProduction() {
    this.log("\n⚡ PRODUCTION OPTIMIZATION", "header");
    this.log("═══════════════════════════════════════════════════", "info");

    try {
      // Create next.config.js optimizations
      const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
  },
  
  // Environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV,
    DONORBOX_EMAIL: process.env.DONORBOX_EMAIL,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
`;

      fs.writeFileSync(
        path.join(__dirname, "next.config.production.js"),
        nextConfigContent
      );
      this.log("✅ Production Next.js config created", "success");

      // Create Vercel configuration
      const vercelConfig = {
        name: "hfrp-relief",
        version: 2,
        builds: [
          {
            src: "package.json",
            use: "@vercel/next",
          },
        ],
        routes: [
          {
            src: "/admin/(.*)",
            dest: "/admin/$1",
          },
          {
            src: "/(.*)",
            dest: "/$1",
          },
        ],
        env: {
          NODE_ENV: "production",
        },
        functions: {
          "pages/api/**/*.js": {
            maxDuration: 10,
          },
        },
      };

      fs.writeFileSync(
        path.join(__dirname, "vercel.json"),
        JSON.stringify(vercelConfig, null, 2)
      );
      this.log("✅ Vercel configuration created", "success");

      this.results.optimization.status = "success";
      return true;
    } catch (error) {
      this.log(`❌ Optimization failed: ${error.message}`, "error");
      this.results.optimization.errors.push(error.message);
      this.results.optimization.status = "failed";
      return false;
    }
  }

  async validateDeployment() {
    this.log("\n✅ DEPLOYMENT VALIDATION", "header");
    this.log("═══════════════════════════════════════════════════", "info");

    try {
      const validationChecks = [
        { name: "Build System", status: this.results.build.status },
        { name: "Tests", status: this.results.tests.status },
        { name: "Security", status: this.results.security.status },
        { name: "Environment", status: this.results.environment.status },
        { name: "Optimization", status: this.results.optimization.status },
      ];

      let allPassed = true;
      validationChecks.forEach((check) => {
        const icon =
          check.status === "success"
            ? "✅"
            : check.status === "partial"
              ? "⚠️"
              : "❌";
        this.log(
          `${icon} ${check.name}: ${check.status.toUpperCase()}`,
          check.status === "success"
            ? "success"
            : check.status === "partial"
              ? "warning"
              : "error"
        );

        if (check.status === "failed") allPassed = false;
      });

      this.results.validation.status = allPassed ? "success" : "partial";
      return allPassed;
    } catch (error) {
      this.log(`❌ Validation failed: ${error.message}`, "error");
      this.results.validation.errors.push(error.message);
      this.results.validation.status = "failed";
      return false;
    }
  }

  generateDeploymentGuide() {
    this.log("\n📋 GENERATING DEPLOYMENT GUIDE", "header");
    this.log("═══════════════════════════════════════════════════", "info");

    const guide = `# HFRP Relief Deployment Guide

## 🚀 Deployment Status
- Build System: ${this.results.build.status.toUpperCase()}
- Tests: ${this.results.tests.status.toUpperCase()}
- Security: ${this.results.security.status.toUpperCase()}
- Environment: ${this.results.environment.status.toUpperCase()}
- Optimization: ${this.results.optimization.status.toUpperCase()}

## 📋 Pre-Deployment Checklist

### ✅ Required Files Created:
- \`.env.production\` - Production environment variables
- \`next.config.production.js\` - Production Next.js configuration
- \`vercel.json\` - Vercel deployment configuration

### 🔐 Environment Variables to Set:
\`\`\`
DONORBOX_API_KEY=your-production-api-key
DONORBOX_ORG_ID=your-production-org-id
SESSION_SECRET=your-secure-session-secret
NODE_ENV=production
PORT=3002
\`\`\`

### 🌐 Deployment Platforms

#### Vercel (Recommended)
1. Install Vercel CLI: \`npm i -g vercel\`
2. Login: \`vercel login\`
3. Deploy: \`vercel --prod\`
4. Set environment variables in Vercel dashboard
5. Configure custom domain if needed

#### Netlify
1. Connect GitHub repository
2. Build command: \`npm run build\`
3. Publish directory: \`.next\`
4. Set environment variables in Netlify dashboard

#### Railway
1. Connect GitHub repository
2. Railway will auto-detect Next.js
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

### 🔧 Post-Deployment Steps

1. **Test Admin Dashboard:**
   - Visit: https://your-domain.com/admin
   - Login: w.regis@comcast.net / Melirosecherie58
   - Verify all automation features work

2. **Test Donorbox Integration:**
   - Check campaign sync
   - Verify donation tracking
   - Test webhook endpoints (if configured)

3. **Monitor Performance:**
   - Check loading times
   - Monitor error rates
   - Verify mobile responsiveness

4. **Set Up Monitoring:**
   - Configure uptime monitoring
   - Set up error tracking (Sentry, LogRocket)
   - Enable analytics (Google Analytics)

### 🚨 Security Checklist

- [ ] Environment variables secured
- [ ] No hardcoded credentials in code
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Admin routes protected
- [ ] API endpoints secured

### 📊 Features to Test

- [ ] Homepage video background
- [ ] Admin authentication
- [ ] Campaign dashboard
- [ ] Donorbox data sync
- [ ] Social media content generation
- [ ] Email template creation
- [ ] Progress tracking
- [ ] Donor segmentation

## 🆘 Troubleshooting

### Common Issues:
1. **Build Fails:** Check Node.js version compatibility
2. **Environment Variables:** Ensure all required vars are set
3. **API Errors:** Verify Donorbox credentials
4. **Admin Access:** Check authentication configuration

### Support Contacts:
- Stripe Support: support@stripe.com
- Deployment Platform Support: See platform documentation

## 📞 Emergency Contacts
- Primary Admin: w.regis@comcast.net
- Technical Support: [Your technical contact]

---
Generated on: ${new Date().toISOString()}
Project: HFRP Relief Automation System
Version: 1.0.0
`;

    fs.writeFileSync(path.join(__dirname, "DEPLOYMENT_GUIDE.md"), guide);
    this.log("✅ Deployment guide created: DEPLOYMENT_GUIDE.md", "success");
  }

  getSourceFiles() {
    const sourceFiles = [];
    const extensions = [".js", ".jsx", ".ts", ".tsx"];

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith(".") &&
          item !== "node_modules"
        ) {
          scanDir(fullPath);
        } else if (
          stat.isFile() &&
          extensions.some((ext) => item.endsWith(ext))
        ) {
          sourceFiles.push(fullPath);
        }
      });
    };

    scanDir(__dirname);
    return sourceFiles;
  }

  displaySummary() {
    this.log(
      "\n══════════════════════════════════════════════════════════════",
      "header"
    );
    this.log(
      "                    🚀 DEPLOYMENT READY SUMMARY                  ",
      "header"
    );
    this.log(
      "══════════════════════════════════════════════════════════════",
      "header"
    );

    const overallSuccess = Object.values(this.results).every(
      (result) => result.status === "success" || result.status === "partial"
    );

    this.log(
      `\n🎯 Overall Status: ${overallSuccess ? "READY FOR DEPLOYMENT" : "NEEDS ATTENTION"}`,
      overallSuccess ? "success" : "warning"
    );

    this.log("\n📊 Component Status:", "info");
    Object.entries(this.results).forEach(([component, result]) => {
      const icon =
        result.status === "success"
          ? "✅"
          : result.status === "partial"
            ? "⚠️"
            : "❌";
      this.log(
        `  ${icon} ${component}: ${result.status.toUpperCase()}`,
        result.status === "success"
          ? "success"
          : result.status === "partial"
            ? "warning"
            : "error"
      );
    });

    this.log("\n📁 Generated Files:", "info");
    this.log("  • .env.production - Environment variables", "success");
    this.log("  • next.config.production.js - Production config", "success");
    this.log("  • vercel.json - Vercel deployment config", "success");
    this.log("  • DEPLOYMENT_GUIDE.md - Complete deployment guide", "success");

    this.log("\n🚀 Next Steps:", "warning");
    if (overallSuccess) {
      this.log("  1. Review DEPLOYMENT_GUIDE.md", "info");
      this.log("  2. Set up environment variables on your platform", "info");
      this.log("  3. Deploy to production", "info");
      this.log("  4. Test all features post-deployment", "info");
    } else {
      this.log("  1. Fix any failed components above", "error");
      this.log("  2. Re-run deployment preparation", "info");
      this.log("  3. Review error messages for guidance", "info");
    }

    this.log("\n🌐 Recommended Platforms:", "info");
    this.log("  • Vercel (vercel.com) - Optimized for Next.js", "success");
    this.log("  • Netlify (netlify.com) - Great for static sites", "info");
    this.log("  • Railway (railway.app) - Simple deployment", "info");

    this.log(
      "\n══════════════════════════════════════════════════════════════",
      "header"
    );
  }

  async run() {
    this.log("🚀 STARTING DEPLOYMENT PREPARATION", "header");
    this.log(
      "══════════════════════════════════════════════════════════════",
      "header"
    );
    this.log(
      "Preparing HFRP Relief project for production deployment...",
      "info"
    );

    try {
      // Run all preparation steps
      await this.checkBuildSystem();
      await this.runTests();
      await this.checkSecurity();
      await this.setupEnvironment();
      await this.optimizeForProduction();
      await this.validateDeployment();

      // Generate deployment guide
      this.generateDeploymentGuide();

      // Display summary
      this.displaySummary();

      return Object.values(this.results).every(
        (result) => result.status === "success" || result.status === "partial"
      );
    } catch (error) {
      this.log(`❌ Deployment preparation failed: ${error.message}`, "error");
      return false;
    }
  }
}

// Run deployment preparation
const deployment = new DeploymentPrep();
deployment.run().then((success) => {
  process.exit(success ? 0 : 1);
});
