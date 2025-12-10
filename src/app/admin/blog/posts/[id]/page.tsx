"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// import AdminAuthProvider, { useAdminAuth } from "@/app/_components/AdminAuth";
// import BlogManager from "@/app/_components/BlogManager";
import Link from "next/link";

function BlogPostEditContent() {
  const params = useParams();
  const postId = (params?.id as string) || "unknown";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-600">Post ID: {postId}</p>
        </div>
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Edit Blog Post</h2>
          <p className="text-gray-600">
            Blog post editing is temporarily unavailable during deployment.
          </p>
          <Link
            href="/admin/blog/posts"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to Blog Posts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BlogPostEditPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Blog post editing is temporarily unavailable during deployment.
          </p>
          <Link
            href="/admin/blog/posts"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to Blog Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
