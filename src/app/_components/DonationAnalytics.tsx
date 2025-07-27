'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AdminAuth';

interface DonationMetrics {
  totalDonations: number;
  monthlyRecurring: number;
  oneTimeDonations: number;
  averageDonation: number;
  donorCount: number;
  newDonorsThisMonth: number;
  retentionRate: number;
  topCampaigns: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

interface DonationTransaction {
  id: string;
  donorName: string;
  email: string;
  amount: number;
  type: 'monthly' | 'one-time';
  campaign: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  country: string;
}

interface DonationTrend {
  month: string;
  amount: number;
  donors: number;
}

export default function DonationAnalytics() {
  const { hasPermission } = useAuth();
  const [metrics, setMetrics] = useState<DonationMetrics | null>(null);
  const [transactions, setTransactions] = useState<DonationTransaction[]>([]);
  const [trends, setTrends] = useState<DonationTrend[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - in production this would come from your payment processor API
    const mockMetrics: DonationMetrics = {
      totalDonations: 85420.50,
      monthlyRecurring: 62340.25,
      oneTimeDonations: 23080.25,
      averageDonation: 45.75,
      donorCount: 1867,
      newDonorsThisMonth: 243,
      retentionRate: 78.5,
      topCampaigns: [
        { name: 'Daily Giving Program', amount: 35240.50, percentage: 41.2 },
        { name: 'Emergency Relief Fund', amount: 22180.25, percentage: 26.0 },
        { name: 'Education Support', amount: 15420.75, percentage: 18.1 },
        { name: 'Healthcare Initiative', amount: 12579.00, percentage: 14.7 }
      ]
    };

    const mockTransactions: DonationTransaction[] = [
      {
        id: 'txn_001',
        donorName: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        amount: 25.00,
        type: 'monthly',
        campaign: 'Daily Giving Program',
        date: '2024-12-16T14:30:00Z',
        status: 'completed',
        paymentMethod: 'Credit Card',
        country: 'United States'
      },
      {
        id: 'txn_002',
        donorName: 'Michael Chen',
        email: 'michael.chen@email.com',
        amount: 100.00,
        type: 'one-time',
        campaign: 'Emergency Relief Fund',
        date: '2024-12-16T12:15:00Z',
        status: 'completed',
        paymentMethod: 'PayPal',
        country: 'Canada'
      },
      {
        id: 'txn_003',
        donorName: 'Anonymous Donor',
        email: 'anonymous@donorbox.org',
        amount: 50.00,
        type: 'monthly',
        campaign: 'Education Support',
        date: '2024-12-16T10:45:00Z',
        status: 'completed',
        paymentMethod: 'Bank Transfer',
        country: 'United Kingdom'
      },
      {
        id: 'txn_004',
        donorName: 'Lisa Rodriguez',
        email: 'lisa.r@email.com',
        amount: 15.00,
        type: 'monthly',
        campaign: 'Daily Giving Program',
        date: '2024-12-16T09:20:00Z',
        status: 'pending',
        paymentMethod: 'Credit Card',
        country: 'United States'
      }
    ];

    const mockTrends: DonationTrend[] = [
      { month: 'Jun', amount: 12500, donors: 156 },
      { month: 'Jul', amount: 15200, donors: 189 },
      { month: 'Aug', amount: 18400, donors: 224 },
      { month: 'Sep', amount: 16800, donors: 198 },
      { month: 'Oct', amount: 21300, donors: 267 },
      { month: 'Nov', amount: 24600, donors: 312 },
      { month: 'Dec', amount: 28900, donors: 385 }
    ];

    setMetrics(mockMetrics);
    setTransactions(mockTransactions);
    setTrends(mockTrends);
  }, []);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.campaign.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportData = () => {
    if (!hasPermission('donations.export')) {
      alert('You do not have permission to export data');
      return;
    }

    const csvContent = [
      ['Date', 'Donor Name', 'Email', 'Amount', 'Type', 'Campaign', 'Status', 'Payment Method', 'Country'],
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.donorName,
        t.email,
        t.amount.toString(),
        t.type,
        t.campaign,
        t.status,
        t.paymentMethod,
        t.country
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donation Analytics</h2>
          <p className="text-gray-600">Track and analyze donation performance</p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          {hasPermission('donations.export') && (
            <button
              onClick={exportData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Export Data
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Donations</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalDonations)}</p>
            </div>
            <div className="p-3 bg-green-400 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Monthly Recurring</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyRecurring)}</p>
            </div>
            <div className="p-3 bg-blue-400 rounded-full">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Donors</p>
              <p className="text-2xl font-bold">{metrics.donorCount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-400 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Donation</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.averageDonation)}</p>
            </div>
            <div className="p-3 bg-orange-400 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Trends</h3>
          <div className="space-y-4">
            {trends.map((trend, index) => {
              const maxAmount = Math.max(...trends.map(t => t.amount));
              const barWidth = (trend.amount / maxAmount) * 100;

              return (
                <div key={trend.month} className="flex items-center justify-between">
                  <div className="w-12 text-sm font-medium text-gray-600">{trend.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-20 text-right">
                    {formatCurrency(trend.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Campaigns</h3>
          <div className="space-y-4">
            {metrics.topCampaigns.map((campaign, index) => (
              <div key={campaign.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                    <span className="text-sm text-gray-600">{campaign.percentage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${campaign.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{formatCurrency(campaign.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <input
              type="text"
              placeholder="Search transactions..."
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.donorName}</div>
                      <div className="text-sm text-gray-500">{transaction.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                    <div className="text-sm text-gray-500">{transaction.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'monthly'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.campaign}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search term' : 'Transactions will appear here once donations are received'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
