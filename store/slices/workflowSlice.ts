import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Workflow {
  id: number
  name: string
  prompt: string
  findleads: boolean
  attachment_suggestion: boolean
  created_at: string
  updated_at: string
}

export interface FetchWorkflowsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Workflow[]
}

interface WorkflowState {
  workflows: Workflow[]
  selectedWorkflow: Workflow | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
}

const initialState: WorkflowState = {
  workflows: [],
  selectedWorkflow: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
}

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    fetchWorkflowsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchWorkflowsSuccess: (state, action: PayloadAction<{ workflows: Workflow[]; totalCount: number; page: number }>) => {
      state.isLoading = false
      state.workflows = action.payload.workflows
      state.totalCount = action.payload.totalCount
      state.currentPage = action.payload.page
      state.error = null
    },
    fetchWorkflowsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setSelectedWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.selectedWorkflow = action.payload
    },
    clearSelectedWorkflow: (state) => {
      state.selectedWorkflow = null
    },
    addWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflows.unshift(action.payload)
      state.totalCount += 1
    },
    updateWorkflowInList: (state, action: PayloadAction<Workflow>) => {
      const index = state.workflows.findIndex((w) => w.id === action.payload.id)
      if (index !== -1) {
        state.workflows[index] = action.payload
      }
      if (state.selectedWorkflow?.id === action.payload.id) {
        state.selectedWorkflow = action.payload
      }
    },
    removeWorkflow: (state, action: PayloadAction<number>) => {
      state.workflows = state.workflows.filter((w) => w.id !== action.payload)
      state.totalCount -= 1
      if (state.selectedWorkflow?.id === action.payload) {
        state.selectedWorkflow = null
      }
    },
    removeMultipleWorkflows: (state, action: PayloadAction<number[]>) => {
      const idsToRemove = new Set(action.payload)
      state.workflows = state.workflows.filter((w) => !idsToRemove.has(w.id))
      state.totalCount -= action.payload.length
      if (state.selectedWorkflow && idsToRemove.has(state.selectedWorkflow.id)) {
        state.selectedWorkflow = null
      }
    },
  },
})

export const {
  fetchWorkflowsStart,
  fetchWorkflowsSuccess,
  fetchWorkflowsFailure,
  setSelectedWorkflow,
  clearSelectedWorkflow,
  addWorkflow,
  updateWorkflowInList,
  removeWorkflow,
  removeMultipleWorkflows,
} = workflowSlice.actions

export default workflowSlice.reducer
