'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AdminAuth';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManager() {
  const { user, hasPermission } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'create'>('list');

  // Mock data - in production this would come from your CMS/database
  useEffect(() => {
    const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: 'Welcomed 30 New Children to Our Safe Housing',
        slug: 'welcomed-30-new-children',
        content: 'This month we opened our doors to 30 more children who needed safe shelter and care...',
        excerpt: 'This month we opened our doors to 30 more children who needed safe shelter and care.',
        author: 'HFRP Team',
        status: 'published',
        publishDate: '2024-12-15T10:00:00Z',
        categories: ['Stories', 'Housing'],
        tags: ['children', 'shelter', 'safety'],
        featuredImage: '/images/children_gathering.jpg',
        seoTitle: 'Welcome 30 New Children to HFRP Safe Housing',
        seoDescription: 'Read about how HFRP welcomed 30 new children to our safe housing program in Haiti.',
        readTime: 3,
        views: 245,
        createdAt: '2024-12-15T09:00:00Z',
        updatedAt: '2024-12-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Monthly Medical Clinic Serves 150 Families',
        slug: 'monthly-medical-clinic-150-families',
        content: 'Our December medical clinic was our largest yet, serving 150 families...',
        excerpt: 'Our December medical clinic was our largest yet, serving 150 families with essential healthcare.',
        author: 'Dr. Marie Joseph',
        status: 'published',
        publishDate: '2024-12-10T14:00:00Z',
        categories: ['Updates', 'Healthcare'],
        tags: ['healthcare', 'clinic', 'families'],
        featuredImage: '/images/medical_clinic.jpg',
        readTime: 4,
        views: 189,
        createdAt: '2024-12-10T13:00:00Z',
        updatedAt: '2024-12-10T14:00:00Z'
      },
      {
        id: '3',
        title: 'Education Program Expansion Plan',
        slug: 'education-program-expansion-plan',
        content: 'We are excited to announce our plan to expand our education program...',
        excerpt: 'We are excited to announce our plan to expand our education program to serve more children.',
        author: 'Content Editor',
        status: 'draft',
        publishDate: '2024-12-20T10:00:00Z',
        categories: ['News', 'Education'],
        tags: ['education', 'expansion', 'children'],
        readTime: 2,
        views: 0,
        createdAt: '2024-12-16T09:00:00Z',
        updatedAt: '2024-12-16T11:30:00Z'
      }
    ];
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePost = () => {
    if (!hasPermission('blog.write')) {
      alert('You do not have permission to create posts');
      return;
    }
    setSelectedPost(null);
    setCurrentView('create');
  };

  const handleEditPost = (post: BlogPost) => {
    if (!hasPermission('blog.edit')) {
      alert('You do not have permission to edit posts');
      return;
    }
    setSelectedPost(post);
    setCurrentView('edit');
  };

  const handleDeletePost = (postId: string) => {
    if (!hasPermission('blog.delete')) {
      alert('You do not have permission to delete posts');
      return;
    }
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (currentView === 'create') {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: postData.title || '',
        slug: postData.slug || postData.title?.toLowerCase().replace(/\s+/g, '-') || '',
        content: postData.content || '',
        excerpt: postData.excerpt || '',
        author: user?.name || 'Unknown',
        status: postData.status || 'draft',
        publishDate: postData.publishDate || new Date().toISOString(),
        categories: postData.categories || [],
        tags: postData.tags || [],
        featuredImage: postData.featuredImage,
        seoTitle: postData.seoTitle,
        seoDescription: postData.seoDescription,
        readTime: Math.ceil((postData.content?.split(' ').length || 0) / 200),
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPosts([newPost, ...posts]);
    } else if (selectedPost) {
      const updatedPost = {
        ...selectedPost,
        ...postData,
        updatedAt: new Date().toISOString()
      };
      setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
    }
    setCurrentView('list');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (currentView === 'create' || currentView === 'edit') {
    return <BlogEditor post={selectedPost} onSave={handleSavePost} onCancel={() => setCurrentView('list')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          <p className="text-gray-600">Create, edit, and manage your blog posts</p>
        </div>
        {hasPermission('blog.write') && (
          <button
            onClick={handleCreatePost}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Create New Post
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Posts ({filteredPosts.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPosts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                      {post.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{formatDate(post.publishDate)}</span>
                    <span>•</span>
                    <span>{post.readTime} min read</span>
                    <span>•</span>
                    <span>{post.views} views</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {post.categories.map((category) => (
                      <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {hasPermission('blog.edit') && (
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="Edit post"
                    >
                      ✏️
                    </button>
                  )}

                  {hasPermission('blog.delete') && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  )}

                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="View post"
                  >
                    👁️
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first blog post to get started'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BlogEditor({
  post,
  onSave,
  onCancel
}: {
  post: BlogPost | null;
  onSave: (data: Partial<BlogPost>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    status: post?.status || 'draft',
    categories: post?.categories || [],
    tags: post?.tags || [],
    featuredImage: post?.featuredImage || '',
    seoTitle: post?.seoTitle || '',
    seoDescription: post?.seoDescription || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== category)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {post ? 'Edit Post' : 'Create New Post'}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {post ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the post..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  rows={15}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content here..."
                />
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="Leave blank to use post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Meta description for search engines..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' }))}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {['Stories', 'Updates', 'News', 'Impact', 'Healthcare', 'Education', 'Housing'].map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    checked={formData.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
            <div>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.featuredImage}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                placeholder="Image URL or path"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
