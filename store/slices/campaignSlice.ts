import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Campaign {
  id: number
  name: string
  description: string
  attachment?: string
  image?: string
  created_at: string
  updated_at: string
}

interface CampaignState {
  campaigns: Campaign[]
  currentCampaign: Campaign | null
  isLoading: boolean
  error: string | null
}

const initialState: CampaignState = {
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  error: null,
}

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    fetchCampaignsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchCampaignsSuccess: (state, action: PayloadAction<Campaign[]>) => {
      state.isLoading = false
      state.campaigns = action.payload
      state.error = null
    },
    fetchCampaignsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchCampaignStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchCampaignSuccess: (state, action: PayloadAction<Campaign>) => {
      state.isLoading = false
      state.currentCampaign = action.payload
      state.error = null
    },
    fetchCampaignFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createCampaignStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createCampaignSuccess: (state, action: PayloadAction<Campaign>) => {
      state.isLoading = false
      state.campaigns = [...state.campaigns, action.payload]
      state.currentCampaign = action.payload
      state.error = null
    },
    createCampaignFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateCampaignStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateCampaignSuccess: (state, action: PayloadAction<Campaign>) => {
      state.isLoading = false
      state.campaigns = state.campaigns.map((campaign) =>
        campaign.id === action.payload.id ? action.payload : campaign,
      )
      state.currentCampaign = action.payload
      state.error = null
    },
    updateCampaignFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    deleteCampaignStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteCampaignSuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false
      state.campaigns = state.campaigns.filter((campaign) => campaign.id !== action.payload)
      state.currentCampaign = null
      state.error = null
    },
    deleteCampaignFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null
    },
  },
})

export const {
  fetchCampaignsStart,
  fetchCampaignsSuccess,
  fetchCampaignsFailure,
  fetchCampaignStart,
  fetchCampaignSuccess,
  fetchCampaignFailure,
  createCampaignStart,
  createCampaignSuccess,
  createCampaignFailure,
  updateCampaignStart,
  updateCampaignSuccess,
  updateCampaignFailure,
  deleteCampaignStart,
  deleteCampaignSuccess,
  deleteCampaignFailure,
  clearCurrentCampaign,
} = campaignSlice.actions

export default campaignSlice.reducer
