import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { uploadEmailMinerCSV } from "@/store/actions/emailMinerActions"

export interface MiningSession {
  token: string
  filename: string
  campaignId?: number
  label?: string
  status: "processing" | "completed" | "failed"
  startedAt: number
  completedAt?: number
  companiesCount?: number
  emailsCount?: number
  duplicatesSkipped?: number
  error?: string
}

export interface EmailMinerState {
  sessions: Record<string, MiningSession>
  isProcessing: boolean
}

const initialState: EmailMinerState = {
  sessions: {},
  isProcessing: false,
}

const emailMinerSlice = createSlice({
  name: "emailMiner",
  initialState,
  reducers: {
    updateMiningStatus(
      state,
      action: PayloadAction<{
        token: string
        status: "processing" | "completed" | "failed"
        completedAt?: number
        companiesCount?: number
        emailsCount?: number
        duplicatesSkipped?: number
        error?: string
      }>
    ) {
      const { token, ...updates } = action.payload
      if (state.sessions[token]) {
        Object.assign(state.sessions[token], updates)
      }

      // Update isProcessing based on any active sessions
      state.isProcessing = Object.values(state.sessions).some(
        (session) => session.status === "processing"
      )
    },

    removeMiningSession(state, action: PayloadAction<string>) {
      delete state.sessions[action.payload]
      state.isProcessing = Object.values(state.sessions).some(
        (session) => session.status === "processing"
      )
    },

    clearCompletedSessions(state) {
      Object.keys(state.sessions).forEach((token) => {
        if (state.sessions[token].status !== "processing") {
          delete state.sessions[token]
        }
      })
    },
  },

  extraReducers: (builder) => {
    builder.addCase(uploadEmailMinerCSV.fulfilled, (state, action) => {
      const session: MiningSession = {
        token: action.payload.token,
        filename: action.payload.filename,
        status: "processing",
        startedAt: Date.now(),
      }
      state.sessions[action.payload.token] = session
      state.isProcessing = true
    })

    builder.addCase(uploadEmailMinerCSV.rejected, (state) => {
      state.isProcessing = Object.values(state.sessions).some(
        (session) => session.status === "processing"
      )
    })
  },
})

export const { updateMiningStatus, removeMiningSession, clearCompletedSessions } =
  emailMinerSlice.actions

export default emailMinerSlice.reducer
