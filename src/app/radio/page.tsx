import RadioPlayer from "@/app/_components/RadioPlayer";

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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Main Radio Player */}
          <div className="flex justify-center">
            <RadioPlayer
              streamUrl="https://stream.zeno.fm/wvdsqqn1cf9uv"
              externalPlayerUrl="https://listen.zeno.fm/player/family-relief-project-radio-station"
              stationName="HFRP Radio"
              size="lg"
              variant="full"
              className="w-full max-w-md"
            />
          </div>

          {/* Radio Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                About HFRP Radio
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Stay connected with our mission through HFRP Radio,
                  broadcasting hope and inspiration 24/7.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Live updates from our relief efforts in Haiti</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>
                      Inspirational music and Haitian cultural content
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Stories of hope and transformation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Prayer sessions and community announcements</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Streaming Schedule
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Morning Prayer</span>
                  <span className="text-gray-600">6:00 AM - 7:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Haiti Updates</span>
                  <span className="text-gray-600">12:00 PM - 1:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Evening Inspiration</span>
                  <span className="text-gray-600">6:00 PM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Music & Stories</span>
                  <span className="text-gray-600">24/7 Continuous</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">
                Support Our Mission
              </h3>
              <p className="mb-4 text-red-100">
                Every donation helps us reach more families in need and expand
                our radio outreach.
              </p>
              <a href="/donate" className="inline-block bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                Donate Now
              </a>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 6.5 15.5 8zM12 13.5l3.5-2.5v5L12 18.5 8.5 16v-5L12 13.5z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Live Stream
            </h4>
            <p className="text-gray-600 text-sm">
              High-quality audio streaming available 24/7
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Mobile Friendly
            </h4>
            <p className="text-gray-600 text-sm">
              Listen on any device, anywhere, anytime
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Community
            </h4>
            <p className="text-gray-600 text-sm">
              Connect with supporters worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
