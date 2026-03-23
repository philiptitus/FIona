"use client"

import { useFirebaseNotifications } from "@/hooks/useFirebaseNotifications"
import { FirebaseNotificationFloat } from "@/components/FirebaseNotificationFloat"

/**
 * Client component that initializes Firebase notifications globally
 * and displays the floating notification UI
 */
export default function FirebaseNotificationsProvider() {
  // Initialize Firebase notifications
  useFirebaseNotifications()

  return <FirebaseNotificationFloat />
}
