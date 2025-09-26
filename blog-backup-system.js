#!/usr/bin/env node

/**
 * Blog Backup and Versioning System for HFRP Relief
 * Handles automated backups, version control, and content recovery
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class BlogBackupSystem {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.backupDir = path.join(this.dataDir, 'backups');
    this.versionsDir = path.join(this.dataDir, 'versions');
    this.blogDataFile = path.join(this.dataDir, 'blog-posts.json');
    this.backupLogFile = path.join(this.dataDir, 'backup-log.json');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.dataDir, this.backupDir, this.versionsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Create a full backup of all blog data
  async createFullBackup(options = {}) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupId);
      
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      console.log(`🔄 Creating full backup: ${backupId}`);

      // Backup blog posts data
      const blogPosts = this.getBlogPosts();
      const backupData = {
        timestamp: new Date().toISOString(),
        backupId,
        type: 'full',
        metadata: {
          totalPosts: blogPosts.length,
          publishedPosts: blogPosts.filter(p => p.status === 'published').length,
          draftPosts: blogPosts.filter(p => p.status === 'draft').length,
          backupSize: this.calculateDataSize(blogPosts),
          compression: options.compress || false
        },
        blogPosts,
        checksum: this.generateChecksum(JSON.stringify(blogPosts))
      };

      // Save backup data
      const backupFile = path.join(backupPath, 'blog-data.json');
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      // Backup individual post files
      const postsDir = path.join(backupPath, 'posts');
      fs.mkdirSync(postsDir, { recursive: true });
      
      for (const post of blogPosts) {
        const postFile = path.join(postsDir, `${post.slug}.json`);
        fs.writeFileSync(postFile, JSON.stringify(post, null, 2));
      }

      // Backup static files if they exist
      await this.backupStaticFiles(backupPath);

      // Compress backup if requested
      if (options.compress) {
        await this.compressBackup(backupPath);
      }

      // Log backup creation
      this.logBackupEvent({
        backupId,
        type: 'full',
        status: 'completed',
        size: this.getDirectorySize(backupPath),
        postsCount: blogPosts.length
      });

      console.log(`✅ Full backup completed: ${backupId}`);
      console.log(`📁 Location: ${backupPath}`);
      console.log(`📊 Posts backed up: ${blogPosts.length}`);
      
      return {
        backupId,
        path: backupPath,
        metadata: backupData.metadata
      };
    } catch (error) {
      console.error('Error creating full backup:', error);
      this.logBackupEvent({
        type: 'full',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  // Create incremental backup (only changed posts)
  async createIncrementalBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `incremental-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupId);
      
      console.log(`🔄 Creating incremental backup: ${backupId}`);

      // Get last backup timestamp
      const lastBackup = this.getLastBackup();
      const lastBackupTime = lastBackup ? new Date(lastBackup.timestamp) : new Date(0);

      // Find changed posts
      const blogPosts = this.getBlogPosts();
      const changedPosts = blogPosts.filter(post => {
        const postModified = new Date(post.updatedAt || post.createdAt);
        return postModified > lastBackupTime;
      });

      if (changedPosts.length === 0) {
        console.log('📝 No changes detected since last backup');
        return null;
      }

      fs.mkdirSync(backupPath, { recursive: true });

      const backupData = {
        timestamp: new Date().toISOString(),
        backupId,
        type: 'incremental',
        baseBackup: lastBackup?.backupId,
        metadata: {
          changedPosts: changedPosts.length,
          totalPosts: blogPosts.length,
          backupSize: this.calculateDataSize(changedPosts)
        },
        changedPosts,
        checksum: this.generateChecksum(JSON.stringify(changedPosts))
      };

      // Save incremental backup
      const backupFile = path.join(backupPath, 'incremental-data.json');
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      // Save individual changed posts
      const postsDir = path.join(backupPath, 'posts');
      fs.mkdirSync(postsDir, { recursive: true });
      
      for (const post of changedPosts) {
        const postFile = path.join(postsDir, `${post.slug}.json`);
        fs.writeFileSync(postFile, JSON.stringify(post, null, 2));
      }

      this.logBackupEvent({
        backupId,
        type: 'incremental',
        status: 'completed',
        changedPosts: changedPosts.length
      });

      console.log(`✅ Incremental backup completed: ${backupId}`);
      console.log(`📊 Changed posts: ${changedPosts.length}`);
      
      return {
        backupId,
        path: backupPath,
        changedPosts: changedPosts.length
      };
    } catch (error) {
      console.error('Error creating incremental backup:', error);
      this.logBackupEvent({
        type: 'incremental',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  // Create version snapshot for a specific post
  createPostVersion(postId, changeDescription = '') {
    try {
      const blogPosts = this.getBlogPosts();
      const post = blogPosts.find(p => p.id === postId);
      
      if (!post) {
        throw new Error(`Post with ID ${postId} not found`);
      }

      const versionId = `${postId}-v${Date.now()}`;
      const versionPath = path.join(this.versionsDir, post.slug);
      
      if (!fs.existsSync(versionPath)) {
        fs.mkdirSync(versionPath, { recursive: true });
      }

      const version = {
        versionId,
        postId,
        timestamp: new Date().toISOString(),
        changeDescription,
        post: { ...post },
        checksum: this.generateChecksum(JSON.stringify(post))
      };

      const versionFile = path.join(versionPath, `${versionId}.json`);
      fs.writeFileSync(versionFile, JSON.stringify(version, null, 2));

      // Update version index
      this.updateVersionIndex(post.slug, version);

      console.log(`📝 Version created for post: ${post.title}`);
      console.log(`🔖 Version ID: ${versionId}`);
      
      return version;
    } catch (error) {
      console.error('Error creating post version:', error);
      throw error;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId, options = {}) {
    try {
      console.log(`🔄 Restoring from backup: ${backupId}`);
      
      const backupPath = path.join(this.backupDir, backupId);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup ${backupId} not found`);
      }

      // Create current state backup before restore
      if (!options.skipCurrentBackup) {
        await this.createFullBackup({ compress: true });
      }

      // Load backup data
      const backupFile = path.join(backupPath, 'blog-data.json');
      const incrementalFile = path.join(backupPath, 'incremental-data.json');
      
      let backupData;
      if (fs.existsSync(backupFile)) {
        backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      } else if (fs.existsSync(incrementalFile)) {
        throw new Error('Cannot restore from incremental backup alone. Please restore from full backup first.');
      } else {
        throw new Error('Invalid backup format');
      }

      // Verify backup integrity
      const currentChecksum = this.generateChecksum(JSON.stringify(backupData.blogPosts));
      if (currentChecksum !== backupData.checksum) {
        throw new Error('Backup integrity check failed');
      }

      // Restore blog posts
      this.saveBlogPosts(backupData.blogPosts);

      // Restore static files if they exist
      await this.restoreStaticFiles(backupPath);

      this.logBackupEvent({
        backupId,
        type: 'restore',
        status: 'completed',
        restoredPosts: backupData.blogPosts.length
      });

      console.log(`✅ Restore completed from backup: ${backupId}`);
      console.log(`📊 Posts restored: ${backupData.blogPosts.length}`);
      
      return {
        backupId,
        restoredPosts: backupData.blogPosts.length,
        timestamp: backupData.timestamp
      };
    } catch (error) {
      console.error('Error restoring from backup:', error);
      this.logBackupEvent({
        backupId,
        type: 'restore',
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  // Restore specific post version
  restorePostVersion(postSlug, versionId) {
    try {
      const versionPath = path.join(this.versionsDir, postSlug, `${versionId}.json`);
      
      if (!fs.existsSync(versionPath)) {
        throw new Error(`Version ${versionId} not found for post ${postSlug}`);
      }

      const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      
      // Verify version integrity
      const currentChecksum = this.generateChecksum(JSON.stringify(version.post));
      if (currentChecksum !== version.checksum) {
        throw new Error('Version integrity check failed');
      }

      // Create current version backup before restore
      const blogPosts = this.getBlogPosts();
      const currentPost = blogPosts.find(p => p.slug === postSlug);
      if (currentPost) {
        this.createPostVersion(currentPost.id, 'Auto-backup before version restore');
      }

      // Update post with version data
      const postIndex = blogPosts.findIndex(p => p.slug === postSlug);
      if (postIndex !== -1) {
        blogPosts[postIndex] = {
          ...version.post,
          updatedAt: new Date().toISOString(),
          restoredFrom: versionId
        };
        this.saveBlogPosts(blogPosts);
      }

      console.log(`✅ Post restored to version: ${versionId}`);
      console.log(`📝 Post: ${version.post.title}`);
      
      return version.post;
    } catch (error) {
      console.error('Error restoring post version:', error);
      throw error;
    }
  }

  // List all backups
  listBackups() {
    try {
      const backups = [];
      
      if (!fs.existsSync(this.backupDir)) {
        return backups;
      }

      const backupDirs = fs.readdirSync(this.backupDir)
        .filter(dir => fs.statSync(path.join(this.backupDir, dir)).isDirectory());

      for (const dir of backupDirs) {
        const backupPath = path.join(this.backupDir, dir);
        const dataFile = path.join(backupPath, 'blog-data.json');
        const incrementalFile = path.join(backupPath, 'incremental-data.json');
        
        let backupInfo;
        if (fs.existsSync(dataFile)) {
          const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
          backupInfo = {
            backupId: data.backupId,
            type: data.type,
            timestamp: data.timestamp,
            postsCount: data.blogPosts.length,
            size: this.getDirectorySize(backupPath)
          };
        } else if (fs.existsSync(incrementalFile)) {
          const data = JSON.parse(fs.readFileSync(incrementalFile, 'utf8'));
          backupInfo = {
            backupId: data.backupId,
            type: data.type,
            timestamp: data.timestamp,
            changedPosts: data.changedPosts.length,
            size: this.getDirectorySize(backupPath)
          };
        }
        
        if (backupInfo) {
          backups.push(backupInfo);
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  // List versions for a specific post
  listPostVersions(postSlug) {
    try {
      const versionPath = path.join(this.versionsDir, postSlug);
      
      if (!fs.existsSync(versionPath)) {
        return [];
      }

      const versionFiles = fs.readdirSync(versionPath)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(versionPath, file);
          const version = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return {
            versionId: version.versionId,
            timestamp: version.timestamp,
            changeDescription: version.changeDescription,
            title: version.post.title
          };
        });

      return versionFiles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error listing post versions:', error);
      return [];
    }
  }

  // Clean old backups
  cleanOldBackups(retentionDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const backups = this.listBackups();
      let deletedCount = 0;
      
      for (const backup of backups) {
        const backupDate = new Date(backup.timestamp);
        
        if (backupDate < cutoffDate && backup.type !== 'full') {
          const backupPath = path.join(this.backupDir, backup.backupId);
          
          if (fs.existsSync(backupPath)) {
            fs.rmSync(backupPath, { recursive: true, force: true });
            deletedCount++;
            console.log(`🗑️ Deleted old backup: ${backup.backupId}`);
          }
        }
      }
      
      console.log(`🧹 Cleanup completed: ${deletedCount} old backups deleted`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning old backups:', error);
      throw error;
    }
  }

  // Helper methods
  getBlogPosts() {
    if (!fs.existsSync(this.blogDataFile)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(this.blogDataFile, 'utf8'));
  }

  saveBlogPosts(posts) {
    fs.writeFileSync(this.blogDataFile, JSON.stringify(posts, null, 2));
  }

  generateChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  calculateDataSize(data) {
    return Buffer.byteLength(JSON.stringify(data), 'utf8');
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    }
    
    return totalSize;
  }

  getLastBackup() {
    const backups = this.listBackups();
    return backups.length > 0 ? backups[0] : null;
  }

  updateVersionIndex(postSlug, version) {
    const indexFile = path.join(this.versionsDir, postSlug, 'index.json');
    
    let index = [];
    if (fs.existsSync(indexFile)) {
      index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    }
    
    index.push({
      versionId: version.versionId,
      timestamp: version.timestamp,
      changeDescription: version.changeDescription
    });
    
    fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
  }

  async backupStaticFiles(backupPath) {
    // Backup any static blog-related files
    const staticDir = path.join(process.cwd(), 'public/blog');
    if (fs.existsSync(staticDir)) {
      const backupStaticDir = path.join(backupPath, 'static');
      await execAsync(`cp -r "${staticDir}" "${backupStaticDir}"`);
    }
  }

  async restoreStaticFiles(backupPath) {
    const backupStaticDir = path.join(backupPath, 'static');
    if (fs.existsSync(backupStaticDir)) {
      const staticDir = path.join(process.cwd(), 'public/blog');
      await execAsync(`cp -r "${backupStaticDir}"/* "${staticDir}"/`);
    }
  }

  async compressBackup(backupPath) {
    try {
      const compressedFile = `${backupPath}.tar.gz`;
      await execAsync(`tar -czf "${compressedFile}" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`);
      
      // Remove uncompressed directory
      fs.rmSync(backupPath, { recursive: true, force: true });
      
      console.log(`🗜️ Backup compressed: ${compressedFile}`);
    } catch (error) {
      console.error('Error compressing backup:', error);
    }
  }

  logBackupEvent(event) {
    let logs = [];
    if (fs.existsSync(this.backupLogFile)) {
      logs = JSON.parse(fs.readFileSync(this.backupLogFile, 'utf8'));
    }
    
    logs.push({
      timestamp: new Date().toISOString(),
      ...event
    });
    
    // Keep only last 500 log entries
    if (logs.length > 500) {
      logs = logs.slice(-500);
    }
    
    fs.writeFileSync(this.backupLogFile, JSON.stringify(logs, null, 2));
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const backupSystem = new BlogBackupSystem();
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  
  switch (command) {
    case 'full':
      backupSystem.createFullBackup({ compress: arg1 === '--compress' });
      break;
    case 'incremental':
      backupSystem.createIncrementalBackup();
      break;
    case 'restore':
      if (arg1) {
        backupSystem.restoreFromBackup(arg1);
      } else {
        console.log('Usage: node blog-backup-system.js restore <backupId>');
      }
      break;
    case 'version':
      if (arg1 && arg2) {
        backupSystem.createPostVersion(arg1, arg2);
      } else {
        console.log('Usage: node blog-backup-system.js version <postId> <description>');
      }
      break;
    case 'list':
      const backups = backupSystem.listBackups();
      console.log('\n📚 Available Backups:');
      console.log('=====================');
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.backupId}`);
        console.log(`   📅 ${new Date(backup.timestamp).toLocaleString()}`);
        console.log(`   📊 Type: ${backup.type}`);
        console.log(`   📁 Size: ${(backup.size / 1024).toFixed(2)} KB`);
        console.log('');
      });
      break;
    case 'clean':
      const days = parseInt(arg1) || 30;
      backupSystem.cleanOldBackups(days);
      break;
    default:
      console.log('\n🤖 HFRP Blog Backup System\n');
      console.log('Available commands:');
      console.log('  node blog-backup-system.js full [--compress]    - Create full backup');
      console.log('  node blog-backup-system.js incremental          - Create incremental backup');
      console.log('  node blog-backup-system.js restore <backupId>   - Restore from backup');
      console.log('  node blog-backup-system.js version <id> <desc>  - Create post version');
      console.log('  node blog-backup-system.js list                 - List all backups');
      console.log('  node blog-backup-system.js clean [days]         - Clean old backups');
      console.log('');
  }
}

export default BlogBackupSystem;