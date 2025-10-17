# Design Update Workflow
## Making Changes to https://www.familyreliefproject7.org

### 🎯 **QUICK START GUIDE**

#### **For Small Changes (Text, Colors, Spacing)**
```bash
# 1. Start development server
npm run dev

# 2. Open browser to http://localhost:3000
# 3. Edit files and see changes instantly
# 4. When satisfied, deploy:
vercel --prod
```

#### **For Major Changes (Layout, Components)**
```bash
# 1. Create backup branch
git checkout -b backup/$(date +%Y%m%d)
git push origin backup/$(date +%Y%m%d)

# 2. Create feature branch
git checkout main
git checkout -b feature/new-design

# 3. Make changes with testing
npm run dev
npm run build
npm run test

# 4. Deploy to preview first
vercel

# 5. Test preview thoroughly
# 6. Deploy to production
vercel --prod
```

---

### 📁 **KEY FILES FOR DESIGN CHANGES**

#### **🎨 Visual Design**
```
src/app/globals.css          # Global styles, colors, fonts
tailwind.config.ts           # Design system configuration
src/components/ui/           # Reusable UI components
```

#### **📱 Page Layouts**
```
src/app/layout.tsx           # Site-wide layout (header, footer)
src/app/page.tsx             # Homepage content
src/app/_components/         # Page-specific components
```

#### **🖼️ Assets & Media**
```
public/                      # Static files (images, icons)
public/gallery/              # Photo gallery images
public/hfrp-logo.svg         # Logo files
```

#### **📊 Data & Content**
```
data/campaigns.json          # Campaign information
data/donations.json          # Donation data
src/app/blog/               # Blog content
```

---

### 🎨 **COMMON DESIGN UPDATES**

#### **1. Changing Colors**
**File**: `tailwind.config.ts`
```typescript
// Update brand colors
theme: {
  extend: {
    colors: {
      primary: '#your-new-color',
      secondary: '#your-secondary-color',
      accent: '#your-accent-color'
    }
  }
}
```

**File**: `src/app/globals.css`
```css
/* Update CSS custom properties */
:root {
  --primary: #your-new-color;
  --secondary: #your-secondary-color;
}
```

#### **2. Updating Typography**
**File**: `tailwind.config.ts`
```typescript
// Add custom fonts
fontFamily: {
  'heading': ['Your-Font', 'sans-serif'],
  'body': ['Your-Body-Font', 'sans-serif']
}
```

**File**: `src/app/layout.tsx`
```typescript
// Import Google Fonts
import { Inter, Roboto } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

#### **3. Modifying Layout**
**File**: `src/app/page.tsx`
```typescript
// Update homepage sections
export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        {/* Your content */}
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        {/* Your content */}
      </section>
    </main>
  )
}
```

#### **4. Adding New Components**
**Create**: `src/components/ui/new-component.tsx`
```typescript
interface NewComponentProps {
  title: string;
  description: string;
}

export function NewComponent({ title, description }: NewComponentProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
```

#### **5. Updating Images**
```bash
# Add new images to public folder
cp your-image.jpg public/gallery/

# Update image references in components
<Image 
  src="/gallery/your-image.jpg" 
  alt="Description"
  width={800}
  height={600}
/>
```

---

### 🔧 **DEVELOPMENT TOOLS**

#### **Local Development**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

#### **Preview Deployments**
```bash
# Deploy to preview URL
vercel

# Deploy specific branch
vercel --prod --branch feature/new-design
```

#### **Monitoring Changes**
```bash
# Watch for file changes
npm run dev

# Check build output
npm run build 2>&1 | tee build.log

# Monitor performance
npm run analyze
```

---

### 📱 **RESPONSIVE DESIGN**

#### **Breakpoints (Tailwind)**
```css
/* Mobile First Approach */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

#### **Responsive Classes**
```html
<!-- Mobile: stack vertically, Desktop: side by side -->
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Content 1</div>
  <div className="w-full md:w-1/2">Content 2</div>
</div>

<!-- Different text sizes -->
<h1 className="text-2xl md:text-4xl lg:text-6xl">
  Responsive Heading
</h1>
```

#### **Testing Responsive Design**
```bash
# Test on different screen sizes
# Chrome DevTools: F12 → Toggle Device Toolbar

# Test with real devices
# Use ngrok for external testing:
npx ngrok http 3000
```

---

### 🎯 **CONTENT UPDATES**

#### **Homepage Content**
**File**: `src/app/page.tsx`
- Hero section text
- Mission statement
- Impact statistics
- Call-to-action buttons

#### **Navigation Menu**
**File**: `src/app/layout.tsx`
```typescript
// Update navigation links
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Programs', href: '/programs' },
  { name: 'Donate', href: '/donate' }
]
```

#### **Footer Information**
**File**: `src/app/layout.tsx`
- Contact information
- Social media links
- Legal pages

#### **Blog Posts**
```bash
# Add new blog post
node blog-publisher.js

# Edit existing posts
# Files in: src/app/blog/
```

---

### 🚀 **DEPLOYMENT PROCESS**

#### **Pre-Deployment Checklist**
- [ ] Test locally (`npm run dev`)
- [ ] Build successfully (`npm run build`)
- [ ] Run tests (`npm run test`)
- [ ] Check responsive design
- [ ] Verify all links work
- [ ] Test donation functionality
- [ ] Check loading performance

#### **Deployment Steps**
```bash
# 1. Commit changes
git add .
git commit -m "Update: describe your changes"

# 2. Push to repository
git push origin main

# 3. Deploy to production
vercel --prod

# 4. Verify deployment
curl -I https://www.familyreliefproject7.org
```

#### **Post-Deployment Verification**
- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] Forms work properly
- [ ] Images display correctly
- [ ] Mobile version works
- [ ] Analytics tracking active

---

### 🔍 **TESTING & QUALITY ASSURANCE**

#### **Browser Testing**
- **Chrome** (Primary)
- **Firefox**
- **Safari**
- **Edge**
- **Mobile browsers**

#### **Performance Testing**
```bash
# Lighthouse audit
npx lighthouse https://www.familyreliefproject7.org --output html

# Bundle analysis
npm run analyze

# Load testing
curl -w "@curl-format.txt" -o /dev/null -s https://www.familyreliefproject7.org
```

#### **Accessibility Testing**
- **Screen reader compatibility**
- **Keyboard navigation**
- **Color contrast ratios**
- **Alt text for images**

---

### 🆘 **TROUBLESHOOTING**

#### **Common Issues**

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Styling Issues:**
```bash
# Regenerate Tailwind
npm run build:css
```

**Image Problems:**
```bash
# Optimize images
npx next-optimized-images
```

**Performance Issues:**
```bash
# Analyze bundle size
npm run analyze

# Check for unused code
npx depcheck
```

---

### 📞 **GETTING HELP**

#### **Documentation**
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel**: https://vercel.com/docs

#### **Community Support**
- **Next.js Discord**: https://discord.gg/nextjs
- **Tailwind Discord**: https://discord.gg/tailwindcss
- **Stack Overflow**: Tag questions with `nextjs`, `tailwindcss`

---

**Remember**: Always test changes locally before deploying to production!