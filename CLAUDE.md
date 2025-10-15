# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HFRP Relief is a comprehensive Next.js 15 website for the Haitian Family Relief Project, featuring donation management, content management, volunteer tracking, and automated campaign workflows. The application is designed for deployment to familyreliefproject7.org.

**Tech Stack:**
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS + shadcn/ui components
- Stripe for payment processing (replacing Donorbox)
- File-based storage in `data/` directory (JSON files)
- Biome for linting and formatting
- Vercel for deployment

## Development Commands

```bash
# Development
bun dev                    # Start dev server on port 3005 with Turbo

# Build & Deploy
bun build                  # Production build
bun run build:vercel       # Vercel build (skips TypeScript checking)
bun start                  # Start production server
npm run deploy:vercel      # Deploy to Vercel

# Code Quality
bun run lint               # Run Biome linter + TypeScript check
bun run format             # Format code with Biome

# Automation & Workflows
npm run automation:master  # Run master automation script
npm run workflow:dev       # Run development workflow
npm run scheduler:start    # Start automation scheduler
```

## Architecture

### App Structure

The project uses Next.js 15 App Router with the following key directories:

**Pages:**
- `/` - Homepage with hero section, donation widgets, background video
- `/admin/*` - Admin panel (blog, campaigns, donations, volunteers, media)
- `/blog/*` - Blog posts with markdown rendering
- `/programs/*` - Program information pages (education, feeding, healthcare, shelter)
- `/donate` - Donation page with Stripe integration
- `/contact` - Contact form

**API Routes (`src/app/api/`):**
- `/api/stripe/*` - Stripe payment processing, webhooks, campaign sync
- `/api/contact` - Contact form submission
- `/api/campaigns` - Campaign management
- `/api/email/*` - Email automation
- `/api/volunteer/*` - Volunteer scheduling

### Data Storage

All data is stored as JSON files in the `data/` directory:
- `campaigns.json` / `campaigns_real.json` - Campaign data
- `donations.json` - Donation records
- `contact-requests.json` - Contact form submissions
- `automation/*.json` - Campaign automation configurations
- `backups/` - Automated timestamped backups

**Important:** When modifying data files, always use `fs.promises` and handle errors gracefully.

### Stripe Integration

The application uses a comprehensive Stripe integration replacing Donorbox:

**Key Files:**
- `src/lib/stripeConfig.ts` - Base Stripe configuration
- `src/lib/stripeAutomation.ts` - Campaign/event automation service
- `src/lib/stripeCampaignSync.ts` - Product/price synchronization
- `src/app/api/stripe/webhook/route.ts` - Webhook event handlers

**Payment Flow:**
1. Frontend creates checkout session via `/api/stripe/checkout`
2. User completes payment on Stripe Checkout
3. Webhook events trigger automation (thank you emails, receipts, campaign updates)
4. Data persisted to `data/donations.json` and logged to `data/logs/stripe-events.json`

**Stripe API Versions:**
- Main: `2025-08-27.basil`
- Campaign sync: `2025-07-30.basil`
- Automation: `2024-12-18.acacia`

### Admin Panel

Located at `/admin`, protected by simple email-based authentication.

**Admin Roles:**
- Super Admin: `w.regis@comcast.net`
- Editor: `editor@haitianfamilyrelief.org`
- Volunteer: `volunteer@haitianfamilyrelief.org`
- Password: `Melirosecherie58` (change in production!)

**Admin Features:**
- Blog post management with TipTap rich text editor
- Campaign creation and tracking
- Donation analytics dashboard
- Volunteer management
- Media gallery uploads
- Contact request handling
- Backup management

### Component Architecture

**shadcn/ui Components (`src/components/ui/`):**
- Uses Radix UI primitives
- CSS variables for theming (defined in `globals.css`)
- Tailwind CSS with `tailwindcss-animate` plugin

**Custom Components (`src/app/_components/`):**
- `StripeDashboard.tsx` - Main donation analytics
- `CampaignManager.tsx` - Campaign CRUD operations
- `StripeCampaignManager.tsx` - Stripe campaign sync UI
- `BackgroundVideo.tsx` - Hero section video player
- `BlogStatsDashboard.tsx` - Blog analytics
- `VolunteerDashboard.tsx` - Volunteer tracking
- `ErrorBoundary.tsx` / `ErrorMonitor.tsx` - Error handling

**Automation Components (`src/components/`):**
- `automated-donation-selector.tsx` - Smart donation amount selection
- `automated-event-manager.tsx` - Event/fundraiser management
- `stripe-automation-dashboard.tsx` - Automation control panel

### TypeScript Configuration

**Important TypeScript Settings:**
- `strict: true` - Strict type checking enabled
- `skipLibCheck: true` - Skip lib checking for performance
- **Build ignores TypeScript errors** (`ignoreBuildErrors: true` in `next.config.js`)
- Path alias: `@/*` maps to `src/*`

When adding new types, place them in `src/types/`:
- `donation.ts` - Donation-related interfaces
- `blog.ts` - Blog post types
- `volunteer.ts` - Volunteer data structures
- `analytics.ts` - Analytics types
- `backup.ts` - Backup metadata types

### Environment Variables

Required environment variables (see `.env.example`):

**Stripe (Required):**
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (starts with `pk_`)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)
- `NEXT_PUBLIC_STRIPE_TEST_MODE` - Set to `"true"` for test mode

**App Config:**
- `NEXT_PUBLIC_SITE_URL` - Site URL (defaults to `https://www.familyreliefproject7.org`)
- `NODE_ENV` - Set to `production` for production builds
- `SESSION_SECRET` - Session encryption key

**Optional:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID
- `DONORBOX_API_KEY` - Legacy Donorbox integration (being replaced)

## Common Development Patterns

### Reading/Writing Data Files

```typescript
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Always use absolute paths
const filePath = path.join(process.cwd(), 'data', 'donations.json');

// Read with error handling
try {
  const data = await fs.readFile(filePath, 'utf-8');
  const donations = JSON.parse(data);
} catch (error) {
  // Handle file not found or invalid JSON
}

// Write with pretty printing
await fs.writeFile(filePath, JSON.stringify(data, null, 2));
```

### Creating API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

### Stripe Webhook Handling

Webhooks are verified using `stripe.webhooks.constructEvent()`. All webhook events are:
1. Verified with signature
2. Processed by event-specific handlers
3. Logged to `data/logs/stripe-events.json`

### Error Handling

- Use `ErrorBoundary` component for React error boundaries
- API routes should always return proper error status codes
- Client-side errors are monitored via `ErrorMonitor` component
- Console errors are logged but builds proceed (non-blocking)

## Testing

**Manual Testing:**
- Test Stripe payments using test mode keys (`pk_test_...`, `sk_test_...`)
- Use Stripe test card: `4242 4242 4242 4242`
- Admin panel accessible at `/admin` with credentials above
- Test webhooks locally using Stripe CLI: `stripe listen --forward-to localhost:3005/api/stripe/webhook`

**No automated tests currently configured** - focus on manual testing before deployment.

## Deployment

**Target Platform:** Vercel

**Pre-Deployment Checklist:**
1. Switch Stripe keys from test to live mode
2. Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
3. Set `NEXT_PUBLIC_STRIPE_TEST_MODE=false`
4. Change default admin password
5. Configure custom domain (familyreliefproject7.org)
6. Test contact form email delivery
7. Verify SSL certificate auto-generation

**Vercel Build Command:** `npm run build:vercel` (skips TypeScript checking)

**Deployment Notes:**
- Static files served from `public/`
- Background video: `public/bg-video.mp4`
- Logo: `src/app/hfrp-logo.png`
- PWA manifest: `public/manifest.json`
- Service worker: `public/sw.js`

## Important Constraints

1. **No Database:** All data stored in JSON files - consider scalability limits
2. **Build Ignores TypeScript Errors:** Fix critical type errors but build won't fail
3. **File-Based Storage:** Ensure `data/` directory is writable in production
4. **Stripe Webhooks:** Require public URL - test locally with Stripe CLI
5. **Video Files:** Large video files should be optimized or use CDN
6. **Admin Authentication:** Simple email check - enhance security before production

## Migration Notes

**Donorbox → Stripe Migration:**
- Donorbox code still present but deprecated
- `stripeAutomation.ts` and `stripeCampaignSync.ts` replace Donorbox functionality
- Update campaign configurations in `data/automation/*.json`
- Migrate existing donor data manually if needed

## Code Style

- Use Biome for formatting (configured in `biome.json`)
- Double quotes for strings
- 2-space indentation
- Most accessibility rules disabled in Biome config
- Unused variables allowed (TypeScript rule disabled)

## Additional Resources

- Extensive markdown documentation in root directory (*.md files)
- See `STRIPE_MIGRATION_GUIDE.md` for Stripe migration details
- See `DEPLOYMENT_CHECKLIST_familyreliefproject.md` for deployment steps
- See `AUTOMATION_GUIDE.md` for automation workflows
