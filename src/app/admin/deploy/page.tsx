"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DeploymentChecklist from "@/app/_components/DeploymentChecklist";
import { AdminAuthProvider, useAdminAuth } from "@/app/_components/AdminAuth";
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
  } // Only superadmins can access deployment checklist  if (user.role !== 'superadmin') {    return (      <div className="min-h-screen bg-gray-100 flex items-center justify-center">        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>          <p className="text-gray-600 mb-6">            Only superadmins can access the deployment checklist.          </p>          <button            onClick={() => router.push('/admin')}            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"          >            Back to Dashboard          </button>        </div>      </div>    );  }  return <DeploymentChecklist />;
}

export default function DeployPage() {
  return (
    <AdminAuthProvider>
      <DeployPageContent />
    </AdminAuthProvider>
  );
}
