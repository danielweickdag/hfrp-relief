"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Heart,
  Target,
  Calendar,
  Users,
  DollarSign,
  Zap,
} from "lucide-react";
// Note: Using alert for notifications - can be replaced with a toast library later

interface AutomatedCampaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  endDate: string;
  status: "active" | "paused" | "completed";
  automationEnabled: boolean;
  milestones: Array<{
    id: string;
    amount: number;
    reached: boolean;
    description: string;
  }>;
  socialMediaEnabled: boolean;
  emailAutomationEnabled: boolean;
  recurringDonationEnabled: boolean;
}

interface AutomatedDonationSelectorProps {
  onSelectCampaign?: (
    campaignId: string,
    amount: number,
    isRecurring: boolean,
  ) => void;
  className?: string;
}

export function AutomatedDonationSelector({
  onSelectCampaign,
  className = "",
}: AutomatedDonationSelectorProps) {
  const [campaigns, setCampaigns] = useState<AutomatedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState<number>(25);
  const [isRecurring, setIsRecurring] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/stripe/automated-checkout");
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        throw new Error(data.message || "Failed to fetch campaigns");
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      alert("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setDonationAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const amount = Number.parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setDonationAmount(amount);
    }
  };

  const createCheckoutSession = async () => {
    if (!selectedCampaign) {
      alert("Please select a campaign");
      return;
    }

    if (donationAmount <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    setProcessingCheckout(true);

    try {
      const response = await fetch("/api/stripe/automated-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: selectedCampaign,
          amount: donationAmount * 100, // Convert to cents
          isRecurring,
          successUrl: `${window.location.origin}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/donation/cancelled`,
          metadata: {
            source: "automated_donation_selector",
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;

        // Also call the callback if provided
        if (onSelectCampaign) {
          onSelectCampaign(selectedCampaign, donationAmount, isRecurring);
        }
      } else {
        throw new Error(data.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
      alert("Failed to create donation checkout");
    } finally {
      setProcessingCheckout(false);
    }
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getNextMilestone = (campaign: AutomatedCampaign) => {
    return campaign.milestones.find((milestone) => !milestone.reached);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading campaigns...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Support Our Mission</h2>
        <p className="text-gray-600">
          Choose a campaign and help us make a difference with automated impact
          tracking
        </p>
      </div>

      {/* Campaign Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => {
          const progressPercentage = getProgressPercentage(
            campaign.raised,
            campaign.goal,
          );
          const nextMilestone = getNextMilestone(campaign);
          const isSelected = selectedCampaign === campaign.id;

          return (
            <Card
              key={campaign.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedCampaign(campaign.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {campaign.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={
                        campaign.status === "active" ? "default" : "secondary"
                      }
                    >
                      {campaign.status}
                    </Badge>
                    {campaign.automationEnabled && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised: {formatCurrency(campaign.raised)}</span>
                    <span>Goal: {formatCurrency(campaign.goal)}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {progressPercentage.toFixed(1)}% complete
                  </div>
                </div>

                {/* Next Milestone */}
                {nextMilestone && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">Next Milestone:</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatCurrency(nextMilestone.amount)} -{" "}
                      {nextMilestone.description}
                    </div>
                  </div>
                )}

                {/* Automation Features */}
                <div className="flex gap-2 text-xs">
                  {campaign.socialMediaEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Social
                    </Badge>
                  )}
                  {campaign.emailAutomationEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      Email
                    </Badge>
                  )}
                  {campaign.recurringDonationEnabled && (
                    <Badge variant="outline" className="text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      Recurring
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Donation Amount Selection */}
      {selectedCampaign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Choose Your Donation Amount
            </CardTitle>
            <CardDescription>
              Select a predefined amount or enter a custom amount
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Predefined Amounts */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={
                    donationAmount === amount && !customAmount
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleAmountSelect(amount)}
                  className="h-12"
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => handleCustomAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>

            {/* Recurring Donation Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Make this a monthly recurring donation
              </Label>
            </div>

            {/* Selected Campaign Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">You're supporting:</div>
              <div className="font-medium">
                {campaigns.find((c) => c.id === selectedCampaign)?.name}
              </div>
              <div className="text-lg font-bold text-green-600 mt-1">
                {formatCurrency(donationAmount)}
                {isRecurring && (
                  <span className="text-sm font-normal"> /month</span>
                )}
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={createCheckoutSession}
              disabled={processingCheckout || donationAmount <= 0}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {processingCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Checkout...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Donate {formatCurrency(donationAmount)}
                  {isRecurring && " Monthly"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
