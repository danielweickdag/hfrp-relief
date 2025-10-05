#!/usr/bin/env node

/**
 * Blog Automation Script for HFRP Relief
 * Automates blog post creation, publishing, and management tasks
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

class BlogAutomation {
  constructor() {
    this.blogDir = path.join(__dirname, 'src/app/blog');
    this.dataDir = path.join(__dirname, 'data');
    this.templatesDir = path.join(__dirname, 'blog-templates');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.blogDir, this.dataDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Generate blog post templates
  generateTemplate(type = 'general') {
    const templates = {
      general: {
        title: 'New Blog Post Title',
        excerpt: 'Brief description of the blog post content...',
        content: `# New Blog Post\n\nWrite your content here...\n\n## Key Points\n\n- Point 1\n- Point 2\n- Point 3\n\n## Conclusion\n\nSummarize your main message here.`,
        category: 'Updates',
        tags: ['news', 'updates'],
        author: 'HFRP Team',
        status: 'draft'
      },
      story: {
        title: 'Impact Story: [Title]',
        excerpt: 'A heartwarming story about our impact in the community...',
        content: `# Impact Story: [Title]\n\n## Background\n\nProvide context about the situation...\n\n## Our Intervention\n\nDescribe what HFRP did to help...\n\n## The Impact\n\nExplain the positive outcomes...\n\n## Looking Forward\n\nShare future plans or how others can help...`,
        category: 'Stories',
        tags: ['impact', 'stories', 'community'],
        author: 'HFRP Team',
        status: 'draft'
      },
      update: {
        title: 'Program Update: [Program Name]',
        excerpt: 'Latest updates on our ongoing programs and initiatives...',
        content: `# Program Update: [Program Name]\n\n## Recent Activities\n\nList recent program activities...\n\n## Achievements\n\n- Achievement 1\n- Achievement 2\n- Achievement 3\n\n## Upcoming Plans\n\nDescribe future program plans...\n\n## How You Can Help\n\nWays supporters can contribute...`,
        category: 'Updates',
        tags: ['programs', 'updates'],
        author: 'HFRP Team',
        status: 'draft'
      },
      medical: {
        title: 'Medical Clinic Report: [Date]',
        excerpt: 'Summary of our latest medical clinic activities and impact...',
        content: `# Medical Clinic Report: [Date]\n\n## Clinic Overview\n\n- **Date**: [Date]\n- **Location**: [Location]\n- **Families Served**: [Number]\n- **Medical Staff**: [Number]\n\n## Services Provided\n\n- General consultations\n- Vaccinations\n- Health education\n- Medication distribution\n\n## Impact Statistics\n\n- Total patients: [Number]\n- Children treated: [Number]\n- Adults treated: [Number]\n- Medications distributed: [Number]\n\n## Success Stories\n\nShare 1-2 brief success stories...\n\n## Next Clinic\n\nInformation about the next scheduled clinic...`,
        category: 'Healthcare',
        tags: ['medical', 'healthcare', 'clinic'],
        author: 'Medical Team',
        status: 'draft'
      }
    };

    return templates[type] || templates.general;
  }

  // Create a new blog post
  async createBlogPost(options = {}) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      console.log('\n🚀 Blog Post Creation Wizard\n');
      
      const type = options.type || await question('Post type (general/story/update/medical): ') || 'general';
      const template = this.generateTemplate(type);
      
      const title = options.title || await question(`Title (${template.title}): `) || template.title;
      const excerpt = options.excerpt || await question(`Excerpt (${template.excerpt}): `) || template.excerpt;
      const category = options.category || await question(`Category (${template.category}): `) || template.category;
      const author = options.author || await question(`Author (${template.author}): `) || template.author;
      
      const slug = this.generateSlug(title);
      const date = new Date().toISOString().split('T')[0];
      
      const blogPost = {
        id: Date.now().toString(),
        title,
        slug,
        excerpt,
        content: template.content,
        category,
        tags: template.tags,
        author,
        date,
        status: 'draft',
        views: 0,
        readTime: this.calculateReadTime(template.content),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to data file
      await this.saveBlogPost(blogPost);
      
      console.log(`\n✅ Blog post created successfully!`);
      console.log(`📝 Title: ${title}`);
      console.log(`🔗 Slug: ${slug}`);
      console.log(`📁 Category: ${category}`);
      console.log(`👤 Author: ${author}`);
      console.log(`📊 Status: draft`);
      
      rl.close();
      return blogPost;
    } catch (error) {
      console.error('Error creating blog post:', error);
      rl.close();
      throw error;
    }
  }

  // Generate URL-friendly slug
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Calculate estimated read time
  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }

  // Save blog post to data file
  async saveBlogPost(blogPost) {
    const blogDataFile = path.join(this.dataDir, 'blog-posts.json');
    
    let blogPosts = [];
    if (fs.existsSync(blogDataFile)) {
      const data = fs.readFileSync(blogDataFile, 'utf8');
      blogPosts = JSON.parse(data);
    }
    
    blogPosts.push(blogPost);
    fs.writeFileSync(blogDataFile, JSON.stringify(blogPosts, null, 2));
    
    // Also save individual post file
    const postFile = path.join(this.templatesDir, `${blogPost.slug}.json`);
    fs.writeFileSync(postFile, JSON.stringify(blogPost, null, 2));
  }

  // Bulk create posts from CSV
  async bulkCreateFromCSV(csvFile) {
    console.log(`📊 Processing bulk creation from ${csvFile}...`);
    // Implementation for CSV processing
    // This would parse CSV and create multiple posts
  }

  // Auto-generate SEO metadata
  generateSEOMetadata(blogPost) {
    return {
      metaTitle: `${blogPost.title} | HFRP Relief`,
      metaDescription: blogPost.excerpt.substring(0, 160),
      keywords: blogPost.tags.join(', '),
      ogTitle: blogPost.title,
      ogDescription: blogPost.excerpt,
      ogImage: '/hfrp-logo.png',
      canonicalUrl: `/blog/${blogPost.slug}`
    };
  }

  // Schedule post publishing
  schedulePost(postId, publishDate) {
    const scheduleFile = path.join(this.dataDir, 'scheduled-posts.json');
    
    let scheduled = [];
    if (fs.existsSync(scheduleFile)) {
      scheduled = JSON.parse(fs.readFileSync(scheduleFile, 'utf8'));
    }
    
    scheduled.push({
      postId,
      publishDate,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    });
    
    fs.writeFileSync(scheduleFile, JSON.stringify(scheduled, null, 2));
    console.log(`📅 Post ${postId} scheduled for ${publishDate}`);
  }

  // List all blog posts
  listPosts() {
    const blogDataFile = path.join(this.dataDir, 'blog-posts.json');
    
    if (!fs.existsSync(blogDataFile)) {
      console.log('📝 No blog posts found.');
      return [];
    }
    
    const blogPosts = JSON.parse(fs.readFileSync(blogDataFile, 'utf8'));
    
    console.log('\n📚 Blog Posts:');
    console.log('================');
    
    blogPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   📁 ${post.category} | 👤 ${post.author} | 📊 ${post.status}`);
      console.log(`   🔗 /blog/${post.slug}`);
      console.log('');
    });
    
    return blogPosts;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new BlogAutomation();
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      automation.createBlogPost();
      break;
    case 'list':
      automation.listPosts();
      break;
    case 'template':
      const type = process.argv[3] || 'general';
      console.log(JSON.stringify(automation.generateTemplate(type), null, 2));
      break;
    default:
      console.log('\n🤖 HFRP Blog Automation Tool\n');
      console.log('Available commands:');
      console.log('  node blog-automation.js create    - Create a new blog post');
      console.log('  node blog-automation.js list      - List all blog posts');
      console.log('  node blog-automation.js template  - Show template structure');
      console.log('');
  }
}

export default BlogAutomation;