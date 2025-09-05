// Backup and restore types

export interface BackupMetadata {
  version: string;
  createdAt: string;
  createdBy: string;
  systemInfo: {
    appVersion: string;
    dataVersion: string;
    totalRecords: number;
  };
  encryption?: {
    algorithm: string;
    keyId: string;
  };
  compression?: {
    algorithm: string;
    originalSize: number;
    compressedSize: number;
  };
  checksum?: string;
  differential?: {
    baseBackupId: string;
    changedRecords: number;
  };
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    blogPosts: unknown[];
    blogCategories: unknown[];
    blogTags: unknown[];
    volunteers: unknown[];
    volunteerShifts: unknown[];
    volunteerPrograms: unknown[];
    volunteerTrainings: unknown[];
    donations: unknown[];
    donationCampaigns: unknown[];
    donationGoals: unknown[];
    notifications: unknown[];
    adminUsers: unknown[];
    siteSettings: unknown;
  };
}

export interface BackupValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    blogPosts: number;
    volunteers: number;
    donations: number;
    notifications: number;
    adminUsers: number;
  };
  integrity?: {
    checksumValid: boolean;
    dataComplete: boolean;
  };
}

export interface RestoreOptions {
  overwriteExisting: boolean;
  selectedDataTypes: string[];
  skipValidation?: boolean;
  decryptionKey?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredCounts: {
    blogPosts: number;
    volunteers: number;
    donations: number;
    notifications: number;
    adminUsers: number;
    settings: number;
  };
  errors: string[];
  warnings: string[];
}

export interface BackupSchedule {
  id: string;
  name: string;
  frequency: "hourly" | "daily" | "weekly" | "monthly";
  time?: string; // For daily: "HH:mm", for weekly: "day,HH:mm"
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  lastBackup?: string;
  nextBackup: string;
  isActive: boolean;
  backupType: "full" | "differential";
  retention: {
    count: number;
    days: number;
  };
  encryption: boolean;
  cloudStorage?: {
    provider: "aws" | "gcp" | "azure";
    bucket: string;
    path: string;
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BackupHistory {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  createdBy: string;
  type: "manual" | "scheduled";
  backupType: "full" | "differential";
  scheduleId?: string;
  status: "completed" | "failed" | "in_progress";
  error?: string;
  location: "local" | "cloud" | "both";
  cloudUrl?: string;
  checksum?: string;
  encrypted: boolean;
  retention?: {
    deleteAfter: string;
    isProtected: boolean;
  };
}

export interface CloudStorageConfig {
  provider: "aws" | "gcp" | "azure";
  credentials: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
  };
  bucket: string;
  path: string;
}

export interface BackupRotationPolicy {
  id: string;
  name: string;
  rules: {
    hourly: { keep: number };
    daily: { keep: number };
    weekly: { keep: number };
    monthly: { keep: number };
    yearly: { keep: number };
  };
  minimumBackups: number;
  deleteProtectedBackups: boolean;
}

export interface DifferentialBackup {
  baseBackupId: string;
  changes: {
    added: Record<string, unknown[]>;
    modified: Record<string, unknown[]>;
    deleted: Record<string, string[]>;
  };
  timestamp: string;
}
