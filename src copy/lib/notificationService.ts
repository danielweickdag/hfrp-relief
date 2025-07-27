import type {
  NotificationType,
  NotificationPriority,
  NotificationQueueItem,
  NotificationSettings,
  EmailTemplate,
  NotificationRecipient,
  ContentModerationItem,
  ModerationWorkflow,
  ModerationStatus,
  BlogPublishedPayload,
  UserManagementPayload,
  ModerationPayload,
  NotificationLog
} from '@/types/notification';

// Storage keys
const STORAGE_KEYS = {
  QUEUE: 'hfrp_notification_queue',
  SETTINGS: 'hfrp_notification_settings',
  TEMPLATES: 'hfrp_email_templates',
  RECIPIENTS: 'hfrp_notification_recipients',
  MODERATION_ITEMS: 'hfrp_moderation_items',
  MODERATION_WORKFLOWS: 'hfrp_moderation_workflows',
  LOGS: 'hfrp_notification_logs'
};

// Default email templates
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Blog Post Published',
    subject: 'New Blog Post: {{postTitle}}',
    body: `
      <h2>New Blog Post Published</h2>
      <p>A new blog post has been published on the HFRP website.</p>
      <h3>{{postTitle}}</h3>
      <p>{{postExcerpt}}</p>
      <p><strong>Author:</strong> {{authorName}}</p>
      <p><strong>Categories:</strong> {{categories}}</p>
      <p><a href="{{postUrl}}">Read Full Post</a></p>
    `,
    variables: ['postTitle', 'postExcerpt', 'postUrl', 'authorName', 'categories'],
    type: 'blog_published',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-2',
    name: 'Blog Post Needs Review',
    subject: 'Blog Post Pending Review: {{postTitle}}',
    body: `
      <h2>Blog Post Needs Your Review</h2>
      <p>A blog post is waiting for your approval.</p>
      <h3>{{postTitle}}</h3>
      <p><strong>Author:</strong> {{authorName}} ({{authorEmail}})</p>
      <p><strong>Submitted:</strong> {{submittedAt}}</p>
      <p><a href="{{actionUrl}}">Review Post</a></p>
    `,
    variables: ['postTitle', 'authorName', 'authorEmail', 'submittedAt', 'actionUrl'],
    type: 'blog_needs_review',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-3',
    name: 'User Account Created',
    subject: 'New User Account: {{userName}}',
    body: `
      <h2>New User Account Created</h2>
      <p>A new user account has been created in the HFRP admin system.</p>
      <p><strong>Name:</strong> {{userName}}</p>
      <p><strong>Email:</strong> {{userEmail}}</p>
      <p><strong>Role:</strong> {{userRole}}</p>
      <p><strong>Created By:</strong> {{changedBy}}</p>
    `,
    variables: ['userName', 'userEmail', 'userRole', 'changedBy'],
    type: 'user_created',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl-4',
    name: 'Volunteer Shift Reminder',
    subject: 'Reminder: Your volunteer shift tomorrow',
    body: `
      <h2>Volunteer Shift Reminder</h2>
      <p>This is a reminder about your upcoming volunteer shift.</p>
      <p><strong>Date:</strong> {{shiftDate}}</p>
      <p><strong>Time:</strong> {{shiftTime}}</p>
      <p><strong>Program:</strong> {{programName}}</p>
      <p><strong>Location:</strong> {{location}}</p>
      <p>If you cannot attend, please contact your coordinator as soon as possible.</p>
    `,
    variables: ['shiftDate', 'shiftTime', 'programName', 'location'],
    type: 'volunteer_shift_reminder',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Default notification settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  defaultMethod: 'email',
  emailSettings: {
    fromEmail: 'noreply@haitianfamilyrelief.org',
    fromName: 'HFRP Admin System',
    replyTo: 'admin@haitianfamilyrelief.org'
  },
  notificationTypes: {
    blog_published: {
      enabled: true,
      priority: 'medium',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org']
    },
    blog_scheduled: {
      enabled: true,
      priority: 'low',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org']
    },
    blog_needs_review: {
      enabled: true,
      priority: 'high',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org', 'editor@haitianfamilyrelief.org']
    },
    user_created: {
      enabled: true,
      priority: 'medium',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org']
    },
    user_updated: {
      enabled: true,
      priority: 'low',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org']
    },
    user_deactivated: {
      enabled: true,
      priority: 'high',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org']
    },
    volunteer_joined: {
      enabled: true,
      priority: 'medium',
      methods: ['email'],
      recipients: ['volunteer@haitianfamilyrelief.org']
    },
    volunteer_shift_reminder: {
      enabled: true,
      priority: 'medium',
      methods: ['email'],
      recipients: []
    },
    donation_received: {
      enabled: true,
      priority: 'medium',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org', 'finance@haitianfamilyrelief.org']
    },
    backup_completed: {
      enabled: true,
      priority: 'low',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org']
    },
    system_alert: {
      enabled: true,
      priority: 'urgent',
      methods: ['email'],
      recipients: ['admin@haitianfamilyrelief.org']
    }
  }
};

// Default moderation workflow
const DEFAULT_WORKFLOW: ModerationWorkflow = {
  id: 'wf-1',
  name: 'Blog Post Moderation',
  description: 'Review and approve blog posts before publication',
  steps: [
    {
      id: 'step-1',
      name: 'Editor Review',
      order: 1,
      approvers: ['editor', 'superadmin'],
      requiredApprovals: 1,
      autoApproveAfter: 48,
      escalateTo: ['admin@haitianfamilyrelief.org']
    }
  ],
  autoApproveRoles: ['superadmin'],
  notifyOnSubmission: true,
  notifyOnApproval: true,
  notifyOnRejection: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

class NotificationService {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.QUEUE)) {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_TEMPLATES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECIPIENTS)) {
      localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MODERATION_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.MODERATION_ITEMS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MODERATION_WORKFLOWS)) {
      localStorage.setItem(STORAGE_KEYS.MODERATION_WORKFLOWS, JSON.stringify([DEFAULT_WORKFLOW]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    }
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  }

  // Update notification settings
  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Get email templates
  async getTemplates(): Promise<EmailTemplate[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '[]');
  }

  // Get template by type
  async getTemplateByType(type: NotificationType): Promise<EmailTemplate | null> {
    const templates = await this.getTemplates();
    return templates.find(t => t.type === type && t.isActive) || null;
  }

  // Update email template
  async updateTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const templates = await this.getTemplates();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) return null;

    templates[index] = {
      ...templates[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return templates[index];
  }

  // Queue notification
  async queueNotification(
    type: NotificationType,
    recipient: NotificationRecipient | string,
    data: Record<string, unknown>,
    options?: {
      priority?: NotificationPriority;
      scheduledFor?: string;
    }
  ): Promise<NotificationQueueItem> {
    const settings = await this.getSettings();
    const typeSettings = settings.notificationTypes[type];

    if (!settings.enabled || !typeSettings?.enabled) {
      throw new Error('Notifications are disabled for this type');
    }

    const template = await this.getTemplateByType(type);
    if (!template) {
      throw new Error('No active template found for this notification type');
    }

    // Process template
    const { subject, content } = this.processTemplate(template, data);

    // Create recipient object if string (email) provided
    const recipientObj: NotificationRecipient = typeof recipient === 'string'
      ? {
          id: `recipient-${Date.now()}`,
          email: recipient,
          name: recipient,
          preferences: {
            email: true,
            sms: false,
            push: false,
            types: [type]
          }
        }
      : recipient;

    const queueItem: NotificationQueueItem = {
      id: `notif-${Date.now()}`,
      type,
      priority: options?.priority || typeSettings.priority,
      recipient: recipientObj,
      subject,
      content,
      metadata: data,
      scheduledFor: options?.scheduledFor,
      attempts: 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add to queue
    const queue = await this.getQueue();
    queue.push(queueItem);
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));

    // Process immediately if not scheduled
    if (!options?.scheduledFor) {
      await this.processQueue();
    }

    return queueItem;
  }

  // Process template with data
  private processTemplate(template: EmailTemplate, data: Record<string, unknown>): { subject: string; content: string } {
    let subject = template.subject;
    let content = template.body;

    // Replace variables
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return { subject, content };
  }

  // Get notification queue
  async getQueue(): Promise<NotificationQueueItem[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUEUE) || '[]');
  }

  // Process notification queue
  async processQueue(): Promise<void> {
    const queue = await this.getQueue();
    const now = new Date();

    for (const item of queue) {
      if (item.status !== 'pending') continue;

      if (item.scheduledFor && new Date(item.scheduledFor) > now) continue;

      await this.sendNotification(item);
    }
  }

  // Send notification (simulated)
  private async sendNotification(item: NotificationQueueItem): Promise<void> {
    const queue = await this.getQueue();
    const index = queue.findIndex(q => q.id === item.id);

    if (index === -1) return;

    try {
      // Update status
      queue[index].status = 'sending';
      queue[index].attempts++;
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));

      // Simulate sending email
      console.log('Sending notification:', {
        to: item.recipient.email,
        subject: item.subject,
        content: item.content
      });

      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // await emailService.send({...})

      // Mark as sent
      queue[index].status = 'sent';
      queue[index].sentAt = new Date().toISOString();

      // Log success
      await this.logNotification(item, 'success');
    } catch (error) {
      queue[index].status = 'failed';
      queue[index].error = error instanceof Error ? error.message : 'Unknown error';

      // Log failure
      await this.logNotification(item, 'failed', error);

      // Retry logic could be implemented here
    }

    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  }

  // Log notification
  private async logNotification(item: NotificationQueueItem, status: 'success' | 'failed', error?: unknown): Promise<void> {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]') as NotificationLog[];

    logs.push({
      id: `log-${Date.now()}`,
      notificationId: item.id,
      type: item.type,
      recipient: item.recipient.email,
      method: 'email',
      status,
      error: error ? String(error) : undefined,
      metadata: item.metadata,
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  // Blog post published notification
  async notifyBlogPublished(payload: BlogPublishedPayload): Promise<void> {
    const settings = await this.getSettings();
    const recipients = settings.notificationTypes.blog_published?.recipients || [];

    for (const recipient of recipients) {
      await this.queueNotification('blog_published', recipient, payload);
    }
  }

  // User management notification
  async notifyUserManagement(payload: UserManagementPayload): Promise<void> {
    const type = payload.action === 'created' ? 'user_created' :
                 payload.action === 'deactivated' ? 'user_deactivated' : 'user_updated';

    const settings = await this.getSettings();
    const recipients = settings.notificationTypes[type]?.recipients || [];

    for (const recipient of recipients) {
      await this.queueNotification(type, recipient, payload);
    }
  }

  // Content moderation methods
  async submitForModeration(
    contentType: ContentModerationItem['contentType'],
    contentId: string,
    data: {
      title: string;
      author: ContentModerationItem['author'];
      metadata?: Record<string, unknown>;
    }
  ): Promise<ContentModerationItem> {
    const items = await this.getModerationItems();
    const workflow = await this.getActiveWorkflow();

    // Check if author's role bypasses moderation
    if (workflow?.autoApproveRoles?.includes(data.author.role)) {
      // Auto-approve
      return this.createModerationItem({
        ...data,
        contentType,
        contentId,
        status: 'approved',
        moderatedAt: new Date().toISOString()
      });
    }

    const item: ContentModerationItem = {
      id: `mod-${Date.now()}`,
      contentType,
      contentId,
      title: data.title,
      author: data.author,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      metadata: data.metadata
    };

    items.push(item);
    localStorage.setItem(STORAGE_KEYS.MODERATION_ITEMS, JSON.stringify(items));

    // Send notification if enabled
    if (workflow?.notifyOnSubmission) {
      await this.notifyModerationNeeded(item);
    }

    return item;
  }

  private createModerationItem(data: unknown): ContentModerationItem {
    return {
      id: `mod-${Date.now()}`,
      ...data,
      submittedAt: new Date().toISOString()
    };
  }

  // Get moderation items
  async getModerationItems(status?: ModerationStatus): Promise<ContentModerationItem[]> {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.MODERATION_ITEMS) || '[]') as ContentModerationItem[];

    if (status) {
      return items.filter(item => item.status === status);
    }

    return items;
  }

  // Moderate content
  async moderateContent(
    itemId: string,
    status: ModerationStatus,
    moderator: { id: string; name: string; email: string },
    feedback?: string
  ): Promise<ContentModerationItem | null> {
    const items = await this.getModerationItems();
    const index = items.findIndex(item => item.id === itemId);

    if (index === -1) return null;

    items[index] = {
      ...items[index],
      status,
      moderator,
      moderatedAt: new Date().toISOString(),
      feedback
    };

    localStorage.setItem(STORAGE_KEYS.MODERATION_ITEMS, JSON.stringify(items));

    // Send notification
    const workflow = await this.getActiveWorkflow();
    if (workflow?.notifyOnApproval && status === 'approved' ||
        workflow?.notifyOnRejection && status === 'rejected') {
      await this.notifyModerationResult(items[index]);
    }

    return items[index];
  }

  // Get active workflow
  async getActiveWorkflow(): Promise<ModerationWorkflow | null> {
    const workflows = JSON.parse(localStorage.getItem(STORAGE_KEYS.MODERATION_WORKFLOWS) || '[]') as ModerationWorkflow[];
    return workflows.find(w => w.isActive) || null;
  }

  // Notification helpers for moderation
  private async notifyModerationNeeded(item: ContentModerationItem): Promise<void> {
    const settings = await this.getSettings();
    const recipients = settings.notificationTypes.blog_needs_review?.recipients || [];

    const payload: ModerationPayload = {
      itemId: item.id,
      itemType: item.contentType,
      itemTitle: item.title,
      authorName: item.author.name,
      authorEmail: item.author.email,
      status: item.status,
      actionUrl: `/admin/moderation/${item.id}`
    };

    for (const recipient of recipients) {
      await this.queueNotification('blog_needs_review', recipient, {
        ...payload,
        submittedAt: new Date(item.submittedAt).toLocaleString()
      });
    }
  }

  private async notifyModerationResult(item: ContentModerationItem): Promise<void> {
    const payload: ModerationPayload = {
      itemId: item.id,
      itemType: item.contentType,
      itemTitle: item.title,
      authorName: item.author.name,
      authorEmail: item.author.email,
      status: item.status,
      moderatorName: item.moderator?.name,
      feedback: item.feedback,
      actionUrl: `/admin/blog/posts/${item.contentId}`
    };

    // Notify author
    await this.queueNotification('blog_published', item.author.email, payload);
  }

  // Get notification logs
  async getLogs(filters?: {
    type?: NotificationType;
    status?: 'success' | 'failed';
    startDate?: string;
    endDate?: string;
  }): Promise<NotificationLog[]> {
    let logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]') as NotificationLog[];

    if (filters) {
      if (filters.type) {
        logs = logs.filter(log => log.type === filters.type);
      }
      if (filters.status) {
        logs = logs.filter(log => log.status === filters.status);
      }
      if (filters.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Clean up old notifications
  async cleanup(daysToKeep = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Clean queue
    const queue = await this.getQueue();
    const filteredQueue = queue.filter(item =>
      item.status === 'pending' || new Date(item.createdAt) > cutoffDate
    );
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(filteredQueue));

    // Clean logs
    const logs = await this.getLogs();
    const filteredLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(filteredLogs));

    // Clean moderation items
    const moderationItems = await this.getModerationItems();
    const filteredModeration = moderationItems.filter(item =>
      item.status === 'pending' || new Date(item.submittedAt) > cutoffDate
    );
    localStorage.setItem(STORAGE_KEYS.MODERATION_ITEMS, JSON.stringify(filteredModeration));
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
