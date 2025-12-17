import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface ProcessingResearch {
  researchId: number
  contactId: number
  contactType: "emaillist" | "company"
  contactName: string
  token: string
  status: "processing" | "completed" | "failed"
  startedAt: number
  lastPolled: number
  retryCount: number
}

interface ProcessingResearchesState {
  researches: ProcessingResearch[]
  isPolling: boolean
}

const initialState: ProcessingResearchesState = {
  researches: [],
  isPolling: false,
}

const processingResearchesSlice = createSlice({
  name: "processingResearches",
  initialState,
  reducers: {
    addProcessingResearch(state, action: PayloadAction<ProcessingResearch>) {
      // Prevent duplicates
      const exists = state.researches.find(r => r.researchId === action.payload.researchId)
      if (!exists) {
        state.researches.push(action.payload)
        state.isPolling = true
      }
    },
    updateResearchStatus(
      state,
      action: PayloadAction<{ researchId: number; status: "processing" | "completed" | "failed"; lastPolled: number }>
    ) {
      const research = state.researches.find(r => r.researchId === action.payload.researchId)
      if (research) {
        research.status = action.payload.status
        research.lastPolled = action.payload.lastPolled
      }
    },
    incrementRetryCount(state, action: PayloadAction<number>) {
      const research = state.researches.find(r => r.researchId === action.payload)
      if (research) {
        research.retryCount += 1
      }
    },
    removeProcessingResearch(state, action: PayloadAction<number>) {
      state.researches = state.researches.filter(r => r.researchId !== action.payload)
      if (state.researches.length === 0) {
        state.isPolling = false
      }
    },
    clearCompletedResearches(state) {
      state.researches = state.researches.filter(r => r.status === "processing")
      if (state.researches.length === 0) {
        state.isPolling = false
      }
    },
    clearAllProcessingResearches(state) {
      state.researches = []
      state.isPolling = false
    },
  },
})

export const {
  addProcessingResearch,
  updateResearchStatus,
  incrementRetryCount,
  removeProcessingResearch,
  clearCompletedResearches,
  clearAllProcessingResearches,
} = processingResearchesSlice.actions

export default processingResearchesSlice.reducer
