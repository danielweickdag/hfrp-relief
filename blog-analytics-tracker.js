import fs from 'fs';
import path from 'path';

class BlogAnalyticsTracker {
  constructor() {
    this.analyticsDir = './data/analytics';
    this.metricsFile = path.join(this.analyticsDir, 'blog-metrics.json');
    this.viewsFile = path.join(this.analyticsDir, 'post-views.json');
    this.engagementFile = path.join(this.analyticsDir, 'engagement-data.json');
    
    this.ensureDirectoryExists();
  }

  // Ensure analytics directory exists
  ensureDirectoryExists() {
    if (!fs.existsSync(this.analyticsDir)) {
      fs.mkdirSync(this.analyticsDir, { recursive: true });
    }
  }

  // Initialize analytics data files
  initializeAnalytics() {
    const defaultMetrics = {
      totalPosts: 0,
      totalViews: 0,
      totalEngagement: 0,
      averageReadTime: 0,
      topCategories: {},
      topAuthors: {},
      monthlyStats: {},
      lastUpdated: new Date().toISOString()
    };

    const defaultViews = {
      posts: {},
      dailyViews: {},
      lastUpdated: new Date().toISOString()
    };

    const defaultEngagement = {
      posts: {},
      interactions: [],
      lastUpdated: new Date().toISOString()
    };

    if (!fs.existsSync(this.metricsFile)) {
      fs.writeFileSync(this.metricsFile, JSON.stringify(defaultMetrics, null, 2));
    }

    if (!fs.existsSync(this.viewsFile)) {
      fs.writeFileSync(this.viewsFile, JSON.stringify(defaultViews, null, 2));
    }

    if (!fs.existsSync(this.engagementFile)) {
      fs.writeFileSync(this.engagementFile, JSON.stringify(defaultEngagement, null, 2));
    }
  }

  // Load analytics data
  loadAnalyticsData(file) {
    try {
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error(`Error loading analytics data from ${file}:`, error);
      return null;
    }
  }

  // Save analytics data
  saveAnalyticsData(file, data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving analytics data to ${file}:`, error);
    }
  }

  // Track post view
  trackPostView(postId, postTitle, category, author, userAgent = '', referrer = '') {
    const viewsData = this.loadAnalyticsData(this.viewsFile) || { posts: {}, dailyViews: {} };
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize post data if not exists
    if (!viewsData.posts[postId]) {
      viewsData.posts[postId] = {
        title: postTitle,
        category: category,
        author: author,
        totalViews: 0,
        dailyViews: {},
        referrers: {},
        userAgents: {},
        firstViewed: new Date().toISOString(),
        lastViewed: new Date().toISOString()
      };
    }
    
    // Update view counts
    viewsData.posts[postId].totalViews++;
    viewsData.posts[postId].dailyViews[today] = (viewsData.posts[postId].dailyViews[today] || 0) + 1;
    viewsData.posts[postId].lastViewed = new Date().toISOString();
    
    // Track referrers
    if (referrer) {
      viewsData.posts[postId].referrers[referrer] = (viewsData.posts[postId].referrers[referrer] || 0) + 1;
    }
    
    // Track user agents (simplified)
    const simplifiedUA = this.simplifyUserAgent(userAgent);
    if (simplifiedUA) {
      viewsData.posts[postId].userAgents[simplifiedUA] = (viewsData.posts[postId].userAgents[simplifiedUA] || 0) + 1;
    }
    
    // Update daily totals
    viewsData.dailyViews[today] = (viewsData.dailyViews[today] || 0) + 1;
    
    this.saveAnalyticsData(this.viewsFile, viewsData);
    
    // Update overall metrics
    this.updateOverallMetrics();
  }

  // Simplify user agent for tracking
  simplifyUserAgent(userAgent) {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Mobile')) return 'Mobile';
    
    return 'Other';
  }

  // Track engagement (likes, shares, comments, time spent)
  trackEngagement(postId, engagementType, value = 1, metadata = {}) {
    const engagementData = this.loadAnalyticsData(this.engagementFile) || { posts: {}, interactions: [] };
    
    // Initialize post engagement if not exists
    if (!engagementData.posts[postId]) {
      engagementData.posts[postId] = {
        likes: 0,
        shares: 0,
        comments: 0,
        timeSpent: 0,
        bounceRate: 0,
        engagementScore: 0
      };
    }
    
    // Update engagement metrics
    switch (engagementType) {
      case 'like':
        engagementData.posts[postId].likes += value;
        break;
      case 'share':
        engagementData.posts[postId].shares += value;
        break;
      case 'comment':
        engagementData.posts[postId].comments += value;
        break;
      case 'time_spent':
        engagementData.posts[postId].timeSpent += value; // in seconds
        break;
      case 'bounce':
        engagementData.posts[postId].bounceRate = value; // percentage
        break;
    }
    
    // Calculate engagement score
    const post = engagementData.posts[postId];
    post.engagementScore = (post.likes * 1) + (post.shares * 3) + (post.comments * 2) + (post.timeSpent / 60);
    
    // Log interaction
    engagementData.interactions.push({
      postId,
      type: engagementType,
      value,
      metadata,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 1000 interactions to prevent file bloat
    if (engagementData.interactions.length > 1000) {
      engagementData.interactions = engagementData.interactions.slice(-1000);
    }
    
    this.saveAnalyticsData(this.engagementFile, engagementData);
    
    // Update overall metrics
    this.updateOverallMetrics();
  }

  // Update overall metrics
  updateOverallMetrics() {
    const viewsData = this.loadAnalyticsData(this.viewsFile);
    const engagementData = this.loadAnalyticsData(this.engagementFile);
    const metricsData = this.loadAnalyticsData(this.metricsFile) || {};
    
    if (!viewsData || !engagementData) return;
    
    // Calculate totals
    metricsData.totalPosts = Object.keys(viewsData.posts).length;
    metricsData.totalViews = Object.values(viewsData.posts).reduce((sum, post) => sum + post.totalViews, 0);
    metricsData.totalEngagement = Object.values(engagementData.posts).reduce((sum, post) => sum + post.engagementScore, 0);
    
    // Calculate average read time
    const totalTimeSpent = Object.values(engagementData.posts).reduce((sum, post) => sum + post.timeSpent, 0);
    metricsData.averageReadTime = metricsData.totalViews > 0 ? totalTimeSpent / metricsData.totalViews : 0;
    
    // Calculate top categories
    metricsData.topCategories = {};
    Object.values(viewsData.posts).forEach(post => {
      metricsData.topCategories[post.category] = (metricsData.topCategories[post.category] || 0) + post.totalViews;
    });
    
    // Calculate top authors
    metricsData.topAuthors = {};
    Object.values(viewsData.posts).forEach(post => {
      metricsData.topAuthors[post.author] = (metricsData.topAuthors[post.author] || 0) + post.totalViews;
    });
    
    // Calculate monthly stats
    metricsData.monthlyStats = this.calculateMonthlyStats(viewsData);
    
    this.saveAnalyticsData(this.metricsFile, metricsData);
  }

  // Calculate monthly statistics
  calculateMonthlyStats(viewsData) {
    const monthlyStats = {};
    
    Object.values(viewsData.posts).forEach(post => {
      Object.entries(post.dailyViews).forEach(([date, views]) => {
        const month = date.substring(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
          monthlyStats[month] = {
            views: 0,
            posts: new Set(),
            uniqueVisitors: 0
          };
        }
        monthlyStats[month].views += views;
        monthlyStats[month].posts.add(post.title);
      });
    });
    
    // Convert sets to counts
    Object.keys(monthlyStats).forEach(month => {
      monthlyStats[month].uniquePosts = monthlyStats[month].posts.size;
      delete monthlyStats[month].posts;
    });
    
    return monthlyStats;
  }

  // Generate comprehensive analytics report
  generateAnalyticsReport(timeframe = 'all') {
    const viewsData = this.loadAnalyticsData(this.viewsFile);
    const engagementData = this.loadAnalyticsData(this.engagementFile);
    const metricsData = this.loadAnalyticsData(this.metricsFile);
    
    if (!viewsData || !engagementData || !metricsData) {
      console.log('Analytics data not found. Please initialize analytics first.');
      return null;
    }
    
    const report = {
      summary: {
        totalPosts: metricsData.totalPosts,
        totalViews: metricsData.totalViews,
        totalEngagement: metricsData.totalEngagement,
        averageReadTime: Math.round(metricsData.averageReadTime),
        averageViewsPerPost: Math.round(metricsData.totalViews / metricsData.totalPosts) || 0
      },
      topPerformingPosts: this.getTopPerformingPosts(viewsData, engagementData, 10),
      categoryPerformance: this.getCategoryPerformance(metricsData.topCategories),
      authorPerformance: this.getAuthorPerformance(metricsData.topAuthors),
      engagementMetrics: this.getEngagementMetrics(engagementData),
      trafficSources: this.getTrafficSources(viewsData),
      deviceBreakdown: this.getDeviceBreakdown(viewsData),
      timeSeriesData: this.getTimeSeriesData(viewsData, timeframe),
      recommendations: this.generateRecommendations(viewsData, engagementData, metricsData),
      generatedAt: new Date().toISOString()
    };
    
    return report;
  }

  // Get top performing posts
  getTopPerformingPosts(viewsData, engagementData, limit = 10) {
    const posts = Object.entries(viewsData.posts).map(([id, post]) => {
      const engagement = engagementData.posts[id] || {};
      return {
        id,
        title: post.title,
        category: post.category,
        author: post.author,
        views: post.totalViews,
        engagementScore: engagement.engagementScore || 0,
        likes: engagement.likes || 0,
        shares: engagement.shares || 0,
        comments: engagement.comments || 0,
        averageTimeSpent: Math.round((engagement.timeSpent || 0) / post.totalViews) || 0
      };
    });
    
    return posts
      .sort((a, b) => (b.views + b.engagementScore) - (a.views + a.engagementScore))
      .slice(0, limit);
  }

  // Get category performance
  getCategoryPerformance(topCategories) {
    const total = Object.values(topCategories).reduce((sum, views) => sum + views, 0);
    
    return Object.entries(topCategories)
      .map(([category, views]) => ({
        category,
        views,
        percentage: Math.round((views / total) * 100)
      }))
      .sort((a, b) => b.views - a.views);
  }

  // Get author performance
  getAuthorPerformance(topAuthors) {
    const total = Object.values(topAuthors).reduce((sum, views) => sum + views, 0);
    
    return Object.entries(topAuthors)
      .map(([author, views]) => ({
        author,
        views,
        percentage: Math.round((views / total) * 100)
      }))
      .sort((a, b) => b.views - a.views);
  }

  // Get engagement metrics
  getEngagementMetrics(engagementData) {
    const posts = Object.values(engagementData.posts);
    
    return {
      totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
      totalShares: posts.reduce((sum, post) => sum + (post.shares || 0), 0),
      totalComments: posts.reduce((sum, post) => sum + (post.comments || 0), 0),
      averageEngagementScore: posts.length > 0 ? 
        Math.round(posts.reduce((sum, post) => sum + (post.engagementScore || 0), 0) / posts.length) : 0,
      averageBounceRate: posts.length > 0 ? 
        Math.round(posts.reduce((sum, post) => sum + (post.bounceRate || 0), 0) / posts.length) : 0
    };
  }

  // Get traffic sources
  getTrafficSources(viewsData) {
    const sources = {};
    
    Object.values(viewsData.posts).forEach(post => {
      Object.entries(post.referrers || {}).forEach(([referrer, count]) => {
        sources[referrer] = (sources[referrer] || 0) + count;
      });
    });
    
    const total = Object.values(sources).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(sources)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Get device breakdown
  getDeviceBreakdown(viewsData) {
    const devices = {};
    
    Object.values(viewsData.posts).forEach(post => {
      Object.entries(post.userAgents || {}).forEach(([device, count]) => {
        devices[device] = (devices[device] || 0) + count;
      });
    });
    
    const total = Object.values(devices).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(devices)
      .map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Get time series data
  getTimeSeriesData(viewsData, timeframe) {
    const timeSeriesData = {};
    
    Object.values(viewsData.posts).forEach(post => {
      Object.entries(post.dailyViews || {}).forEach(([date, views]) => {
        if (this.isWithinTimeframe(date, timeframe)) {
          timeSeriesData[date] = (timeSeriesData[date] || 0) + views;
        }
      });
    });
    
    return Object.entries(timeSeriesData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));
  }

  // Check if date is within timeframe
  isWithinTimeframe(date, timeframe) {
    if (timeframe === 'all') return true;
    
    const targetDate = new Date(date);
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        return (now - targetDate) <= (7 * 24 * 60 * 60 * 1000);
      case '30d':
        return (now - targetDate) <= (30 * 24 * 60 * 60 * 1000);
      case '90d':
        return (now - targetDate) <= (90 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  }

  // Generate recommendations
  generateRecommendations(viewsData, engagementData, metricsData) {
    const recommendations = [];
    
    // Analyze top categories
    const topCategory = Object.entries(metricsData.topCategories)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      recommendations.push(`Your "${topCategory[0]}" category performs best. Consider creating more content in this area.`);
    }
    
    // Analyze engagement
    const avgEngagement = Object.values(engagementData.posts)
      .reduce((sum, post) => sum + (post.engagementScore || 0), 0) / Object.keys(engagementData.posts).length;
    
    if (avgEngagement < 10) {
      recommendations.push('Low engagement detected. Consider adding more interactive elements and calls-to-action.');
    }
    
    // Analyze posting frequency
    const postsThisMonth = Object.values(viewsData.posts)
      .filter(post => {
        const postDate = new Date(post.firstViewed);
        const now = new Date();
        return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
      }).length;
    
    if (postsThisMonth < 4) {
      recommendations.push('Consider increasing posting frequency to at least 4 posts per month for better engagement.');
    }
    
    // Analyze read time
    if (metricsData.averageReadTime < 60) {
      recommendations.push('Average read time is low. Consider creating longer, more in-depth content.');
    }
    
    return recommendations;
  }

  // Save analytics report
  saveAnalyticsReport(report, filename = null) {
    const reportsDir = './data/analytics-reports';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportFilename = filename || `analytics-report-${Date.now()}.json`;
    const reportPath = path.join(reportsDir, reportFilename);
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Analytics report saved to: ${reportPath}`);
    return reportPath;
  }

  // Export data for external analysis
  exportData(format = 'json') {
    const viewsData = this.loadAnalyticsData(this.viewsFile);
    const engagementData = this.loadAnalyticsData(this.engagementFile);
    const metricsData = this.loadAnalyticsData(this.metricsFile);
    
    const exportData = {
      views: viewsData,
      engagement: engagementData,
      metrics: metricsData,
      exportedAt: new Date().toISOString()
    };
    
    const exportDir = './data/exports';
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const exportPath = path.join(exportDir, `blog-analytics-export-${Date.now()}.${format}`);
    
    if (format === 'json') {
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    } else if (format === 'csv') {
      // Simple CSV export for posts data
      const csvData = this.convertToCSV(viewsData, engagementData);
      fs.writeFileSync(exportPath, csvData);
    }
    
    console.log(`📤 Data exported to: ${exportPath}`);
    return exportPath;
  }

  // Convert data to CSV format
  convertToCSV(viewsData, engagementData) {
    const headers = ['Post ID', 'Title', 'Category', 'Author', 'Total Views', 'Likes', 'Shares', 'Comments', 'Engagement Score', 'First Viewed', 'Last Viewed'];
    const rows = [headers.join(',')];
    
    Object.entries(viewsData.posts).forEach(([id, post]) => {
      const engagement = engagementData.posts[id] || {};
      const row = [
        id,
        `"${post.title}"`,
        post.category,
        post.author,
        post.totalViews,
        engagement.likes || 0,
        engagement.shares || 0,
        engagement.comments || 0,
        engagement.engagementScore || 0,
        post.firstViewed,
        post.lastViewed
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const analytics = new BlogAnalyticsTracker();
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      analytics.initializeAnalytics();
      console.log('✅ Analytics initialized');
      break;
      
    case 'report':
      const timeframe = process.argv[3] || 'all';
      const report = analytics.generateAnalyticsReport(timeframe);
      if (report) {
        analytics.saveAnalyticsReport(report);
        console.log('\n📊 Analytics Report Summary:');
        console.log(`Total Posts: ${report.summary.totalPosts}`);
        console.log(`Total Views: ${report.summary.totalViews}`);
        console.log(`Average Views per Post: ${report.summary.averageViewsPerPost}`);
        console.log(`Average Read Time: ${report.summary.averageReadTime}s`);
      }
      break;
      
    case 'track-view':
      const postId = process.argv[3];
      const postTitle = process.argv[4] || 'Test Post';
      const category = process.argv[5] || 'general';
      const author = process.argv[6] || 'Test Author';
      
      if (!postId) {
        console.log('Please provide a post ID');
        break;
      }
      
      analytics.trackPostView(postId, postTitle, category, author);
      console.log(`✅ Tracked view for post: ${postTitle}`);
      break;
      
    case 'track-engagement':
      const engagementPostId = process.argv[3];
      const engagementType = process.argv[4];
      const value = parseInt(process.argv[5]) || 1;
      
      if (!engagementPostId || !engagementType) {
        console.log('Please provide post ID and engagement type (like, share, comment, time_spent)');
        break;
      }
      
      analytics.trackEngagement(engagementPostId, engagementType, value);
      console.log(`✅ Tracked ${engagementType} for post: ${engagementPostId}`);
      break;
      
    case 'export':
      const format = process.argv[3] || 'json';
      analytics.exportData(format);
      break;
      
    default:
      console.log('Usage:');
      console.log('  node blog-analytics-tracker.js init');
      console.log('  node blog-analytics-tracker.js report [timeframe]');
      console.log('  node blog-analytics-tracker.js track-view <post-id> [title] [category] [author]');
      console.log('  node blog-analytics-tracker.js track-engagement <post-id> <type> [value]');
      console.log('  node blog-analytics-tracker.js export [format]');
  }
}

export default BlogAnalyticsTracker;