import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ResearchSummary {
  name: string
  current_role: string
  company: string
  professional_background: string[]
  social_media: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  recent_achievements: string[]
  industry_focus: string
  notable_connections: string
}

export interface GeneratedEmail {
  subject: string
  body: string
}

export interface ResearchResult {
  id: number
  contact_type: "emaillist" | "company"
  contact_id: number
  contact_name: string
  contact_email: string
  research_summary: ResearchSummary | null
  generated_email: GeneratedEmail | null
  career_field: string
  status: "processing" | "completed" | "failed"
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface StartResearchResponse {
  status: string
  token: string
  research_id: number
  message: string
  contact_name: string
  contact_type: "emaillist" | "company"
}

export interface FetchResearchListResponse {
  count: number
  next: string | null
  previous: string | null
  results: ResearchResult[]
}

export interface DeleteResearchResponse {
  success: boolean
  message?: string
  deleted_count?: number
  not_found_ids?: number[]
  not_found_message?: string
  error?: string
}

export interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
  currentPage: number
  totalPages: number
}

interface ResearchState {
  researchResults: ResearchResult[]
  currentResearch: ResearchResult | null
  isLoading: boolean
  isDeleting: boolean
  error: string | null
  deleteError: string | null
  pagination: PaginationInfo
  activeResearchToken: string | null
  activeResearchId: number | null
  lastDeleteResponse: DeleteResearchResponse | null
}

const initialState: ResearchState = {
  researchResults: [],
  currentResearch: null,
  isLoading: false,
  isDeleting: false,
  error: null,
  deleteError: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 0,
  },
  activeResearchToken: null,
  activeResearchId: null,
  lastDeleteResponse: null,
}

const researchSlice = createSlice({
  name: "research",
  initialState,
  reducers: {
    // Start Research
    startResearchStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    startResearchSuccess: (state, action: PayloadAction<StartResearchResponse>) => {
      state.isLoading = false
      state.activeResearchToken = action.payload.token
      state.activeResearchId = action.payload.research_id
      state.error = null
    },
    startResearchFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.activeResearchToken = null
      state.activeResearchId = null
    },

    // Fetch Research List
    fetchResearchListStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchResearchListSuccess: (state, action: PayloadAction<{ data: FetchResearchListResponse; page: number }>) => {
      state.isLoading = false
      state.researchResults = action.payload.data.results
      state.pagination = {
        count: action.payload.data.count,
        next: action.payload.data.next,
        previous: action.payload.data.previous,
        currentPage: action.payload.page,
        totalPages: Math.ceil(action.payload.data.count / 10),
      }
      state.error = null
    },
    fetchResearchListFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Fetch Single Research Result
    fetchResearchResultStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchResearchResultSuccess: (state, action: PayloadAction<ResearchResult>) => {
      state.isLoading = false
      state.currentResearch = action.payload
      // Also update in results list if present
      const index = state.researchResults.findIndex((r) => r.id === action.payload.id)
      if (index !== -1) {
        state.researchResults[index] = action.payload
      }
      state.error = null
    },
    fetchResearchResultFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },

    // Delete Research Results
    deleteResearchStart: (state) => {
      state.isDeleting = true
      state.deleteError = null
      state.lastDeleteResponse = null
    },
    deleteResearchSuccess: (state, action: PayloadAction<{ response: DeleteResearchResponse; requestParams: any }>) => {
      state.isDeleting = false
      state.lastDeleteResponse = action.payload.response
      state.deleteError = null
      
      // Remove successfully deleted items from state
      const { requestParams, response } = action.payload
      
      if (requestParams.delete_all && response.success) {
        // Clear all research results
        state.researchResults = []
        state.currentResearch = null
      } else {
        // Remove specific items
        const idsToRemove: number[] = []
        
        if (requestParams.research_id) {
          idsToRemove.push(requestParams.research_id)
        }
        
        if (requestParams.research_ids) {
          idsToRemove.push(...requestParams.research_ids)
        }
        
        // Only remove items that were actually deleted (not in not_found_ids)
        const actuallyDeleted = idsToRemove.filter(
          (id) => !response.not_found_ids?.includes(id)
        )
        
        state.researchResults = state.researchResults.filter(
          (result) => !actuallyDeleted.includes(result.id)
        )
        
        // Clear current research if it was deleted
        if (state.currentResearch && actuallyDeleted.includes(state.currentResearch.id)) {
          state.currentResearch = null
        }
        
        // Update pagination count
        state.pagination.count = Math.max(0, state.pagination.count - (response.deleted_count || 0))
        state.pagination.totalPages = Math.ceil(state.pagination.count / 10)
      }
    },
    deleteResearchFailure: (state, action: PayloadAction<string>) => {
      state.isDeleting = false
      state.deleteError = action.payload
    },

    // Update research result (useful when polling for completion)
    updateResearchResult: (state, action: PayloadAction<ResearchResult>) => {
      const index = state.researchResults.findIndex((r) => r.id === action.payload.id)
      if (index !== -1) {
        state.researchResults[index] = action.payload
      }
      if (state.currentResearch?.id === action.payload.id) {
        state.currentResearch = action.payload
      }
    },

    // Clear active research tracking
    clearActiveResearch: (state) => {
      state.activeResearchToken = null
      state.activeResearchId = null
    },

    // Clear current research
    clearCurrentResearch: (state) => {
      state.currentResearch = null
    },

    // Reset error
    clearError: (state) => {
      state.error = null
    },

    // Clear delete error
    clearDeleteError: (state) => {
      state.deleteError = null
      state.lastDeleteResponse = null
    },
  },
})

export const {
  startResearchStart,
  startResearchSuccess,
  startResearchFailure,
  fetchResearchListStart,
  fetchResearchListSuccess,
  fetchResearchListFailure,
  fetchResearchResultStart,
  fetchResearchResultSuccess,
  fetchResearchResultFailure,
  deleteResearchStart,
  deleteResearchSuccess,
  deleteResearchFailure,
  updateResearchResult,
  clearActiveResearch,
  clearCurrentResearch,
  clearError,
  clearDeleteError,
} = researchSlice.actions

export default researchSlice.reducer
