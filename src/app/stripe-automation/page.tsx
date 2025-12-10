"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function StripeAutomationPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold">Automated Donation System</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience our fully automated donation and event management system
          powered by Stripe. Every contribution triggers automated milestone
          tracking, social media posts, and email updates.
        </p>

        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <p className="text-gray-600">
            Stripe automation features are temporarily unavailable during
            deployment.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
