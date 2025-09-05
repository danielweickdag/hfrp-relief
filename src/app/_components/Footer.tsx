"use client";

import Link from "next/link";
import Image from "next/image";
import SocialMediaLinks from "./SocialMediaLinks";
import BlvckDlphnLogo from "./BlvckDlphnLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* HFRP Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="relative h-12 w-12 rounded-full mr-3 overflow-hidden">
                <Image
                  src="/hfrp-logo.png"
                  alt="HFRP"
                  fill
                  className="object-cover"
                  sizes="48px"
                  quality={95}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  Haitian Family Relief Project
                </h3>
                <p className="text-gray-400 text-sm">
                  Fighting hunger, providing hope
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Together, we feed and empower Haitian orphans—join us to make a
              lasting difference. Every donation helps provide meals, shelter,
              education, and healthcare to families in need.
            </p>
            <div className="mb-6">
              <SocialMediaLinks variant="footer" size="md" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-gray-300 hover:text-white transition"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/radio"
                  className="text-gray-300 hover:text-white transition"
                >
                  Radio
                </Link>
              </li>
              <li>
                <Link
                  href="/impact"
                  className="text-gray-300 hover:text-white transition"
                >
                  Our Impact
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="text-gray-300 hover:text-white transition"
                >
                  Donate
                </Link>
              </li>
              <li>
                <Link
                  href="/membership"
                  className="text-gray-300 hover:text-white transition"
                >
                  Become a Member
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Programs</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/programs/feeding"
                  className="text-gray-300 hover:text-white transition"
                >
                  Feeding Program
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/healthcare"
                  className="text-gray-300 hover:text-white transition"
                >
                  Healthcare
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/education"
                  className="text-gray-300 hover:text-white transition"
                >
                  Education
                </Link>
              </li>
              <li>
                <Link
                  href="/programs/shelter"
                  className="text-gray-300 hover:text-white transition"
                >
                  Safe Housing
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} Haitian Family Relief Project. All rights
                reserved.
              </p>
            </div>

            {/* Designed By */}
            <div className="flex items-center justify-center space-x-3">
              <p className="text-gray-400 text-sm">Designed by</p>
              {/* BLVCK DLPHN GROUP Logo */}
              <div className="relative">
                <BlvckDlphnLogo width={50} height={50} />
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg tracking-wider">
                  BLVCK DLPHN GROUP
                </div>
                <div className="text-gray-400 text-xs tracking-widest uppercase mb-2">
                  Empowering Your Brand
                </div>
                {/* Contact Information */}
                <div className="space-y-1">
                  <div>
                    <a
                      href="mailto:danielw@blvckdlphn.com"
                      className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors"
                    >
                      danielw@blvckdlphn.com
                    </a>
                  </div>
                  <div>
                    <a
                      href="tel:+17082443552"
                      className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors"
                    >
                      (708) 244-3552
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
