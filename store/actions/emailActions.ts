import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
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
  smartCreateEmailsStart,
  smartCreateEmailsSuccess,
  smartCreateEmailsFailure,
} from "../slices/emailSlice"
import type { AppDispatch } from "../store"

// Fetch emails for a campaign
export const fetchEmails = createAsyncThunk("emails/fetchAll", async (campaignId?: number, { rejectWithValue }) => {
  try {
    let url = "/mail/emails/"
    if (campaignId) {
      url += `?campaign_id=${campaignId}`
    }
    const response = await api.get(url)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch emails")
  }
})

// Fetch sent emails
export const fetchSentEmails = createAsyncThunk(
  "emails/fetchSent",
  async (
    { campaignId, search, page, pageSize }: { campaignId?: number; search?: string; page?: number; pageSize?: number },
    { rejectWithValue },
  ) => {
    try {
      let url = "/mail/emails/sent/"
      const params = new URLSearchParams()

      if (campaignId) params.append("campaign_id", campaignId.toString())
      if (search) params.append("search", search)
      if (page) params.append("page", page.toString())
      if (pageSize) params.append("page_size", pageSize.toString())

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await api.get(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch sent emails")
    }
  },
)

// Create a new email entry
export const createEmail = createAsyncThunk(
  "emails/create",
  async (
    emailData: { campaign: number; organization_name: string; email: string; context?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post("/mail/emails/", emailData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create email")
    }
  },
)

// Bulk create email entries
export const bulkCreateEmails = createAsyncThunk(
  "emails/bulkCreate",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/emails/bulk-create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create emails")
    }
  },
)

// Update an email entry
export const updateEmail = createAsyncThunk(
  "emails/update",
  async (
    {
      id,
      emailData,
    }: {
      id: number
      emailData: Partial<import("../slices/emailSlice").EmailListEntry>
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/mail/emails/${id}/`, emailData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update email")
    }
  },
)

// Delete an email entry
export const deleteEmail = createAsyncThunk("emails/delete", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/mail/emails/${id}/`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete email")
  }
})

// Bulk delete email entries
export const bulkDeleteEmails = createAsyncThunk(
  "emails/bulkDelete",
  async ({ campaignId, emailIds }: { campaignId: number; emailIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/emails/bulk-delete/", {
        campaign_id: campaignId,
        email_ids: emailIds,
      })
      return { ids: emailIds, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete emails")
    }
  },
)

// Create email entries via smart campaign (AI)
export const createSmartCampaignEmails = createAsyncThunk(
  "emails/smartCreate",
  async (smartCampaignData: any, { rejectWithValue }) => {
    try {
      // Corrected endpoint for smart campaign
      const response = await api.post("/mail/campaigns/smart/", smartCampaignData)
      return response.data.created_emails || response.data.emails || response.data // adapt to backend response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create emails via smart campaign")
    }
  },
)

export const handleSmartCreateEmails = (smartCampaignData: any) => async (dispatch: AppDispatch) => {
  dispatch(smartCreateEmailsStart())
  try {
    const resultAction = await dispatch(createSmartCampaignEmails(smartCampaignData))
    if (createSmartCampaignEmails.fulfilled.match(resultAction)) {
      dispatch(smartCreateEmailsSuccess(resultAction.payload))
      return resultAction.payload
    } else {
      dispatch(smartCreateEmailsFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(smartCreateEmailsFailure(error.message || "Failed to create emails via smart campaign"))
    return false
  }
}

// Thunk action creators for dispatching regular actions
export const handleFetchEmails = (campaignId?: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchEmailsStart())
  try {
    const resultAction = await dispatch(fetchEmails(campaignId))
    if (fetchEmails.fulfilled.match(resultAction)) {
      dispatch(fetchEmailsSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchEmailsFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchEmailsFailure(error.message || "Failed to fetch emails"))
    return false
  }
}

export const handleFetchSentEmails =
  ({
    campaignId,
    search,
    page,
    pageSize,
  }: { campaignId?: number; search?: string; page?: number; pageSize?: number }) =>
  async (dispatch: AppDispatch) => {
    dispatch(fetchSentEmailsStart())
    try {
      const resultAction = await dispatch(fetchSentEmails({ campaignId, search, page, pageSize }))
      if (fetchSentEmails.fulfilled.match(resultAction)) {
        dispatch(fetchSentEmailsSuccess(resultAction.payload))
        return true
      } else {
        dispatch(fetchSentEmailsFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(fetchSentEmailsFailure(error.message || "Failed to fetch sent emails"))
      return false
    }
  }

export const handleCreateEmail =
  (emailData: { campaign: number; organization_name: string; email: string; context?: string }) =>
  async (dispatch: AppDispatch) => {
    dispatch(createEmailStart())
    try {
      const resultAction = await dispatch(createEmail(emailData))
      if (createEmail.fulfilled.match(resultAction)) {
        dispatch(createEmailSuccess(resultAction.payload))
        return true
      } else {
        dispatch(createEmailFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(createEmailFailure(error.message || "Failed to create email"))
      return false
    }
  }

export const handleBulkCreateEmails = (formData: FormData) => async (dispatch: AppDispatch) => {
  dispatch(bulkCreateEmailsStart())
  try {
    const resultAction = await dispatch(bulkCreateEmails(formData))
    if (bulkCreateEmails.fulfilled.match(resultAction)) {
      dispatch(bulkCreateEmailsSuccess(resultAction.payload.created))
      return resultAction.payload
    } else {
      dispatch(bulkCreateEmailsFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(bulkCreateEmailsFailure(error.message || "Failed to create emails"))
    return false
  }
}

export const handleUpdateEmail =
  ({
    id,
    emailData,
  }: {
    id: number
    emailData: Partial<import("../slices/emailSlice").EmailListEntry>
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(updateEmailStart())
    try {
      const resultAction = await dispatch(updateEmail({ id, emailData }))
      if (updateEmail.fulfilled.match(resultAction)) {
        dispatch(updateEmailSuccess(resultAction.payload))
        return true
      } else {
        dispatch(updateEmailFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(updateEmailFailure(error.message || "Failed to update email"))
      return false
    }
  }

export const handleDeleteEmail = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(deleteEmailStart())
  try {
    const resultAction = await dispatch(deleteEmail(id))
    if (deleteEmail.fulfilled.match(resultAction)) {
      dispatch(deleteEmailSuccess(id))
      return true
    } else {
      dispatch(deleteEmailFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(deleteEmailFailure(error.message || "Failed to delete email"))
    return false
  }
}

export const handleBulkDeleteEmails =
  ({ campaignId, emailIds }: { campaignId: number; emailIds: number[] }) =>
  async (dispatch: AppDispatch) => {
    dispatch(bulkDeleteEmailsStart())
    try {
      const resultAction = await dispatch(bulkDeleteEmails({ campaignId, emailIds }))
      if (bulkDeleteEmails.fulfilled.match(resultAction)) {
        dispatch(bulkDeleteEmailsSuccess(emailIds))
        return true
      } else {
        dispatch(bulkDeleteEmailsFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(bulkDeleteEmailsFailure(error.message || "Failed to delete emails"))
      return false
    }
  }
