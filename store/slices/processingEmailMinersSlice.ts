import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface ProcessingEmailMiner {
  token: string
  name: string
  status: "processing" | "completed" | "failed"
  startedAt: number
  campaignId?: number | string
  campaignName?: string
  createdCount?: number
  duplicatesCount?: number
  errorsCount?: number
}

interface ProcessingEmailMinersState {
  miners: ProcessingEmailMiner[]
}

const initialState: ProcessingEmailMinersState = {
  miners: [],
}

export const processingEmailMinersSlice = createSlice({
  name: "processingEmailMiners",
  initialState,
  reducers: {
    addProcessingEmailMiner: (state, action: PayloadAction<ProcessingEmailMiner>) => {
      state.miners.push(action.payload)
    },
    
    updateEmailMinerStatus: (
      state,
      action: PayloadAction<{
        token: string
        status: "processing" | "completed" | "failed"
        createdCount?: number
        duplicatesCount?: number
        errorsCount?: number
      }>
    ) => {
      const miner = state.miners.find((m) => m.token === action.payload.token)
      if (miner) {
        miner.status = action.payload.status
        if (action.payload.createdCount !== undefined) miner.createdCount = action.payload.createdCount
        if (action.payload.duplicatesCount !== undefined) miner.duplicatesCount = action.payload.duplicatesCount
        if (action.payload.errorsCount !== undefined) miner.errorsCount = action.payload.errorsCount
      }
    },

    removeProcessingEmailMiner: (state, action: PayloadAction<string>) => {
      state.miners = state.miners.filter((m) => m.token !== action.payload)
    },

    clearCompletedEmailMiners: (state) => {
      state.miners = state.miners.filter((m) => m.status === "processing")
    },
  },
})

export const {
  addProcessingEmailMiner,
  updateEmailMinerStatus,
  removeProcessingEmailMiner,
  clearCompletedEmailMiners,
} = processingEmailMinersSlice.actions

export default processingEmailMinersSlice.reducer
