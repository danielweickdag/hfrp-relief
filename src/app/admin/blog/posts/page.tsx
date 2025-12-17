"use client";

export const dynamic = "force-dynamic";

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
          <p className="text-gray-600">
            Blog posts management is temporarily unavailable during deployment.
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

export default function BlogPostsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Blog posts management is temporarily unavailable during deployment.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="/assistant?mode=blog"
              className="inline-flex items-center bg-sky-600 text-white px-3 py-2 rounded hover:bg-sky-700"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6l4 2M12 4a8 8 0 100 16 8 8 0 000-16z"
                />
              </svg>
              Open Blog Assistant
            </a>
            <a
              href="/admin"
              className="text-blue-600 hover:underline inline-flex items-center"
            >
              ← Back to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
