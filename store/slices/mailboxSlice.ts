import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { 
  fetchMailboxes, 
  startGmailOAuth, 
  finishGmailOAuth, 
  deleteMailbox, 
  sendEmail, 
  fetchSendingStats, 
  fetchDetailedStats,
  fetchMailboxInbox,
  fetchMailboxLabels,
  fetchMessageDetails,
  fetchThreadDetails,
  fetchMailboxProfile
} from "../actions/mailboxActions"

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

interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet?: string
  subject?: string
  from?: string
  date?: string
  payload?: any
  sizeEstimate?: number
  historyId?: string
  internalDate?: string
}

interface GmailLabel {
  id: string
  name: string
  messageListVisibility: string
  labelListVisibility: string
  type: string
}

interface MailboxInbox {
  messages: GmailMessage[]
  nextPageToken?: string
  total: number
  mailbox: string
}

interface MailboxLabels {
  labels: GmailLabel[]
  mailbox: string
  total: number
}

interface MessageDetails {
  message: GmailMessage
  mailbox: string
}

interface ThreadDetails {
  thread: {
    id: string
    historyId: string
    messages: GmailMessage[]
  }
  mailbox: string
  message_count: number
}

interface MailboxProfile {
  email: string
  messages_total: number
  threads_total: number
  history_id: string
  mailbox_linked_at: string
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
  inbox?: MailboxInbox
  labels?: MailboxLabels
  currentMessage?: MessageDetails
  currentThread?: ThreadDetails
  mailboxProfile?: MailboxProfile
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
  inbox: undefined,
  labels: undefined,
  currentMessage: undefined,
  currentThread: undefined,
  mailboxProfile: undefined,
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
      // fetchMailboxInbox
      .addCase(fetchMailboxInbox.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMailboxInbox.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.inbox = action.payload
      })
      .addCase(fetchMailboxInbox.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.inbox = undefined
      })
      // fetchMailboxLabels
      .addCase(fetchMailboxLabels.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMailboxLabels.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.labels = action.payload
      })
      .addCase(fetchMailboxLabels.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.labels = undefined
      })
      // fetchMessageDetails
      .addCase(fetchMessageDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessageDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.currentMessage = action.payload
      })
      .addCase(fetchMessageDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.currentMessage = undefined
      })
      // fetchThreadDetails
      .addCase(fetchThreadDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchThreadDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.currentThread = action.payload
      })
      .addCase(fetchThreadDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.currentThread = undefined
      })
      // fetchMailboxProfile
      .addCase(fetchMailboxProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMailboxProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.mailboxProfile = action.payload
      })
      .addCase(fetchMailboxProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.mailboxProfile = undefined
      })
  },
})

export const { setSelectedMailboxes, toggleMailboxSelection, clearSelectedMailboxes } = mailboxSlice.actions
export type { 
  Mailbox, 
  GmailMessage, 
  GmailLabel, 
  MailboxInbox, 
  MailboxLabels, 
  MessageDetails, 
  ThreadDetails, 
  MailboxProfile 
}
export default mailboxSlice.reducer