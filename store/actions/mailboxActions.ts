import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import type { AppDispatch } from "../store"

// ============ TYPE DEFINITIONS ============

export interface GmailMessageBasic {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  snippet: string
  labelIds: string[]
  internalDate: string
}

export interface BounceSummary {
  bounceEmailsDetected: number
  invalidAddressesDeleted: number
}

export interface MailboxInboxResponse {
  messages: GmailMessageBasic[]
  nextPageToken: string | null
  total: number
  mailbox: string
  bounceSummary: BounceSummary
}

export interface MailboxProfile {
  email: string
  messagesTotal: number
  threadsTotal: number
  historyId: string
  mailboxLinkedAt: string
}

// All Mailboxes API Types
export interface AllMailboxesMessage {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  snippet: string
  internalDate: string
  labelIds: string[]
  mailbox_id: number
  mailbox_email: string
}

export interface MailboxSummary {
  mailbox_id: number
  email: string
  message_count: number
  total: number
  next_page_token: string | null
}

export interface FailedMailbox {
  mailbox_id: number
  email: string
  error: string
}

export interface AsyncLoadResponse {
  message: string
  token: string
  status: string
  mailbox_count: number
}

export interface AllMailboxesCacheFilters {
  from?: string
  subject?: string
  sender_domain?: string
  mailbox_id?: number
  date_from?: string
  date_to?: string
  snippet_contains?: string
  label_id?: string[]
  exclude_label_id?: string[]
  has_attachments?: boolean
  unread_only?: boolean
  min_snippet_length?: number
  search?: string
  thread_id?: string
  sort_by?: "date" | "from" | "subject"
  sort_order?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface AllMailboxesCacheResponse {
  messages: AllMailboxesMessage[]
  page: number
  limit: number
  total_messages: number
  total_after_filters: number
  mailbox_count: number
  has_next: boolean
  cached_at: string
  filters_applied: Record<string, any>
  inboxes_summary: MailboxSummary[]
  failed_mailboxes: FailedMailbox[]
}

// ============ ASYNC THUNKS ============
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

// Fetch mailbox inbox with pagination
export const fetchMailboxInbox = createAsyncThunk(
  "mailbox/fetchInbox",
  async (
    { 
      mailboxId, 
      limit = 10, 
      pageToken 
    }: { 
      mailboxId: number
      limit?: number
      pageToken?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams()
      params.append("limit", limit.toString())
      if (pageToken) {
        params.append("page_token", pageToken)
      }
      const response = await api.get(`/mail/mailboxes/${mailboxId}/inbox/?${params.toString()}`)
      
      // Transform snake_case to camelCase for consistent frontend usage
      return {
        messages: response.data.messages || [],
        nextPageToken: response.data.next_page_token || null,
        total: response.data.total || 0,
        mailbox: response.data.mailbox || "",
        bounceSummary: {
          bounceEmailsDetected: response.data.bounce_summary?.bounce_emails_detected || 0,
          invalidAddressesDeleted: response.data.bounce_summary?.invalid_addresses_deleted || 0,
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch inbox")
    }
  }
)

// Fetch mailbox labels
export const fetchMailboxLabels = createAsyncThunk(
  "mailbox/fetchLabels",
  async (mailboxId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/mailboxes/${mailboxId}/labels/`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch labels")
    }
  }
)

// Fetch message details
export const fetchMessageDetails = createAsyncThunk(
  "mailbox/fetchMessage",
  async (
    { mailboxId, messageId }: { mailboxId: number; messageId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/mail/mailboxes/${mailboxId}/message/${messageId}/`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch message details")
    }
  }
)

// Fetch thread details
export const fetchThreadDetails = createAsyncThunk(
  "mailbox/fetchThread",
  async (
    { mailboxId, threadId }: { mailboxId: number; threadId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/mail/mailboxes/${mailboxId}/thread/${threadId}/`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch thread details")
    }
  }
)

// Fetch mailbox profile
export const fetchMailboxProfile = createAsyncThunk(
  "mailbox/fetchProfile",
  async (mailboxId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/mailboxes/${mailboxId}/profile/`)
      
      // Transform snake_case to camelCase
      return {
        email: response.data.email || "",
        messagesTotal: response.data.messages_total || 0,
        threadsTotal: response.data.threads_total || 0,
        historyId: response.data.history_id || "",
        mailboxLinkedAt: response.data.mailbox_linked_at || "",
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch mailbox profile")
    }
  }
)

// Trigger async load for all mailboxes (returns 202 ACCEPTED with token)
export const triggerAllMailboxesLoad = createAsyncThunk(
  "mailbox/triggerAllMailboxesLoad",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/mail/mailboxes/all-inboxes/")
      return response.data as AsyncLoadResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to trigger all mailboxes load")
    }
  }
)

// Fetch all mailboxes from cache with optional filters
export const fetchAllMailboxesFromCache = createAsyncThunk(
  "mailbox/fetchAllMailboxesFromCache",
  async (filters: AllMailboxesCacheFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append("from_cache", "true")

      // Add optional filters
      if (filters.from) params.append("from", filters.from)
      if (filters.subject) params.append("subject", filters.subject)
      if (filters.sender_domain) params.append("sender_domain", filters.sender_domain)
      if (filters.mailbox_id) params.append("mailbox_id", filters.mailbox_id.toString())
      if (filters.date_from) params.append("date_from", filters.date_from)
      if (filters.date_to) params.append("date_to", filters.date_to)
      if (filters.snippet_contains) params.append("snippet_contains", filters.snippet_contains)
      if (filters.thread_id) params.append("thread_id", filters.thread_id)
      if (filters.search) params.append("search", filters.search)
      
      // Handle repeating parameters for labels
      if (filters.label_id && filters.label_id.length > 0) {
        filters.label_id.forEach(label => params.append("label_id", label))
      }
      if (filters.exclude_label_id && filters.exclude_label_id.length > 0) {
        filters.exclude_label_id.forEach(label => params.append("exclude_label_id", label))
      }

      // Handle boolean filters
      if (filters.has_attachments !== undefined) {
        params.append("has_attachments", filters.has_attachments.toString())
      }
      if (filters.unread_only !== undefined) {
        params.append("unread_only", filters.unread_only.toString())
      }
      if (filters.min_snippet_length) {
        params.append("min_snippet_length", filters.min_snippet_length.toString())
      }

      // Handle sorting
      if (filters.sort_by) params.append("sort_by", filters.sort_by)
      if (filters.sort_order) params.append("sort_order", filters.sort_order)

      // Handle pagination
      if (filters.page) params.append("page", filters.page.toString())
      if (filters.limit) params.append("limit", filters.limit.toString())

      const response = await api.get(`/mail/mailboxes/all-inboxes/?${params.toString()}`)
      return response.data as AllMailboxesCacheResponse
    } catch (error: any) {
      // If 404, cache miss - return specific error
      if (error.response?.status === 404) {
        return rejectWithValue("Cache miss - inboxes not loaded yet. Please trigger load first.")
      }
      return rejectWithValue(error.response?.data?.error || "Failed to fetch all mailboxes from cache")
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