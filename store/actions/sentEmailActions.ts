import api from "@/lib/api"
import { AppDispatch } from "@/store/store"
import {
  fetchSentEmailsStart,
  fetchSentEmailsSuccess,
  fetchSentEmailsFailure,
  setSentEmailFilters,
  fetchSentEmailDetailStart,
  fetchSentEmailDetailSuccess,
  fetchSentEmailDetailFailure,
} from "../slices/sentEmailSlice"

// Fetch paginated, filterable list of sent emails
export const handleFetchSentEmails = (filters: Record<string, any> = {}, pageUrl: string | null = null) => async (dispatch: AppDispatch, getState: () => any) => {
  dispatch(fetchSentEmailsStart())
  try {
    let url = pageUrl || "/mail/sent-emails/"
    const params = new URLSearchParams()
    
    // If no pageUrl is provided, use the filters
    if (!pageUrl) {
      // Get current filters from state if available
      const currentState = getState?.()?.sentEmail?.list?.filters || {}
      const effectiveFilters = { ...currentState, ...filters }
      
      // Add all non-empty filters to params
      Object.entries(effectiveFilters).forEach(([key, value]) => {
        // Skip page_size - backend has fixed pagination at 10 items per page
        if (key === 'page_size') return
        
        if (value !== undefined && value !== null && value !== "") {
          // Convert boolean values to string 'true'/'false' for the API
          const paramValue = typeof value === 'boolean' ? String(value) : value
          params.append(key, String(paramValue))
        }
      })
      
      // Ensure page parameter is set
      if (!params.has('page')) params.set('page', '1')
      
      url += `?${params.toString()}`
    }
    
    const response = await api.get(url)
    let data = response.data;
    
    // Handle array responses (backward compatibility)
    if (Array.isArray(data)) {
      data = { 
        results: data, 
        count: data.length, 
        next: null, 
        previous: null,
        currentPage: 1,
        totalPages: 1
      };
    } else {
      // Add pagination info if not present in the response
      data.currentPage = parseInt(params.get('page') || '1', 10);
      // Fixed page size of 10 items per page
      data.totalPages = Math.ceil(data.count / 10);
    }
    
    dispatch(fetchSentEmailsSuccess(data))
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Failed to fetch sent emails"
    dispatch(fetchSentEmailsFailure(errorMessage))
    throw new Error(errorMessage)
  }
}

// Set filters for sent emails
export const handleSetSentEmailFilters = (filters: Record<string, any>) => (dispatch: AppDispatch) => {
  dispatch(setSentEmailFilters(filters))
}

// Fetch detail of a single sent email
export const handleFetchSentEmailDetail = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchSentEmailDetailStart())
  try {
    const response = await api.get(`/mail/sent-emails/${id}/`)
    dispatch(fetchSentEmailDetailSuccess(response.data))
  } catch (error: any) {
    dispatch(fetchSentEmailDetailFailure(error.response?.data?.error || "Failed to fetch sent email detail"))
  }
}

// New action to change page
export const changePage = (page: number) => 
  async (dispatch: AppDispatch, getState: () => any) => {
    const { filters } = getState().sentEmail.list
    const newFilters = { ...filters, page }
    dispatch(setSentEmailFilters(newFilters))
    return dispatch(handleFetchSentEmails(newFilters) as any)
  }

// Note: changePageSize is no longer applicable - backend has fixed 10 items per page

// New action to set filters and refetch
export const setAndApplyFilters = (filters: Record<string, any>) => 
  async (dispatch: AppDispatch) => {
    const newFilters = { ...filters, page: 1 }
    dispatch(setSentEmailFilters(newFilters))
    return dispatch(handleFetchSentEmails(newFilters) as any)
  }

// New action to reset all filters
export const resetAllFilters = () => 
  async (dispatch: AppDispatch) => {
    const defaultFilters = { 
      page: 1, 
      page_size: 10,
      recipient: "",
      subject: "",
      message_id: "",
      error_message: "",
      status: "",
      is_html: false,
      sent_at_after: "",
      sent_at_before: "",
      mailbox: "",
      template: "",
      content: "",
      dispatch: ""
    }
    dispatch(setSentEmailFilters(defaultFilters))
    return dispatch(handleFetchSentEmails(defaultFilters) as any)
  }