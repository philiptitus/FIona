import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useToast } from "@/components/ui/use-toast"
import type { RootState, AppDispatch } from "@/store/store"

/**
 * Hook to listen for research completion notifications
 * Monitors for research_complete_success and research_complete_failed notifications
 * Shows toast with option to navigate to research list
 */
export function useResearchNotifications() {
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  const { notifications } = useSelector((state: RootState) => state.notifications)
  const [processedNotifications, setProcessedNotifications] = useState<Set<number>>(new Set())

  const handleResearchNotification = useCallback(
    (notification: any) => {
      if (notification.notification_type === "research_complete_success") {
        const researchId = notification.metadata?.research_id
        const contactName = notification.metadata?.contact_name || "Contact"

        toast({
          title: "✨ Research Complete!",
          description: `Personalized research and email generated for ${contactName}.`,
          action: {
            label: "View Results",
            onClick: () => {
              window.location.href = "/research"
            },
          },
          duration: 10000,
        })
      } else if (notification.notification_type === "research_complete_failed") {
        const contactName = notification.metadata?.contact_name || "Contact"
        const error = notification.metadata?.error || "Unknown error"

        toast({
          title: "Research Failed",
          description: `Could not generate research for ${contactName}. ${error}`,
          variant: "destructive",
          duration: 10000,
        })
      }
    },
    [toast]
  )

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      notifications.forEach((notification) => {
        if (
          !processedNotifications.has(notification.id) &&
          (notification.notification_type === "research_complete_success" ||
            notification.notification_type === "research_complete_failed")
        ) {
          handleResearchNotification(notification)
          setProcessedNotifications((prev) => new Set([...prev, notification.id]))
        }
      })
    }
  }, [notifications, processedNotifications, handleResearchNotification])
}
