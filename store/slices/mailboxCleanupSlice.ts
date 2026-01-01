import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface MailboxCleanupSettings {
  enable_mailbox_cleanup: boolean
  cleanup_scheduled_time: string | null
}

interface MailboxCleanupState {
  settings: MailboxCleanupSettings | null
  isLoading: boolean
  error: string | null
}

const initialState: MailboxCleanupState = {
  settings: null,
  isLoading: false,
  error: null,
}

const mailboxCleanupSlice = createSlice({
  name: "mailboxCleanup",
  initialState,
  reducers: {
    fetchSettingsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchSettingsSuccess: (state, action: PayloadAction<MailboxCleanupSettings>) => {
      state.isLoading = false
      state.settings = action.payload
      state.error = null
    },
    fetchSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateSettingsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateSettingsSuccess: (state, action: PayloadAction<MailboxCleanupSettings>) => {
      state.isLoading = false
      state.settings = action.payload
      state.error = null
    },
    updateSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsFailure,
  clearError,
} = mailboxCleanupSlice.actions

export default mailboxCleanupSlice.reducer