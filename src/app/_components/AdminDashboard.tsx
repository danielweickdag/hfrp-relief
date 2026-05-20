"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminAuth, WithPermission } from "./AdminAuth";
import ShareBox from "./ShareBox";
import PhotoUpload from "./PhotoUpload";
import StripeAutomationDashboard from "./StripeAutomationDashboard";

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({
  className = "",
}: AdminDashboardProps) {
  const { user, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "automation"
    | "content"
    | "analytics"
    | "gallery"
    | "settings"
    | "stripe"
  >("overview");

  const [stats, setStats] = useState({
    donations: { total: 0, monthly: 0 },
    content: { blogPosts: 0 },
    volunteers: { total: 0, new: 0 },
    gallery: { photos: 0 },
  });

  useEffect(() => {
    // Mock data for stats
    setStats({
      donations: { total: 125, monthly: 12 },
      content: { blogPosts: 23 },
      volunteers: { total: 45, new: 5 },
      gallery: { photos: 102 },
    });
  }, []);

  if (!user) {
    return <div>Loading admin panel...</div>;
  }

  return (
    <div className={`min-h-screen bg-gray-100 pb-8 ${className}`}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user.email}</span>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          <aside className="w-64">
            <nav className="bg-white shadow rounded-lg p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "overview"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab("automation")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "automation"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>Automation</span>
                </button>
                <button
                  onClick={() => setActiveTab("content")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "content"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>Content</span>
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "analytics"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "gallery"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>Gallery</span>
                </button>
                <button
                  onClick={() => setActiveTab("stripe")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "stripe"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>Stripe Automation</span>
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center space-x-2 p-3 rounded-md text-left ${
                    activeTab === "settings"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>Site Settings</span>
                </button>
              </div>
            </nav>
          </aside>
          <main className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Dashboard Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Total Donations
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.donations.total}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Content
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.content.blogPosts}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Volunteers
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.volunteers.total}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Gallery
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.gallery.photos}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "automation" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Automation Dashboard
                </h2>
                <p>Automation tools and settings will be displayed here.</p>
              </div>
            )}
            {activeTab === "content" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Content Management
                </h2>
                <p>Content management tools will be displayed here.</p>
              </div>
            )}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Analytics Dashboard
                </h2>
                <p>Analytics and reports will be displayed here.</p>
              </div>
            )}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <PhotoUpload />
              </div>
            )}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Site Settings
                </h2>
                <p>Settings content goes here.</p>
              </div>
            )}
            {activeTab === "stripe" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Stripe Automation Dashboard
                </h2>
                <StripeAutomationDashboard />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
