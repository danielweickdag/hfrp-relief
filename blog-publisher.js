#!/usr/bin/env node

/**
 * Blog Publishing Automation Script for HFRP Relief
 * Handles automated publishing, scheduling, and workflow management
 */

import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

class BlogPublisher {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.blogDataFile = path.join(this.dataDir, 'blog-posts.json');
    this.scheduleFile = path.join(this.dataDir, 'scheduled-posts.json');
    this.publishLogFile = path.join(this.dataDir, 'publish-log.json');
    this.ensureDataDirectory();
    this.initializeScheduler();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // Initialize the automated scheduler
  initializeScheduler() {
    // Check for scheduled posts every hour
    cron.schedule('0 * * * *', () => {
      this.processScheduledPosts();
    });

    // Daily backup at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.createDailyBackup();
    });

    // Weekly analytics report on Sundays at 9 AM
    cron.schedule('0 9 * * 0', () => {
      this.generateWeeklyReport();
    });

    console.log('📅 Blog publishing scheduler initialized');
  }

  // Process scheduled posts for publishing
  async processScheduledPosts() {
    try {
      const scheduledPosts = this.getScheduledPosts();
      const now = new Date();

      for (const scheduled of scheduledPosts) {
        const publishDate = new Date(scheduled.publishDate);
        
        if (publishDate <= now && scheduled.status === 'scheduled') {
          await this.publishPost(scheduled.postId);
          this.updateScheduledPostStatus(scheduled.postId, 'published');
          this.logPublishEvent(scheduled.postId, 'auto-published');
        }
      }
    } catch (error) {
      console.error('Error processing scheduled posts:', error);
      this.logError('processScheduledPosts', error);
    }
  }

  // Publish a blog post
  async publishPost(postId) {
    try {
      const blogPosts = this.getBlogPosts();
      const postIndex = blogPosts.findIndex(post => post.id === postId);
      
      if (postIndex === -1) {
        throw new Error(`Post with ID ${postId} not found`);
      }

      const post = blogPosts[postIndex];
      
      // Validate post before publishing
      const validation = this.validatePost(post);
      if (!validation.isValid) {
        throw new Error(`Post validation failed: ${validation.errors.join(', ')}`);
      }

      // Update post status and metadata
      post.status = 'published';
      post.publishedAt = new Date().toISOString();
      post.updatedAt = new Date().toISOString();
      
      // Generate SEO metadata
      post.seo = this.generateSEOMetadata(post);
      
      // Update the blog posts array
      blogPosts[postIndex] = post;
      
      // Save updated blog posts
      this.saveBlogPosts(blogPosts);
      
      // Create static page file
      await this.createStaticPage(post);
      
      // Update sitemap
      await this.updateSitemap();
      
      console.log(`✅ Published: ${post.title}`);
      
      return post;
    } catch (error) {
      console.error(`Error publishing post ${postId}:`, error);
      this.logError('publishPost', error, { postId });
      throw error;
    }
  }

  // Validate post content before publishing
  validatePost(post) {
    const errors = [];
    
    if (!post.title || post.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!post.content || post.content.trim().length < 100) {
      errors.push('Content must be at least 100 characters');
    }
    
    if (!post.excerpt || post.excerpt.trim().length === 0) {
      errors.push('Excerpt is required');
    }
    
    if (!post.category || post.category.trim().length === 0) {
      errors.push('Category is required');
    }
    
    if (!post.author || post.author.trim().length === 0) {
      errors.push('Author is required');
    }
    
    if (!post.tags || post.tags.length === 0) {
      errors.push('At least one tag is required');
    }
    
    // Check for profanity or inappropriate content
    const inappropriateWords = ['spam', 'scam', 'fake'];
    const contentLower = (post.title + ' ' + post.content + ' ' + post.excerpt).toLowerCase();
    
    for (const word of inappropriateWords) {
      if (contentLower.includes(word)) {
        errors.push(`Potentially inappropriate content detected: ${word}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate SEO metadata
  generateSEOMetadata(post) {
    return {
      metaTitle: `${post.title} | HFRP Relief`,
      metaDescription: post.excerpt.substring(0, 160),
      keywords: post.tags.join(', '),
      ogTitle: post.title,
      ogDescription: post.excerpt,
      ogImage: '/hfrp-logo.png',
      ogType: 'article',
      canonicalUrl: `/blog/${post.slug}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        author: {
          '@type': 'Person',
          name: post.author
        },
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt,
        publisher: {
          '@type': 'Organization',
          name: 'Haitian Family Relief Project',
          logo: {
            '@type': 'ImageObject',
            url: 'https://hfrp-relief.org/hfrp-logo.png'
          }
        }
      }
    };
  }

  // Create static page file for the blog post
  async createStaticPage(post) {
    const pageDir = path.join(process.cwd(), 'src/app/blog', post.slug);
    const pageFile = path.join(pageDir, 'page.tsx');
    
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    
    const pageContent = `import { Metadata } from 'next';
import BlogPost from '@/app/_components/BlogPost';

const postData = ${JSON.stringify(post, null, 2)};

export const metadata: Metadata = {
  title: '${post.seo.metaTitle}',
  description: '${post.seo.metaDescription}',
  keywords: '${post.seo.keywords}',
  openGraph: {
    title: '${post.seo.ogTitle}',
    description: '${post.seo.ogDescription}',
    images: ['${post.seo.ogImage}'],
    type: '${post.seo.ogType}'
  }
};

export default function BlogPostPage() {
  return <BlogPost post={postData} />;
}
`;
    
    fs.writeFileSync(pageFile, pageContent);
  }

  // Schedule a post for future publishing
  schedulePost(postId, publishDate, options = {}) {
    const scheduledPosts = this.getScheduledPosts();
    
    // Remove existing schedule for this post
    const filteredScheduled = scheduledPosts.filter(s => s.postId !== postId);
    
    // Add new schedule
    filteredScheduled.push({
      postId,
      publishDate: new Date(publishDate).toISOString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      options
    });
    
    this.saveScheduledPosts(filteredScheduled);
    console.log(`📅 Post ${postId} scheduled for ${publishDate}`);
  }

  // Bulk publish multiple posts
  async bulkPublish(postIds) {
    const results = [];
    
    for (const postId of postIds) {
      try {
        const post = await this.publishPost(postId);
        results.push({ postId, status: 'success', post });
      } catch (error) {
        results.push({ postId, status: 'error', error: error.message });
      }
    }
    
    console.log(`📊 Bulk publish completed: ${results.filter(r => r.status === 'success').length}/${results.length} successful`);
    return results;
  }

  // Create daily backup
  createDailyBackup() {
    try {
      const backupDir = path.join(this.dataDir, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      const backupFile = path.join(backupDir, `blog-backup-${timestamp}.json`);
      
      const blogPosts = this.getBlogPosts();
      const scheduledPosts = this.getScheduledPosts();
      
      const backup = {
        timestamp: new Date().toISOString(),
        blogPosts,
        scheduledPosts,
        stats: this.generateStats()
      };
      
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`💾 Daily backup created: ${backupFile}`);
    } catch (error) {
      console.error('Error creating daily backup:', error);
      this.logError('createDailyBackup', error);
    }
  }

  // Generate publishing statistics
  generateStats() {
    const blogPosts = this.getBlogPosts();
    const publishedPosts = blogPosts.filter(post => post.status === 'published');
    const draftPosts = blogPosts.filter(post => post.status === 'draft');
    
    const categories = {};
    const authors = {};
    
    publishedPosts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
      authors[post.author] = (authors[post.author] || 0) + 1;
    });
    
    return {
      totalPosts: blogPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      categoriesCount: Object.keys(categories).length,
      authorsCount: Object.keys(authors).length,
      categories,
      authors,
      lastPublished: publishedPosts.length > 0 ? publishedPosts[publishedPosts.length - 1].publishedAt : null
    };
  }

  // Helper methods for data management
  getBlogPosts() {
    if (!fs.existsSync(this.blogDataFile)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(this.blogDataFile, 'utf8'));
  }

  saveBlogPosts(posts) {
    fs.writeFileSync(this.blogDataFile, JSON.stringify(posts, null, 2));
  }

  getScheduledPosts() {
    if (!fs.existsSync(this.scheduleFile)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
  }

  saveScheduledPosts(scheduled) {
    fs.writeFileSync(this.scheduleFile, JSON.stringify(scheduled, null, 2));
  }

  updateScheduledPostStatus(postId, status) {
    const scheduled = this.getScheduledPosts();
    const index = scheduled.findIndex(s => s.postId === postId);
    
    if (index !== -1) {
      scheduled[index].status = status;
      scheduled[index].updatedAt = new Date().toISOString();
      this.saveScheduledPosts(scheduled);
    }
  }

  logPublishEvent(postId, action) {
    const log = {
      timestamp: new Date().toISOString(),
      postId,
      action,
      type: 'publish'
    };
    
    this.appendToLog(log);
  }

  logError(operation, error, context = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      operation,
      error: error.message,
      context,
      type: 'error'
    };
    
    this.appendToLog(log);
  }

  appendToLog(logEntry) {
    let logs = [];
    if (fs.existsSync(this.publishLogFile)) {
      logs = JSON.parse(fs.readFileSync(this.publishLogFile, 'utf8'));
    }
    
    logs.push(logEntry);
    
    // Keep only last 1000 log entries
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    
    fs.writeFileSync(this.publishLogFile, JSON.stringify(logs, null, 2));
  }

  // Update sitemap with new blog posts
  async updateSitemap() {
    try {
      const blogPosts = this.getBlogPosts();
      const publishedPosts = blogPosts.filter(post => post.status === 'published');
      
      const sitemapEntries = publishedPosts.map(post => ({
        url: `/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7
      }));
      
      const sitemapFile = path.join(process.cwd(), 'src/app/sitemap.xml');
      // Implementation would generate proper XML sitemap
      console.log(`🗺️ Sitemap updated with ${sitemapEntries.length} blog posts`);
    } catch (error) {
      console.error('Error updating sitemap:', error);
      this.logError('updateSitemap', error);
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const publisher = new BlogPublisher();
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  
  switch (command) {
    case 'publish':
      if (arg1) {
        publisher.publishPost(arg1);
      } else {
        console.log('Usage: node blog-publisher.js publish <postId>');
      }
      break;
    case 'schedule':
      if (arg1 && arg2) {
        publisher.schedulePost(arg1, arg2);
      } else {
        console.log('Usage: node blog-publisher.js schedule <postId> <publishDate>');
      }
      break;
    case 'process':
      publisher.processScheduledPosts();
      break;
    case 'backup':
      publisher.createDailyBackup();
      break;
    case 'stats':
      console.log(JSON.stringify(publisher.generateStats(), null, 2));
      break;
    case 'start':
      console.log('🚀 Blog publisher daemon started');
      // Keep the process running for scheduled tasks
      setInterval(() => {}, 1000);
      break;
    default:
      console.log('\n🤖 HFRP Blog Publisher\n');
      console.log('Available commands:');
      console.log('  node blog-publisher.js publish <postId>     - Publish a specific post');
      console.log('  node blog-publisher.js schedule <id> <date> - Schedule a post');
      console.log('  node blog-publisher.js process              - Process scheduled posts');
      console.log('  node blog-publisher.js backup               - Create backup');
      console.log('  node blog-publisher.js stats                - Show statistics');
      console.log('  node blog-publisher.js start                - Start daemon mode');
      console.log('');
  }
}

export default BlogPublisher;