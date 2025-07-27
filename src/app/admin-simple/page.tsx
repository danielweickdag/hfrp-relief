'use client';

import { useState } from 'react';

export default function SimpleAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validUsers = [
      'w.regis@comcast.net',
      'editor@haitianfamilyrelief.org',
      'volunteer@haitianfamilyrelief.org'
    ];

    if (validUsers.includes(email) && password === 'Melirosecherie58') {
      setIsLoggedIn(true);
    } else {
      setError('Invalid email or password');
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">HFRP Admin Dashboard</h1>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Donations</h3>
              <p className="text-3xl font-bold text-green-600">$15,420.50</p>
              <p className="text-sm text-gray-500">This month: $3,240.75</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Posts</h3>
              <p className="text-3xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-500">Published</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Volunteers</h3>
              <p className="text-3xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-500">Active this month</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                📝 Create Blog Post
              </button>
              <button className="bg-green-600 text-white p-4 rounded hover:bg-green-700">
                📊 View Analytics
              </button>
              <button className="bg-purple-600 text-white p-4 rounded hover:bg-purple-700">
                👥 Manage Volunteers
              </button>
              <button className="bg-orange-600 text-white p-4 rounded hover:bg-orange-700">
                ⚙️ Settings
              </button>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Note:</strong> This is a simplified admin interface.
              The full admin system is available at <a href="/admin" className="underline">/admin</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/hfrp-logo.png"
            alt="HFRP Logo"
            className="mx-auto h-16 w-16 rounded-full mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900">HFRP Admin Login</h2>
          <p className="text-gray-600">Simple Admin Interface</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
            <p className="font-semibold mb-2">Test Credentials:</p>
            <p>Super Admin: w.regis@comcast.net</p>
            <p>Editor: editor@haitianfamilyrelief.org</p>
            <p>Volunteer: volunteer@haitianfamilyrelief.org</p>
            <p className="mt-2 font-semibold">Password: Melirosecherie58</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/admin"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Try Full Admin System
          </a>
        </div>
      </div>
    </div>
  );
}
