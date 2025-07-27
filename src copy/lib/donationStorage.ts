import {
  type Donation,
  type Donor,
  RecurringDonation,
  type DonationCampaign,
  type DonationFilters,
  type DonationStats,
  type FinancialReport,
  type DonationGoal,
  type DonationType,
  type PaymentMethod,
  type DonationSource,
  type ExportOptions
} from '@/types/donation';

// Storage keys
const STORAGE_KEYS = {
  DONATIONS: 'hfrp_donations',
  DONORS: 'hfrp_donors',
  RECURRING: 'hfrp_recurring_donations',
  CAMPAIGNS: 'hfrp_donation_campaigns',
  GOALS: 'hfrp_donation_goals'
};

// Mock data generators
function generateMockDonations(count = 100): Donation[] {
  const donations: Donation[] = [];
  const now = new Date();

  const donorNames = [
    'John Smith', 'Maria Garcia', 'Robert Johnson', 'Linda Williams',
    'Michael Brown', 'Jennifer Davis', 'David Miller', 'Sarah Wilson',
    'James Moore', 'Patricia Taylor', 'Richard Anderson', 'Nancy Thomas',
    'Charles Jackson', 'Lisa White', 'Joseph Harris', 'Betty Martin'
  ];

  const campaigns = [
    { id: 'camp-1', name: 'Feed 100 Families' },
    { id: 'camp-2', name: 'Build Safe Housing' },
    { id: 'camp-3', name: 'Education for All' },
    { id: 'camp-4', name: 'Healthcare Initiative' }
  ];

  const programs = [
    { id: 'prog-1', name: 'Feeding Program' },
    { id: 'prog-2', name: 'Education Program' },
    { id: 'prog-3', name: 'Healthcare Program' },
    { id: 'prog-4', name: 'Housing Program' }
  ];

  for (let i = 0; i < count; i++) {
    const donationDate = new Date(now);
    donationDate.setDate(donationDate.getDate() - Math.floor(Math.random() * 365));

    const amount = Math.random() < 0.8
      ? Math.floor(Math.random() * 200) + 10  // Most donations between $10-$210
      : Math.floor(Math.random() * 1000) + 200; // Some larger donations

    const isRecurring = Math.random() < 0.3;
    const campaign = Math.random() < 0.6 ? campaigns[Math.floor(Math.random() * campaigns.length)] : null;
    const program = programs[Math.floor(Math.random() * programs.length)];

    donations.push({
      id: `don-${i + 1}`,
      donorId: `donor-${Math.floor(Math.random() * 50) + 1}`,
      donorName: donorNames[Math.floor(Math.random() * donorNames.length)],
      amount,
      currency: 'USD',
      type: isRecurring
        ? (['monthly', 'quarterly', 'annual'][Math.floor(Math.random() * 3)] as DonationType)
        : 'one_time',
      paymentMethod: ['credit_card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)] as PaymentMethod,
      status: Math.random() < 0.95 ? 'completed' : 'failed',
      source: ['website', 'email_campaign', 'social_media', 'event'][Math.floor(Math.random() * 4)] as DonationSource,
      campaignId: campaign?.id,
      campaignName: campaign?.name,
      programId: program.id,
      programName: program.name,
      processorFee: amount * 0.029 + 0.30, // Typical payment processor fee
      netAmount: amount - (amount * 0.029 + 0.30),
      isRecurring,
      isAnonymous: Math.random() < 0.1,
      receiptSent: true,
      receiptNumber: `HFRP-${donationDate.getFullYear()}-${String(i + 1).padStart(6, '0')}`,
      taxDeductible: true,
      donationDate: donationDate.toISOString(),
      processedDate: donationDate.toISOString(),
      createdAt: donationDate.toISOString(),
      updatedAt: donationDate.toISOString()
    });
  }

  return donations.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
}

function generateMockDonors(donations: Donation[]): Donor[] {
  const donorMap = new Map<string, Donor>();

  for (const donation of donations) {
    if (!donorMap.has(donation.donorId)) {
      const firstName = donation.donorName?.split(' ')[0] || 'Anonymous';
      const lastName = donation.donorName?.split(' ')[1] || 'Donor';

      donorMap.set(donation.donorId, {
        id: donation.donorId,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        isActive: true,
        isRecurring: false,
        communicationPreferences: {
          email: true,
          sms: false,
          mail: true,
          phone: false
        },
        totalDonated: 0,
        totalDonations: 0,
        firstDonationDate: donation.donationDate,
        lastDonationDate: donation.donationDate,
        averageDonation: 0,
        lifetimeValue: 0,
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt
      });
    }

    const donor = donorMap.get(donation.donorId);
    if (donor && donation.status === 'completed') {
      donor.totalDonated += donation.amount;
      donor.totalDonations++;
      donor.isRecurring = donor.isRecurring || donation.isRecurring;

      if (new Date(donation.donationDate) < new Date(donor.firstDonationDate)) {
        donor.firstDonationDate = donation.donationDate;
      }
      if (new Date(donation.donationDate) > new Date(donor.lastDonationDate)) {
        donor.lastDonationDate = donation.donationDate;
      }
    }
  }

  // Calculate averages and lifetime value
  for (const donor of donorMap.values()) {
    donor.averageDonation = donor.totalDonations > 0
      ? Math.round(donor.totalDonated / donor.totalDonations * 100) / 100
      : 0;
    donor.lifetimeValue = donor.totalDonated;
  }

  return Array.from(donorMap.values());
}

// Default campaigns
const DEFAULT_CAMPAIGNS: DonationCampaign[] = [
  {
    id: 'camp-1',
    name: 'Feed 100 Families',
    description: 'Help us provide nutritious meals to 100 families in need',
    goal: 25000,
    raised: 18750,
    donorCount: 145,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    tags: ['feeding', 'families', 'urgent'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'camp-2',
    name: 'Build Safe Housing',
    description: 'Construct safe, sustainable housing for displaced families',
    goal: 50000,
    raised: 32500,
    donorCount: 89,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    tags: ['housing', 'construction', 'shelter'],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'camp-3',
    name: 'Education for All',
    description: 'Provide school supplies and support for children\'s education',
    goal: 15000,
    raised: 16250,
    donorCount: 203,
    startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    tags: ['education', 'children', 'schools'],
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'camp-4',
    name: 'Healthcare Initiative',
    description: 'Support mobile healthcare clinics and medical supplies',
    goal: 35000,
    raised: 12400,
    donorCount: 67,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    tags: ['healthcare', 'medical', 'clinics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Default goals
const DEFAULT_GOALS: DonationGoal[] = [
  {
    id: 'goal-1',
    name: '2024 Annual Fundraising Goal',
    description: 'Our annual target to support all programs and operations',
    targetAmount: 500000,
    currentAmount: 287500,
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-12-31').toISOString(),
    category: 'annual',
    isActive: true,
    milestones: [
      { amount: 100000, description: 'Q1 Target', reached: true, reachedDate: new Date('2024-03-15').toISOString() },
      { amount: 250000, description: 'Mid-year Target', reached: true, reachedDate: new Date('2024-06-20').toISOString() },
      { amount: 375000, description: 'Q3 Target', reached: false },
      { amount: 500000, description: 'Year-end Target', reached: false }
    ],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class DonationStorageService {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
      const donations = generateMockDonations(150);
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

      // Generate donors based on donations
      const donors = generateMockDonors(donations);
      localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(DEFAULT_CAMPAIGNS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.RECURRING)) {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify([]));
    }
  }

  // Donation CRUD operations
  async getAllDonations(filters?: DonationFilters): Promise<Donation[]> {
    const donations = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATIONS) || '[]') as Donation[];

    let filtered = [...donations];

    if (filters) {
      if (filters.status) {
        filtered = filtered.filter(d => d.status === filters.status);
      }

      if (filters.type) {
        filtered = filtered.filter(d => d.type === filters.type);
      }

      if (filters.paymentMethod) {
        filtered = filtered.filter(d => d.paymentMethod === filters.paymentMethod);
      }

      if (filters.source) {
        filtered = filtered.filter(d => d.source === filters.source);
      }

      if (filters.campaignId) {
        filtered = filtered.filter(d => d.campaignId === filters.campaignId);
      }

      if (filters.programId) {
        filtered = filtered.filter(d => d.programId === filters.programId);
      }

      if (filters.donorId) {
        filtered = filtered.filter(d => d.donorId === filters.donorId);
      }

      if (filters.minAmount !== undefined) {
        filtered = filtered.filter(d => d.amount >= filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        filtered = filtered.filter(d => d.amount <= filters.maxAmount);
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(d => new Date(d.donationDate) >= new Date(filters.dateFrom));
      }

      if (filters.dateTo) {
        filtered = filtered.filter(d => new Date(d.donationDate) <= new Date(filters.dateTo));
      }

      if (filters.isRecurring !== undefined) {
        filtered = filtered.filter(d => d.isRecurring === filters.isRecurring);
      }

      if (filters.isAnonymous !== undefined) {
        filtered = filtered.filter(d => d.isAnonymous === filters.isAnonymous);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(d =>
          d.donorName?.toLowerCase().includes(searchLower) ||
          d.receiptNumber?.toLowerCase().includes(searchLower) ||
          d.campaignName?.toLowerCase().includes(searchLower)
        );
      }

      // Sorting
      const sortBy = filters.sortBy || 'date';
      const sortOrder = filters.sortOrder || 'desc';

      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'date':
            comparison = new Date(a.donationDate).getTime() - new Date(b.donationDate).getTime();
            break;
          case 'amount':
            comparison = a.amount - b.amount;
            break;
          case 'donor':
            comparison = (a.donorName || '').localeCompare(b.donorName || '');
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }

  async getDonationById(id: string): Promise<Donation | null> {
    const donations = await this.getAllDonations();
    return donations.find(d => d.id === id) || null;
  }

  async createDonation(data: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Donation> {
    const donations = await this.getAllDonations();

    const newDonation: Donation = {
      ...data,
      id: `don-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    donations.push(newDonation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));

    // Update donor stats
    await this.updateDonorStats(newDonation.donorId);

    // Update campaign if applicable
    if (newDonation.campaignId && newDonation.status === 'completed') {
      await this.updateCampaignStats(newDonation.campaignId, newDonation.amount);
    }

    return newDonation;
  }

  // Donor operations
  async getAllDonors(): Promise<Donor[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DONORS) || '[]');
  }

  async getDonorById(id: string): Promise<Donor | null> {
    const donors = await this.getAllDonors();
    return donors.find(d => d.id === id) || null;
  }

  private async updateDonorStats(donorId: string): Promise<void> {
    const donors = await this.getAllDonors();
    const donations = await this.getAllDonations({ donorId, status: 'completed' });

    const donorIndex = donors.findIndex(d => d.id === donorId);
    if (donorIndex === -1) return;

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDonations = donations.length;

    donors[donorIndex] = {
      ...donors[donorIndex],
      totalDonated,
      totalDonations,
      averageDonation: totalDonations > 0 ? totalDonated / totalDonations : 0,
      lifetimeValue: totalDonated,
      lastDonationDate: donations[0]?.donationDate || donors[donorIndex].lastDonationDate,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
  }

  // Campaign operations
  async getAllCampaigns(): Promise<DonationCampaign[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
  }

  async getCampaignById(id: string): Promise<DonationCampaign | null> {
    const campaigns = await this.getAllCampaigns();
    return campaigns.find(c => c.id === id) || null;
  }

  async createCampaign(data: Omit<DonationCampaign, 'id' | 'raised' | 'donorCount' | 'createdAt' | 'updatedAt'>): Promise<DonationCampaign> {
    const campaigns = await this.getAllCampaigns();

    const newCampaign: DonationCampaign = {
      ...data,
      id: `camp-${Date.now()}`,
      raised: 0,
      donorCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    campaigns.push(newCampaign);
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));

    return newCampaign;
  }

  private async updateCampaignStats(campaignId: string, amount: number): Promise<void> {
    const campaigns = await this.getAllCampaigns();
    const index = campaigns.findIndex(c => c.id === campaignId);

    if (index === -1) return;

    const donations = await this.getAllDonations({ campaignId, status: 'completed' });
    const uniqueDonors = new Set(donations.map(d => d.donorId)).size;
    const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);

    campaigns[index] = {
      ...campaigns[index],
      raised: totalRaised,
      donorCount: uniqueDonors,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  }

  // Goals operations
  async getAllGoals(): Promise<DonationGoal[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
  }

  async updateGoalProgress(goalId: string): Promise<void> {
    const goals = await this.getAllGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return;

    const donations = await this.getAllDonations({
      dateFrom: goal.startDate,
      dateTo: goal.endDate,
      status: 'completed'
    });

    const currentAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    // Update milestones
    if (goal.milestones) {
      for (const milestone of goal.milestones) {
        if (!milestone.reached && currentAmount >= milestone.amount) {
          milestone.reached = true;
          milestone.reachedDate = new Date().toISOString();
        }
      }
    }

    goal.currentAmount = currentAmount;
    goal.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  // Statistics and analytics
  async getStats(dateRange?: { start: string; end: string }): Promise<DonationStats> {
    const allDonations = await this.getAllDonations({ status: 'completed' });
    const donors = await this.getAllDonors();
    const campaigns = await this.getAllCampaigns();

    // Filter by date range if provided
    let donations = allDonations;
    if (dateRange) {
      donations = allDonations.filter(d =>
        new Date(d.donationDate) >= new Date(dateRange.start) &&
        new Date(d.donationDate) <= new Date(dateRange.end)
      );
    }

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Time-based calculations
    const todayDonations = donations.filter(d => new Date(d.donationDate) >= todayStart);
    const weekDonations = donations.filter(d => new Date(d.donationDate) >= weekStart);
    const monthDonations = donations.filter(d => new Date(d.donationDate) >= monthStart);
    const yearDonations = donations.filter(d => new Date(d.donationDate) >= yearStart);

    // Group by type
    const donationsByType = this.groupBy(donations, 'type', ['one_time', 'monthly', 'quarterly', 'annual']);

    // Group by payment method
    const donationsByPaymentMethod = this.groupBy(donations, 'paymentMethod', ['credit_card', 'paypal', 'bank_transfer']);

    // Group by source
    const donationsBySource = this.groupBy(donations, 'source', ['website', 'email_campaign', 'social_media', 'event']);

    // Top donors
    const donorTotals = new Map<string, { amount: number; count: number; name: string }>();
    for (const donation of donations) {
      const current = donorTotals.get(donation.donorId) || { amount: 0, count: 0, name: donation.donorName || 'Anonymous' };
      current.amount += donation.amount;
      current.count++;
      donorTotals.set(donation.donorId, current);
    }

    const topDonors = Array.from(donorTotals.entries())
      .map(([donorId, stats]) => ({
        donorId,
        name: stats.name,
        totalAmount: stats.amount,
        donationCount: stats.count
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    // Monthly trends (last 12 months)
    const monthlyTrends = this.calculateMonthlyTrends(allDonations);

    // Campaign performance
    const topCampaigns = campaigns
      .map(campaign => ({
        campaignId: campaign.id,
        name: campaign.name,
        raised: campaign.raised,
        goal: campaign.goal,
        donorCount: campaign.donorCount
      }))
      .sort((a, b) => b.raised - a.raised)
      .slice(0, 5);

    // Recent donations
    const recentDonations = donations.slice(0, 10);

    // Recurring metrics
    const recurringDonations = donations.filter(d => d.isRecurring);
    const activeRecurringDonors = new Set(recurringDonations.map(d => d.donorId)).size;
    const monthlyRecurringRevenue = recurringDonations
      .filter(d => d.type === 'monthly')
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      totalDonors: new Set(donations.map(d => d.donorId)).size,
      averageDonation: donations.length > 0
        ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length
        : 0,
      todayAmount: todayDonations.reduce((sum, d) => sum + d.amount, 0),
      weekAmount: weekDonations.reduce((sum, d) => sum + d.amount, 0),
      monthAmount: monthDonations.reduce((sum, d) => sum + d.amount, 0),
      yearAmount: yearDonations.reduce((sum, d) => sum + d.amount, 0),
      activeRecurringDonors,
      monthlyRecurringRevenue,
      recurringRetentionRate: 0.85, // Mock value
      donationsByType,
      donationsByPaymentMethod,
      donationsBySource,
      topDonors,
      topCampaigns,
      monthlyTrends,
      recentDonations
    };
  }

  private groupBy(
    donations: Donation[],
    field: keyof Donation,
    categories: string[]
  ): Array<{ [key: string]: unknown; count: number; amount: number }> {
    const grouped = new Map<string, { count: number; amount: number }>();

    for (const category of categories) {
      grouped.set(category, { count: 0, amount: 0 });
    }

    for (const donation of donations) {
      const value = donation[field] as string;
      const current = grouped.get(value) || { count: 0, amount: 0 };
      current.count++;
      current.amount += donation.amount;
      grouped.set(value, current);
    }

    return Array.from(grouped.entries()).map(([key, stats]) => ({
      [field]: key,
      ...stats
    }));
  }

  private calculateMonthlyTrends(donations: Donation[]): DonationStats['monthlyTrends'] {
    const trends = new Map<string, { amount: number; donationCount: number; donors: Set<string> }>();
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      trends.set(key, { amount: 0, donationCount: 0, donors: new Set() });
    }

    // Aggregate data
    for (const donation of donations) {
      const date = new Date(donation.donationDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (trends.has(key)) {
        const trend = trends.get(key);
        if (trend) {
          trend.amount += donation.amount;
          trend.donationCount++;
          trend.donors.add(donation.donorId);
        }
      }
    }

    // Convert to array
    return Array.from(trends.entries()).map(([month, data]) => ({
      month,
      amount: data.amount,
      donationCount: data.donationCount,
      donorCount: data.donors.size
    }));
  }

  // Financial reporting
  async generateFinancialReport(startDate: string, endDate: string): Promise<FinancialReport> {
    const donations = await this.getAllDonations({
      dateFrom: startDate,
      dateTo: endDate,
      status: 'completed'
    });

    const uniqueDonors = new Set(donations.map(d => d.donorId));
    const newDonors = new Set<string>();
    const recurringDonors = new Set<string>();

    // Identify new and recurring donors
    for (const donation of donations) {
      const donor = await this.getDonorById(donation.donorId);
      if (donor) {
        if (new Date(donor.firstDonationDate) >= new Date(startDate)) {
          newDonors.add(donor.id);
        }
        if (donor.isRecurring) {
          recurringDonors.add(donor.id);
        }
      }
    }

    // Calculate program allocations
    const programTotals = new Map<string, number>();
    for (const donation of donations) {
      const current = programTotals.get(donation.programName || 'General') || 0;
      programTotals.set(donation.programName || 'General', current + donation.amount);
    }

    const totalRevenue = donations.reduce((sum, d) => sum + d.amount, 0);
    const programAllocations = Array.from(programTotals.entries()).map(([programName, amount]) => ({
      programName,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
    }));

    // Mock expense data (in production, this would come from accounting system)
    const programExpenses = totalRevenue * 0.75;
    const administrativeExpenses = totalRevenue * 0.15;
    const fundraisingExpenses = totalRevenue * 0.10;
    const totalExpenses = programExpenses + administrativeExpenses + fundraisingExpenses;

    return {
      period: `${startDate} to ${endDate}`,
      startDate,
      endDate,
      totalRevenue,
      donationRevenue: totalRevenue,
      grantRevenue: 0, // Mock
      eventRevenue: 0, // Mock
      otherRevenue: 0, // Mock
      totalExpenses,
      programExpenses,
      administrativeExpenses,
      fundraisingExpenses,
      netRevenue: totalRevenue - totalExpenses,
      donationCount: donations.length,
      uniqueDonors: uniqueDonors.size,
      newDonors: newDonors.size,
      recurringDonors: recurringDonors.size,
      averageDonation: donations.length > 0 ? totalRevenue / donations.length : 0,
      programAllocations
    };
  }

  // Export functionality
  async exportDonations(options: ExportOptions): Promise<string> {
    const filters: DonationFilters = {};
    if (options.dateRange) {
      filters.dateFrom = options.dateRange.start;
      filters.dateTo = options.dateRange.end;
    }

    const donations = await this.getAllDonations(filters);

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(donations, options);
      case 'json':
        return JSON.stringify(donations, null, 2);
      default:
        throw new Error(`Export format ${options.format} not yet implemented`);
    }
  }

  private exportToCSV(donations: Donation[], options: ExportOptions): string {
    const headers = [
      'Date',
      'Amount',
      'Type',
      'Payment Method',
      'Status',
      'Campaign',
      'Program'
    ];

    if (options.includePersonalInfo) {
      headers.push('Donor Name', 'Receipt Number');
    }

    const rows = donations.map(d => {
      const row = [
        new Date(d.donationDate).toLocaleDateString(),
        d.amount.toFixed(2),
        d.type,
        d.paymentMethod,
        d.status,
        d.campaignName || '',
        d.programName || ''
      ];

      if (options.includePersonalInfo) {
        row.push(d.donorName || 'Anonymous', d.receiptNumber || '');
      }

      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

// Export singleton instance
export const donationStorage = new DonationStorageService();
