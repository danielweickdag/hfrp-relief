"use client";

// Force dynamic rendering for all admin pages to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { AdminAuthProvider } from "../_components/AdminAuth";
import { ErrorBoundary } from "../_components/ErrorBoundary";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Add CSS fallback styles to head
    const fallbackCSS = document.createElement("style");
    fallbackCSS.id = "core-css-fallback";
    fallbackCSS.textContent = `
      /* Admin Panel Critical Fallback Styles */
      .admin-container { 
        display: block !important; 
        min-height: 100vh;
        background: #f9fafb;
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      .loading-error { 
        padding: 2rem; 
        border: 2px solid #dc2626; 
        background: #fef2f2;
        color: #991b1b;
        font-size: 1.2rem;
        margin: 2rem;
        border-radius: 8px;
      }
      
      .admin-error {
        display: block !important;
        min-height: 100vh;
        background: #f9fafb;
      }

      /* Basic admin form styles */
      .admin-form {
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }

      .admin-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        margin-bottom: 1rem;
        font-size: 1rem;
      }

      .admin-button {
        background: #dc2626;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        width: 100%;
      }

      .admin-button:hover {
        background: #b91c1c;
      }

      /* Basic dashboard layout */
      .admin-dashboard {
        padding: 2rem;
      }

      .admin-header {
        background: white;
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 2rem;
      }

      /* Ensure text is readable */
      body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.5;
        color: #111827;
      }
    `;
    document.head.appendChild(fallbackCSS);

    // CSS loading detection and cleanup
    const checkMainCSS = () => {
      // Look for main CSS stylesheets (Tailwind, globals.css, etc.)
      const mainCSSLinks = document.querySelectorAll(
        'link[rel="stylesheet"]'
      ) as NodeListOf<HTMLLinkElement>;
      let mainCSSLoaded = false;

      for (const link of mainCSSLinks) {
        try {
          // Check if stylesheet has loaded and has rules
          if (
            link.sheet &&
            link.sheet.cssRules &&
            link.sheet.cssRules.length > 0
          ) {
            mainCSSLoaded = true;
            break;
          }
        } catch (e) {
          // Cross-origin stylesheets may throw errors, but that's okay
          // We'll assume they loaded if they exist
          if (link.href) {
            mainCSSLoaded = true;
            break;
          }
        }
      }

      if (!mainCSSLoaded) {
        console.warn("Main CSS failed to load - using fallback styles");
      } else {
        console.log("Main CSS loaded successfully - removing fallback");
        const fallbackStyle = document.getElementById("core-css-fallback");
        if (fallbackStyle) {
          fallbackStyle.remove();
        }
      }
    };

    // Check immediately
    checkMainCSS();

    // Also check after a delay to catch late-loading styles
    const timeout = setTimeout(checkMainCSS, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timeout);
      const fallbackStyle = document.getElementById("core-css-fallback");
      if (fallbackStyle) {
        fallbackStyle.remove();
      }
    };
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Admin Panel Error
            </h2>
            <p className="text-gray-600 mb-4">
              There was an issue loading the admin panel. Please try refreshing
              the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </ErrorBoundary>
  );
}
