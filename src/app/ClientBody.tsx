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

    const injectPrintButtons = () => {
      // Debounce to avoid rapid DOM churn from large mutations
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null;

        const printableNodes = Array.from(
          document.querySelectorAll<HTMLElement>("[data-printable]")
        );

        printableNodes.forEach((node) => {
          // Skip if we've already injected a button into this node
          if (node.querySelector('[data-print-button="injected"]')) return;

          const title = node.getAttribute("data-print-title") || "Report";

          const btn = document.createElement("button");
          btn.setAttribute("data-print-button", "injected");
          btn.type = "button";
          btn.className =
            "absolute top-3 right-3 bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors border border-gray-200 text-sm flex items-center gap-2";
          btn.title = "Print this section";
          btn.setAttribute("aria-label", `Print ${title}`);

          btn.innerHTML = `
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6 2a2 2 0 00-2 2v2h12V4a2 2 0 00-2-2H6z" />
              <path d="M4 8a2 2 0 00-2 2v3a2 2 0 002 2h2v3h8v-3h2a2 2 0 002-2v-3a2 2 0 00-2-2H4zm4 9v-5h4v5H8z" />
            </svg>
            <span>Print</span>
          `;

          try {
            const computedStyle = window.getComputedStyle(node);
            if (computedStyle.position === "static") {
              // Only change inline style so we don't permanently alter stylesheets
              (node.style as any).position = "relative";
              btn.setAttribute("data-print-parent-position-changed", "true");
            }
          } catch (e) {
            // ignore
          }

          const onClick = () => {
            const printWindow = window.open("", "PRINT", "height=900,width=1200");
            if (!printWindow) return;

            try {
              const styles = Array.from(
                document.querySelectorAll('link[rel="stylesheet"], style')
              )
                .map((el) => el.outerHTML)
                .join("\n");

              printWindow.document.open();
              printWindow.document.write(`
                <!doctype html>
                <html>
                  <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width,initial-scale=1" />
                    <title>${title}</title>
                    ${styles}
                    <style>body{ margin:0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }</style>
                  </head>
                  <body>
                    <div class="p-6">
                      <h1 class="text-2xl font-bold mb-4">${title}</h1>
                      ${node.innerHTML}
                    </div>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.focus();

              // Give the new window a moment to render resources before printing
              setTimeout(() => {
                try {
                  printWindow.print();
                } catch (e) {
                  console.warn("HFRP: Print failed", e);
                }
                try {
                  printWindow.close();
                } catch {}
              }, 300);
            } catch (e) {
              console.warn("HFRP: Unable to open print window", e);
            }
          };

          btn.addEventListener("click", onClick);

          node.appendChild(btn);
        });
      }, 250);
    };

    const registerServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        console.log("HFRP: Service worker registered", reg.scope);
      } catch (e) {
        console.warn("HFRP: Service worker registration failed", e);
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
          registrations.forEach((reg) => reg.unregister());
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
      document.querySelectorAll('[data-print-button="injected"]').forEach((el) => {
        const parent = el.parentElement;
        el.remove();
        if (parent && parent.getAttribute('data-print-parent-position-changed') === 'true') {
          parent.style.position = "";
          parent.removeAttribute('data-print-parent-position-changed');
        }
      });

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