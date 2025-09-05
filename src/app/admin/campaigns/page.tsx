import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns - HFRP Admin",
  description: "Manage fundraising campaigns and initiatives",
};

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Campaign Management
        </h1>
        <p className="text-gray-600 mt-2">
          Create and manage fundraising campaigns, monitor progress, and track
          goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Active Campaigns
            </h2>

            <div className="space-y-4">
              {/* Emergency Food Relief Campaign */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Emergency Food Relief
                    </h3>
                    <p className="text-sm text-gray-500">
                      Providing immediate food assistance
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    Active
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">$15,750 / $25,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "63%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>63% funded</span>
                    <span>15 days remaining</span>
                  </div>
                </div>
              </div>

              {/* School Supply Drive */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      School Supply Drive
                    </h3>
                    <p className="text-sm text-gray-500">
                      Educational materials for orphans
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    Planning
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target</span>
                    <span className="font-medium">$5,000</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Launch date: Next Monday
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
              Create New Campaign
            </button>
          </div>
        </div>

        {/* Campaign Statistics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h2>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-500">Active Campaigns</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$20,750</div>
                <div className="text-sm text-gray-500">Total Raised</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">247</div>
                <div className="text-sm text-gray-500">Contributors</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">
                  New donation to Emergency Food Relief
                </span>
              </div>

              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">
                  Campaign milestone reached
                </span>
              </div>

              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-600">
                  School Drive planning started
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Performance
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500">
              Campaign analytics chart will be displayed here
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Chart.js integration ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
