# 🔐 Vercel Environment Variables Setup Guide

This guide explains how to obtain and configure the required Vercel environment variables for the HFRP Relief project.

## Required Environment Variables

The following Vercel-specific environment variables are required for CI/CD pipelines and automated deployments:

- `VERCEL_TOKEN` - Your Vercel Access Token
- `VERCEL_ORG_ID` - Your Vercel Organization ID
- `VERCEL_PROJECT_ID` - Your Vercel Project ID

## How to Obtain These Values

### 1. VERCEL_TOKEN (Access Token)

**Steps to create a Vercel Access Token:**

1. Log in to your Vercel account at https://vercel.com
2. Go to **Account Settings** → **Tokens**
   - Direct link: https://vercel.com/account/tokens
3. Click **Create** button
4. Give your token a descriptive name (e.g., "HFRP Relief CI/CD")
5. Select the appropriate scope:
   - For CI/CD: Select "Full Account" or specific team
6. Set expiration (recommended: 1 year or No Expiration for production)
7. Click **Create Token**
8. **IMPORTANT**: Copy the token immediately - it won't be shown again!

**Token format:** Starts with `vercel_` or a long alphanumeric string

### 2. VERCEL_ORG_ID (Organization/Team ID)

**Steps to find your Organization ID:**

1. Log in to Vercel dashboard: https://vercel.com/dashboard
2. Navigate to your project: `hfrp-relief`
3. Click on **Settings** tab
4. Click on **General** in the left sidebar
5. Scroll down to the **Project ID** section
6. Look for **Team ID** or **Organization ID** field
   - If you're on a personal account, this may be your user ID

**Alternative method using Vercel CLI:**
```bash
vercel teams list
# Copy the ID of your organization/team
```

**ID format:** Usually starts with `team_` or `prj_` followed by random characters

### 3. VERCEL_PROJECT_ID (Project ID)

**Steps to find your Project ID:**

1. Log in to Vercel dashboard: https://vercel.com/dashboard
2. Select your project: `hfrp-relief`
3. Go to **Settings** → **General**
4. Find the **Project ID** field in the project information section
5. Copy the project ID

**Alternative method using Vercel CLI:**
```bash
# Navigate to your project directory
cd /path/to/hfrp-relief

# Link to Vercel (if not already linked)
vercel link

# Check the .vercel/project.json file
cat .vercel/project.json
# Look for "projectId" field
```

**ID format:** Usually starts with `prj_` followed by random characters

## Configuration Methods

### Method 1: Local Development (.env.local)

Create or update your `.env.local` file:

```bash
# Vercel Deployment Configuration
VERCEL_TOKEN=vercel_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
VERCEL_ORG_ID=team_aBcDeFgHiJkLmN1234567890
VERCEL_PROJECT_ID=prj_XyZaBcDeFgHiJkLmNoPqRsT1234567890
```

### Method 2: GitHub Secrets (for CI/CD)

1. Go to your GitHub repository: https://github.com/danielweickdag/hfrp-relief
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each variable:
   - Name: `VERCEL_TOKEN`, Value: Your token
   - Name: `VERCEL_ORG_ID`, Value: Your org ID
   - Name: `VERCEL_PROJECT_ID`, Value: Your project ID
4. Save each secret

### Method 3: Vercel Dashboard (Environment Variables)

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Key: `VERCEL_TOKEN`, Value: Your token (if needed in runtime)
   - Key: `VERCEL_ORG_ID`, Value: Your org ID
   - Key: `VERCEL_PROJECT_ID`, Value: Your project ID
4. Choose which environments: Production, Preview, Development

**Note:** These are typically only needed in GitHub Actions, not in Vercel runtime.

## Verification

### Test Your Configuration Locally

```bash
# Check if environment variables are set
node -e "console.log({
  VERCEL_TOKEN: process.env.VERCEL_TOKEN ? '✓ Set' : '✗ Missing',
  VERCEL_ORG_ID: process.env.VERCEL_ORG_ID ? '✓ Set' : '✗ Missing',
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID ? '✓ Set' : '✗ Missing'
})"
```

### Test Vercel CLI Access

```bash
# Authenticate with your token
vercel login

# List your projects (should include hfrp-relief)
vercel projects list

# Try deploying to preview
vercel --token="$VERCEL_TOKEN"
```

## Security Best Practices

### ✅ DO:
- Store tokens in environment variables or secure secret management systems
- Use separate tokens for different environments (dev, staging, prod)
- Set token expiration dates when possible
- Rotate tokens periodically (every 6-12 months)
- Use the minimum required scope for each token
- Add tokens to `.gitignore` via `.env.local` (already configured)

### ❌ DON'T:
- Never commit tokens to version control
- Don't share tokens in public channels (Slack, Discord, etc.)
- Don't use production tokens in development environments
- Don't reuse tokens across multiple projects
- Never expose tokens in client-side code or public logs

## Troubleshooting

### Error: "Invalid token"
- Token may have expired
- Token format is incorrect (should include full token string)
- Token scope doesn't include the required permissions
- Solution: Create a new token with proper permissions

### Error: "Project not found"
- `VERCEL_PROJECT_ID` is incorrect or from different account
- Project may have been deleted or renamed
- Solution: Re-fetch the project ID from Vercel dashboard

### Error: "Unauthorized" or "Access denied"
- `VERCEL_ORG_ID` doesn't match your team/organization
- Token doesn't have access to the specified organization
- Solution: Verify organization ID and token scope

### GitHub Actions failing
- Secrets not set in GitHub repository settings
- Secret names don't match workflow file references
- Solution: Double-check secret names match exactly (case-sensitive)

## Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Access Tokens Guide](https://vercel.com/docs/concepts/personal-accounts/overview#access-tokens)
- [GitHub Actions with Vercel](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)

## Support

If you encounter issues:
1. Check the [Vercel Status Page](https://www.vercel-status.com/)
2. Review the [Vercel Documentation](https://vercel.com/docs)
3. Contact Vercel Support through their dashboard
4. Check project repository issues: https://github.com/danielweickdag/hfrp-relief/issues

---

**Last Updated:** December 2025
