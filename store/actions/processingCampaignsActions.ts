import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

/**
 * Poll a campaign's status to check if async processing is complete
 */
export const pollCampaignStatus = createAsyncThunk(
  "processingCampaigns/pollStatus",
  async (campaignId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/campaigns/${campaignId}/`)
      return {
        campaignId,
        campaign: response.data,
        timestamp: Date.now(),
      }
    } catch (error: any) {
      return rejectWithValue({
        campaignId,
        error: error.response?.data?.error || "Failed to poll campaign status",
      })
    }
  }
)

/**
 * Check for campaign-related notifications
 */
export const checkCampaignNotifications = createAsyncThunk(
  "processingCampaigns/checkNotifications",
  async (campaignId: number, { rejectWithValue }) => {
    try {
      const response = await api.get("/mail/notifications/")
      const notifications = response.data.notifications || []
      
      // Look for notifications related to this campaign
      const campaignNotification = notifications.find(
        (n: any) =>
          n.metadata?.campaign_id === campaignId &&
          (n.title === "Campaign Created Successfully" ||
            n.title === "Campaign Creation Failed")
      )
      
      return {
        campaignId,
        notification: campaignNotification,
        timestamp: Date.now(),
      }
    } catch (error: any) {
      return rejectWithValue({
        campaignId,
        error: error.response?.data?.error || "Failed to check notifications",
      })
    }
  }
)
