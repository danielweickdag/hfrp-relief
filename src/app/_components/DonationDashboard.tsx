"use client";

import { useState, useEffect } from "react";
import { donationStorage } from "@/lib/donationStorage";
import type { DonationStats, DonationGoal } from "@/types/donation";
import Link from "next/link";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
);

export default function DonationDashboard() {
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [goals, setGoals] = useState<DonationGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year" | "all"
  >("month");

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let dateRange;
      const now = new Date();

      switch (timeRange) {
        case "week":
          dateRange = {
            start: new Date(now.setDate(now.getDate() - 7)).toISOString(),
            end: new Date().toISOString(),
          };
          break;
        case "month":
          dateRange = {
            start: new Date(now.setMonth(now.getMonth() - 1)).toISOString(),
            end: new Date().toISOString(),
          };
          break;
        case "quarter":
          dateRange = {
            start: new Date(now.setMonth(now.getMonth() - 3)).toISOString(),
            end: new Date().toISOString(),
          };
          break;
        case "year":
          dateRange = {
            start: new Date(
              now.setFullYear(now.getFullYear() - 1),
            ).toISOString(),
            end: new Date().toISOString(),
          };
          break;
        case "all":
          dateRange = undefined;
          break;
      }

      const [statsData, goalsData] = await Promise.all([
        donationStorage.getStats(dateRange),
        donationStorage.getAllGoals(),
      ]);

      setStats(statsData);
      setGoals(goalsData.filter((g) => g.isActive));
    } catch (error) {
      console.error("Failed to load donation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading donation statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-600">
        Failed to load statistics
      </div>
    );
  }

  // Chart data for donation sources
  const sourceChartData = {
    labels: stats.donationsBySource.map((s) =>
      s.source.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    ),
    datasets: [
      {
        data: stats.donationsBySource.map((s) => s.amount),
        backgroundColor: [
          "rgba(59, 130, 246, 0.6)",
          "rgba(34, 197, 94, 0.6)",
          "rgba(168, 85, 247, 0.6)",
          "rgba(251, 191, 36, 0.6)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(251, 191, 36, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for monthly trends
  const trendChartData = {
    labels: stats.monthlyTrends.map((t) => {
      const [year, month] = t.month.split("-");
      return new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
      ).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }),
    datasets: [
      {
        label: "Donation Amount",
        data: stats.monthlyTrends.map((t) => t.amount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Donor Count",
        data: stats.monthlyTrends.map((t) => t.donorCount),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  // Chart data for payment methods
  const paymentMethodData = {
    labels: stats.donationsByPaymentMethod.map((p) =>
      p.method
        .replace("_", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
    ),
    datasets: [
      {
        label: "Total Amount",
        data: stats.donationsByPaymentMethod.map((p) => p.amount),
        backgroundColor: "rgba(168, 85, 247, 0.6)",
        borderColor: "rgba(168, 85, 247, 1)",
        borderWidth: 1,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: "Donation Trends",
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
        title: {
          display: true,
          text: "Donors",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Donation Analytics</h2>
        <div className="flex gap-2">
          {(["week", "month", "quarter", "year", "all"] as const).map(
            (range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Raised</h3>
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalAmount)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.totalDonations} donations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Average Donation
            </h3>
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.averageDonation)}
          </p>
          <p className="text-sm text-gray-500 mt-1">per donation</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Donors</h3>
            <svg
              className="w-8 h-8 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalDonors}
          </p>
          <p className="text-sm text-gray-500 mt-1">unique donors</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Monthly Recurring
            </h3>
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.monthlyRecurringRevenue)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {stats.activeRecurringDonors} active donors
          </p>
        </div>
      </div>

      {/* Active Goals */}
      {goals.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Fundraising Goals
          </h3>
          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage =
                goal.targetAmount > 0
                  ? Math.min(
                      (goal.currentAmount / goal.targetAmount) * 100,
                      100,
                    )
                  : 0;

              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <p className="text-sm text-gray-500">
                        {goal.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        of {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% complete
                    </span>
                    <span className="text-xs text-gray-500">
                      Ends {new Date(goal.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-80">
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Donation Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Donation Sources
          </h3>
          <div className="h-64 flex justify-center items-center">
            <div style={{ maxHeight: "240px", maxWidth: "240px" }}>
              <Doughnut data={sourceChartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Payment Methods
        </h3>
        <div className="h-64">
          <Bar
            data={paymentMethodData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => "$" + value,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raised
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topCampaigns.map((campaign) => {
                const percentage =
                  campaign.goal > 0
                    ? Math.min((campaign.raised / campaign.goal) * 100, 100)
                    : 0;

                return (
                  <tr key={campaign.campaignId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Goal: {formatCurrency(campaign.goal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(campaign.raised)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.donorCount} donors
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Donors */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Top Donors</h3>
          <Link
            href="/admin/donations/donors"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Donated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donations
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topDonors.map((donor) => (
                <tr key={donor.donorId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donor.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(donor.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donor.donationCount} donations
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/donations/donors/${donor.donorId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Donations
          </h3>
          <Link
            href="/admin/donations"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentDonations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(donation.donationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.isAnonymous ? "Anonymous" : donation.donorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        donation.isRecurring
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {donation.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.campaignName || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          Donation Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <div>
              <p className="font-medium">Growth Trend</p>
              <p className="text-xs mt-1">
                Donations increased by 23% compared to last period
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Average Donation Size</p>
              <p className="text-xs mt-1">
                Average donation increased to{" "}
                {formatCurrency(stats.averageDonation)}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <div>
              <p className="font-medium">Recurring Revenue</p>
              <p className="text-xs mt-1">
                {stats.activeRecurringDonors} recurring donors contribute
                monthly
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Donor Retention</p>
              <p className="text-xs mt-1">
                {(stats.recurringRetentionRate * 100).toFixed(0)}% donor
                retention rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
