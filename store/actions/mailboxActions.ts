import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import type { AppDispatch } from "../store"

// Fetch all mailboxes
export const fetchMailboxes = createAsyncThunk("mailbox/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mail/mailboxes/")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch mailboxes")
  }
})

// Start Gmail OAuth flow
export const startGmailOAuth = createAsyncThunk("mailbox/gmailOAuthStart", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mail/gmail/start/")
    return response.data.auth_url
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to start Gmail OAuth")
  }
})

// Finish Gmail OAuth flow (exchange code for tokens and add mailbox)
export const finishGmailOAuth = createAsyncThunk("mailbox/gmailOAuthFinish", async (code: string, { rejectWithValue }) => {
  try {
    const response = await api.post("/mail/gmail/finish/", { code })
    return response.data.mailbox
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to finish Gmail OAuth")
  }
})

// Delete a mailbox
export const deleteMailbox = createAsyncThunk("mailbox/delete", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/mail/mailboxes/${id}/`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete mailbox")
  }
})

// Send email using Gmail mailbox
export const sendEmail = createAsyncThunk(
  "mailbox/sendEmail",
  async (
    { 
      type, 
      id, 
      recipient, 
      mailbox_id, 
      mailbox_ids 
    }: { 
      type: string; 
      id: number; 
      recipient: string; 
      mailbox_id?: number;
      mailbox_ids?: number[];
    },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = { type, id, recipient }
      // Support both single mailbox_id and mailbox_ids for backward compatibility
      if (mailbox_ids && mailbox_ids.length > 0) {
        payload.mailbox_ids = mailbox_ids
      } else if (mailbox_id) {
        payload.mailbox_id = mailbox_id
      }
      const response = await api.post("/mail/gmail/send/", payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to send email")
    }
  }
)

// Fetch overall mailbox sending statistics
export const fetchSendingStats = createAsyncThunk(
  "mailbox/fetchSendingStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/mail/mailbox-sending-stats/")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch sending stats")
    }
  }
)

// Fetch detailed statistics for a specific mailbox
export const fetchDetailedStats = createAsyncThunk(
  "mailbox/fetchDetailedStats",
  async (mailboxId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/mailbox-sending-stats/${mailboxId}/`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch detailed stats")
    }
  }
)

// Thunk action creators for dispatching async thunks directly
export const handleFetchMailboxes = () => async (dispatch: AppDispatch) => {
  try {
    const resultAction = await dispatch(fetchMailboxes() as any)
    return fetchMailboxes.fulfilled.match(resultAction)
  } catch (error: any) {
    return false
  }
}

export const handleStartGmailOAuth = () => async (dispatch: AppDispatch) => {
  try {
    const resultAction = await dispatch(startGmailOAuth() as any)
    return startGmailOAuth.fulfilled.match(resultAction)
  } catch (error: any) {
    return false
  }
}