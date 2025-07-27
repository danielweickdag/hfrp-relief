"use client";

// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  AdminAuthProvider,
  useAdminAuth,
  WithPermission,
} from "../../../../_components/AdminAuth";
import EnhancedRichTextEditor from "../../../../_components/EnhancedRichTextEditor";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { blogStorage } from "@/lib/blogStorage";
import type {
  BlogPost,
  BlogPostFormData,
  BlogCategory,
  BlogTag,
} from "@/types/blog";

function BlogPostEditContent() {
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null);

  const [formData, setFormData] = useState<BlogPostFormData>({
    title: "",
    excerpt: "",
    content: "",
    status: "draft",
    categories: [],
    tags: [],
    featuredImage: "",
    seo: {
      title: "",
      description: "",
      keywords: [],
      ogImage: "",
    },
    isFeatured: false,
  });

  const [showSEO, setShowSEO] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load post data
  useEffect(() => {
    loadData();
  }, [postId]);

  const loadData = async () => {
    setIsLoadingPost(true);
    try {
      const [postData, categoriesData, tagsData] = await Promise.all([
        blogStorage.getPostById(postId),
        blogStorage.getCategories(),
        blogStorage.getTags(),
      ]);

      if (!postData) {
        alert("Post not found");
        router.push("/admin/blog/posts");
        return;
      }

      setPost(postData);
      setCategories(categoriesData);
      setTags(tagsData);

      // Populate form data
      setFormData({
        title: postData.title,
        excerpt: postData.excerpt,
        content: postData.content,
        status: postData.status,
        categories: postData.categories.map((cat) => cat.id),
        tags: postData.tags.map((tag) => tag.id),
        featuredImage: postData.featuredImage || "",
        seo: postData.seo,
        scheduledAt: postData.scheduledAt,
        isFeatured: postData.isFeatured,
      });

      if (postData.status === "scheduled") {
        setShowSchedule(true);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
      alert("Failed to load post");
      router.push("/admin/blog/posts");
    } finally {
      setIsLoadingPost(false);
    }
  };

  // Auto-save draft
  useEffect(() => {
    if (!post || !formData.title) return;

    const timer = setTimeout(async () => {
      setAutoSaveStatus("saving");
      try {
        await blogStorage.saveDraft(postId, JSON.stringify(formData));
        setAutoSaveStatus("saved");
      } catch (error) {
        setAutoSaveStatus("error");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, postId, post]);

  const handleImageUpload = async (file: File): Promise<string> => {
    // Simulate image upload - in production, upload to cloud storage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (status: BlogPostFormData["status"]) => {
    if (!user || !post) return;

    // Validate form
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!formData.excerpt.trim()) {
      alert("Please enter an excerpt");
      return;
    }

    if (!formData.content.trim()) {
      alert("Please enter content");
      return;
    }

    if (formData.categories.length === 0) {
      alert("Please select at least one category");
      return;
    }

    setIsSaving(true);

    try {
      const postData: BlogPostFormData = {
        ...formData,
        status,
        seo: {
          ...formData.seo,
          title: formData.seo.title || formData.title,
          description: formData.seo.description || formData.excerpt,
          keywords:
            formData.seo.keywords.length > 0
              ? formData.seo.keywords
              : ["haiti", "relief", "charity"],
        },
      };

      await blogStorage.updatePost(postId, postData);

      // Clear draft
      await blogStorage.clearDraft(postId);

      // Track event
      if (window.gtag) {
        window.gtag("event", "blog_post_updated", {
          event_category: "Content",
          event_label: status,
          post_id: postId,
        });
      }

      // Redirect to posts list
      router.push("/admin/blog/posts");
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Failed to update post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    try {
      await blogStorage.deletePost(postId);

      // Track event
      if (window.gtag) {
        window.gtag("event", "blog_post_deleted", {
          event_category: "Content",
          post_id: postId,
        });
      }

      router.push("/admin/blog/posts");
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleDuplicate = async () => {
    if (!post || !user) return;

    try {
      const duplicateData: BlogPostFormData = {
        ...formData,
        title: `${formData.title} (Copy)`,
        status: "draft",
      };

      await blogStorage.createPost(duplicateData, {
        id: user.email,
        name: user.name,
        email: user.email,
      });

      router.push("/admin/blog/posts");
    } catch (error) {
      console.error("Failed to duplicate post:", error);
      alert("Failed to duplicate post. Please try again.");
    }
  };

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && formData.seo.keywords.indexOf(trimmed) === -1) {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, trimmed],
        },
      }));
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((_, i) => i !== index),
      },
    }));
  };

  if (isLoading || isLoadingPost) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading post...</p>
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
            You need to be logged in to edit blog posts.
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Post not found
          </h2>
          <Link
            href="/admin/blog/posts"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <WithPermission
      permission="edit_content"
      fallback={
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-700">
                You do not have permission to edit blog posts. Contact an
                administrator for access.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Blog Post
              </h1>
              <p className="text-gray-600">
                Last updated: {new Date(post.updatedAt).toLocaleDateString()} at{" "}
                {new Date(post.updatedAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {autoSaveStatus && (
                <div
                  className={`text-sm ${
                    autoSaveStatus === "saved"
                      ? "text-green-600"
                      : autoSaveStatus === "saving"
                        ? "text-gray-600"
                        : "text-red-600"
                  }`}
                >
                  {autoSaveStatus === "saved" && "✓ Auto-saved"}
                  {autoSaveStatus === "saving" && "Saving..."}
                  {autoSaveStatus === "error" && "Failed to save"}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleDuplicate}
                  className="text-gray-600 hover:text-gray-800"
                  title="Duplicate post"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = `/blog/${post.slug}`;
                    window.open(url, "_blank");
                  }}
                  className="text-gray-600 hover:text-gray-800"
                  title="View post"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/blog/${post.slug}`;
                    navigator.clipboard.writeText(url);
                    alert("Post URL copied to clipboard!");
                  }}
                  className="text-gray-600 hover:text-gray-800"
                  title="Copy URL"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete post"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <Link
                href="/admin/blog/posts"
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Delete Post
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{post.title}"? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      handleDelete();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white rounded-lg shadow p-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Post Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your post title..."
                />
              </div>

              {/* Excerpt */}
              <div className="bg-white rounded-lg shadow p-6">
                <label
                  htmlFor="excerpt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your post..."
                />
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-lg shadow p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <EnhancedRichTextEditor
                  content={formData.content}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, content }))
                  }
                  onImageUpload={handleImageUpload}
                  readOnly={previewMode}
                />
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSEO(!showSEO)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="font-medium">SEO Settings</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${showSEO ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showSEO && (
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <label
                        htmlFor="seo-title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        SEO Title
                      </label>
                      <input
                        type="text"
                        id="seo-title"
                        value={formData.seo.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seo: { ...prev.seo, title: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave empty to use post title"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="seo-description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Meta Description
                      </label>
                      <textarea
                        id="seo-description"
                        rows={2}
                        value={formData.seo.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seo: { ...prev.seo, description: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave empty to use excerpt"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keywords
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.seo.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(index)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add keyword and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Post Info */}
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Author:</span>
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">{post.viewCount}</span>
                  </div>
                  {post.readingTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reading time:</span>
                      <span className="font-medium">
                        {post.readingTime} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Publish Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Publish Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isFeatured: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Featured Post
                    </label>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showSchedule
                        ? "Cancel scheduling"
                        : "Schedule for later"}
                    </button>
                    {showSchedule && (
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            scheduledAt: e.target.value,
                          }))
                        }
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => handleSubmit("draft")}
                      disabled={isSaving}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition-colors"
                    >
                      {previewMode ? "Edit Mode" : "Preview Mode"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSubmit(showSchedule ? "scheduled" : "published")
                      }
                      disabled={isSaving}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving
                        ? "Updating..."
                        : showSchedule
                          ? "Schedule Post"
                          : "Update & Publish"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              categories: [...prev.categories, category.id],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              categories: prev.categories.filter(
                                (id) => id !== category.id
                              ),
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              tags: [...prev.tags, tag.id],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              tags: prev.tags.filter((id) => id !== tag.id),
                            }));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Featured Image
                </h3>
                {formData.featuredImage ? (
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, featuredImage: "" }))
                      }
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded hover:bg-red-700"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleImageUpload(file);
                          setFormData((prev) => ({
                            ...prev,
                            featuredImage: url,
                          }));
                        }
                      }}
                      className="hidden"
                      id="featured-image"
                    />
                    <label
                      htmlFor="featured-image"
                      className="block w-full text-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer"
                    >
                      <svg
                        className="w-8 h-8 text-gray-400 mx-auto mb-2"
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
                      <span className="text-sm text-gray-600">
                        Click to upload image
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WithPermission>
  );
}

// Extend window interface for analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters: Record<string, unknown>
    ) => void;
  }
}

export default function BlogPostEditPage() {
  return (
    <AdminAuthProvider>
      <BlogPostEditContent />
    </AdminAuthProvider>
  );
}
