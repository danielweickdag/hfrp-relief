import fs from 'fs';
import path from 'path';

class BlogContentModerator {
  constructor() {
    this.profanityWords = new Set([
      // Basic profanity filter - in production, use a comprehensive list
      'damn', 'hell', 'crap', 'stupid', 'idiot', 'hate'
    ]);
    
    this.sensitiveTopics = new Set([
      'suicide', 'self-harm', 'violence', 'discrimination', 'harassment',
      'illegal', 'drugs', 'weapons', 'extremism', 'terrorism'
    ]);
    
    this.requiredFields = [
      'title', 'content', 'author', 'category', 'status'
    ];
    
    this.validStatuses = ['draft', 'review', 'published', 'archived'];
    this.validCategories = [
      'general', 'story', 'update', 'medical', 'community', 'fundraising',
      'volunteer', 'education', 'emergency', 'success'
    ];
  }

  // Validate post structure and required fields
  validatePostStructure(post) {
    const issues = [];
    
    // Check required fields
    this.requiredFields.forEach(field => {
      if (!post[field] || (typeof post[field] === 'string' && post[field].trim() === '')) {
        issues.push(`Missing required field: ${field}`);
      }
    });
    
    // Validate field types and formats
    if (post.title && typeof post.title !== 'string') {
      issues.push('Title must be a string');
    }
    
    if (post.content && typeof post.content !== 'string') {
      issues.push('Content must be a string');
    }
    
    if (post.author && typeof post.author !== 'string') {
      issues.push('Author must be a string');
    }
    
    if (post.status && !this.validStatuses.includes(post.status)) {
      issues.push(`Invalid status. Must be one of: ${this.validStatuses.join(', ')}`);
    }
    
    if (post.category && !this.validCategories.includes(post.category)) {
      issues.push(`Invalid category. Must be one of: ${this.validCategories.join(', ')}`);
    }
    
    if (post.tags && !Array.isArray(post.tags)) {
      issues.push('Tags must be an array');
    }
    
    if (post.publishDate && isNaN(new Date(post.publishDate))) {
      issues.push('Invalid publish date format');
    }
    
    return issues;
  }

  // Check content quality
  validateContentQuality(post) {
    const issues = [];
    
    // Title validation
    if (post.title) {
      if (post.title.length < 10) {
        issues.push('Title is too short (minimum 10 characters)');
      }
      if (post.title.length > 100) {
        issues.push('Title is too long (maximum 100 characters)');
      }
      if (!/^[A-Z]/.test(post.title)) {
        issues.push('Title should start with a capital letter');
      }
    }
    
    // Content validation
    if (post.content) {
      const wordCount = post.content.split(/\s+/).filter(word => word.length > 0).length;
      
      if (wordCount < 50) {
        issues.push('Content is too short (minimum 50 words)');
      }
      
      if (wordCount > 5000) {
        issues.push('Content is too long (maximum 5000 words)');
      }
      
      // Check for excessive capitalization
      const capsRatio = (post.content.match(/[A-Z]/g) || []).length / post.content.length;
      if (capsRatio > 0.3) {
        issues.push('Excessive use of capital letters detected');
      }
      
      // Check for repeated characters
      if (/([a-zA-Z])\1{4,}/.test(post.content)) {
        issues.push('Excessive repeated characters detected');
      }
      
      // Check for excessive punctuation
      if (/[!?]{3,}/.test(post.content)) {
        issues.push('Excessive punctuation detected');
      }
    }
    
    // Author validation
    if (post.author) {
      if (post.author.length < 2) {
        issues.push('Author name is too short');
      }
      if (!/^[a-zA-Z\s]+$/.test(post.author)) {
        issues.push('Author name contains invalid characters');
      }
    }
    
    return issues;
  }

  // Check for inappropriate content
  checkInappropriateContent(post) {
    const issues = [];
    const content = (post.title + ' ' + post.content).toLowerCase();
    
    // Check for profanity
    const foundProfanity = [];
    this.profanityWords.forEach(word => {
      if (content.includes(word)) {
        foundProfanity.push(word);
      }
    });
    
    if (foundProfanity.length > 0) {
      issues.push(`Potential profanity detected: ${foundProfanity.join(', ')}`);
    }
    
    // Check for sensitive topics
    const foundSensitive = [];
    this.sensitiveTopics.forEach(topic => {
      if (content.includes(topic)) {
        foundSensitive.push(topic);
      }
    });
    
    if (foundSensitive.length > 0) {
      issues.push(`Sensitive topics detected: ${foundSensitive.join(', ')} - requires manual review`);
    }
    
    // Check for spam indicators
    const spamIndicators = [
      /click here/gi,
      /buy now/gi,
      /limited time/gi,
      /act now/gi,
      /free money/gi,
      /guaranteed/gi
    ];
    
    const foundSpam = [];
    spamIndicators.forEach(pattern => {
      if (pattern.test(content)) {
        foundSpam.push(pattern.source);
      }
    });
    
    if (foundSpam.length > 0) {
      issues.push('Potential spam content detected');
    }
    
    return issues;
  }

  // Check for plagiarism (basic duplicate content detection)
  checkForDuplicateContent(post, existingPosts = []) {
    const issues = [];
    
    if (!existingPosts.length) {
      return issues;
    }
    
    const currentContent = post.content.toLowerCase().replace(/[^a-z\s]/g, '');
    const currentWords = currentContent.split(/\s+/).filter(word => word.length > 3);
    
    existingPosts.forEach(existingPost => {
      if (existingPost.id === post.id) return; // Skip self
      
      const existingContent = existingPost.content.toLowerCase().replace(/[^a-z\s]/g, '');
      const existingWords = existingContent.split(/\s+/).filter(word => word.length > 3);
      
      // Calculate similarity
      const commonWords = currentWords.filter(word => existingWords.includes(word));
      const similarity = commonWords.length / Math.max(currentWords.length, existingWords.length);
      
      if (similarity > 0.7) {
        issues.push(`High similarity (${Math.round(similarity * 100)}%) with existing post: "${existingPost.title}"`);
      }
    });
    
    return issues;
  }

  // Check accessibility compliance
  checkAccessibility(post) {
    const issues = [];
    
    // Check for alt text in images (basic markdown image detection)
    const imageRegex = /!\[([^\]]*)\]\([^)]+\)/g;
    const images = post.content.match(imageRegex) || [];
    
    images.forEach(image => {
      const altText = image.match(/!\[([^\]]*)\]/)[1];
      if (!altText || altText.trim() === '') {
        issues.push('Image found without alt text - add descriptive alt text for accessibility');
      }
    });
    
    // Check for proper heading structure
    const headings = post.content.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length === 0 && post.content.split(/\s+/).length > 200) {
      issues.push('Long content without headings - consider adding headings for better structure');
    }
    
    // Check for link descriptions
    const linkRegex = /\[([^\]]+)\]\([^)]+\)/g;
    const links = post.content.match(linkRegex) || [];
    
    links.forEach(link => {
      const linkText = link.match(/\[([^\]]+)\]/)[1];
      if (linkText.toLowerCase().includes('click here') || linkText.toLowerCase().includes('read more')) {
        issues.push('Non-descriptive link text found - use descriptive link text for accessibility');
      }
    });
    
    return issues;
  }

  // Generate content score
  calculateContentScore(post, allIssues) {
    let score = 100;
    
    // Deduct points for different types of issues
    allIssues.forEach(issue => {
      if (issue.includes('required field')) {
        score -= 20;
      } else if (issue.includes('profanity') || issue.includes('sensitive')) {
        score -= 30;
      } else if (issue.includes('spam')) {
        score -= 25;
      } else if (issue.includes('similarity')) {
        score -= 15;
      } else if (issue.includes('accessibility')) {
        score -= 5;
      } else {
        score -= 10;
      }
    });
    
    return Math.max(0, score);
  }

  // Comprehensive moderation check
  moderatePost(post, existingPosts = []) {
    const moderationResult = {
      postId: post.id || 'unknown',
      title: post.title || 'Untitled',
      status: 'pending',
      score: 0,
      issues: {
        structure: [],
        quality: [],
        inappropriate: [],
        duplicate: [],
        accessibility: []
      },
      recommendations: [],
      requiresManualReview: false,
      approved: false,
      checkedAt: new Date().toISOString()
    };
    
    // Run all validation checks
    moderationResult.issues.structure = this.validatePostStructure(post);
    moderationResult.issues.quality = this.validateContentQuality(post);
    moderationResult.issues.inappropriate = this.checkInappropriateContent(post);
    moderationResult.issues.duplicate = this.checkForDuplicateContent(post, existingPosts);
    moderationResult.issues.accessibility = this.checkAccessibility(post);
    
    // Flatten all issues
    const allIssues = [
      ...moderationResult.issues.structure,
      ...moderationResult.issues.quality,
      ...moderationResult.issues.inappropriate,
      ...moderationResult.issues.duplicate,
      ...moderationResult.issues.accessibility
    ];
    
    // Calculate score
    moderationResult.score = this.calculateContentScore(post, allIssues);
    
    // Determine status and approval
    if (moderationResult.issues.inappropriate.length > 0 || 
        moderationResult.issues.structure.length > 0) {
      moderationResult.status = 'rejected';
      moderationResult.requiresManualReview = true;
    } else if (moderationResult.score >= 80) {
      moderationResult.status = 'approved';
      moderationResult.approved = true;
    } else if (moderationResult.score >= 60) {
      moderationResult.status = 'needs_improvement';
      moderationResult.requiresManualReview = true;
    } else {
      moderationResult.status = 'rejected';
      moderationResult.requiresManualReview = true;
    }
    
    // Generate recommendations
    moderationResult.recommendations = this.generateRecommendations(moderationResult);
    
    return moderationResult;
  }

  // Generate improvement recommendations
  generateRecommendations(moderationResult) {
    const recommendations = [];
    
    if (moderationResult.issues.structure.length > 0) {
      recommendations.push('Fix structural issues before resubmitting');
    }
    
    if (moderationResult.issues.quality.length > 0) {
      recommendations.push('Improve content quality and formatting');
    }
    
    if (moderationResult.issues.inappropriate.length > 0) {
      recommendations.push('Remove inappropriate content and language');
    }
    
    if (moderationResult.issues.duplicate.length > 0) {
      recommendations.push('Ensure content is original and not duplicated');
    }
    
    if (moderationResult.issues.accessibility.length > 0) {
      recommendations.push('Improve accessibility by adding alt text and descriptive links');
    }
    
    if (moderationResult.score < 80) {
      recommendations.push('Consider expanding content and improving overall quality');
    }
    
    return recommendations;
  }

  // Batch moderate multiple posts
  async batchModerate(postsDirectory = './data/blog-posts') {
    try {
      if (!fs.existsSync(postsDirectory)) {
        console.log('Posts directory not found');
        return;
      }

      const files = fs.readdirSync(postsDirectory).filter(file => file.endsWith('.json'));
      const posts = [];
      const moderationResults = [];
      
      // Load all posts first
      files.forEach(file => {
        const filePath = path.join(postsDirectory, file);
        const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        posts.push(post);
      });
      
      // Moderate each post
      posts.forEach(post => {
        const result = this.moderatePost(post, posts);
        moderationResults.push(result);
        
        console.log(`📝 Moderated: ${result.title} - Status: ${result.status} (Score: ${result.score})`);
      });
      
      // Save moderation report
      this.saveModerationReport(moderationResults);
      
      return moderationResults;
    } catch (error) {
      console.error('Error during batch moderation:', error);
      throw error;
    }
  }

  // Save moderation report
  saveModerationReport(results) {
    const report = {
      totalPosts: results.length,
      approved: results.filter(r => r.approved).length,
      needsReview: results.filter(r => r.requiresManualReview).length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      commonIssues: {},
      results: results,
      generatedAt: new Date().toISOString()
    };
    
    // Count common issues
    results.forEach(result => {
      Object.values(result.issues).flat().forEach(issue => {
        report.commonIssues[issue] = (report.commonIssues[issue] || 0) + 1;
      });
    });
    
    // Save report
    const reportsDir = './data/moderation-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, `moderation-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🛡️ Moderation Report Generated:');
    console.log(`Total Posts: ${report.totalPosts}`);
    console.log(`Approved: ${report.approved}`);
    console.log(`Needs Review: ${report.needsReview}`);
    console.log(`Average Score: ${report.averageScore.toFixed(1)}`);
    console.log(`Report saved to: ${reportPath}`);
    
    return report;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const moderator = new BlogContentModerator();
  const command = process.argv[2];
  
  switch (command) {
    case 'moderate':
      const postsDir = process.argv[3] || './data/blog-posts';
      moderator.batchModerate(postsDir);
      break;
      
    case 'check':
      const postFile = process.argv[3];
      if (!postFile) {
        console.log('Please provide a post file to check');
        break;
      }
      
      try {
        const post = JSON.parse(fs.readFileSync(postFile, 'utf8'));
        const result = moderator.moderatePost(post);
        console.log('\n🛡️ Moderation Result:');
        console.log(`Title: ${result.title}`);
        console.log(`Status: ${result.status}`);
        console.log(`Score: ${result.score}`);
        console.log(`Requires Manual Review: ${result.requiresManualReview}`);
        
        if (Object.values(result.issues).flat().length > 0) {
          console.log('\nIssues Found:');
          Object.entries(result.issues).forEach(([category, issues]) => {
            if (issues.length > 0) {
              console.log(`  ${category}:`);
              issues.forEach(issue => console.log(`    - ${issue}`));
            }
          });
        }
        
        if (result.recommendations.length > 0) {
          console.log('\nRecommendations:');
          result.recommendations.forEach(rec => console.log(`  - ${rec}`));
        }
      } catch (error) {
        console.error('Error checking post:', error.message);
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node blog-content-moderator.js moderate [posts-directory]');
      console.log('  node blog-content-moderator.js check <post-file>');
  }
}

export default BlogContentModerator;