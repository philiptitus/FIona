import { addDispatch, updateDispatchStatus, removeDispatch } from "../slices/processingDispatchesSlice"
import type { AppDispatch, RootState } from "../store"
import api from "@/lib/api"

/**
 * Polls the dispatch status and checks for completion notifications
 */
export const pollDispatchStatus = (campaignId: number, maxAttempts: number = 36) => // 3 minutes with 5s interval
  async (dispatch: AppDispatch, getState: () => RootState) => {
    let attempts = 0
    const pollInterval = setInterval(async () => {
      attempts++

      try {
        // Check notifications for completion
        await dispatch(checkDispatchNotifications(campaignId) as any)

        // Check if dispatch is completed
        const state = getState()
        const processingDispatch = state.processingDispatches.dispatches[campaignId]

        if (processingDispatch && processingDispatch.status !== "processing") {
          clearInterval(pollInterval)
          return
        }

        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          dispatch(updateDispatchStatus({ campaignId, status: "failed" }))
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error("Error polling dispatch status:", error)
      }
    }, 5000) // Poll every 5 seconds
  }

/**
 * Check notifications for dispatch completion or failure
 * Handles both scheduled sequences and normal sequences
 */
export const checkDispatchNotifications = (campaignId: number) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const response = await api.get("/mail/notifications/")
    const notifications = response.data.notifications || response.data.results || response.data || []

    // Get current dispatch to check if it's scheduled or normal
    const state = getState()
    const processingDispatch = state.processingDispatches.dispatches[campaignId]
    const isScheduled = processingDispatch?.status === "scheduled"

    if (isScheduled) {
      // SCHEDULED SEQUENCES: Look for sequence_scheduled or sequence_schedule_failed
      const completionNotification = notifications.find(
        (n: any) =>
          n.notification_type === "sequence_scheduled" &&
          n.metadata?.campaign_id === campaignId
      )

      const failureNotification = notifications.find(
        (n: any) =>
          n.notification_type === "sequence_schedule_failed" &&
          n.metadata?.campaign_id === campaignId
      )

      if (completionNotification) {
        dispatch(updateDispatchStatus({ campaignId, status: "completed", completedAt: Date.now() }))
      } else if (failureNotification) {
        dispatch(updateDispatchStatus({ campaignId, status: "failed", completedAt: Date.now() }))
      }
    } else {
      // NORMAL SEQUENCES: Look for campaign_sent, campaign_partial, or campaign_failed
      const successNotification = notifications.find(
        (n: any) =>
          n.notification_type === "campaign_sent" &&
          n.metadata?.campaign_id === campaignId
      )

      const partialNotification = notifications.find(
        (n: any) =>
          n.notification_type === "campaign_partial" &&
          n.metadata?.campaign_id === campaignId
      )

      const failureNotification = notifications.find(
        (n: any) =>
          n.notification_type === "campaign_failed" &&
          n.metadata?.campaign_id === campaignId
      )

      if (successNotification || partialNotification) {
        // Both success and partial are considered "completed" - the banner will show success
        dispatch(updateDispatchStatus({ campaignId, status: "completed", completedAt: Date.now() }))
      } else if (failureNotification) {
        dispatch(updateDispatchStatus({ campaignId, status: "failed", completedAt: Date.now() }))
      }
    }
  } catch (error) {
    console.error("Error checking notifications:", error)
  }
}
