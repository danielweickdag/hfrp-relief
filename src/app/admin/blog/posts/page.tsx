"use client";

import { useState } from "react";
// import AdminAuthProvider, { useAdminAuth } from "@/app/_components/AdminAuth";
// import BlogManager from "@/app/_components/BlogManager";
import Link from "next/link";

function BlogPostsContent() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
          <p className="text-gray-600">Blog posts management is temporarily unavailable during deployment.</p>
          <Link href="/admin" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BlogPostsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Blog posts management is temporarily unavailable during deployment.</p>
          <Link href="/admin" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
