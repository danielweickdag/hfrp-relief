# 🚀 Vercel Setup Guide

This guide explains how to configure Vercel deployment for the HFRP Relief project, including obtaining and configuring the required GitHub Secrets for automated CI/CD deployment.

## 📋 Prerequisites

- A Vercel account (https://vercel.com)
- Access to the GitHub repository settings
- Admin access to the Vercel project

## 🔑 Required GitHub Secrets

The following secrets must be configured in your GitHub repository for automated deployment:

1. **VERCEL_TOKEN** - Your Vercel Access Token
2. **VERCEL_ORG_ID** - Your Vercel Organization ID (Team ID)
3. **VERCEL_PROJECT_ID** - Your Vercel Project ID

## 📝 Step-by-Step Setup

### Step 1: Obtain Your Vercel Access Token

1. Log in to your Vercel account at https://vercel.com
2. Navigate to **Settings** → **Tokens** (https://vercel.com/account/tokens)
3. Click **Create Token**
4. Enter a descriptive name (e.g., "GitHub Actions - HFRP Relief")
5. Select the appropriate scope:
   - **Full Account** - If you want access to all projects
   - **Limited to specific projects** - Select only the HFRP Relief project
6. Set expiration (optional, recommended for security)
7. Click **Create Token**
8. **Copy the token immediately** - You won't be able to see it again!

**Format**: `vercel_token_...` or similar

### Step 2: Find Your Vercel Organization ID

#### Method 1: Via Vercel Dashboard

1. Go to your Vercel dashboard (https://vercel.com/dashboard)
2. Select your team/organization from the dropdown (or use personal account)
3. Go to **Settings** → **General**
4. Find the **Team ID** or **User ID** section
5. Copy the ID (it looks like: `team_xxxxx` or `user_xxxxx`)

#### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# List your projects and find the org ID
vercel ls

# Or get it from project settings
vercel project ls
```

**Format**: `team_xxxxxxxxx` or similar alphanumeric string

### Step 3: Find Your Vercel Project ID

#### Method 1: Via Vercel Dashboard

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **General**
3. Find the **Project ID** section
4. Copy the Project ID

#### Method 2: Via Vercel CLI

```bash
# Navigate to your project directory
cd /path/to/hfrp-relief

# Link to Vercel project (if not already linked)
vercel link

# The project ID will be shown, or check .vercel/project.json
cat .vercel/project.json
```

#### Method 3: Via .vercel/project.json (if project is linked)

If you've previously linked the project with `vercel link`, check:

```bash
cat .vercel/project.json
```

The file will contain:
```json
{
  "projectId": "prj_xxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxx"
}
```

**Format**: `prj_xxxxxxxxx` or similar alphanumeric string

### Step 4: Configure GitHub Secrets

1. Go to your GitHub repository: https://github.com/danielweickdag/hfrp-relief
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the following secrets:

#### Add VERCEL_TOKEN
- **Name**: `VERCEL_TOKEN`
- **Value**: Your Vercel Access Token from Step 1
- Click **Add secret**

#### Add VERCEL_ORG_ID
- **Name**: `VERCEL_ORG_ID`
- **Value**: Your Vercel Organization ID from Step 2
- Click **Add secret**

#### Add VERCEL_PROJECT_ID
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: Your Vercel Project ID from Step 3
- Click **Add secret**

### Step 5: Verify Configuration

1. Go to **Actions** tab in your GitHub repository
2. Find the latest workflow run or trigger a new one by pushing to the `main` or `develop` branch
3. Check the deployment jobs (`deploy-staging` or `deploy-production`)
4. Verify that the Vercel deployment succeeds

## 🔍 Troubleshooting

### Error: "Invalid token"
- Ensure the token is copied correctly without extra spaces
- Verify the token hasn't expired
- Check that the token has the correct scope/permissions

### Error: "Project not found"
- Verify the `VERCEL_PROJECT_ID` matches your project
- Ensure the token has access to the specified project
- Check that you're using the correct organization ID

### Error: "Unauthorized"
- Verify the `VERCEL_ORG_ID` is correct
- Ensure the token has permission for the organization/team
- If using a personal account, use your user ID instead of team ID

### Deployment fails silently
- Check GitHub Actions logs for detailed error messages
- Verify all three secrets are set correctly
- Ensure your Vercel project exists and is properly configured

## 📚 Additional Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [amondnet/vercel-action Documentation](https://github.com/amondnet/vercel-action)

## 🔐 Security Best Practices

1. **Never commit tokens** to the repository
2. **Use separate tokens** for different environments if possible
3. **Set token expiration** to minimize security risks
4. **Rotate tokens regularly** (e.g., every 90 days)
5. **Use least privilege** - only grant necessary permissions
6. **Monitor token usage** in Vercel dashboard
7. **Revoke tokens immediately** if compromised

## 🎯 Quick Reference

```yaml
# GitHub Secrets Required:
VERCEL_TOKEN=vercel_token_xxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxx
```

## ✅ Verification Checklist

- [ ] Vercel Access Token created and copied
- [ ] Vercel Organization ID obtained
- [ ] Vercel Project ID obtained
- [ ] All three secrets added to GitHub repository
- [ ] Test deployment triggered and successful
- [ ] Production deployment works correctly
- [ ] Secrets documented internally (securely!)

## 🆘 Support

If you encounter issues:

1. Check the GitHub Actions logs for error messages
2. Review the Vercel deployment logs
3. Verify all secrets are set correctly
4. Consult the troubleshooting section above
5. Contact the repository maintainer for assistance

---

**Last Updated**: 2025-12-20
**Maintained by**: HFRP Relief Development Team
