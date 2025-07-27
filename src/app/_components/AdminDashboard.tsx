'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth, WithPermission } from './AdminAuth';
import BlogStatsDashboard from './BlogStatsDashboard';
import StripeConfig from './StripeConfig';

interface DashboardProps {
  className?: string;
}

export default function AdminDashboard({ className = '' }: DashboardProps) {
  const { user, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'gallery' | 'settings'>('overview');

  if (!user) {
    return null;
  }

  // Quick stats for dashboard - in a real app, these would come from an API
  const stats = {
    donations: { total: '$15,420.50', monthly: '$3,240.75', donors: 87 },
    content: { blogPosts: 24, pages: 8, media: 145 },
    volunteers: { active: 12, pending: 3, hours: 278 },
    visitors: { total: 1250, newUsers: 580, avgSessionTime: '2m 48s' }
  };

  return (
    <div className={`min-h-screen bg-gray-100 pb-8 ${className}`}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/hfrp-logo.png" alt="HFRP" className="h-8 w-8 rounded-full mr-3" />
              <h1 className="text-xl font-bold text-gray-900">HFRP Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Welcome, {user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <div className="relative group">
                <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z"/>
                    <path d="M10 14a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </Link>
                  <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="font-medium text-gray-900">Main Navigation</div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === 'overview'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>Dashboard</span>
                </button>

                <WithPermission permission="edit_content">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                      activeTab === 'content'
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    <span>Content Management</span>
                  </button>
                </WithPermission>

                <WithPermission permission="edit_content">
                  <Link
                    href="/admin/blog/posts"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H4v10h12V5h-2a1 1 0 100-2 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                    </svg>
                    <span>Blog Management</span>
                  </Link>
                </WithPermission>

                <WithPermission permission="upload_media">
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                      activeTab === 'gallery'
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span>Media Gallery</span>
                  </button>
                </WithPermission>

                <WithPermission permission="manage_volunteers">
                  <Link
                    href="/admin/volunteers"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <span>Volunteer Management</span>
                  </Link>
                </WithPermission>

                <WithPermission permission="manage_donations">
                  <Link
                    href="/admin/donations"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    <span>Donation Management</span>
                  </Link>
                </WithPermission>

                <WithPermission permission="manage_settings">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                      activeTab === 'settings'
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span>Site Settings</span>
                  </button>
                </WithPermission>

                <WithPermission permission="manage_settings">
                  <Link
                    href="/admin/backup"
                    className="w-full flex items-center space-x-2 p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    <span>Backup & Restore</span>
                  </Link>
                </WithPermission>
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="font-medium text-gray-900">Quick Links</div>
                <div className="mt-2 space-y-2">
                  <Link href="/" className="block text-sm text-blue-600 hover:text-blue-800">
                    → View Website
                  </Link>
                  <Link href="/admin/test" className="block text-sm text-blue-600 hover:text-blue-800">
                    → Run Tests
                  </Link>
                  <WithPermission permission="view_analytics">
                    <Link href="/admin/analytics" className="block text-sm text-blue-600 hover:text-blue-800">
                      → View Analytics
                    </Link>
                  </WithPermission>
                  <WithPermission permission="manage_backups">
                    <Link href="/admin/backup" className="block text-sm text-blue-600 hover:text-blue-800">
                      → Backup & Restore
                    </Link>
                  </WithPermission>
                  <WithPermission permission="manage_users">
                    <Link href="/admin/deploy" className="block text-sm text-blue-600 hover:text-blue-800">
                      → Deployment Checklist
                    </Link>
                  </WithPermission>
                </div>
              </div>
            </nav>

            <div className="mt-4 bg-white shadow rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>System status: Online</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Last backup: {new Date().toLocaleDateString()}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Dashboard Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Donations */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Total Donations</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.donations.total}</p>
                        <p className="text-sm text-gray-500">Monthly: {stats.donations.monthly}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Content</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.content.blogPosts}</p>
                        <p className="text-sm text-gray-500">Blog Posts Published</p>
                      </div>
                    </div>
                  </div>

                  {/* Volunteers */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Volunteers</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.volunteers.active}</p>
                        <p className="text-sm text-gray-500">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Site Traffic */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Site Visitors</h3>
                        <p className="text-3xl font-bold text-orange-600">{stats.visitors.total}</p>
                        <p className="text-sm text-gray-500">This month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <WithPermission permission="edit_content">
                        <Link href="/admin/blog" className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700 text-left transition-colors block">
                          <div className="text-2xl mb-2">📝</div>
                          <div className="font-semibold">Create Blog Post</div>
                          <div className="text-xs opacity-75">Write new content</div>
                        </Link>
                      </WithPermission>

                      <WithPermission permission="view_analytics">
                        <Link href="/admin/analytics" className="bg-green-600 text-white p-4 rounded hover:bg-green-700 text-left transition-colors block">
                          <div className="text-2xl mb-2">📊</div>
                          <div className="font-semibold">View Analytics</div>
                          <div className="text-xs opacity-75">Site performance</div>
                        </Link>
                      </WithPermission>

                      <WithPermission permission="manage_volunteers">
                        <Link href="/admin/volunteers" className="bg-purple-600 text-white p-4 rounded hover:bg-purple-700 text-left transition-colors block">
                          <div className="text-2xl mb-2">👥</div>
                          <div className="font-semibold">Manage Volunteers</div>
                          <div className="text-xs opacity-75">Coordinate team</div>
                        </Link>
                      </WithPermission>

                      <WithPermission permission="manage_settings">
                        <Link href="/admin/settings" className="bg-orange-600 text-white p-4 rounded hover:bg-orange-700 text-left transition-colors block">
                          <div className="text-2xl mb-2">⚙️</div>
                          <div className="font-semibold">Site Settings</div>
                          <div className="text-xs opacity-75">Configure options</div>
                        </Link>
                      </WithPermission>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <div className="text-green-600">💰</div>
                        </div>
                        <div>
                          <p className="font-medium">New Donation Received</p>
                          <p className="text-sm text-gray-500">$25.00 monthly donation</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <div className="text-blue-600">📝</div>
                        </div>
                        <div>
                          <p className="font-medium">Blog Post Published</p>
                          <p className="text-sm text-gray-500">"New Children Welcomed to Safe Housing"</p>
                          <p className="text-xs text-gray-400">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <div className="text-purple-600">👥</div>
                        </div>
                        <div>
                          <p className="font-medium">New Volunteer Registration</p>
                          <p className="text-sm text-gray-500">Maria Rodriguez joined as educator</p>
                          <p className="text-xs text-gray-400">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Management */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Content Management</h2>
                  <Link
                    href="/admin/blog/posts"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Manage Blog Posts
                  </Link>
                </div>

                {/* Blog Statistics */}
                <BlogStatsDashboard />


              </div>
            )}

            {/* Media Gallery */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Media Gallery</h2>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Uploaded Media</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                      Upload New
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                      <div key={item} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`/gallery/education/edu-${item}.jpg`}
                            alt={`Gallery item ${item}`}
                            className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 text-sm truncate text-gray-500">edu-{item}.jpg</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Site Settings</h2>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="site-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Site Title
                        </label>
                        <input
                          type="text"
                          id="site-title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="Haitian Family Relief Project"
                        />
                      </div>
                      <div>
                        <label htmlFor="site-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Site Description
                        </label>
                        <textarea
                          id="site-description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.
                        </textarea>
                      </div>
                      <div>
                        <label htmlFor="google-analytics" className="block text-sm font-medium text-gray-700 mb-1">
                          Google Analytics ID
                        </label>
                        <input
                          type="text"
                          id="google-analytics"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="G-XXXXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook URL
                        </label>
                        <input
                          type="text"
                          id="facebook"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="https://facebook.com/haitianfamilyrelief"
                        />
                      </div>
                      <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram URL
                        </label>
                        <input
                          type="text"
                          id="instagram"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="https://instagram.com/haitianfamilyrelief"
                        />
                      </div>
                      <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter URL
                        </label>
                        <input
                          type="text"
                          id="twitter"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="https://twitter.com/hfrp_haiti"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="haitianfamilyrelief@gmail.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          id="contact-phone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue="(224) 217-0230"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>

                {/* Stripe Configuration */}
                <WithPermission permission="manage_donations">
                  <StripeConfig />
                </WithPermission>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
