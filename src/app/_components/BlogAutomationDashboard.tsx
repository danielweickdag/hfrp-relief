"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, BarChart3, Settings, Play, Pause, RefreshCw } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledFor?: string;
  author: string;
  category: string;
  views: number;
}

interface AutomationStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  lastPublished?: string;
  automationActive: boolean;
}

interface ScheduledTask {
  id: string;
  postId: string;
  postTitle: string;
  scheduledFor: string;
  status: 'pending' | 'completed' | 'failed';
  type: 'publish' | 'backup' | 'analytics';
}

const BlogAutomationDashboard: React.FC = () => {
  const [stats, setStats] = useState<AutomationStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    automationActive: false
  });
  
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [bulkAction, setBulkAction] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = () => {
    // Simulate loading automation data
    setStats({
      totalPosts: 15,
      publishedPosts: 12,
      draftPosts: 2,
      scheduledPosts: 1,
      lastPublished: '2024-01-15T10:30:00Z',
      automationActive: true
    });

    setScheduledTasks([
      {
        id: '1',
        postId: 'post-123',
        postTitle: 'Weekly Medical Clinic Update',
        scheduledFor: '2024-01-20T09:00:00Z',
        status: 'pending',
        type: 'publish'
      },
      {
        id: '2',
        postId: 'backup-task',
        postTitle: 'Daily Backup',
        scheduledFor: '2024-01-16T02:00:00Z',
        status: 'completed',
        type: 'backup'
      }
    ]);
  };

  const handleCreateAutomatedPost = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to create automated post
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`Creating automated post with template: ${selectedTemplate}`);
      // Here you would call the blog-automation.js script
      
      loadAutomationData();
    } catch (error) {
      console.error('Error creating automated post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePost = async (postId: string, publishDate: string) => {
    try {
      // Simulate API call to schedule post
      console.log(`Scheduling post ${postId} for ${publishDate}`);
      // Here you would call the blog-publisher.js script
      
      loadAutomationData();
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) return;
    
    setIsLoading(true);
    try {
      console.log(`Executing bulk action: ${bulkAction}`);
      // Here you would call the appropriate automation scripts
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      loadAutomationData();
    } catch (error) {
      console.error('Error executing bulk action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutomation = () => {
    setAutomationEnabled(!automationEnabled);
    // Here you would start/stop the automation daemon
    console.log(`Automation ${!automationEnabled ? 'enabled' : 'disabled'}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'publish': return <Calendar className="w-4 h-4" />;
      case 'backup': return <RefreshCw className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Automation Dashboard</h2>
          <p className="text-gray-600">Automate your blog management workflow</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleAutomation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              automationEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {automationEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {automationEnabled ? 'Pause Automation' : 'Start Automation'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduledPosts}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Automated Post Creation */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Create Automated Post</h4>
            <div className="flex gap-3">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="general">General Post</option>
                <option value="story">Impact Story</option>
                <option value="update">Program Update</option>
                <option value="medical">Medical Clinic Report</option>
              </select>
              <button
                onClick={handleCreateAutomatedPost}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Bulk Actions</h4>
            <div className="flex gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Action</option>
                <option value="backup">Create Backup</option>
                <option value="seo-optimize">Optimize SEO</option>
                <option value="generate-analytics">Generate Analytics</option>
                <option value="validate-content">Validate Content</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={isLoading || !bulkAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Processing...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Tasks */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Tasks</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {scheduledTasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No scheduled tasks</p>
            </div>
          ) : (
            scheduledTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{task.postTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {task.type.charAt(0).toUpperCase() + task.type.slice(1)} • {formatDate(task.scheduledFor)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    
                    {task.status === 'pending' && (
                      <button
                        onClick={() => console.log(`Executing task ${task.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Execute Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Automation Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Publishing Schedule</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">Auto-publish scheduled posts</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">Generate SEO metadata automatically</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">Create daily backups</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Content Validation</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                <span className="text-sm text-gray-700">Validate content before publishing</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                <span className="text-sm text-gray-700">Check for inappropriate content</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-700">Generate weekly analytics reports</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAutomationDashboard;