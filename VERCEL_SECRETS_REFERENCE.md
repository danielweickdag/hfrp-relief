# Vercel GitHub Secrets - Quick Reference

This file provides a quick reference for configuring the required Vercel secrets in GitHub.

## 🎯 Required GitHub Secrets

Configure these in: `Settings > Secrets and variables > Actions`

| Secret Name | Description | Format | Example |
|------------|-------------|--------|---------|
| `VERCEL_TOKEN` | Vercel Access Token | `vercel_token_...` | Your personal/team access token |
| `VERCEL_ORG_ID` | Vercel Organization/Team ID | `team_...` or `user_...` | Identifies your Vercel organization |
| `VERCEL_PROJECT_ID` | Vercel Project ID | `prj_...` | Identifies the specific project |

## 📍 Where to Find These Values

### VERCEL_TOKEN
- Go to: https://vercel.com/account/tokens
- Click "Create Token"
- Copy the generated token

### VERCEL_ORG_ID
- Go to: https://vercel.com/dashboard
- Settings → General → Team ID (or User ID for personal)
- Or check `.vercel/project.json` if project is linked locally

### VERCEL_PROJECT_ID
- Go to your project in Vercel
- Settings → General → Project ID
- Or check `.vercel/project.json` if project is linked locally

## 🔗 Quick Links

- **Full Setup Guide**: [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Secrets**: https://github.com/danielweickdag/hfrp-relief/settings/secrets/actions
- **Vercel Tokens**: https://vercel.com/account/tokens

## ✅ Verification

After adding secrets, test the deployment:

```bash
# Push to develop branch to test staging deployment
git push origin develop

# Push to main branch to test production deployment
git push origin main
```

Then check:
- GitHub Actions tab for workflow status
- Vercel dashboard for deployment status

## 🚨 Security Reminders

- ✅ Never commit tokens to the repository
- ✅ Use GitHub Secrets for all sensitive values
- ✅ Rotate tokens periodically
- ✅ Set token expiration if possible
- ✅ Use least privilege access

## 📚 Additional Documentation

- [GitHub Actions Workflow](.github/workflows/main.yml)
- [Environment Variables](.env.example)
- [Main README](README.md)

---

**Need Help?** See the comprehensive [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md) for detailed instructions.
