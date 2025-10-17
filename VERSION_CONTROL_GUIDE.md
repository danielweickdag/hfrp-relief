# Version Control Guide for familyreliefproject7.org

## Overview
This guide outlines version control procedures for managing the live website `https://www.familyreliefproject7.org` to ensure safe deployments, easy rollbacks, and proper change tracking.

## 🔄 Git Workflow

### Branch Strategy
```
main (production) ← Always matches live site
├── develop (staging) ← Integration branch
├── feature/new-donation-form ← Feature branches
├── hotfix/ssl-issue ← Emergency fixes
└── release/v1.2.0 ← Release preparation
```

### Branch Naming Conventions
- **Feature branches**: `feature/description-of-feature`
- **Bug fixes**: `bugfix/description-of-bug`
- **Hotfixes**: `hotfix/critical-issue-description`
- **Releases**: `release/v1.x.x`

## 🚀 Deployment Workflow

### 1. Development Process
```bash
# Create feature branch
git checkout -b feature/new-hero-section

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: add new hero section with improved CTA"

# Push to remote
git push origin feature/new-hero-section
```

### 2. Testing & Review
```bash
# Deploy to preview for testing
vercel --prod --scope=danielweickdags-projects

# Test the preview URL
# Review changes with stakeholders
```

### 3. Production Deployment
```bash
# Merge to main branch
git checkout main
git merge feature/new-hero-section

# Tag the release
git tag -a v1.2.0 -m "Release v1.2.0: New hero section"

# Deploy to production
vercel --prod

# Push tags
git push origin main --tags
```

## 📝 Commit Message Standards

### Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
git commit -m "feat(donate): add recurring donation option"
git commit -m "fix(mobile): resolve navigation menu overflow"
git commit -m "docs: update deployment instructions"
git commit -m "style(homepage): improve responsive design"
```

## 🔒 Safe Deployment Practices

### Pre-Deployment Checklist
- [ ] Code reviewed and tested locally
- [ ] All tests passing
- [ ] Preview deployment tested
- [ ] Backup created
- [ ] Stakeholder approval received

### Deployment Commands
```bash
# 1. Create backup
./backup-procedures.sh

# 2. Deploy to production
vercel --prod

# 3. Verify deployment
curl -I https://www.familyreliefproject7.org

# 4. Run monitoring check
node monitoring-setup.js
```

## 🔄 Rollback Procedures

### Quick Rollback (Vercel)
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Git-based Rollback
```bash
# Find the last good commit
git log --oneline

# Create rollback branch
git checkout -b hotfix/rollback-to-v1.1.0

# Reset to previous version
git reset --hard [commit-hash]

# Deploy the rollback
vercel --prod

# Tag the rollback
git tag -a v1.1.1 -m "Rollback to v1.1.0 due to critical issue"
```

## 📊 Version Tracking

### Release Versioning (Semantic Versioning)
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Tagging Releases
```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0: Enhanced donation system"

# Push tags to remote
git push origin --tags

# List all tags
git tag -l
```

## 🔍 Change Tracking

### View Changes Between Versions
```bash
# Compare two tags
git diff v1.1.0..v1.2.0

# View commits between versions
git log v1.1.0..v1.2.0 --oneline

# Show files changed
git diff --name-only v1.1.0..v1.2.0
```

### Generate Changelog
```bash
# Create changelog for release
git log v1.1.0..HEAD --pretty=format:"- %s (%h)" > CHANGELOG.md
```

## 🛠 Environment Management

### Environment Variables
```bash
# Production environment
NEXT_PUBLIC_SITE_URL=https://www.familyreliefproject7.org
NEXT_PUBLIC_VERCEL_URL=hfrp-relief.vercel.app

# Development environment
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Configuration Files
- `.env.local` - Local development
- `.env.production` - Production settings
- `vercel.json` - Vercel deployment config

## 🚨 Emergency Procedures

### Critical Bug Fix
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-ssl-issue

# 2. Fix the issue
# ... make necessary changes ...

# 3. Test locally
npm run build
npm run start

# 4. Deploy immediately
vercel --prod

# 5. Merge back to main
git checkout main
git merge hotfix/critical-ssl-issue

# 6. Tag the hotfix
git tag -a v1.1.1 -m "Hotfix v1.1.1: Fix SSL certificate issue"
```

### Site Down Recovery
```bash
# 1. Check deployment status
vercel ls

# 2. Check domain configuration
vercel domains ls

# 3. Rollback if needed
vercel rollback [previous-deployment-url]

# 4. Verify recovery
curl -I https://www.familyreliefproject7.org
```

## 📋 Regular Maintenance

### Weekly Tasks
- [ ] Review and merge approved pull requests
- [ ] Update dependencies if needed
- [ ] Run security audit
- [ ] Create backup
- [ ] Monitor performance metrics

### Monthly Tasks
- [ ] Review and clean up old branches
- [ ] Update documentation
- [ ] Performance optimization review
- [ ] Security review
- [ ] Backup verification

### Commands for Maintenance
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Clean up merged branches
git branch --merged | grep -v main | xargs git branch -d

# Prune remote branches
git remote prune origin
```

## 🔧 Tools & Scripts

### Useful Git Aliases
```bash
# Add to ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    deploy = !vercel --prod
```

### Automation Scripts
- `backup-procedures.sh` - Automated backup
- `monitoring-setup.js` - Health monitoring
- `deploy.sh` - Deployment automation

## 📞 Support & Resources

### Key Contacts
- **Technical Lead**: [Your contact]
- **Vercel Support**: vercel.com/support
- **Domain Support**: Cloudflare dashboard

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Git Documentation](https://git-scm.com/docs)

### Emergency Contacts
- **Website Down**: Immediately check Vercel status
- **Domain Issues**: Check Cloudflare dashboard
- **SSL Problems**: Verify Vercel SSL settings

---

**Last Updated**: $(date)
**Website**: https://www.familyreliefproject7.org
**Repository**: Current project directory