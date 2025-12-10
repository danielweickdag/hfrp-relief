"use client";

import { useState } from "react";
import {
  Heart,
  Bell,
  Users,
  Check,
  UserPlus,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interests: {
    emergencyUpdates: boolean;
    volunteerOpportunities: boolean;
    newsletter: boolean;
    eventNotifications: boolean;
    impactReports: boolean;
  };
  volunteerAreas: string[];
  availability: string;
}

export default function MembershipPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    interests: {
      emergencyUpdates: true,
      volunteerOpportunities: true,
      newsletter: true,
      eventNotifications: false,
      impactReports: true,
    },
    volunteerAreas: [],
    availability: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const membershipBenefits = [
    {
      icon: Bell,
      title: "Stay Informed",
      description:
        "Get real-time updates on our relief efforts, emergency responses, and program developments in Haiti.",
      features: [
        "Emergency response alerts",
        "Monthly impact newsletters",
        "Program updates and stories",
        "Community announcements",
      ],
    },
    {
      icon: UserPlus,
      title: "Get Involved",
      description:
        "Discover meaningful ways to contribute your time, skills, and passion to our mission.",
      features: [
        "Volunteer opportunity notifications",
        "Skills-based project matching",
        "Local event invitations",
        "Fundraising campaign participation",
      ],
    },
    {
      icon: Users,
      title: "Join the Community",
      description:
        "Connect with like-minded individuals who share your commitment to helping families in Haiti.",
      features: [
        "Member-only events and gatherings",
        "Online community access",
        "Networking opportunities",
        "Mentorship programs",
      ],
    },
    {
      icon: Heart,
      title: "Make an Impact",
      description:
        "See exactly how your involvement contributes to positive change in Haitian communities.",
      features: [
        "Personal impact tracking",
        "Success story updates",
        "Behind-the-scenes content",
        "Direct feedback from beneficiaries",
      ],
    },
  ];

  const volunteerAreas = [
    "Emergency Response",
    "Education Programs",
    "Healthcare Initiatives",
    "Community Development",
    "Fundraising Events",
    "Social Media & Marketing",
    "Translation Services",
    "Administrative Support",
    "Technical Skills",
    "Event Planning",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestChange = (
    interest: keyof FormData["interests"],
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interest]: checked,
      },
    }));
  };

  const handleVolunteerAreaChange = (area: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      volunteerAreas: checked
        ? [...prev.volunteerAreas, area]
        : prev.volunteerAreas.filter((a) => a !== area),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          membershipType: "community", // Free community membership
          billingCycle: "free",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join community");
      }

      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        interests: {
          emergencyUpdates: true,
          volunteerOpportunities: true,
          newsletter: true,
          eventNotifications: false,
          impactReports: true,
        },
        volunteerAreas: [],
        availability: "",
      });
    } catch (error) {
      console.error("Error joining community:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
            Free Community Membership
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Join Our Community of
            <span className="text-blue-600"> Hope Builders</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stay connected with our mission to provide relief and hope to
            families in Haiti. Get updates, discover volunteer opportunities,
            and be part of a community making real change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                document
                  .getElementById("membership-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Join Our Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                2,500+
              </div>
              <div className="text-gray-600">Families Helped</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">15</div>
              <div className="text-gray-600">Communities Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                500+
              </div>
              <div className="text-gray-600">Active Volunteers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                $2M+
              </div>
              <div className="text-gray-600">Relief Distributed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What You'll Get as a Community Member
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our community for free and stay connected with our mission to
              bring hope and relief to Haiti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {membershipBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card
                  key={index}
                  className="border-2 hover:border-blue-200 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {benefit.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {benefit.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {benefit.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="membership-form" className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Community Today
            </h2>
            <p className="text-lg text-gray-600">
              It's completely free! Just tell us a bit about yourself and your
              interests.
            </p>
          </div>

          {submitStatus === "success" && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  Welcome to our community! You'll receive a confirmation email
                  shortly.
                </p>
              </div>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errorMessage}</p>
            </div>
          )}

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Communication Preferences */}
                <div>
                  <Label className="text-base font-medium">
                    What would you like to receive?
                  </Label>
                  <div className="mt-3 space-y-3">
                    {Object.entries({
                      emergencyUpdates: "Emergency response alerts",
                      volunteerOpportunities:
                        "Volunteer opportunity notifications",
                      newsletter: "Monthly newsletter and impact reports",
                      eventNotifications: "Event invitations and announcements",
                      impactReports: "Detailed impact stories and updates",
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={key}
                          checked={
                            formData.interests[
                              key as keyof FormData["interests"]
                            ]
                          }
                          onChange={(e) =>
                            handleInterestChange(
                              key as keyof FormData["interests"],
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <Label htmlFor={key} className="text-sm font-normal">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volunteer Interests */}
                <div>
                  <Label className="text-base font-medium">
                    Areas where you'd like to help (Optional)
                  </Label>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {volunteerAreas.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={area}
                          checked={formData.volunteerAreas.includes(area)}
                          onChange={(e) =>
                            handleVolunteerAreaChange(area, e.target.checked)
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <Label htmlFor={area} className="text-sm font-normal">
                          {area}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <Label htmlFor="availability">
                    When are you typically available to help? (Optional)
                  </Label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your availability</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="evenings">Evenings</option>
                    <option value="flexible">Flexible schedule</option>
                    <option value="emergency-only">
                      Emergency situations only
                    </option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isSubmitting ? "Joining..." : "Join Our Community"}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  By joining, you agree to receive communications from HFRP. You
                  can unsubscribe at any time.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Together, We're Making a Difference
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Every community member plays a vital role in our mission to bring
            hope and relief to families in Haiti.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="opacity-90">
                Of donations go directly to relief efforts
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Emergency response capability</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5 Years</div>
              <div className="opacity-90">Of continuous service to Haiti</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
