"use client";

import { useState } from "react";

export default function WebhookTestPage() {
  const [secret, setSecret] = useState(
    "whsec_mW029MFkUQcdu8oZSyCIZcCZNB6t0GwG",
  );
  const [type, setType] = useState("checkout.session.completed");
  const [amount, setAmount] = useState(2500);
  const [currency, setCurrency] = useState("usd");
  const [result, setResult] = useState<string>("");
  const [sending, setSending] = useState(false);

  const sendTest = async () => {
    try {
      setSending(true);
      setResult("");
      const now = Math.floor(Date.now() / 1000);
      const event = {
        id: `evt_test_${Date.now()}`,
        type,
        api_version: "2024-11-20",
        created: now,
        data: {
          object: {
            id: `cs_test_${Date.now()}`,
            customer: `cus_test_${Date.now()}`,
            payment_intent: `pi_test_${Date.now()}`,
            amount_total: amount,
            currency,
          },
        },
      };
      const payload = JSON.stringify(event);

      // Compute signature in browser. For testing only.
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const toSign = enc.encode(`${now}.${payload}`);
      const sigBuf = await crypto.subtle.sign("HMAC", key, toSign);
      const sigHex = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const stripeSignature = `t=${now},v1=${sigHex}`;

      const res = await fetch("/api/stripe/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": stripeSignature,
        },
        body: payload,
      });
      const text = await res.text();
      setResult(`Status: ${res.status}\n${text}`);
    } catch (err) {
      setResult(String(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Webhook Test (Dev)</h1>
      <p className="text-sm text-gray-600 mb-4">
        Use this page to send a signed test payload to the local webhook
        endpoint. Do not deploy with secrets exposed. Remove after testing.
      </p>
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-sm text-gray-700">Webhook Secret</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-700">Type</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Amount (cents)</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-32"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Currency</label>
            <input
              className="border rounded px-2 py-1 w-24"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </div>
      </div>
      <button
        onClick={sendTest}
        disabled={sending}
        className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send Test Webhook"}
      </button>
      {result && (
        <pre className="mt-4 p-3 bg-gray-50 rounded text-xs whitespace-pre-wrap">
          {result}
        </pre>
      )}
      <div className="mt-4 text-sm text-gray-600">
        After sending, open{" "}
        <a className="text-blue-700 underline" href="/admin/webhooks/logs">
          Admin Webhook Logs
        </a>{" "}
        and click Refresh.
      </div>
    </div>
  );
}
