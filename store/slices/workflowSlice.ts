import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Workflow {
  id: number
  name: string
  prompt: string
  findleads: boolean
  attachment_suggestion: boolean
  created_at: string
  updated_at: string
}

interface WorkflowState {
  workflows: Workflow[]
  selectedWorkflow: Workflow | null
  isLoading: boolean
  error: string | null
}

const initialState: WorkflowState = {
  workflows: [],
  selectedWorkflow: null,
  isLoading: false,
  error: null,
}

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    fetchWorkflowsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchWorkflowsSuccess: (state, action: PayloadAction<Workflow[]>) => {
      state.isLoading = false
      state.workflows = action.payload
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
  },
})

export const { fetchWorkflowsStart, fetchWorkflowsSuccess, fetchWorkflowsFailure, setSelectedWorkflow, clearSelectedWorkflow } = workflowSlice.actions

export default workflowSlice.reducer
