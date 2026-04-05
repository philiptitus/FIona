import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Campaign {
  id: number
  name: string
  description: string
  attachment?: string
  image?: string
  created_at: string
  updated_at: string
  is_sequence?: boolean
  campaign_type?: string
  content_preference?: string
  recipient_type?: "email" | "company"
  copies?: number
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Campaign[]
}

interface CampaignState {
  campaigns: Campaign[]
  currentCampaign: Campaign | null
  isLoading: boolean
  error: string | null
  pagination: {
    count: number
    next: string | null
    previous: string | null
    currentPage: number
    totalPages: number
  }
  searchQuery: string
  recipientTypeFilter: "all" | "email" | "company"
  pageSize: number
  isScheduledFilter: boolean | null
  isFinishedFilter: boolean | null
  isResearchFilter: boolean | null
}

const initialState: CampaignState = {
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 0,
  },
  searchQuery: "",
  recipientTypeFilter: "all",
  pageSize: 10,
  isScheduledFilter: null,
  isFinishedFilter: null,
  isResearchFilter: null,
}

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    fetchCampaignsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchCampaignsSuccess: (state, action: PayloadAction<PaginatedResponse>) => {
      state.isLoading = false
      state.campaigns = action.payload.results
      state.pagination = {
        count: action.payload.count,
        next: action.payload.next,
        previous: action.payload.previous,
        currentPage: state.pagination.currentPage,
        totalPages: Math.ceil(action.payload.count / state.pageSize),
      }
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
    createSmartCampaignStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createSmartCampaignSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.error = null
    },
    createSmartCampaignFailure: (state, action: PayloadAction<string>) => {
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
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.pagination.currentPage = 1 // Reset to first page when searching
    },
    setRecipientTypeFilter: (state, action: PayloadAction<"all" | "email" | "company">) => {
      state.recipientTypeFilter = action.payload
      state.pagination.currentPage = 1 // Reset to first page when filtering
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
      state.pagination.currentPage = 1 // Reset to first page when changing page size
    },
    setIsScheduledFilter: (state, action: PayloadAction<boolean | null>) => {
      state.isScheduledFilter = action.payload
      state.pagination.currentPage = 1 // Reset to first page when filtering
    },
    setIsFinishedFilter: (state, action: PayloadAction<boolean | null>) => {
      state.isFinishedFilter = action.payload
      state.pagination.currentPage = 1 // Reset to first page when filtering
    },
    setIsResearchFilter: (state, action: PayloadAction<boolean | null>) => {
      state.isResearchFilter = action.payload
      state.pagination.currentPage = 1 // Reset to first page when filtering
    },
    resetFilters: (state) => {
      state.pageSize = 10
      state.isScheduledFilter = null
      state.isFinishedFilter = null
      state.isResearchFilter = null
      state.recipientTypeFilter = "all"
      state.searchQuery = ""
      state.pagination.currentPage = 1
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
  createSmartCampaignStart,
  createSmartCampaignSuccess,
  createSmartCampaignFailure,
  updateCampaignStart,
  updateCampaignSuccess,
  updateCampaignFailure,
  deleteCampaignStart,
  deleteCampaignSuccess,
  deleteCampaignFailure,
  clearCurrentCampaign,
  setCurrentPage,
  setSearchQuery,
  setRecipientTypeFilter,
  setPageSize,
  setIsScheduledFilter,
  setIsFinishedFilter,
  setIsResearchFilter,
  resetFilters,
} = campaignSlice.actions

export default campaignSlice.reducer
