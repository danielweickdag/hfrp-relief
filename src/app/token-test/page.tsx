"use client";

import { useState, useEffect } from "react";

export default function TokenTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [tokenInfo, setTokenInfo] = useState<{
    exp: number;
    iat: number;
    stream: string;
    host: string;
  } | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const testTokenRefresh = async () => {
    addLog("🔄 Testing token refresh...");

    try {
      const baseUrl = "https://stream.zeno.fm/ttq4haexcf9uv";
      const response = await fetch(baseUrl, {
        method: "HEAD",
        redirect: "manual",
      });

      const location = response.headers.get("location");
      if (location) {
        addLog("✅ Got tokenized URL: " + location.substring(0, 80) + "...");

        // Parse token
        const tokenMatch = location.match(/\?zt=([^&]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1])) as {
              exp: number;
              iat: number;
              stream: string;
              host: string;
            };
            setTokenInfo(payload);
            addLog(
              `📊 Token expires at: ${new Date(payload.exp * 1000).toLocaleString()}`,
            );
            addLog(`⏰ Token lifetime: ${payload.exp - payload.iat} seconds`);

            const now = Math.floor(Date.now() / 1000);
            const timeLeft = payload.exp - now;
            addLog(`⏳ Time remaining: ${timeLeft} seconds`);
          }
        }
      } else {
        addLog("❌ No redirect location found");
      }
    } catch (error) {
      addLog("❌ Error: " + error);
    }
  };

  useEffect(() => {
    addLog("🚀 Token test page loaded");
    testTokenRefresh();

    // Test every 30 seconds
    const interval = setInterval(testTokenRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Zeno.fm Token Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Token Information</h2>
          {tokenInfo ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Stream:</strong> {tokenInfo.stream}
              </p>
              <p>
                <strong>Host:</strong> {tokenInfo.host}
              </p>
              <p>
                <strong>Issued:</strong>{" "}
                {new Date(tokenInfo.iat * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Expires:</strong>{" "}
                {new Date(tokenInfo.exp * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Lifetime:</strong> {tokenInfo.exp - tokenInfo.iat}{" "}
                seconds
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Loading token information...</p>
          )}

          <button
            onClick={testTokenRefresh}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Token
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>

          <button
            onClick={() => setLogs([])}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          Test Instructions:
        </h3>
        <ul className="text-yellow-700 space-y-1">
          <li>
            • This page automatically tests token refresh every 30 seconds
          </li>
          <li>• Tokens expire after 60 seconds</li>
          <li>• Watch the logs to see token refresh in action</li>
          <li>
            • The radio player should now handle token expiration automatically
          </li>
        </ul>
      </div>
    </div>
  );
}
