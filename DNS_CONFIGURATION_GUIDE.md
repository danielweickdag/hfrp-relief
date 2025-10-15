# 🌐 DNS Configuration Guide for familyreliefproject.org

## ✅ Current Status
- ✅ Domain in Cloudflare: `familyreliefproject.org` (Zone ID: `ea37d2b4562afd6d89157f88b37047de`)
- ✅ Domain added to Vercel: Ready for DNS configuration
- ❌ DNS Records: Need to be configured

## 🎯 Required DNS Configuration

Your domain `familyreliefproject.org` is currently using **Cloudflare nameservers** and needs these A records:

| Type | Name | Value | TTL | Proxy Status |
|------|------|-------|-----|--------------|
| A | @ (or familyreliefproject.org) | 76.76.21.21 | Auto | DNS only (gray cloud) |
| A | www | 76.76.21.21 | Auto | DNS only (gray cloud) |

## 🚀 Quick Setup Options

### Option 1: Manual Configuration (Recommended)

1. **Login to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com
   - Select the `familyreliefproject.org` domain

2. **Navigate to DNS Settings**
   - Click on "DNS" in the left sidebar
   - Go to "Records" section

3. **Add/Edit A Record for Root Domain**
   - **Type**: A
   - **Name**: @ (or familyreliefproject.org)
   - **IPv4 address**: 76.76.21.21
   - **TTL**: Auto
   - **Proxy status**: DNS only (gray cloud) ⚠️ **Important: Must be gray, not orange**

4. **Add/Edit A Record for WWW Subdomain**
   - **Type**: A
   - **Name**: www
   - **IPv4 address**: 76.76.21.21
   - **TTL**: Auto
   - **Proxy status**: DNS only (gray cloud) ⚠️ **Important: Must be gray, not orange**

### Option 2: Automatic Configuration (If API Token Works)

1. **Get New Cloudflare API Token**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create token with `Zone:DNS:Edit` permissions for `familyreliefproject.org`

2. **Run Automatic Setup**
   ```bash
   export CLOUDFLARE_API_TOKEN="your_new_token_here"
   ./auto-dns-setup.sh
   ```

## 🔍 Verification Commands

After configuring DNS, verify with these commands:

```bash
# Check DNS resolution
dig familyreliefproject.org A
dig www.familyreliefproject.org A

# Test website accessibility
curl -I https://familyreliefproject.org
curl -I https://www.familyreliefproject.org

# Check Vercel domain status
vercel domains inspect familyreliefproject.org
```

## ⏰ Timeline

- **DNS Configuration**: 2-5 minutes
- **DNS Propagation**: 1-5 minutes
- **SSL Certificate**: 5-15 minutes (automatic via Vercel)

## 🎯 Expected Results

Once configured, you should see:
- ✅ `familyreliefproject.org` resolves to `76.76.21.21`
- ✅ `www.familyreliefproject.org` resolves to `76.76.21.21`
- ✅ Website accessible at both URLs
- ✅ Automatic SSL certificate from Vercel

## 🚨 Important Notes

1. **Proxy Status**: Must be "DNS only" (gray cloud), not "Proxied" (orange cloud)
2. **Domain Mismatch**: Some config files reference `familyreliefproject7.org` but your Cloudflare domain is `familyreliefproject.org`
3. **SSL**: Will be automatically handled by Vercel once DNS is configured

## 🛠️ Troubleshooting

If you encounter issues:

1. **DNS not resolving**: Wait 5-30 minutes for propagation
2. **SSL errors**: Ensure proxy status is "DNS only" (gray cloud)
3. **404 errors**: Check Vercel domain configuration
4. **API token issues**: Create a new token with proper permissions

## 📞 Next Steps

1. Configure DNS records in Cloudflare (manual method recommended)
2. Wait for DNS propagation (1-5 minutes)
3. Verify website is accessible
4. Update any remaining config files to use correct domain

Your website will be live at:
- **Primary**: https://www.familyreliefproject.org
- **Apex**: https://familyreliefproject.org