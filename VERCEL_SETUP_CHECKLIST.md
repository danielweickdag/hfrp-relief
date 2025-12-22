# ✅ Vercel Setup Checklist

Use this checklist to configure Vercel deployment for HFRP Relief.

## Pre-Requisites
- [ ] Have admin access to GitHub repository
- [ ] Have access to Vercel account
- [ ] Have Vercel project created (hfrp-relief)

---

## Step 1: Obtain Vercel Access Token

- [ ] Log in to Vercel at https://vercel.com
- [ ] Go to Settings → Tokens: https://vercel.com/account/tokens
- [ ] Click "Create Token"
- [ ] Name it: "GitHub Actions - HFRP Relief"
- [ ] Set appropriate scope (Full Account or Limited to project)
- [ ] (Optional) Set expiration date
- [ ] Click "Create Token"
- [ ] **Copy the token immediately** (save it temporarily in a secure place)
- [ ] Token format should be: `vercel_token_...` or similar

**Token Obtained**: ⬜ Yes / ⬜ No

---

## Step 2: Find Vercel Organization ID

Choose one method:

### Method A: Via Vercel Dashboard
- [ ] Go to https://vercel.com/dashboard
- [ ] Select your team/organization from dropdown
- [ ] Go to Settings → General
- [ ] Find "Team ID" or "User ID" section
- [ ] Copy the ID (format: `team_xxxxx` or `user_xxxxx`)

### Method B: Via Vercel CLI
```bash
vercel login
vercel ls
# Organization ID will be displayed
```

### Method C: Via .vercel/project.json
```bash
cat .vercel/project.json
# Look for "orgId" field
```

**Organization ID Obtained**: ⬜ Yes / ⬜ No
**Organization ID Format**: `_____________________`

---

## Step 3: Find Vercel Project ID

Choose one method:

### Method A: Via Vercel Dashboard
- [ ] Go to your project: https://vercel.com/dashboard
- [ ] Click on "hfrp-relief" project
- [ ] Go to Settings → General
- [ ] Find "Project ID" section
- [ ] Copy the Project ID (format: `prj_xxxxx`)

### Method B: Via .vercel/project.json
```bash
cat .vercel/project.json
# Look for "projectId" field
```

**Project ID Obtained**: ⬜ Yes / ⬜ No
**Project ID Format**: `_____________________`

---

## Step 4: Configure GitHub Secrets

- [ ] Go to GitHub repository: https://github.com/danielweickdag/hfrp-relief
- [ ] Navigate to: Settings → Secrets and variables → Actions
- [ ] Click "New repository secret"

### Add VERCEL_TOKEN
- [ ] Click "New repository secret"
- [ ] Name: `VERCEL_TOKEN`
- [ ] Value: (paste your Vercel Access Token from Step 1)
- [ ] Click "Add secret"
- [ ] ✅ Secret added successfully

### Add VERCEL_ORG_ID
- [ ] Click "New repository secret"
- [ ] Name: `VERCEL_ORG_ID`
- [ ] Value: (paste your Vercel Organization ID from Step 2)
- [ ] Click "Add secret"
- [ ] ✅ Secret added successfully

### Add VERCEL_PROJECT_ID
- [ ] Click "New repository secret"
- [ ] Name: `VERCEL_PROJECT_ID`
- [ ] Value: (paste your Vercel Project ID from Step 3)
- [ ] Click "Add secret"
- [ ] ✅ Secret added successfully

**All Secrets Configured**: ⬜ Yes / ⬜ No

---

## Step 5: Verify Secret Configuration

- [ ] Go to: Settings → Secrets and variables → Actions
- [ ] Verify you see all three secrets listed:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`

---

## Step 6: Remove Old Secrets (If Applicable)

If you previously had these secrets with old names:
- [ ] Find `ORG_ID` secret (if exists)
- [ ] Delete `ORG_ID` secret (or keep as backup initially)
- [ ] Find `PROJECT_ID` secret (if exists)
- [ ] Delete `PROJECT_ID` secret (or keep as backup initially)

---

## Step 7: Test Staging Deployment

- [ ] Make a small change to the repository (or use existing changes)
- [ ] Push to `develop` branch:
  ```bash
  git checkout develop
  git pull origin develop
  git push origin develop
  ```
- [ ] Go to GitHub Actions tab
- [ ] Find the workflow run
- [ ] Wait for "Deploy to Staging" job to complete
- [ ] Check for errors in deployment step
- [ ] Verify deployment succeeded in Vercel dashboard

**Staging Deployment**: ⬜ Success / ⬜ Failed / ⬜ Not tested

If failed:
- [ ] Review error message in GitHub Actions logs
- [ ] Verify secrets are correct
- [ ] Check troubleshooting guide in VERCEL_SETUP_GUIDE.md

---

## Step 8: Test Production Deployment

⚠️ **Only proceed if staging deployment succeeded**

- [ ] Merge changes to `main` branch or push directly:
  ```bash
  git checkout main
  git pull origin main
  git push origin main
  ```
- [ ] Go to GitHub Actions tab
- [ ] Find the workflow run
- [ ] Wait for "Deploy to Production" job to complete
- [ ] Check for errors in deployment step
- [ ] Verify deployment succeeded in Vercel dashboard
- [ ] Visit production site to verify: https://www.familyreliefproject7.org

**Production Deployment**: ⬜ Success / ⬜ Failed / ⬜ Not tested

If failed:
- [ ] Review error message in GitHub Actions logs
- [ ] Verify secrets are correct
- [ ] Ensure Stripe live keys are configured (not test keys)
- [ ] Check troubleshooting guide in VERCEL_SETUP_GUIDE.md

---

## Step 9: Security Cleanup

- [ ] Clear browser cache/history if you copied tokens there
- [ ] Delete any temporary files with token information
- [ ] Ensure tokens are not in any local .env files
- [ ] Verify tokens are only in GitHub Secrets
- [ ] Document token creation date for rotation tracking
- [ ] Set calendar reminder for token rotation (recommended: every 90 days)

---

## Step 10: Documentation

- [ ] Update internal wiki/docs with secret configuration details
- [ ] Document who has access to these tokens
- [ ] Note the token creation date
- [ ] Set up monitoring for deployment failures
- [ ] Inform team members of new deployment process

---

## Final Verification

- [ ] All secrets configured in GitHub
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Website accessible at https://www.familyreliefproject7.org
- [ ] No tokens committed to repository
- [ ] Team members informed
- [ ] Documentation updated

---

## Troubleshooting

If you encounter issues, see:
- [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md) - Detailed troubleshooting
- [VERCEL_SECRETS_REFERENCE.md](VERCEL_SECRETS_REFERENCE.md) - Quick reference
- [VERCEL_CONFIGURATION_SUMMARY.md](VERCEL_CONFIGURATION_SUMMARY.md) - Implementation details

Common issues:
1. **Invalid token** - Token may have expired or been revoked
2. **Project not found** - Check PROJECT_ID is correct
3. **Unauthorized** - Check ORG_ID matches token's organization
4. **Build fails** - Check Stripe keys and other environment variables

---

## Status

**Started**: _______________
**Completed**: _______________
**Verified By**: _______________
**Notes**: 

_____________________________________________
_____________________________________________
_____________________________________________

---

## Quick Reference

```
VERCEL_TOKEN=vercel_token_...
VERCEL_ORG_ID=team_... or user_...
VERCEL_PROJECT_ID=prj_...
```

**GitHub Secrets URL**: https://github.com/danielweickdag/hfrp-relief/settings/secrets/actions
**Vercel Dashboard**: https://vercel.com/dashboard
**Vercel Tokens**: https://vercel.com/account/tokens

---

**✅ Setup Complete!**

Save this completed checklist for your records.
