"use client";

export const dynamic = "force-dynamic";

import { AdminAuthProvider } from "@/app/_components/AdminAuth";

function BackupContent() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Data Backup</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">💾 Backup Management Temporarily Disabled</h2>
            <p className="text-yellow-700">The backup management system is temporarily disabled during deployment setup. This will be restored in the next update.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BackupPage() {
  return (
    <AdminAuthProvider>
      <BackupContent />
    </AdminAuthProvider>
  );
}
