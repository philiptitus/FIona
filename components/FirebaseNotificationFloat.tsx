"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useIsMobile } from "@/hooks/use-mobile"
import { removeFirebaseNotification } from "@/store/slices/firebaseNotificationsSlice"
import type { FirebaseNotification } from "@/store/slices/firebaseNotificationsSlice"
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

  // Show connection status
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 pointer-events-none">
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

      {/* Notifications */}
      {displayedNotifications.map((notification) => (
        <NotificationBubble
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  )
}

interface NotificationBubbleProps {
  notification: FirebaseNotification
  onDismiss: (id: string) => void
}

const NotificationBubble = ({ notification, onDismiss }: NotificationBubbleProps) => {
  console.log("[UI] Rendering NotificationBubble:", notification)

  const getIcon = () => {
    switch (notification.type) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case "error":
        return "bg-red-50 border-red-200"
      case "success":
        return "bg-green-50 border-green-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case "error":
        return "text-red-700"
      case "success":
        return "text-green-700"
      case "info":
      default:
        return "text-blue-700"
    }
  }

  return (
    <div
      className={`pointer-events-auto ${getBgColor()} border rounded-lg p-3 shadow-lg flex gap-3 animate-in fade-in slide-in-from-bottom-4 max-w-sm`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {notification.title}
          </p>
        )}
        <p className={`text-sm ${getTextColor()}`}>{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className={`flex-shrink-0 ${getTextColor()} hover:opacity-70 transition-opacity`}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
