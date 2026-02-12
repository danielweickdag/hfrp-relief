"use client";

import { useEffect, type ReactNode } from "react";

// Extend window with HFRP helpers
declare global {
  interface Window {
    hfrpEnablePrintFeatures?: () => void;
    hfrpEnableSiteFeatures?: () => void;
    hfrpDisableSiteFeatures?: () => Promise<void> | void;
    hfrpGetFeatureStatus?: () => boolean;
  }
}

export default function ClientBody({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset body classes after hydration
    document.body.className = "antialiased";

    let debounceTimer: number | null = null;

    // Auto-inject print buttons into any element marked as data-printable
    const injectPrintButtons = () => {
      const printableNodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-printable]"),
      );

      for (const node of printableNodes) {
        if (node.querySelector('[data-print-button="injected"]')) continue;

        const title = node.getAttribute("data-print-title") || "Report";

        const btn = document.createElement("button");
        btn.setAttribute("data-print-button", "injected");
        btn.className =
          "absolute top-3 right-3 bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors border border-gray-200 text-sm flex items-center gap-2 print:hidden";
        btn.title = "Print this section";
        btn.setAttribute("aria-label", `Print ${title}`);
        btn.innerHTML =
          '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 2a2 2 0 00-2 2v2h12V4a2 2 0 00-2-2H6z" /><path d="M4 8a2 2 0 00-2 2v3a2 2 0 002 2h2v3h8v-3h2a2 2 0 002-2v-3a2 2 0 00-2-2H4zm4 9v-5h4v5H8z" /></svg><span>Print</span>';

        // Ensure the node is positioned for absolute button placement
        const computedStyle = window.getComputedStyle(node);
        if (computedStyle.position === "static") {
          node.style.position = "relative";
        }

        btn.addEventListener("click", () => {
          const printWindow = window.open("", "PRINT", "height=900,width=1200");
          if (!printWindow) return;

          const styles = Array.from(
            document.querySelectorAll('link[rel="stylesheet"], style'),
          )
            .map((el) => (el as HTMLElement).outerHTML)
            .join("\n");

          printWindow.document.write(
            `<!doctype html><html lang="en"><head><title>${title}</title>${styles}</head><body>`,
          );
          printWindow.document.write(`<div class="p-6">`);
          printWindow.document.write(
            `<h1 class="text-2xl font-bold mb-4">${title}</h1>`,
          );
          printWindow.document.write(node.innerHTML);
          printWindow.document.write("</div>");
          printWindow.document.write("</body></html>");
          printWindow.document.close();
          printWindow.focus();
          // Small delay to ensure styles are loaded
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 300);
        });

        node.appendChild(btn);
      }
    };

    // Minimal service worker registration (PWA enable)
    const registerServiceWorker = async () => {
      if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        process.env.NODE_ENV === "production"
      ) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      } else {
        // Unregister service worker in development to avoid caching issues
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            registration.unregister();
          }
        }
      }
    };

    // Expose helpers on window
    try {
      window.hfrpEnablePrintFeatures = () => {
        injectPrintButtons();
        console.log("HFRP: Print features enabled");
      };

      window.hfrpEnableSiteFeatures = () => {
        try {
          localStorage.setItem("hfrp_features_enabled", "true");
        } catch {}
        injectPrintButtons();
        registerServiceWorker();
        console.log("HFRP: Site features enabled");
      };

      window.hfrpDisableSiteFeatures = async () => {
        try {
          localStorage.setItem("hfrp_features_enabled", "false");
        } catch {}

        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            reg.unregister();
          }
        }

        console.log("HFRP: Site features disabled");
      };

      window.hfrpGetFeatureStatus = () =>
        (() => {
          try {
            return localStorage.getItem("hfrp_features_enabled") === "true";
          } catch {
            return false;
          }
        })();
    } catch (e) {
      // ignore
    }

    try {
      if (localStorage.getItem("hfrp_features_enabled") === "true") {
        registerServiceWorker();
      }
    } catch {}

    // Initial injection
    injectPrintButtons();

    const observer = new MutationObserver(injectPrintButtons);
    observer.observe(document.body, { childList: true, subtree: true, attributes: false });

    return () => {
      // Clear debounce timer
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      // Disconnect observer
      observer.disconnect();

      // Remove injected print buttons and revert parent style changes
      const injectedButtons = document.querySelectorAll('[data-print-button="injected"]');
      for (const el of injectedButtons) {
        const parent = el.parentElement;
        if (parent) {
          if (el.getAttribute("data-print-parent-position-changed") === "true") {
            (parent.style as any).position = "";
          }
          parent.removeChild(el);
        }
      }

      // Remove globals we added
      try {
        delete window.hfrpEnablePrintFeatures;
        delete window.hfrpEnableSiteFeatures;
        delete window.hfrpDisableSiteFeatures;
        delete window.hfrpGetFeatureStatus;
      } catch {}
    };
  }, []);

  return <div className="antialiased">{children}</div>;
}