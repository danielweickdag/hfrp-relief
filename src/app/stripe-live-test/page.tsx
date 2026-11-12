"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StripeLiveTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/stripe-test");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ ok: false, error: "Failed to connect to diagnostic API." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Stripe Live Diagnostic</h1>
          <p className="text-lg text-gray-600">Verify your Stripe integration and environment settings.</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Connection Status
              <Button onClick={runTest} disabled={loading}>
                {loading ? "Testing..." : "Run Diagnostic"}
              </Button>
            </CardTitle>
            <CardDescription>
              This will verify your API keys and connectivity to Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!result && !loading && (
              <div className="text-center py-8 text-gray-500 italic">
                Click "Run Diagnostic" to start the test.
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            )}

            {result && (
              <div className={`p-6 rounded-2xl border ${result.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.ok ? (
                    <Badge className="bg-green-600 text-white text-lg px-3 py-1">✅ SUCCESS</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-lg px-3 py-1">❌ FAILED</Badge>
                  )}
                  <Badge variant="outline" className="text-lg uppercase">
                    {result.mode || "unknown"} mode
                  </Badge>
                </div>

                {result.ok ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase">Account Name</p>
                      <p className="text-lg font-bold">{result.account.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase">Country</p>
                      <p className="text-lg font-bold">{result.account.country}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase">Publishable Key</p>
                      <code className="text-sm bg-white px-2 py-1 rounded border">{result.publishableKey}</code>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase">Balance</p>
                      <p className="text-lg font-bold">{result.balance.amount} {result.balance.currency}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-bold text-red-800">Error Details:</p>
                    <p className="text-red-700 bg-white p-3 rounded border border-red-200 font-mono text-sm">
                      {result.error}
                    </p>
                    {result.code === 'api_key_expired' && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-semibold">💡 Solution: Your API Key is Expired</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          Log in to your Stripe Dashboard, go to Developers &gt; API Keys, and generate a new Secret Key. Update your <code>.env.local</code> or production environment variables.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Only administrators should have access to this page.</p>
        </div>
      </div>
    </div>
  );
}
