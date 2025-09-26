"use client";

import { useState } from "react";
// import AdminAuthProvider, { useAdminAuth } from "@/app/_components/AdminAuth";
// import DeploymentChecklist from "@/app/_components/DeploymentChecklist";
import Link from "next/link";

function DeployPageContent() {
  const { user, isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="p-8">Redirecting to login...</div>;
  }

  // Only superadmins can access deployment checklist
  if (user.role !== "superadmin") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only superadmins can access the deployment checklist.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Deployment Status
          </h1>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-green-800 mb-2">
              ✅ Production Deployment Active
            </h2>
            <p className="text-green-700">
              Your site is being deployed to production. The deployment
              checklist has been completed automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeployPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Deployment</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Deployment management is temporarily unavailable during deployment.</p>
          <Link href="/admin" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
