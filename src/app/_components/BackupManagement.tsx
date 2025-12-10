"use client";

import { useState, useEffect } from "react";
import { backupStorage } from "@/lib/backupStorage";
import { backupScheduler } from "@/lib/backupScheduler";
import { BackupEncryption } from "@/lib/backupEncryption";
import { createCloudStorageService } from "@/lib/cloudStorage";
import type {
  BackupData,
  BackupHistory,
  RestoreOptions,
  BackupSchedule,
  CloudStorageConfig,
  BackupRotationPolicy,
} from "@/types/backup";

export default function BackupManagement({
  currentUser,
}: {
  currentUser: { id: string; name: string; email: string };
}) {
  const [activeTab, setActiveTab] = useState<
    "create" | "restore" | "history" | "schedules" | "cloud"
  >("create");
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    overwriteExisting: false,
    selectedDataTypes: [
      "blog",
      "volunteers",
      "donations",
      "notifications",
      "users",
      "settings",
    ],
  });
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    summary: Record<string, number>;
  } | null>(null);
  const [storageStats, setStorageStats] = useState<{
    totalSize: number;
    breakdown: Record<string, number>;
  } | null>(null);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [useEncryption, setUseEncryption] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<CloudStorageConfig | null>(
    null,
  );
  const [createScheduleModal, setCreateScheduleModal] = useState(false);

  useEffect(() => {
    loadBackupHistory();
    loadStorageStats();
    loadSchedules();
  }, []);

  const loadBackupHistory = async () => {
    const history = await backupStorage.getBackupHistory();
    setBackupHistory(history);
  };

  const loadStorageStats = async () => {
    const stats = await backupStorage.getStorageStats();
    setStorageStats(stats);
  };

  const loadSchedules = async () => {
    const scheduleList = await backupScheduler.getAllSchedules();
    setSchedules(scheduleList);
  };

  const handleCreateBackup = async () => {
    if (useEncryption && !encryptionPassword) {
      alert("Please enter an encryption password");
      return;
    }

    if (useEncryption) {
      const validation = BackupEncryption.validatePassword(encryptionPassword);
      if (!validation.isValid) {
        alert(`Invalid password: ${validation.errors.join(", ")}`);
        return;
      }
    }

    setIsCreatingBackup(true);
    try {
      const backupData = await backupStorage.createBackup(currentUser.name, {
        encrypt: useEncryption,
        password: encryptionPassword,
        uploadToCloud: !!cloudConfig,
      });

      await backupStorage.downloadBackup(backupData);
      await loadBackupHistory();
      await loadStorageStats();

      alert("Backup created and downloaded successfully!");

      // Clear encryption password for security
      setEncryptionPassword("");
    } catch (error) {
      console.error("Backup creation failed:", error);
      alert("Failed to create backup. Please try again.");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationResult(null);

    try {
      const backupData = await backupStorage.uploadBackup(file);
      const validation = await backupStorage.validateBackup(backupData);
      setValidationResult(validation);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        warnings: [],
        summary: {},
      });
    }
  };

  const handleRestore = async () => {
    if (!selectedFile || !validationResult?.isValid) return;

    setIsRestoring(true);
    try {
      const backupData = await backupStorage.uploadBackup(selectedFile);
      const result = await backupStorage.restoreFromBackup(
        backupData,
        restoreOptions,
      );

      if (result.success) {
        alert(`Restore completed successfully!

Restored:
- Blog posts: ${result.restoredCounts.blogPosts}
- Volunteers: ${result.restoredCounts.volunteers}
- Donations: ${result.restoredCounts.donations}
- Notifications: ${result.restoredCounts.notifications}
- Admin users: ${result.restoredCounts.adminUsers}
- Settings: ${result.restoredCounts.settings}`);

        // Reload the page to reflect changes
        window.location.reload();
      } else {
        alert(`Restore failed:\n${result.errors.join("\n")}`);
      }
    } catch (error) {
      alert("Failed to restore backup. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearData = async (dataType: string) => {
    if (
      !confirm(
        `Are you sure you want to clear all ${dataType} data? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await backupStorage.clearData([dataType]);
      await loadStorageStats();
      alert(`${dataType} data cleared successfully.`);
      window.location.reload();
    } catch (error) {
      alert(`Failed to clear ${dataType} data.`);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Backup & Restore
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Create Backup
            </button>
            <button
              onClick={() => setActiveTab("restore")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "restore"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Restore
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "schedules"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Schedules
            </button>
            <button
              onClick={() => setActiveTab("cloud")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "cloud"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Cloud Storage
            </button>
          </nav>
        </div>

        {/* Create Backup Tab */}
        {activeTab === "create" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Create Full Backup</h2>
              <p className="text-gray-600 mb-6">
                Create a complete backup of all system data including blog
                posts, volunteers, donations, notifications, admin users, and
                site settings.
              </p>

              {storageStats && (
                <div className="mb-6 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-2">Current Storage Usage</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Total: {formatBytes(storageStats.totalSize)}
                  </p>
                  <div className="space-y-1">
                    {Object.entries(storageStats.breakdown).map(
                      ([key, size]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {key.replace("hfrp_", "").replace(/_/g, " ")}
                          </span>
                          <span className="font-medium">
                            {formatBytes(size)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Backup Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useEncryption}
                      onChange={(e) => setUseEncryption(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Encrypt backup</span>
                  </label>

                  {useEncryption && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Encryption Password
                      </label>
                      <input
                        type="password"
                        value={encryptionPassword}
                        onChange={(e) => setEncryptionPassword(e.target.value)}
                        placeholder="Enter strong password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Min 8 chars, uppercase, lowercase, number, special char
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingBackup
                  ? "Creating Backup..."
                  : "Create & Download Backup"}
              </button>
            </div>

            {/* Data Management */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Data Management</h2>
              <p className="text-gray-600 mb-6">
                Clear specific data types. This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleClearData("blog")}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Clear Blog Data
                </button>
                <button
                  onClick={() => handleClearData("volunteers")}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Clear Volunteer Data
                </button>
                <button
                  onClick={() => handleClearData("donations")}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Clear Donation Data
                </button>
                <button
                  onClick={() => handleClearData("notifications")}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Clear Notifications
                </button>
                <button
                  onClick={() => handleClearData("users")}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Clear Admin Users
                </button>
                <button
                  onClick={() => handleClearData("settings")}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  Clear Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Tab */}
        {activeTab === "restore" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Restore from Backup</h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Backup File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div
                className={`mb-6 p-4 rounded ${validationResult.isValid ? "bg-green-50" : "bg-red-50"}`}
              >
                <h3
                  className={`font-medium mb-2 ${validationResult.isValid ? "text-green-800" : "text-red-800"}`}
                >
                  {validationResult.isValid
                    ? "Valid Backup File"
                    : "Invalid Backup File"}
                </h3>

                {validationResult.errors.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-red-700">Errors:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {validationResult.errors.map((error, i) => (
                        <li key={`error-${i}-${error.slice(0, 10)}`}>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-yellow-700">
                      Warnings:
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-600">
                      {validationResult.warnings.map((warning, i) => (
                        <li key={`warning-${i}-${warning.slice(0, 10)}`}>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.isValid && validationResult.summary && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Summary:
                    </p>
                    <ul className="text-sm text-gray-600">
                      <li>
                        Blog posts: {validationResult.summary.blogPosts || 0}
                      </li>
                      <li>
                        Volunteers: {validationResult.summary.volunteers || 0}
                      </li>
                      <li>
                        Donations: {validationResult.summary.donations || 0}
                      </li>
                      <li>
                        Notifications:{" "}
                        {validationResult.summary.notifications || 0}
                      </li>
                      <li>
                        Admin users: {validationResult.summary.adminUsers || 0}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Restore Options */}
            {validationResult?.isValid && (
              <div className="space-y-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={restoreOptions.overwriteExisting}
                      onChange={(e) =>
                        setRestoreOptions({
                          ...restoreOptions,
                          overwriteExisting: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">
                      Overwrite existing data (unchecked = merge)
                    </span>
                  </label>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Select data to restore:
                  </p>
                  <div className="space-y-2">
                    {[
                      "blog",
                      "volunteers",
                      "donations",
                      "notifications",
                      "users",
                      "settings",
                    ].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={restoreOptions.selectedDataTypes.includes(
                            type,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRestoreOptions({
                                ...restoreOptions,
                                selectedDataTypes: [
                                  ...restoreOptions.selectedDataTypes,
                                  type,
                                ],
                              });
                            } else {
                              setRestoreOptions({
                                ...restoreOptions,
                                selectedDataTypes:
                                  restoreOptions.selectedDataTypes.filter(
                                    (t) => t !== type,
                                  ),
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRestore}
                  disabled={
                    isRestoring || restoreOptions.selectedDataTypes.length === 0
                  }
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRestoring ? "Restoring..." : "Restore Selected Data"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Backup History</h2>

            {backupHistory.length === 0 ? (
              <p className="text-gray-500">No backup history available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Filename
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backupHistory.map((backup) => (
                      <tr key={backup.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(backup.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.filename}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatBytes(backup.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.createdBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="capitalize">{backup.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              backup.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : backup.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {backup.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === "schedules" && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Backup Schedules</h2>
              <button
                onClick={() => setCreateScheduleModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Schedule
              </button>
            </div>

            {schedules.length === 0 ? (
              <p className="text-gray-500">No backup schedules configured.</p>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {schedule.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {schedule.frequency} backup
                          {schedule.time && ` at ${schedule.time}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {schedule.backupType} | Encrypted:{" "}
                          {schedule.encryption ? "Yes" : "No"}
                        </p>
                        {schedule.cloudStorage && (
                          <p className="text-sm text-gray-500">
                            Cloud: {schedule.cloudStorage.provider}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Next backup:{" "}
                          {new Date(schedule.nextBackup).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            schedule.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {schedule.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() =>
                            backupScheduler
                              .deleteSchedule(schedule.id)
                              .then(loadSchedules)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cloud Storage Tab */}
        {activeTab === "cloud" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Cloud Storage Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a provider</option>
                  <option value="aws">Amazon S3</option>
                  <option value="gcp">Google Cloud Storage</option>
                  <option value="azure">Azure Blob Storage</option>
                </select>
              </div>

              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  Cloud storage integration allows automatic upload of backups
                  to your preferred cloud provider. Configure your credentials
                  and bucket settings to enable cloud backups.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
