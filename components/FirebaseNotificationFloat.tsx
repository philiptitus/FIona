"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { removeFirebaseNotification } from "@/store/slices/firebaseNotificationsSlice"
import type { FirebaseNotification } from "@/store/slices/firebaseNotificationsSlice"
import { getNotificationAction, getPriorityColor, getPriorityTextColor, getPriorityIconColor } from "@/lib/notificationMappings"
import { X, AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react"

export const FirebaseNotificationFloat = () => {
  const dispatch = useDispatch()
  const isMobile = useIsMobile()
  const firebaseAuthStatus = useSelector((state: any) => state.firebaseAuth?.status)
  const firebaseAuthError = useSelector((state: any) => state.firebaseAuth?.error)
  const notifications = useSelector((state: any) => state.firebaseNotifications?.notifications || [])
  const [displayedNotifications, setDisplayedNotifications] = useState<FirebaseNotification[]>([])

  // Only show on desktop
  if (isMobile) return null

  // Auto-dismiss notifications after 10 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    displayedNotifications.forEach((notification) => {
      const timer = setTimeout(() => {
        handleDismiss(notification.id)
      }, 10000)
      timers.push(timer)
    })
    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [displayedNotifications])

  // Sync displayed notifications with Redux notifications
  useEffect(() => {
    setDisplayedNotifications(notifications.slice(0, 3)) // Show max 3 notifications
  }, [notifications])

  const handleDismiss = (id: string) => {
    setDisplayedNotifications((prev) => prev.filter((n) => n.id !== id))
    dispatch(removeFirebaseNotification(id))
  }

  // Show notifications at top-right (high z-index), connection status at bottom-right
  return (
    <>
      {/* Semi-transparent backdrop to ensure notifications are always visible */}
      {displayedNotifications.length > 0 && (
        <div className="fixed inset-0 z-[9998] pointer-events-none" />
      )}

      {/* Notifications at top-right, layered above all UI */}
      <div className="fixed top-6 right-6 flex flex-col gap-3 pointer-events-none z-[9999]">
        {displayedNotifications.map((notification) => (
          <NotificationBubble
            key={notification.id}
            notification={notification}
            onDismiss={handleDismiss}
          />
        ))}
      </div>

      {/* Connection Status at bottom-right */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 pointer-events-none z-50">
        {/* Connection Status Indicator */}
        {firebaseAuthStatus === "connecting" && (
          <div className="pointer-events-auto bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg flex items-center gap-3 max-w-xs">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
            <span className="text-sm text-blue-700">Connecting notifications...</span>
          </div>
        )}

        {firebaseAuthStatus === "connected" && !firebaseAuthError && (
          <div className="pointer-events-auto bg-green-50 border border-green-200 rounded-lg p-2 shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-700">Firebase Connected</span>
          </div>
        )}

        {firebaseAuthStatus === "error" && firebaseAuthError && (
          <div className="pointer-events-auto bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg flex items-center gap-3 max-w-xs">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Connection Error</p>
              <p className="text-xs text-red-600">{firebaseAuthError}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

interface NotificationBubbleProps {
  notification: FirebaseNotification
  onDismiss: (id: string) => void
}

const NotificationBubble = ({ notification, onDismiss }: NotificationBubbleProps) => {
  const router = useRouter()
  console.log("[UI] Rendering NotificationBubble:", notification)

  // Get priority-based styling
  const bgColor = getPriorityColor(notification.priority)
  const textColor = getPriorityTextColor(notification.priority)
  const iconColor = getPriorityIconColor(notification.priority)

  // Get action from mapping
  const actionConfig = getNotificationAction(notification.type, notification.metadata)

  const getIcon = () => {
    // Default icon based on priority
    switch (notification.priority) {
      case "urgent":
        return <AlertCircle className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      case "high":
      case "medium":
        return <Info className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
      case "low":
      default:
        return <CheckCircle2 className={`w-5 h-5 ${iconColor} flex-shrink-0`} />
    }
  }

  return (
    <div
      className={`pointer-events-auto ${bgColor} border rounded-lg p-4 shadow-2xl flex gap-3 animate-in fade-in slide-in-from-top-4 max-w-sm opacity-100 backdrop-blur-md`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className={`text-sm font-bold ${textColor} mb-1`}>
            {notification.title}
          </p>
        )}
        <p className={`text-sm ${textColor} opacity-90`}>{notification.message}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {/* Action button from mapping */}
        {actionConfig.buttonLabel && actionConfig.onAction && (
          <button
            onClick={() => {
              actionConfig.onAction?.(router, notification.metadata)
              onDismiss(notification.id)
            }}
            className={`text-xs font-medium ${textColor} hover:opacity-70 transition-opacity whitespace-nowrap`}
          >
            {actionConfig.buttonLabel}
          </button>
        )}
        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(notification.id)}
          className={`${textColor} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
