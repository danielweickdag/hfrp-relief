import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealTimeDashboard from "@/app/_components/RealTimeDashboard";
import CampaignManager from "@/app/_components/CampaignManager";
import StripeDashboard from "@/app/_components/StripeDashboard";

export default function StripeAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Stripe Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your Stripe-powered fundraising campaigns and monitor
            real-time donations
          </p>
          <div className="mt-4 flex space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Stripe Integration Active
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🔄 Real-time Sync
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              📱 Mobile Optimized
            </span>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">📊 Real-Time Dashboard</TabsTrigger>
            <TabsTrigger value="campaigns">🎯 Campaign Manager</TabsTrigger>
            <TabsTrigger value="stripe">💳 Stripe Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <CampaignManager />
          </TabsContent>

          <TabsContent value="stripe" className="space-y-6">
            <StripeDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
