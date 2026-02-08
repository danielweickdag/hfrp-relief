# CI / Deployment Notes

This document explains the minimal environment configuration and recommended locations (Repository Secrets vs Repository Variables) required for CI and deploy workflows in this repository.

Required secrets (set these in Settings → Secrets → Actions):
- DEPLOYMENT_URL (optional) — URL used by some deploy automation scripts
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- AUTONOMA_CLIENT_ID
- AUTONOMA_SECRET_ID
- API_TOKEN (used by stripe-sync.yml)
- CLOUDFLARE_API_TOKEN (if using Cloudflare DNS update workflow)
- CLOUDFLARE_ZONE_ID
- VERCEL_TOKEN (if using CLI-based Vercel automation)

Repository variables (Settings → Variables) used by scheduled jobs:
- PRODUCTION_API_URL — used by stripe-sync.yml schedule job

Notes and recommendations
- Store sensitive keys in Secrets. Store non-sensitive environment configuration (e.g. PRODUCTION_API_URL) in Repository Variables when multiple workflows need it.
- The CI workflow now detects your package manager by lockfile. Supported lockfiles: `bun.lockb`, `bun.lock`, `pnpm-lock.yaml`, `package-lock.json`. Ensure your lockfile is committed.
- For Vercel deployments we now use `npm ci` and `npm run build` as default to avoid relying on Bun being preinstalled in Vercel.

Troubleshooting
- If builds fail with "command not found: bun", verify the lockfile present and the workflow logs for the detection step.
- If Vercel deploys to the wrong domain, update the `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL` environment variables in the Vercel dashboard.
