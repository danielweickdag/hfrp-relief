"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const campaign = searchParams?.get("campaign");
  const amount = searchParams?.get("amount");
  const [donationDetails, setDonationDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // In production, fetch donation details from API
      setDonationDetails({
        amount: amount ? `$${amount}` : "$25.00",
        campaign: campaign
          ? campaign.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          : "HFRP General Fund",
        sessionId,
        transactionId: sessionId.substring(0, 8).toUpperCase(),
        date: new Date().toLocaleDateString(),
      });
      setIsLoading(false);

      // Track successful donation
      if (window.gtag) {
        window.gtag("event", "purchase", {
          transaction_id: sessionId,
          value: Number.parseFloat(amount || "25"),
          currency: "USD",
          items: [
            {
              item_id: campaign || "general",
              item_name: "Donation",
              category: "Charitable Giving",
              quantity: 1,
              price: Number.parseFloat(amount || "25"),
            },
          ],
        });
      }
    } else {
      setIsLoading(false);
    }
  }, [sessionId, campaign, amount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Thank You!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Your donation has been processed successfully.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            You're making a real difference in Haiti! 🇭🇹
          </p>

          {donationDetails && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Donation Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium text-green-600">
                    {donationDetails.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Campaign:</span>
                  <span className="font-medium">
                    {donationDetails.campaign}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{donationDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono text-xs">
                    {donationDetails.transactionId}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-700">
                  📧 A receipt has been sent to your email address. This
                  donation is tax-deductible.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Return Home
              </a>
              <a
                href="/donate"
                className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Donate Again
              </a>
            </div>

            <div className="text-center">
              <a
                href="/about"
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Learn more about our mission →
              </a>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Help us spread the word!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  const text = `I just donated to help families in Haiti! Join me in supporting @HaitianFamilyReliefProject 🇭🇹 #Haiti #Charity`;
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                    "_blank"
                  );
                }}
                className="text-blue-400 hover:text-blue-500 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </button>

              <button
                onClick={() => {
                  const text = `I just donated to help families in Haiti! 🇭🇹`;
                  const url = "https://haitianfamilyrelief.org";
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
                    "_blank"
                  );
                }}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonationSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading donation details...</p>
          </div>
        </div>
      }
    >
      <DonationSuccessContent />
    </Suspense>
  );
}
