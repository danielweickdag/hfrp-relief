"use client";

import { useEffect, useState } from "react";

interface ErrorLog {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
}

export function useErrorMonitoring() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      setErrors((prev) => [...prev, errorLog]);

      // Log to console for debugging
      console.error("🔴 Error captured:", errorLog);

      // In production, you could send this to an error monitoring service
      if (process.env.NODE_ENV === "production") {
        // Example: Send to error monitoring service
        // sendToErrorService(errorLog);
      }
    };

    // Promise rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Better handling of empty or undefined rejections
      let reasonMessage = "Unknown error";

      if (event.reason) {
        if (typeof event.reason === "string") {
          reasonMessage = event.reason;
        } else if (event.reason instanceof Error) {
          reasonMessage = event.reason.message || event.reason.toString();
        } else if (typeof event.reason === "object") {
          try {
            reasonMessage = JSON.stringify(event.reason);
            // If it's just an empty object, provide a more helpful message
            if (reasonMessage === "{}") {
              reasonMessage =
                "Empty promise rejection (possibly from API call failure)";
            }
          } catch {
            reasonMessage = String(event.reason);
          }
        } else {
          reasonMessage = String(event.reason);
        }
      }

      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        message: `Unhandled Promise Rejection: ${reasonMessage}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      setErrors((prev) => [...prev, errorLog]);
      console.error("🔴 Promise rejection captured:", errorLog);

      // Prevent the default unhandled rejection behavior
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  const clearErrors = () => setErrors([]);

  return { errors, clearErrors };
}

export default function ErrorMonitor() {
  const { errors, clearErrors } = useErrorMonitoring();

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-red-800 font-semibold">
          🔴 Error Monitor ({errors.length})
        </h3>
        <button
          onClick={clearErrors}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Clear
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto space-y-2">
        {errors.slice(-3).map((error) => (
          <div
            key={error.id}
            className="text-xs text-red-700 bg-red-100 p-2 rounded"
          >
            <div className="font-mono">{error.message}</div>
            <div className="text-gray-600">
              {new Date(error.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-xs text-gray-500">
          Development mode - errors shown for debugging
        </div>
      )}
    </div>
  );
}
