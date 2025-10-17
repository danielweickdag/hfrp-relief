# DNS Design Guide for familyreliefproject7.org

## 🎯 Objective
Connect `familyreliefproject7.org` to your Vercel-hosted Family Relief Project website with optimal performance, security, and reliability.

## 🏗️ DNS Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DNS Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Request                                               │
│       ↓                                                     │
│  Domain Registrar                                           │
│       ↓ (Nameservers)                                       │
│  Cloudflare DNS                                             │
│       ↓ (A Records)                                         │
│  Vercel Edge Network                                        │
│       ↓                                                     │
│  Your Website                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Required DNS Records

### Primary Records (Essential)

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | @ | 76.76.21.21 | 300 | Root domain (familyreliefproject7.org) |
| A | www | 76.76.21.21 | 300 | WWW subdomain (www.familyreliefproject7.org) |

### Optional Records (Recommended)

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| CNAME | mail | familyreliefproject7.org | 3600 | Email services |
| TXT | @ | "v=spf1 include:_spf.google.com ~all" | 3600 | Email security (SPF) |
| MX | @ | 10 mx.google.com | 3600 | Email routing |

## 🔧 Step-by-Step Configuration

### Step 1: Domain Registrar Setup
1. **Login to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Find DNS/Nameserver settings** for `familyreliefproject7.org`
3. **Update nameservers** to Cloudflare's:
   ```
   Primary: [Cloudflare will provide]
   Secondary: [Cloudflare will provide]
   ```

### Step 2: Cloudflare DNS Configuration
1. **Access Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Select domain**: `familyreliefproject7.org`
3. **Navigate to**: DNS > Records
4. **Add the following records**:

#### Record 1: Root Domain
```
Type: A
Name: @
IPv4 address: 76.76.21.21
TTL: 5 minutes (300 seconds)
Proxy status: 🟠 Proxied (Recommended)
```

#### Record 2: WWW Subdomain
```
Type: A
Name: www
IPv4 address: 76.76.21.21
TTL: 5 minutes (300 seconds)
Proxy status: 🟠 Proxied (Recommended)
```

### Step 3: Vercel Domain Verification
1. **Access Vercel Dashboard**: https://vercel.com/dashboard
2. **Go to your project**: Family Relief Project
3. **Navigate to**: Settings > Domains
4. **Verify domains are listed**:
   - `familyreliefproject7.org`
   - `www.familyreliefproject7.org`

## ⚙️ Advanced Configuration Options

### SSL/TLS Settings (Cloudflare)
```
SSL/TLS Mode: Full (Strict)
Edge Certificates: Universal SSL (Auto)
Always Use HTTPS: On
Minimum TLS Version: 1.2
```

### Performance Optimization
```
Caching Level: Standard
Browser Cache TTL: 4 hours
Development Mode: Off (for production)
```

### Security Settings
```
Security Level: Medium
Challenge Passage: 30 minutes
Browser Integrity Check: On
```

## 🔍 DNS Propagation Timeline

| Phase | Duration | Status Check |
|-------|----------|--------------|
| Nameserver Update | 2-4 hours | `dig NS familyreliefproject7.org` |
| DNS Record Propagation | 5-10 minutes | `dig A familyreliefproject7.org` |
| SSL Certificate Generation | 10-15 minutes | `curl -I https://familyreliefproject7.org` |
| Global Propagation | 24-48 hours | https://dnschecker.org |

## 🛠️ Verification Commands

### Check DNS Resolution
```bash
# Check root domain
dig familyreliefproject7.org A

# Check www subdomain
dig www.familyreliefproject7.org A

# Check nameservers
dig familyreliefproject7.org NS

# Check from multiple locations
nslookup familyreliefproject7.org 8.8.8.8
```

### Test Website Accessibility
```bash
# Test HTTP response
curl -I https://familyreliefproject7.org

# Test redirect (www to non-www or vice versa)
curl -I https://www.familyreliefproject7.org

# Test with verbose output
curl -v https://familyreliefproject7.org
```

## 🚨 Troubleshooting Common Issues

### Issue 1: DNS Not Resolving
**Symptoms**: `dig` returns no results
**Solutions**:
- Verify nameservers are updated at registrar
- Check DNS records in Cloudflare dashboard
- Wait for propagation (up to 48 hours)

### Issue 2: SSL Certificate Errors
**Symptoms**: "Not Secure" or certificate warnings
**Solutions**:
- Ensure Cloudflare SSL mode is "Full (Strict)"
- Wait for certificate generation (10-15 minutes)
- Check Vercel SSL settings

### Issue 3: Website Not Loading
**Symptoms**: DNS resolves but website doesn't load
**Solutions**:
- Verify Vercel domain configuration
- Check Vercel deployment status
- Ensure correct IP address (76.76.21.21)

### Issue 4: Slow Propagation
**Symptoms**: Some locations resolve, others don't
**Solutions**:
- Use lower TTL values (300 seconds)
- Clear local DNS cache: `sudo dscacheutil -flushcache`
- Test from multiple locations

## 📊 Monitoring and Maintenance

### Regular Checks
- **Weekly**: Verify website accessibility
- **Monthly**: Check SSL certificate expiration
- **Quarterly**: Review DNS performance metrics

### Monitoring Tools
- **Uptime**: https://uptimerobot.com
- **DNS**: https://dnschecker.org
- **SSL**: https://www.ssllabs.com/ssltest/
- **Performance**: https://gtmetrix.com

## 🔄 Automated Verification Script

Use the provided verification script:
```bash
./verify-domain.sh
```

This script checks:
- DNS resolution for both domains
- HTTP/HTTPS accessibility
- SSL certificate status
- Vercel configuration

## 📞 Support Resources

### Cloudflare Support
- Documentation: https://developers.cloudflare.com
- Community: https://community.cloudflare.com
- Support: https://support.cloudflare.com

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: https://vercel.com/support

### DNS Tools
- DNS Checker: https://dnschecker.org
- What's My DNS: https://whatsmydns.net
- DNS Lookup: https://mxtoolbox.com

## 🎯 Success Criteria

Your DNS setup is successful when:
- ✅ `familyreliefproject7.org` resolves to `76.76.21.21`
- ✅ `www.familyreliefproject7.org` resolves to `76.76.21.21`
- ✅ Both URLs load your website over HTTPS
- ✅ SSL certificate is valid and trusted
- ✅ Website loads in under 3 seconds globally

## 📝 Configuration Checklist

- [ ] Domain added to Cloudflare account
- [ ] Nameservers updated at registrar
- [ ] A record for @ pointing to 76.76.21.21
- [ ] A record for www pointing to 76.76.21.21
- [ ] Domain verified in Vercel
- [ ] SSL/TLS set to Full (Strict)
- [ ] DNS propagation verified
- [ ] Website accessible via HTTPS
- [ ] SSL certificate valid

---

**Next Steps**: Follow the manual configuration steps or use the automated setup script `./setup-familyreliefproject7.sh`