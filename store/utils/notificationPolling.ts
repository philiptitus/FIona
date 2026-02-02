import { store } from '@/store/store';
import { fetchNotifications, Notification } from '@/store/actions/notificationActions';

export interface NotificationSearchCriteria {
  /** Search term to match against notification title, message, or metadata fields */
  searchTerm?: string;
  /** Specific notification type to filter by (e.g., 'research_complete_success', 'campaign_completed', 'error') */
  notificationType?: string;
  /** Match by token (unique identifier for async operations) */
  token?: string;
  /** Match by research_id */
  researchId?: number;
  /** Match by campaign_id */
  campaignId?: number;
  /** Match by contact_id */
  contactId?: number;
  /** Match by contact_name */
  contactName?: string;
  /** Generic metadata key/value match for custom fields */
  metadataKey?: string;
  metadataValue?: string | number;
}

export interface PollingOptions {
  /** Polling interval in milliseconds (default: 5000ms) */
  interval?: number;
  /** Maximum number of polling attempts (default: unlimited) */
  maxAttempts?: number;
  /** Timeout in milliseconds after which polling stops (default: unlimited) */
  timeout?: number;
  /** Callback when the target notification is found */
  onFound?: (notification: Notification) => void;
  /** Callback on each poll cycle */
  onPoll?: (notifications: Notification[]) => void;
  /** Callback when polling stops (timeout, max attempts, or manual stop) */
  onStop?: (reason: 'found' | 'timeout' | 'maxAttempts' | 'manual' | 'error') => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

export interface NotificationPollingController {
  /** Start polling for notifications */
  start: () => void;
  /** Stop polling manually */
  stop: () => void;
  /** Check if currently polling */
  isPolling: () => boolean;
  /** Get the current attempt count */
  getAttemptCount: () => number;
}

/**
 * Checks if a notification matches the given search criteria
 */
export function matchesNotification(
  notification: Notification,
  criteria: NotificationSearchCriteria
): boolean {
  // If no criteria provided, no match
  const hasCriteria = criteria.searchTerm || 
    criteria.notificationType || 
    criteria.token ||
    criteria.researchId !== undefined ||
    criteria.campaignId !== undefined ||
    criteria.contactId !== undefined ||
    criteria.contactName ||
    criteria.metadataKey;

  if (!hasCriteria) {
    return false;
  }

  const metadata = notification.metadata || {};

  // Check notification type if specified
  if (criteria.notificationType && notification.notification_type !== criteria.notificationType) {
    return false;
  }

  // Check token if specified
  if (criteria.token && metadata.token !== criteria.token) {
    return false;
  }

  // Check research_id if specified
  if (criteria.researchId !== undefined && metadata.research_id !== criteria.researchId) {
    return false;
  }

  // Check campaign_id if specified
  if (criteria.campaignId !== undefined && metadata.campaign_id !== criteria.campaignId) {
    return false;
  }

  // Check contact_id if specified
  if (criteria.contactId !== undefined && metadata.contact_id !== criteria.contactId) {
    return false;
  }

  // Check contact_name if specified (case-insensitive)
  if (criteria.contactName) {
    const contactNameLower = criteria.contactName.toLowerCase();
    const metadataContactName = metadata.contact_name?.toLowerCase();
    if (metadataContactName !== contactNameLower) {
      return false;
    }
  }

  // Check generic metadata key/value if specified
  if (criteria.metadataKey && criteria.metadataValue !== undefined) {
    const metadataMatch = metadata[criteria.metadataKey] === criteria.metadataValue;
    if (!metadataMatch) {
      return false;
    }
  }

  // Check search term against title, message, and various metadata fields
  if (criteria.searchTerm) {
    const searchLower = criteria.searchTerm.toLowerCase();
    const fieldsToSearch = [
      notification.title,
      notification.message,
      metadata.contact_name,
      metadata.campaign_name,
      metadata.token,
      metadata.status,
      metadata.error,
      metadata.source,
    ];

    const matchFound = fieldsToSearch.some(
      (field) => field && String(field).toLowerCase().includes(searchLower)
    );

    if (!matchFound) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a notification polling controller that polls for notifications
 * and can search for a specific notification based on criteria.
 * 
 * @example
 * // Poll for a research completion notification by token
 * const controller = createNotificationPoller(
 *   { token: '50fcec35-ca4e-4909-8339-bb199a8a60c7' },
 *   {
 *     interval: 3000,
 *     maxAttempts: 20,
 *     onFound: (notification) => {
 *       console.log('Research completed:', notification);
 *     },
 *   }
 * );
 * controller.start();
 * 
 * @example
 * // Poll for a campaign creation notification
 * const controller = createNotificationPoller(
 *   { 
 *     notificationType: 'campaign_completed',
 *     campaignId: 209 
 *   },
 *   { interval: 5000, timeout: 120000 }
 * );
 * controller.start();
 * 
 * @example
 * // Poll for any notification mentioning a contact
 * const controller = createNotificationPoller(
 *   { contactName: 'Rosemary Wilson' },
 *   { interval: 3000 }
 * );
 * controller.start();
 */
export function createNotificationPoller(
  criteria: NotificationSearchCriteria,
  options: PollingOptions = {}
): NotificationPollingController {
  const {
    interval = 5000,
    maxAttempts,
    timeout,
    onFound,
    onPoll,
    onStop,
    onError,
  } = options;

  let pollingInterval: NodeJS.Timeout | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  let attemptCount = 0;
  let isActive = false;

  const cleanup = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isActive = false;
  };

  const poll = async () => {
    attemptCount++;

    // Check max attempts
    if (maxAttempts && attemptCount > maxAttempts) {
      cleanup();
      onStop?.('maxAttempts');
      return;
    }

    try {
      const result = await store.dispatch(fetchNotifications());

      if (fetchNotifications.fulfilled.match(result)) {
        const notifications = result.payload.notifications;
        onPoll?.(notifications);

        // Search for matching notification
        const foundNotification = notifications.find((n) =>
          matchesNotification(n, criteria)
        );

        if (foundNotification) {
          cleanup();
          onFound?.(foundNotification);
          onStop?.('found');
        }
      } else if (fetchNotifications.rejected.match(result)) {
        const errorMessage = result.payload as string || 'Unknown error';
        onError?.(errorMessage);
      }
    } catch (error: any) {
      onError?.(error.message || 'Polling error');
    }
  };

  const start = () => {
    if (isActive) {
      console.warn('Notification polling is already active');
      return;
    }

    isActive = true;
    attemptCount = 0;

    // Set up timeout if specified
    if (timeout) {
      timeoutId = setTimeout(() => {
        cleanup();
        onStop?.('timeout');
      }, timeout);
    }

    // Initial poll
    poll();

    // Set up interval
    pollingInterval = setInterval(poll, interval);
  };

  const stop = () => {
    if (!isActive) {
      return;
    }
    cleanup();
    onStop?.('manual');
  };

  return {
    start,
    stop,
    isPolling: () => isActive,
    getAttemptCount: () => attemptCount,
  };
}

/**
 * One-time fetch and search for a notification matching the criteria.
 * Useful when you don't need continuous polling.
 * 
 * @example
 * const notification = await findNotification({ searchTerm: 'Welcome' });
 * if (notification) {
 *   console.log('Found:', notification);
 * }
 */
export async function findNotification(
  criteria: NotificationSearchCriteria
): Promise<Notification | null> {
  try {
    const result = await store.dispatch(fetchNotifications());

    if (fetchNotifications.fulfilled.match(result)) {
      const notifications = result.payload.notifications;
      return notifications.find((n) => matchesNotification(n, criteria)) || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Promise-based polling that resolves when a notification is found or rejects on timeout/max attempts.
 * 
 * @example
 * // Wait for research to complete using the token
 * try {
 *   const notification = await waitForNotification(
 *     { token: '50fcec35-ca4e-4909-8339-bb199a8a60c7' },
 *     { timeout: 120000 } // 2 minute timeout
 *   );
 *   console.log('Research completed:', notification.metadata?.contact_name);
 * } catch (error) {
 *   console.log('Research notification not found:', error);
 * }
 * 
 * @example
 * // Wait for campaign creation with specific research_id
 * try {
 *   const notification = await waitForNotification(
 *     { notificationType: 'campaign_completed', researchId: 43 },
 *     { timeout: 60000, interval: 3000 }
 *   );
 *   console.log('Campaign ready:', notification.metadata?.campaign_name);
 * } catch (error) {
 *   console.log('Timed out waiting for campaign');
 * }
 */
export function waitForNotification(
  criteria: NotificationSearchCriteria,
  options: Omit<PollingOptions, 'onFound' | 'onStop'> = {}
): Promise<Notification> {
  return new Promise((resolve, reject) => {
    const controller = createNotificationPoller(criteria, {
      ...options,
      onFound: (notification) => {
        resolve(notification);
      },
      onStop: (reason) => {
        if (reason !== 'found') {
          reject(new Error(`Polling stopped: ${reason}`));
        }
      },
      onError: (error) => {
        controller.stop();
        reject(new Error(error));
      },
    });

    controller.start();
  });
}
