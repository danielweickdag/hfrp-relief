"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  stripeProductId?: string;
  stripePriceIds: string[];
  suggestedAmounts: number[];
  currency: string;
  allowCustomAmount: boolean;
  enableRecurring: boolean;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  intervalCount?: number;
  trialPeriodDays?: number;
  stripeProductId?: string;
  stripePriceId?: string;
  active: boolean;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncStatus {
  lastSync: string;
  totalCampaigns: number;
  totalPlans: number;
  stripeProducts: number;
  stripePrices: number;
}

export default function CampaignSyncManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    id: "",
    name: "",
    description: "",
    goal: 0,
    suggestedAmounts: "5,10,15,25,50,100",
    allowCustomAmount: true,
    enableRecurring: true,
  });

  const [newPlan, setNewPlan] = useState({
    id: "",
    name: "",
    description: "",
    amount: 0,
    interval: "month" as "month" | "year",
    campaignId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load sync status
      const statusResponse = await fetch("/api/stripe/sync?action=status");
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSyncStatus(statusData.data);
      }

      // Load plans
      const plansResponse = await fetch("/api/stripe/sync?action=plans");
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.data);
      }

      // Load campaigns (from campaigns API)
      const campaignsResponse = await fetch("/api/stripe/campaigns");
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.campaigns || []);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithStripe = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/stripe/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      setSyncResult(result);

      if (result.success) {
        await loadData(); // Reload data after successful sync
      }
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncResult({ success: false, error: "Sync failed" });
    } finally {
      setIsSyncing(false);
    }
  };

  const createCampaign = async () => {
    try {
      const campaignData = {
        ...newCampaign,
        raised: 0,
        stripePriceIds: [],
        suggestedAmounts: newCampaign.suggestedAmounts
          .split(",")
          .map((a) => Number.parseFloat(a.trim())),
        currency: "usd",
        status: "active",
      };

      const response = await fetch("/api/stripe/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        setShowNewCampaign(false);
        setNewCampaign({
          id: "",
          name: "",
          description: "",
          goal: 0,
          suggestedAmounts: "5,10,15,25,50,100",
          allowCustomAmount: true,
          enableRecurring: true,
        });
        await loadData();
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaign & Plan Sync Manager</h2>
        <div className="flex gap-2">
          <Button
            onClick={syncWithStripe}
            disabled={isSyncing}
            variant="default"
          >
            {isSyncing ? "Syncing..." : "🔄 Sync with Stripe"}
          </Button>
          <Button onClick={loadData} disabled={isLoading} variant="outline">
            {isLoading ? "Loading..." : "↻ Refresh"}
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      {syncStatus && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Sync Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {syncStatus.totalCampaigns}
              </div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {syncStatus.totalPlans}
              </div>
              <div className="text-sm text-gray-600">Plans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {syncStatus.stripeProducts}
              </div>
              <div className="text-sm text-gray-600">Stripe Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {syncStatus.stripePrices}
              </div>
              <div className="text-sm text-gray-600">Stripe Prices</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
          </div>
        </Card>
      )}

      {/* Sync Result */}
      {syncResult && (
        <Card
          className={`p-4 ${syncResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          <h3 className="text-lg font-semibold mb-2">
            {syncResult.success ? "✅ Sync Successful" : "❌ Sync Failed"}
          </h3>
          {syncResult.data && (
            <div className="text-sm">
              <p>Synced: {syncResult.data.synced} items</p>
              {syncResult.data.errors && syncResult.data.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Errors:</p>
                  <ul className="list-disc list-inside">
                    {syncResult.data.errors.map(
                      (error: string, index: number) => (
                        <li key={index} className="text-red-600">
                          {error}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Campaigns */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Campaigns</h3>
          <Button
            onClick={() => setShowNewCampaign(!showNewCampaign)}
            variant="outline"
            size="sm"
          >
            + New Campaign
          </Button>
        </div>

        {showNewCampaign && (
          <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <h4 className="font-semibold mb-3">Create New Campaign</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaign-id">Campaign ID</Label>
                <Input
                  id="campaign-id"
                  value={newCampaign.id}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, id: e.target.value })
                  }
                  placeholder="haiti-relief-emergency"
                />
              </div>
              <div>
                <Label htmlFor="campaign-name">Name</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                  placeholder="Haiti Emergency Relief"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="campaign-description">Description</Label>
                <Textarea
                  id="campaign-description"
                  value={newCampaign.description}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      description: e.target.value,
                    })
                  }
                  placeholder="Support families affected by the crisis..."
                />
              </div>
              <div>
                <Label htmlFor="campaign-goal">Goal ($)</Label>
                <Input
                  id="campaign-goal"
                  type="number"
                  value={newCampaign.goal}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      goal: Number.parseFloat(e.target.value),
                    })
                  }
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="campaign-amounts">
                  Suggested Amounts (comma-separated)
                </Label>
                <Input
                  id="campaign-amounts"
                  value={newCampaign.suggestedAmounts}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      suggestedAmounts: e.target.value,
                    })
                  }
                  placeholder="5,10,15,25,50,100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-custom"
                  checked={newCampaign.allowCustomAmount}
                  onCheckedChange={(checked) =>
                    setNewCampaign({
                      ...newCampaign,
                      allowCustomAmount: checked,
                    })
                  }
                />
                <Label htmlFor="allow-custom">Allow Custom Amount</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-recurring"
                  checked={newCampaign.enableRecurring}
                  onCheckedChange={(checked) =>
                    setNewCampaign({ ...newCampaign, enableRecurring: checked })
                  }
                />
                <Label htmlFor="enable-recurring">Enable Recurring</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={createCampaign}>Create Campaign</Button>
              <Button
                variant="outline"
                onClick={() => setShowNewCampaign(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{campaign.name}</h4>
                  <p className="text-sm text-gray-600">
                    {campaign.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant={
                        campaign.status === "active" ? "default" : "secondary"
                      }
                    >
                      {campaign.status}
                    </Badge>
                    {campaign.stripeProductId && (
                      <Badge variant="outline">Synced</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    ${campaign.raised.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    of ${campaign.goal.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((campaign.raised / campaign.goal) * 100)}%
                    complete
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Plans */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Subscription Plans</h3>
          <Button
            onClick={() => setShowNewPlan(!showNewPlan)}
            variant="outline"
            size="sm"
          >
            + New Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{plan.name}</h4>
                <Badge variant={plan.active ? "default" : "secondary"}>
                  {plan.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
              <div className="text-lg font-bold text-green-600">
                ${plan.amount}/{plan.interval}
              </div>
              {plan.stripePriceId && (
                <div className="mt-2">
                  <Badge variant="outline">Synced to Stripe</Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
