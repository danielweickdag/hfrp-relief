"use client";

// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  AdminAuthProvider,
  useAdminAuth,
  WithPermission,
} from "../../../_components/AdminAuth";
import Link from "next/link";
import { blogStorage } from "@/lib/blogStorage";
import type {
  BlogPost,
  BlogFilters,
  BlogCategory,
  BlogTag,
} from "@/types/blog";

function BlogPostsContent() {
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [filters, setFilters] = useState<BlogFilters>({
    sortBy: "date",
    sortOrder: "desc",
  });
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load posts, categories, and tags
  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoadingPosts(true);
    try {
      const [postsData, categoriesData, tagsData] = await Promise.all([
        blogStorage.getAllPosts(filters),
        blogStorage.getCategories(),
        blogStorage.getTags(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to load blog data:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleFilterChange = (key: keyof BlogFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((post) => post.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkAction = async (
    action: "publish" | "unpublish" | "archive" | "delete"
  ) => {
    if (selectedPosts.length === 0) return;

    if (
      action === "delete" &&
      !confirm(`Are you sure you want to delete ${selectedPosts.length} posts?`)
    ) {
      return;
    }

    try {
      switch (action) {
        case "publish":
          await blogStorage.bulkUpdateStatus(selectedPosts, "published");
          break;
        case "unpublish":
          await blogStorage.bulkUpdateStatus(selectedPosts, "draft");
          break;
        case "archive":
          await blogStorage.bulkUpdateStatus(selectedPosts, "archived");
          break;
        case "delete":
          await blogStorage.bulkDelete(selectedPosts);
          break;
      }
      await loadData();
      setSelectedPosts([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await blogStorage.deletePost(postId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const getStatusBadge = (status: BlogPost["status"]) => {
    const badges = {
      draft: "bg-gray-100 text-gray-800",
      published: "bg-green-100 text-green-800",
      scheduled: "bg-blue-100 text-blue-800",
      archived: "bg-yellow-100 text-yellow-800",
    };

    return badges[status];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the blog management page.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-gray-600">Manage your blog content</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/blog"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Post
            </Link>
            <Link
              href="/admin"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                onChange={(e) =>
                  handleFilterChange(
                    "categories",
                    e.target.value ? [e.target.value] : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange(
                    "sortBy",
                    e.target.value as BlogFilters["sortBy"]
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="views">Views</option>
                <option value="updated">Last Updated</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedPosts.length} post
                {selectedPosts.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("publish")}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction("unpublish")}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction("archive")}
                  className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                >
                  Archive
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingPosts ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first blog post.
              </p>
              <Link
                href="/admin/blog"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Post
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPosts.length === posts.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={() => handleSelectPost(post.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {post.excerpt}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.author.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(post.status)}`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.categories.map((cat) => cat.name).join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            post.publishedAt || post.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.viewCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/blog/posts/${post.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </Link>
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 mr-3"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => handleSelectPost(post.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(post.status)}`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      By {post.author.name} •{" "}
                      {new Date(
                        post.publishedAt || post.createdAt
                      ).toLocaleDateString()}{" "}
                      • {post.viewCount} views
                    </div>
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/blog/posts/${post.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogPostsPage() {
  return (
    <AdminAuthProvider>
      <BlogPostsContent />
    </AdminAuthProvider>
  );
}
