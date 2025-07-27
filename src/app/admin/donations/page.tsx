"use client";

// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  AdminAuthProvider,
  useAdminAuth,
  WithPermission,
} from "../../_components/AdminAuth";
import Link from "next/link";
import { donationStorage } from "@/lib/donationStorage";
import type {
  Donation,
  DonationFilters,
  DonationCampaign,
} from "@/types/donation";
import DonationDashboard from "../../_components/DonationDashboard";

function DonationsContent() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [activeView, setActiveView] = useState<
    "dashboard" | "list" | "campaigns" | "reports"
  >("dashboard");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
  const [filters, setFilters] = useState<DonationFilters>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (activeView === "list" || activeView === "campaigns") {
      loadData();
    }
  }, [filters, activeView]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      if (activeView === "list") {
        const donationsData = await donationStorage.getAllDonations(filters);
        setDonations(donationsData);
      } else if (activeView === "campaigns") {
        const campaignsData = await donationStorage.getAllCampaigns();
        setCampaigns(campaignsData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFilterChange = (key: keyof DonationFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      const data = await donationStorage.exportDonations({
        format,
        dateRange:
          filters.dateFrom && filters.dateTo
            ? {
                start: filters.dateFrom,
                end: filters.dateTo,
              }
            : undefined,
        includePersonalInfo: true,
        includeTaxInfo: true,
      });

      // Create download
      const blob = new Blob([data], {
        type: format === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export donations:", error);
      alert("Failed to export donations. Please try again.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: Donation["status"]) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return badges[status];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access donation management.
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
      permission="manage_donations"
      fallback={
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-700">
                You do not have permission to manage donations. Contact an
                administrator for access.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Donation Management
              </h1>
              <p className="text-gray-600">
                Track donations, manage campaigns, and generate reports
              </p>
            </div>
            <div className="flex gap-3">
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
                Back
              </Link>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`px-4 py-2 rounded-lg ${
                activeView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView("list")}
              className={`px-4 py-2 rounded-lg ${
                activeView === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Donations
            </button>
            <button
              onClick={() => setActiveView("campaigns")}
              className={`px-4 py-2 rounded-lg ${
                activeView === "campaigns"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveView("reports")}
              className={`px-4 py-2 rounded-lg ${
                activeView === "reports"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Reports
            </button>
          </div>

          {/* Dashboard View */}
          {activeView === "dashboard" && <DonationDashboard />}

          {/* List View */}
          {activeView === "list" && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "status",
                          e.target.value || undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={filters.type || ""}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value || undefined)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="one_time">One Time</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "dateFrom",
                          e.target.value || undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "dateTo",
                          e.target.value || undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search donations..."
                      value={filters.search || ""}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExport("csv")}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>

              {/* Donations List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoadingData ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading donations...</p>
                  </div>
                ) : donations.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No donations found
                    </h3>
                    <p className="text-gray-600">
                      Adjust your filters or wait for new donations.
                    </p>
                  </div>
                ) : (
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
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Receipt
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {donations.map((donation) => (
                          <tr key={donation.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(
                                donation.donationDate
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {donation.isAnonymous
                                  ? "Anonymous"
                                  : donation.donorName}
                              </div>
                              {donation.isRecurring && (
                                <div className="text-xs text-blue-600">
                                  Recurring
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(donation.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {donation.type.replace("_", " ")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(donation.status)}`}
                              >
                                {donation.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {donation.campaignName || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {donation.receiptNumber || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Campaigns View */}
          {activeView === "campaigns" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Fundraising Campaigns
                </h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Campaign
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => {
                  const percentage =
                    campaign.goal > 0
                      ? Math.min((campaign.raised / campaign.goal) * 100, 100)
                      : 0;

                  return (
                    <div
                      key={campaign.id}
                      className="bg-white rounded-lg shadow overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {campaign.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              campaign.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {campaign.isActive ? "Active" : "Ended"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          {campaign.description}
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>
                              {formatCurrency(campaign.raised)} raised
                            </span>
                            <span>{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Goal: {formatCurrency(campaign.goal)}</span>
                            <span>{campaign.donorCount} donors</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            Started{" "}
                            {new Date(campaign.startDate).toLocaleDateString()}
                          </span>
                          <span>
                            Ends{" "}
                            {new Date(campaign.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 px-6 py-3 flex justify-between">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View Details
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reports View */}
          {activeView === "reports" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                Financial Reports
              </h2>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Generate Report
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Monthly Summary</option>
                      <option>Quarterly Report</option>
                      <option>Annual Report</option>
                      <option>Tax Summary</option>
                      <option>Donor Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  Generate Report
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Reports
                  </h3>
                </div>
                <div className="p-6">
                  <div className="text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>No reports generated yet.</p>
                    <p className="text-sm mt-2">
                      Generate your first report above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WithPermission>
  );
}

export default function DonationsPage() {
  return (
    <AdminAuthProvider>
      <DonationsContent />
    </AdminAuthProvider>
  );
}
