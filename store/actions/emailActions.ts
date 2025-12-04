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
  addExistingEmailsStart,
  addExistingEmailsSuccess,
  addExistingEmailsFailure,
  disassociateEmailsStart,
  disassociateEmailsSuccess,
  disassociateEmailsFailure,
} from "../slices/emailSlice"
import type { AppDispatch } from "../store"

interface FetchEmailsParams {
  campaignId?: number
  search?: string
  email?: string
  firstName?: string
  lastName?: string
  organizationName?: string
  emailStatus?: string
  department?: string
  country?: string
  isSent?: boolean
  page?: number
  // Page size is fixed at 10 to match the backend
}

// Fetch emails for a campaign with optional search parameters
export const fetchEmails = createAsyncThunk(
  "emails/fetchAll", 
  async (params: FetchEmailsParams = {}, { rejectWithValue }) => {
    try {
      const {
        campaignId,
        search,
        email,
        firstName,
        lastName,
        organizationName,
        emailStatus,
        department,
        country,
        isSent,
        page = 1
      } = params

      const url = new URL('/mail/emails/', window.location.origin)
      const searchParams = new URLSearchParams()

      // Add search and filter parameters
      if (campaignId) searchParams.append('campaign_id', campaignId.toString())
      if (search) searchParams.append('search', search)
      if (email) searchParams.append('email', email)
      if (firstName) searchParams.append('first_name', firstName)
      if (lastName) searchParams.append('last_name', lastName)
      if (organizationName) searchParams.append('organization_name', organizationName)
      if (emailStatus) searchParams.append('email_status', emailStatus)
      if (department) searchParams.append('department', department)
      if (country) searchParams.append('country', country)
      if (isSent !== undefined) searchParams.append('is_sent', isSent.toString())
      
      // Add pagination parameters - page size is fixed at 10
      searchParams.append('page', page.toString())
      searchParams.append('page_size', '10')

      const response = await api.get(`${url.pathname}?${searchParams.toString()}`)
      
      // Transform the response to match our expected format
      if (response.data && response.data.results) {
        // New paginated response format
        return {
          results: response.data.results,
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10) // Fixed page size of 10
        }
      } else if (Array.isArray(response.data)) {
        // Legacy response format for backward compatibility
        return { emails: response.data }
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch emails")
    }
  }
)

// Fetch sent emails
export const fetchSentEmails = createAsyncThunk(
  "emails/fetchSent",
  async (
    { campaignId, search, page = 1 }: { campaignId?: number; search?: string; page?: number },
    { rejectWithValue },
  ) => {
    try {
      // Build the base URL
      const baseUrl = "/mail/emails/sent/"
      const params = new URLSearchParams()

      // Add query parameters
      if (campaignId) params.append("campaign_id", campaignId.toString())
      if (search) params.append("search", search)
      params.append("page", page.toString())
      // Fixed page size of 10 to match the backend
      params.append("page_size", "10")

      // Build the full URL with search params
      const queryString = params.toString()
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl
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
    emailData: { campaign: number; organization_name: string; email: string; context?: string; check_user_duplicates?: boolean },
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
export const handleFetchEmails = (params: FetchEmailsParams = {}) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(fetchEmailsStart())
      const result = await dispatch(fetchEmails(params)).unwrap()
      // Persist the fetched (paginated or legacy) data into the slice state
      dispatch(fetchEmailsSuccess(result))
      return result
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to fetch emails'
      console.error('Error fetching emails:', error);
      dispatch(fetchEmailsFailure(errorMessage))
      throw new Error(errorMessage)
    }
  }
}

export const handleFetchSentEmails =
  ({
    campaignId,
    search,
    page,
  }: { campaignId?: number; search?: string; page?: number }) =>
  async (dispatch: AppDispatch) => {
    dispatch(fetchSentEmailsStart())
    try {
      const resultAction = await dispatch(fetchSentEmails({ campaignId, search, page }))
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
  (emailData: { campaign: number; organization_name: string; email: string; context?: string; check_user_duplicates?: boolean }) =>
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

// Disassociate emails from campaign
export const disassociateEmails = createAsyncThunk(
  'emails/disassociate',
  async (
    { campaignId, emailIds }: { campaignId: number; emailIds: number[] },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post('/mail/emails/disassociate/', {
        campaign_id: campaignId,
        email_ids: emailIds,
      })
      return { emailIds, campaignId, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to disassociate emails')
    }
  }
)

export const handleDisassociateEmails = (campaignId: number, emailIds: number[]) => 
  async (dispatch: AppDispatch) => {
    try {
      const resultAction = await dispatch(disassociateEmails({ campaignId, emailIds }) as any)
      
      if (resultAction.error) {
        throw new Error(resultAction.payload || 'Failed to disassociate emails')
      }
      
      // Refetch the updated email list
      await dispatch(handleFetchEmails({ campaignId }) as any)
      return { success: true, data: resultAction.payload.data }
      
    } catch (error: any) {
      console.error('Error disassociating emails:', error)
      return { 
        success: false, 
        error: error.message || 'An error occurred while disassociating emails' 
      }
    }
  }

// Add existing emails to campaign
export const addExistingEmails = createAsyncThunk(
  'emails/addExisting',
  async (
    { campaignId, emailListIds, skipDuplicates = true }: 
    { campaignId: number; emailListIds: number[]; skipDuplicates?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/mail/emails/', {
        action: 'add_existing',
        campaign_id: campaignId,
        email_list_ids: emailListIds,
        skip_duplicates: skipDuplicates
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to add existing emails")
    }
  }
)

export const handleAddExistingEmails = ({
  campaignId,
  emailListIds,
  skipDuplicates = true
}: {
  campaignId: number
  emailListIds: number[]
  skipDuplicates?: boolean
}) => {
  return async (dispatch: AppDispatch) => {
    dispatch(addExistingEmailsStart())
    try {
      const resultAction = await dispatch(addExistingEmails({ campaignId, emailListIds, skipDuplicates }))
      if (addExistingEmails.fulfilled.match(resultAction)) {
        // The API returns a success message with added_count, not the actual email objects
        // So we'll just indicate success without trying to update the emails array
        dispatch(addExistingEmailsSuccess([])) // Pass empty array since we don't have the actual email objects
        return { success: true, data: resultAction.payload }
      } else {
        const errorMessage = resultAction.payload as string || "Failed to add existing emails"
        dispatch(addExistingEmailsFailure(errorMessage))
        return { success: false, error: errorMessage }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add existing emails"
      dispatch(addExistingEmailsFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }
}