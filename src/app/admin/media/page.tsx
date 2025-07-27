'use client';
// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { AdminAuthProvider, useAdminAuth, WithPermission } from '../../_components/AdminAuth';
import AdminFileUploader from '../../_components/AdminFileUploader';
import Link from 'next/link';

function MediaContent() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'images' | 'documents' | 'uploads'>('images');

  // Mock media data
  const [mediaItems, setMediaItems] = useState([
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `img-${i + 1}`,
      name: `edu-${i + 1}.jpg`,
      type: 'image/jpeg',
      size: Math.floor(Math.random() * 5 * 1024 * 1024),
      url: `/gallery/education/edu-${i + 1}.jpg`,
      uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      category: 'images'
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `doc-${i + 1}`,
      name: `document-${i + 1}.pdf`,
      type: 'application/pdf',
      size: Math.floor(Math.random() * 2 * 1024 * 1024),
      url: "#",
      uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      category: 'documents'
    }))
  ]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading media...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the media management page.
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

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);

    // Simulate adding the file to the library
    setTimeout(() => {
      const newMediaItem = {
        id: `upload-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '#',
        uploadDate: new Date().toISOString(),
        category: file.type.startsWith('image/') ? 'images' : 'documents'
      };

      setMediaItems(prev => [newMediaItem, ...prev]);
      setUploadedFile(null);
      setShowUploader(false);
    }, 1500);
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      setMediaItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Filter media based on active tab
  const filteredMedia = mediaItems.filter(item => {
    if (activeTab === 'images') return item.type.startsWith('image/');
    if (activeTab === 'documents') return item.type === 'application/pdf';
    return true; // All files in 'uploads' tab
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
            <p className="text-gray-600">Manage and organize your media files</p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'images'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('images')}
                >
                  Images
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'documents'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'uploads'
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('uploads')}
                >
                  All Uploads
                </button>
              </div>

              <WithPermission permission="upload_media">
                <button
                  onClick={() => setShowUploader(!showUploader)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload New
                </button>
              </WithPermission>
            </div>
          </div>

          <div className="p-6">
            {/* File Uploader */}
            {showUploader && (
              <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Media</h3>
                <AdminFileUploader
                  onFileUpload={handleFileUpload}
                  allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'application/pdf']}
                  maxSizeMB={10}
                />
              </div>
            )}

            {/* Media Grid */}
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredMedia.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                      {item.type.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                          <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <WithPermission permission="upload_media">
                            <button
                              onClick={() => handleDeleteMedia(item.id)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100"
                            >
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </WithPermission>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                        {item.name}
                      </h3>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatFileSize(item.size)}</span>
                        <span>{formatDate(item.uploadDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {showUploader
                    ? 'Upload your first file using the form above'
                    : 'Get started by uploading a new file'}
                </p>
                {!showUploader && (
                  <div className="mt-6">
                    <WithPermission permission="upload_media">
                      <button
                        onClick={() => setShowUploader(true)}
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload New
                      </button>
                    </WithPermission>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MediaPage() {
  return (
    <AdminAuthProvider>
      <MediaContent />
    </AdminAuthProvider>
  );
}
