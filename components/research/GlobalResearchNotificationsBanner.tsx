"use client"

import { useResearchNotifications } from "@/hooks/useResearchNotifications"

/**
 * Global component to listen for research completion notifications
 * Automatically shows toasts when research completes or fails
 */
export function GlobalResearchNotificationsBanner() {
  // This hook handles all the notification logic
  useResearchNotifications()

  // This component doesn't render anything - it just listens and shows toasts
  return null
}
