// Summary statistics types
export interface SummaryStats {
  totalDonations: number;
  donationGrowth: number;
  totalVisitors: number;
  visitorGrowth: number;
  conversionRate: string;
  conversionGrowth: number;
  avgDonation: number;
  avgDonationGrowth: number;
}

// Donation data types
export interface DonationData {
  labels: string[];
  amounts: number[];
  counts: number[];
}

// Traffic data types
export interface TrafficData {
  labels: string[];
  visits: number[];
  uniqueVisitors: number[];
  pageViews: number[];
}

// Demographic data types
export interface DemographicData {
  labels: string[];
  data: number[];
}

// Donation source data types
export interface DonationSourceData {
  labels: string[];
  data: number[];
}

// Top pages data types
export interface TopPagesData {
  labels: string[];
  views: number[];
}

// All analytics data
export interface AnalyticsData {
  donationData: DonationData;
  trafficData: TrafficData;
  demographicData: DemographicData;
  donationSourceData: DonationSourceData;
  topPagesData: TopPagesData;
  summary: SummaryStats;
}

// Time filter options
export interface TimeFilterOption {
  label: string;
  value: string;
}
