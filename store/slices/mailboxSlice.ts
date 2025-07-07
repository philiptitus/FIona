import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { fetchMailboxes, startGmailOAuth, finishGmailOAuth, deleteMailbox, sendEmail } from "../actions/mailboxActions"

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
  isLoading: boolean
  error: string | null
  gmailAuthUrl: string | null
  sendResult?: any
}

const initialState: MailboxState = {
  mailboxes: [],
  isLoading: false,
  error: null,
  gmailAuthUrl: null,
  sendResult: null,
}

const mailboxSlice = createSlice({
  name: "mailbox",
  initialState,
  reducers: {},
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
  },
})

export type { Mailbox }
export default mailboxSlice.reducer 