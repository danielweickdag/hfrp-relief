"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminAuthProvider,
  useAdminAuth,
  WithPermission,
} from "../../_components/AdminAuth";

interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
  newsletter: boolean;
  ip: string;
  timestamp: string;
  status: "received" | "emailed";
  emailId?: string | null;
  recipients?: string[];
  cc?: string[];
  handled?: boolean;
  handledAt?: string;
  assignedTo?: string;
  adminNotes?: string;
}

function ContactInboxContent() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [items, setItems] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterUnhandled, setFilterUnhandled] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact-requests", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access contact requests.
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Contact Inbox
            </h1>
            <p className="text-gray-600">
              All submissions from the website contact form
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </Link>
        </div>

        <WithPermission
          permission="manage_settings"
          fallback={
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              You need additional permissions to view contact requests.
            </div>
          }
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">Total: {items.length}</div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={filterUnhandled}
                    onChange={(e) => setFilterUnhandled(e.target.checked)}
                  />
                  Show unhandled only
                </label>
                <button
                  onClick={() => exportCsv(items)}
                  className="bg-gray-800 text-white px-3 py-1 rounded"
                >
                  Export CSV
                </button>
                <button
                  onClick={load}
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Time
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Subject
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Inquiry
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Admin
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filterUnhandled
                    ? items.filter((i) => !i.handled)
                    : items
                  ).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-blue-600 whitespace-nowrap">
                        <a
                          href={`mailto:${item.email}`}
                          className="hover:underline"
                        >
                          {item.email}
                        </a>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.subject}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded ${item.status === "emailed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                        {item.inquiryType}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                          {item.handled
                            ? `Handled ${item.handledAt ? new Date(item.handledAt).toLocaleString() : ""}`
                            : "Unhanded"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.assignedTo
                            ? `Assigned to ${item.assignedTo}`
                            : "Unassigned"}
                        </div>
                        {item.adminNotes && (
                          <div className="text-xs text-gray-500">
                            Note: {item.adminNotes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div className="flex gap-2">
                          {!item.handled && (
                            <button
                              onClick={() => markHandled(item.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded"
                            >
                              Mark handled
                            </button>
                          )}
                          <button
                            onClick={() => assignTo(item.id)}
                            className="bg-indigo-600 text-white px-2 py-1 rounded"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => addNote(item.id)}
                            className="bg-gray-600 text-white px-2 py-1 rounded"
                          >
                            Add note
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No contact submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </WithPermission>
      </div>
    </div>
  );
}

export default function ContactInboxPage() {
  return (
    <AdminAuthProvider>
      <ContactInboxContent />
    </AdminAuthProvider>
  );
}

function toCsv(items: ContactRecord[]) {
  const headers = [
    "id",
    "name",
    "email",
    "subject",
    "message",
    "inquiryType",
    "newsletter",
    "ip",
    "timestamp",
    "status",
    "handled",
    "handledAt",
    "assignedTo",
    "adminNotes",
  ];
  const rows = items.map((i) => [
    i.id,
    i.name,
    i.email,
    i.subject,
    (i.message || "").replace(/\n/g, " ").replace(/,/g, ";"),
    i.inquiryType,
    i.newsletter ? "yes" : "no",
    i.ip,
    i.timestamp,
    i.status,
    i.handled ? "true" : "false",
    i.handledAt || "",
    i.assignedTo || "",
    (i.adminNotes || "").replace(/\n/g, " ").replace(/,/g, ";"),
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function exportCsv(items: ContactRecord[]) {
  const csv = toCsv(items);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contact-requests-${new Date().toISOString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function markHandled(id: string) {
  await fetch("/api/admin/contact-requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      handled: true,
      handledAt: new Date().toISOString(),
    }),
  });
  location.reload();
}

async function assignTo(id: string) {
  const who = prompt("Assign to (name or email):", "");
  if (!who) return;
  await fetch("/api/admin/contact-requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, assignedTo: who }),
  });
  location.reload();
}

async function addNote(id: string) {
  const note = prompt("Add admin note:", "");
  if (note === null) return;
  await fetch("/api/admin/contact-requests/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, adminNotes: note }),
  });
  location.reload();
}
