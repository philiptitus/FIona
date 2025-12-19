import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface NeuronExecution {
  id: number
  campaign: number | null
  campaign_name: string | null
  status: "completed" | "failed"
  error_message: string | null
  executed_at: string
  completed_at: string | null
}

export interface Neuron {
  id: number
  workflow: number
  workflow_name: string
  campaign_type: string
  content_preference: "template" | "content" | "both"
  recipient_type: "email" | "company"
  generate_email_lists: boolean
  allow_sequence: boolean
  copies: number
  selected_dynamic_variables: string[]
  selected_links: string[]
  scheduled_time: string
  max_daily_campaigns: number
  is_active: boolean
  last_run_date: string | null
  daily_campaign_count: number
  created_at: string
  updated_at: string
}

interface NeuronState {
  neuron: Neuron | null
  executions: NeuronExecution[]
  isLoading: boolean
  error: string | null
}

const initialState: NeuronState = {
  neuron: null,
  executions: [],
  isLoading: false,
  error: null,
}

const neuronSlice = createSlice({
  name: "neuron",
  initialState,
  reducers: {
    fetchNeuronStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchNeuronSuccess: (state, action: PayloadAction<Neuron>) => {
      state.isLoading = false
      state.neuron = action.payload
      state.error = null
    },
    fetchNeuronFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createNeuronStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createNeuronSuccess: (state, action: PayloadAction<Neuron>) => {
      state.isLoading = false
      state.neuron = action.payload
      state.error = null
    },
    createNeuronFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateNeuronStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateNeuronSuccess: (state, action: PayloadAction<Neuron>) => {
      state.isLoading = false
      state.neuron = action.payload
      state.error = null
    },
    updateNeuronFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    toggleNeuronStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    toggleNeuronSuccess: (state, action: PayloadAction<{ is_active: boolean }>) => {
      state.isLoading = false
      if (state.neuron) {
        state.neuron.is_active = action.payload.is_active
      }
      state.error = null
    },
    toggleNeuronFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    deleteNeuronStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteNeuronSuccess: (state) => {
      state.isLoading = false
      state.neuron = null
      state.executions = []
      state.error = null
    },
    deleteNeuronFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchExecutionsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchExecutionsSuccess: (state, action: PayloadAction<NeuronExecution[]>) => {
      state.isLoading = false
      state.executions = action.payload
      state.error = null
    },
    fetchExecutionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearNeuronError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchNeuronStart,
  fetchNeuronSuccess,
  fetchNeuronFailure,
  createNeuronStart,
  createNeuronSuccess,
  createNeuronFailure,
  updateNeuronStart,
  updateNeuronSuccess,
  updateNeuronFailure,
  toggleNeuronStart,
  toggleNeuronSuccess,
  toggleNeuronFailure,
  deleteNeuronStart,
  deleteNeuronSuccess,
  deleteNeuronFailure,
  fetchExecutionsStart,
  fetchExecutionsSuccess,
  fetchExecutionsFailure,
  clearNeuronError,
} = neuronSlice.actions

export default neuronSlice.reducer