"use client";

import Link from "next/link";

export default function CampaignSyncPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Campaign & Plan Sync
          </h1>
          <p className="text-gray-600">
            Manage and sync your campaigns and subscription plans with Stripe
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Campaign sync management is temporarily unavailable during
            deployment.
          </p>
          <Link
            href="/admin"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
