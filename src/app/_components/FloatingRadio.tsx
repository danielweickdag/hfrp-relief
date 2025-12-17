"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Audio element with accessibility improvements
export default function FloatingRadio({ className = "" }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const updateVisibility = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";
      if (direction === "down" && scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = scrollY;
    };
    window.addEventListener("scroll", updateVisibility);
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  // Hide/show based on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateVisibility = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";

      if (direction === "down" && scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = scrollY;
    };

    window.addEventListener("scroll", updateVisibility);
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <>
      <div
        className={`fixed bottom-20 right-4 z-40 md:hidden transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-24"
        } ${className}`}
      >
        <Link
          href="/radio"
          className="relative flex items-center justify-center w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          title="HFRP Radio"
          aria-label="Open radio page"
          onClick={() => {
            if (window.gtag) {
              window.gtag("event", "radio_open", {
                source: "floating-mobile",
                page_path: window.location.pathname,
                timestamp: Date.now(),
                scroll_y: window.scrollY,
                screen_w: window.innerWidth,
              });
            }
          }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </Link>
      </div>
    </>
  );
}

// Extend window interface for analytics
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters: Record<string, unknown>,
    ) => void;
  }
}
