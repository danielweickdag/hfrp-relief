"use client";

import { useState, useEffect } from "react";
import StripeButton from "../_components/StripeButton";
import { getStripeEnhanced } from "@/lib/stripeEnhanced";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Heart, 
  ShieldCheck, 
  Zap, 
  Utensils, 
  Pill, 
  GraduationCap, 
  Home,
  Globe,
  Users
} from "lucide-react";

export default function DonatePage() {
  const stripeEnhanced = getStripeEnhanced();
  const campaignId =
    process.env.NEXT_PUBLIC_STRIPE_MAIN_CAMPAIGN || "haiti-relief-main";

  const [donationType, setDonationType] = useState<"one-time" | "recurring">("recurring");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(0.50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);

  // Configuration
  const [config, setConfig] = useState<any>(null);
  
  useEffect(() => {
    if (stripeEnhanced) {
      try {
        setConfig(stripeEnhanced.getConfig());
      } catch {}
    }
  }, [stripeEnhanced]);

  const [interval, setInterval] = useState<"day" | "month">("month");

  const presets = {
    "one-time": [
      { amount: 50, label: "Meals", desc: "Feeds a family for a week", icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
      { amount: 100, label: "Health", desc: "Provides vital medicine", icon: Pill, color: "text-red-500", bg: "bg-red-50" },
      { amount: 250, label: "Education", desc: "Sends a child to school", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50" },
      { amount: 500, label: "Housing", desc: "Helps build a safe home", icon: Home, color: "text-purple-500", bg: "bg-purple-50" },
    ],
    "recurring": [
      { amount: 0.50, label: "Daily Hope", desc: "Just 50¢ a day", interval: "day" },
    ]
  };

  const currentPresets = presets[donationType];
  const minAmount = config?.minimumAmount || 0.50;
  
  const finalAmount = isCustom 
    ? parseFloat(customAmount) 
    : selectedAmount || 0;

  const isValid = !isNaN(finalAmount) && finalAmount >= minAmount;

  useEffect(() => {
    // Initial setup based on default type
    if (donationType === "recurring") {
      setSelectedAmount(0.50);
      setInterval("day");
    }
  }, []); // Run once on mount

  const handlePresetSelect = (amount: number, presetInterval?: string) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
    if (donationType === "recurring" && presetInterval) {
      setInterval(presetInterval as "day" | "month");
    }
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  if (!stripeEnhanced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle className="text-xl text-red-600 mb-2">Service Unavailable</CardTitle>
          <CardDescription>
            Donation system is currently being configured. Please check back soon.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Background */}
      <div className="bg-blue-900 text-white pb-32 pt-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-blue-800 text-blue-100 border-blue-700 font-medium rounded-full mb-6 inline-flex items-center">
            <Globe className="w-3 h-3 mr-2" />
            Direct Aid Initiative
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Support Haitian Families
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-light">
            Your generosity brings food, clean water, healthcare, and hope to those who need it most.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Donation Card */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Card className="w-full shadow-2xl border-0 overflow-hidden rounded-2xl">
              <CardHeader className="bg-white pb-0 pt-8 px-6 sm:px-8">
                <Tabs 
                  defaultValue="one-time" 
                  value={donationType} 
                  onValueChange={(v) => {
                    const type = v as "one-time" | "recurring";
                    setDonationType(type);
                    // Set sensible defaults when switching tabs
                    if (type === "recurring") {
                      setSelectedAmount(0.50);
                      setInterval("day");
                    } else {
                      setSelectedAmount(100);
                      setInterval("month");
                    }
                    setIsCustom(false);
                    setCustomAmount("");
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 h-16 p-1.5 bg-slate-100 rounded-xl mb-6">
                    <TabsTrigger 
                      value="recurring" 
                      className="h-full text-lg font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                    >
                      Monthly / Daily
                    </TabsTrigger>
                    <TabsTrigger 
                      value="one-time" 
                      className="h-full text-lg font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                    >
                      Give Once
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 space-y-8 pt-4">
                
                {/* Amount Grid */}
                {donationType === "one-time" && (
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Select Impact
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentPresets.map((preset) => {
                        const Icon = (preset as any).icon;
                        const isSelected = selectedAmount === preset.amount;
                        return (
                          <button
                            key={preset.amount}
                            onClick={() => handlePresetSelect(preset.amount, (preset as any).interval)}
                            className={`
                              relative p-4 rounded-xl border-2 text-left transition-all duration-200 group flex items-start space-x-4
                              ${isSelected
                                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" 
                                : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 bg-white"}
                            `}
                          >
                            <div className={`
                              p-3 rounded-lg flex-shrink-0 transition-colors
                              ${isSelected ? "bg-blue-600 text-white" : `${(preset as any).bg} ${(preset as any).color}`}
                            `}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-baseline space-x-1">
                                <span className={`text-xl font-bold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                  ${preset.amount}
                                </span>
                              </div>
                              <div className={`text-sm font-medium mt-1 ${isSelected ? "text-blue-700" : "text-gray-500"}`}>
                                {preset.label}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-4 right-4 text-blue-600">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {donationType === "recurring" && (
                  <div className="relative overflow-hidden rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 text-center space-y-6">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                      MOST POPULAR
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-blue-900">The "Daily Hope" Plan</h3>
                      <p className="text-blue-600 text-lg">
                        Small consistent acts create massive change.
                      </p>
                    </div>

                    <div className="py-6 bg-white rounded-xl border border-blue-100 shadow-sm max-w-sm mx-auto transform transition-transform hover:scale-105 duration-300">
                      <div className="flex items-center justify-center space-x-2 text-5xl font-extrabold text-blue-600 tracking-tight">
                        <span>$0.50</span>
                        <span className="text-xl font-medium text-gray-400 self-end mb-2">/day</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2 font-medium">Billed monthly as $15.00</p>
                    </div>

                    <div className="w-full max-w-xs mx-auto">
                      <StripeButton
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2"
                        campaignId={campaignId}
                        amount={0.50}
                        recurring={true}
                        interval="day"
                        hideFooter={true}
                      >
                        <Heart className="w-5 h-5 mr-2 fill-current" />
                        <span>Join Daily Hope</span>
                      </StripeButton>
                    </div>

                    <div className="flex justify-center space-x-6 text-sm text-blue-700 pt-2">
                      <div className="flex items-center"><Check className="w-4 h-4 mr-1.5 text-green-500" /> Cancel anytime</div>
                      <div className="flex items-center"><Check className="w-4 h-4 mr-1.5 text-green-500" /> Monthly report</div>
                    </div>
                  </div>
                )}

                {/* Custom Amount Input */}
                {donationType === "one-time" && (
                  <div className="pt-2">
                    <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                      Or enter custom amount
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-xl font-light">$</span>
                      </div>
                      <Input
                        type="number"
                        min={minAmount}
                        placeholder="Other Amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setIsCustom(true);
                          setSelectedAmount(null);
                        }}
                        onFocus={handleCustomFocus}
                        className={`pl-8 h-16 text-xl font-medium transition-all rounded-xl border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${isCustom ? "border-blue-500 ring-4 ring-blue-500/10 bg-white" : "bg-gray-50"}`}
                      />
                    </div>
                    {isCustom && !isValid && (
                      <p className="text-sm text-red-500 mt-2 pl-1 font-medium flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                        Minimum donation is ${minAmount}
                      </p>
                    )}
                  </div>
                )}

                {/* Impact Summary */}
                <div className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                  <p className="text-slate-600 text-lg">
                    You are donating{" "}
                    <span className="font-bold text-slate-900">
                      ${isValid ? finalAmount.toFixed(2) : "0.00"}
                    </span>
                    <span className="text-slate-500">
                      {donationType === "recurring" ? (interval === "day" ? "/day" : "/month") : " once"}
                    </span>
                  </p>
                </div>

                {/* Main Action Button (only for one-time or custom, hidden for recurring as it has its own button) */}
                {donationType !== "recurring" && (
                  <div className="pt-2">
                    <StripeButton
                      className={`w-full py-5 text-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:scale-[0.99] rounded-xl flex items-center justify-center ${
                        isValid 
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white" 
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      campaignId={campaignId}
                      amount={isValid ? finalAmount : undefined}
                      recurring={false}
                      disabled={!isValid}
                      hideFooter={true}
                    >
                      {isValid ? "Complete Donation" : "Enter Valid Amount"}
                      {isValid && <Zap className="w-5 h-5 ml-2 fill-yellow-400 text-yellow-400" />}
                    </StripeButton>
                  </div>
                )}

              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t border-gray-100 p-4 justify-center">
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Secure 256-bit SSL Encrypted Payment</span>
                </div>
              </CardFooter>
            </Card>
            
            {/* Trust Badges */}
            <div className="flex justify-center gap-6 mt-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2">
                <div className="h-8 w-12 bg-white rounded border shadow-sm flex items-center justify-center font-bold text-xs text-blue-800">VISA</div>
                <div className="h-8 w-12 bg-white rounded border shadow-sm flex items-center justify-center font-bold text-xs text-orange-600">MC</div>
                <div className="h-8 w-12 bg-white rounded border shadow-sm flex items-center justify-center font-bold text-xs text-blue-500">AMEX</div>
              </div>
            </div>
          </div>

          {/* Sidebar / Trust Section */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6 lg:pt-8">
            
            {/* Impact Stats */}
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
              <CardContent className="p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                  <Zap className="w-6 h-6 text-yellow-500 mr-3 fill-yellow-500" />
                  Your Real Impact
                </h3>
                <ul className="space-y-6">
                  <li className="flex gap-4 items-start group">
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Nutritious Meals</div>
                      <p className="text-gray-600 leading-relaxed">Ensuring no child goes to bed hungry through our community kitchen program.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start group">
                    <div className="bg-red-100 p-3 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Healthcare Access</div>
                      <p className="text-gray-600 leading-relaxed">Providing essential medicine, check-ups, and emergency medical support.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start group">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Safe Shelter</div>
                      <p className="text-gray-600 leading-relaxed">Building and repairing secure homes for families displaced by crisis.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Testimonial / Quote */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.017C7.91243 16 7.017 16.8954 7.017 18V21H14.017ZM21 21L21 18C21 16.8954 20.1046 16 19 16H15.9999C14.8954 16 14 16.8954 14 18V21H21ZM7 21L7 18C7 16.8954 6.10457 16 5 16H2C0.89543 16 0 16.8954 0 18V21H7Z" />
                </svg>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wider uppercase">Community Voice</span>
                </div>
                <p className="italic text-xl mb-6 font-light leading-relaxed">
                  "The support from HFRP changed our lives. We have hope for the future now because we know we aren't alone."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg border border-white/30">
                    MC
                  </div>
                  <div>
                    <div className="font-bold text-lg">Marie C.</div>
                    <div className="text-sm opacity-75">Community Member</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="text-center text-sm text-gray-500 px-4">
              <p>Your donation is tax-deductible to the extent allowed by law.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}