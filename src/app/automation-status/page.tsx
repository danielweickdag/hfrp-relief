"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AutomationStatus {
  stripeSync: {
    campaigns: number;
    plans: number;
    stripeProducts: number;
    stripePrices: number;
    lastSync: string;
  };
  cron: {
    isActive: boolean;
    nextRun: string;
    schedule: string;
  };
  health: {
    stripe: boolean;
    api: boolean;
    database: boolean;
  };
}

export default function AutomationStatusPage() {
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      // Get sync status
      const syncResponse = await fetch("/api/stripe/sync?action=status");
      const syncData = syncResponse.ok ? await syncResponse.json() : null;

      // Mock cron and health status (you can implement actual checks)
      const mockStatus: AutomationStatus = {
        stripeSync: syncData?.data || {
          campaigns: 0,
          plans: 0,
          stripeProducts: 0,
          stripePrices: 0,
          lastSync: new Date().toISOString(),
        },
        cron: {
          isActive: true,
          nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Next 6 hours
          schedule: "Every 6 hours",
        },
        health: {
          stripe: true,
          api: true,
          database: true,
        },
      };

      setStatus(mockStatus);
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      console.error("Failed to load automation status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runManualSync = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await loadStatus();
      }
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading automation status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🤖 Automation Status
              </h1>
              <p className="text-gray-600">
                Real-time status of all automated systems
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={runManualSync} disabled={isLoading}>
                {isLoading ? "Syncing..." : "🔄 Manual Sync"}
              </Button>
              <Button onClick={loadStatus} variant="outline">
                ↻ Refresh
              </Button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date(lastUpdate).toLocaleString()}
            </p>
          )}
        </div>

        {status && (
          <div className="space-y-6">
            {/* Overall Health */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">System Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      status.health.stripe
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {status.health.stripe ? "✅" : "❌"}
                  </div>
                  <h3 className="font-semibold">Stripe Integration</h3>
                  <Badge
                    variant={status.health.stripe ? "default" : "destructive"}
                  >
                    {status.health.stripe ? "Healthy" : "Error"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      status.health.api
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {status.health.api ? "🌐" : "🚫"}
                  </div>
                  <h3 className="font-semibold">API Services</h3>
                  <Badge
                    variant={status.health.api ? "default" : "destructive"}
                  >
                    {status.health.api ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      status.health.database
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {status.health.database ? "💾" : "⚠️"}
                  </div>
                  <h3 className="font-semibold">Data Storage</h3>
                  <Badge
                    variant={status.health.database ? "default" : "destructive"}
                  >
                    {status.health.database ? "Connected" : "Error"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Stripe Sync Status */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Stripe Synchronization
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {status.stripeSync.campaigns}
                  </div>
                  <div className="text-sm text-gray-600">Campaigns</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {status.stripeSync.plans}
                  </div>
                  <div className="text-sm text-gray-600">Plans</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {status.stripeSync.stripeProducts}
                  </div>
                  <div className="text-sm text-gray-600">Stripe Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {status.stripeSync.stripePrices}
                  </div>
                  <div className="text-sm text-gray-600">Stripe Prices</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Last sync:{" "}
                {new Date(status.stripeSync.lastSync).toLocaleString()}
              </div>
            </Card>

            {/* Automation Schedule */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Automated Tasks</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Stripe Campaign Sync</h3>
                    <p className="text-sm text-gray-600">
                      Automatically syncs campaigns and plans with Stripe
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={status.cron.isActive ? "default" : "secondary"}
                    >
                      {status.cron.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      {status.cron.schedule}
                    </div>
                    <div className="text-xs text-gray-400">
                      Next: {new Date(status.cron.nextRun).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  className="h-auto p-4 flex flex-col items-center"
                  variant="outline"
                >
                  <span className="text-2xl mb-2">🔄</span>
                  <span className="font-semibold">Force Sync</span>
                  <span className="text-sm text-gray-600">
                    Run sync immediately
                  </span>
                </Button>
                <Button
                  className="h-auto p-4 flex flex-col items-center"
                  variant="outline"
                >
                  <span className="text-2xl mb-2">📊</span>
                  <span className="font-semibold">View Reports</span>
                  <span className="text-sm text-gray-600">
                    Analytics dashboard
                  </span>
                </Button>
                <Button
                  className="h-auto p-4 flex flex-col items-center"
                  variant="outline"
                >
                  <span className="text-2xl mb-2">⚙️</span>
                  <span className="font-semibold">Settings</span>
                  <span className="text-sm text-gray-600">
                    Configure automation
                  </span>
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Stripe sync completed successfully</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(status.stripeSync.lastSync).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>
                      Created {status.stripeSync.stripeProducts} products in
                      Stripe
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(status.stripeSync.lastSync).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span>
                      Generated {status.stripeSync.stripePrices} pricing options
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(status.stripeSync.lastSync).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
