"use client";

// Force dynamic rendering for all admin pages to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { AdminAuthProvider } from "../_components/AdminAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
