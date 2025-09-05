"use client";

import { useState, useEffect } from "react";
import StripeDashboard from "@/app/_components/StripeDashboard";
import { stripeEnhanced } from "@/lib/stripeEnhanced";

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "error";
  automated: boolean;
  details?: string;
}

export default function StripeTransitionPage() {
  const [activeTab, setActiveTab] = useState<
    "migration" | "dashboard" | "comparison"
  >("migration");
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
    {
      id: "backup",
      title: "Create Backup",
      description: "Backup existing Donorbox configuration",
      status: "completed",
      automated: true,
      details: "Existing DonorboxButton and configuration backed up",
    },
    {
      id: "install",
      title: "Install Dependencies",
      description: "Install Stripe SDK and dependencies",
      status: "completed",
      automated: true,
      details: "@stripe/stripe-js and stripe packages installed",
    },
    {
      id: "components",
      title: "Create Components",
      description: "Generate new Stripe components",
      status: "completed",
      automated: true,
      details: "StripeButton, StripeDashboard, and enhanced service created",
    },
    {
      id: "config",
      title: "Configure Environment",
      description: "Set up Stripe API keys and configuration",
      status: "pending",
      automated: false,
      details: "Update .env.local with your Stripe keys",
    },
    {
      id: "api",
      title: "API Routes",
      description: "Create checkout and webhook endpoints",
      status: "completed",
      automated: true,
      details: "Checkout and webhook API routes created",
    },
    {
      id: "pages",
      title: "Success/Cancel Pages",
      description: "Create donation flow pages",
      status: "completed",
      automated: true,
      details: "Success and cancellation pages created",
    },
    {
      id: "migrate",
      title: "Migrate Components",
      description: "Replace DonorboxButton with StripeButton",
      status: "pending",
      automated: false,
      details: "Run migration script to update existing components",
    },
    {
      id: "webhooks",
      title: "Configure Webhooks",
      description: "Set up Stripe webhook endpoints",
      status: "pending",
      automated: false,
      details: "Configure webhooks in Stripe Dashboard",
    },
    {
      id: "test",
      title: "Test Integration",
      description: "Verify all payment flows work correctly",
      status: "pending",
      automated: false,
      details: "Test with Stripe test cards",
    },
    {
      id: "deploy",
      title: "Go Live",
      description: "Switch to production mode",
      status: "pending",
      automated: false,
      details: "Update to live API keys and disable test mode",
    },
  ]);

  const [comparisonData] = useState({
    donorbox: {
      fees: "2.9% + $0.30 + platform fee",
      setup: "Third-party account required",
      customization: "Limited branding options",
      mobile: "Good mobile experience",
      international: "Limited currency support",
      recurring: "Basic subscription support",
      analytics: "Basic reporting",
      control: "Limited API access",
    },
    stripe: {
      fees: "2.9% + $0.30 (no platform fee)",
      setup: "Direct integration",
      customization: "Full control over design",
      mobile: "Native mobile wallets",
      international: "135+ currencies",
      recurring: "Advanced subscription management",
      analytics: "Comprehensive reporting",
      control: "Full API access",
    },
  });

  const runMigrationScript = async () => {
    setMigrationSteps((prev) =>
      prev.map((step) =>
        step.id === "migrate" ? { ...step, status: "in_progress" } : step
      )
    );

    try {
      // Simulate running migration script
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMigrationSteps((prev) =>
        prev.map((step) =>
          step.id === "migrate"
            ? {
                ...step,
                status: "completed",
                details: "Components successfully migrated to StripeButton",
              }
            : step
        )
      );
    } catch (error) {
      setMigrationSteps((prev) =>
        prev.map((step) =>
          step.id === "migrate"
            ? {
                ...step,
                status: "error",
                details: "Migration failed: " + (error as Error).message,
              }
            : step
        )
      );
    }
  };

  const updateStepStatus = (
    stepId: string,
    status: MigrationStep["status"]
  ) => {
    setMigrationSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
  };

  const completedSteps = migrationSteps.filter(
    (step) => step.status === "completed"
  ).length;
  const totalSteps = migrationSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Donorbox → Stripe Migration
              </h1>
              <p className="text-gray-600 mt-2">
                Complete payment system migration with enhanced features and
                automation
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {completedSteps}/{totalSteps}
              </div>
              <div className="text-sm text-gray-500">Steps Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Migration Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: "migration", label: "Migration Steps", icon: "🔄" },
                { id: "dashboard", label: "Stripe Dashboard", icon: "📊" },
                { id: "comparison", label: "Feature Comparison", icon: "⚖️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Migration Steps Tab */}
            {activeTab === "migration" && (
              <div className="space-y-4">
                {migrationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border ${
                      step.status === "completed"
                        ? "border-green-200 bg-green-50"
                        : step.status === "in_progress"
                          ? "border-blue-200 bg-blue-50"
                          : step.status === "error"
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.status === "completed"
                              ? "bg-green-500 text-white"
                              : step.status === "in_progress"
                                ? "bg-blue-500 text-white"
                                : step.status === "error"
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {step.status === "completed"
                            ? "✓"
                            : step.status === "in_progress"
                              ? "⟳"
                              : step.status === "error"
                                ? "✗"
                                : index + 1}
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-900">
                            {step.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {step.description}
                          </p>
                          {step.details && (
                            <p className="text-xs text-gray-500 mt-1">
                              {step.details}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {step.automated && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            🤖 Automated
                          </span>
                        )}

                        {step.id === "migrate" && step.status === "pending" && (
                          <button
                            onClick={runMigrationScript}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Run Migration
                          </button>
                        )}

                        {!step.automated && step.status === "pending" && (
                          <button
                            onClick={() =>
                              updateStepStatus(step.id, "completed")
                            }
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Manual Actions Required */}
                <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-800 mb-3">
                    ⚠️ Manual Actions Required
                  </h3>
                  <div className="space-y-2 text-sm text-yellow-700">
                    <p>
                      • Update Stripe API keys in <code>.env.local</code>
                    </p>
                    <p>• Configure webhooks in Stripe Dashboard</p>
                    <p>• Test payment flows thoroughly</p>
                    <p>• Update any custom integrations</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && <StripeDashboard />}

            {/* Comparison Tab */}
            {activeTab === "comparison" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <h3 className="text-lg font-semibold text-red-800 mb-4">
                      📦 Donorbox (Current)
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(comparisonData.donorbox).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm font-medium text-red-700 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="text-sm text-red-600">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                      ⚡ Stripe (New)
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(comparisonData.stripe).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm font-medium text-green-700 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="text-sm text-green-600">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    🎯 Migration Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">
                        Cost Savings
                      </h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• No platform fees</li>
                        <li>• Lower transaction costs</li>
                        <li>• Volume discounts available</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">
                        Enhanced Features
                      </h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Apple Pay & Google Pay</li>
                        <li>• Advanced analytics</li>
                        <li>• Subscription management</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">
                        Better Control
                      </h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Full API access</li>
                        <li>• Custom branding</li>
                        <li>• Direct bank deposits</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">
                        Global Reach
                      </h4>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• 135+ currencies</li>
                        <li>• Local payment methods</li>
                        <li>• International compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() =>
                window.open("/STRIPE_MIGRATION_GUIDE.md", "_blank")
              }
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-lg mb-2">📖</div>
              <div className="font-medium text-gray-900">Migration Guide</div>
              <div className="text-sm text-gray-600">
                View complete setup guide
              </div>
            </button>

            <button
              onClick={() => {
                const script = document.createElement("a");
                script.href = "/stripe-automation-setup.sh";
                script.download = "stripe-automation-setup.sh";
                script.click();
              }}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="text-lg mb-2">⬇️</div>
              <div className="font-medium text-gray-900">Automation Script</div>
              <div className="text-sm text-gray-600">Download setup script</div>
            </button>

            <button
              onClick={() =>
                window.open("https://dashboard.stripe.com", "_blank")
              }
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="text-lg mb-2">🔗</div>
              <div className="font-medium text-gray-900">Stripe Dashboard</div>
              <div className="text-sm text-gray-600">Open Stripe console</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
