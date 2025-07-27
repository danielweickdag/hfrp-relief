# 🚀 HFRP Production Setup Guide

This guide will help you set up your Haitian Family Relief Project website for live production use with real donations and email functionality.

## 📋 Prerequisites

Before going live, ensure you have:

1. **Donorbox Account** - Set up your campaigns
2. **Email Service Account** - Choose one: Resend (recommended), SendGrid, or SMTP
3. **Google Analytics Account** - For website tracking
4. **Domain Name** - Your website domain

---

## 🎯 Step 1: Donorbox Campaign Setup

### Create Your Donorbox Campaigns

1. **Log in to your Donorbox account**
2. **Create these campaigns:**
   - **Main Campaign**: For general donations
   - **Daily Giving Campaign**: For daily giving focus (16¢, 33¢, 50¢, 66¢)
   - **Membership Campaign**: For recurring monthly/yearly memberships

### Get Your Campaign IDs

For each campaign, copy the campaign ID from the URL:
- URL: `https://donorbox.org/your-campaign-name`
- Campaign ID: `your-campaign-name`

---

## 📧 Step 2: Email Service Setup (Choose One)

### Option A: Resend (Recommended - Easy Setup)

1. **Sign up at [resend.com](https://resend.com)**
2. **Verify your domain**
3. **Get your API key**
4. **Configure these environment variables:**
   ```env
   EMAIL_SERVICE=resend
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_TO_EMAIL=contact@haitianfamilyrelief.org
   ```

### Option B: SendGrid

1. **Sign up at [sendgrid.com](https://sendgrid.com)**
2. **Verify your domain**
3. **Create an API key**
4. **Configure these environment variables:**
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.your_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_TO_EMAIL=contact@haitianfamilyrelief.org
   ```

### Option C: Gmail/SMTP

1. **Enable 2-factor authentication on Gmail**
2. **Generate an app password**
3. **Configure these environment variables:**
   ```env
   EMAIL_SERVICE=nodemailer
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   SMTP_TO=contact@haitianfamilyrelief.org
   ```

---

## 🔧 Step 3: Environment Configuration

### Create Production Environment File

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your real values:**

```env
# ==============================================
# DONATION CONFIGURATION (DONORBOX)
# ==============================================

# IMPORTANT: Set to 'false' for live donations
NEXT_PUBLIC_DONATION_TEST_MODE=false

# Replace with your actual Donorbox campaign IDs
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=your-main-campaign-id
NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=your-membership-campaign-id
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=your-daily-giving-campaign-id

# ==============================================
# EMAIL CONFIGURATION
# ==============================================

# Choose your email service (resend, sendgrid, or nodemailer)
EMAIL_SERVICE=resend

# Configure based on your chosen service (see options above)
RESEND_API_KEY=your-real-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org

# ==============================================
# ANALYTICS & TRACKING
# ==============================================

# Replace with your real Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOURMEASUREMENTID

# ==============================================
# SECURITY & PRODUCTION
# ==============================================

# Generate a strong random string
NEXTAUTH_SECRET=your-very-long-random-string-here

# Your actual website URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Set to production
NODE_ENV=production
```

---

## 🧪 Step 4: Testing Before Going Live

### Test Donations (Safe Testing)

1. **Keep test mode enabled initially:**
   ```env
   NEXT_PUBLIC_DONATION_TEST_MODE=true
   ```

2. **Test all donation buttons:**
   - Homepage "Donate Now" button
   - Membership page
   - All daily giving amounts (16¢, 33¢, 50¢, 66¢)

3. **Verify test mode indicators appear**

### Test Email System

1. **Fill out the contact form**
2. **Check that you receive:**
   - Notification email to your organization
   - Auto-reply email to the sender

3. **Verify email formatting and content**

---

## 🚀 Step 5: Go Live!

### Enable Live Donations

1. **Update your environment:**
   ```env
   NEXT_PUBLIC_DONATION_TEST_MODE=false
   ```

2. **Restart your application**

3. **Verify the TEST badges are gone**

### Make a Test Donation

1. **Make a small real donation ($1-5)**
2. **Verify it processes correctly**
3. **Check your Donorbox dashboard**

---

## 📊 Step 6: Analytics Setup

### Google Analytics 4

1. **Create a GA4 property**
2. **Get your Measurement ID (G-XXXXXXXXXX)**
3. **Update your environment:**
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOURMEASUREMENTID
   ```

### Monitoring Events

The website automatically tracks:
- 🎯 Donation button clicks
- 📧 Contact form submissions
- 📱 Social media clicks
- 📊 Page views and engagement

---

## ⚠️ Important Security Notes

### Environment Variables

- **Never commit `.env.local` to version control**
- **Use strong, unique passwords**
- **Rotate API keys regularly**

### Testing

- **Always test in staging first**
- **Monitor error logs**
- **Set up alerts for failed donations**

---

## 🆘 Troubleshooting

### Common Issues

**Donations not working:**
- Check DONATION_TEST_MODE setting
- Verify campaign IDs are correct
- Check browser console for errors

**Emails not sending:**
- Verify API keys are correct
- Check email service quotas
- Ensure domain verification is complete

**Environment variables not loading:**
- Restart the application
- Check file name is `.env.local`
- Verify syntax (no spaces around =)

### Getting Help

1. **Check browser console for errors**
2. **Review server logs**
3. **Test with different browsers**
4. **Contact your email service support**

---

## ✅ Production Checklist

Before going live, ensure:

- [ ] Donorbox campaigns created and tested
- [ ] Email service configured and tested
- [ ] Test mode disabled (`NEXT_PUBLIC_DONATION_TEST_MODE=false`)
- [ ] All environment variables set correctly
- [ ] Google Analytics configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Contact form tested
- [ ] Real test donation completed
- [ ] Error monitoring set up

---

## 🔄 Maintenance

### Regular Tasks

- **Monitor donation metrics**
- **Check email delivery rates**
- **Update content regularly**
- **Review analytics data**
- **Test functionality monthly**

### Updates

- **Keep dependencies updated**
- **Monitor security advisories**
- **Backup configuration regularly**

---

## 📞 Support

For technical support:
- Check the troubleshooting section above
- Review your email service documentation
- Test with Donorbox's test environment first

**Remember: Always test thoroughly before going live with real donations!**
