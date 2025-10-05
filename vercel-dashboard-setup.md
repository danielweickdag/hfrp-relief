# 🎯 Vercel Dashboard Domain Setup

## Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Login with your account: danielweickdag
3. Find project: **hfrp-relief**
4. Click on the project name

## Step 2: Add Custom Domain
1. Click **Settings** tab
2. Click **Domains** in the sidebar
3. Click **Add** button
4. Enter: `familyreliefproject.org`
5. Click **Add**
6. Enter: `www.familyreliefproject.org`
7. Click **Add**

## Step 3: Verify Domain Configuration
Vercel will show you the DNS records needed. They should match:
- A Record: @ → 76.76.19.61
- CNAME Record: www → cname.vercel-dns.com

## Step 4: Update Environment Variables
In the same Settings area:
1. Click **Environment Variables**
2. Add or update:
   - `NEXT_PUBLIC_SITE_URL` = `https://www.familyreliefproject.org`
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_DONATION_TEST_MODE` = `false`

## Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Select **Use existing Build Cache**
4. Click **Redeploy**

