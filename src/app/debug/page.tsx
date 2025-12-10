"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);

    // Capture any JavaScript errors
    const handleError = (event: ErrorEvent) => {
      setErrors((prev) => [
        ...prev,
        `Error: ${event.message} at ${event.filename}:${event.lineno}`,
      ]);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Debug Information
        </h1>

        <div className="grid gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Info</h2>
            <div className="space-y-2">
              <p>
                <strong>React Mounted:</strong> {mounted ? "✅ Yes" : "❌ No"}
              </p>
              <p>
                <strong>User Agent:</strong> {navigator.userAgent}
              </p>
              <p>
                <strong>Current URL:</strong> {window.location.href}
              </p>
              <p>
                <strong>Viewport:</strong> {window.innerWidth} x{" "}
                {window.innerHeight}
              </p>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-2">
              <p>
                <strong>Node Env:</strong> {process.env.NODE_ENV}
              </p>
              <p>
                <strong>Stripe Public Key:</strong>{" "}
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  ? "Set"
                  : "Not Set"}
              </p>
              <p>
                <strong>Test Mode:</strong>{" "}
                {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE}
              </p>
              <p>
                <strong>Main Campaign:</strong>{" "}
                {process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN}
              </p>
            </div>
          </div>

          {/* Errors */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">JavaScript Errors</h2>
            {errors.length === 0 ? (
              <p className="text-green-600">✅ No errors detected</p>
            ) : (
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-600 font-mono text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Console Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Console Test</h2>
            <button
              onClick={() => {
                console.log("🟢 Debug button clicked!");
                console.error("🔴 Test error log");
                console.warn("🟡 Test warning log");
                alert("Debug button works!");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Console & Alert
            </button>
          </div>

          {/* Video Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Video Test</h2>
            <div className="space-y-4">
              <p>Testing if video files are accessible:</p>
              <video
                width="400"
                height="200"
                controls
                className="border rounded"
                onError={(e) => {
                  setErrors((prev) => [
                    ...prev,
                    `Video error: ${e.currentTarget.error?.message || "Unknown error"}`,
                  ]);
                }}
                onLoadStart={() => console.log("Video loading started")}
                onCanPlay={() => console.log("Video can play")}
              >
                <source src="/downloads/Haitian-Family-Project-2.mp4" type="video/mp4" />
                <source src="/homepage-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Network Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Network Test</h2>
            <button
              onClick={async () => {
                try {
                  const response = await fetch("/api/contact", {
                    method: "GET",
                  });
                  console.log("API Test Response:", response.status);
                  setErrors((prev) => [
                    ...prev,
                    `API Test: ${response.status} ${response.statusText}`,
                  ]);
                } catch (error) {
                  console.error("API Test Error:", error);
                  setErrors((prev) => [...prev, `API Test Error: ${error}`]);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test API Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
