"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface StripeEventEntry {
  id: string;
  type: string;
  api_version?: string | null;
  createdAt?: string;
  data?: unknown;
}

export default function WebhookLogsPage() {
  const [events, setEvents] = useState<StripeEventEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("__ALL__");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Prefer real Stripe Events API in production; fallback to local file in dev.
      const tryEventsApi = async (): Promise<StripeEventEntry[] | null> => {
        try {
          const res = await fetch("/api/stripe/events", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const json = await res.json();
          if (!res.ok || !json.success) return null;
          return Array.isArray(json.data)
            ? (json.data as StripeEventEntry[])
            : [];
        } catch {
          return null;
        }
      };

      const tryLocalFile = async (): Promise<StripeEventEntry[]> => {
        const res = await fetch("/api/stripe/sync?action=events", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load events");
        }
        return Array.isArray(json.data)
          ? (json.data as StripeEventEntry[])
          : [];
      };

      const apiData = await tryEventsApi();
      const data = apiData ?? (await tryLocalFile());
      setEvents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents().catch(() => {});
  }, []);

  const uniqueTypes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.type && set.add(e.type));
    return ["__ALL__", ...Array.from(set).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    let list =
      selectedType === "__ALL__"
        ? events
        : events.filter((e) => e.type === selectedType);

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from || to) {
      list = list.filter((e) => {
        const created = e.createdAt ? new Date(e.createdAt) : null;
        if (!created) return true;
        if (from && created < from) return false;
        if (to) {
          const endOfTo = new Date(to);
          endOfTo.setHours(23, 59, 59, 999);
          if (created > endOfTo) return false;
        }
        return true;
      });
    }

    return list;
  }, [events, selectedType, fromDate, toDate]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ events }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stripe-events.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Stripe Webhook Logs
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={downloadJson}
            disabled={events.length === 0}
            className="inline-flex items-center px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            Download JSON
          </button>
          <Link
            href="/admin/webhooks"
            className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Manage Webhooks
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-gray-700">Filter by type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t === "__ALL__" ? "All" : t}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">From:</label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <label className="text-sm text-gray-700">To:</label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-4">
          <p className="font-medium">Failed to load events</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">
            Note: On serverless production, writing sample events is disabled;
            only real webhook events will appear.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow divide-y">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Events</p>
            <p className="text-xl font-semibold text-gray-900">
              {events.length}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {events.length === 0
              ? "No events found"
              : `Showing ${filteredEvents.length}`}
          </div>
        </div>

        {filteredEvents.map((evt) => (
          <div key={evt.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm text-gray-800 truncate">
                {evt.id}
              </div>
              <div className="text-sm font-medium text-indigo-700">
                {evt.type}
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
              {evt.createdAt && (
                <span>{new Date(evt.createdAt).toLocaleString()}</span>
              )}
              {evt.api_version && <span>api: {evt.api_version}</span>}
              <button
                onClick={() => toggleExpand(evt.id)}
                className="ml-auto inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                {expanded[evt.id] ? "Hide Details" : "Details"}
              </button>
            </div>
            {expanded[evt.id] && (
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(evt, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}