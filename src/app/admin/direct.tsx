"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DirectAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("w.regis@comcast.net");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple direct authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Direct credential check
    if (
      email.toLowerCase() === "w.regis@comcast.net" &&
      password === "Melirosecherie58"
    ) {
      setIsAuthenticated(true);
      setError("");
      // Store in localStorage
      localStorage.setItem("hfrp-admin-auth", "true");
      localStorage.setItem("hfrp-admin-email", email);
    } else {
      setError(
        "Invalid credentials. Use: w.regis@comcast.net / Melirosecherie58",
      );
    }
    setLoading(false);
  };

  // Check if already authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("hfrp-admin-auth");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hfrp-admin-auth");
    localStorage.removeItem("hfrp-admin-email");
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  HFRP Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome, {localStorage.getItem("hfrp-admin-email")}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Campaigns
              </h3>
              <p className="text-3xl font-bold text-blue-600">4</p>
              <p className="text-sm text-gray-500">All active</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Goal
              </h3>
              <p className="text-3xl font-bold text-green-600">$275,000</p>
              <p className="text-sm text-gray-500">Across all campaigns</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Raised
              </h3>
              <p className="text-3xl font-bold text-blue-600">$119,150</p>
              <p className="text-sm text-gray-500">43.3% of goal</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">
                Automation Status
              </h3>
              <p className="text-3xl font-bold text-green-600">100%</p>
              <p className="text-sm text-gray-500">All systems operational</p>
            </div>
          </div>

          {/* Campaigns Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Campaign Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  HFRP Education 2025
                </h3>
                <p className="text-gray-600 mb-2">
                  Goal: $75,000 | Raised: $32,750
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: "44%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">44% complete</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  HFRP Emergency 2025
                </h3>
                <p className="text-gray-600 mb-2">
                  Goal: $50,000 | Raised: $18,500
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: "37%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">37% complete</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  HFRP Housing 2025
                </h3>
                <p className="text-gray-600 mb-2">
                  Goal: $100,000 | Raised: $47,200
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: "47%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">47% complete</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  HFRP Medical 2025
                </h3>
                <p className="text-gray-600 mb-2">
                  Goal: $50,000 | Raised: $20,700
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full"
                    style={{ width: "41%" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">41% complete</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-left">
                <h3 className="font-semibold">View Campaign Analytics</h3>
                <p className="text-sm opacity-90">
                  Detailed performance metrics
                </p>
              </button>
              <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-left">
                <h3 className="font-semibold">Sync Stripe Data</h3>
                <p className="text-sm opacity-90">
                  Update campaign information
                </p>
              </button>
              <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-left">
                <h3 className="font-semibold">Automation Status</h3>
                <p className="text-sm opacity-90">View system status</p>
              </button>
            </div>
          </div>

          {/* Automation Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Automation Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Campaign Data Debugging</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Stripe Sync Automation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Social Media Content Generation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Email Campaign Templates</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Progress Tracking & Alerts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Donor Segmentation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Performance Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Automated Reporting</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500">
            <p>HFRP Relief Admin Dashboard - All systems operational</p>
            <p>Last updated: {new Date().toLocaleString()}</p>
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
            HFRP Admin Portal
          </h2>
          <p className="text-gray-600">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Test Credentials:</p>
          <p>Email: w.regis@comcast.net</p>
          <p>Password: Melirosecherie58</p>
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
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
