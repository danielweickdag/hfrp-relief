# 🚀 Website Management Guide
## Haitian Family Relief Project - Complete Operations Manual

---

## 📊 **MONITORING YOUR WEBSITE**

### 1. **Health Monitoring**
```bash
# Run comprehensive health check
node monitoring-setup.js

# Check specific API status
curl -s "https://www.familyreliefproject7.org/api/health" | jq .

# Monitor uptime and performance
curl -w "@curl-format.txt" -o /dev/null -s "https://www.familyreliefproject7.org"
```

### 2. **Real-time Monitoring Tools**
- **Health API**: https://www.familyreliefproject7.org/api/health
- **Status Page**: https://www.familyreliefproject7.org/api/status
- **Vercel Dashboard**: https://vercel.com/danielweickdags-projects/hfrp-relief

### 3. **Key Metrics to Watch**
- ✅ Health Score (aim for 100%)
- ⚡ Load Time (keep under 200ms)
- 🔒 SSL Certificate Status
- 💳 Payment Processing Success Rate
- 📧 Email Delivery Status

---

## 🔄 **UPDATING EXISTING FEATURES**

### 1. **Content Updates**
```bash
# Edit page content
# Files located in: src/app/[page-name]/page.tsx

# Update homepage
nano src/app/page.tsx

# Update about page
nano src/app/about/page.tsx

# Update donation page
nano src/app/donate/page.tsx
```

### 2. **Configuration Updates**
```bash
# Update environment variables locally
nano .env

# Update Vercel environment variables
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME
vercel env ls
```

### 3. **Styling Updates**
```bash
# Global styles
nano src/app/globals.css

# Component styles (using Tailwind CSS)
# Edit component files directly in src/components/
```

---

## ➕ **ADDING NEW FEATURES**

### 1. **New Pages**
```bash
# Create new page directory
mkdir src/app/new-page-name

# Create page component
cat > src/app/new-page-name/page.tsx << 'EOF'
export default function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">New Page Title</h1>
      <p>Your content here...</p>
    </div>
  );
}
EOF
```

### 2. **New API Endpoints**
```bash
# Create API route
mkdir -p src/app/api/new-endpoint

# Create route handler
cat > src/app/api/new-endpoint/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from new endpoint!' });
}

export async function POST(request: Request) {
  const data = await request.json();
  // Process data here
  return NextResponse.json({ success: true, data });
}
EOF
```

### 3. **New Components**
```bash
# Create reusable component
cat > src/components/NewComponent.tsx << 'EOF'
interface NewComponentProps {
  title: string;
  content: string;
}

export default function NewComponent({ title, content }: NewComponentProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p>{content}</p>
    </div>
  );
}
EOF
```

---

## 🚀 **DEPLOYMENT PROCESS**

### 1. **Quick Deployment**
```bash
# Deploy to production (recommended)
vercel --prod

# Deploy to preview (for testing)
vercel

# Deploy specific branch
vercel --prod --target production
```

### 2. **Pre-deployment Checklist**
- [ ] Test changes locally: `npm run dev`
- [ ] Run health check: `node monitoring-setup.js`
- [ ] Check environment variables: `vercel env ls`
- [ ] Verify SSL certificates are valid
- [ ] Test payment processing (if modified)
- [ ] Test email functionality (if modified)

### 3. **Post-deployment Verification**
```bash
# Verify deployment
curl -s "https://www.familyreliefproject7.org/api/health" | jq .

# Check specific functionality
curl -X POST "https://www.familyreliefproject7.org/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'

# Run full monitoring suite
node monitoring-setup.js
```

---

## 🛠️ **COMMON TASKS**

### 1. **Update Donation Goals**
```bash
# Edit donation component
nano src/app/donate/page.tsx

# Look for goal amounts and update as needed
# Deploy changes
vercel --prod
```

### 2. **Add New Gallery Images**
```bash
# Add images to public/gallery/
cp new-image.jpg public/gallery/

# Update gallery data (if using data file)
nano data/gallery.json

# Deploy
vercel --prod
```

### 3. **Update Contact Information**
```bash
# Update contact details
nano src/app/contact/page.tsx

# Update environment variables if needed
vercel env add CONTACT_EMAIL your-new-email@domain.com

# Deploy
vercel --prod
```

### 4. **Add Blog Posts**
```bash
# Create new blog post
mkdir src/app/blog/new-post-slug

# Create blog post content
cat > src/app/blog/new-post-slug/page.tsx << 'EOF'
export default function BlogPost() {
  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Your Blog Post Title</h1>
      <div className="prose lg:prose-xl">
        <p>Your blog content here...</p>
      </div>
    </article>
  );
}
EOF

# Deploy
vercel --prod
```

---

## 🔧 **TROUBLESHOOTING**

### 1. **Common Issues**
```bash
# If deployment fails
vercel logs

# If health check fails
node monitoring-setup.js

# If emails not sending
curl "https://www.familyreliefproject7.org/api/status" | jq .services.email

# If payments not working
curl "https://www.familyreliefproject7.org/api/status" | jq .services.stripe
```

### 2. **Environment Variable Issues**
```bash
# Check current variables
vercel env ls

# Pull latest variables
vercel env pull .env.current

# Compare with local
diff .env .env.current
```

### 3. **Performance Issues**
```bash
# Check load times
curl -w "@curl-format.txt" -o /dev/null -s "https://www.familyreliefproject7.org"

# Run performance audit
node monitoring-setup.js
```

---

## 📋 **MAINTENANCE SCHEDULE**

### Daily
- [ ] Check health score (should be 100%)
- [ ] Monitor donation processing
- [ ] Review email delivery logs

### Weekly
- [ ] Run full monitoring suite
- [ ] Check SSL certificate status
- [ ] Review performance metrics
- [ ] Backup data files

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Review and rotate API keys if needed
- [ ] Check domain renewal status
- [ ] Review analytics and optimize

---

## 🆘 **EMERGENCY CONTACTS & RESOURCES**

### Quick Commands
```bash
# Emergency health check
node monitoring-setup.js

# Emergency deployment rollback
vercel rollback

# Check all services status
curl "https://www.familyreliefproject7.org/api/health" | jq .
```

### Important URLs
- **Live Site**: https://www.familyreliefproject7.org
- **Vercel Dashboard**: https://vercel.com/danielweickdags-projects/hfrp-relief
- **Health Check**: https://www.familyreliefproject7.org/api/health
- **Admin Panel**: https://www.familyreliefproject7.org/admin

### Support Resources
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs

---

## 🎯 **QUICK REFERENCE**

| Task | Command |
|------|---------|
| Deploy to production | `vercel --prod` |
| Check health | `node monitoring-setup.js` |
| View logs | `vercel logs` |
| Add environment variable | `vercel env add VAR_NAME` |
| Test locally | `npm run dev` |
| Check API status | `curl https://www.familyreliefproject7.org/api/health` |

---

*Last updated: $(date)*
*Website Status: 🟢 LIVE & OPERATIONAL*