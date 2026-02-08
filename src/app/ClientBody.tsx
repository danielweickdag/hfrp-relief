"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";

    // Auto-inject print buttons into any element marked as data-printable
    const injectPrintButtons = () => {
      const printableNodes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-printable]"),
      );

      printableNodes.forEach((node) => {
        if (node.querySelector('[data-print-button="injected"]')) return;

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
      });
    };

    let debounceTimer: NodeJS.Timeout;
    const debouncedInject = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(injectPrintButtons, 250);
    };

    // Minimal service worker registration (PWA enable)
    const registerServiceWorker = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.register("/sw.js");
          console.log("HFRP: Service worker registered", reg.scope);
        }
      } catch (e) {
        console.warn("HFRP: Service worker registration failed", e);
      }
    };

    // Expose manual enable/disable functions on window
    try {
      (
        window as Window & { hfrpEnablePrintFeatures?: () => void }
      ).hfrpEnablePrintFeatures = () => {
        injectPrintButtons();
        console.log("HFRP: Print features enabled (buttons injected)");
      };
      (
        window as Window & { hfrpEnableSiteFeatures?: () => void }
      ).hfrpEnableSiteFeatures = () => {
        try {
          localStorage.setItem("hfrp_features_enabled", "true");
        } catch {}
        injectPrintButtons();
        registerServiceWorker();
        console.log("HFRP: Site features enabled (print + PWA)");
      };
      (
        window as Window & { hfrpDisableSiteFeatures?: () => void }
      ).hfrpDisableSiteFeatures = () => {
        try {
          localStorage.setItem("hfrp_features_enabled", "false");
        } catch {}
        // Unregister service worker
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
        }
        console.log("HFRP: Site features disabled (PWA unregistered)");
      };
      (
        window as Window & { hfrpGetFeatureStatus?: () => boolean }
      ).hfrpGetFeatureStatus = () => {
        try {
          return localStorage.getItem("hfrp_features_enabled") === "true";
        } catch {
          return false;
        }
      };
    } catch {}

    // Apply persisted enable flag on load
    try {
      const enabled = localStorage.getItem("hfrp_features_enabled") === "true";
      if (enabled) {
        registerServiceWorker();
      }
    } catch {}

    injectPrintButtons();
    const observer = new MutationObserver(() => debouncedInject());
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
      // Remove injected buttons
      document.querySelectorAll('[data-print-button="injected"]').forEach(btn => btn.remove());
    };
  }, []);

  return <div className="antialiased">{children}</div>;
}
