"use client";

import CampaignSyncManager from "@/app/_components/CampaignSyncManager";

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

        <CampaignSyncManager />
      </div>
    </div>
  );
}
