import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

/**
 * Poll a research's status to check if async processing is complete
 */
export const pollResearchStatus = createAsyncThunk(
  "processingResearches/pollStatus",
  async (researchId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/research/research/${researchId}/`)
      return {
        researchId,
        research: response.data,
        timestamp: Date.now(),
      }
    } catch (error: any) {
      return rejectWithValue({
        researchId,
        error: error.response?.data?.error || "Failed to poll research status",
      })
    }
  }
)

/**
 * Check for research-related notifications
 */
export const checkResearchNotifications = createAsyncThunk(
  "processingResearches/checkNotifications",
  async (researchId: number, { rejectWithValue }) => {
    try {
      const response = await api.get("/mail/notifications/")
      const notifications = response.data.notifications || []
      
      // Look for notifications related to this research
      const researchNotification = notifications.find(
        (n: any) =>
          n.metadata?.research_id === researchId &&
          (n.notification_type === "research_complete_success" ||
            n.notification_type === "research_complete_failed")
      )
      
      return {
        researchId,
        notification: researchNotification,
        timestamp: Date.now(),
      }
    } catch (error: any) {
      return rejectWithValue({
        researchId,
        error: error.response?.data?.error || "Failed to check notifications",
      })
    }
  }
)
