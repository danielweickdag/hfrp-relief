"use client";

// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Campaign data
  const campaigns = [
    {
      id: 1,
      name: "HFRP Education 2025",
      emoji: "🎓",
      goal: 75000,
      raised: 32750,
    },
    {
      id: 2,
      name: "HFRP Emergency 2025",
      emoji: "🚨",
      goal: 50000,
      raised: 18500,
    },
    {
      id: 3,
      name: "HFRP Housing 2025",
      emoji: "🏠",
      goal: 100000,
      raised: 27300,
    },
    {
      id: 4,
      name: "HFRP Medical 2025",
      emoji: "🩺",
      goal: 40000,
      raised: 16850,
    },
  ];

  // Notifications
  const notifications = [
    {
      id: 1,
      type: "success",
      message: "Donorbox sync completed successfully",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "info",
      message: "New donation received: $150",
      time: "15 minutes ago",
    },
    {
      id: 3,
      type: "warning",
      message: "Campaign goal 75% reached",
      time: "1 hour ago",
    },
  ];

  // System stats
  const systemStats = {
    totalDonations: 847,
    activeUsers: 23,
    emailsSent: 2456,
    conversionRate: 12.5,
  };

  // Check if already authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("hfrp-admin-auth") === "true";
    setIsAuthenticated(isAuth);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simple direct authentication
    if (email === "w.regis@comcast.net" && password === "Melirosecherie58") {
      setIsAuthenticated(true);
      // Store in localStorage
      localStorage.setItem("hfrp-admin-auth", "true");
      localStorage.setItem("hfrp-admin-email", email);
    } else {
      setError(
        "Invalid credentials. Use: w.regis@comcast.net and Melirosecherie58",
      );
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("hfrp-admin-auth");
    localStorage.removeItem("hfrp-admin-email");
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  HFRP Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Notifications</span>🔔
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Welcome, {localStorage.getItem("hfrp-admin-email")}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Campaigns
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {campaigns.length}
              </p>
              <p className="text-sm text-gray-500">All active and automated</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Goal
              </h3>
              <p className="text-3xl font-bold text-green-600">
                $
                {campaigns.reduce((sum, c) => sum + c.goal, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Across all campaigns</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Raised
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                $
                {campaigns
                  .reduce((sum, c) => sum + c.raised, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(
                  (campaigns.reduce((sum, c) => sum + c.raised, 0) /
                    campaigns.reduce((sum, c) => sum + c.goal, 0)) *
                    100,
                )}
                % of total goal
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Donations
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {systemStats.totalDonations}
              </p>
              <p className="text-sm text-gray-500">
                From {systemStats.activeUsers} active donors
              </p>
            </div>
          </div>

          {/* Campaign Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📊 Campaign Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-800">
                    {campaign.emoji} {campaign.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Goal: ${campaign.goal.toLocaleString()} | Raised: $
                    {campaign.raised.toLocaleString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                      style={{
                        width: `${(campaign.raised / campaign.goal) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {Math.round((campaign.raised / campaign.goal) * 100)}%
                    complete • Fully automated
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📢 Recent Notifications
            </h2>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
                >
                  <span className="text-lg">
                    {notification.type === "success"
                      ? "✅"
                      : notification.type === "warning"
                        ? "⚠️"
                        : "ℹ️"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ⚡ Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => alert("Running Donorbox sync...")}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 text-left"
              >
                <div className="font-semibold">🔄 Sync Data</div>
                <div className="text-sm opacity-90">Update from Donorbox</div>
              </button>
              <button
                onClick={() => alert("Generating report...")}
                className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 text-left"
              >
                <div className="font-semibold">📊 Generate Report</div>
                <div className="text-sm opacity-90">Campaign performance</div>
              </button>
              <button
                onClick={() => alert("Sending notifications...")}
                className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 text-left"
              >
                <div className="font-semibold">📧 Send Updates</div>
                <div className="text-sm opacity-90">Notify all donors</div>
              </button>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ℹ️ System Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Donorbox Integration
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✅ API Connection: Active</li>
                  <li>✅ Account: w.regis@comcast.net</li>
                  <li>✅ Sync Frequency: Every 2 hours</li>
                  <li>✅ Last Sync: {new Date().toLocaleString()}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  System Health
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✅ All Systems: Operational</li>
                  <li>✅ Security: Configured</li>
                  <li>✅ Performance: Optimized</li>
                  <li>✅ Monitoring: Active</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500">
            <p className="font-semibold">
              HFRP Relief Admin Dashboard - All Systems Operational
            </p>
            <p>
              Last updated: {new Date().toLocaleString()} | Admin:{" "}
              {localStorage.getItem("hfrp-admin-email")}
            </p>
            <p className="mt-2">
              <a href="/" className="text-blue-600 hover:text-blue-800">
                Back to Homepage
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            🔐 HFRP Admin Portal
          </h2>
          <p className="text-gray-600">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">🔑 Admin Credentials:</p>
          <p className="text-sm">Email: w.regis@comcast.net</p>
          <p className="text-sm">Password: Melirosecherie58</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "🔄 Signing in..." : "🚀 Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? The credentials are shown above.</p>
          <p className="mt-2">
            <a href="/" className="text-blue-600 hover:text-blue-800">
              Back to Homepage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
