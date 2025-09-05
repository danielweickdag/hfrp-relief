// Example: Updated Radio Page with Combined Player
import CombinedRadioPlayer from "@/app/_components/CombinedRadioPlayer";

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

        <div className="grid md:grid-cols-1 gap-8">
          {/* Combined Radio Player with both options */}
          <div className="flex justify-center">
            <CombinedRadioPlayer
              stationSlug="fgm-radio-haiti"
              streamUrl="https://stream.zeno.fm/hls/wvdsqqn1cf9uv"
              stationName="HFRP Radio"
              defaultPlayer="native"
              className="w-full max-w-2xl"
            />
          </div>

          {/* Radio Information */}
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  🎵 Player Options
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Native Player:</strong> Direct stream, lower data
                    usage
                  </p>
                  <p>
                    <strong>Zeno.FM Player:</strong> Full features, chat,
                    metadata
                  </p>
                  <p>
                    <strong>Switch anytime:</strong> Use the tabs above the
                    player
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  📻 Now Playing
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>Live from Haiti</p>
                  <p>Inspirational music and updates</p>
                  <p>Community stories and hope</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
