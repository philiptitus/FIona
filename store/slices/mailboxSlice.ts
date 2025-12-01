import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { fetchMailboxes, startGmailOAuth, finishGmailOAuth, deleteMailbox, sendEmail, fetchSendingStats, fetchDetailedStats } from "../actions/mailboxActions"

interface Mailbox {
  id: number
  email: string
  provider: string
  access_token?: string
  refresh_token?: string
  token_expiry?: string
  created_at: string
  updated_at: string
}

interface MailboxState {
  mailboxes: Mailbox[]
  selectedMailboxes: number[]
  isLoading: boolean
  error: string | null
  gmailAuthUrl: string | null
  sendResult?: any
  sendingStats?: {
    total: number
    date: string
    mailbox_count: number
    by_mailbox: Array<{
      mailbox__email: string
      mailbox__id: number
      count: number
      success: number
      failed: number
    }>
  }
  detailedStats?: {
    mailbox: string
    total: number
    success: number
    failed: number
    by_status: Array<{
      status: string
      count: number
    }>
    campaigns: Array<{
      dispatch__campaign__name: string
    }>
    date: string
  }
}

const initialState: MailboxState = {
  mailboxes: [],
  selectedMailboxes: [],
  isLoading: false,
  error: null,
  gmailAuthUrl: null,
  sendResult: null,
  sendingStats: undefined,
  detailedStats: undefined,
}

const mailboxSlice = createSlice({
  name: "mailbox",
  initialState,
  reducers: {
    setSelectedMailboxes: (state, action: PayloadAction<number[]>) => {
      state.selectedMailboxes = action.payload
    },
    toggleMailboxSelection: (state, action: PayloadAction<number>) => {
      const index = state.selectedMailboxes.indexOf(action.payload)
      if (index === -1) {
        state.selectedMailboxes.push(action.payload)
      } else {
        state.selectedMailboxes.splice(index, 1)
      }
    },
    clearSelectedMailboxes: (state) => {
      state.selectedMailboxes = []
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMailboxes
      .addCase(fetchMailboxes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMailboxes.fulfilled, (state, action) => {
        state.isLoading = false
        state.mailboxes = action.payload
        state.error = null
      })
      .addCase(fetchMailboxes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // startGmailOAuth
      .addCase(startGmailOAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.gmailAuthUrl = null
      })
      .addCase(startGmailOAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.gmailAuthUrl = action.payload
      })
      .addCase(startGmailOAuth.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // finishGmailOAuth
      .addCase(finishGmailOAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(finishGmailOAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        // Add or update the mailbox in the mailboxes array
        const mailbox = action.payload
        const idx = state.mailboxes.findIndex((mb) => mb.id === mailbox.id)
        if (idx !== -1) {
          state.mailboxes[idx] = mailbox
        } else {
          state.mailboxes.push(mailbox)
        }
      })
      .addCase(finishGmailOAuth.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // deleteMailbox
      .addCase(deleteMailbox.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMailbox.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        // Remove the mailbox from the mailboxes array
        state.mailboxes = state.mailboxes.filter((mb) => mb.id !== action.payload)
      })
      .addCase(deleteMailbox.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // sendEmail
      .addCase(sendEmail.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.sendResult = null
      })
      .addCase(sendEmail.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.sendResult = action.payload
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.sendResult = { error: action.payload }
      })
      // fetchSendingStats
      .addCase(fetchSendingStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSendingStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.sendingStats = action.payload
      })
      .addCase(fetchSendingStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.sendingStats = undefined
      })
      // fetchDetailedStats
      .addCase(fetchDetailedStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDetailedStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.detailedStats = action.payload
      })
      .addCase(fetchDetailedStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.detailedStats = undefined
      })
  },
})

export const { setSelectedMailboxes, toggleMailboxSelection, clearSelectedMailboxes } = mailboxSlice.actions
export type { Mailbox }
export default mailboxSlice.reducer