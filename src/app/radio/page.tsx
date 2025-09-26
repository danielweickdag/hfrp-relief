export default function RadioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HFRP Radio Stream
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Listen to inspirational music, updates from Haiti, and stories of
            hope from the Haitian Family Relief Project
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Radio Player Temporarily Unavailable
          </h2>
          <p className="text-gray-600">
            This feature is currently disabled during maintenance.
          </p>
        </div>
      </div>
    </div>
  );
}
