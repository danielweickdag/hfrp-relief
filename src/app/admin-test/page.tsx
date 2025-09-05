"use client";

// Simplified admin page for debugging
import { useState, useEffect } from "react";

export default function SimpleAdminTest() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔧 SimpleAdminTest: Component mounting...");
    try {
      setMounted(true);
      console.log("🔧 SimpleAdminTest: Successfully mounted");
    } catch (err) {
      console.error("❌ SimpleAdminTest: Error during mount:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Detected
          </h1>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            ✅ Admin Test Success
          </h1>
          <p className="text-gray-600 mb-4">
            The simplified admin component is working correctly.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✅ Component mounted successfully</p>
            <p>✅ useEffect hook working</p>
            <p>✅ useState hook working</p>
            <p>✅ No runtime errors detected</p>
          </div>
          <a
            href="/admin"
            className="inline-block mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Full Admin Panel
          </a>
        </div>
      </div>
    </div>
  );
}
