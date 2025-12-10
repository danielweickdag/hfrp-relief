"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RadioPlayer from "./RadioPlayerFixed";

export function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handlePrintClick = () => {
    try {
      // Enhanced print functionality with better page setup
      const printStyles = `
        <style>
          @media print {
            * {
              visibility: hidden;
            }
            .printable, .printable * {
              visibility: visible;
            }
            .printable {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.4;
              color: #000;
              background: #fff;
            }
            .no-print {
              display: none !important;
            }
            .print-header {
              display: block !important;
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-logo {
              max-height: 60px;
              width: auto;
              margin: 0 auto 10px;
              display: block;
            }
            .print-title {
              font-size: 18pt;
              font-weight: bold;
              margin: 0;
            }
            .print-subtitle {
              font-size: 12pt;
              color: #666;
              margin: 5px 0 0 0;
            }
          }
        </style>
      `;

      // Add print styles to document head
      const styleElement = document.createElement("style");
      styleElement.innerHTML = printStyles;
      document.head.appendChild(styleElement);

      // Add printable class to main content
      const mainContent = document.querySelector("main") || document.body;
      mainContent.classList.add("printable");

      // Create print header if it doesn't exist
      let printHeader = document.querySelector(".print-header");
      if (!printHeader) {
        printHeader = document.createElement("div");
        printHeader.className = "print-header";
        printHeader.innerHTML = `
          <img src="/hfrp-logo.png" alt="HFRP Logo" class="print-logo">
          <h1 class="print-title">Haitian Family Relief Project</h1>
          <p class="print-subtitle">Relief Report - ${new Date().toLocaleDateString()}</p>
        `;
        mainContent.insertBefore(printHeader, mainContent.firstChild);
      }

      // Trigger print
      window.print();

      // Cleanup after print
      setTimeout(() => {
        document.head.removeChild(styleElement);
        mainContent.classList.remove("printable");
        if (printHeader && printHeader.parentNode) {
          printHeader.parentNode.removeChild(printHeader);
        }
      }, 1000);
    } catch (error) {
      console.error("Print functionality error:", error);
      // Fallback to simple print
      window.print();
    }
  };

  const handleEnableFeatures = () => {
    try {
      // Enable advanced features
      localStorage.setItem("hfrp_advanced_features", "enabled");

      // Dispatch custom event for feature enablement
      const event = new CustomEvent("hfrp:featuresEnabled", {
        detail: { timestamp: Date.now() },
      });
      window.dispatchEvent(event);

      // Show confirmation
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Advanced features enabled!</span>
        </div>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    } catch (error) {
      console.error("Feature enablement error:", error);
    }
  };

  const handleDonateClick = () => {
    router.push("/donate");
  };

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section - Better fitting with responsive design */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                src="/hfrp-logo.png"
                alt="HFRP Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full mr-2 sm:mr-3"
              />
              <span className="text-white font-bold text-sm sm:text-lg lg:text-xl leading-tight">
                <span className="hidden sm:inline">
                  Haitian Family Relief Project
                </span>
                <span className="sm:hidden">HFRP</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Better balanced spacing */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <div className="flex items-center space-x-4 lg:space-x-6">
              <Link
                href="/"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                Home
              </Link>
              <Link
                href="/gallery"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                Gallery
              </Link>
              <Link
                href="/radio"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                Radio
              </Link>
              <Link
                href="/impact"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                Impact
              </Link>
              <Link
                href="/programs"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                Programs
              </Link>
              <Link
                href="/blog"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium text-sm lg:text-base"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
              >
                Contact
              </Link>
            </div>

            {/* Admin Login Button - Icon Only */}
            <div className="flex items-center ml-6 lg:ml-8">
              <Link
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg group"
                title="Admin Login"
                aria-label="Admin Login"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right side items for mobile */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Radio Link */}
            <Link
              href="/radio"
              className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
              title="HFRP Radio"
              aria-label="Open radio page"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-300 transition-colors duration-200 p-2"
              aria-label="Toggle mobile menu"
              aria-expanded={isMounted && isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMounted && isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown - Enhanced */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-white/10">
          <div className="px-4 py-4 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-3">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Home
              </Link>
              <Link
                href="/gallery"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Gallery
              </Link>
              <Link
                href="/radio"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Radio
              </Link>
              <Link
                href="/impact"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Impact
              </Link>
              <Link
                href="/programs"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Programs
              </Link>
              <Link
                href="/blog"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Blog
              </Link>
              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                About
              </Link>
              <Link
                href="/donate"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Donate
              </Link>
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="block text-white hover:text-gray-300 transition py-2 text-lg"
              >
                Contact
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-white/20 my-4"></div>

            {/* Admin Link & Radio Player */}
            <div className="flex items-center justify-between">
              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className="text-white hover:text-gray-300 transition p-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                title="Admin Login"
                aria-label="Admin Login"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </Link>

              {/* Radio Link */}
              <Link
                href="/radio"
                className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                title="HFRP Radio"
                aria-label="Open radio page"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Link>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center justify-center space-x-6 pt-4">
              <a
                href="https://facebook.com/familyreliefproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://twitter.com/familyreliefproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-300 transition-colors duration-200"
                aria-label="Follow us on Twitter"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://instagram.com/familyreliefproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-pink-400 transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.014 5.367 18.637.001 12.017.001zm6.624 13.684c-.003 1.518-.458 2.942-1.314 4.098-.859 1.159-2.051 2.015-3.438 2.468-1.388.452-2.876.452-4.264 0-1.387-.453-2.579-1.309-3.438-2.468-.856-1.156-1.311-2.58-1.314-4.098.003-1.518.458-2.942 1.314-4.098.859-1.159 2.051-2.015 3.438-2.468 1.388-.452 2.876-.452 4.264 0 1.387.453 2.579 1.309 3.438 2.468.856 1.156 1.311 2.58 1.314 4.098z" />
                  <path d="M8.448 16.988c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151-2.448-2.448 2.448zm7.104 0c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Window interface extended in /src/types/global.d.ts
