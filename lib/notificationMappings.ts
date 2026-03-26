/**
 * Notification Type Mappings & Actions
 * 
 * Maps notification types to their UI actions, colors based on priority,
 * and any metadata fields needed for routing/display.
 */

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface NotificationActionConfig {
  buttonLabel?: string
  onAction?: (router: AppRouterInstance, metadata?: Record<string, any>) => void
  colorClass: string
}

/**
 * Get priority-based color styling
 */
export const getPriorityColor = (priority?: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 border-red-200'
    case 'high':
      return 'bg-orange-50 border-orange-200'
    case 'medium':
      return 'bg-amber-50 border-amber-200'
    case 'low':
    default:
      return 'bg-blue-50 border-blue-200'
  }
}

export const getPriorityTextColor = (priority?: string): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-700'
    case 'high':
      return 'text-orange-700'
    case 'medium':
      return 'text-amber-700'
    case 'low':
    default:
      return 'text-blue-700'
  }
}

export const getPriorityIconColor = (priority?: string): string => {
  switch (priority) {
    case 'urgent':
      return 'text-red-500'
    case 'high':
      return 'text-orange-500'
    case 'medium':
      return 'text-amber-500'
    case 'low':
    default:
      return 'text-blue-500'
  }
}

/**
 * Notification type mapping — defines actions and styling per type
 * Add new types here; only campaign_completed is wired up for now.
 */
export const notificationMappings: Record<string, (metadata?: Record<string, any>) => Partial<NotificationActionConfig>> = {
  /**
   * Smart Campaign Creation Complete
   * Action: Navigate to campaign detail page to view the newly created campaign
   */
  campaign_completed: (metadata?: Record<string, any>) => {
    const campaignId = metadata?.campaign_id || metadata?.campaignId
    return {
      buttonLabel: 'View Campaign',
      onAction: (router: AppRouterInstance) => {
        if (campaignId) {
          router.push(`/campaigns/${campaignId}`)
        }
      },
    }
  },

  /**
   * Campaign Failed / Error During Generation
   * Action: Retry campaign generation — navigate to smart campaign creation page
   * Note: Not wired up yet; structure ready for implementation
   */
  campaign_failed: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: 'Retry',
      onAction: undefined, // TODO: implement when needed
    }
  },

  error: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: 'Retry',
      onAction: undefined, // TODO: implement when needed
    }
  },

  /**
   * Email Successfully Sent
   * Action: None (informational only)
   * Note: Not wired up yet
   */
  campaign_sent: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: undefined,
      onAction: undefined,
    }
  },

  /**
   * Email Sending Failed
   * Action: Retry or view details (not wired up yet)
   * Note: Not wired up yet; structure ready for implementation
   */
  email_failed: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: undefined,
      onAction: undefined, // TODO: implement when needed
    }
  },

  /**
   * Email Mining Completed
   * Action: Navigate to email mining results page (if applicable)
   * Note: Not wired up yet; structure ready for implementation
   */
  email_mining_complete: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: undefined,
      onAction: undefined, // TODO: implement when needed
    }
  },

  /**
   * Research Completed Successfully
   * Action: Navigate to research page with highlight_id query param
   * Backend sends green glow effect for 5 seconds on the completed card
   * Metadata: research_id
   */
  research_complete_success: (metadata?: Record<string, any>) => {
    const researchId = metadata?.research_id || metadata?.researchId
    return {
      buttonLabel: 'View Research',
      onAction: (router: AppRouterInstance) => {
        if (researchId) {
          router.push(`/research?highlight_id=${researchId}`)
        } else {
          router.push('/research')
        }
      },
    }
  },

  /**
   * Bulk Research Completed
   * Action: Navigate to research page which auto-refreshes and shows all completed items
   * Metadata: research_ids (array), success_count, failed_count, batch_token
   */
  bulk_research_completed: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: 'View All',
      onAction: (router: AppRouterInstance) => {
        router.push('/research')
      },
    }
  },

  /**
   * Research Completed and Campaign Generated
   * Action: Navigate to campaign detail page
   * Metadata: campaign_id
   * Note: Not wired up yet; structure ready for implementation
   */
  research_and_campaign_complete: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: undefined,
      onAction: undefined, // TODO: implement when needed
    }
  },

  /**
   * Immediate Email Sending Triggered
   * Action: None (informational only)
   * Note: Not wired up yet; structure ready for implementation
   */
  email_sending_immediate: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: undefined,
      onAction: undefined,
    }
  },

  /**
   * Email Scheduling Confirmed
   * Action: None (informational only)
   * Note: Not wired up yet; structure ready for implementation
   */
  email_scheduled: (metadata?: Record<string, any>) => {
    return {
      buttonLabel: undefined,
      onAction: undefined,
    }
  },
}

/**
 * Get notification action config by type
 * Returns action, button label, and any routing logic
 */
export const getNotificationAction = (
  notificationType?: string,
  metadata?: Record<string, any>
): Partial<NotificationActionConfig> => {
  if (!notificationType) return {}

  const mapper = notificationMappings[notificationType]
  if (mapper) {
    return mapper(metadata)
  }

  // Default: no action
  return {}
}
