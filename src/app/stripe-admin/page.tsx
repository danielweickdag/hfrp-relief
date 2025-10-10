"use client";

import { useState } from "react";
import type { StripePlan, SyncResult } from "@/lib/stripeCampaignSync";
import type { StripeCampaign, StripeEvent } from "@/lib/stripeEnhanced";

type SyncStatus = {
  lastSync: string;
  totalCampaigns: number;
  totalPlans: number;
  stripeProducts: number;
  stripePrices: number;
};

type SyncResponse = {
  success: boolean;
  data?: SyncResult;
  error?: string;
};

export default function StripeAdminPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus | { error: string } | null>(null);
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [campaigns, setCampaigns] = useState<StripeCampaign[]>([]);
  const [events, setEvents] = useState<StripeEvent[]>([]);
  const [lastResponse, setLastResponse] = useState<SyncResponse | null>(null);

  async function runSync() {
    setLoading("sync");
    setLastResponse(null);
    try {
      const res = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "all" }),
      });
      const data = await res.json();
      setLastResponse(data);
    } catch (e) {
      setLastResponse({ success: false, error: String(e) });
    } finally {
      setLoading(null);
    }
  }

  async function loadStatus() {
    setLoading("status");
    setStatus(null);
    try {
      const res = await fetch("/api/stripe/sync?action=status");
      const data: { success: boolean; data?: SyncStatus; error?: string } = await res.json();
      if (data.success) {
        setStatus(data.data ?? null);
      } else {
        setStatus({ error: data.error ?? "Failed to load status" });
      }
    } catch (e) {
      setStatus({ error: String(e) });
    } finally {
      setLoading(null);
    }
  }

  async function loadPlans() {
    setLoading("plans");
    setPlans([]);
    try {
      const res = await fetch("/api/stripe/sync?action=plans");
      const data: { success: boolean; data?: StripePlan[] } = await res.json();
      setPlans(data.success ? data.data ?? [] : []);
    } catch (e) {
      setPlans([]);
    } finally {
      setLoading(null);
    }
  }

  async function loadCampaigns() {
    setLoading("campaigns");
    setCampaigns([]);
    try {
      const res = await fetch("/api/campaigns", { method: "GET" });
      const data: { success: boolean; data?: { campaigns?: StripeCampaign[] } } = await res.json();
      setCampaigns(data.success ? data.data?.campaigns ?? [] : []);
    } catch (e) {
      setCampaigns([]);
    } finally {
      setLoading(null);
    }
  }

  async function loadEvents() {
    setLoading("events");
    setEvents([]);
    try {
      const res = await fetch("/api/stripe/sync?action=events");
      const data: { success: boolean; data?: StripeEvent[] } = await res.json();
      setEvents(data.success ? data.data ?? [] : []);
    } catch (e) {
      setEvents([]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Stripe Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Trigger syncs and review plans, campaigns, and events.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={runSync}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={!!loading}
            >
              {loading === "sync" ? "Syncing…" : "Full Sync (Plans & Campaigns)"}
            </button>
            <button
              onClick={loadStatus}
              className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
              disabled={!!loading}
            >
              {loading === "status" ? "Loading…" : "Sync Status"}
            </button>
            <button
              onClick={loadPlans}
              className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
              disabled={!!loading}
            >
              {loading === "plans" ? "Loading…" : "List Plans"}
            </button>
            <button
              onClick={loadCampaigns}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
              disabled={!!loading}
            >
              {loading === "campaigns" ? "Loading…" : "List Campaigns"}
            </button>
            <button
              onClick={loadEvents}
              className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
              disabled={!!loading}
            >
              {loading === "events" ? "Loading…" : "List Events"}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {lastResponse && (
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Last Sync Response</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(lastResponse, null, 2)}</pre>
              </div>
            )}

            {status && (
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Status</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(status, null, 2)}</pre>
              </div>
            )}

            {!!plans.length && (
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Plans</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(plans, null, 2)}</pre>
              </div>
            )}

            {!!campaigns.length && (
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Campaigns</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(campaigns, null, 2)}</pre>
              </div>
            )}

            {!!events.length && (
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Events</h3>
                <pre className="text-sm overflow-auto">{JSON.stringify(events, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
