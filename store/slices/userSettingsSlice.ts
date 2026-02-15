import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface UserSettings {
  id: number
  user: number
  default_email_word_limit: number
  default_template_word_limit: number
  sequence_initial: number
  sequence_followup: number
  sequence_final: number
  created_at: string
  updated_at: string
}

interface UserSettingsState {
  settings: UserSettings | null
  isLoading: boolean
  error: string | null
}

const initialState: UserSettingsState = {
  settings: null,
  isLoading: false,
  error: null,
}

const userSettingsSlice = createSlice({
  name: "userSettings",
  initialState,
  reducers: {
    fetchUserSettingsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchUserSettingsSuccess: (state, action: PayloadAction<UserSettings>) => {
      state.isLoading = false
      state.settings = action.payload
      state.error = null
    },
    fetchUserSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateUserSettingsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateUserSettingsSuccess: (state, action: PayloadAction<UserSettings>) => {
      state.isLoading = false
      state.settings = action.payload
      state.error = null
    },
    updateUserSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearUserSettingsError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchUserSettingsStart,
  fetchUserSettingsSuccess,
  fetchUserSettingsFailure,
  updateUserSettingsStart,
  updateUserSettingsSuccess,
  updateUserSettingsFailure,
  clearUserSettingsError,
} = userSettingsSlice.actions

export default userSettingsSlice.reducer
