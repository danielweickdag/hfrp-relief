"use client";

import { useState } from "react";
import SocialShare from "./SocialShare";

interface Campaign {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  imageUrl?: string;
  url?: string;
  scheduledDate?: string;
  status: "draft" | "scheduled" | "published";
}

interface SocialMediaManagerProps {
  className?: string;
}

export default function SocialMediaManager({
  className = "",
}: SocialMediaManagerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      title: "New Children Welcomed to Our Safe Housing",
      description:
        "This month we opened our doors to 30 more children who needed safe shelter and care. Each child now has a bed, regular meals, and access to education.",
      hashtags: [
        "HaitianFamilyRelief",
        "Hope4Haiti",
        "ChildrenFirst",
        "SafeHousing",
      ],
      imageUrl: "/images/gallery/children_gathering.jpg",
      url: "/blog/welcomed-30-new-children",
      status: "published",
    },
    {
      id: "2",
      title: "School Lunch Program Expansion",
      description:
        "Our feeding program has expanded to serve 500 additional children daily in three new schools across Port-au-Prince.",
      hashtags: ["Education", "Nutrition", "Haiti", "SchoolFeeding"],
      imageUrl: "/images/gallery/meals_served.jpg",
      url: "/blog/school-lunch-expansion",
      status: "published",
    },
    {
      id: "3",
      title: "Monthly Donor Appreciation",
      description:
        "Thank you to all our monthly donors! Your consistent support makes our programs possible.",
      hashtags: ["Gratitude", "MonthlyDonors", "ThankYou", "Community"],
      status: "draft",
    },
  ]);

  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    title: "",
    description: "",
    hashtags: [],
    status: "draft",
  });

  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);

  const addHashtag = (hashtag: string) => {
    if (hashtag && !newCampaign.hashtags?.includes(hashtag)) {
      setNewCampaign((prev) => ({
        ...prev,
        hashtags: [...(prev.hashtags || []), hashtag],
      }));
    }
  };

  const removeHashtag = (hashtagToRemove: string) => {
    setNewCampaign((prev) => ({
      ...prev,
      hashtags: prev.hashtags?.filter((tag) => tag !== hashtagToRemove) || [],
    }));
  };

  const saveCampaign = () => {
    if (newCampaign.title && newCampaign.description) {
      const campaign: Campaign = {
        id: Date.now().toString(),
        title: newCampaign.title,
        description: newCampaign.description,
        hashtags: newCampaign.hashtags || [],
        imageUrl: newCampaign.imageUrl,
        url: newCampaign.url,
        scheduledDate: newCampaign.scheduledDate,
        status: newCampaign.status as "draft" | "scheduled" | "published",
      };

      setCampaigns((prev) => [campaign, ...prev]);
      setNewCampaign({
        title: "",
        description: "",
        hashtags: [],
        status: "draft",
      });
      setShowNewCampaignForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Social Media Campaigns
        </h2>
        <button
          onClick={() => setShowNewCampaignForm(!showNewCampaignForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {showNewCampaignForm ? "Cancel" : "New Campaign"}
        </button>
      </div>

      {/* New Campaign Form */}
      {showNewCampaignForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Campaign</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title
              </label>
              <input
                type="text"
                value={newCampaign.title || ""}
                onChange={(e) =>
                  setNewCampaign((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter campaign title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newCampaign.description || ""}
                onChange={(e) =>
                  setNewCampaign((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter campaign description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newCampaign.hashtags?.map((hashtag) => (
                  <span
                    key={hashtag}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    #{hashtag}
                    <button
                      onClick={() => removeHashtag(hashtag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHashtag(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add hashtag and press Enter..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={newCampaign.imageUrl || ""}
                  onChange={(e) =>
                    setNewCampaign((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/images/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL (optional)
                </label>
                <input
                  type="text"
                  value={newCampaign.url || ""}
                  onChange={(e) =>
                    setNewCampaign((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/blog/..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewCampaignForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCampaign}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  {campaign.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {campaign.hashtags.map((hashtag) => (
                    <span key={hashtag} className="text-blue-600 text-sm">
                      #{hashtag}
                    </span>
                  ))}
                </div>
              </div>

              {campaign.imageUrl && (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-16 h-16 object-cover rounded-lg ml-4"
                />
              )}
            </div>

            <SocialShare
              url={
                campaign.url
                  ? `${typeof window !== "undefined" ? window.location.origin : ""}${campaign.url}`
                  : undefined
              }
              title={campaign.title}
              description={campaign.description}
              hashtags={campaign.hashtags}
              className="border-t border-gray-200 pt-3"
            />
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No campaigns yet. Create your first social media campaign!</p>
        </div>
      )}
    </div>
  );
}
