"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-xl mx-auto mt-24 p-6 bg-white shadow rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-4">
            An unexpected error occurred while rendering this page.
          </p>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto mb-4">
            {error?.message}
          </pre>
          <div className="flex gap-3">
            <button
              onClick={() => reset()}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Try again
            </button>
            <button
              onClick={() => location.reload()}
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded hover:bg-gray-300"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
