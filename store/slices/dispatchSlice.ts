import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EmailDispatch {
  id: number
  campaign: number
  template: number
  content: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

interface DispatchState {
  dispatches: EmailDispatch[]
  currentDispatch: EmailDispatch | null
  scheduledEmails: any[]
  scheduledPagination: { count: number; next: string | null; previous: string | null; page: number }
  isLoading: boolean
  error: string | null
  isSending: boolean
  sendError: string | null
  lastSendResult: any | null
}

const initialState: DispatchState = {
  dispatches: [],
  currentDispatch: null,
  scheduledEmails: [],
  scheduledPagination: { count: 0, next: null, previous: null, page: 1 },
  isLoading: false,
  error: null,
  isSending: false,
  sendError: null,
  lastSendResult: null,
}

const dispatchSlice = createSlice({
  name: "dispatches",
  initialState,
  reducers: {
    fetchDispatchesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchScheduledStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchScheduledSuccess: (state, action: PayloadAction<{ data: any; page: number }>) => {
      state.isLoading = false
      // DRF pagination returns { results, count, next, previous }
      const payload = action.payload.data
      const results = payload.results || []
      if (action.payload.page && action.payload.page > 1) {
        // append for subsequent pages
        state.scheduledEmails = [...state.scheduledEmails, ...results]
      } else {
        state.scheduledEmails = results
      }
      state.scheduledPagination = { count: payload.count || 0, next: payload.next || null, previous: payload.previous || null, page: action.payload.page }
      state.error = null
    },
    fetchScheduledFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchDispatchesSuccess: (state, action: PayloadAction<EmailDispatch[]>) => {
      state.isLoading = false
      state.dispatches = action.payload
      state.error = null
    },
    fetchDispatchesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchDispatchStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchDispatchSuccess: (state, action: PayloadAction<EmailDispatch>) => {
      state.isLoading = false
      state.currentDispatch = action.payload
      state.error = null
    },
    fetchDispatchFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createDispatchStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createDispatchSuccess: (state, action: PayloadAction<EmailDispatch>) => {
      state.isLoading = false
      state.dispatches = [...state.dispatches, action.payload]
      state.currentDispatch = action.payload
      state.error = null
    },
    createDispatchFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    verifyDispatchStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    verifyDispatchSuccess: (state, action: PayloadAction<EmailDispatch>) => {
      state.isLoading = false
      state.dispatches = state.dispatches.map((dispatch) =>
        dispatch.id === action.payload.id ? action.payload : dispatch,
      )
      state.currentDispatch = action.payload
      state.error = null
    },
    verifyDispatchFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    sendDispatchStart: (state) => {
      state.isSending = true
      state.sendError = null
      state.lastSendResult = null
    },
    sendDispatchSuccess: (state, action: PayloadAction<any>) => {
      state.isSending = false
      state.sendError = null
      state.lastSendResult = action.payload
    },
    sendDispatchFailure: (state, action: PayloadAction<string>) => {
      state.isSending = false
      state.sendError = action.payload
      state.lastSendResult = null
    },
    clearCurrentDispatch: (state) => {
      state.currentDispatch = null
    },
    clearSendResult: (state) => {
      state.lastSendResult = null
      state.sendError = null
    },
  },
})

export const {
  fetchDispatchesStart,
  fetchDispatchesSuccess,
  fetchDispatchesFailure,
  fetchScheduledStart,
  fetchScheduledSuccess,
  fetchScheduledFailure,
  fetchDispatchStart,
  fetchDispatchSuccess,
  fetchDispatchFailure,
  createDispatchStart,
  createDispatchSuccess,
  createDispatchFailure,
  verifyDispatchStart,
  verifyDispatchSuccess,
  verifyDispatchFailure,
  sendDispatchStart,
  sendDispatchSuccess,
  sendDispatchFailure,
  clearCurrentDispatch,
  clearSendResult,
} = dispatchSlice.actions

export default dispatchSlice.reducer
