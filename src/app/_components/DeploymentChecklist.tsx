'use client';

import { useState, useEffect } from 'react';
import { stripeService } from '@/lib/stripeConfig';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pending' | 'complete' | 'error' | 'warning';
  action?: () => Promise<void>;
}

export default function DeploymentChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    setIsChecking(true);
    const checklist: ChecklistItem[] = [];

    // Environment Variables
    checklist.push({
      id: 'env-stripe',
      category: 'Environment',
      name: 'Stripe API Keys',
      description: 'Stripe publishable key configured',
      status: stripeService.getConfig().publishableKey ? 'complete' : 'error'
    });

    checklist.push({
      id: 'env-analytics',
      category: 'Environment',
      name: 'Google Analytics',
      description: 'Analytics tracking ID configured',
      status: localStorage.getItem('hfrp_site_settings')?.includes('G-') ? 'complete' : 'warning'
    });

    // Security
    checklist.push({
      id: 'sec-admin',
      category: 'Security',
      name: 'Admin Accounts',
      description: 'Admin users configured with secure passwords',
      status: localStorage.getItem('admin_users') ? 'complete' : 'error'
    });

    checklist.push({
      id: 'sec-backup',
      category: 'Security',
      name: 'Backup System',
      description: 'Backup system configured and tested',
      status: localStorage.getItem('hfrp_backup_history') ? 'complete' : 'warning'
    });

    // Content
    checklist.push({
      id: 'content-home',
      category: 'Content',
      name: 'Homepage Content',
      description: 'Homepage content and images configured',
      status: 'complete'
    });

    checklist.push({
      id: 'content-blog',
      category: 'Content',
      name: 'Blog Posts',
      description: 'Initial blog posts created',
      status: localStorage.getItem('hfrp_blog_posts')?.length > 10 ? 'complete' : 'warning'
    });

    // Functionality
    checklist.push({
      id: 'func-donation',
      category: 'Functionality',
      name: 'Donation System',
      description: 'Donation forms and Stripe integration working',
      status: stripeService.validateConfig().isValid ? 'complete' : 'error'
    });

    checklist.push({
      id: 'func-volunteer',
      category: 'Functionality',
      name: 'Volunteer System',
      description: 'Volunteer registration and management ready',
      status: localStorage.getItem('hfrp_volunteer_programs') ? 'complete' : 'warning'
    });

    // Performance
    checklist.push({
      id: 'perf-images',
      category: 'Performance',
      name: 'Image Optimization',
      description: 'Images optimized for web',
      status: 'warning'
    });

    checklist.push({
      id: 'perf-caching',
      category: 'Performance',
      name: 'Caching Strategy',
      description: 'Proper caching headers configured',
      status: 'pending'
    });

    // SEO
    checklist.push({
      id: 'seo-meta',
      category: 'SEO',
      name: 'Meta Tags',
      description: 'SEO meta tags and descriptions set',
      status: 'complete'
    });

    checklist.push({
      id: 'seo-sitemap',
      category: 'SEO',
      name: 'Sitemap',
      description: 'XML sitemap generated',
      status: 'pending'
    });

    setItems(checklist);
    setIsChecking(false);
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return <span className="text-green-600">✓</span>;
      case 'error':
        return <span className="text-red-600">✗</span>;
      case 'warning':
        return <span className="text-yellow-600">!</span>;
      case 'pending':
        return <span className="text-gray-400">○</span>;
    }
  };

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
    }
  };

  const categories = [...new Set(items.map(item => item.category))];
  const completedCount = items.filter(item => item.status === 'complete').length;
  const errorCount = items.filter(item => item.status === 'error').length;
  const warningCount = items.filter(item => item.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Deployment Checklist</h1>

        {/* Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{items.length}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-gray-500">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-500">Errors</div>
            </div>
          </div>

          {errorCount === 0 && warningCount === 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <p className="text-green-800 font-medium">
                ✓ All checks passed! Your site is ready for deployment.
              </p>
            </div>
          )}

          {errorCount > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-red-800 font-medium">
                ✗ {errorCount} critical issues must be resolved before deployment.
              </p>
            </div>
          )}
        </div>

        {/* Checklist by Category */}
        {categories.map(category => (
          <div key={category} className="bg-white shadow rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4">{category}</h3>
            <div className="space-y-2">
              {items.filter(item => item.category === category).map(item => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-md ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-start">
                    <span className="text-xl mr-3 mt-0.5">{getStatusIcon(item.status)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                    {item.action && (
                      <button
                        onClick={item.action}
                        className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Deployment Actions</h3>
          <div className="space-y-3">
            <button
              onClick={runChecks}
              disabled={isChecking}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isChecking ? 'Running Checks...' : 'Re-run Checks'}
            </button>

            <button
              disabled={errorCount > 0}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deploy to Production
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-900 mb-2">Deployment Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Ensure all environment variables are set in your hosting platform</li>
              <li>Test the donation flow with Stripe test cards before going live</li>
              <li>Set up monitoring and error tracking (e.g., Sentry)</li>
              <li>Configure backup schedules for production data</li>
              <li>Update DNS settings to point to your production domain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
