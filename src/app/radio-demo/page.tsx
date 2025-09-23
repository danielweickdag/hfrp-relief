import RadioPlayer from "@/app/_components/RadioPlayer";

export default function RadioDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">
          HFRP Radio Player Demo
        </h1>

        <div className="grid gap-8">
          {/* Icon Version with Size Controls */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Icon Version with Size Controls
            </h2>
            <div className="flex justify-center mb-8">
              <RadioPlayer
                streamUrl="https://streams.radio.co/s8d5rq2d3q8uv/listen"
                stationName="HFRP Radio"
                size="md"
                variant="icon"
                showSizeControls={true}
              />
            </div>
            <p className="text-gray-600 text-center">
              Use the size buttons above the player to dynamically change the
              radio icon size
            </p>
          </div>

          {/* Icon Version */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Icon Version (For Navbar)
            </h2>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Small</h3>
                <RadioPlayer
                  streamUrl="https://streams.radio.co/s8d5rq2d3q8uv/listen"
                  stationName="HFRP Radio"
                  size="sm"
                  variant="icon"
                />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Medium</h3>
                <RadioPlayer
                  streamUrl="https://streams.radio.co/s8d5rq2d3q8uv/listen"
                  stationName="HFRP Radio"
                  size="md"
                  variant="icon"
                />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Large</h3>
                <RadioPlayer
                  streamUrl="https://streams.radio.co/s8d5rq2d3q8uv/listen"
                  stationName="HFRP Radio"
                  size="lg"
                  variant="icon"
                />
              </div>
            </div>
          </div>

          {/* Full Player Version with Size Controls */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Full Player with Size Controls
            </h2>
            <div className="flex justify-center">
              <RadioPlayer
                streamUrl="https://streams.radio.co/s8d5rq2d3q8uv/listen"
                stationName="HFRP Radio"
                size="md"
                variant="full"
                showSizeControls={true}
              />
            </div>
            <p className="text-gray-600 text-center mt-4">
              Full player with volume control and dynamic size adjustment
            </p>
          </div>

          {/* Full Player Version */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Full Player Version</h2>
            <div className="flex justify-center">
              <RadioPlayer
                streamUrl="https://streams.radio.co/s8d5rq2d3q8uv/listen"
                stationName="HFRP Radio - Haiti Relief"
                size="lg"
                variant="full"
              />
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Usage Examples</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  Basic Icon (No Size Controls)
                </h3>
                <pre className="text-sm bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
                  {`<RadioPlayer 
  variant="icon" 
  size="md" 
  stationName="HFRP Radio" 
/>`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  Icon with Size Controls
                </h3>
                <pre className="text-sm bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
                  {`<RadioPlayer 
  variant="icon" 
  size="md" 
  showSizeControls={true}
  stationName="HFRP Radio" 
/>`}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">
                  Full Player with Size Controls
                </h3>
                <pre className="text-sm bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
                  {`<RadioPlayer 
  variant="full" 
  size="lg" 
  showSizeControls={true}
  streamUrl="https://your-stream-url.com/listen"
  stationName="Your Radio Station" 
/>`}
                </pre>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">
              How to Use Your Radio Stream
            </h2>
            <div className="space-y-4 text-blue-800">
              <div>
                <h3 className="font-semibold">1. Set Your Stream URL</h3>
                <p>Replace the demo URL with your actual radio stream URL:</p>
                <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                  streamUrl="https://stream.zeno.fm/wvdsqqn1cf9uv"
                </code>
              </div>

              <div>
                <h3 className="font-semibold">2. Customize Station Name</h3>
                <p>Update the station name to match your radio station:</p>
                <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                  stationName="Your Station Name"
                </code>
              </div>

              <div>
                <h3 className="font-semibold">
                  3. Popular Radio Hosting Services
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Radio.co</strong> - Easy setup, reliable streaming
                  </li>
                  <li>
                    <strong>Live365</strong> - Professional broadcasting
                    platform
                  </li>
                  <li>
                    <strong>Shoutcast</strong> - Popular streaming solution
                  </li>
                  <li>
                    <strong>Icecast</strong> - Open-source streaming server
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">4. Features</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>✅ Play/Pause controls with visual feedback</li>
                  <li>✅ Volume control slider</li>
                  <li>✅ Loading and error state handling</li>
                  <li>✅ Radio wave animations when playing</li>
                  <li>✅ Mobile responsive design</li>
                  <li>✅ Two variants: icon (navbar) and full player</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
