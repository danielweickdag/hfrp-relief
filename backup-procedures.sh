#!/bin/bash

# Website Backup Procedures for familyreliefproject7.org
# Automated backup script for code, data, and configurations

set -e  # Exit on any error

# Configuration
WEBSITE_URL="https://www.familyreliefproject7.org"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
PROJECT_NAME="hfrp-relief"
REMOTE_REPO="origin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/code"
    mkdir -p "$BACKUP_DIR/data"
    mkdir -p "$BACKUP_DIR/configs"
    mkdir -p "$BACKUP_DIR/logs"
    success "Backup directory created"
}

# Backup source code
backup_code() {
    log "Backing up source code..."
    
    # Create git archive of current state
    git archive --format=tar.gz --output="$BACKUP_DIR/code/source-code.tar.gz" HEAD
    
    # Copy important files
    cp package.json "$BACKUP_DIR/code/" 2>/dev/null || warning "package.json not found"
    cp package-lock.json "$BACKUP_DIR/code/" 2>/dev/null || warning "package-lock.json not found"
    cp next.config.js "$BACKUP_DIR/code/" 2>/dev/null || warning "next.config.js not found"
    cp tailwind.config.ts "$BACKUP_DIR/code/" 2>/dev/null || warning "tailwind.config.ts not found"
    cp vercel.json "$BACKUP_DIR/code/" 2>/dev/null || warning "vercel.json not found"
    
    # Copy environment template
    cp .env.example "$BACKUP_DIR/code/" 2>/dev/null || warning ".env.example not found"
    
    success "Source code backed up"
}

# Backup data files
backup_data() {
    log "Backing up data files..."
    
    if [ -d "data" ]; then
        cp -r data/* "$BACKUP_DIR/data/" 2>/dev/null || warning "No data files found"
        success "Data files backed up"
    else
        warning "Data directory not found"
    fi
    
    # Backup logs if they exist
    if [ -d "logs" ]; then
        cp -r logs/* "$BACKUP_DIR/logs/" 2>/dev/null || warning "No log files found"
        success "Log files backed up"
    else
        warning "Logs directory not found"
    fi
}

# Backup configurations
backup_configs() {
    log "Backing up configuration files..."
    
    # Vercel configuration
    vercel project ls > "$BACKUP_DIR/configs/vercel-projects.txt" 2>/dev/null || warning "Vercel CLI not available"
    vercel domains ls > "$BACKUP_DIR/configs/vercel-domains.txt" 2>/dev/null || warning "Vercel domains not accessible"
    
    # Git configuration
    git remote -v > "$BACKUP_DIR/configs/git-remotes.txt" 2>/dev/null || warning "Git remotes not accessible"
    git branch -a > "$BACKUP_DIR/configs/git-branches.txt" 2>/dev/null || warning "Git branches not accessible"
    
    # System information
    echo "Backup Date: $(date)" > "$BACKUP_DIR/configs/backup-info.txt"
    echo "Website URL: $WEBSITE_URL" >> "$BACKUP_DIR/configs/backup-info.txt"
    echo "Project Name: $PROJECT_NAME" >> "$BACKUP_DIR/configs/backup-info.txt"
    echo "Node Version: $(node --version 2>/dev/null || echo 'Not available')" >> "$BACKUP_DIR/configs/backup-info.txt"
    echo "NPM Version: $(npm --version 2>/dev/null || echo 'Not available')" >> "$BACKUP_DIR/configs/backup-info.txt"
    
    success "Configuration files backed up"
}

# Test website accessibility
test_website() {
    log "Testing website accessibility..."
    
    # Test main URL
    if curl -s --head "$WEBSITE_URL" | head -n 1 | grep -q "200 OK"; then
        success "Website is accessible"
        echo "Website Status: ONLINE" >> "$BACKUP_DIR/configs/backup-info.txt"
    else
        error "Website is not accessible"
        echo "Website Status: OFFLINE" >> "$BACKUP_DIR/configs/backup-info.txt"
    fi
    
    # Test key pages
    local pages=("/" "/about" "/donate" "/admin")
    for page in "${pages[@]}"; do
        if curl -s --head "$WEBSITE_URL$page" | head -n 1 | grep -q "200\|301\|302"; then
            echo "Page $page: ACCESSIBLE" >> "$BACKUP_DIR/configs/backup-info.txt"
        else
            echo "Page $page: NOT ACCESSIBLE" >> "$BACKUP_DIR/configs/backup-info.txt"
        fi
    done
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    cat > "$BACKUP_DIR/BACKUP_MANIFEST.md" << EOF
# Backup Manifest
**Date**: $(date)
**Website**: $WEBSITE_URL
**Project**: $PROJECT_NAME

## Contents

### Code Backup
- \`code/source-code.tar.gz\` - Complete source code archive
- \`code/package.json\` - Node.js dependencies
- \`code/next.config.js\` - Next.js configuration
- \`code/vercel.json\` - Vercel deployment configuration

### Data Backup
- \`data/\` - Application data files
- \`logs/\` - Application logs

### Configuration Backup
- \`configs/vercel-projects.txt\` - Vercel project list
- \`configs/vercel-domains.txt\` - Domain configuration
- \`configs/git-remotes.txt\` - Git repository information
- \`configs/backup-info.txt\` - System and backup information

## Restoration Instructions

### 1. Restore Source Code
\`\`\`bash
tar -xzf code/source-code.tar.gz
npm install
\`\`\`

### 2. Configure Environment
\`\`\`bash
cp code/.env.example .env
# Edit .env with your environment variables
\`\`\`

### 3. Deploy to Vercel
\`\`\`bash
vercel --prod
\`\`\`

### 4. Restore Data
\`\`\`bash
cp -r data/* ./data/
\`\`\`

## Verification
- [ ] Website loads correctly
- [ ] All pages are accessible
- [ ] Donation functionality works
- [ ] Admin panel is accessible
- [ ] SSL certificate is valid

**Backup completed successfully at**: $(date)
EOF

    success "Backup manifest created"
}

# Compress backup
compress_backup() {
    log "Compressing backup..."
    
    local backup_name="hfrp-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$backup_name" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
    
    success "Backup compressed to: $backup_name"
    echo "Compressed Backup: $backup_name" >> "$BACKUP_DIR/configs/backup-info.txt"
}

# Push to git repository
push_to_git() {
    log "Pushing current state to git repository..."
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    local commit_message="Backup: $(date +'%Y-%m-%d %H:%M:%S')"
    git commit -m "$commit_message" || warning "No changes to commit"
    
    # Push to remote
    git push "$REMOTE_REPO" main || error "Failed to push to remote repository"
    
    success "Code pushed to git repository"
}

# Cleanup old backups (keep last 7 days)
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    find ./backups -type d -name "20*" -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    find . -name "hfrp-backup-*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    
    success "Old backups cleaned up"
}

# Main backup function
main() {
    echo "🔄 Starting Website Backup Process"
    echo "=================================="
    
    create_backup_dir
    backup_code
    backup_data
    backup_configs
    test_website
    create_manifest
    compress_backup
    push_to_git
    cleanup_old_backups
    
    echo ""
    echo "🎉 Backup Process Completed Successfully!"
    echo "========================================"
    echo "Backup Location: $BACKUP_DIR"
    echo "Website Status: $(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL")"
    echo "Backup Time: $(date)"
}

# Run backup if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi