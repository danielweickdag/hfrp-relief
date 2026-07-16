"use client";

import { useState, useEffect } from "react";
import { useAdminAuth, WithPermission } from "./AdminAuth";
import Link from "next/link";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [tabSettings, setTabSettings] = useState<Record<string, boolean>>({});
  const [socialIconSettings, setSocialIconSettings] = useState<Record<string, boolean>>({});

  const handleVisibilityChange = async (type: 'tabs' | 'socialIcons', key: string, value: boolean) => {
    const settings = type === 'tabs' ? tabSettings : socialIconSettings;
    const newSettings = { ...settings, [key]: value };

    if (type === 'tabs') {
      setTabSettings(newSettings);
    } else {
      setSocialIconSettings(newSettings);
    }

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: newSettings }),
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        setTabSettings(data.tabs);
        setSocialIconSettings(data.socialIcons);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Dummy data for charts
  const engagementData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Likes",
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Comments",
        data: [28, 48, 40, 19, 86, 27, 90],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const websiteTrafficData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Unique Visitors",
        data: [1200, 1900, 3000, 5000],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex">
            <aside className="w-64">
              <nav className="flex flex-col space-y-2">
                <button onClick={() => setActiveTab("overview")} className={`text-left p-2 rounded ${activeTab === 'overview' ? 'bg-gray-200' : ''}`}>Overview</button>
                <button onClick={() => setActiveTab("website-content")} className={`text-left p-2 rounded ${activeTab === 'website-content' ? 'bg-gray-200' : ''}`}>Website Content</button>
                <button onClick={() => setActiveTab("analytics")} className={`text-left p-2 rounded ${activeTab === 'analytics' ? 'bg-gray-200' : ''}`}>Analytics</button>
                <button onClick={() => setActiveTab("troubleshooting")} className={`text-left p-2 rounded ${activeTab === 'troubleshooting' ? 'bg-gray-200' : ''}`}>Troubleshooting</button>
                <button onClick={() => setActiveTab("settings")} className={`text-left p-2 rounded ${activeTab === 'settings' ? 'bg-gray-200' : ''}`}>Settings</button>
              </nav>
            </aside>
            <div className="flex-1 pl-8">
              {activeTab === "overview" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-xl font-semibold mb-2">Instagram Engagement</h3>
                      <Bar data={engagementData} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-xl font-semibold mb-2">Website Traffic</h3>
                      <Line data={websiteTrafficData} />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "website-content" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Website Content Management</h2>
                  <div className="space-y-4">
                    <Link href="/admin/blog-editor">
                      <a className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Edit Blog Posts
                      </a>
                    </Link>
                    <Link href="/admin/media">
                      <a className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Manage Media
                      </a>
                    </Link>
                  </div>
                </div>
              )}
              {activeTab === "analytics" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Real-Time Data Analysis</h2>
                  <p>Real-time analytics will be displayed here.</p>
                </div>
              )}
              {activeTab === "troubleshooting" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Troubleshooting Tools</h2>
                  <div className="space-y-4">
                    <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                      Clear Cache
                    </button>
                    <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                      Run Diagnostics
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "settings" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">UI Visibility Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Navigation Tabs</h3>
                      {Object.keys(tabSettings).map((tab) => (
                        <div key={tab} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tab-${tab}`}
                            checked={tabSettings[tab]}
                            onChange={(e) => handleVisibilityChange('tabs', tab, e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor={`tab-${tab}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</label>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Social Media Icons</h3>
                      {Object.keys(socialIconSettings).map((icon) => (
                        <div key={icon} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`icon-${icon}`}
                            checked={socialIconSettings[icon]}
                            onChange={(e) => handleVisibilityChange('socialIcons', icon, e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor={`icon-${icon}`}>{icon.charAt(0).toUpperCase() + icon.slice(1)}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
