import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Types for donor communication
interface DonorSegment {
  id: string;
  name: string;
  email: string;
  totalDonated: number;
  donationCount: number;
  lastDonation: string;
  preferredCampaigns: string[];
  segment: 'firstTime' | 'recurring' | 'majorGifts' | 'corporate' | 'lapsed' | 'vip';
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'thank_you' | 'newsletter' | 'appeal' | 'update' | 'anniversary';
  enabled: boolean;
}

interface CommunicationCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'mail';
  templateId: string;
  targetSegments: string[];
  scheduledDate: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'new_donation' | 'monthly_anniversary' | 'birthday' | 'lapsed_donor' | 'major_gift';
  templateId: string;
  delay: number; // in hours
  enabled: boolean;
  conditions: Record<string, unknown>;
}

interface CommunicationReport {
  timestamp: string;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRecipients: number;
  segmentBreakdown: Record<string, number>;
  deliveryStats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  automationRules: {
    active: number;
    triggered: number;
    successful: number;
  };
  upcomingCampaigns: CommunicationCampaign[];
}

// Helper functions
function generateMockDonors(): DonorSegment[] {
  const donors: DonorSegment[] = [
    {
      id: 'donor_001',
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      totalDonated: 150,
      donationCount: 3,
      lastDonation: '2025-01-10',
      preferredCampaigns: ['education', 'healthcare'],
      segment: 'recurring'
    },
    {
      id: 'donor_002',
      name: 'Jean Baptiste',
      email: 'jean.baptiste@email.com',
      totalDonated: 50,
      donationCount: 1,
      lastDonation: '2025-01-08',
      preferredCampaigns: ['emergency'],
      segment: 'firstTime'
    },
    {
      id: 'donor_003',
      name: 'Claire Martin',
      email: 'claire.martin@email.com',
      totalDonated: 1200,
      donationCount: 8,
      lastDonation: '2025-01-12',
      preferredCampaigns: ['housing', 'education'],
      segment: 'majorGifts'
    },
    {
      id: 'donor_004',
      name: 'Enterprise Solutions Inc',
      email: 'donations@enterprise.com',
      totalDonated: 5000,
      donationCount: 2,
      lastDonation: '2025-01-05',
      preferredCampaigns: ['education', 'healthcare'],
      segment: 'corporate'
    }
  ];

  // Generate additional mock donors
  for (let i = 5; i <= 50; i++) {
    const segments: DonorSegment['segment'][] = ['firstTime', 'recurring', 'majorGifts', 'lapsed', 'vip'];
    const campaigns = ['education', 'healthcare', 'emergency', 'housing', 'general'];
    
    donors.push({
      id: `donor_${i.toString().padStart(3, '0')}`,
      name: `Donor ${i}`,
      email: `donor${i}@example.com`,
      totalDonated: Math.floor(Math.random() * 2000) + 25,
      donationCount: Math.floor(Math.random() * 10) + 1,
      lastDonation: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      preferredCampaigns: campaigns.slice(0, Math.floor(Math.random() * 3) + 1),
      segment: segments[Math.floor(Math.random() * segments.length)]
    });
  }

  return donors;
}

function generateEmailTemplates(): EmailTemplate[] {
  return [
    {
      id: 'template_001',
      name: 'Welcome New Donor',
      subject: 'Welcome to the HFRP Family! 🙏',
      content: 'Dear {donor_name}, thank you for joining our mission to help families in Haiti...',
      category: 'welcome',
      enabled: true
    },
    {
      id: 'template_002',
      name: 'Monthly Impact Newsletter',
      subject: 'Your Support Changed Everything This Month ❤️',
      content: 'Dear {donor_name}, thanks to your generous support of ${donation_amount}...',
      category: 'newsletter',
      enabled: true
    },
    {
      id: 'template_003',
      name: 'Emergency Appeal',
      subject: 'Urgent: Emergency Relief Needed in Haiti',
      content: 'Dear {donor_name}, we need your immediate help for emergency relief...',
      category: 'appeal',
      enabled: true
    },
    {
      id: 'template_004',
      name: 'Donation Thank You',
      subject: 'Thank You for Your Generous Donation! 🙏',
      content: 'Dear {donor_name}, your donation of ${donation_amount} will help...',
      category: 'thank_you',
      enabled: true
    },
    {
      id: 'template_005',
      name: 'Anniversary Appreciation',
      subject: 'Celebrating Your First Year of Support! 🎉',
      content: 'Dear {donor_name}, it\'s been one year since your first donation...',
      category: 'anniversary',
      enabled: true
    }
  ];
}

function segmentDonors(donors: DonorSegment[]): Record<string, DonorSegment[]> {
  const segments: Record<string, DonorSegment[]> = {
    firstTime: [],
    recurring: [],
    majorGifts: [],
    corporate: [],
    lapsed: [],
    vip: []
  };

  donors.forEach(donor => {
    segments[donor.segment].push(donor);
  });

  return segments;
}

function createCommunicationCampaign(
  template: EmailTemplate,
  targetSegments: string[],
  donors: DonorSegment[]
): CommunicationCampaign {
  const segmentedDonors = segmentDonors(donors);
  const recipients = targetSegments.reduce((count, segment) => {
    return count + (segmentedDonors[segment]?.length || 0);
  }, 0);

  return {
    id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${template.name} Campaign`,
    type: 'email',
    templateId: template.id,
    targetSegments,
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    status: 'scheduled',
    recipients,
    openRate: 0.25 + Math.random() * 0.15, // 25-40%
    clickRate: 0.05 + Math.random() * 0.10, // 5-15%
    conversionRate: 0.02 + Math.random() * 0.05 // 2-7%
  };
}

function generateAutomationRules(): AutomationRule[] {
  return [
    {
      id: 'rule_001',
      name: 'Welcome New Donors',
      trigger: 'new_donation',
      templateId: 'template_001',
      delay: 1, // 1 hour after donation
      enabled: true,
      conditions: { isFirstDonation: true }
    },
    {
      id: 'rule_002',
      name: 'Thank You for Donations',
      trigger: 'new_donation',
      templateId: 'template_004',
      delay: 0.5, // 30 minutes after donation
      enabled: true,
      conditions: {}
    },
    {
      id: 'rule_003',
      name: 'Monthly Anniversary',
      trigger: 'monthly_anniversary',
      templateId: 'template_005',
      delay: 0,
      enabled: true,
      conditions: { donationCount: { $gte: 2 } }
    },
    {
      id: 'rule_004',
      name: 'Re-engage Lapsed Donors',
      trigger: 'lapsed_donor',
      templateId: 'template_003',
      delay: 0,
      enabled: true,
      conditions: { daysSinceLastDonation: { $gte: 180 } }
    }
  ];
}

async function saveCommunicationData(data: unknown, filename: string): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      path.join(dataDir, filename),
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
  }
}

// API Routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create_campaign': {
        const { templateId, targetSegments, scheduledDate } = params;
        const donors = generateMockDonors();
        const templates = generateEmailTemplates();
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        const campaign = createCommunicationCampaign(template, targetSegments, donors);
        if (scheduledDate) {
          campaign.scheduledDate = scheduledDate;
        }

        await saveCommunicationData(campaign, `campaign_${campaign.id}.json`);

        return NextResponse.json({
          success: true,
          campaign,
          message: 'Campaign created successfully'
        });
      }

      case 'send_campaign': {
        const { campaignId } = params;
        
        // Simulate sending campaign
        const deliveryStats = {
          sent: Math.floor(Math.random() * 1000) + 500,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: Math.floor(Math.random() * 20) + 5,
          unsubscribed: Math.floor(Math.random() * 10) + 1
        };
        
        deliveryStats.delivered = deliveryStats.sent - deliveryStats.bounced;
        deliveryStats.opened = Math.floor(deliveryStats.delivered * (0.25 + Math.random() * 0.15));
        deliveryStats.clicked = Math.floor(deliveryStats.opened * (0.15 + Math.random() * 0.10));

        const report = {
          campaignId,
          status: 'sent',
          deliveryStats,
          sentAt: new Date().toISOString(),
          openRate: deliveryStats.opened / deliveryStats.delivered,
          clickRate: deliveryStats.clicked / deliveryStats.delivered,
          bounceRate: deliveryStats.bounced / deliveryStats.sent,
          unsubscribeRate: deliveryStats.unsubscribed / deliveryStats.delivered
        };

        await saveCommunicationData(report, `campaign_report_${campaignId}.json`);

        return NextResponse.json({
          success: true,
          report,
          message: 'Campaign sent successfully'
        });
      }

      case 'automate_outreach': {
        const donors = generateMockDonors();
        const templates = generateEmailTemplates();
        const rules = generateAutomationRules();
        const segments = segmentDonors(donors);

        // Simulate automation execution
        const automationResults = {
          newDonorWelcome: segments.firstTime.length,
          monthlyUpdates: Object.values(segments).flat().length,
          thankYouLetters: Math.floor(Math.random() * 50) + 20,
          taxReceipts: Math.floor(Math.random() * 200) + 100,
          birthdayMessages: Math.floor(Math.random() * 20) + 5,
          anniversaryReminders: Math.floor(Math.random() * 15) + 3,
          lapsedDonorReengagement: segments.lapsed.length,
          majorGiftStewardship: segments.majorGifts.length
        };

        const automationReport = {
          timestamp: new Date().toISOString(),
          rulesExecuted: rules.filter(r => r.enabled).length,
          totalRecipients: Object.values(automationResults).reduce((sum, count) => sum + count, 0),
          segmentBreakdown: {
            firstTime: segments.firstTime.length,
            recurring: segments.recurring.length,
            majorGifts: segments.majorGifts.length,
            corporate: segments.corporate.length,
            lapsed: segments.lapsed.length,
            vip: segments.vip.length
          },
          automationResults,
          nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        await saveCommunicationData(automationReport, 'donor_communication_automation_report.json');

        return NextResponse.json({
          success: true,
          report: automationReport,
          message: 'Donor communication automation completed'
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Donor communication API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'templates': {
        const templates = generateEmailTemplates();
        return NextResponse.json({ templates });
      }

      case 'segments': {
        const donors = generateMockDonors();
        const segments = segmentDonors(donors);
        const segmentStats = Object.entries(segments).map(([name, donorList]) => ({
          name,
          count: donorList.length,
          totalDonated: donorList.reduce((sum, donor) => sum + donor.totalDonated, 0),
          averageDonation: donorList.length > 0 
            ? donorList.reduce((sum, donor) => sum + donor.totalDonated, 0) / donorList.length 
            : 0
        }));
        
        return NextResponse.json({ segments: segmentStats });
      }

      case 'automation_rules': {
        const rules = generateAutomationRules();
        return NextResponse.json({ rules });
      }

      case 'analytics': {
        const donors = generateMockDonors();
        const segments = segmentDonors(donors);
        
        const report: CommunicationReport = {
          timestamp: new Date().toISOString(),
          totalCampaigns: Math.floor(Math.random() * 20) + 10,
          activeCampaigns: Math.floor(Math.random() * 5) + 2,
          totalRecipients: donors.length,
          segmentBreakdown: {
            firstTime: segments.firstTime.length,
            recurring: segments.recurring.length,
            majorGifts: segments.majorGifts.length,
            corporate: segments.corporate.length,
            lapsed: segments.lapsed.length,
            vip: segments.vip.length
          },
          deliveryStats: {
            sent: Math.floor(Math.random() * 1000) + 500,
            delivered: Math.floor(Math.random() * 950) + 450,
            opened: Math.floor(Math.random() * 300) + 150,
            clicked: Math.floor(Math.random() * 80) + 40,
            bounced: Math.floor(Math.random() * 30) + 10,
            unsubscribed: Math.floor(Math.random() * 15) + 5
          },
          automationRules: {
            active: 4,
            triggered: Math.floor(Math.random() * 50) + 20,
            successful: Math.floor(Math.random() * 45) + 18
          },
          upcomingCampaigns: []
        };

        return NextResponse.json({ report });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Donor communication API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}