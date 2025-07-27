# 📧 Email Integration Setup Guide - Resend

## 🎯 Overview

This guide will help you set up live email functionality for your HFRP website contact form using Resend (recommended email service).

---

## 🌟 Why Resend?

✅ **Easy setup** - Quick API integration
✅ **Reliable delivery** - High deliverability rates
✅ **Affordable** - Generous free tier (3,000 emails/month)
✅ **Developer-friendly** - Clean API and good documentation
✅ **Professional** - Built by the Vercel team

---

## 🔐 Step 1: Create Resend Account

1. **Visit Resend**: Go to https://resend.com
2. **Sign up for free**: Click "Get Started" or "Sign Up"
3. **Verify your email**: Check your inbox and confirm
4. **Complete onboarding**: Follow the setup wizard

---

## 🏷️ Step 2: Verify Your Domain

### Option A: Use Your Own Domain (Recommended)
1. **Go to Domains** in Resend dashboard
2. **Click "Add Domain"**
3. **Enter your domain**: `haitianfamilyrelief.org` (or your domain)
4. **Follow DNS setup instructions**:
   - Add the provided DNS records to your domain
   - Wait for verification (can take up to 48 hours)

### Option B: Use Resend Subdomain (Quick Start)
- You can start immediately with `@resend.dev` addresses
- Upgrade to custom domain later for better branding

---

## 🔑 Step 3: Get Your API Key

1. **Navigate to API Keys** in Resend dashboard
2. **Click "Create API Key"**
3. **Name it**: `HFRP Website Contact Form`
4. **Copy the API key**: Starts with `re_`
5. **Store securely**: You won't see it again!

---

## ⚙️ Step 4: Configure Environment Variables

1. **Open your `.env.local` file**
2. **Add these variables**:

```env
# Email service configuration
EMAIL_SERVICE=resend

# Resend API configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org
```

### Email Address Setup:
- **FROM email**: Use your verified domain (e.g., `noreply@haitianfamilyrelief.org`)
- **TO email**: Where you want to receive contact form submissions

---

## 🧪 Step 5: Test Email Integration

### Test the Contact Form:
1. **Go to contact page**: http://localhost:3000/contact
2. **Fill out the form** with test information
3. **Submit the form**
4. **Check your email** for the notification
5. **Check the "from" email** for the auto-reply

### Expected Behavior:
```
✅ Form submission succeeds
✅ You receive notification email with form details
✅ User receives professional auto-reply email
✅ No console errors
✅ Success message displays on form
```

---

## 📧 Email Templates Used

### Notification Email (to you):
```
Subject: New Contact Form Submission - HFRP Website

Dear HFRP Team,

You have received a new contact form submission from your website.

Details:
- Name: [User's Name]
- Email: [User's Email]
- Phone: [User's Phone]
- Message: [User's Message]

Please follow up with this inquiry promptly.

Best regards,
HFRP Website System
```

### Auto-Reply Email (to user):
```
Subject: Thank you for contacting HFRP - We'll be in touch soon

Dear [User's Name],

Thank you for reaching out to the Haitian Family Relief Project.
We have received your message and will respond within 24-48 hours.

Your message is important to us, and we appreciate your interest
in supporting our mission to provide relief and hope to families in Haiti.

Best regards,
The HFRP Team
```

---

## 🔧 Step 6: Advanced Configuration

### Custom Email Templates:
You can customize the email templates by editing:
- **File**: `src/app/api/contact/route.ts`
- **Look for**: Email template sections
- **Modify**: Subject lines, content, formatting

### Multiple Recipients:
To send notifications to multiple email addresses:
```env
RESEND_TO_EMAIL=contact@haitianfamilyrelief.org,admin@haitianfamilyrelief.org
```

### Email Branding:
- Add your logo to email templates
- Customize colors and styling
- Include social media links
- Add organization address/phone

---

## 📊 Step 7: Monitor Email Performance

### Resend Dashboard:
1. **View email logs** in Resend dashboard
2. **Check delivery rates** and bounces
3. **Monitor API usage** and limits
4. **Review email analytics**

### Key Metrics to Watch:
```
📈 Delivery Rate: Should be >95%
📈 Open Rate: Email engagement
📈 Bounce Rate: Should be <5%
📈 API Usage: Stay within limits
```

---

## 🚨 Troubleshooting

### Common Issues:

**Emails not sending:**
```
🔍 Check API key is correct
🔍 Verify domain is verified
🔍 Check "from" email uses verified domain
🔍 Review Resend dashboard for errors
🔍 Ensure EMAIL_SERVICE=resend in .env
```

**Emails going to spam:**
```
🔍 Verify domain authentication (SPF, DKIM)
🔍 Use consistent "from" email address
🔍 Avoid spam trigger words in content
🔍 Monitor sender reputation
```

**API rate limits:**
```
🔍 Check current usage in dashboard
🔍 Upgrade plan if needed
🔍 Implement rate limiting on contact form
```

**Domain verification fails:**
```
🔍 Double-check DNS records
🔍 Wait 24-48 hours for propagation
🔍 Use DNS checker tools
🔍 Contact domain provider if needed
```

---

## 🔒 Security Best Practices

### API Key Security:
- ✅ Never commit API keys to version control
- ✅ Use environment variables only
- ✅ Rotate keys regularly
- ✅ Restrict API key permissions if possible

### Form Protection:
- ✅ Validate all form inputs
- ✅ Implement rate limiting
- ✅ Use CAPTCHA if spam becomes an issue
- ✅ Sanitize user input before sending

---

## 📋 Alternative Email Services

If Resend doesn't work for your needs:

### SendGrid:
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_TO_EMAIL=contact@haitianfamilyrelief.org
```

### Gmail/SMTP:
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

## ✅ Final Testing Checklist

Before going live:

### Email Setup:
- [ ] Resend account created and verified
- [ ] Domain verified (or using resend.dev temporarily)
- [ ] API key generated and stored securely
- [ ] Environment variables configured correctly

### Functionality Testing:
- [ ] Contact form submits successfully
- [ ] Notification emails received
- [ ] Auto-reply emails sent to users
- [ ] Email formatting looks professional
- [ ] No console errors in browser

### Production Readiness:
- [ ] Custom domain verified (not using .resend.dev)
- [ ] Professional "from" email address
- [ ] Email templates customized with HFRP branding
- [ ] Multiple test submissions completed
- [ ] Email deliverability verified

---

## 📞 Support

### Resend Support:
- **Documentation**: https://resend.com/docs
- **Email**: support@resend.com
- **Community**: Discord and GitHub

### Integration Help:
- Check browser console for API errors
- Review network tab for failed requests
- Test API key in Resend dashboard
- Verify environment variables are loaded

**🎉 Once complete, your HFRP website will have professional email functionality for all contact form submissions!**
