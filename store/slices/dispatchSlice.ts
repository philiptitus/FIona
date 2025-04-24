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
  isLoading: boolean
  error: string | null
}

const initialState: DispatchState = {
  dispatches: [],
  currentDispatch: null,
  isLoading: false,
  error: null,
}

const dispatchSlice = createSlice({
  name: "dispatches",
  initialState,
  reducers: {
    fetchDispatchesStart: (state) => {
      state.isLoading = true
      state.error = null
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
      state.isLoading = true
      state.error = null
    },
    sendDispatchSuccess: (state) => {
      state.isLoading = false
      state.error = null
    },
    sendDispatchFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearCurrentDispatch: (state) => {
      state.currentDispatch = null
    },
  },
})

export const {
  fetchDispatchesStart,
  fetchDispatchesSuccess,
  fetchDispatchesFailure,
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
} = dispatchSlice.actions

export default dispatchSlice.reducer
