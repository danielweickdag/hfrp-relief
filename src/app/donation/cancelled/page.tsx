"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DonationCancelledContent() {
  const searchParams = useSearchParams();
  const campaign = searchParams?.get("campaign");

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Donation Cancelled
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Your donation was cancelled. No charges have been made.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            We understand that sometimes plans change.
          </p>

          {campaign && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow">
              <p className="text-sm text-gray-600">
                You were donating to:{" "}
                <span className="font-medium">
                  {campaign
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <a
                href="/donate"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Try Again
              </a>

              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-300 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Return to Home
              </a>
            </div>
          </div>

          {/* Alternative Ways to Help */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              Other Ways to Help
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
                <span>Volunteer with us</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
                </svg>
                <span>Share our mission</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Pray for Haiti</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <a
                href="/about"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
              >
                Learn more about our work →
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 text-sm text-gray-600">
            <p>Have questions or need help?</p>
            <p className="mt-1">
              Contact us at{" "}
              <a
                href="mailto:contact@familyreliefproject.org"
                className="text-blue-600 hover:text-blue-500 transition-colors"
              >
                contact@familyreliefproject.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonationCancelled() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <DonationCancelledContent />
    </Suspense>
  );
}
