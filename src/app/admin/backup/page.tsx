"use client";

// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackupManagement from "@/app/_components/BackupManagement";
import { AdminAuthProvider, useAdminAuth } from "@/app/_components/AdminAuth";

function BackupPageContent() {
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

  return (
    <BackupManagement
      currentUser={{
        id: user.email,
        name: user.name,
        email: user.email,
      }}
    />
  );
}

export default function BackupPage() {
  return (
    <AdminAuthProvider>
      <BackupPageContent />
    </AdminAuthProvider>
  );
}
