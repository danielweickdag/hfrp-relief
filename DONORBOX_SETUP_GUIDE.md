# 🎯 Donorbox Campaign Setup Guide

## 📋 Overview

This guide will help you set up real Donorbox campaigns for your HFRP website and replace the test campaign IDs with your actual campaign IDs.

---

## 🔐 Step 1: Access Your Donorbox Account

1. **Log in to Donorbox** at https://donorbox.org/admin
2. **Navigate to your dashboard**
3. **If you don't have an account**: Sign up at https://donorbox.org/signup

---

## 📦 Step 2: Create Your Campaigns

You need to create **3 campaigns** for optimal donation flow:

### Campaign 1: Main Donation Campaign
**Purpose**: General donations from homepage "Donate Now" button

1. **Click "Create Campaign"** in your Donorbox dashboard
2. **Campaign Name**: `HFRP General Donations` (or similar)
3. **Campaign Goal**: Set your fundraising target
4. **Description**: Add compelling description about your mission
5. **Images**: Upload high-quality photos of your work
6. **Suggested Amounts**: Set amounts like $25, $50, $100, $250
7. **Save Campaign**

### Campaign 2: Membership Campaign
**Purpose**: Monthly/yearly recurring memberships

1. **Create another campaign**: `HFRP Monthly Membership`
2. **Enable Recurring Donations**: Turn ON monthly/yearly options
3. **Suggested Monthly Amounts**: $5, $10, $15, $25, $50
4. **Membership Benefits**: Describe what members receive
5. **Save Campaign**

### Campaign 3: Daily Giving Campaign (Optional)
**Purpose**: Focus on daily cost messaging (16¢, 33¢, 50¢, 66¢)

1. **Create campaign**: `HFRP Daily Impact`
2. **Suggested Amounts**: Calculate annual amounts
   - 16¢/day = $58.40/year
   - 33¢/day = $120.45/year
   - 50¢/day = $182.50/year
   - 66¢/day = $240.90/year
3. **Description**: Focus on daily impact messaging
4. **Save Campaign**

---

## 🔍 Step 3: Get Your Campaign IDs

For each campaign you created:

1. **Go to campaign dashboard**
2. **Look at the campaign URL** or **View Campaign** button
3. **Copy the campaign ID** from the URL

### Example URL Formats:
```
https://donorbox.org/hfrp-general-donations
Campaign ID: hfrp-general-donations

https://donorbox.org/hfrp-monthly-membership
Campaign ID: hfrp-monthly-membership

https://donorbox.org/hfrp-daily-impact
Campaign ID: hfrp-daily-impact
```

---

## ⚙️ Step 4: Configure Your Website

1. **Open your `.env.local` file**
2. **Update these variables** with your real campaign IDs:

```env
# Replace these with your actual campaign IDs
NEXT_PUBLIC_DONORBOX_MAIN_CAMPAIGN=hfrp-general-donations
NEXT_PUBLIC_DONORBOX_MEMBERSHIP_CAMPAIGN=hfrp-monthly-membership
NEXT_PUBLIC_DONORBOX_DAILY_GIVING_CAMPAIGN=hfrp-daily-impact

# IMPORTANT: Switch to production mode
NEXT_PUBLIC_DONATION_TEST_MODE=false
```

3. **Save the file**
4. **Restart your development server**: `bun dev`

---

## 🧪 Step 5: Test Your Real Campaigns

### Test in Safe Mode First:
1. **Keep test mode ON** initially: `NEXT_PUBLIC_DONATION_TEST_MODE=true`
2. **Update campaign IDs** to your real ones
3. **Test the donation flow** - should open your real campaigns in test mode
4. **Verify everything works** before going live

### Go Live:
1. **Set test mode to false**: `NEXT_PUBLIC_DONATION_TEST_MODE=false`
2. **Restart server**
3. **Make a small test donation** ($1-5) to verify everything works
4. **Check your Donorbox dashboard** for the test donation

---

## 🎨 Step 6: Customize Campaign Appearance

### Branding Your Campaigns:
1. **Upload your HFRP logo** to each campaign
2. **Set brand colors** to match your website
3. **Add compelling donation descriptions**
4. **Set up donation confirmation emails**
5. **Configure recurring donation options**

### Suggested Campaign Settings:
```
✅ Enable recurring donations (for membership campaign)
✅ Set suggested amounts that match your messaging
✅ Add impact descriptions ("$25 feeds a family for a week")
✅ Enable donor comments/dedications
✅ Set up email confirmations
✅ Configure donor privacy settings
```

---

## 📊 Step 7: Advanced Configuration

### For Daily Giving Focus:
If using daily cost messaging (16¢, 33¢, 50¢, 66¢):

1. **Create specific amounts** that emphasize daily impact
2. **Use descriptions** like:
   - "$5/month = 16¢ per day for daily nutrition"
   - "$10/month = 33¢ per day for healthcare access"
   - "$15/month = 50¢ per day for education support"
   - "$20/month = 66¢ per day for comprehensive care"

### For Membership Tiers:
```
Basic Member: $5/month - Newsletter + updates
Standard Member: $15/month - Above + quarterly reports
Premium Member: $25/month - Above + volunteer opportunities
Champion Member: $50/month - Above + direct program updates
```

---

## 🔐 Step 8: Security & Compliance

### Important Settings:
1. **Enable SSL** for all donation forms
2. **Configure donor data privacy** settings
3. **Set up PCI compliance** (Donorbox handles this)
4. **Enable donation receipts** for tax purposes
5. **Configure fraud protection** settings

---

## 📈 Step 9: Analytics & Tracking

### Connect Google Analytics:
1. **In Donorbox dashboard**, go to Settings → Integrations
2. **Add your Google Analytics ID**: `G-YOURMEASUREMENTID`
3. **Enable conversion tracking**
4. **Set up donation goal tracking**

### Monitor Performance:
```
📊 Track donation completion rates
📊 Monitor average donation amounts
📊 Analyze donor acquisition sources
📊 Review recurring vs one-time donations
📊 Monitor mobile vs desktop donations
```

---

## 🚨 Troubleshooting

### Common Issues:

**Campaign not loading:**
- Check campaign ID spelling
- Verify campaign is published/active
- Check if campaign has reached its goal limit

**Donations not processing:**
- Ensure test mode is disabled for live donations
- Verify Donorbox account is active
- Check for browser popup blockers

**Wrong campaign opening:**
- Double-check environment variable names
- Restart development server after changes
- Clear browser cache

---

## ✅ Final Checklist

Before going live with real donations:

### Campaign Setup:
- [ ] All 3 campaigns created and published
- [ ] Campaign IDs copied correctly
- [ ] Branding and descriptions added
- [ ] Suggested amounts configured
- [ ] Recurring options enabled (for membership)

### Website Configuration:
- [ ] Real campaign IDs in `.env.local`
- [ ] Test mode disabled (`NEXT_PUBLIC_DONATION_TEST_MODE=false`)
- [ ] Development server restarted
- [ ] All donation buttons tested

### Testing:
- [ ] Made small test donation successfully
- [ ] Verified donation appears in Donorbox dashboard
- [ ] Confirmed email receipts work
- [ ] Tested on mobile devices
- [ ] Verified membership page works

### Security:
- [ ] Environment file not committed to git
- [ ] Strong passwords used
- [ ] Fraud protection enabled
- [ ] SSL certificates active

---

## 📞 Support

### Donorbox Support:
- Email: support@donorbox.org
- Help Center: https://help.donorbox.org
- Live Chat: Available in dashboard

### Website Issues:
- Check browser console for errors
- Verify environment variables are loaded
- Test in different browsers
- Review this guide's troubleshooting section

**🎉 Once complete, your HFRP website will have fully functional, real donation processing!**
