import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type FirebaseConnectStatus = "idle" | "connecting" | "connected" | "error"

export interface FirebaseAuthState {
  status: FirebaseConnectStatus
  error: string | null
  userId: string | null
}

const initialState: FirebaseAuthState = {
  status: "idle",
  error: null,
  userId: null,
}

const firebaseAuthSlice = createSlice({
  name: "firebaseAuth",
  initialState,
  reducers: {
    setConnecting(state) {
      state.status = "connecting"
      state.error = null
    },
    setConnected(state, action: PayloadAction<string>) {
      state.status = "connected"
      state.error = null
      state.userId = action.payload
    },
    setError(state, action: PayloadAction<string>) {
      state.status = "error"
      state.error = action.payload
    },
    reset(state) {
      state.status = "idle"
      state.error = null
      state.userId = null
    },
  },
})

export const { setConnecting, setConnected, setError, reset } = firebaseAuthSlice.actions
export default firebaseAuthSlice.reducer
