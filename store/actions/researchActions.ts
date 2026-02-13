import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  startResearchStart,
  startResearchSuccess,
  startResearchFailure,
  fetchResearchListStart,
  fetchResearchListSuccess,
  fetchResearchListFailure,
  fetchResearchResultStart,
  fetchResearchResultSuccess,
  fetchResearchResultFailure,
  deleteResearchStart,
  deleteResearchSuccess,
  deleteResearchFailure,
  updateResearchResult,
  clearActiveResearch,
  type StartResearchResponse,
  type FetchResearchListResponse,
  type ResearchResult,
  type DeleteResearchResponse,
} from "../slices/researchSlice"
import type { AppDispatch } from "../store"

// Error code mappings for user-friendly messages
const getResearchErrorMessage = (errorCode: string, httpStatus: number): string => {
  switch (errorCode) {
    case 'RATE_LIMIT_IN_FLIGHT':
      return "A research task is already in progress for this contact. Please wait for it to complete."
    case 'QUEUE_FULL':
      return "The system is currently busy processing other requests. Please try again in a few minutes."
    case 'MISSING_REQUIRED_FIELD':
      return "Required information is missing. Please check the contact details and try again."
    case 'INVALID_CONTACT_TYPE':
      return "Invalid contact type provided. Please refresh the page and try again."
    case 'RESEARCH_EXISTS':
      return "Research has already been generated for this contact. Check your Research dashboard."
    case 'COMPANY_NO_EMAIL':
      return "This company doesn't have an email address. Research cannot be generated without contact information."
    case 'CONTACT_NOT_FOUND':
      return "The selected contact could not be found. It may have been deleted or moved."
    case 'SERVER_ERROR':
      return "An unexpected error occurred on our servers. Please try again later."
    default:
      if (httpStatus === 429) {
        return "Too many requests. Please wait a moment before trying again."
      }
      if (httpStatus === 404) {
        return "The requested contact or resource was not found."
      }
      if (httpStatus >= 500) {
        return "Server error occurred. Please try again later."
      }
      return "An unexpected error occurred. Please try again."
  }
}

const getDeleteErrorMessage = (errorCode: string, httpStatus: number): string => {
  switch (errorCode) {
    case 'MISSING_REQUIRED_FIELD':
      return "No items were specified for deletion. Please select items to delete."
    case 'NOT_FOUND':
      return "The selected research results could not be found or have already been deleted."
    case 'SERVER_ERROR':
      return "An unexpected error occurred while deleting. Please try again later."
    default:
      if (httpStatus === 404) {
        return "The selected research results were not found or have already been deleted."
      }
      if (httpStatus >= 500) {
        return "Server error occurred while deleting. Please try again later."
      }
      return "Failed to delete research results. Please try again."
  }
}

interface StartResearchParams {
  contact_id: number
  contact_type: "emaillist" | "company"
}

interface BulkResearchParams {
  contact_ids: number[]
  contact_type: "emaillist" | "company"
  create_campaign: boolean
}

interface FetchResearchListParams {
  page?: number
  page_size?: number
  search?: string
  status?: "processing" | "completed" | "failed"
  contact_type?: "emaillist" | "company"
  contact_name?: string
  ordering?: string
}

interface DeleteResearchParams {
  research_id?: number
  research_ids?: number[]
  delete_all?: boolean
}

/**
 * Async thunk to start bulk research for multiple contacts
 */
export const startBulkResearch = createAsyncThunk(
  "research/startBulk",
  async (params: BulkResearchParams, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/agents/personalized-research/", params)
      return response.data as StartResearchResponse
    } catch (error: any) {
      const errorCode = error.response?.data?.code || error.response?.data?.error_code
      const httpStatus = error.response?.status || 500
      const userMessage = getResearchErrorMessage(errorCode, httpStatus)
      
      return rejectWithValue({
        message: userMessage,
        code: errorCode,
        httpStatus
      })
    }
  }
)

/**
 * Async thunk to start a research request
 */
export const startResearch = createAsyncThunk(
  "research/start",
  async (params: StartResearchParams, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/agents/personalized-research/", params)
      return response.data as StartResearchResponse
    } catch (error: any) {
      const errorCode = error.response?.data?.code || error.response?.data?.error_code
      const httpStatus = error.response?.status || 500
      const userMessage = getResearchErrorMessage(errorCode, httpStatus)
      
      return rejectWithValue({
        message: userMessage,
        code: errorCode,
        httpStatus
      })
    }
  }
)

/**
 * Async thunk to fetch research results list with pagination and filtering
 */
export const fetchResearchList = createAsyncThunk(
  "research/fetchList",
  async (params?: FetchResearchListParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.page_size) queryParams.append("page_size", params.page_size.toString())
      if (params?.search) queryParams.append("search", params.search)
      if (params?.status) queryParams.append("status", params.status)
      if (params?.contact_type) queryParams.append("contact_type", params.contact_type)
      if (params?.contact_name) queryParams.append("contact_name", params.contact_name)
      if (params?.ordering) queryParams.append("ordering", params.ordering)

      const url = `/mail/agents/personalized-research/list/${queryParams.toString() ? "?" + queryParams.toString() : ""}`
      const response = await api.get(url)
      return { data: response.data as FetchResearchListResponse, page: params?.page || 1 }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch research list")
    }
  }
)

/**
 * Async thunk to fetch a single research result by ID
 */
export const fetchResearchResult = createAsyncThunk(
  "research/fetchResult",
  async (researchId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/agents/personalized-research/list/?page=1&page_size=1`)
      const data = response.data as FetchResearchListResponse
      // Filter for the specific research ID
      const result = data.results.find((r) => r.id === researchId)
      if (!result) {
        throw new Error("Research result not found")
      }
      return result as ResearchResult
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch research result")
    }
  }
)

/**
 * Async thunk to delete research results
 */
export const deleteResearch = createAsyncThunk(
  "research/delete",
  async (params: DeleteResearchParams, { rejectWithValue }) => {
    try {
      const response = await api.delete("/mail/agents/personalized-research/delete/", {
        data: params
      })
      return response.data as DeleteResearchResponse
    } catch (error: any) {
      const errorCode = error.response?.data?.code || error.response?.data?.error_code
      const httpStatus = error.response?.status || 500
      const userMessage = getDeleteErrorMessage(errorCode, httpStatus)
      
      return rejectWithValue({
        message: userMessage,
        code: errorCode,
        httpStatus
      })
    }
  }
)

/**
 * Handler function to start bulk research request
 */
export const handleStartBulkResearch =
  (params: BulkResearchParams) => async (dispatch: AppDispatch) => {
    dispatch(startResearchStart())
    try {
      const resultAction = await dispatch(startBulkResearch(params))
      if (startBulkResearch.fulfilled.match(resultAction)) {
        dispatch(startResearchSuccess(resultAction.payload))
        return { success: true, data: resultAction.payload }
      } else {
        const errorPayload = resultAction.payload as any
        const errorMessage = typeof errorPayload === 'object' ? errorPayload.message : errorPayload
        dispatch(startResearchFailure(errorMessage))
        return { 
          success: false, 
          error: errorMessage,
          code: errorPayload?.code,
          httpStatus: errorPayload?.httpStatus
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to start bulk research"
      dispatch(startResearchFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }

/**
 * Handler function to start research request
 */
export const handleStartResearch =
  (params: StartResearchParams) => async (dispatch: AppDispatch) => {
    dispatch(startResearchStart())
    try {
      const resultAction = await dispatch(startResearch(params))
      if (startResearch.fulfilled.match(resultAction)) {
        dispatch(startResearchSuccess(resultAction.payload))
        return { success: true, data: resultAction.payload }
      } else {
        const errorPayload = resultAction.payload as any
        const errorMessage = typeof errorPayload === 'object' ? errorPayload.message : errorPayload
        dispatch(startResearchFailure(errorMessage))
        return { 
          success: false, 
          error: errorMessage,
          code: errorPayload?.code,
          httpStatus: errorPayload?.httpStatus
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to start research"
      dispatch(startResearchFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }

/**
 * Handler function to fetch research list with pagination and filtering
 */
export const handleFetchResearchList =
  (params?: FetchResearchListParams) => async (dispatch: AppDispatch) => {
    dispatch(fetchResearchListStart())
    try {
      const resultAction = await dispatch(fetchResearchList(params))
      if (fetchResearchList.fulfilled.match(resultAction)) {
        dispatch(
          fetchResearchListSuccess({
            data: resultAction.payload.data,
            page: resultAction.payload.page,
          })
        )
        return { success: true, data: resultAction.payload.data }
      } else {
        dispatch(fetchResearchListFailure(resultAction.payload as string))
        return { success: false, error: resultAction.payload }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch research list"
      dispatch(fetchResearchListFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }

/**
 * Handler function to fetch a single research result
 */
export const handleFetchResearchResult =
  (researchId: number) => async (dispatch: AppDispatch) => {
    dispatch(fetchResearchResultStart())
    try {
      const resultAction = await dispatch(fetchResearchResult(researchId))
      if (fetchResearchResult.fulfilled.match(resultAction)) {
        dispatch(fetchResearchResultSuccess(resultAction.payload))
        return { success: true, data: resultAction.payload }
      } else {
        dispatch(fetchResearchResultFailure(resultAction.payload as string))
        return { success: false, error: resultAction.payload }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch research result"
      dispatch(fetchResearchResultFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }

/**
 * Polling function to wait for research completion
 * Polls the research result until status is either "completed" or "failed"
 */
export const pollResearchCompletion =
  (researchId: number, maxWaitMs = 300000, pollIntervalMs = 2000) =>
  async (dispatch: AppDispatch) => {
    const startTime = Date.now()

    return new Promise((resolve) => {
      const poll = async () => {
        const elapsed = Date.now() - startTime

        if (elapsed > maxWaitMs) {
          resolve({
            success: false,
            error: "Research polling timeout",
          })
          return
        }

        try {
          const resultAction = await dispatch(fetchResearchResult(researchId))
          if (fetchResearchResult.fulfilled.match(resultAction)) {
            const result = resultAction.payload
            dispatch(updateResearchResult(result))

            if (result.status === "completed" || result.status === "failed") {
              resolve({
                success: result.status === "completed",
                data: result,
                error: result.error_message,
              })
              return
            }
          }
        } catch (error) {
          // Continue polling even if fetch fails
        }

        // Schedule next poll
        setTimeout(poll, pollIntervalMs)
      }

      poll()
    })
  }

/**
 * Combined function: start research and optionally poll for completion
 */
export const handleStartAndPollResearch =
  (params: StartResearchParams, shouldPoll = true, maxWaitMs = 300000) =>
  async (dispatch: AppDispatch) => {
    // First, start the research
    const startResult = await dispatch(handleStartResearch(params))

    if (!startResult.success) {
      return startResult
    }

    if (!shouldPoll) {
      return startResult
    }

    // If polling enabled, poll for completion
    const researchId = startResult.data.research_id
    return dispatch(pollResearchCompletion(researchId, maxWaitMs))
  }

/**
 * Handler function to delete research results
 */
export const handleDeleteResearch =
  (params: DeleteResearchParams) => async (dispatch: AppDispatch) => {
    dispatch(deleteResearchStart())
    try {
      const resultAction = await dispatch(deleteResearch(params))
      if (deleteResearch.fulfilled.match(resultAction)) {
        dispatch(deleteResearchSuccess({
          response: resultAction.payload,
          requestParams: params
        }))
        return { success: true, data: resultAction.payload }
      } else {
        const errorPayload = resultAction.payload as any
        const errorMessage = typeof errorPayload === 'object' ? errorPayload.message : errorPayload
        dispatch(deleteResearchFailure(errorMessage))
        return { 
          success: false, 
          error: errorMessage,
          code: errorPayload?.code,
          httpStatus: errorPayload?.httpStatus
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete research"
      dispatch(deleteResearchFailure(errorMessage))
      return { success: false, error: errorMessage }
    }
  }

/**
 * Handler to clear active research tracking
 */
export const handleClearActiveResearch = () => (dispatch: AppDispatch) => {
  dispatch(clearActiveResearch())
  return true
}
