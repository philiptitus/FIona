import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EmailTemplate {
  id: number
  campaign: number
  name: string
  html_content: string
  created_at: string
  updated_at: string
}

interface TemplateState {
  templates: EmailTemplate[]
  currentTemplate: EmailTemplate | null
  isLoading: boolean
  error: string | null
}

const initialState: TemplateState = {
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,
}

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    fetchTemplatesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchTemplatesSuccess: (state, action: PayloadAction<EmailTemplate[]>) => {
      state.isLoading = false
      state.templates = action.payload
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
} = templateSlice.actions

export default templateSlice.reducer
