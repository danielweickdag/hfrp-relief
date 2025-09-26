import fs from 'fs';
import path from 'path';

class BlogSEOOptimizer {
  constructor() {
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
      'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their'
    ]);
  }

  // Extract keywords from content
  extractKeywords(content, maxKeywords = 10) {
    const words = content.toLowerCase()
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.stopWords.has(word));

    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  // Generate meta description
  generateMetaDescription(content, maxLength = 160) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let description = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (description.length + trimmed.length + 1 <= maxLength) {
        description += (description ? ' ' : '') + trimmed;
      } else {
        break;
      }
    }
    
    return description || content.substring(0, maxLength - 3) + '...';
  }

  // Generate SEO-friendly slug
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Calculate content readability score (simplified Flesch Reading Ease)
  calculateReadabilityScore(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const syllables = this.countSyllables(content);

    if (sentences === 0 || words === 0) return 0;

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Count syllables in text (simplified)
  countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;

    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;
      
      let syllables = word.match(/[aeiouy]+/g);
      syllables = syllables ? syllables.length : 1;
      
      if (word.endsWith('e')) syllables--;
      if (syllables === 0) syllables = 1;
      
      totalSyllables += syllables;
    });

    return totalSyllables;
  }

  // Generate Open Graph tags
  generateOpenGraphTags(post) {
    return {
      'og:title': post.title,
      'og:description': post.metaDescription,
      'og:type': 'article',
      'og:url': `https://hfrp-relief.org/blog/${post.slug}`,
      'og:image': post.featuredImage || 'https://hfrp-relief.org/default-blog-image.jpg',
      'og:site_name': 'HFRP Relief',
      'article:author': post.author,
      'article:published_time': post.publishDate,
      'article:modified_time': post.updatedAt,
      'article:section': post.category,
      'article:tag': post.tags.join(', ')
    };
  }

  // Generate Twitter Card tags
  generateTwitterCardTags(post) {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': post.title,
      'twitter:description': post.metaDescription,
      'twitter:image': post.featuredImage || 'https://hfrp-relief.org/default-blog-image.jpg',
      'twitter:site': '@HFRPRelief',
      'twitter:creator': `@${post.author.replace(/\s+/g, '')}`
    };
  }

  // Generate JSON-LD structured data
  generateStructuredData(post) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.title,
      'description': post.metaDescription,
      'image': post.featuredImage || 'https://hfrp-relief.org/default-blog-image.jpg',
      'author': {
        '@type': 'Person',
        'name': post.author
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'HFRP Relief',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://hfrp-relief.org/logo.png'
        }
      },
      'datePublished': post.publishDate,
      'dateModified': post.updatedAt,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `https://hfrp-relief.org/blog/${post.slug}`
      },
      'articleSection': post.category,
      'keywords': post.keywords.join(', '),
      'wordCount': post.content.split(/\s+/).length,
      'timeRequired': `PT${post.readTime}M`
    };
  }

  // Optimize post for SEO
  optimizePost(post) {
    const optimizedPost = { ...post };
    
    // Generate SEO elements if missing
    if (!optimizedPost.slug) {
      optimizedPost.slug = this.generateSlug(optimizedPost.title);
    }
    
    if (!optimizedPost.metaDescription) {
      optimizedPost.metaDescription = this.generateMetaDescription(optimizedPost.content);
    }
    
    if (!optimizedPost.keywords || optimizedPost.keywords.length === 0) {
      optimizedPost.keywords = this.extractKeywords(optimizedPost.content);
    }
    
    // Calculate readability
    optimizedPost.readabilityScore = this.calculateReadabilityScore(optimizedPost.content);
    
    // Generate meta tags
    optimizedPost.openGraphTags = this.generateOpenGraphTags(optimizedPost);
    optimizedPost.twitterCardTags = this.generateTwitterCardTags(optimizedPost);
    optimizedPost.structuredData = this.generateStructuredData(optimizedPost);
    
    // SEO recommendations
    optimizedPost.seoRecommendations = this.generateSEORecommendations(optimizedPost);
    
    return optimizedPost;
  }

  // Generate SEO recommendations
  generateSEORecommendations(post) {
    const recommendations = [];
    
    // Title length check
    if (post.title.length < 30) {
      recommendations.push('Consider making the title longer (30-60 characters) for better SEO');
    } else if (post.title.length > 60) {
      recommendations.push('Consider shortening the title (under 60 characters) to avoid truncation in search results');
    }
    
    // Meta description length check
    if (post.metaDescription.length < 120) {
      recommendations.push('Consider making the meta description longer (120-160 characters)');
    } else if (post.metaDescription.length > 160) {
      recommendations.push('Consider shortening the meta description (under 160 characters)');
    }
    
    // Content length check
    const wordCount = post.content.split(/\s+/).length;
    if (wordCount < 300) {
      recommendations.push('Consider adding more content (aim for 300+ words) for better SEO');
    }
    
    // Readability check
    if (post.readabilityScore < 60) {
      recommendations.push('Consider simplifying the content for better readability');
    }
    
    // Keywords check
    if (post.keywords.length < 3) {
      recommendations.push('Consider adding more relevant keywords');
    }
    
    // Image check
    if (!post.featuredImage) {
      recommendations.push('Consider adding a featured image for better social media sharing');
    }
    
    return recommendations;
  }

  // Batch optimize multiple posts
  async batchOptimize(postsDirectory = './data/blog-posts') {
    try {
      if (!fs.existsSync(postsDirectory)) {
        console.log('Posts directory not found');
        return;
      }

      const files = fs.readdirSync(postsDirectory).filter(file => file.endsWith('.json'));
      const optimizedPosts = [];
      
      for (const file of files) {
        const filePath = path.join(postsDirectory, file);
        const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const optimizedPost = this.optimizePost(post);
        
        // Save optimized post
        fs.writeFileSync(filePath, JSON.stringify(optimizedPost, null, 2));
        optimizedPosts.push(optimizedPost);
        
        console.log(`✅ Optimized: ${optimizedPost.title}`);
      }
      
      // Generate SEO report
      this.generateSEOReport(optimizedPosts);
      
      return optimizedPosts;
    } catch (error) {
      console.error('Error during batch optimization:', error);
      throw error;
    }
  }

  // Generate SEO report
  generateSEOReport(posts) {
    const report = {
      totalPosts: posts.length,
      averageReadabilityScore: posts.reduce((sum, post) => sum + post.readabilityScore, 0) / posts.length,
      postsWithGoodSEO: posts.filter(post => post.seoRecommendations.length === 0).length,
      commonIssues: {},
      generatedAt: new Date().toISOString()
    };
    
    // Count common issues
    posts.forEach(post => {
      post.seoRecommendations.forEach(rec => {
        report.commonIssues[rec] = (report.commonIssues[rec] || 0) + 1;
      });
    });
    
    // Save report
    const reportsDir = './data/seo-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, `seo-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 SEO Report Generated:');
    console.log(`Total Posts: ${report.totalPosts}`);
    console.log(`Average Readability Score: ${report.averageReadabilityScore.toFixed(1)}`);
    console.log(`Posts with Good SEO: ${report.postsWithGoodSEO}/${report.totalPosts}`);
    console.log(`Report saved to: ${reportPath}`);
    
    return report;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const seoOptimizer = new BlogSEOOptimizer();
  const command = process.argv[2];
  
  switch (command) {
    case 'optimize':
      const postsDir = process.argv[3] || './data/blog-posts';
      seoOptimizer.batchOptimize(postsDir);
      break;
      
    case 'analyze':
      const postFile = process.argv[3];
      if (!postFile) {
        console.log('Please provide a post file to analyze');
        break;
      }
      
      try {
        const post = JSON.parse(fs.readFileSync(postFile, 'utf8'));
        const optimized = seoOptimizer.optimizePost(post);
        console.log('\n📈 SEO Analysis:');
        console.log(`Title: ${optimized.title}`);
        console.log(`Readability Score: ${optimized.readabilityScore}`);
        console.log(`Keywords: ${optimized.keywords.join(', ')}`);
        console.log(`Recommendations: ${optimized.seoRecommendations.length}`);
        optimized.seoRecommendations.forEach(rec => console.log(`  - ${rec}`));
      } catch (error) {
        console.error('Error analyzing post:', error.message);
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node blog-seo-optimizer.js optimize [posts-directory]');
      console.log('  node blog-seo-optimizer.js analyze <post-file>');
  }
}

export default BlogSEOOptimizer;