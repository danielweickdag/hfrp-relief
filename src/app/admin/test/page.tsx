'use client';

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Test Page</h1>
          <p className="text-gray-600 mb-4">
            This page confirms that the admin routing is working correctly.
          </p>
          <a
            href="/admin"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Go to Main Admin
          </a>
        </div>
      </div>
    </div>
  );
}
