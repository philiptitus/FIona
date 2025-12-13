import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ProcessingDispatch {
  id: number
  campaignId: number
  token: string
  status: "processing" | "scheduled" | "completed" | "failed"
  startedAt: number
  completedAt?: number
  mailboxIds: number[]
  dispatchType: "content" | "template"
  isScheduled?: boolean
  scheduleDay?: string
  recipientsCount?: number
  // For normal sequences: notification metadata
  successCount?: number
  failureCount?: number
  totalRecipients?: number
  notificationType?: "campaign_sent" | "campaign_partial" | "campaign_failed"
}

interface ProcessingDispatchesState {
  dispatches: Record<number, ProcessingDispatch> // keyed by campaignId
  isLoading: boolean
}

const initialState: ProcessingDispatchesState = {
  dispatches: {},
  isLoading: false,
}

const processingDispatchesSlice = createSlice({
  name: "processingDispatches",
  initialState,
  reducers: {
    addDispatch: (state, action: PayloadAction<ProcessingDispatch>) => {
      state.dispatches[action.payload.token] = action.payload
    },
    updateDispatchStatus: (
      state,
      action: PayloadAction<{ campaignId: number; status: "processing" | "scheduled" | "completed" | "failed"; completedAt?: number }>
    ) => {
      if (state.dispatches[action.payload.campaignId]) {
        state.dispatches[action.payload.campaignId].status = action.payload.status
        if (action.payload.completedAt) {
          state.dispatches[action.payload.campaignId].completedAt = action.payload.completedAt
        }
      }
    },
    removeDispatch: (state, action: PayloadAction<number>) => {
      delete state.dispatches[action.payload]
    },
    clearAllDispatches: (state) => {
      state.dispatches = {}
    },
  },
})

export const { addDispatch, updateDispatchStatus, removeDispatch, clearAllDispatches } = processingDispatchesSlice.actions

export const selectDispatchesByStatus = (status: "processing" | "completed" | "failed") => (state: any) =>
  Object.values(state.processingDispatches.dispatches).filter((d: ProcessingDispatch) => d.status === status)

export const selectProcessingDispatch = (campaignId: number) => (state: any) => state.processingDispatches.dispatches[campaignId]

export const selectAllDispatches = (state: any) => Object.values(state.processingDispatches.dispatches) as ProcessingDispatch[]

export default processingDispatchesSlice.reducer
