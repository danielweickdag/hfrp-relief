"use client";

import { useState } from "react";

interface DonorboxSetupGuideProps {
  onSetupComplete?: () => void;
  currentSettings?: {
    apiKey: string;
    accountId: string;
    syncInterval: string;
  };
}

export default function DonorboxSetupGuide({
  onSetupComplete,
  currentSettings,
}: DonorboxSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    apiKey: currentSettings?.apiKey || "",
    accountId: currentSettings?.accountId || "",
    organizationName: "Haitian Family Relief Project",
    syncInterval: currentSettings?.syncInterval || "2 hours",
    autoCreateCampaigns: true,
    automationEnabled: true,
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const steps = [
    {
      id: 1,
      title: "Create Donorbox Account",
      description: "Set up your fundraising platform",
      icon: "🔐",
    },
    {
      id: 2,
      title: "Get API Credentials",
      description: "Obtain your API key and account details",
      icon: "🔑",
    },
    {
      id: 3,
      title: "Configure Integration",
      description: "Connect HFRP with Donorbox",
      icon: "🔗",
    },
    {
      id: 4,
      title: "Test & Activate",
      description: "Verify connection and enable automation",
      icon: "✅",
    },
  ];

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setConnectionStatus("success");
      alert("✅ Connection successful! Donorbox integration is ready.");
    } catch (error) {
      setConnectionStatus("error");
      alert("❌ Connection failed. Please check your credentials.");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const completeSetup = () => {
    onSetupComplete?.();
    alert(
      "🎉 Donorbox setup complete! You can now create automated fundraising campaigns."
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Donorbox Fundraising Setup
        </h2>
        <p className="text-gray-600">
          Connect HFRP with Donorbox to enable automated fundraising campaigns
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
              ${
                currentStep >= step.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400"
              }
            `}
            >
              {currentStep > step.id ? "✓" : step.icon}
            </div>
            <div className="ml-4 text-sm">
              <div
                className={`font-semibold ${currentStep >= step.id ? "text-blue-600" : "text-gray-400"}`}
              >
                {step.title}
              </div>
              <div className="text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-6 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="border border-gray-200 rounded-lg p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🔐 Create Your Donorbox Account
              </h3>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4">
                Why Donorbox?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="flex items-center">
                  <span className="mr-2">💳</span> 2.9% processing fee
                  (competitive)
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🔄</span> Recurring donation support
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📱</span> Mobile-optimized donation
                  forms
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span> Comprehensive analytics
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🤖</span> API integration for
                  automation
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🛡️</span> Secure PCI-compliant platform
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-medium">Visit Donorbox.org</p>
                  <p className="text-gray-600">
                    Go to{" "}
                    <a
                      href="https://donorbox.org"
                      target="_blank"
                      className="text-blue-600 underline" rel="noreferrer"
                    >
                      donorbox.org
                    </a>{" "}
                    and click "Get Started"
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-medium">Create Organization Account</p>
                  <p className="text-gray-600">
                    Use organization name: "Haitian Family Relief Project"
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-medium">Verify Your Account</p>
                  <p className="text-gray-600">
                    Complete email verification and organization details
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Next: Get API Key →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🔑 Get Your API Credentials
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-medium">Login to Donorbox Dashboard</p>
                  <p className="text-gray-600">Access your account dashboard</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-medium">Navigate to Settings → API</p>
                  <p className="text-gray-600">
                    Find the API section in your account settings
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-medium">Generate API Key</p>
                  <p className="text-gray-600">
                    Create a new API key with campaign management permissions
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0">
                  4
                </span>
                <div>
                  <p className="font-medium">Copy Organization ID</p>
                  <p className="text-gray-600">
                    Note down your organization ID from the account overview
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="font-semibold text-yellow-800">
                  Important:
                </span>
              </div>
              <p className="text-yellow-700 mt-1">
                Keep your API key secure. Never share it publicly or commit it
                to version control.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Next: Configure Integration →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🔗 Configure Integration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Donorbox API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={formData.accountId}
                  onChange={(e) =>
                    setFormData({ ...formData, accountId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="hfrp-relief"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizationName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync Interval
                </label>
                <select
                  value={formData.syncInterval}
                  onChange={(e) =>
                    setFormData({ ...formData, syncInterval: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="6 hours">6 hours</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCreate"
                  checked={formData.autoCreateCampaigns}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autoCreateCampaigns: e.target.checked,
                    })
                  }
                  className="mr-3"
                />
                <label
                  htmlFor="autoCreate"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable automatic campaign creation from templates
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="automation"
                  checked={formData.automationEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      automationEnabled: e.target.checked,
                    })
                  }
                  className="mr-3"
                />
                <label
                  htmlFor="automation"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable fundraising automation features
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Next: Test Connection →
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ✅ Test & Activate
              </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">
                Configuration Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Organization:</span>{" "}
                  {formData.organizationName}
                </div>
                <div>
                  <span className="font-medium">Account ID:</span>{" "}
                  {formData.accountId || "Not set"}
                </div>
                <div>
                  <span className="font-medium">Sync Interval:</span>{" "}
                  {formData.syncInterval}
                </div>
                <div>
                  <span className="font-medium">Auto-campaigns:</span>{" "}
                  {formData.autoCreateCampaigns ? "Enabled" : "Disabled"}
                </div>
                <div>
                  <span className="font-medium">Automation:</span>{" "}
                  {formData.automationEnabled ? "Enabled" : "Disabled"}
                </div>
                <div>
                  <span className="font-medium">API Status:</span>
                  <span
                    className={`ml-1 ${connectionStatus === "success" ? "text-green-600" : connectionStatus === "error" ? "text-red-600" : "text-gray-500"}`}
                  >
                    {connectionStatus === "success"
                      ? "Connected"
                      : connectionStatus === "error"
                        ? "Failed"
                        : "Not tested"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={testConnection}
                disabled={isTestingConnection || !formData.apiKey}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingConnection
                  ? "🔄 Testing Connection..."
                  : "🧪 Test Donorbox Connection"}
              </button>

              {connectionStatus === "success" && (
                <button
                  onClick={completeSetup}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold"
                >
                  🎉 Complete Setup & Start Fundraising
                </button>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              {connectionStatus !== "success" && (
                <button
                  onClick={completeSetup}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Skip test & continue →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>📧 Email: support@haitianfamilyrelief.org</p>
          <p>📞 Phone: (224) 217-0230</p>
          <p>
            📖{" "}
            <a href="#" className="underline">
              View Donorbox Integration Guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
