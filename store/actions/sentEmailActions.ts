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
export const handleFetchSentEmails = (filters: Record<string, any> = {}, pageUrl: string | null = null) => async (dispatch: AppDispatch) => {
  dispatch(fetchSentEmailsStart())
  try {
    let url = pageUrl || "/sent-emails/"
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value)
      }
    })
    if (params.toString() && !pageUrl) {
      url += `?${params.toString()}`
    }
    const response = await api.get(url)
    dispatch(fetchSentEmailsSuccess(response.data))
  } catch (error: any) {
    dispatch(fetchSentEmailsFailure(error.response?.data?.error || "Failed to fetch sent emails"))
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
    const response = await api.get(`/sent-emails/${id}/`)
    dispatch(fetchSentEmailDetailSuccess(response.data))
  } catch (error: any) {
    dispatch(fetchSentEmailDetailFailure(error.response?.data?.error || "Failed to fetch sent email detail"))
  }
} 