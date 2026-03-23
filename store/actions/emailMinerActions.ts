import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import { AppDispatch, RootState } from "@/store/store"
import { updateMiningStatus } from "@/store/slices/emailMinerSlice"

interface EmailMinerUploadParams {
  file: File
  campaignId?: number
  label?: string
  checkUserDuplicates?: boolean
}

interface EmailMinerResponse {
  code: string
  status: string
  token: string
  message: string
  filename: string
}

/**
 * Upload CSV file for email mining
 * Returns a token for tracking the async operation
 */
export const uploadEmailMinerCSV = createAsyncThunk<
  EmailMinerResponse,
  EmailMinerUploadParams,
  { rejectWithValue: boolean }
>(
  "emailMiner/uploadCSV",
  async ({ file, campaignId, label, checkUserDuplicates }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      if (campaignId !== undefined) {
        formData.append("campaign_id", campaignId.toString())
      }
      
      if (label !== undefined) {
        formData.append("label", label)
      }
      
      if (checkUserDuplicates !== undefined) {
        formData.append("check_user_duplicates", checkUserDuplicates.toString())
      }

      const response = await api.post<EmailMinerResponse>("/mail/email-miner/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to upload CSV file"
      )
    }
  }
)

/**
 * Poll for email miner operation status
 * Uses the token provided after initial upload
 */
export const pollEmailMinerStatus = (token: string, maxAttempts: number = 200) => // 10 minutes with 3s interval
  async (dispatch: AppDispatch, getState: () => RootState) => {
    let attempts = 0
    const pollInterval = setInterval(async () => {
      attempts++

      try {
        // Check notifications for completion
        await dispatch(checkEmailMinerNotifications(token) as any)

        // Check if mining is completed
        const state = getState()
        const miningSession = state.emailMiner.sessions[token]

        if (miningSession && miningSession.status !== "processing") {
          clearInterval(pollInterval)
          return
        }

        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          dispatch(updateMiningSessionStatus({ token, status: "failed" }))
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error("Error polling email miner status:", error)
      }
    }, 3000) // Poll every 3 seconds
  }

/**
 * Check notifications for email miner completion
 */
export const checkEmailMinerNotifications = (token: string) => 
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const response = await api.get("/mail/notifications/")
      const notifications = response.data.notifications || response.data.results || response.data || []

      // Look for email miner related notifications
      const successNotification = notifications.find(
        (n: any) =>
          n.notification_type === "email_mining_complete" &&
          n.metadata?.token === token
      )

      const failureNotification = notifications.find(
        (n: any) =>
          n.notification_type === "email_mining_failed" &&
          n.metadata?.token === token
      )

      if (successNotification) {
        dispatch(updateMiningSessionStatus({ 
          token, 
          status: "completed",
          completedAt: Date.now(),
          companiesCount: successNotification.metadata?.companies_count || 0,
          emailsCount: successNotification.metadata?.emails_count || 0,
          duplicatesSkipped: successNotification.metadata?.duplicates_skipped || 0
        }))
      } else if (failureNotification) {
        dispatch(updateMiningSessionStatus({ 
          token, 
          status: "failed",
          completedAt: Date.now(),
          error: failureNotification.metadata?.error || "Email mining failed"
        }))
      }
    } catch (error) {
      console.error("Error checking email miner notifications:", error)
    }
  }

/**
 * Update mining session status in state
 */
export const updateMiningSessionStatus = (payload: any) => (dispatch: AppDispatch) => {
  dispatch(updateMiningStatus(payload))
}
