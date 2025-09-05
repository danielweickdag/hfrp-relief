"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Target,
  Users,
  Calendar,
  Settings,
  BarChart3,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface NewCampaign {
  name: string;
  description: string;
  goal: number;
}

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState<NewCampaign>({
    name: "",
    description: "",
    goal: 0,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/stripe/campaigns");
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  const createCampaign = async () => {
    if (
      !newCampaign.name ||
      !newCampaign.description ||
      newCampaign.goal <= 0
    ) {
      alert("Please fill in all fields with valid values");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCampaign),
      });

      const data = await response.json();
      if (data.success) {
        await fetchCampaigns();
        setNewCampaign({ name: "", description: "", goal: 0 });
        setShowNewCampaignForm(false);
      } else {
        alert("Failed to create campaign: " + data.error);
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (campaign: Campaign) => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/campaigns", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaign),
      });

      const data = await response.json();
      if (data.success) {
        await fetchCampaigns();
        setEditingCampaign(null);
      } else {
        alert("Failed to update campaign: " + data.error);
      }
    } catch (error) {
      console.error("Failed to update campaign:", error);
      alert("Failed to update campaign");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Campaign Management</h1>
        </div>

        <Button
          onClick={() => setShowNewCampaignForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Campaigns
                </p>
                <p className="text-2xl font-bold">
                  {campaigns.filter((c) => c.status === "active").length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Goal</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    campaigns.reduce((sum, c) => sum + c.goal, 0)
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    campaigns.reduce((sum, c) => sum + c.raised, 0)
                  )}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Campaign Form */}
      {showNewCampaignForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Campaign</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewCampaignForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-name">Campaign Name</Label>
                <Input
                  id="new-name"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                  placeholder="Enter campaign name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-goal">Fundraising Goal</Label>
                <Input
                  id="new-goal"
                  type="number"
                  value={newCampaign.goal || ""}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      goal: Number(e.target.value),
                    })
                  }
                  placeholder="Enter goal amount"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newCampaign.description}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    description: e.target.value,
                  })
                }
                placeholder="Enter campaign description"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewCampaignForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={createCampaign} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border rounded-lg p-4 space-y-3"
              >
                {editingCampaign?.id === campaign.id ? (
                  /* Edit Form */
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Campaign Name</Label>
                        <Input
                          value={editingCampaign.name}
                          onChange={(e) =>
                            setEditingCampaign({
                              ...editingCampaign,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fundraising Goal</Label>
                        <Input
                          type="number"
                          value={editingCampaign.goal}
                          onChange={(e) =>
                            setEditingCampaign({
                              ...editingCampaign,
                              goal: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editingCampaign.description}
                        onChange={(e) =>
                          setEditingCampaign({
                            ...editingCampaign,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label>Status:</Label>
                        <select
                          value={editingCampaign.status}
                          onChange={(e) =>
                            setEditingCampaign({
                              ...editingCampaign,
                              status: e.target.value as
                                | "active"
                                | "paused"
                                | "completed",
                            })
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingCampaign(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => updateCampaign(editingCampaign)}
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display View */
                  <>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                          {campaign.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.description}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCampaign(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {formatCurrency(campaign.raised)} /{" "}
                          {formatCurrency(campaign.goal)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${getProgressPercentage(campaign.raised, campaign.goal)}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {Math.round(
                            getProgressPercentage(
                              campaign.raised,
                              campaign.goal
                            )
                          )}
                          % complete
                        </span>
                        <span>
                          Created:{" "}
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  No campaigns found. Create your first campaign to get started!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
