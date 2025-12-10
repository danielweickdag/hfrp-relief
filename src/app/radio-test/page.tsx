"use client";

import RadioPlayer from "../_components/RadioPlayerFixed";

export default function RadioTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Radio Streaming Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            HFRP Radio - Zeno.fm Stream Test
          </h2>
          <p className="text-gray-600 mb-6">
            This page tests the radio streaming functionality with the new token
            refresh mechanism to prevent ERR_ABORTED errors from Zeno.fm token
            expiration.
          </p>

          <div className="flex items-center gap-4 mb-6">
            <RadioPlayer
              streamUrl="https://stream.zeno.fm/ttq4haexcf9uv"
              stationName="HFRP Radio"
              variant="full"
              size="lg"
              showSizeControls={true}
              showExternalLink={true}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              🔧 What's Fixed:
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>
                • Automatic token refresh every 45 seconds (before 60s expiry)
              </li>
              <li>• Smart error handling for token expiration</li>
              <li>• Automatic retry with fresh tokens on ERR_ABORTED</li>
              <li>• Seamless stream continuation without interruption</li>
              <li>• Enhanced logging for debugging</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            HLS Stream Test (Alternative)
          </h2>
          <p className="text-gray-600 mb-6">
            Testing HLS format which may provide better stability for some
            browsers.
          </p>

          <div className="flex items-center gap-4 mb-6">
            <RadioPlayer
              streamUrl="https://stream.zeno.fm/hls/ttq4haexcf9uv"
              stationName="HFRP Radio (HLS)"
              variant="full"
              size="lg"
              showSizeControls={true}
              showExternalLink={true}
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              📊 Monitor Console:
            </h3>
            <p className="text-green-800 text-sm">
              Open browser developer tools (F12) and check the Console tab to
              see real-time logging of token refresh and stream management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
