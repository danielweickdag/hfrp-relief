"use client";

import StripeButton from "@/app/_components/StripeButton";

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Test Mode Notice */}
          {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true" && (
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 max-w-xl mx-auto mb-6">
              <div className="text-yellow-100 text-center">
                <div className="font-bold mb-2">🧪 Test Mode Active</div>
                <div className="text-sm">
                  Payments are processed in test mode - no real charges will be
                  made.
                </div>
              </div>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Support Haiti Relief
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Every donation directly helps families in need
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Featured 50¢ Daily Donation */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Daily Giving - Cents That Count
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Small daily amounts create an immediate, life-changing impact for
              families in Haiti
            </p>
          </div>

          {/* Primary 50¢ Daily Option */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-2xl p-8 text-white text-center transform hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-4">🤍</div>
              <div className="text-6xl font-bold mb-4">50¢</div>
              <div className="text-2xl font-semibold mb-2">per day</div>
              <div className="text-xl mb-6 opacity-90">
                Change a Child's Life Today
              </div>

              <div className="space-y-4">
                <StripeButton
                  className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg w-full"
                  campaignId="hfrp-haiti-relief-fund"
                  variant="popup"
                  amount={15}
                  recurring={true}
                >
                  Give 50¢ Daily - Start Monthly Support
                </StripeButton>

                <p className="text-sm opacity-75">
                  $15 monthly recurring charge. Cancel anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Supporting Message */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-yellow-900 mb-3">
                🌟 Why Give at Least 50 Cents?
              </h3>
              <p className="text-yellow-800 leading-relaxed">
                At 50 cents per day, you're not just providing a meal - you're
                investing in a child's entire future. This amount ensures
                comprehensive support including nutrition, education, and
                healthcare that creates lasting change in a young life. Every 50
                cents builds hope, dignity, and opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* One-Time Donation Options */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Prefer a One-Time Donation?
            </h2>
            <p className="text-gray-600">
              Every contribution makes a difference. Choose any amount that
              feels right for you.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StripeButton
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
                  campaignId="hfrp-haiti-relief-fund"
                  variant="popup"
                  amount={25}
                >
                  $25
                </StripeButton>
                <StripeButton
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
                  campaignId="hfrp-haiti-relief-fund"
                  variant="popup"
                  amount={50}
                >
                  $50
                </StripeButton>
                <StripeButton
                  className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
                  campaignId="hfrp-haiti-relief-fund"
                  variant="popup"
                  amount={100}
                >
                  $100
                </StripeButton>
                <StripeButton
                  className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
                  campaignId="hfrp-haiti-relief-fund"
                  variant="popup"
                  amount={250}
                >
                  $250
                </StripeButton>
              </div>

              <div className="text-center">
                <StripeButton
                  className="bg-gray-700 hover:bg-gray-800 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                  campaignId="hfrp-haiti-relief-fund"
                  variant="popup"
                >
                  Choose Custom Amount
                </StripeButton>
              </div>
            </div>
          </div>
        </section>

        {/* Why Monthly Giving */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Why Monthly Giving Changes Everything
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2">
                  Predictable Support
                </h3>
                <p className="text-blue-100 text-sm">
                  Monthly gifts help us plan long-term programs and respond
                  quickly to emergencies.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-lg font-semibold mb-2">Greater Impact</h3>
                <p className="text-blue-100 text-sm">
                  Small daily amounts create significant monthly support that
                  transforms communities.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-lg font-semibold mb-2">
                  Deeper Connection
                </h3>
                <p className="text-blue-100 text-sm">
                  Monthly donors receive exclusive updates showing exactly how
                  their gifts are used.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative Contact for Donations */}
        <section className="mb-16">
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help with Your Donation?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you experience any issues with the online donation form, you
              can also contact us directly to make your donation or get
              assistance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
              <a 
                href="mailto:contact@haitianfamilyrelief.org?subject=Donation Assistance Request"
                className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <div className="text-2xl mb-2">📧</div>
                <div className="font-semibold text-blue-600 hover:text-blue-800">Email Us</div>
                <div className="text-sm text-gray-600">
                  For donation assistance
                </div>
              </a>
              <a 
                href="/contact"
                className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="font-semibold text-blue-600 hover:text-blue-800">Contact Form</div>
                <div className="text-sm text-gray-600">
                  Get personalized help
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
