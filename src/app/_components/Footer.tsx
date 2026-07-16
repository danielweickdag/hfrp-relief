"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import SocialMediaLinks from "./SocialMediaLinks";
import BlvckDlphnLogo from "./BlvckDlphnLogo";

interface FooterProps {
  socialIconSettings: {
    facebook: boolean;
    instagram: boolean;
    twitter: boolean;
    youtube: boolean;
    tiktok: boolean;
  };
}

export default function Footer({ socialIconSettings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const showSocialMedia = Object.values(socialIconSettings).some((v) => v);

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
            {showSocialMedia && (
              <div className="mb-6">
                <SocialMediaLinks
                  variant="footer"
                  size="md"
                  socialIconSettings={socialIconSettings}
                />
              </div>
            )}
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
                  Join Our Community
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
            <div className="flex items-center justify-center md:justify-end space-x-2">
              <p className="text-gray-400 text-base">Designed & Developed by</p>
              <div className="relative group">
                {/* Text that triggers the popup */}
                <a href="https://blvckdlphn.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 font-semibold text-base transition-colors">
                  BLVCK DLPHN GROUP
                </a>

                {/* Popup Card */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl opacity-0 transform scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-10">
                  <div className="flex flex-col items-center text-center">
                    <BlvckDlphnLogo width={40} height={40} />
                    <p className="text-gray-400 text-xs tracking-widest uppercase mt-3 mb-2">Empowering Your Brand</p>
                    <div className="space-y-1 text-sm">
                      <div>
                        <a href="mailto:danielw@blvckdlphn.com" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          danielw@blvckdlphn.com
                        </a>
                      </div>
                      <div>
                        <a href="tel:+17082443552" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          (708) 244-3552
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-700"></div>
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
