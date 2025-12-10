"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Clock,
  Bell,
  Shield,
  Target,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Mail,
  Zap,
} from "lucide-react";

interface AutomationSettings {
  scheduling: {
    enabled: boolean;
    publishTime: string;
    backupFrequency: string;
    analyticsReports: string;
    seoOptimization: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    publishNotifications: boolean;
    errorAlerts: boolean;
    weeklyReports: boolean;
    emailAddress: string;
  };
  quality: {
    minWordCount: number;
    maxWordCount: number;
    readabilityThreshold: number;
    moderationLevel: string;
    autoPublish: boolean;
    requireApproval: boolean;
  };
  backup: {
    autoBackup: boolean;
    retentionDays: number;
    compressionEnabled: boolean;
    cloudSync: boolean;
  };
}

const defaultSettings: AutomationSettings = {
  scheduling: {
    enabled: true,
    publishTime: "09:00",
    backupFrequency: "daily",
    analyticsReports: "weekly",
    seoOptimization: true,
  },
  notifications: {
    emailAlerts: true,
    publishNotifications: true,
    errorAlerts: true,
    weeklyReports: true,
    emailAddress: "",
  },
  quality: {
    minWordCount: 300,
    maxWordCount: 5000,
    readabilityThreshold: 60,
    moderationLevel: "medium",
    autoPublish: false,
    requireApproval: true,
  },
  backup: {
    autoBackup: true,
    retentionDays: 30,
    compressionEnabled: true,
    cloudSync: false,
  },
};

export default function BlogAutomationSettings() {
  const [settings, setSettings] = useState<AutomationSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("blogAutomationSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("blogAutomationSettings", JSON.stringify(settings));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (
    section: keyof AutomationSettings,
    key: string,
    value: string | number | boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automation Settings
        </CardTitle>
        <CardDescription>
          Configure automation schedules, notifications, and quality thresholds
          for your blog management system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scheduling" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scheduling" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduling" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishTime">Default Publish Time</Label>
                <Input
                  id="publishTime"
                  type="time"
                  value={settings.scheduling.publishTime}
                  onChange={(e) =>
                    updateSettings("scheduling", "publishTime", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <select
                  id="backupFrequency"
                  className="w-full p-2 border rounded-md"
                  value={settings.scheduling.backupFrequency}
                  onChange={(e) =>
                    updateSettings(
                      "scheduling",
                      "backupFrequency",
                      e.target.value,
                    )
                  }
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="analyticsReports">Analytics Reports</Label>
                <select
                  id="analyticsReports"
                  className="w-full p-2 border rounded-md"
                  value={settings.scheduling.analyticsReports}
                  onChange={(e) =>
                    updateSettings(
                      "scheduling",
                      "analyticsReports",
                      e.target.value,
                    )
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="seoOptimization"
                  checked={settings.scheduling.seoOptimization}
                  onCheckedChange={(checked) =>
                    updateSettings("scheduling", "seoOptimization", checked)
                  }
                />
                <Label htmlFor="seoOptimization">Auto SEO Optimization</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Notification Email</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="admin@example.com"
                  value={settings.notifications.emailAddress}
                  onChange={(e) =>
                    updateSettings(
                      "notifications",
                      "emailAddress",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailAlerts"
                    checked={settings.notifications.emailAlerts}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", "emailAlerts", checked)
                    }
                  />
                  <Label htmlFor="emailAlerts">Email Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publishNotifications"
                    checked={settings.notifications.publishNotifications}
                    onCheckedChange={(checked) =>
                      updateSettings(
                        "notifications",
                        "publishNotifications",
                        checked,
                      )
                    }
                  />
                  <Label htmlFor="publishNotifications">
                    Publish Notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="errorAlerts"
                    checked={settings.notifications.errorAlerts}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", "errorAlerts", checked)
                    }
                  />
                  <Label htmlFor="errorAlerts">Error Alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weeklyReports"
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      updateSettings("notifications", "weeklyReports", checked)
                    }
                  />
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWordCount">Minimum Word Count</Label>
                <Input
                  id="minWordCount"
                  type="number"
                  value={settings.quality.minWordCount}
                  onChange={(e) =>
                    updateSettings(
                      "quality",
                      "minWordCount",
                      Number.parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWordCount">Maximum Word Count</Label>
                <Input
                  id="maxWordCount"
                  type="number"
                  value={settings.quality.maxWordCount}
                  onChange={(e) =>
                    updateSettings(
                      "quality",
                      "maxWordCount",
                      Number.parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="readabilityThreshold">
                  Readability Threshold (%)
                </Label>
                <Input
                  id="readabilityThreshold"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.quality.readabilityThreshold}
                  onChange={(e) =>
                    updateSettings(
                      "quality",
                      "readabilityThreshold",
                      Number.parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moderationLevel">Moderation Level</Label>
                <select
                  id="moderationLevel"
                  className="w-full p-2 border rounded-md"
                  value={settings.quality.moderationLevel}
                  onChange={(e) =>
                    updateSettings("quality", "moderationLevel", e.target.value)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="strict">Strict</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoPublish"
                  checked={settings.quality.autoPublish}
                  onCheckedChange={(checked) =>
                    updateSettings("quality", "autoPublish", checked)
                  }
                />
                <Label htmlFor="autoPublish">
                  Auto Publish (if quality met)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireApproval"
                  checked={settings.quality.requireApproval}
                  onCheckedChange={(checked) =>
                    updateSettings("quality", "requireApproval", checked)
                  }
                />
                <Label htmlFor="requireApproval">Require Manual Approval</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retention Period (days)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={settings.backup.retentionDays}
                  onChange={(e) =>
                    updateSettings(
                      "backup",
                      "retentionDays",
                      Number.parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="autoBackup"
                  checked={settings.backup.autoBackup}
                  onCheckedChange={(checked) =>
                    updateSettings("backup", "autoBackup", checked)
                  }
                />
                <Label htmlFor="autoBackup">Auto Backup</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="compressionEnabled"
                  checked={settings.backup.compressionEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings("backup", "compressionEnabled", checked)
                  }
                />
                <Label htmlFor="compressionEnabled">Enable Compression</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="cloudSync"
                  checked={settings.backup.cloudSync}
                  onCheckedChange={(checked) =>
                    updateSettings("backup", "cloudSync", checked)
                  }
                />
                <Label htmlFor="cloudSync">Cloud Sync</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button and Status */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2">
            {saveStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Settings saved successfully</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to save settings</span>
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
