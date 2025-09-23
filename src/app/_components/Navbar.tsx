"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RadioPlayer from "./RadioPlayer";

export function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleDonateClick = () => {
    console.log("🔴 NAVBAR DONATE BUTTON CLICKED!");
    console.log("Opening Stripe payment form directly");

    // Navigate to our Stripe-powered donation page
    const isTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";

    if (isTestMode) {
      console.log("🧪 Test mode: redirecting to donation page");
    } else {
      console.log("🌐 Production mode: opening live Stripe donation form");
    }

    // Always go to our donation page which has Stripe integration
    router.push("/donate");

    console.log("✅ Navigated to Stripe donation page");

    // Track with Google Analytics if available
    if (window.gtag) {
      window.gtag("event", "donate_button_click", {
        event_category: "Donations",
        event_label: "navbar_stripe_payment",
        value: 15,
        donation_type: "recurring",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <img
              src="/hfrp-logo.png"
              alt="HFRP Logo"
              className="h-8 w-8 rounded-full mr-3"
            />
            <Link href="/" className="text-white font-bold text-xl">
              Haitian Family Relief Project
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition"
            >
              Home
            </Link>
            <Link
              href="/gallery"
              className="text-white hover:text-gray-300 transition"
            >
              Gallery
            </Link>
            <Link
              href="/radio"
              className="text-white hover:text-gray-300 transition"
            >
              Radio
            </Link>
            <Link
              href="/impact"
              className="text-white hover:text-gray-300 transition"
            >
              Impact
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-gray-300 transition"
            >
              Contact
            </Link>
          </div>

          {/* Right side: Social Media + Donate Button */}
          <div className="flex items-center space-x-4">
            {/* Quick Links (Admin + Radio) */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/admin"
                className="text-white hover:text-gray-300 transition text-sm"
                title="Admin Dashboard"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </Link>

              {/* Radio Player */}
              <RadioPlayer
                streamUrl="https://stream.zeno.fm/wvdsqqn1cf9uv"
                stationName="HFRP Radio"
                size="sm"
                variant="icon"
                className="transition-transform hover:scale-110"
              />
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-6 bg-white/30" />

            {/* Social Media Icons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Facebook */}
              <a
                href="https://facebook.com/haitianfamilyreliefproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Twitter */}
              <a
                href="https://twitter.com/hfrproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-300 transition-colors duration-200"
                aria-label="Follow us on Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/haitianfamilyreliefproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-pink-400 transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.014 5.367 18.637.001 12.017.001zm6.624 13.684c-.003 1.518-.458 2.942-1.314 4.098-.859 1.159-2.051 2.015-3.438 2.468-1.388.452-2.876.452-4.264 0-1.387-.453-2.579-1.309-3.438-2.468-.856-1.156-1.311-2.58-1.314-4.098.003-1.518.458-2.942 1.314-4.098.859-1.159 2.051-2.015 3.438-2.468 1.388-.452 2.876-.452 4.264 0 1.387.453 2.579 1.309 3.438 2.468.856 1.156 1.311 2.58 1.314 4.098z" />
                  <path d="M8.448 16.988c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448zm7.104 0c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448z" />
                </svg>
              </a>
            </div>

            {/* Primary Donate Button - Now opens payment form directly */}
            <button
              onClick={handleDonateClick}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Donate
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
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
                className="text-white hover:text-gray-300 transition text-sm flex items-center gap-2"
                title="Admin Dashboard"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Admin
              </Link>

              {/* Radio Player */}
              <RadioPlayer
                streamUrl="https://stream.zeno.fm/wvdsqqn1cf9uv"
                stationName="HFRP Radio"
                size="sm"
                variant="icon"
                className="transition-transform hover:scale-110"
              />
            </div>

            {/* Social Media Links */}
            <div className="flex items-center justify-center space-x-6 pt-4">
              <a
                href="https://facebook.com/haitianfamilyreliefproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://twitter.com/hfrproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-300 transition-colors duration-200"
                aria-label="Follow us on Twitter"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://instagram.com/haitianfamilyreliefproject"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-pink-400 transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.014 5.367 18.637.001 12.017.001zm6.624 13.684c-.003 1.518-.458 2.942-1.314 4.098-.859 1.159-2.051 2.015-3.438 2.468-1.388.452-2.876.452-4.264 0-1.387-.453-2.579-1.309-3.438-2.468-.856-1.156-1.311-2.58-1.314-4.098.003-1.518.458-2.942 1.314-4.098.859-1.159 2.051-2.015 3.438-2.468 1.388-.452 2.876-.452 4.264 0 1.387.453 2.579 1.309 3.438 2.468.856 1.156 1.311 2.58 1.314 4.098z" />
                  <path d="M8.448 16.988c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448zm7.104 0c-1.297 0-2.448-1.151-2.448-2.448s1.151-2.448 2.448-2.448c1.297 0 2.448 1.151 2.448 2.448s-1.151 2.448-2.448 2.448z" />
                </svg>
              </a>
            </div>

            {/* Mobile Donate Button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  handleDonateClick();
                  closeMobileMenu();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                type="button"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Donate
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Window interface extended in /src/types/global.d.ts
