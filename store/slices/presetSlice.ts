import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EmailSendingPreset {
  id: number
  user: number
  mailbox_ids: number[]
  content_type: string
  is_scheduled: boolean
  scheduled_date: string | null
  updated_at: string
}

interface PresetState {
  currentPreset: EmailSendingPreset | null
  isLoading: boolean
  error: string | null
}

const initialState: PresetState = {
  currentPreset: null,
  isLoading: false,
  error: null,
}

const presetSlice = createSlice({
  name: "preset",
  initialState,
  reducers: {
    fetchPresetStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchPresetSuccess: (state, action: PayloadAction<EmailSendingPreset>) => {
      state.isLoading = false
      state.currentPreset = action.payload
      state.error = null
    },
    fetchPresetFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updatePresetStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updatePresetSuccess: (state, action: PayloadAction<EmailSendingPreset>) => {
      state.isLoading = false
      state.currentPreset = action.payload
      state.error = null
    },
    updatePresetFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearPresetError: (state) => {
      state.error = null
    },
    resetPreset: (state) => {
      state.currentPreset = null
      state.isLoading = false
      state.error = null
    },
  },
})

export const {
  fetchPresetStart,
  fetchPresetSuccess,
  fetchPresetFailure,
  updatePresetStart,
  updatePresetSuccess,
  updatePresetFailure,
  clearPresetError,
  resetPreset,
} = presetSlice.actions

export default presetSlice.reducer
export type { EmailSendingPreset, PresetState }
