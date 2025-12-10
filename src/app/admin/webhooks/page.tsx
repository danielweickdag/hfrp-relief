"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/app/_components/AdminAuth";

type WebhookConfigResponse = {
  configured?: boolean;
  count?: number;
  targetUrl?: string;
  enabled_events?: string[];
  recommended_events?: string[];
  endpoints?: Array<{
    id: string;
    url: string;
    enabled_events: string[];
    status?: string;
  }>;
  action?: string;
  id?: string;
  url?: string;
  status?: string;
  error?: string;
  deleted?: number;
};

const CANONICAL_TARGET = "https://www.familyreliefproject7.org";

export default function AdminWebhookManagerPage() {
  const { isAuthenticated } = useAdminAuth();
  const [target, setTarget] = useState<string>(`${CANONICAL_TARGET}`);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [configured, setConfigured] = useState<boolean>(false);
  const [enabledEvents, setEnabledEvents] = useState<string[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<string[]>([]);
  const [endpoints, setEndpoints] = useState<
    WebhookConfigResponse["endpoints"]
  >([]);

  useEffect(() => {
    // Initial status load for the canonical target
    void handleCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAlerts = () => {
    setMessage("");
    setError("");
  };

  const handleCheck = async () => {
    resetAlerts();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stripe/webhook-config?target=${encodeURIComponent(target)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      const json: WebhookConfigResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load config");

      setConfigured(!!json.configured);
      setEnabledEvents(json.enabled_events || []);
      setRecommendedEvents(json.recommended_events || []);
      setEndpoints(json.endpoints || []);
      setMessage(
        json.configured
          ? `Webhook configured for ${json.targetUrl} with ${json.enabled_events?.length || 0} events.`
          : `No webhook configured for ${target}.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (eventType: string) => {
    setEnabledEvents((prev) =>
      prev.includes(eventType)
        ? prev.filter((e) => e !== eventType)
        : [...prev, eventType],
    );
  };

  const selectRecommended = () => {
    setEnabledEvents(recommendedEvents);
  };

  const handleCreateOrUpdate = async () => {
    resetAlerts();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stripe/webhook-config?target=${encodeURIComponent(target)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled_events: enabledEvents }),
        },
      );
      const json: WebhookConfigResponse = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to create/update webhook");

      setMessage(
        json.action
          ? `Webhook ${json.action}: ${json.url}`
          : `Webhook updated for ${target}.`,
      );
      await handleCheck();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCanonical = async () => {
    resetAlerts();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stripe/webhook-config?target=${encodeURIComponent(target)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );
      const json: WebhookConfigResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete webhook");
      setMessage(`Deleted webhook for ${target}.`);
      await handleCheck();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupEphemeral = async () => {
    resetAlerts();
    setLoading(true);
    try {
      const res = await fetch(`/api/stripe/webhook-config?cleanup=true`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json: WebhookConfigResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to cleanup webhooks");
      setMessage(`Cleaned up ${json.deleted || 0} ephemeral endpoints.`);
      await handleCheck();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Access Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please sign in to manage Stripe webhooks.
          </p>
          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Stripe Webhook Manager
          </h1>
          <p className="text-gray-600 mt-2">
            List, create/update, delete, and cleanup webhook endpoints.
          </p>
        </div>

        {/* Target URL */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Site URL
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="https://www.familyreliefproject7.org"
          />
          <p className="text-xs text-gray-500 mt-2">
            This sets the webhook to `{target}/api/stripe/webhook`.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleCheck}
              disabled={loading}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Check Status
            </button>
            <button
              onClick={selectRecommended}
              disabled={loading || recommendedEvents.length === 0}
              className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded hover:bg-indigo-200 disabled:opacity-50"
            >
              Use Recommended Events
            </button>
            <button
              onClick={handleCreateOrUpdate}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Create/Update Webhook
            </button>
            <button
              onClick={handleDeleteCanonical}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete Canonical Webhook
            </button>
            <button
              onClick={handleCleanupEphemeral}
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Cleanup Ephemeral Endpoints
            </button>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Events selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enabled Events
            </h3>
            {recommendedEvents.length === 0 ? (
              <p className="text-sm text-gray-600">
                No recommended events loaded yet. Click "Check Status".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recommendedEvents.map((evt) => (
                  <label
                    key={evt}
                    className="inline-flex items-center gap-2 text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={enabledEvents.includes(evt)}
                      onChange={() => toggleEvent(evt)}
                    />
                    <span className="font-mono">{evt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Current Configuration
            </h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                configured
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {configured ? "Configured" : "Not Configured"}
            </span>
          </div>
          {endpoints && endpoints.length > 0 ? (
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div key={ep.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-mono text-gray-900 break-all">
                        {ep.url}
                      </div>
                      <div className="text-xs text-gray-600">ID: {ep.id}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                      {ep.status || "unknown"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-700">
                    Events: {ep.enabled_events?.join(", ") || "none"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No endpoints found for this account.
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Link
              href="/admin"
              className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              <span className="mr-2">←</span>
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
