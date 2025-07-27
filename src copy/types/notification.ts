// Notification types
export type NotificationType =
  | 'blog_published'
  | 'blog_scheduled'
  | 'blog_needs_review'
  | 'user_created'
  | 'user_updated'
  | 'user_deactivated'
  | 'volunteer_joined'
  | 'volunteer_shift_reminder'
  | 'donation_received'
  | 'backup_completed'
  | 'system_alert';

// Notification priority
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Notification delivery method
export type DeliveryMethod = 'email' | 'sms' | 'push' | 'in_app';

// Email template types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; // HTML template with placeholders
  variables: string[]; // Available template variables
  type: NotificationType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification recipient
export interface NotificationRecipient {
  id: string;
  email: string;
  name: string;
  preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    types: NotificationType[];
  };
}

// Notification queue item
export interface NotificationQueueItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipient: NotificationRecipient;
  subject: string;
  content: string;
  metadata?: Record<string, unknown>;
  scheduledFor?: string;
  attempts: number;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
  createdAt: string;
  sentAt?: string;
}

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  defaultMethod: DeliveryMethod;
  emailSettings: {
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpSecure?: boolean;
  };
  smsSettings?: {
    provider: string;
    apiKey: string;
    fromNumber: string;
  };
  notificationTypes: {
    [key in NotificationType]: {
      enabled: boolean;
      priority: NotificationPriority;
      methods: DeliveryMethod[];
      recipients: string[]; // Email addresses or user IDs
    };
  };
}

// Blog moderation types
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface ContentModerationItem {
  id: string;
  contentType: 'blog_post' | 'comment' | 'media';
  contentId: string;
  title: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  status: ModerationStatus;
  submittedAt: string;
  moderator?: {
    id: string;
    name: string;
    email: string;
  };
  moderatedAt?: string;
  feedback?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  metadata?: Record<string, unknown>;
}

// Moderation workflow
export interface ModerationWorkflow {
  id: string;
  name: string;
  description: string;
  steps: ModerationStep[];
  autoApproveRoles?: string[]; // Roles that bypass moderation
  notifyOnSubmission: boolean;
  notifyOnApproval: boolean;
  notifyOnRejection: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationStep {
  id: string;
  name: string;
  order: number;
  approvers: string[]; // User IDs or role names
  requiredApprovals: number;
  autoApproveAfter?: number; // Hours
  escalateTo?: string[]; // User IDs for escalation
}

// Notification log
export interface NotificationLog {
  id: string;
  notificationId: string;
  type: NotificationType;
  recipient: string;
  method: DeliveryMethod;
  status: 'success' | 'failed';
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Email notification payloads
export interface BlogPublishedPayload {
  postId: string;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  authorName: string;
  authorEmail: string;
  publishedAt: string;
  categories: string[];
  tags: string[];
}

export interface UserManagementPayload {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: 'created' | 'updated' | 'deactivated' | 'role_changed';
  changedBy: string;
  changes?: Record<string, unknown>;
  timestamp: string;
}

export interface ModerationPayload {
  itemId: string;
  itemType: string;
  itemTitle: string;
  authorName: string;
  authorEmail: string;
  status: ModerationStatus;
  moderatorName?: string;
  feedback?: string;
  actionUrl: string;
}
