// Donation types
export type DonationType = 'one_time' | 'monthly' | 'quarterly' | 'annual';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'check' | 'cash' | 'crypto';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type DonationSource = 'website' | 'mobile' | 'event' | 'mail' | 'phone' | 'social_media' | 'email_campaign';

// Donor information
export interface Donor {
  id: string;
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Donor Status
  isActive: boolean;
  isRecurring: boolean;
  preferredPaymentMethod?: PaymentMethod;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    mail: boolean;
    phone: boolean;
  };

  // Stats
  totalDonated: number;
  totalDonations: number;
  firstDonationDate: string;
  lastDonationDate: string;
  averageDonation: number;
  lifetimeValue: number;

  // Metadata
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Donation record
export interface Donation {
  id: string;
  donorId: string;
  donorName?: string; // Denormalized for display
  amount: number;
  currency: string; // USD, EUR, etc.
  type: DonationType;
  paymentMethod: PaymentMethod;
  status: DonationStatus;
  source: DonationSource;

  // Campaign/Program Info
  campaignId?: string;
  campaignName?: string;
  programId?: string;
  programName?: string;

  // Payment Details
  transactionId?: string;
  processorFee?: number;
  netAmount?: number;

  // Recurring Info
  isRecurring: boolean;
  recurringId?: string; // ID of recurring donation plan
  recurringCycle?: number; // Which cycle in the recurring plan

  // Additional Info
  isAnonymous: boolean;
  dedication?: string; // In memory/honor of
  message?: string;
  receiptSent: boolean;
  receiptNumber?: string;
  taxDeductible: boolean;

  // Dates
  donationDate: string;
  processedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Recurring donation plan
export interface RecurringDonation {
  id: string;
  donorId: string;
  amount: number;
  currency: string;
  frequency: DonationType;
  paymentMethod: PaymentMethod;
  status: 'active' | 'paused' | 'cancelled' | 'expired';

  // Schedule
  startDate: string;
  nextChargeDate?: string;
  endDate?: string;

  // Stats
  totalProcessed: number;
  successfulCharges: number;
  failedCharges: number;
  lastChargeDate?: string;
  lastChargeStatus?: DonationStatus;

  // Metadata
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

// Campaign for fundraising
export interface DonationCampaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  donorCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Donation filters
export interface DonationFilters {
  status?: DonationStatus;
  type?: DonationType;
  paymentMethod?: PaymentMethod;
  source?: DonationSource;
  campaignId?: string;
  programId?: string;
  donorId?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  isRecurring?: boolean;
  isAnonymous?: boolean;
  search?: string;
  sortBy?: 'date' | 'amount' | 'donor' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Donation statistics
export interface DonationStats {
  // Overview
  totalDonations: number;
  totalAmount: number;
  totalDonors: number;
  averageDonation: number;

  // Time-based
  todayAmount: number;
  weekAmount: number;
  monthAmount: number;
  yearAmount: number;

  // Recurring
  activeRecurringDonors: number;
  monthlyRecurringRevenue: number;
  recurringRetentionRate: number;

  // By Type
  donationsByType: Array<{
    type: DonationType;
    count: number;
    amount: number;
  }>;

  // By Payment Method
  donationsByPaymentMethod: Array<{
    method: PaymentMethod;
    count: number;
    amount: number;
  }>;

  // By Source
  donationsBySource: Array<{
    source: DonationSource;
    count: number;
    amount: number;
  }>;

  // Top Donors
  topDonors: Array<{
    donorId: string;
    name: string;
    totalAmount: number;
    donationCount: number;
  }>;

  // Campaign Performance
  topCampaigns: Array<{
    campaignId: string;
    name: string;
    raised: number;
    goal: number;
    donorCount: number;
  }>;

  // Trends
  monthlyTrends: Array<{
    month: string;
    amount: number;
    donationCount: number;
    donorCount: number;
  }>;

  // Recent Donations
  recentDonations: Donation[];
}

// Financial report types
export interface FinancialReport {
  period: string;
  startDate: string;
  endDate: string;

  // Revenue
  totalRevenue: number;
  donationRevenue: number;
  grantRevenue: number;
  eventRevenue: number;
  otherRevenue: number;

  // Expenses by Category
  totalExpenses: number;
  programExpenses: number;
  administrativeExpenses: number;
  fundraisingExpenses: number;

  // Net
  netRevenue: number;

  // Donation Details
  donationCount: number;
  uniqueDonors: number;
  newDonors: number;
  recurringDonors: number;
  averageDonation: number;

  // Program Allocation
  programAllocations: Array<{
    programName: string;
    amount: number;
    percentage: number;
  }>;
}

// Export formats
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  includePersonalInfo?: boolean;
  includeTaxInfo?: boolean;
  groupBy?: 'donor' | 'date' | 'campaign' | 'program';
}

// Donation goal tracking
export interface DonationGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  category: 'annual' | 'campaign' | 'program' | 'emergency';
  isActive: boolean;
  milestones?: Array<{
    amount: number;
    description: string;
    reached: boolean;
    reachedDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
