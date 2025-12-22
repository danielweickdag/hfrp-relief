# HFRP Relief - Haitian Family Relief Project

This is a comprehensive website for the Haitian Family Relief Project, featuring:

- **Public Website**: Donation pages, program information, blog, and contact forms
- **Admin Panel**: Content management, donation tracking, volunteer management
- **PWA Features**: Progressive web app capabilities for mobile users
- **Responsive Design**: Optimized for all devices

## 🚀 Quick Deploy to familyreliefproject.org

### Option 1: Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danielweickdag/hfrp-relief)

**For CI/CD Setup**: See [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md) for configuring GitHub Actions automated deployment.

### Option 2: Step-by-Step Setup

1. **Review Setup Guide**: Read `DOMAIN_CONNECTION_GUIDE.md` for complete instructions
2. **Configure Environment**: Use `.env.production.template` for your hosting platform
3. **Deploy**: Follow `DEPLOYMENT_CHECKLIST_familyreliefproject.md`
4. **CI/CD Setup**: Configure Vercel tokens using `VERCEL_SETUP_GUIDE.md`

### Quick Commands

```bash
# Setup domain configuration files
./setup-domain.sh

# Build for production
npm run build

# Deploy to Vercel
npm run deploy:vercel
```

## 🌐 Live Domain Configuration

**Target Domain**: https://www.familyreliefproject.org

**Required Setup:**

- Domain DNS configuration
- Email service (Resend recommended)
- Environment variables for production
- SSL certificate (auto-generated)

**See**: `DOMAIN_CONNECTION_GUIDE.md` for complete setup instructions

## Features

- ✅ Multi-role admin authentication system
- ✅ Blog management with rich text editor
- ✅ Donation tracking and analytics
- ✅ Volunteer management system
- ✅ Contact forms with email integration
- ✅ Mobile-responsive design
- ✅ SEO optimized
- ✅ Progressive Web App features
- ✅ Automated social media posting
- ✅ Campaign milestone tracking
- ✅ Email automation templates

## Admin Access

Default admin credentials:

- **Super Admin**: w.regis@comcast.net
- **Editor**: editor@haitianfamilyrelief.org
- **Volunteer**: volunteer@haitianfamilyrelief.org
- **Password**: Melirosecherie58

**⚠️ Important: Change the default password after first login in production!**

## 📋 Production Checklist

Before going live at familyreliefproject.org:

- [ ] Domain DNS configured
- [ ] Email service setup (Resend)
- [ ] Environment variables configured
- [ ] Real Donorbox campaign IDs added
- [ ] Test mode disabled
- [ ] Small test donation completed
- [ ] Contact form email tested
- [ ] Admin credentials updated

## 📞 Support

For support with this project:

- **Vercel CI/CD Setup**: See [VERCEL_SETUP_GUIDE.md](VERCEL_SETUP_GUIDE.md)
- **Domain Setup**: See `DOMAIN_CONNECTION_GUIDE.md`
- **Deployment Issues**: Check `DEPLOYMENT_CHECKLIST_familyreliefproject.md`
- **Technical Support**: Contact the development team
- **Documentation**: Refer to the `/docs` folder

## 🛠️ Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build

# Run tests
npm run lint
```

---

**🎯 Target Launch**: https://www.familyreliefproject.org**
**Built with Next.js 15, TypeScript, and Tailwind CSS**
