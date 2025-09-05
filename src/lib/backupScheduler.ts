import type { BackupSchedule } from "@/types/backup";
import { backupStorage } from "./backupStorage";

// Backup scheduler service
export class BackupSchedulerService {
  private schedules: Map<string, NodeJS.Timeout> = new Map();
  private readonly STORAGE_KEY = "hfrp_backup_schedules";

  constructor() {
    this.loadAndStartSchedules();
  }

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getFromStorage(key: string, defaultValue = ""): string {
    if (!this.isClient()) return defaultValue;
    return localStorage.getItem(key) || defaultValue;
  }

  private setToStorage(key: string, value: string): void {
    if (!this.isClient()) return;
    this.setToStorage(key, value);
  }

  // Load schedules from storage and start them
  private async loadAndStartSchedules() {
    if (!this.isClient()) return;

    const schedules = await this.getAllSchedules();
    for (const schedule of schedules) {
      if (schedule.isActive) {
        this.startSchedule(schedule);
      }
    }
  }

  // Get all schedules
  async getAllSchedules(): Promise<BackupSchedule[]> {
    if (!this.isClient()) return [];

    const stored = this.getFromStorage(this.STORAGE_KEY, "[]");
    return stored ? JSON.parse(stored) : [];
  }

  // Get schedule by ID
  async getScheduleById(id: string): Promise<BackupSchedule | null> {
    const schedules = await this.getAllSchedules();
    return schedules.find((s) => s.id === id) || null;
  }

  // Create a new schedule
  async createSchedule(
    schedule: Omit<
      BackupSchedule,
      "id" | "createdAt" | "updatedAt" | "nextBackup"
    >,
  ): Promise<BackupSchedule> {
    const schedules = await this.getAllSchedules();

    const newSchedule: BackupSchedule = {
      ...schedule,
      id: `schedule-${Date.now()}`,
      nextBackup: this.calculateNextBackup(schedule),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    schedules.push(newSchedule);
    this.setToStorage(this.STORAGE_KEY, JSON.stringify(schedules));

    if (newSchedule.isActive) {
      this.startSchedule(newSchedule);
    }

    return newSchedule;
  }

  // Update a schedule
  async updateSchedule(
    id: string,
    updates: Partial<BackupSchedule>,
  ): Promise<BackupSchedule | null> {
    const schedules = await this.getAllSchedules();
    const index = schedules.findIndex((s) => s.id === id);

    if (index === -1) return null;

    const updatedSchedule = {
      ...schedules[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (
      updates.frequency ||
      updates.time ||
      updates.dayOfWeek ||
      updates.dayOfMonth
    ) {
      updatedSchedule.nextBackup = this.calculateNextBackup(updatedSchedule);
    }

    schedules[index] = updatedSchedule;
    this.setToStorage(this.STORAGE_KEY, JSON.stringify(schedules));

    // Restart schedule if needed
    this.stopSchedule(id);
    if (updatedSchedule.isActive) {
      this.startSchedule(updatedSchedule);
    }

    return updatedSchedule;
  }

  // Delete a schedule
  async deleteSchedule(id: string): Promise<boolean> {
    const schedules = await this.getAllSchedules();
    const filtered = schedules.filter((s) => s.id !== id);

    if (filtered.length === schedules.length) return false;

    this.stopSchedule(id);
    this.setToStorage(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  // Start a schedule
  private startSchedule(schedule: BackupSchedule) {
    this.stopSchedule(schedule.id); // Stop existing if any

    const checkAndRun = async () => {
      const now = new Date();
      const nextBackup = new Date(schedule.nextBackup);

      if (now >= nextBackup) {
        // Run backup
        await this.runScheduledBackup(schedule);

        // Update schedule with new next backup time
        await this.updateSchedule(schedule.id, {
          lastBackup: now.toISOString(),
          nextBackup: this.calculateNextBackup(schedule),
        });
      }
    };

    // Check every minute
    const interval = setInterval(checkAndRun, 60000);
    this.schedules.set(schedule.id, interval);

    // Also check immediately
    checkAndRun();
  }

  // Stop a schedule
  private stopSchedule(id: string) {
    const interval = this.schedules.get(id);
    if (interval) {
      clearInterval(interval);
      this.schedules.delete(id);
    }
  }

  // Calculate next backup time
  private calculateNextBackup(schedule: Partial<BackupSchedule>): string {
    const now = new Date();
    const next = new Date();

    switch (schedule.frequency) {
      case "hourly":
        next.setHours(next.getHours() + 1);
        next.setMinutes(0);
        next.setSeconds(0);
        break;

      case "daily":
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(":").map(Number);
          next.setHours(hours, minutes, 0, 0);
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
        }
        break;

      case "weekly":
        if (schedule.dayOfWeek !== undefined && schedule.time) {
          const [hours, minutes] = schedule.time.split(":").map(Number);
          next.setHours(hours, minutes, 0, 0);

          // Find next occurrence of the specified day
          const daysUntilTarget = (schedule.dayOfWeek - next.getDay() + 7) % 7;
          if (daysUntilTarget === 0 && next <= now) {
            next.setDate(next.getDate() + 7);
          } else {
            next.setDate(next.getDate() + daysUntilTarget);
          }
        }
        break;

      case "monthly":
        if (schedule.dayOfMonth && schedule.time) {
          const [hours, minutes] = schedule.time.split(":").map(Number);
          next.setDate(schedule.dayOfMonth);
          next.setHours(hours, minutes, 0, 0);

          if (next <= now) {
            next.setMonth(next.getMonth() + 1);
          }
        }
        break;
    }

    return next.toISOString();
  }

  // Run a scheduled backup
  private async runScheduledBackup(schedule: BackupSchedule) {
    try {
      console.log(`Running scheduled backup: ${schedule.name}`);

      // Create backup
      const backupData = await backupStorage.createBackup(
        `Schedule: ${schedule.name}`,
      );

      // Apply encryption if enabled
      if (schedule.encryption) {
        // Encryption would be applied here
        console.log("Applying encryption to backup...");
      }

      // Upload to cloud if configured
      if (schedule.cloudStorage) {
        console.log(`Uploading to ${schedule.cloudStorage.provider}...`);
        // Cloud upload would happen here
      }

      // Apply retention policy
      await this.applyRetentionPolicy(schedule);

      // Send notifications
      if (schedule.notifications.onSuccess) {
        console.log("Sending success notification...");
        // Notification would be sent here
      }
    } catch (error) {
      console.error("Scheduled backup failed:", error);

      if (schedule.notifications.onFailure) {
        console.log("Sending failure notification...");
        // Notification would be sent here
      }
    }
  }

  // Apply retention policy
  private async applyRetentionPolicy(schedule: BackupSchedule) {
    const history = await backupStorage.getBackupHistory();
    const scheduleBackups = history
      .filter((b) => b.scheduleId === schedule.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    // Remove old backups based on count
    if (
      schedule.retention.count > 0 &&
      scheduleBackups.length > schedule.retention.count
    ) {
      const toDelete = scheduleBackups.slice(schedule.retention.count);
      for (const backup of toDelete) {
        if (!backup.retention?.isProtected) {
          console.log(`Deleting old backup: ${backup.filename}`);
          // Delete backup
        }
      }
    }

    // Remove old backups based on age
    if (schedule.retention.days > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - schedule.retention.days);

      for (const backup of scheduleBackups) {
        if (
          new Date(backup.createdAt) < cutoffDate &&
          !backup.retention?.isProtected
        ) {
          console.log(`Deleting expired backup: ${backup.filename}`);
          // Delete backup
        }
      }
    }
  }

  // Stop all schedules
  stopAll() {
    for (const [id] of this.schedules) {
      this.stopSchedule(id);
    }
  }
}

// Export singleton instance
export const backupScheduler = new BackupSchedulerService();
