"use client";

import { useState, useEffect } from "react";
import {
  getStripeAutomation,
  type CampaignSync,
  type EventSync,
} from "@/lib/stripeAutomation";

export default function StripeCampaignManager() {
  const [campaigns, setCampaigns] = useState<CampaignSync[]>([]);
  const [events, setEvents] = useState<EventSync[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"campaigns" | "events" | "create">(
    "campaigns",
  );

  // Form states
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    goalAmount: 5000,
    suggestedAmounts: [15, 25, 50, 100],
    enableRecurring: true,
  });

  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: "",
    ticketPrice: 25,
    maxAttendees: 100,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/campaigns");
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_campaign",
          ...newCampaign,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ ${data.message}\n\nCampaign: ${data.campaign.name}\nStripe Product: ${data.campaign.stripeProductId}`,
        );
        setNewCampaign({
          name: "",
          description: "",
          goalAmount: 5000,
          suggestedAmounts: [15, 25, 50, 100],
          enableRecurring: true,
        });
        await loadData();
      } else {
        alert(`❌ Failed to create campaign: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_event",
          ...newEvent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `🎟️ ${data.message}\n\nEvent: ${data.event.name}\nTicket Price: $${data.event.ticketPrice}`,
        );
        setNewEvent({
          name: "",
          description: "",
          date: "",
          ticketPrice: 25,
          maxAttendees: 100,
        });
        await loadData();
      } else {
        alert(`❌ Failed to create event: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const syncAllData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all" }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `🔄 ${data.message}\n\n` +
            `📊 Campaigns: ${data.campaigns?.length || 0}\n` +
            `🎟️ Events: ${data.events?.length || 0}\n` +
            `💰 Total Donations: $${data.totalDonations?.toLocaleString() || 0}\n` +
            `🔄 Recurring Donors: ${data.recurringDonors || 0}`,
        );
        await loadData();
      } else {
        alert(`❌ Sync failed: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🚀 Stripe Campaign & Event Manager
        </h2>
        <button
          onClick={syncAllData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Syncing..." : "🔄 Sync All Data"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            {
              key: "campaigns",
              label: "📊 Campaigns",
              count: campaigns.length,
            },
            { key: "events", label: "🎟️ Events", count: events.length },
            { key: "create", label: "➕ Create New", count: 0 },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}{" "}
              {count > 0 && (
                <span className="ml-1 bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Active Campaigns</h3>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No campaigns yet. Create your first campaign!
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{campaign.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {campaign.description}
                      </p>
                      <div className="mt-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${campaign.currentAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        of ${campaign.goalAmount.toLocaleString()} goal
                      </div>
                      <div className="text-xs text-blue-600">
                        Stripe ID: {campaign.stripeProductId.slice(-8)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Automation Status */}
                  <div className="mt-3 flex items-center space-x-4 text-xs">
                    {campaign.automationSettings.emailUpdates && (
                      <span className="text-green-600">📧 Email Updates</span>
                    )}
                    {campaign.automationSettings.socialMediaPosts && (
                      <span className="text-blue-600">📱 Social Posts</span>
                    )}
                    {campaign.automationSettings.weeklyReports && (
                      <span className="text-purple-600">📊 Weekly Reports</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events yet. Create your first event!
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{event.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {event.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        ${event.ticketPrice}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.currentAttendees} / {event.maxAttendees} tickets
                      </div>
                      <div className="text-xs text-purple-600">
                        {event.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === "create" && (
        <div className="space-y-8">
          {/* Create Campaign */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              📊 Create New Campaign
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Haiti Emergency Relief Fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your campaign purpose and impact..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Amount ($)
                  </label>
                  <input
                    type="number"
                    value={newCampaign.goalAmount}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        goalAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRecurring"
                    checked={newCampaign.enableRecurring}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        enableRecurring: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="enableRecurring"
                    className="text-sm text-gray-700"
                  >
                    Enable recurring donations
                  </label>
                </div>
              </div>

              <button
                onClick={createCampaign}
                disabled={loading || !newCampaign.name}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "🚀 Create Campaign"}
              </button>
            </div>
          </div>

          {/* Create Event */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎟️ Create New Event</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Annual Fundraising Gala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe your event details..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Price ($)
                  </label>
                  <input
                    type="number"
                    value={newEvent.ticketPrice}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        ticketPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        maxAttendees: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={createEvent}
                disabled={loading || !newEvent.name || !newEvent.date}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "🎪 Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
