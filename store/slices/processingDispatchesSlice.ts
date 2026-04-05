import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ProcessingDispatch {
  token: string  // UUID from backend - primary correlation key
  dispatch_id: number
  campaign_id: number
  campaign_name: string
  status: "processing" | "scheduled" | "completed" | "failed"
  type: "immediate" | "scheduled"  // Distinguishes immediate sends from scheduled sequences
  started_at: number
  
  // For scheduled sends
  scheduled_date?: string  // ISO date (e.g., "2025-12-20")
  scheduled_datetime?: string  // ISO datetime when first email will send
  
  // Core results from notification
  recipients_count?: number
  success_count?: number
  failure_count?: number
  notification_type?: "campaign_sent" | "campaign_partial" | "campaign_failed" | "sequence_scheduled" | "sequence_schedule_failed"
}

interface ProcessingDispatchesState {
  dispatches: ProcessingDispatch[]
}

const initialState: ProcessingDispatchesState = {
  dispatches: [],
}

const processingDispatchesSlice = createSlice({
  name: "processingDispatches",
  initialState,
  reducers: {
    // Add a new dispatch (immediate or scheduled response)
    addDispatch: (state, action: PayloadAction<ProcessingDispatch>) => {
      state.dispatches.push(action.payload)
    },
    
    // Update dispatch status and results from notification
    updateDispatchStatus: (
      state,
      action: PayloadAction<{
        token: string
        status: "processing" | "scheduled" | "completed" | "failed"
        notification_type?: "campaign_sent" | "campaign_partial" | "campaign_failed" | "sequence_scheduled" | "sequence_schedule_failed"
        success_count?: number
        failure_count?: number
        scheduled_datetime?: string
      }>
    ) => {
      const dispatch = state.dispatches.find((d) => d.token === action.payload.token)
      if (dispatch) {
        dispatch.status = action.payload.status
        if (action.payload.notification_type) {
          dispatch.notification_type = action.payload.notification_type
        }
        if (action.payload.success_count !== undefined) {
          dispatch.success_count = action.payload.success_count
        }
        if (action.payload.failure_count !== undefined) {
          dispatch.failure_count = action.payload.failure_count
        }
        if (action.payload.scheduled_datetime) {
          dispatch.scheduled_datetime = action.payload.scheduled_datetime
        }
      }
    },
    
    // Remove dispatch when complete or dismissed
    removeDispatch: (state, action: PayloadAction<string>) => {
      state.dispatches = state.dispatches.filter((d) => d.token !== action.payload)
    },
    
    // Clear all dispatches
    clearAllDispatches: (state) => {
      state.dispatches = []
    },
  },
})

export const { addDispatch, updateDispatchStatus, removeDispatch, clearAllDispatches } = processingDispatchesSlice.actions

export default processingDispatchesSlice.reducer
