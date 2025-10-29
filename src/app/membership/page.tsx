"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Heart, Users, Globe, Star, ArrowRight, Shield, Mail, Phone, HandHeart, LucideIcon } from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  color: string;
  impact: string;
  icon: LucideIcon;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: "basic" | "standard" | "premium";
  billingCycle: "monthly" | "annual";
  preferences: {
    emailUpdates: boolean;
    smsUpdates: boolean;
    newsletter: boolean;
  };
}

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    membershipType: "basic",
    billingCycle: "monthly",
    preferences: {
      emailUpdates: true,
      smsUpdates: false,
      newsletter: true,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const membershipPlans: MembershipPlan[] = [
    {
      id: "basic",
      name: "Hope Builder",
      description: "Help us provide basic necessities to families in need",
      amount: billingCycle === "monthly" ? 15.0 : 150.0,
      interval: billingCycle === "monthly" ? "month" : "year",
      features: [
        "Monthly impact newsletter",
        "Access to relief updates",
        "Community support network",
        "Digital impact certificates",
        "Prayer request submissions"
      ],
      color: "blue",
      impact: "Provides clean water for 5 families for one month",
      icon: Heart
    },
    {
      id: "standard",
      name: "Relief Champion",
       description: "Support emergency response and ongoing relief programs",
       amount: billingCycle === "monthly" ? 35.0 : 350.0,
       interval: billingCycle === "monthly" ? "month" : "year",
      features: [
        "All Hope Builder benefits",
        "Quarterly video impact reports",
        "Priority emergency updates",
        "Direct communication with field teams",
        "Exclusive volunteer opportunities",
        "Member appreciation events"
      ],
      popular: true,
      color: "green",
      impact: "Feeds 10 families for one week during crisis",
      icon: HandHeart
    },
    {
      id: "premium",
      name: "Transformation Partner",
       description: "Enable long-term community development and sustainable change",
       amount: billingCycle === "monthly" ? 75.0 : 750.0,
       interval: billingCycle === "monthly" ? "month" : "year",
      features: [
        "All Relief Champion benefits",
        "Monthly calls with program directors",
        "Behind-the-scenes field reports",
        "Annual Haiti visit opportunity",
        "Personal impact dashboard",
        "Tax-deductible receipts",
        "Legacy project naming rights"
      ],
      color: "purple",
      impact: "Supports education for 3 children for one month",
      icon: Globe
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setFormData(prev => ({
      ...prev,
      membershipType: planId as "basic" | "standard" | "premium",
      billingCycle
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("preferences.")) {
      const prefKey = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
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
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          membershipType: "basic",
          billingCycle: "monthly",
          preferences: {
            emailUpdates: true,
            smsUpdates: false,
            newsletter: true,
          },
        });
        setSelectedPlan("");
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || "An error occurred during registration");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, billingCycle }));
  }, [billingCycle]);

  const getColorClasses = (color: string, variant: "bg" | "border" | "text") => {
    const colorMap = {
      blue: { bg: "bg-blue-600", border: "border-blue-600", text: "text-blue-600" },
      green: { bg: "bg-green-600", border: "border-green-600", text: "text-green-600" },
      purple: { bg: "bg-purple-600", border: "border-purple-600", text: "text-purple-600" },
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-green-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Partner With Us in Relief
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Join our community of compassionate supporters bringing hope, relief, and transformation 
              to families in Haiti. Every membership directly funds life-changing programs and emergency response.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>Transparent Impact</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                <span>Direct Relief</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>Lasting Change</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Impact Statistics */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Membership Creates Real Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how your support directly transforms lives in Haiti through our relief programs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">2,500+</div>
              <div className="text-gray-600">Families Served</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandHeart className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15,000+</div>
              <div className="text-gray-600">Meals Provided</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600">Communities Reached</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">800+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Choose Your Support Level</h2>
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save $30-150
              </span>
            </button>
          </div>
        </div>

        {/* Membership Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                selectedPlan === plan.id
                  ? `${getColorClasses(plan.color, "border")} ring-4 ring-opacity-20 ${getColorClasses(plan.color, "bg").replace("bg-", "ring-")}`
                  : "border-gray-200 hover:border-gray-300"
              } ${plan.popular ? "scale-105" : ""}`}
            >
              {plan.popular && (
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${getColorClasses(plan.color, "bg")} text-white px-4 py-1 rounded-full text-sm font-medium flex items-center`}>
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${getColorClasses(plan.color, "bg")} flex items-center justify-center`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">${plan.amount}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                    {billingCycle === "annual" && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save ${plan.id === "basic" ? "30" : plan.id === "standard" ? "70" : "150"}
                      </div>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${getColorClasses(plan.color, "text")} bg-gray-50 p-3 rounded-lg`}>
                    {plan.impact}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className={`w-5 h-5 ${getColorClasses(plan.color, "text")} mr-3 mt-0.5 flex-shrink-0`} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    selectedPlan === plan.id
                      ? `${getColorClasses(plan.color, "bg")} text-white`
                      : `border-2 ${getColorClasses(plan.color, "border")} ${getColorClasses(plan.color, "text")} hover:${getColorClasses(plan.color, "bg")} hover:text-white`
                  }`}
                >
                  {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Registration Form */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Complete Your Membership
            </h3>

            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">Registration Successful!</h4>
                    <p className="text-green-700">Welcome to the HFRP family! You'll receive a confirmation email shortly.</p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-900">Registration Failed</h4>
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Communication Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.emailUpdates"
                      checked={formData.preferences.emailUpdates}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Email updates about our programs and impact</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.smsUpdates"
                      checked={formData.preferences.smsUpdates}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">SMS updates for urgent needs and emergencies</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferences.newsletter"
                      checked={formData.preferences.newsletter}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700">Monthly newsletter with stories and updates</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Membership Registration
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                By registering, you agree to our terms of service and privacy policy.
                Your membership will be processed securely through Stripe.
              </p>
            </div>
          </div>
        )}

        {/* Impact Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl text-white p-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6">Your Impact Matters</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-blue-100">Families Supported</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">1,200+</div>
                <div className="text-blue-100">Meals Provided Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-blue-100">Funds to Programs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
