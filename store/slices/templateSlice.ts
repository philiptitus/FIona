import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EmailTemplate {
  id: number
  campaign: number
  name: string
  html_content: string
  created_at: string
  updated_at: string
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface TemplateState {
  templates: EmailTemplate[]
  currentTemplate: EmailTemplate | null
  isLoading: boolean
  error: string | null
  pagination: PaginationState
  searchQuery: string
}

const initialState: TemplateState = {
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  searchQuery: ''
}

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    fetchTemplatesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchTemplatesSuccess: (state, action: PayloadAction<{ results: EmailTemplate[]; count?: number }>) => {
      state.isLoading = false
      // Handle both array response (backward compatible) and paginated response
      if (Array.isArray(action.payload)) {
        state.templates = action.payload
      } else {
        state.templates = action.payload.results || []
        if (action.payload.count !== undefined) {
          state.pagination.totalItems = action.payload.count
          state.pagination.totalPages = Math.ceil(action.payload.count / state.pagination.itemsPerPage)
        }
      }
      state.error = null
    },
    fetchTemplatesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchTemplateStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchTemplateSuccess: (state, action: PayloadAction<EmailTemplate>) => {
      state.isLoading = false
      state.currentTemplate = action.payload
      state.error = null
    },
    fetchTemplateFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createTemplateStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createTemplateSuccess: (state, action: PayloadAction<EmailTemplate>) => {
      state.isLoading = false
      state.templates = [...state.templates, action.payload]
      state.currentTemplate = action.payload
      state.error = null
    },
    createTemplateFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateTemplateStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateTemplateSuccess: (state, action: PayloadAction<EmailTemplate>) => {
      state.isLoading = false
      state.templates = state.templates.map((template) =>
        template.id === action.payload.id ? action.payload : template,
      )
      state.currentTemplate = action.payload
      state.error = null
    },
    updateTemplateFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    deleteTemplateStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteTemplateSuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false
      state.templates = state.templates.filter((template) => template.id !== action.payload)
      if (state.currentTemplate && state.currentTemplate.id === action.payload) {
        state.currentTemplate = null
      }
      state.error = null
    },
    deleteTemplateFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkDeleteTemplatesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkDeleteTemplatesSuccess: (state, action: PayloadAction<number[]>) => {
      state.isLoading = false
      state.templates = state.templates.filter((template) => !action.payload.includes(template.id))
      if (state.currentTemplate && action.payload.includes(state.currentTemplate.id)) {
        state.currentTemplate = null
      }
      state.error = null
    },
    bulkDeleteTemplatesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.pagination.currentPage = 1 // Reset to first page on new search
    },
  },
})

export const {
  fetchTemplatesStart,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
  fetchTemplateStart,
  fetchTemplateSuccess,
  fetchTemplateFailure,
  createTemplateStart,
  createTemplateSuccess,
  createTemplateFailure,
  updateTemplateStart,
  updateTemplateSuccess,
  updateTemplateFailure,
  deleteTemplateStart,
  deleteTemplateSuccess,
  deleteTemplateFailure,
  bulkDeleteTemplatesStart,
  bulkDeleteTemplatesSuccess,
  bulkDeleteTemplatesFailure,
  clearCurrentTemplate,
  setCurrentPage,
  setSearchQuery,
} = templateSlice.actions

export default templateSlice.reducer