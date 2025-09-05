# 🌐 Domain Configuration Template

## Your Domain Information

**Domain**: ********\_******** (e.g., haitianfamilyrelief.org)
**DNS Provider**: ****\_\_\_\_**** (e.g., GoDaddy, Namecheap, Cloudflare)
**Preferred Setup**: [ ] Root domain [ ] www subdomain

## Quick Setup Checklist

### 1. Deploy to Vercel First

- [ ] Run `./deploy-production.sh` or `vercel --prod`
- [ ] Note your Vercel URL: ********\_********.vercel.app

### 2. Domain Connection

- [ ] Add domain in Vercel Dashboard → Settings → Domains
- [ ] Configure DNS records with your provider
- [ ] Wait for DNS propagation (up to 24 hours)

### 3. Update Environment Variables

- [ ] Update `NEXT_PUBLIC_SITE_URL` to your domain
- [ ] Redeploy after environment updates

### 4. Stripe Webhook Setup

- [ ] Use final domain URL: `https://your-domain.com/api/stripe/webhook`
- [ ] Test webhook delivery

## Common Domain Providers - DNS Setup

### GoDaddy:

1. Login to GoDaddy → My Products → DNS
2. Add A record: `@` → `76.76.19.61`
3. Add CNAME record: `www` → `cname.vercel-dns.com`

### Namecheap:

1. Login → Domain List → Manage
2. Advanced DNS → Add New Record
3. A record: `@` → `76.76.19.61`
4. CNAME record: `www` → `cname.vercel-dns.com`

### Cloudflare:

1. Login → Select Domain → DNS → Records
2. Add A record: `@` → `76.76.19.61`
3. Add CNAME record: `www` → `cname.vercel-dns.com`

## After Domain Connection

### Update these files with your actual domain:

1. **Environment Variables** in Vercel Dashboard
2. **Stripe Webhook URL** in Stripe Dashboard
3. **Email templates** (if using custom domain for email)

### Test URLs:

- Main site: `https://your-domain.com`
- Stripe test: `https://your-domain.com/stripe-live-test`
- Webhook test: `https://your-domain.com/webhook-test`

---

**Fill in the blanks above and follow the checklist for smooth deployment! 🚀**
