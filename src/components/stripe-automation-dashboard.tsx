"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Target,
  Mail,
  Share2,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";

interface DashboardStats {
  totalDonations: number;
  totalEvents: number;
  activeCampaigns: number;
  monthlyRecurring: number;
  automationEvents: number;
  socialMediaPosts: number;
  emailsSent: number;
  milestonesReached: number;
}

interface AutomationActivity {
  id: string;
  type: "donation" | "campaign" | "event" | "social" | "email" | "milestone";
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  amount?: number;
}

interface StripeAutomationDashboardProps {
  className?: string;
}

export function StripeAutomationDashboard({
  className = "",
}: StripeAutomationDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    totalEvents: 0,
    activeCampaigns: 0,
    monthlyRecurring: 0,
    automationEvents: 0,
    socialMediaPosts: 0,
    emailsSent: 0,
    milestonesReached: 0,
  });

  const [activities, setActivities] = useState<AutomationActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // For now using mock data - in production this would fetch from your automation system
      const mockStats: DashboardStats = {
        totalDonations: 45750.5,
        totalEvents: 8,
        activeCampaigns: 5,
        monthlyRecurring: 12500.0,
        automationEvents: 156,
        socialMediaPosts: 24,
        emailsSent: 89,
        milestonesReached: 7,
      };

      const mockActivities: AutomationActivity[] = [
        {
          id: "1",
          type: "donation",
          description: "New donation received for Annual Fundraising Gala",
          timestamp: "2024-12-01T10:30:00Z",
          status: "success",
          amount: 75,
        },
        {
          id: "2",
          type: "milestone",
          description:
            "Campaign milestone reached: $10,000 for Community Health Initiative",
          timestamp: "2024-12-01T09:15:00Z",
          status: "success",
          amount: 10000,
        },
        {
          id: "3",
          type: "social",
          description: "Automated social media post shared: Thank you message",
          timestamp: "2024-12-01T08:45:00Z",
          status: "success",
        },
        {
          id: "4",
          type: "email",
          description: "Weekly donor update email sent to 150 subscribers",
          timestamp: "2024-12-01T08:00:00Z",
          status: "success",
        },
        {
          id: "5",
          type: "event",
          description: "5 tickets sold for Community Health Workshop",
          timestamp: "2024-11-30T16:22:00Z",
          status: "success",
          amount: 75,
        },
        {
          id: "6",
          type: "campaign",
          description: "New automated campaign created: Holiday Food Drive",
          timestamp: "2024-11-30T14:10:00Z",
          status: "success",
        },
        {
          id: "7",
          type: "email",
          description: "Event reminder failed to send - email service issue",
          timestamp: "2024-11-30T12:00:00Z",
          status: "error",
        },
        {
          id: "8",
          type: "donation",
          description: "Monthly recurring donation processed",
          timestamp: "2024-11-30T06:00:00Z",
          status: "success",
          amount: 50,
        },
      ];

      setStats(mockStats);
      setActivities(mockActivities);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: AutomationActivity["type"]) => {
    switch (type) {
      case "donation":
        return <DollarSign className="w-4 h-4" />;
      case "campaign":
        return <Target className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "social":
        return <Share2 className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "milestone":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: AutomationActivity["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: AutomationActivity["type"]) => {
    switch (type) {
      case "donation":
        return "Donation";
      case "campaign":
        return "Campaign";
      case "event":
        return "Event";
      case "social":
        return "Social Media";
      case "email":
        return "Email";
      case "milestone":
        return "Milestone";
      default:
        return "Activity";
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stripe Automation Dashboard</h1>
          <p className="text-gray-600">
            Monitor your automated donation campaigns, events, and engagement
            metrics
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Automation Active
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalDonations)}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Recurring
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlyRecurring)}
            </div>
            <p className="text-xs text-muted-foreground">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.milestonesReached} milestones reached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Automation Events
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.automationEvents}</div>
            <p className="text-xs text-muted-foreground">In the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Automation Activity</CardTitle>
                <CardDescription>
                  Latest automated actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.slice(0, 6).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 mt-1">
                      {getActivityIcon(activity.type)}
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{activity.description}</p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(activity.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
                <CardDescription>
                  Key performance indicators for automated systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Social Media Engagement</span>
                    <span>{stats.socialMediaPosts} posts</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Email Campaign Success</span>
                    <span>{stats.emailsSent} emails sent</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Milestone Completion</span>
                    <span>{stats.milestonesReached} reached</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Event Ticket Sales</span>
                    <span>{stats.totalEvents} active events</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed metrics for your automated donation campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p>Campaign analytics will be displayed here</p>
                <p className="text-sm">
                  Integration with campaign data pending
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>
                Ticket sales and event performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p>Event analytics will be displayed here</p>
                <p className="text-sm">Integration with event data pending</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Logs</CardTitle>
              <CardDescription>
                Complete log of all automated actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2 mt-1">
                      {getActivityIcon(activity.type)}
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "default"
                              : activity.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {activity.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{activity.description}</p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-green-600">
                          Amount: {formatCurrency(activity.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your automated systems and campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Event
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Send Email Update
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Post to Social Media
            </Button>
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              View Full Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
