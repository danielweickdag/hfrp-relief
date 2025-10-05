export default function StripeAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Stripe Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your Stripe-powered fundraising campaigns and monitor
            real-time donations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Admin Dashboard Temporarily Unavailable
          </h2>
          <p className="text-gray-600">
            This feature is currently disabled during maintenance.
          </p>
        </div>
      </div>
    </div>
  );
}
