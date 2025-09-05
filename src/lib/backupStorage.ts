import type {
  BackupData,
  BackupMetadata,
  BackupValidationResult,
  RestoreOptions,
  RestoreResult,
  BackupHistory,
  BackupSchedule,
  DifferentialBackup,
  BackupRotationPolicy,
} from "@/types/backup";
import { blogStorage } from "./blogStorage";
import { volunteerStorage } from "./volunteerStorage";
import { donationStorage } from "./donationStorage";
import { notificationService } from "./notificationService";
import { BackupEncryption } from "./backupEncryption";
import type { CloudStorageService } from "./cloudStorage";

// Storage keys for backup system
const STORAGE_KEYS = {
  BACKUP_HISTORY: "hfrp_backup_history",
  BACKUP_SCHEDULES: "hfrp_backup_schedules",
  ADMIN_USERS: "admin_users",
  SITE_SETTINGS: "hfrp_site_settings",
};

// All storage keys to backup
const ALL_STORAGE_KEYS = [
  "hfrp_blog_posts",
  "hfrp_blog_categories",
  "hfrp_blog_tags",
  "hfrp_volunteers",
  "hfrp_volunteer_shifts",
  "hfrp_volunteer_programs",
  "hfrp_volunteer_trainings",
  "hfrp_donations",
  "hfrp_donation_campaigns",
  "hfrp_donation_goals",
  "hfrp_notifications",
  "admin_users",
  "hfrp_site_settings",
];

class BackupStorageService {
  private readonly APP_VERSION = "1.0.0";
  private readonly DATA_VERSION = "1.0.0";
  private cloudStorage: CloudStorageService | null = null;
  private lastFullBackup: BackupData | null = null;

  // Set cloud storage service
  setCloudStorage(cloudStorage: CloudStorageService) {
    this.cloudStorage = cloudStorage;
  }

  // Create a full backup of all data
  async createBackup(
    createdBy: string,
    options?: {
      encrypt?: boolean;
      password?: string;
      differential?: boolean;
      uploadToCloud?: boolean;
    },
  ): Promise<BackupData> {
    try {
      // Gather all data from localStorage
      const blogPosts = JSON.parse(
        localStorage.getItem("hfrp_blog_posts") || "[]",
      );
      const blogCategories = JSON.parse(
        localStorage.getItem("hfrp_blog_categories") || "[]",
      );
      const blogTags = JSON.parse(
        localStorage.getItem("hfrp_blog_tags") || "[]",
      );
      const volunteers = JSON.parse(
        localStorage.getItem("hfrp_volunteers") || "[]",
      );
      const volunteerShifts = JSON.parse(
        localStorage.getItem("hfrp_volunteer_shifts") || "[]",
      );
      const volunteerPrograms = JSON.parse(
        localStorage.getItem("hfrp_volunteer_programs") || "[]",
      );
      const volunteerTrainings = JSON.parse(
        localStorage.getItem("hfrp_volunteer_trainings") || "[]",
      );
      const donations = JSON.parse(
        localStorage.getItem("hfrp_donations") || "[]",
      );
      const donationCampaigns = JSON.parse(
        localStorage.getItem("hfrp_donation_campaigns") || "[]",
      );
      const donationGoals = JSON.parse(
        localStorage.getItem("hfrp_donation_goals") || "[]",
      );
      const notifications = JSON.parse(
        localStorage.getItem("hfrp_notifications") || "[]",
      );
      const adminUsers = JSON.parse(
        localStorage.getItem("admin_users") || "[]",
      );
      const siteSettings = JSON.parse(
        localStorage.getItem("hfrp_site_settings") || "{}",
      );

      // Calculate total records
      const totalRecords =
        blogPosts.length +
        blogCategories.length +
        blogTags.length +
        volunteers.length +
        volunteerShifts.length +
        volunteerPrograms.length +
        volunteerTrainings.length +
        donations.length +
        donationCampaigns.length +
        donationGoals.length +
        notifications.length +
        adminUsers.length +
        1; // +1 for settings

      // Create metadata
      const metadata: BackupMetadata = {
        version: this.DATA_VERSION,
        createdAt: new Date().toISOString(),
        createdBy,
        systemInfo: {
          appVersion: this.APP_VERSION,
          dataVersion: this.DATA_VERSION,
          totalRecords,
        },
      };

      // Create backup data
      let backupData: BackupData = {
        metadata,
        data: {
          blogPosts,
          blogCategories,
          blogTags,
          volunteers,
          volunteerShifts,
          volunteerPrograms,
          volunteerTrainings,
          donations,
          donationCampaigns,
          donationGoals,
          notifications,
          adminUsers,
          siteSettings,
        },
      };

      // Create differential backup if requested
      if (options?.differential && this.lastFullBackup) {
        backupData = await this.createDifferentialBackup(
          backupData,
          this.lastFullBackup,
        );
      } else {
        // Store as last full backup
        this.lastFullBackup = backupData;
      }

      // Add checksum for integrity verification
      const dataString = JSON.stringify(backupData.data);
      const checksum = BackupEncryption.generateChecksum(dataString);
      backupData.metadata.checksum = checksum;

      // Apply encryption if requested
      if (options?.encrypt && options?.password) {
        const encrypted = BackupEncryption.encryptBackup(
          dataString,
          options.password,
        );
        backupData = {
          metadata: {
            ...backupData.metadata,
            encryption: {
              algorithm: encrypted.algorithm,
              keyId: "user-provided",
            },
            checksum: encrypted.checksum,
          },
          data: JSON.parse(encrypted.encrypted),
        };
      }

      // Apply compression
      const compressed = BackupEncryption.compressData(
        JSON.stringify(backupData),
      );
      if (compressed.algorithm !== "none") {
        backupData.metadata.compression = {
          algorithm: compressed.algorithm,
          originalSize: compressed.originalSize,
          compressedSize: compressed.compressedSize,
        };
      }

      const backupId = `backup-${Date.now()}`;
      const filename = `hfrp-backup-${new Date().toISOString().split("T")[0]}.json`;

      // Save to history
      const historyEntry: BackupHistory = {
        id: backupId,
        filename,
        size: JSON.stringify(backupData).length,
        createdAt: metadata.createdAt,
        createdBy,
        type: "manual",
        backupType: options?.differential ? "differential" : "full",
        status: "completed",
        location: "local",
        checksum: backupData.metadata.checksum,
        encrypted: !!options?.encrypt,
      };

      // Upload to cloud if requested
      if (options?.uploadToCloud && this.cloudStorage) {
        try {
          const result = await this.cloudStorage.uploadBackup(
            filename,
            JSON.stringify(backupData),
          );
          if (result.success) {
            historyEntry.location = "both";
            historyEntry.cloudUrl = result.url;
          }
        } catch (error) {
          console.error("Cloud upload failed:", error);
        }
      }

      await this.saveBackupToHistory(historyEntry);
      return backupData;
    } catch (error) {
      console.error("Backup creation failed:", error);
      throw new Error("Failed to create backup");
    }
  }

  // Validate backup data
  async validateBackup(data: unknown): Promise<BackupValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    try {
      // Type guard to check if data is BackupData
      if (!data || typeof data !== "object") {
        errors.push("Invalid backup data format");
        isValid = false;
        return {
          isValid,
          errors,
          warnings,
          summary: {
            blogPosts: 0,
            volunteers: 0,
            donations: 0,
            notifications: 0,
            adminUsers: 0,
          },
        };
      }

      const backupData = data as BackupData;

      // Validate metadata
      if (!backupData.metadata) {
        errors.push("Missing backup metadata");
        isValid = false;
      } else {
        if (!backupData.metadata.version) {
          errors.push("Missing version information");
          isValid = false;
        }
        if (!backupData.metadata.createdAt) {
          errors.push("Missing creation timestamp");
          isValid = false;
        }
      }

      // Validate data structure
      if (!backupData.data) {
        errors.push("Missing backup data");
        isValid = false;
        return {
          isValid,
          errors,
          warnings,
          summary: {
            blogPosts: 0,
            volunteers: 0,
            donations: 0,
            notifications: 0,
            adminUsers: 0,
          },
        };
      }

      // Check for required data arrays
      const requiredArrays = [
        "blogPosts",
        "blogCategories",
        "blogTags",
        "volunteers",
        "volunteerShifts",
        "volunteerPrograms",
        "volunteerTrainings",
        "donations",
        "donationCampaigns",
        "donationGoals",
        "notifications",
        "adminUsers",
      ];

      for (const key of requiredArrays) {
        if (!(key in backupData.data)) {
          warnings.push(`Missing ${key} data`);
        } else if (
          !Array.isArray(backupData.data[key as keyof typeof backupData.data])
        ) {
          errors.push(`Invalid ${key} data format (expected array)`);
          isValid = false;
        }
      }

      // Check site settings
      if (!backupData.data.siteSettings) {
        warnings.push("Missing site settings");
      }

      // Version compatibility check
      if (
        backupData.metadata?.version &&
        backupData.metadata.version !== this.DATA_VERSION
      ) {
        warnings.push(
          `Backup version (${backupData.metadata.version}) differs from current version (${this.DATA_VERSION})`,
        );
      }

      // Calculate summary
      const summary = {
        blogPosts: Array.isArray(backupData.data.blogPosts)
          ? backupData.data.blogPosts.length
          : 0,
        volunteers: Array.isArray(backupData.data.volunteers)
          ? backupData.data.volunteers.length
          : 0,
        donations: Array.isArray(backupData.data.donations)
          ? backupData.data.donations.length
          : 0,
        notifications: Array.isArray(backupData.data.notifications)
          ? backupData.data.notifications.length
          : 0,
        adminUsers: Array.isArray(backupData.data.adminUsers)
          ? backupData.data.adminUsers.length
          : 0,
      };

      return { isValid, errors, warnings, summary };
    } catch (error) {
      errors.push(
        `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return {
        isValid: false,
        errors,
        warnings,
        summary: {
          blogPosts: 0,
          volunteers: 0,
          donations: 0,
          notifications: 0,
          adminUsers: 0,
        },
      };
    }
  }

  // Restore from backup
  async restoreFromBackup(
    backupData: BackupData,
    options: RestoreOptions,
  ): Promise<RestoreResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const restoredCounts = {
      blogPosts: 0,
      volunteers: 0,
      donations: 0,
      notifications: 0,
      adminUsers: 0,
      settings: 0,
    };

    try {
      // Validate backup first unless skipped
      if (!options.skipValidation) {
        const validation = await this.validateBackup(backupData);
        if (!validation.isValid) {
          return {
            success: false,
            restoredCounts,
            errors: validation.errors,
            warnings: validation.warnings,
          };
        }
      }

      // Create a backup of current data if overwriting
      if (options.overwriteExisting) {
        try {
          await this.createBackup("system-pre-restore");
        } catch (error) {
          warnings.push("Failed to create pre-restore backup");
        }
      }

      // Restore selected data types
      if (options.selectedDataTypes.includes("blog")) {
        try {
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_blog_posts")
          ) {
            localStorage.setItem(
              "hfrp_blog_posts",
              JSON.stringify(backupData.data.blogPosts || []),
            );
            restoredCounts.blogPosts = backupData.data.blogPosts?.length || 0;
          }
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_blog_categories")
          ) {
            localStorage.setItem(
              "hfrp_blog_categories",
              JSON.stringify(backupData.data.blogCategories || []),
            );
          }
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_blog_tags")
          ) {
            localStorage.setItem(
              "hfrp_blog_tags",
              JSON.stringify(backupData.data.blogTags || []),
            );
          }
        } catch (error) {
          errors.push(
            `Failed to restore blog data: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      if (options.selectedDataTypes.includes("volunteers")) {
        try {
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_volunteers")
          ) {
            localStorage.setItem(
              "hfrp_volunteers",
              JSON.stringify(backupData.data.volunteers || []),
            );
            restoredCounts.volunteers = backupData.data.volunteers?.length || 0;
          }
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_volunteer_shifts")
          ) {
            localStorage.setItem(
              "hfrp_volunteer_shifts",
              JSON.stringify(backupData.data.volunteerShifts || []),
            );
          }
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_volunteer_programs")
          ) {
            localStorage.setItem(
              "hfrp_volunteer_programs",
              JSON.stringify(backupData.data.volunteerPrograms || []),
            );
          }
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_volunteer_trainings")
          ) {
            localStorage.setItem(
              "hfrp_volunteer_trainings",
              JSON.stringify(backupData.data.volunteerTrainings || []),
            );
          }
        } catch (error) {
          errors.push(
            `Failed to restore volunteer data: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      if (options.selectedDataTypes.includes("donations")) {
        try {
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_donations")
          ) {
            localStorage.setItem(
              "hfrp_donations",
              JSON.stringify(backupData.data.donations || []),
            );
            restoredCounts.donations = backupData.data.donations?.length || 0;
          }
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_donation_campaigns")
          ) {
            localStorage.setItem(
              "hfrp_donation_campaigns",
              JSON.stringify(backupData.data.donationCampaigns || []),
            );
          }
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_donation_goals")
          ) {
            localStorage.setItem(
              "hfrp_donation_goals",
              JSON.stringify(backupData.data.donationGoals || []),
            );
          }
        } catch (error) {
          errors.push(
            `Failed to restore donation data: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      if (options.selectedDataTypes.includes("notifications")) {
        try {
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_notifications")
          ) {
            localStorage.setItem(
              "hfrp_notifications",
              JSON.stringify(backupData.data.notifications || []),
            );
            restoredCounts.notifications =
              backupData.data.notifications?.length || 0;
          }
        } catch (error) {
          errors.push(
            `Failed to restore notification data: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      if (options.selectedDataTypes.includes("users")) {
        try {
          if (
            options.overwriteExisting ||
            !localStorage.getItem("admin_users")
          ) {
            localStorage.setItem(
              "admin_users",
              JSON.stringify(backupData.data.adminUsers || []),
            );
            restoredCounts.adminUsers = backupData.data.adminUsers?.length || 0;
          }
        } catch (error) {
          errors.push(
            `Failed to restore admin users: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      if (options.selectedDataTypes.includes("settings")) {
        try {
          if (
            options.overwriteExisting ||
            !localStorage.getItem("hfrp_site_settings")
          ) {
            localStorage.setItem(
              "hfrp_site_settings",
              JSON.stringify(backupData.data.siteSettings || {}),
            );
            restoredCounts.settings = 1;
          }
        } catch (error) {
          errors.push(
            `Failed to restore site settings: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      return {
        success: errors.length === 0,
        restoredCounts,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        restoredCounts,
        errors: [
          `Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings,
      };
    }
  }

  // Download backup as JSON file
  async downloadBackup(
    backupData: BackupData,
    filename?: string,
  ): Promise<void> {
    try {
      const json = JSON.stringify(backupData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        filename ||
        `hfrp-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error("Failed to download backup");
    }
  }

  // Upload and read backup file
  async uploadBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Validate the uploaded data
          const validation = await this.validateBackup(data);
          if (!validation.isValid) {
            reject(
              new Error(`Invalid backup file: ${validation.errors.join(", ")}`),
            );
            return;
          }

          resolve(data as BackupData);
        } catch (error) {
          reject(new Error("Failed to parse backup file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read backup file"));
      };

      reader.readAsText(file);
    });
  }

  // Backup history management
  async getBackupHistory(): Promise<BackupHistory[]> {
    const history = localStorage.getItem(STORAGE_KEYS.BACKUP_HISTORY);
    return history ? JSON.parse(history) : [];
  }

  private async saveBackupToHistory(backup: BackupHistory): Promise<void> {
    const history = await this.getBackupHistory();
    history.unshift(backup);
    // Keep only last 50 backups in history
    if (history.length > 50) {
      history.splice(50);
    }
    localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(history));
  }

  // Clear specific data types
  async clearData(dataTypes: string[]): Promise<void> {
    for (const type of dataTypes) {
      switch (type) {
        case "blog":
          localStorage.removeItem("hfrp_blog_posts");
          localStorage.removeItem("hfrp_blog_categories");
          localStorage.removeItem("hfrp_blog_tags");
          break;
        case "volunteers":
          localStorage.removeItem("hfrp_volunteers");
          localStorage.removeItem("hfrp_volunteer_shifts");
          localStorage.removeItem("hfrp_volunteer_programs");
          localStorage.removeItem("hfrp_volunteer_trainings");
          break;
        case "donations":
          localStorage.removeItem("hfrp_donations");
          localStorage.removeItem("hfrp_donation_campaigns");
          localStorage.removeItem("hfrp_donation_goals");
          break;
        case "notifications":
          localStorage.removeItem("hfrp_notifications");
          break;
        case "users":
          localStorage.removeItem("admin_users");
          break;
        case "settings":
          localStorage.removeItem("hfrp_site_settings");
          break;
      }
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    totalSize: number;
    breakdown: Record<string, number>;
  }> {
    const breakdown: Record<string, number> = {};
    let totalSize = 0;

    for (const key of ALL_STORAGE_KEYS) {
      const value = localStorage.getItem(key);
      if (value) {
        const size = new Blob([value]).size;
        breakdown[key] = size;
        totalSize += size;
      }
    }

    return { totalSize, breakdown };
  }

  // Create differential backup
  private async createDifferentialBackup(
    current: BackupData,
    base: BackupData,
  ): Promise<BackupData> {
    const differential: DifferentialBackup = {
      baseBackupId: base.metadata.createdAt,
      changes: {
        added: {},
        modified: {},
        deleted: {},
      },
      timestamp: current.metadata.createdAt,
    };

    // Compare each data type
    for (const key of Object.keys(current.data) as Array<
      keyof typeof current.data
    >) {
      if (Array.isArray(current.data[key]) && Array.isArray(base.data[key])) {
        const currentItems = current.data[key] as unknown[];
        const baseItems = base.data[key] as unknown[];

        // Find added and modified items
        const baseIds = new Set(baseItems.map((item: any) => item.id));
        const added: unknown[] = [];
        const modified: unknown[] = [];

        for (const item of currentItems) {
          const itemWithId = item as any;
          if (!baseIds.has(itemWithId.id)) {
            added.push(item);
          } else {
            // Check if modified (simplified check)
            const baseItem = baseItems.find((b: any) => b.id === itemWithId.id);
            if (JSON.stringify(item) !== JSON.stringify(baseItem)) {
              modified.push(item);
            }
          }
        }

        if (added.length > 0) differential.changes.added[key] = added;
        if (modified.length > 0) differential.changes.modified[key] = modified;

        // Find deleted items
        const currentIds = new Set(currentItems.map((item: any) => item.id));
        const deleted = baseItems
          .filter((item: any) => !currentIds.has(item.id))
          .map((item: any) => item.id);

        if (deleted.length > 0) differential.changes.deleted[key] = deleted;
      }
    }

    // Update metadata for differential backup
    current.metadata.differential = {
      baseBackupId: base.metadata.createdAt,
      changedRecords:
        Object.values(differential.changes.added).reduce(
          (sum, arr) => sum + arr.length,
          0,
        ) +
        Object.values(differential.changes.modified).reduce(
          (sum, arr) => sum + arr.length,
          0,
        ) +
        Object.values(differential.changes.deleted).reduce(
          (sum, arr) => sum + arr.length,
          0,
        ),
    };

    // Return only the changes for differential backup
    return {
      metadata: current.metadata,
      data: differential.changes as any,
    };
  }

  // Create encrypted backup
  async createEncryptedBackup(
    password: string,
    createdBy: string,
  ): Promise<BackupData> {
    const validation = BackupEncryption.validatePassword(password);
    if (!validation.isValid) {
      throw new Error(`Invalid password: ${validation.errors.join(", ")}`);
    }

    return this.createBackup(createdBy, {
      encrypt: true,
      password,
    });
  }

  // Verify backup integrity
  async verifyBackupIntegrity(backupData: BackupData): Promise<boolean> {
    if (!backupData.metadata.checksum) {
      return false;
    }

    const dataString = JSON.stringify(backupData.data);
    return BackupEncryption.verifyChecksum(
      dataString,
      backupData.metadata.checksum,
    );
  }

  // Apply rotation policy
  async applyRotationPolicy(policy: BackupRotationPolicy): Promise<number> {
    const history = await this.getBackupHistory();
    const now = new Date();
    let deletedCount = 0;

    // Group backups by age
    const groups = {
      hourly: [] as BackupHistory[],
      daily: [] as BackupHistory[],
      weekly: [] as BackupHistory[],
      monthly: [] as BackupHistory[],
      yearly: [] as BackupHistory[],
    };

    for (const backup of history) {
      const age = now.getTime() - new Date(backup.createdAt).getTime();
      const days = age / (1000 * 60 * 60 * 24);

      if (days < 1) groups.hourly.push(backup);
      else if (days < 7) groups.daily.push(backup);
      else if (days < 30) groups.weekly.push(backup);
      else if (days < 365) groups.monthly.push(backup);
      else groups.yearly.push(backup);
    }

    // Apply retention rules
    for (const [period, backups] of Object.entries(groups)) {
      const limit = policy.rules[period as keyof typeof policy.rules].keep;
      if (backups.length > limit) {
        const toDelete = backups.slice(limit);
        for (const backup of toDelete) {
          if (!backup.retention?.isProtected || policy.deleteProtectedBackups) {
            // Delete the backup
            await this.deleteBackupFromHistory(backup.id);
            deletedCount++;
          }
        }
      }
    }

    // Ensure minimum backups
    const remainingCount = history.length - deletedCount;
    if (remainingCount < policy.minimumBackups) {
      console.warn(
        `Rotation policy would leave only ${remainingCount} backups, which is below the minimum of ${policy.minimumBackups}`,
      );
    }

    return deletedCount;
  }

  // Delete backup from history
  private async deleteBackupFromHistory(backupId: string): Promise<void> {
    const history = await this.getBackupHistory();
    const filtered = history.filter((b) => b.id !== backupId);
    localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(filtered));
  }
}

// Export singleton instance
export const backupStorage = new BackupStorageService();
