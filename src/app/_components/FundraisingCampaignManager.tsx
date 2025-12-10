"use client";

import { useState } from "react";

interface Campaign {
  id: number;
  name: string;
  emoji: string;
  goal: number;
  raised: number;
  donors: number;
  status: "active" | "draft" | "completed" | "paused";
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  featured: boolean;
  stripeId?: string;
  stripeProductId?: string;
  stripePriceIds?: string[];
  automationEnabled: boolean;
}

interface CampaignTemplate {
  name: string;
  emoji: string;
  description: string;
  goal: number;
  template: string;
  color: string;
  stripeSettings: {
    suggestedAmounts: number[];
    recurringOptions: boolean;
    minimumAmount: number;
    defaultAmount?: number;
  };
}

interface FundraisingCampaignManagerProps {
  onCampaignCreate?: (campaign: Partial<Campaign>) => void;
  onStripeSync?: () => void;
}

export default function FundraisingCampaignManager({
  onCampaignCreate,
  onStripeSync,
}: FundraisingCampaignManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CampaignTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const campaignTemplates: CampaignTemplate[] = [
    {
      name: "Daily Giving - Cents That Count",
      emoji: "☀️",
      description: "Recurring micro-donations starting at 16¢/day",
      goal: 10000,
      template: "daily-giving",
      color: "bg-yellow-50 border-yellow-200",
      stripeSettings: {
        suggestedAmounts: [5, 10, 15, 20], // Monthly amounts
        recurringOptions: true,
        minimumAmount: 1,
        defaultAmount: 10,
      },
    },
    {
      name: "Emergency Relief Fund",
      emoji: "🚨",
      description: "Rapid response for urgent humanitarian needs",
      goal: 25000,
      template: "emergency",
      color: "bg-red-50 border-red-200",
      stripeSettings: {
        suggestedAmounts: [25, 50, 100, 250],
        recurringOptions: false,
        minimumAmount: 10,
        defaultAmount: 50,
      },
    },
    {
      name: "Education & Scholarship Fund",
      emoji: "🎓",
      description: "Supporting schools and student scholarships",
      goal: 15000,
      template: "education",
      color: "bg-blue-50 border-blue-200",
      stripeSettings: {
        suggestedAmounts: [30, 60, 120, 250],
        recurringOptions: true,
        minimumAmount: 15,
        defaultAmount: 60,
      },
    },
    {
      name: "Medical Care & Supplies",
      emoji: "🩺",
      description: "Healthcare services and medical equipment",
      goal: 20000,
      template: "medical",
      color: "bg-green-50 border-green-200",
      stripeSettings: {
        suggestedAmounts: [40, 80, 160, 400],
        recurringOptions: true,
        minimumAmount: 20,
        defaultAmount: 80,
      },
    },
    {
      name: "Housing & Infrastructure",
      emoji: "🏠",
      description: "Building homes and improving living conditions",
      goal: 50000,
      template: "housing",
      color: "bg-purple-50 border-purple-200",
      stripeSettings: {
        suggestedAmounts: [100, 250, 500, 1000],
        recurringOptions: true,
        minimumAmount: 50,
        defaultAmount: 250,
      },
    },
    {
      name: "Food Security Program",
      emoji: "🍽️",
      description: "Nutrition support and food distribution",
      goal: 12000,
      template: "food-security",
      color: "bg-orange-50 border-orange-200",
      stripeSettings: {
        suggestedAmounts: [20, 40, 80, 160],
        recurringOptions: true,
        minimumAmount: 10,
        defaultAmount: 40,
      },
    },
  ];

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setShowCreateForm(true);
  };

  const handleCreateCampaign = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);

    try {
      // Simulate API call to create Stripe campaign
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newCampaign: Partial<Campaign> = {
        name: selectedTemplate.name,
        emoji: selectedTemplate.emoji,
        goal: selectedTemplate.goal,
        raised: 0,
        donors: 0,
        status: "active",
        description: selectedTemplate.description,
        category: selectedTemplate.template,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        featured: false,
        stripeId: `stripe_${selectedTemplate.template}_${Date.now()}`,
        automationEnabled: true,
      };

      onCampaignCreate?.(newCampaign);

      setShowCreateForm(false);
      setSelectedTemplate(null);

      // Show success message
      alert(
        `✅ Campaign "${selectedTemplate.name}" created successfully!\n\n🔗 Stripe integration active\n🤖 Automation enabled\n📊 Analytics tracking started`,
      );
    } catch (error) {
      alert("❌ Failed to create campaign. Please check your Stripe settings.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            🎯 Fundraising Campaign Manager
          </h2>
          <p className="text-gray-600">
            Create and automate fundraising campaigns with Stripe integration
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            ➕ Custom Campaign
          </button>
          <button
            onClick={onStripeSync}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            🔄 Sync Stripe
          </button>
        </div>
      </div>

      {/* Campaign Templates */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          ⚡ Quick Launch Templates
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Auto-creates Stripe campaigns
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignTemplates.map((template) => (
            <div
              key={template.template}
              className={`p-4 rounded-lg border ${template.color} hover:shadow-md transition-shadow`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{template.emoji}</div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
                <div className="text-sm text-gray-500 mb-3">
                  Goal: ${template.goal.toLocaleString()}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-500">Donation amounts:</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {template.stripeSettings.suggestedAmounts.map((amount) => (
                      <span
                        key={amount}
                        className="bg-white px-2 py-1 rounded text-xs border"
                      >
                        ${amount}
                      </span>
                    ))}
                  </div>
                  {template.stripeSettings.recurringOptions && (
                    <div className="text-xs text-green-600">
                      ✓ Recurring donations enabled
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-900 transition-colors"
                >
                  🚀 Launch in 60 seconds
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Integration Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          🔗 Stripe Integration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <div className="font-semibold text-green-800">Connected</div>
            <div className="text-sm text-green-600">API Active</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-600 font-semibold">Last Sync</div>
            <div className="text-sm text-blue-600">
              {new Date().toLocaleString()}
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-purple-600 font-semibold">Auto-sync</div>
            <div className="text-sm text-purple-600">Every 2 hours</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-yellow-600 font-semibold">Automation</div>
            <div className="text-sm text-yellow-600">Fully Enabled</div>
          </div>
        </div>
      </div>

      {/* Campaign Creation Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedTemplate
                  ? `Create: ${selectedTemplate.name}`
                  : "Create Custom Campaign"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedTemplate && (
              <div className="space-y-6">
                {/* Campaign Preview */}
                <div
                  className={`p-4 rounded-lg border ${selectedTemplate.color}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{selectedTemplate.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedTemplate.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedTemplate.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Goal:</strong> $
                      {selectedTemplate.goal.toLocaleString()}
                    </div>
                    <div>
                      <strong>Default Amount:</strong> $
                      {selectedTemplate.stripeSettings.defaultAmount ??
                        selectedTemplate.stripeSettings.suggestedAmounts[0] ??
                        selectedTemplate.stripeSettings.minimumAmount}
                    </div>
                    <div>
                      <strong>Minimum:</strong> $
                      {selectedTemplate.stripeSettings.minimumAmount}
                    </div>
                    <div>
                      <strong>Recurring:</strong>{" "}
                      {selectedTemplate.stripeSettings.recurringOptions
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>
                </div>

                {/* Automation Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">
                    🤖 Automation Features (Auto-enabled)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">✓</span> Automatic thank you emails
                    </div>
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">✓</span> Progress milestone updates
                    </div>
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">✓</span> Social media auto-posts
                    </div>
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">✓</span> Donor segmentation
                    </div>
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">✓</span> Weekly progress reports
                    </div>
                    <div className="flex items-center text-green-600">
                      <span className="mr-2">✓</span> Smart donation reminders
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleCreateCampaign}
                    disabled={isCreating}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                  >
                    {isCreating
                      ? "🔄 Creating Campaign..."
                      : "🚀 Create & Launch Campaign"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setSelectedTemplate(null);
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>

                {isCreating && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <div>
                        <div className="font-semibold text-blue-900">
                          Creating your campaign...
                        </div>
                        <div className="text-sm text-blue-700">
                          Setting up Stripe integration and automation features
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
