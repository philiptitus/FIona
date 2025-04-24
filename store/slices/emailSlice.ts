import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EmailListEntry {
  id: number
  campaign: number
  organization_name: string
  email: string
  context?: string
  is_sent: boolean
  created_at: string
  updated_at: string
}

interface EmailState {
  emails: EmailListEntry[]
  sentEmails: EmailListEntry[]
  isLoading: boolean
  error: string | null
}

const initialState: EmailState = {
  emails: [],
  sentEmails: [],
  isLoading: false,
  error: null,
}

const emailSlice = createSlice({
  name: "emails",
  initialState,
  reducers: {
    fetchEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchEmailsSuccess: (state, action: PayloadAction<EmailListEntry[]>) => {
      state.isLoading = false
      state.emails = action.payload
      state.error = null
    },
    fetchEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchSentEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchSentEmailsSuccess: (state, action: PayloadAction<EmailListEntry[]>) => {
      state.isLoading = false
      state.sentEmails = action.payload
      state.error = null
    },
    fetchSentEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createEmailStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createEmailSuccess: (state, action: PayloadAction<EmailListEntry>) => {
      state.isLoading = false
      state.emails = [...state.emails, action.payload]
      state.error = null
    },
    createEmailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkCreateEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkCreateEmailsSuccess: (state, action: PayloadAction<EmailListEntry[]>) => {
      state.isLoading = false
      state.emails = [...state.emails, ...action.payload]
      state.error = null
    },
    bulkCreateEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateEmailStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateEmailSuccess: (state, action: PayloadAction<EmailListEntry>) => {
      state.isLoading = false
      state.emails = state.emails.map((email) => (email.id === action.payload.id ? action.payload : email))
      state.error = null
    },
    updateEmailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    deleteEmailStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteEmailSuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false
      state.emails = state.emails.filter((email) => email.id !== action.payload)
      state.error = null
    },
    deleteEmailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkDeleteEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkDeleteEmailsSuccess: (state, action: PayloadAction<number[]>) => {
      state.isLoading = false
      state.emails = state.emails.filter((email) => !action.payload.includes(email.id))
      state.error = null
    },
    bulkDeleteEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
  },
})

export const {
  fetchEmailsStart,
  fetchEmailsSuccess,
  fetchEmailsFailure,
  fetchSentEmailsStart,
  fetchSentEmailsSuccess,
  fetchSentEmailsFailure,
  createEmailStart,
  createEmailSuccess,
  createEmailFailure,
  bulkCreateEmailsStart,
  bulkCreateEmailsSuccess,
  bulkCreateEmailsFailure,
  updateEmailStart,
  updateEmailSuccess,
  updateEmailFailure,
  deleteEmailStart,
  deleteEmailSuccess,
  deleteEmailFailure,
  bulkDeleteEmailsStart,
  bulkDeleteEmailsSuccess,
  bulkDeleteEmailsFailure,
} = emailSlice.actions

export default emailSlice.reducer
