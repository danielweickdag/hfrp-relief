# Manual DNS Setup for familyreliefproject7.org

Since the API is having authentication issues, here's how to manually configure your DNS records:

## Step 1: Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Log in to your account
3. Click on `familyreliefproject7.org` domain

## Step 2: Configure DNS Records
Go to **DNS > Records** and add these A records:

### Record 1: Apex Domain
- **Type:** A
- **Name:** @ (or leave blank for root domain)
- **IPv4 address:** 76.76.21.21
- **TTL:** Auto (or 1 minute for faster testing)
- **Proxy status:** 🟠 Proxied (recommended) or ☁️ DNS only

### Record 2: WWW Subdomain
- **Type:** A
- **Name:** www
- **IPv4 address:** 76.76.21.21
- **TTL:** Auto (or 1 minute for faster testing)
- **Proxy status:** 🟠 Proxied (recommended) or ☁️ DNS only

## Step 3: Verify Configuration
After adding the records, you should see:
```
@ (familyreliefproject7.org) → 76.76.21.21
www (www.familyreliefproject7.org) → 76.76.21.21
```

## Step 4: Test DNS Propagation
Wait 5-10 minutes, then test:

### Using Command Line:
```bash
dig familyreliefproject7.org
dig www.familyreliefproject7.org
```

### Using Online Tools:
- https://dnschecker.org
- https://whatsmydns.net

## Step 5: Test Website Access
Once DNS propagates, test these URLs:
- https://familyreliefproject7.org
- https://www.familyreliefproject7.org

## Expected Timeline:
- **DNS Propagation:** 5-10 minutes
- **SSL Certificate:** 10-15 minutes after DNS
- **Full Accessibility:** 15-30 minutes total

## Troubleshooting:
If the website doesn't load:
1. Check DNS propagation with online tools
2. Verify Vercel domain configuration: `vercel domains ls`
3. Check SSL certificate status in Cloudflare
4. Try accessing via HTTP first: http://familyreliefproject7.org

## Alternative: Use familyreliefproject.org
If you prefer to use the existing `familyreliefproject.org` domain:
1. Update Vercel to use `familyreliefproject.org`
2. Configure the same DNS records for that domain
3. This domain is already active in Cloudflare

Let me know once you've configured the DNS records and I'll help verify the setup!