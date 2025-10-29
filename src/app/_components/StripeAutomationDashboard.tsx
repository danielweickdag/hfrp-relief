"use client";

import { useState, useEffect } from "react";
import { getStripeConfigManager } from "@/lib/stripeConfigManager";
import { stripeAutomation } from "@/lib/stripeAutomation";

interface AutomationStats {
  totalDonations: number;
  recurringDonations: number;
  oneTimeDonations: number;
  totalRevenue: number;
  webhooksProcessed: number;
  automationErrors: number;
  lastSyncTime: string;
  stripeMode: 'test' | 'live';
  configurationValid: boolean;
}

interface RecentActivity {
  id: string;
  type: 'donation' | 'webhook' | 'error' | 'sync';
  message: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

interface PerformanceMetrics {
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  totalOperations: number;
  operationStats: {
    [key: string]: {
      averageTime: number;
      successRate: number;
      totalOperations: number;
    };
  };
}

export default function StripeAutomationDashboard() {
  const [stats, setStats] = useState<AutomationStats>({
    totalDonations: 0,
    recurringDonations: 0,
    oneTimeDonations: 0,
    totalRevenue: 0,
    webhooksProcessed: 0,
    automationErrors: 0,
    lastSyncTime: new Date().toISOString(),
    stripeMode: 'test',
    configurationValid: false
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    healthStatus: 'healthy',
    averageResponseTime: 0,
    successRate: 100,
    errorRate: 0,
    totalOperations: 0,
    operationStats: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the config manager instance
      const stripeConfigManager = getStripeConfigManager();
      if (!stripeConfigManager) {
        setError("Stripe service is not configured");
        return;
      }

      // Validate Stripe configuration
      const validation = await stripeConfigManager.validateConfiguration();
      
      // Get performance metrics
      const healthStatus = stripeAutomation.getHealthStatus();
      const overallStats = stripeAutomation.getOperationStats();
      
      // Get specific operation stats
      const operationTypes = ['create_one_time_donation', 'create_recurring_donation', 'webhook_processing', 'campaign_sync'];
      const operationStats: { [key: string]: { averageTime: number; successRate: number; totalOperations: number } } = {};
      
      for (const opType of operationTypes) {
        operationStats[opType] = stripeAutomation.getOperationStats(opType);
      }

      const performanceData: PerformanceMetrics = {
        healthStatus: healthStatus.status,
        averageResponseTime: healthStatus.metrics.averageResponseTime,
        successRate: healthStatus.metrics.recentSuccessRate,
        errorRate: healthStatus.metrics.errorRate,
        totalOperations: overallStats.totalOperations,
        operationStats
      };

      // Mock stats for demonstration (replace with real data)
      const mockStats: AutomationStats = {
        totalDonations: 156,
        recurringDonations: 42,
        oneTimeDonations: 114,
        totalRevenue: 15420.50,
        webhooksProcessed: 234,
        automationErrors: 3,
        lastSyncTime: new Date().toISOString(),
        stripeMode: process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true' ? 'test' : 'live',
        configurationValid: validation.isValid
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'donation',
          message: 'New $50 donation received for Emergency Relief campaign',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'webhook',
          message: 'Webhook processed: payment_intent.succeeded',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          type: 'sync',
          message: 'Campaign data synchronized with Stripe',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'error',
          message: 'Failed to process webhook: invalid signature',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: 'error'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      setPerformanceMetrics(performanceData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'donation': return '💰';
      case 'webhook': return '🔗';
      case 'sync': return '🔄';
      case 'error': return '❌';
      default: return '📊';
    }
  };

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            ❌ Dashboard Error
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Stripe Automation Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            stats.configurationValid 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {stats.configurationValid ? '✅ Configured' : '❌ Not Configured'}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            stats.stripeMode === 'test' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {stats.stripeMode === 'test' ? '🧪 Test Mode' : '🚀 Live Mode'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">Total Donations</div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalDonations}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-600 text-sm font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-purple-600 text-sm font-medium">Recurring</div>
          <div className="text-2xl font-bold text-purple-900">{stats.recurringDonations}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-orange-600 text-sm font-medium">Webhooks</div>
          <div className="text-2xl font-bold text-orange-900">{stats.webhooksProcessed}</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`p-4 rounded-lg ${
            performanceMetrics.healthStatus === 'healthy' ? 'bg-green-50' :
            performanceMetrics.healthStatus === 'degraded' ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className={`text-sm font-medium ${
              performanceMetrics.healthStatus === 'healthy' ? 'text-green-600' :
              performanceMetrics.healthStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              System Health
            </div>
            <div className={`text-2xl font-bold ${
              performanceMetrics.healthStatus === 'healthy' ? 'text-green-900' :
              performanceMetrics.healthStatus === 'degraded' ? 'text-yellow-900' : 'text-red-900'
            }`}>
              {performanceMetrics.healthStatus === 'healthy' ? '✅ Healthy' :
               performanceMetrics.healthStatus === 'degraded' ? '⚠️ Degraded' : '❌ Unhealthy'}
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-indigo-600 text-sm font-medium">Avg Response Time</div>
            <div className="text-2xl font-bold text-indigo-900">
              {performanceMetrics.averageResponseTime.toFixed(0)}ms
            </div>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="text-teal-600 text-sm font-medium">Success Rate</div>
            <div className="text-2xl font-bold text-teal-900">
              {performanceMetrics.successRate.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* Operation Stats */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-3">Operation Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(performanceMetrics.operationStats).map(([operation, stats]) => (
              <div key={operation} className="bg-white p-3 rounded border">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm">
                  <div className="text-gray-700">
                    Avg: {stats.averageTime?.toFixed(0) || 0}ms
                  </div>
                  <div className="text-gray-700">
                    Success: {stats.successRate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-gray-700">
                    Total: {stats.totalOperations || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Data
        </button>
        <button
          onClick={() => window.open('/api/stripe/stats', '_blank')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          📊 View Full Stats
        </button>
        <button
          onClick={() => window.open('/webhook-test', '_blank')}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          🔗 Test Webhooks
        </button>
        <button
          onClick={() => window.open('/stripe-admin', '_blank')}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
        >
          ⚙️ Stripe Settings
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Last updated: {formatTimestamp(stats.lastSyncTime)}</span>
          <span>
            {stats.automationErrors > 0 && (
              <span className="text-red-600 font-medium">
                ⚠️ {stats.automationErrors} automation errors
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}