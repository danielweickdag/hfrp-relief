"use client";

import DonationDashboard from "@/app/_components/DonationDashboard";

export default function DonationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Donation Management</h1>
        <DonationDashboard />
      </div>
    </div>
  );
}
