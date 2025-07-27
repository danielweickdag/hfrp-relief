'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'approved' | 'needs-revision';
  notes?: string;
}

export default function ReviewPage() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([
    // Content Review
    { id: '1', category: 'Content', item: 'Homepage messaging and mission statement', status: 'pending' },
    { id: '2', category: 'Content', item: 'Daily giving messaging (16¢, 33¢, 50¢, 66¢ per day)', status: 'pending' },
    { id: '3', category: 'Content', item: 'About Us page accuracy', status: 'pending' },
    { id: '4', category: 'Content', item: 'Program descriptions (Healthcare, Feeding, Education)', status: 'pending' },
    { id: '5', category: 'Content', item: 'Gallery images and descriptions', status: 'pending' },
    { id: '6', category: 'Content', item: 'Testimonials authenticity', status: 'pending' },

    // Functionality Review
    { id: '6', category: 'Functionality', item: 'Daily giving donation buttons (16¢, 33¢, 50¢, 66¢) work correctly', status: 'pending' },
    { id: '7', category: 'Functionality', item: 'Custom amount donation functionality', status: 'pending' },
    { id: '8', category: 'Functionality', item: 'Contact form submission', status: 'pending' },
    { id: '9', category: 'Functionality', item: 'Gallery filtering and image viewing', status: 'pending' },
    { id: '10', category: 'Functionality', item: 'Navigation menu on all devices', status: 'pending' },
    { id: '11', category: 'Functionality', item: 'Video background playback', status: 'pending' },

    // Design Review
    { id: '11', category: 'Design', item: 'Logo and branding consistency', status: 'pending' },
    { id: '12', category: 'Design', item: 'Color scheme and visual appeal', status: 'pending' },
    { id: '13', category: 'Design', item: 'Mobile responsiveness', status: 'pending' },
    { id: '14', category: 'Design', item: 'Overall user experience', status: 'pending' },

    // Accuracy Review
    { id: '15', category: 'Accuracy', item: 'Contact information is correct', status: 'pending' },
    { id: '16', category: 'Accuracy', item: 'Statistics and impact numbers', status: 'pending' },
    { id: '17', category: 'Accuracy', item: 'Program details and descriptions', status: 'pending' },
    { id: '18', category: 'Accuracy', item: 'Team member information', status: 'pending' }
  ]);

  const updateReviewStatus = (id: string, status: ReviewItem['status'], notes?: string) => {
    setReviewItems(prev => prev.map(item =>
      item.id === id ? { ...item, status, notes } : item
    ));
  };

  const getStatusColor = (status: ReviewItem['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'needs-revision': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: ReviewItem['status']) => {
    switch (status) {
      case 'approved': return '✅';
      case 'needs-revision': return '❌';
      default: return '⏳';
    }
  };

  const categories = Array.from(new Set(reviewItems.map(item => item.category)));
  const stats = {
    total: reviewItems.length,
    approved: reviewItems.filter(item => item.status === 'approved').length,
    pending: reviewItems.filter(item => item.status === 'pending').length,
    needsRevision: reviewItems.filter(item => item.status === 'needs-revision').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HFRP Website Review
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please review each section of the website and provide feedback. This will help ensure everything is accurate before going live.
          </p>
        </div>

        {/* Review Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600 text-sm">Total Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-gray-600 text-sm">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600 text-sm">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-red-600">{stats.needsRevision}</div>
            <div className="text-gray-600 text-sm">Needs Revision</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Review Progress</span>
            <span className="text-sm text-gray-500">{Math.round((stats.approved / stats.total) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.approved / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Review Categories */}
        {categories.map(category => (
          <div key={category} className="mb-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{category} Review</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reviewItems.filter(item => item.category === category).map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getStatusIcon(item.status)}</span>
                          <span className="font-medium text-gray-900">{item.item}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateReviewStatus(item.id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Please provide feedback for revision:');
                          if (notes !== null) {
                            updateReviewStatus(item.id, 'needs-revision', notes);
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Needs Revision
                      </button>
                      <button
                        onClick={() => updateReviewStatus(item.id, 'pending')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Website Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">Homepage</div>
            </Link>
            <Link href="/about" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">About Us</div>
            </Link>
            <Link href="/gallery" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">Gallery</div>
            </Link>
            <Link href="/programs" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">Programs</div>
            </Link>
            <Link href="/donate" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">Donate</div>
            </Link>
            <Link href="/contact" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">Contact</div>
            </Link>
            <Link href="/impact" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">Impact</div>
            </Link>
            <Link href="/membership" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="font-medium text-blue-900">Membership</div>
            </Link>
          </div>
        </div>

        {/* Final Review Summary */}
        {stats.approved === stats.total && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">All Items Approved!</h3>
            <p className="text-green-700 mb-4">
              Congratulations! The website has been fully reviewed and approved by the team.
              It's ready for production deployment.
            </p>
            <div className="text-sm text-green-600">
              Review completed: {new Date().toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
