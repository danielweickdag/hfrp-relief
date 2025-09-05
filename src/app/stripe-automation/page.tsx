"use client";

import { AutomatedDonationSelector } from "@/components/automated-donation-selector";
import { AutomatedEventManager } from "@/components/automated-event-manager";
import { StripeAutomationDashboard } from "@/components/stripe-automation-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  DollarSign,
  Calendar,
  BarChart3,
  Heart,
  Target,
  Users,
  TrendingUp,
} from "lucide-react";

export default function StripeAutomationPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold">Automated Donation System</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience our fully automated donation and event management system
          powered by Stripe. Every contribution triggers automated milestone
          tracking, social media posts, and email updates.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge variant="default" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Stripe Integration
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campaign Automation
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Social Media Auto-posting
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Milestone Tracking
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="text-center">
            <DollarSign className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <CardTitle>Smart Donations</CardTitle>
            <CardDescription>
              Automated processing with instant receipt generation and milestone
              tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• One-time and recurring donations</li>
              <li>• Automatic milestone celebrations</li>
              <li>• Real-time progress tracking</li>
              <li>• Donor appreciation automation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-2" />
            <CardTitle>Event Management</CardTitle>
            <CardDescription>
              Complete event lifecycle automation from creation to post-event
              follow-up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• Automated ticket sales</li>
              <li>• Event reminder emails</li>
              <li>• Social media promotion</li>
              <li>• Capacity management</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-purple-600 mb-2" />
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              Real-time insights into your fundraising performance and
              automation effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• Live donation tracking</li>
              <li>• Campaign performance metrics</li>
              <li>• Automation activity logs</li>
              <li>• Social media engagement</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Main Automation Interface */}
      <Tabs defaultValue="donate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="donate" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Donate
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                Choose a campaign and make an impact. Every donation triggers
                automated thank you messages, social media posts, and progress
                updates to keep our community informed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomatedDonationSelector />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                Event Management
              </CardTitle>
              <CardDescription>
                Browse upcoming events and purchase tickets. Our automated
                system handles everything from ticket sales to event reminders
                and social media promotion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomatedEventManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <StripeAutomationDashboard />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Automation Features
              </CardTitle>
              <CardDescription>
                Learn about our comprehensive automation system that works
                behind the scenes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Donation Automation</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Instant Processing</p>
                        <p className="text-sm text-gray-600">
                          Stripe webhooks trigger immediate donation processing
                          and receipt generation
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Milestone Tracking</p>
                        <p className="text-sm text-gray-600">
                          Automatic milestone detection with celebration posts
                          and notifications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Thank You Automation</p>
                        <p className="text-sm text-gray-600">
                          Personalized thank you emails and social media
                          appreciation posts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Automation</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Ticket Sales</p>
                        <p className="text-sm text-gray-600">
                          Automated ticket processing with inventory management
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Event Reminders</p>
                        <p className="text-sm text-gray-600">
                          Scheduled email reminders and calendar invitations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Social Promotion</p>
                        <p className="text-sm text-gray-600">
                          Automated social media posts for event promotion and
                          updates
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Social Media Integration
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Auto-posting</p>
                        <p className="text-sm text-gray-600">
                          Milestone celebrations, thank you posts, and event
                          announcements
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Content Templates</p>
                        <p className="text-sm text-gray-600">
                          Pre-designed templates for consistent brand messaging
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Multi-platform Support</p>
                        <p className="text-sm text-gray-600">
                          Simultaneous posting to Facebook, Twitter, Instagram,
                          and LinkedIn
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Email Automation</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Welcome Sequences</p>
                        <p className="text-sm text-gray-600">
                          Automated onboarding for new donors and event
                          participants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Progress Updates</p>
                        <p className="text-sm text-gray-600">
                          Regular campaign progress reports and impact stories
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div>
                        <p className="font-medium">Event Management</p>
                        <p className="text-sm text-gray-600">
                          Confirmation emails, reminders, and post-event
                          follow-ups
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold mb-3">System Status</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">Stripe Webhooks Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">Email Service Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">Social Media APIs Ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
