# Backup Manifest
**Date**: Fri Oct 17 16:54:42 CDT 2025
**Website**: https://www.familyreliefproject7.org
**Project**: hfrp-relief

## Contents

### Code Backup
- `code/source-code.tar.gz` - Complete source code archive
- `code/package.json` - Node.js dependencies
- `code/next.config.js` - Next.js configuration
- `code/vercel.json` - Vercel deployment configuration

### Data Backup
- `data/` - Application data files
- `logs/` - Application logs

### Configuration Backup
- `configs/vercel-projects.txt` - Vercel project list
- `configs/vercel-domains.txt` - Domain configuration
- `configs/git-remotes.txt` - Git repository information
- `configs/backup-info.txt` - System and backup information

## Restoration Instructions

### 1. Restore Source Code
```bash
tar -xzf code/source-code.tar.gz
npm install
```

### 2. Configure Environment
```bash
cp code/.env.example .env
# Edit .env with your environment variables
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Restore Data
```bash
cp -r data/* ./data/
```

## Verification
- [ ] Website loads correctly
- [ ] All pages are accessible
- [ ] Donation functionality works
- [ ] Admin panel is accessible
- [ ] SSL certificate is valid

**Backup completed successfully at**: Fri Oct 17 16:54:42 CDT 2025
