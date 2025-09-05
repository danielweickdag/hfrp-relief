"use client";
// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  AdminAuthProvider,
  useAdminAuth,
  WithPermission,
} from "../../_components/AdminAuth";
import Link from "next/link";
import { Line, Bar, Pie, Doughnut } from "../../../lib/chartSetup";

import type {
  AnalyticsData,
  SummaryStats,
  DonationData,
  TrafficData,
  DemographicData,
  DonationSourceData,
  TopPagesData,
  TimeFilterOption,
} from "../../../types/analytics";

// Time filter options
const timeFilterOptions: TimeFilterOption[] = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "Last 365 Days", value: "365d" },
  { label: "All Time", value: "all" },
];

// Dashboard summary component
const AnalyticsSummary = ({ data }: { data: SummaryStats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Total Donations
        </h3>
        <p className="text-3xl font-bold text-green-600">
          {formatCurrency(data.totalDonations)}
        </p>
        <div className="flex items-center mt-2">
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${data.donationGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {data.donationGrowth >= 0 ? "+" : ""}
            {data.donationGrowth}%
          </span>
          <span className="text-xs text-gray-500 ml-2">vs previous period</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Website Visitors
        </h3>
        <p className="text-3xl font-bold text-blue-600">
          {data.totalVisitors.toLocaleString()}
        </p>
        <div className="flex items-center mt-2">
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${data.visitorGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {data.visitorGrowth >= 0 ? "+" : ""}
            {data.visitorGrowth}%
          </span>
          <span className="text-xs text-gray-500 ml-2">vs previous period</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Conversion Rate
        </h3>
        <p className="text-3xl font-bold text-purple-600">
          {data.conversionRate}%
        </p>
        <div className="flex items-center mt-2">
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${data.conversionGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {data.conversionGrowth >= 0 ? "+" : ""}
            {data.conversionGrowth}%
          </span>
          <span className="text-xs text-gray-500 ml-2">vs previous period</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Avg. Donation
        </h3>
        <p className="text-3xl font-bold text-orange-600">
          {formatCurrency(data.avgDonation)}
        </p>
        <div className="flex items-center mt-2">
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${data.avgDonationGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {data.avgDonationGrowth >= 0 ? "+" : ""}
            {data.avgDonationGrowth}%
          </span>
          <span className="text-xs text-gray-500 ml-2">vs previous period</span>
        </div>
      </div>
    </div>
  );
};

// Donations chart component
const DonationsChart = ({ data }: { data: DonationData }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Donation Amount",
        data: data.amounts,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Number of Donations",
        data: data.counts,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: "Monthly Donation Trends",
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Amount ($)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Donation Overview
      </h3>
      <div className="h-80">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

// Website traffic chart component
const TrafficChart = ({ data }: { data: TrafficData }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Visits",
        data: data.visits,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "Unique Visitors",
        data: data.uniqueVisitors,
        backgroundColor: "rgba(147, 51, 234, 0.5)",
      },
      {
        label: "Page Views",
        data: data.pageViews,
        backgroundColor: "rgba(236, 72, 153, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Website Traffic",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Traffic Overview
      </h3>
      <div className="h-80">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

// Demographics chart component
const DemographicsChart = ({ data }: { data: DemographicData }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Visitors by Country",
        data: data.data,
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Visitor Demographics",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Visitor Demographics
      </h3>
      <div className="h-80 flex justify-center">
        <div style={{ maxHeight: "320px", maxWidth: "320px" }}>
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

// Donation source chart component
const DonationSourceChart = ({ data }: { data: DonationSourceData }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Donation Sources",
        data: data.data,
        backgroundColor: [
          "rgba(34, 197, 94, 0.5)",
          "rgba(59, 130, 246, 0.5)",
          "rgba(236, 72, 153, 0.5)",
          "rgba(245, 158, 11, 0.5)",
          "rgba(107, 114, 128, 0.5)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Donation Sources",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Donation Sources
      </h3>
      <div className="h-80 flex justify-center">
        <div style={{ maxHeight: "320px", maxWidth: "320px" }}>
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

// Top pages chart component
const TopPagesChart = ({ data }: { data: TopPagesData }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Page Views",
        data: data.views,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Top Pages",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
      <div className="h-80">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

// Generate mock data based on selected time filter
const generateMockData = (timeFilter: string): AnalyticsData => {
  // Adjust data based on time filter
  const factor =
    timeFilter === "7d"
      ? 1
      : timeFilter === "30d"
        ? 1.5
        : timeFilter === "90d"
          ? 2
          : timeFilter === "365d"
            ? 3
            : 4;

  // Calculate safe array length
  const safeLength = Math.max(1, Math.min(12, Math.floor(factor * 3)));

  // Generate donation data
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const donationData = {
    labels: monthLabels.slice(0, safeLength),
    amounts: Array.from(
      { length: safeLength },
      () => Math.floor(Math.random() * 5000) + 1000
    ),
    counts: Array.from(
      { length: safeLength },
      () => Math.floor(Math.random() * 30) + 10
    ),
  };

  // Generate traffic data
  const trafficData = {
    labels: Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`),
    visits: Array.from(
      { length: 7 },
      () => Math.floor(Math.random() * 200) + 50
    ),
    uniqueVisitors: Array.from(
      { length: 7 },
      () => Math.floor(Math.random() * 150) + 30
    ),
    pageViews: Array.from(
      { length: 7 },
      () => Math.floor(Math.random() * 500) + 100
    ),
  };

  // Generate demographic data
  const demographicData = {
    labels: [
      "United States",
      "Haiti",
      "Canada",
      "France",
      "Dominican Republic",
      "Other",
    ],
    data: [45, 25, 10, 8, 7, 5],
  };

  // Generate donation source data
  const donationSourceData = {
    labels: [
      "Website",
      "Mobile App",
      "Social Media",
      "Email Campaigns",
      "Direct Mail",
    ],
    data: [40, 25, 20, 10, 5],
  };

  // Generate top pages data
  const topPagesData = {
    labels: [
      "/donate",
      "/programs/education",
      "/impact",
      "/gallery",
      "/contact",
    ],
    views: [320, 280, 220, 190, 150],
  };

  return {
    donationData,
    trafficData,
    demographicData,
    donationSourceData,
    topPagesData,
    summary: {
      totalDonations: Math.floor(Math.random() * 50000) + 10000,
      donationGrowth: Math.floor(Math.random() * 30) + 5,
      totalVisitors: Math.floor(Math.random() * 5000) + 1000,
      visitorGrowth: Math.floor(Math.random() * 20) + 2,
      conversionRate: (Math.random() * 5 + 1).toFixed(2),
      conversionGrowth: Math.floor(Math.random() * 15) - 5,
      avgDonation: Math.floor(Math.random() * 100) + 50,
      avgDonationGrowth: Math.floor(Math.random() * 25) - 10,
    },
  };
};

function AnalyticsContent() {
  const [timeFilter, setTimeFilter] = useState(
    timeFilterOptions[1] ||
      timeFilterOptions[0] || { label: "Last 30 Days", value: "30d" }
  ); // Safe default to 30 days
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Generate mock data based on selected time filter
  const data = generateMockData(timeFilter.value);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the analytics dashboard.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WithPermission
      permission="view_analytics"
      fallback={
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You do not have permission to view analytics. Contact an
                    administrator for access.
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor your website performance and donation metrics
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div>
                <label
                  htmlFor="timeFilter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Time Period
                </label>
                <select
                  id="timeFilter"
                  className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={timeFilter.value}
                  onChange={(e) =>
                    setTimeFilter(
                      timeFilterOptions.find(
                        (opt) => opt.value === e.target.value
                      ) || timeFilterOptions[1]
                    )
                  }
                >
                  {timeFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href="/admin"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Summary stats */}
          <AnalyticsSummary data={data.summary} />

          {/* Charts - first row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DonationsChart data={data.donationData} />
            <TrafficChart data={data.trafficData} />
          </div>

          {/* Charts - second row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DemographicsChart data={data.demographicData} />
            <DonationSourceChart data={data.donationSourceData} />
          </div>

          {/* Charts - third row */}
          <div className="mb-8">
            <TopPagesChart data={data.topPagesData} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">💡</div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">
                  Analytics Integration Guide
                </h4>
                <p className="text-blue-700 mb-4">
                  This dashboard is currently displaying mock data for
                  demonstration purposes. In production, you would integrate
                  with real data sources:
                </p>
                <ul className="list-disc list-inside text-blue-700 space-y-2">
                  <li>Google Analytics 4 for website traffic data</li>
                  <li>Donorbox API for donation metrics</li>
                  <li>Database queries for user engagement statistics</li>
                  <li>Custom event tracking for conversion metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WithPermission>
  );
}

export default function AnalyticsPage() {
  return (
    <AdminAuthProvider>
      <AnalyticsContent />
    </AdminAuthProvider>
  );
}
