"use client";

// Force dynamic rendering to prevent localStorage SSR issues
export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  AdminAuthProvider,
  useAdminAuth,
  WithPermission,
} from "../../_components/AdminAuth";
import Link from "next/link";

interface SettingsFormData {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  gaTrackingId: string;
  fbUrl: string;
  igUrl: string;
  twUrl: string;
  stripeCampaignId: string;
  enableDonationTest: boolean;
}

function SettingsContent() {
  const { isAuthenticated, isLoading, user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<
    "general" | "contact" | "social" | "donation" | "api"
  >("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSocialMediaLinks, setShowSocialMediaLinks] = useState(true);

  // Direct Stripe Connect onboarding link provided by admin
  const stripeConnectOnboardingUrl =
    "https://connect.stripe.com/d/setup/e/_TO365uSkCCbOqJ0ITW8P4bEW5C/YWNjdF8xU1BNUEwyTGZScmJJTTdq/6a2d66962b0c34ff8";

  const [formData, setFormData] = useState<SettingsFormData>({
    siteTitle: "Haitian Family Relief Project",
    siteDescription:
      "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
    contactEmail: "haitianfamilyrelief@gmail.com",
    contactPhone: "(224) 217-0230",
    gaTrackingId: "",
    fbUrl: "https://facebook.com/haitianfamilyrelief",
    igUrl: "https://instagram.com/haitianfamilyrelief",
    twUrl: "https://twitter.com/hfrp_haiti",
    stripeCampaignId: "haiti-relief-main",
    enableDonationTest: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the site settings.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
            <p className="text-gray-600">Configure your website settings</p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Stripe Connect Onboarding Quick Link */}
        <div className="mb-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-indigo-900">
                Stripe Connect Onboarding
              </h2>
              <p className="text-sm text-indigo-700">
                Use this link to complete or continue onboarding for Stripe
                Connect. Opens in a new tab.
              </p>
            </div>
            <a
              href={stripeConnectOnboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <span className="mr-2">🔗</span>
              Open Onboarding
            </a>
          </div>
        </div>

        <WithPermission
          permission="manage_settings"
          fallback={
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    You need additional permissions to modify site settings.
                    Contact a super admin for access.
                  </p>
                </div>
              </div>
            </div>
          }
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <div className="w-48 bg-gray-50 py-6 border-r border-gray-200">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`px-4 py-2 text-left ${
                      activeTab === "general"
                        ? "bg-gray-100 text-blue-600 font-medium border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setActiveTab("contact")}
                    className={`px-4 py-2 text-left ${
                      activeTab === "contact"
                        ? "bg-gray-100 text-blue-600 font-medium border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Contact Info
                  </button>
                  <button
                    onClick={() => setActiveTab("social")}
                    className={`px-4 py-2 text-left ${
                      activeTab === "social"
                        ? "bg-gray-100 text-blue-600 font-medium border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Social Media
                  </button>
                  <button
                    onClick={() => setActiveTab("donation")}
                    className={`px-4 py-2 text-left ${
                      activeTab === "donation"
                        ? "bg-gray-100 text-blue-600 font-medium border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Donation
                  </button>
                  <button
                    onClick={() => setActiveTab("api")}
                    className={`px-4 py-2 text-left ${
                      activeTab === "api"
                        ? "bg-gray-100 text-blue-600 font-medium border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    API Keys
                  </button>
                </nav>
              </div>

              <div className="flex-1 p-6">
                {/* Success Message */}
                {saveSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Settings saved successfully!
                  </div>
                )}

                {/* General Settings */}
                {activeTab === "general" && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      General Settings
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="siteTitle"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Site Title
                        </label>
                        <input
                          type="text"
                          id="siteTitle"
                          name="siteTitle"
                          value={formData.siteTitle}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Used in the browser title and SEO
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="siteDescription"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Site Description
                        </label>
                        <textarea
                          id="siteDescription"
                          name="siteDescription"
                          rows={3}
                          value={formData.siteDescription}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Used for SEO and social sharing
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="gaTrackingId"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Google Analytics Tracking ID
                        </label>
                        <input
                          type="text"
                          id="gaTrackingId"
                          name="gaTrackingId"
                          value={formData.gaTrackingId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Format: G-XXXXXXXXXX
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Settings */}
                {activeTab === "contact" && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Contact Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="contactEmail"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contact Email
                        </label>
                        <input
                          type="email"
                          id="contactEmail"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Primary contact email displayed on the website
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="contactPhone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          id="contactPhone"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Format: (XXX) XXX-XXXX
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Media Settings */}
                {activeTab === "social" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        Social Media Links
                      </h2>
                      <button
                        onClick={() => setShowSocialMediaLinks(!showSocialMediaLinks)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          showSocialMediaLinks
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {showSocialMediaLinks ? "Hide Links" : "Show Links"}
                      </button>
                    </div>
                    {showSocialMediaLinks && (
                      <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="fbUrl"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Facebook URL
                        </label>
                        <div className="flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            https://
                          </span>
                          <input
                            type="text"
                            id="fbUrl"
                            name="fbUrl"
                            value={formData.fbUrl.replace("https://", "")}
                            onChange={handleInputChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="igUrl"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Instagram URL
                        </label>
                        <div className="flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            https://
                          </span>
                          <input
                            type="text"
                            id="igUrl"
                            name="igUrl"
                            value={formData.igUrl.replace("https://", "")}
                            onChange={handleInputChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="twUrl"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Twitter URL
                        </label>
                        <div className="flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            https://
                          </span>
                          <input
                            type="text"
                            id="twUrl"
                            name="twUrl"
                            value={formData.twUrl.replace("https://", "")}
                            onChange={handleInputChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Donation Settings */}
                {activeTab === "donation" && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Donation Settings
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="stripeCampaignId"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Stripe Campaign ID
                        </label>
                        <input
                          type="text"
                          id="stripeCampaignId"
                          name="stripeCampaignId"
                          value={formData.stripeCampaignId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          The ID for your main Stripe campaign
                        </p>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableDonationTest"
                          name="enableDonationTest"
                          checked={formData.enableDonationTest}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="enableDonationTest"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Enable Donation Test Mode
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 pl-6">
                        When enabled, donations will be processed in test mode
                      </p>
                    </div>
                  </div>
                )}

                {/* API Keys Settings */}
                {activeTab === "api" && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      API Keys & Integrations
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-md font-medium text-gray-900 mb-2">
                          API Keys
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          For security reasons, API keys are managed through
                          environment variables and are not accessible through
                          this interface.
                        </p>
                        <div className="text-sm text-gray-800">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span>Google Analytics</span>
                            <span className="text-green-600">Configured</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span>Stripe</span>
                            <span className="text-green-600">Configured</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span>Resend Email API</span>
                            <span className="text-green-600">Configured</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span>Netlify</span>
                            <span className="text-green-600">Configured</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-md font-medium text-blue-900 mb-2">
                          Integration Status
                        </h3>
                        <div className="text-sm">
                          <div className="flex items-center py-1">
                            <svg
                              className="w-4 h-4 text-green-600 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-blue-800">
                              Contact Form: Working
                            </span>
                          </div>
                          <div className="flex items-center py-1">
                            <svg
                              className="w-4 h-4 text-green-600 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-blue-800">
                              Donations: Working
                            </span>
                          </div>
                          <div className="flex items-center py-1">
                            <svg
                              className="w-4 h-4 text-green-600 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-blue-800">
                              Analytics: Working
                            </span>
                          </div>
                          <div className="flex items-center py-1">
                            <svg
                              className="w-4 h-4 text-green-600 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-blue-800">
                              Netlify: Working
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()} by{" "}
                    {user?.name || "Admin"}
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </WithPermission>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AdminAuthProvider>
      <SettingsContent />
    </AdminAuthProvider>
  );
}
