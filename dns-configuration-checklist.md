# DNS Configuration Checklist for familyreliefproject7.org

## ✅ Pre-Configuration Checklist

- [ ] Domain `familyreliefproject7.org` is registered
- [ ] Domain is added to Cloudflare account
- [ ] Cloudflare nameservers are set at domain registrar
- [ ] Vercel project is deployed and accessible
- [ ] Cloudflare API token has DNS edit permissions

## 🔧 DNS Records Configuration

### Required A Records
- [ ] **Root Domain (@)**
  - Type: `A`
  - Name: `@` (or leave blank)
  - Value: `76.76.21.21`
  - TTL: `300` (5 minutes)
  - Proxy: `🟠 Proxied` (Orange cloud enabled)

- [ ] **WWW Subdomain**
  - Type: `A`
  - Name: `www`
  - Value: `76.76.21.21`
  - TTL: `300` (5 minutes)
  - Proxy: `🟠 Proxied` (Orange cloud enabled)

### Optional Records (Recommended)
- [ ] **CNAME for www (Alternative)**
  - Type: `CNAME`
  - Name: `www`
  - Value: `familyreliefproject7.org`
  - TTL: `300`
  - Proxy: `🟠 Proxied`

## 🌐 Cloudflare Dashboard Steps

### Step 1: Access DNS Management
1. [ ] Log into Cloudflare dashboard
2. [ ] Select `familyreliefproject7.org` domain
3. [ ] Navigate to **DNS** > **Records**

### Step 2: Add Root Domain Record
1. [ ] Click **Add record**
2. [ ] Select Type: **A**
3. [ ] Name: `@` (or leave blank for root)
4. [ ] IPv4 address: `76.76.21.21`
5. [ ] Proxy status: **Proxied** (🟠 orange cloud)
6. [ ] TTL: **Auto** or **300**
7. [ ] Click **Save**

### Step 3: Add WWW Subdomain Record
1. [ ] Click **Add record**
2. [ ] Select Type: **A**
3. [ ] Name: `www`
4. [ ] IPv4 address: `76.76.21.21`
5. [ ] Proxy status: **Proxied** (🟠 orange cloud)
6. [ ] TTL: **Auto** or **300**
7. [ ] Click **Save**

## ⚙️ Cloudflare Settings Configuration

### SSL/TLS Settings
- [ ] Navigate to **SSL/TLS** > **Overview**
- [ ] Set encryption mode to **Full (strict)**
- [ ] Enable **Always Use HTTPS**
- [ ] Navigate to **SSL/TLS** > **Edge Certificates**
- [ ] Enable **Always Use HTTPS**
- [ ] Enable **HTTP Strict Transport Security (HSTS)**

### Security Settings
- [ ] Navigate to **Security** > **Settings**
- [ ] Set Security Level to **Medium**
- [ ] Enable **Browser Integrity Check**
- [ ] Navigate to **Security** > **WAF**
- [ ] Ensure WAF is **Enabled**

### Performance Settings
- [ ] Navigate to **Speed** > **Optimization**
- [ ] Enable **Auto Minify** for CSS, JavaScript, HTML
- [ ] Enable **Brotli** compression
- [ ] Navigate to **Caching** > **Configuration**
- [ ] Set Caching Level to **Standard**

## 🔍 Verification Steps

### DNS Propagation Check
- [ ] Run: `dig familyreliefproject7.org`
- [ ] Run: `dig www.familyreliefproject7.org`
- [ ] Verify both return `76.76.21.21`

### Online DNS Tools
- [ ] Check https://dnschecker.org
- [ ] Enter `familyreliefproject7.org`
- [ ] Verify A record shows `76.76.21.21` globally
- [ ] Check `www.familyreliefproject7.org`

### Website Accessibility
- [ ] Visit `https://familyreliefproject7.org`
- [ ] Visit `https://www.familyreliefproject7.org`
- [ ] Verify both URLs load the website
- [ ] Check SSL certificate is valid (green lock icon)

### Performance Testing
- [ ] Test page load speed
- [ ] Verify Cloudflare is active (check response headers)
- [ ] Test from multiple locations

## 🚨 Troubleshooting Checklist

### If DNS Not Resolving
- [ ] Check nameservers at domain registrar
- [ ] Verify Cloudflare nameservers are correct
- [ ] Wait for propagation (up to 48 hours)
- [ ] Clear local DNS cache: `sudo dscacheutil -flushcache`

### If Website Not Loading
- [ ] Verify Vercel deployment is active
- [ ] Check Vercel domain configuration
- [ ] Verify A record points to correct IP
- [ ] Check Cloudflare proxy status

### If SSL Issues
- [ ] Verify SSL/TLS mode is **Full (strict)**
- [ ] Check certificate status in Cloudflare
- [ ] Wait for certificate provisioning (up to 24 hours)
- [ ] Clear browser cache

## 📊 Monitoring Setup

### Cloudflare Analytics
- [ ] Navigate to **Analytics & Logs** > **Web Analytics**
- [ ] Enable **Web Analytics**
- [ ] Set up custom dashboards

### Uptime Monitoring
- [ ] Set up external monitoring (UptimeRobot, Pingdom)
- [ ] Monitor both `familyreliefproject7.org` and `www.familyreliefproject7.org`
- [ ] Configure alerts for downtime

## ✅ Final Verification Commands

```bash
# DNS Resolution Test
dig familyreliefproject7.org
dig www.familyreliefproject7.org

# HTTP Response Test
curl -I https://familyreliefproject7.org
curl -I https://www.familyreliefproject7.org

# SSL Certificate Test
openssl s_client -connect familyreliefproject7.org:443 -servername familyreliefproject7.org

# Trace Route Test
traceroute familyreliefproject7.org
```

## 🎯 Success Criteria

- [ ] ✅ DNS resolves to `76.76.21.21` for both `@` and `www`
- [ ] ✅ Website loads on both URLs
- [ ] ✅ SSL certificate is valid and trusted
- [ ] ✅ Cloudflare proxy is active
- [ ] ✅ Page load time < 3 seconds
- [ ] ✅ No security warnings in browser
- [ ] ✅ Mobile and desktop compatibility confirmed

## 📝 Configuration Summary

Once completed, your DNS configuration will be:

```
familyreliefproject7.org     A    76.76.21.21  (Proxied)
www.familyreliefproject7.org A    76.76.21.21  (Proxied)
```

**Estimated Propagation Time:** 5-30 minutes  
**Full Global Propagation:** Up to 48 hours  
**SSL Certificate Issuance:** 5-15 minutes  

---

**Note:** Keep this checklist handy and mark items as completed. If you encounter issues, refer to the troubleshooting section or run the verification scripts provided in the project.