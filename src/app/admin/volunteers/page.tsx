"use client";

import { AdminAuthProvider } from "@/app/_components/AdminAuth";
import { useState } from "react";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string;
  status: "active" | "pending" | "inactive";
  joinDate: string;
  totalHours: number;
}

function VolunteersContent() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: "1",
      name: "Marie Jean-Baptiste",
      email: "marie.jb@example.com",
      phone: "(555) 123-4567",
      skills: ["Education", "Translation", "Community Outreach"],
      availability: "Weekends",
      status: "active",
      joinDate: "2024-01-15",
      totalHours: 245,
    },
    {
      id: "2",
      name: "David Pierre",
      email: "david.pierre@example.com",
      phone: "(555) 234-5678",
      skills: ["Medical", "Emergency Response", "Training"],
      availability: "Evenings",
      status: "active",
      joinDate: "2024-02-10",
      totalHours: 180,
    },
    {
      id: "3",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "(555) 345-6789",
      skills: ["Fundraising", "Marketing", "Social Media"],
      availability: "Flexible",
      status: "pending",
      joinDate: "2024-08-01",
      totalHours: 0,
    },
  ]);

  const [showNewVolunteerForm, setShowNewVolunteerForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "pending" | "inactive"
  >("all");

  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      selectedStatus === "all" || volunteer.status === selectedStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Volunteer Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage volunteer applications and track participation
                </p>
              </div>
              <button
                onClick={() => setShowNewVolunteerForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add New Volunteer
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">
                {volunteers.filter((v) => v.status === "active").length}
              </h3>
              <p className="text-blue-700">Active Volunteers</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900">
                {volunteers.filter((v) => v.status === "pending").length}
              </h3>
              <p className="text-yellow-700">Pending Applications</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900">
                {volunteers.reduce((sum, v) => sum + v.totalHours, 0)}
              </h3>
              <p className="text-green-700">Total Hours Volunteered</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900">
                {volunteers.length}
              </h3>
              <p className="text-purple-700">Total Volunteers</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                {
                  key: "all",
                  label: "All Volunteers",
                  count: volunteers.length,
                },
                {
                  key: "active",
                  label: "Active",
                  count: volunteers.filter((v) => v.status === "active").length,
                },
                {
                  key: "pending",
                  label: "Pending",
                  count: volunteers.filter((v) => v.status === "pending")
                    .length,
                },
                {
                  key: "inactive",
                  label: "Inactive",
                  count: volunteers.filter((v) => v.status === "inactive")
                    .length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedStatus === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Volunteers List */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVolunteers.map((volunteer) => (
                    <tr key={volunteer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {volunteer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined:{" "}
                            {new Date(volunteer.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {volunteer.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {volunteer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {volunteer.skills.slice(0, 2).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {volunteer.skills.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{volunteer.skills.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(volunteer.status)}`}
                        >
                          {volunteer.status.charAt(0).toUpperCase() +
                            volunteer.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {volunteer.totalHours} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          {volunteer.status === "pending"
                            ? "Approve"
                            : "Message"}
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredVolunteers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No volunteers found for the selected status.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
              <div className="text-left">
                <div className="font-semibold">Send Newsletter</div>
                <div className="text-sm opacity-90">Update all volunteers</div>
              </div>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
              <div className="text-left">
                <div className="font-semibold">Schedule Training</div>
                <div className="text-sm opacity-90">
                  Organize volunteer training
                </div>
              </div>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
              <div className="text-left">
                <div className="font-semibold">Generate Report</div>
                <div className="text-sm opacity-90">
                  Volunteer activity report
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VolunteersPage() {
  return (
    <AdminAuthProvider>
      <VolunteersContent />
    </AdminAuthProvider>
  );
}
