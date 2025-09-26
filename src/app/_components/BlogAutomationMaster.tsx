'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import BlogAutomationSettings from './BlogAutomationSettings';
// Alert component not available - using custom notification div
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Play,
  Pause,
  Settings,
  BarChart3,
  Shield,
  Search,
  Archive,
  Clock,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface AutomationStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastRun: string;
  nextRun?: string;
  description: string;
}

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  averageReadTime: number;
  topPosts: Array<{
    title: string;
    views: number;
    engagement: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    views: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    views: number;
  }>;
}

interface ModerationSummary {
  totalChecked: number;
  approved: number;
  needsReview: number;
  rejected: number;
  averageScore: number;
  commonIssues: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const BlogAutomationMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [automationStatuses, setAutomationStatuses] = useState<AutomationStatus[]>([
    {
      id: 'post-creation',
      name: 'Automated Post Creation',
      status: 'running',
      lastRun: '2024-01-15T10:30:00Z',
      nextRun: '2024-01-16T10:30:00Z',
      description: 'Generates blog posts from templates and AI assistance'
    },
    {
      id: 'publishing',
      name: 'Content Publishing',
      status: 'running',
      lastRun: '2024-01-15T09:00:00Z',
      nextRun: '2024-01-15T18:00:00Z',
      description: 'Schedules and publishes approved content'
    },
    {
      id: 'backup',
      name: 'Content Backup',
      status: 'running',
      lastRun: '2024-01-15T02:00:00Z',
      nextRun: '2024-01-16T02:00:00Z',
      description: 'Creates backups and version control for all content'
    },
    {
      id: 'seo',
      name: 'SEO Optimization',
      status: 'running',
      lastRun: '2024-01-15T11:15:00Z',
      description: 'Optimizes content for search engines and generates meta tags'
    },
    {
      id: 'moderation',
      name: 'Content Moderation',
      status: 'running',
      lastRun: '2024-01-15T12:00:00Z',
      description: 'Validates content quality and checks for compliance'
    },
    {
      id: 'analytics',
      name: 'Analytics Tracking',
      status: 'running',
      lastRun: '2024-01-15T12:30:00Z',
      description: 'Tracks performance metrics and generates insights'
    }
  ]);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPosts: 45,
    totalViews: 12847,
    totalEngagement: 1523,
    averageReadTime: 185,
    topPosts: [
      { title: 'Community Relief Efforts Update', views: 1250, engagement: 89 },
      { title: 'Medical Aid Distribution', views: 980, engagement: 76 },
      { title: 'Volunteer Success Stories', views: 875, engagement: 65 },
      { title: 'Emergency Response Protocol', views: 720, engagement: 54 },
      { title: 'Fundraising Campaign Results', views: 650, engagement: 48 }
    ],
    categoryPerformance: [
      { category: 'Community', views: 4200, percentage: 33 },
      { category: 'Medical', views: 3100, percentage: 24 },
      { category: 'Emergency', views: 2800, percentage: 22 },
      { category: 'Fundraising', views: 1900, percentage: 15 },
      { category: 'General', views: 847, percentage: 6 }
    ],
    timeSeriesData: [
      { date: '2024-01-08', views: 145 },
      { date: '2024-01-09', views: 167 },
      { date: '2024-01-10', views: 189 },
      { date: '2024-01-11', views: 203 },
      { date: '2024-01-12', views: 178 },
      { date: '2024-01-13', views: 234 },
      { date: '2024-01-14', views: 267 },
      { date: '2024-01-15', views: 289 }
    ]
  });

  const [moderationSummary, setModerationSummary] = useState<ModerationSummary>({
    totalChecked: 45,
    approved: 38,
    needsReview: 5,
    rejected: 2,
    averageScore: 87.3,
    commonIssues: [
      'Missing alt text for images',
      'Title length optimization needed',
      'Content length below recommended minimum'
    ]
  });

  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleAutomation = (id: string) => {
    setAutomationStatuses(prev => 
      prev.map(automation => 
        automation.id === id 
          ? { 
              ...automation, 
              status: automation.status === 'running' ? 'stopped' : 'running',
              lastRun: new Date().toISOString()
            }
          : automation
      )
    );
  };

  const handleRunNow = async (id: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAutomationStatuses(prev => 
      prev.map(automation => 
        automation.id === id 
          ? { 
              ...automation, 
              lastRun: new Date().toISOString(),
              status: 'running'
            }
          : automation
      )
    );
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateEngagementRate = () => {
    return ((analyticsData.totalEngagement / analyticsData.totalViews) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Automation Center</h1>
          <p className="text-muted-foreground">
            Comprehensive automation and analytics for your blog content
          </p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  +3 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateEngagementRate()}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Read Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analyticsData.averageReadTime / 60)}m</div>
                <p className="text-xs text-muted-foreground">
                  +15s from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Automation Status</CardTitle>
                <CardDescription>Current status of all automation systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {automationStatuses.slice(0, 4).map((automation) => (
                    <div key={automation.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(automation.status)}
                        <span className="text-sm">{automation.name}</span>
                      </div>
                      <Badge className={getStatusColor(automation.status)}>
                        {automation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Quality</CardTitle>
                <CardDescription>Recent moderation results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approval Rate</span>
                    <span className="text-sm font-medium">
                      {Math.round((moderationSummary.approved / moderationSummary.totalChecked) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(moderationSummary.approved / moderationSummary.totalChecked) * 100} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{moderationSummary.approved}</div>
                      <div className="text-xs text-muted-foreground">Approved</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{moderationSummary.needsReview}</div>
                      <div className="text-xs text-muted-foreground">Review</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">{moderationSummary.rejected}</div>
                      <div className="text-xs text-muted-foreground">Rejected</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest automation and content activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm">SEO optimization completed for 3 posts</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">Content moderation check passed for "Community Update"</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Archive className="h-4 w-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm">Daily backup completed successfully</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm">Analytics report generated</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-4">
            {automationStatuses.map((automation) => (
              <Card key={automation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(automation.status)}
                      <CardTitle className="text-lg">{automation.name}</CardTitle>
                      <Badge className={getStatusColor(automation.status)}>
                        {automation.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(automation.id)}
                        disabled={isLoading}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAutomation(automation.id)}
                      >
                        {automation.status === 'running' ? (
                          <><Pause className="h-4 w-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="h-4 w-4 mr-1" /> Start</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{automation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Run:</span>
                      <div className="font-medium">{formatDate(automation.lastRun)}</div>
                    </div>
                    {automation.nextRun && (
                      <div>
                        <span className="text-muted-foreground">Next Run:</span>
                        <div className="font-medium">{formatDate(automation.nextRun)}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="views"
                    >
                      {analyticsData.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.topPosts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                  <Bar dataKey="engagement" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Summary</CardTitle>
                <CardDescription>Content quality and compliance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{moderationSummary.averageScore}</div>
                    <div className="text-sm text-muted-foreground">Average Quality Score</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{moderationSummary.approved}</div>
                      <div className="text-sm text-muted-foreground">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-yellow-600">{moderationSummary.needsReview}</div>
                      <div className="text-sm text-muted-foreground">Needs Review</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Issues</CardTitle>
                <CardDescription>Most frequent content issues detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {moderationSummary.commonIssues.map((issue, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-center gap-2 p-4">
              <Shield className="h-4 w-4" />
              <span>
                Content moderation is running automatically. Posts are checked for quality, 
                compliance, and accessibility before publication.
              </span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure automation schedules and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <BlogAutomationSettings />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogAutomationMaster;