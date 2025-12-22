# Vercel Environment Variables - Quick Reference

## What You Need

Three environment variables are required for Vercel deployments and CI/CD:

```bash
VERCEL_TOKEN=your_vercel_access_token_here
VERCEL_ORG_ID=your_vercel_organization_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here
```

## Where to Add Them

### 1. Local Development
Add to `.env.local`:
```bash
cp .env.local.example .env.local
# Edit .env.local and add your values
```

### 2. GitHub Actions (CI/CD)
Add as repository secrets:
1. Go to: https://github.com/danielweickdag/hfrp-relief/settings/secrets/actions
2. Add three secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### 3. Vercel Dashboard (Optional)
Usually not needed in Vercel runtime, but can be added if required:
1. Project Settings → Environment Variables
2. Add each variable for appropriate environments

## How to Get Values

### Quick Links
- **VERCEL_TOKEN**: https://vercel.com/account/tokens → Create new token
- **IDs**: Project Settings → General → Find Project ID and Team/Org ID

### Detailed Instructions
See `VERCEL_ENVIRONMENT_SETUP.md` for step-by-step instructions with screenshots.

## Verification

Test your configuration:
```bash
# Check if variables are set
env | grep VERCEL

# Test deployment (requires Vercel CLI)
vercel --token="$VERCEL_TOKEN"
```

## Troubleshooting

### Common Issues

**"Invalid token"**
- Create a new token at https://vercel.com/account/tokens
- Ensure full token is copied including any prefix

**"Project not found"**
- Double-check `VERCEL_PROJECT_ID` from project settings
- Ensure you're using the correct Vercel account

**GitHub Actions failing**
- Verify secrets are set in repository settings
- Check secret names match exactly: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Security Notes

- ⚠️ Never commit these values to version control
- ⚠️ These files are already in `.gitignore`: `.env.local`, `.env`
- ✅ Only add to: GitHub Secrets and local `.env.local`

## More Information

- Full setup guide: `VERCEL_ENVIRONMENT_SETUP.md`
- Deployment guide: `VERCEL_DEPLOYMENT.md`
- Automation guide: `AUTOMATION_README.md`

---

**Last Updated:** December 2025
