"use client";

import StripeButton from "@/app/_components/StripeButton";

export default function MembershipPage() {
  const handleMembershipSuccess = () => {
    console.log("✅ Membership subscription created successfully!");
  };

  const handleMembershipError = (error: string) => {
    console.error("❌ Membership subscription error:", error);
  };

  return (
    <section className="max-w-4xl mx-auto py-10">
      <h2 className="text-4xl font-bold text-center mb-4">Membership</h2>
      <p className="text-center text-lg mb-8 text-zinc-700">
        Join our family of recurring supporters! Choose a monthly or yearly plan
        and make a difference every day.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Basic Monthly */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Basic</h3>
          <div className="text-3xl font-bold text-red-600 mb-2">
            $4.80<span className="text-sm text-gray-500">/month</span>
          </div>
          <p className="text-gray-600 mb-6">
            16¢ per day helps provide clean water
          </p>
          <StripeButton
            campaignId="haiti-relief-membership"
            amount={4.8}
            recurring={true}
            interval="month"
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            onSuccess={handleMembershipSuccess}
            onError={handleMembershipError}
          >
            Choose Basic
          </StripeButton>
        </div>

        {/* Standard Monthly */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-red-500 p-6 text-center relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Standard</h3>
          <div className="text-3xl font-bold text-red-600 mb-2">
            $15.00<span className="text-sm text-gray-500">/month</span>
          </div>
          <p className="text-gray-600 mb-6">
            50¢ per day provides meals & education
          </p>
          <StripeButton
            campaignId="haiti-relief-membership"
            amount={15.0}
            recurring={true}
            interval="month"
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            onSuccess={handleMembershipSuccess}
            onError={handleMembershipError}
          >
            Choose Standard
          </StripeButton>
        </div>

        {/* Premium Monthly */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium</h3>
          <div className="text-3xl font-bold text-red-600 mb-2">
            $50.00<span className="text-sm text-gray-500">/month</span>
          </div>
          <p className="text-gray-600 mb-6">
            $1.67 per day supports entire families
          </p>
          <StripeButton
            campaignId="haiti-relief-membership"
            amount={50.0}
            recurring={true}
            interval="month"
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            onSuccess={handleMembershipSuccess}
            onError={handleMembershipError}
          >
            Choose Premium
          </StripeButton>
        </div>
      </div>

      {/* Annual Options */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-8">
        <h3 className="text-2xl font-bold text-center text-blue-800 mb-4">
          Annual Memberships (Save 10%)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <StripeButton
              campaignId="haiti-relief-membership"
              amount={51.84}
              recurring={true}
              interval="year"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onSuccess={handleMembershipSuccess}
              onError={handleMembershipError}
            >
              Basic Annual - $51.84/year
            </StripeButton>
          </div>
          <div className="text-center">
            <StripeButton
              campaignId="haiti-relief-membership"
              amount={162.0}
              recurring={true}
              interval="year"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onSuccess={handleMembershipSuccess}
              onError={handleMembershipError}
            >
              Standard Annual - $162/year
            </StripeButton>
          </div>
          <div className="text-center">
            <StripeButton
              campaignId="haiti-relief-membership"
              amount={540.0}
              recurring={true}
              interval="year"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onSuccess={handleMembershipSuccess}
              onError={handleMembershipError}
            >
              Premium Annual - $540/year
            </StripeButton>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-600">
        <p className="mb-2">
          All memberships are securely processed by Stripe.
        </p>
        <p className="text-sm">
          You can cancel or modify your membership at any time.
        </p>
      </div>
    </section>
  );
}
