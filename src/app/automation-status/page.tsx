"use client";

import Link from "next/link";

export default function AutomationStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Automation Status</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Automation status monitoring is temporarily unavailable during
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
