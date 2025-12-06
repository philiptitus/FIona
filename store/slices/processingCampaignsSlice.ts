import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface ProcessingCampaign {
  campaignId: number
  token: string
  name: string
  status: "processing" | "completed" | "failed"
  startedAt: number
  lastPolled: number
  retryCount: number
}

interface ProcessingCampaignsState {
  campaigns: ProcessingCampaign[]
  isPolling: boolean
}

const initialState: ProcessingCampaignsState = {
  campaigns: [],
  isPolling: false,
}

const processingCampaignsSlice = createSlice({
  name: "processingCampaigns",
  initialState,
  reducers: {
    addProcessingCampaign(state, action: PayloadAction<ProcessingCampaign>) {
      // Prevent duplicates
      const exists = state.campaigns.find(c => c.campaignId === action.payload.campaignId)
      if (!exists) {
        state.campaigns.push(action.payload)
        state.isPolling = true
      }
    },
    updateCampaignStatus(
      state,
      action: PayloadAction<{ campaignId: number; status: "processing" | "completed" | "failed"; lastPolled: number }>
    ) {
      const campaign = state.campaigns.find(c => c.campaignId === action.payload.campaignId)
      if (campaign) {
        campaign.status = action.payload.status
        campaign.lastPolled = action.payload.lastPolled
      }
    },
    incrementRetryCount(state, action: PayloadAction<number>) {
      const campaign = state.campaigns.find(c => c.campaignId === action.payload)
      if (campaign) {
        campaign.retryCount += 1
      }
    },
    removeProcessingCampaign(state, action: PayloadAction<number>) {
      state.campaigns = state.campaigns.filter(c => c.campaignId !== action.payload)
      if (state.campaigns.length === 0) {
        state.isPolling = false
      }
    },
    clearCompletedCampaigns(state) {
      state.campaigns = state.campaigns.filter(c => c.status === "processing")
      if (state.campaigns.length === 0) {
        state.isPolling = false
      }
    },
    clearAllProcessingCampaigns(state) {
      state.campaigns = []
      state.isPolling = false
    },
  },
})

export const {
  addProcessingCampaign,
  updateCampaignStatus,
  incrementRetryCount,
  removeProcessingCampaign,
  clearCompletedCampaigns,
  clearAllProcessingCampaigns,
} = processingCampaignsSlice.actions

export default processingCampaignsSlice.reducer
