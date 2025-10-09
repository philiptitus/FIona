import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchDispatchesStart,
  fetchDispatchesSuccess,
  fetchDispatchesFailure,
  fetchDispatchStart,
  fetchDispatchSuccess,
  fetchDispatchFailure,
  createDispatchStart,
  createDispatchSuccess,
  createDispatchFailure,
  verifyDispatchStart,
  verifyDispatchSuccess,
  verifyDispatchFailure,
  sendDispatchStart,
  sendDispatchSuccess,
  sendDispatchFailure,
} from "../slices/dispatchSlice"
import type { AppDispatch } from "../store"

// Fetch all dispatches
export const fetchDispatches = createAsyncThunk("dispatches/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mail/dispatches/")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch dispatches")
  }
})

// Fetch a dispatch by campaign ID
export const fetchDispatchByCampaignId = createAsyncThunk(
  "dispatches/fetchByCampaignId",
  async (campaignId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/dispatches/${campaignId}/`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch dispatch")
    }
  },
)

// Create a new dispatch
export const createDispatch = createAsyncThunk("dispatches/create", async (campaignId: number, { rejectWithValue }) => {
  try {
    const response = await api.post("/mail/dispatches/", { campaign_id: campaignId })
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to create dispatch")
  }
})

// Verify a dispatch
export const verifyDispatch = createAsyncThunk("dispatches/verify", async (dispatchId: number, { rejectWithValue }) => {
  try {
    const response = await api.post(`/mail/dispatches/${dispatchId}/verify/`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to verify dispatch")
  }
})

// Send a dispatch
export const sendDispatch = createAsyncThunk(
  "dispatches/send",
  async (
    { 
      dispatchId, 
      mailboxId, 
      mailboxIds,
      type,
      isScheduled,
      scheduleDay1,
      scheduleDay2,
      scheduleDay3
    }: { 
      dispatchId: number; 
      mailboxId?: number; 
      mailboxIds?: number[];
      type: "content" | "template";
      isScheduled?: boolean;
      scheduleDay1?: string;
      scheduleDay2?: string;
      scheduleDay3?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = { type }
      
      // Support both single mailbox_id and mailbox_ids for backward compatibility
      if (mailboxIds && mailboxIds.length > 0) {
        payload.mailbox_ids = mailboxIds
      } else if (mailboxId) {
        payload.mailbox_id = mailboxId
      } else {
        throw new Error('Either mailboxId or mailboxIds must be provided')
      }
      
      // Add scheduling fields if scheduling is enabled
      if (isScheduled) {
        payload.is_scheduled = true
        if (scheduleDay1) payload.schedule_day_1 = scheduleDay1
        if (scheduleDay2) payload.schedule_day_2 = scheduleDay2
        if (scheduleDay3) payload.schedule_day_3 = scheduleDay3
      }
      
      const response = await api.post(`/mail/dispatches/${dispatchId}/send/`, payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || "Failed to send dispatch")
    }
  }
)

// Auto send next pending dispatch
export const autoSendNextDispatch = createAsyncThunk("dispatches/autoSend", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/mail/auto/")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to auto send dispatch")
  }
})

// Thunk action creators for dispatching regular actions
export const handleFetchDispatches = () => async (dispatch: AppDispatch) => {
  dispatch(fetchDispatchesStart())
  try {
    const resultAction = await dispatch(fetchDispatches() as any)
    if (fetchDispatches.fulfilled.match(resultAction)) {
      dispatch(fetchDispatchesSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchDispatchesFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchDispatchesFailure(error.message || "Failed to fetch dispatches"))
    return false
  }
}

export const handleFetchDispatchByCampaignId = (campaignId: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchDispatchStart())
  try {
    const resultAction = await dispatch(fetchDispatchByCampaignId(campaignId) as any)
    if (fetchDispatchByCampaignId.fulfilled.match(resultAction)) {
      dispatch(fetchDispatchSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchDispatchFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchDispatchFailure(error.message || "Failed to fetch dispatch"))
    return false
  }
}

export const handleCreateDispatch = (campaignId: number) => async (dispatch: AppDispatch) => {
  dispatch(createDispatchStart())
  try {
    const resultAction = await dispatch(createDispatch(campaignId) as any)
    if (createDispatch.fulfilled.match(resultAction)) {
      dispatch(createDispatchSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(createDispatchFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(createDispatchFailure(error.message || "Failed to create dispatch"))
    return { success: false, error: error.message || "Failed to create dispatch" }
  }
}

export const handleVerifyDispatch = (dispatchId: number) => async (dispatch: AppDispatch) => {
  dispatch(verifyDispatchStart())
  try {
    const resultAction = await dispatch(verifyDispatch(dispatchId) as any)
    if (verifyDispatch.fulfilled.match(resultAction)) {
      dispatch(verifyDispatchSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(verifyDispatchFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    const errorMessage = error.message || "Failed to verify dispatch"
    dispatch(verifyDispatchFailure(errorMessage))
    return { success: false, error: errorMessage }
  }
}

export const handleSendDispatch = (
  dispatchId: number, 
  mailboxId?: number, 
  mailboxIds?: number[],
  type?: "content" | "template",
  isScheduled?: boolean,
  scheduleDay1?: string,
  scheduleDay2?: string,
  scheduleDay3?: string
) => async (dispatch: AppDispatch) => {
  dispatch(sendDispatchStart())
  try {
    // Ensure either mailboxId or mailboxIds is provided
    if (!mailboxId && (!mailboxIds || mailboxIds.length === 0)) {
      throw new Error('Either mailboxId or mailboxIds must be provided')
    }
    
    const resultAction = await dispatch(sendDispatch({ 
      dispatchId, 
      ...(mailboxId && { mailboxId }),
      ...(mailboxIds && mailboxIds.length > 0 && { mailboxIds }),
      type: type || 'content', // Default to 'content' if not provided
      ...(isScheduled && { isScheduled }),
      ...(scheduleDay1 && { scheduleDay1 }),
      ...(scheduleDay2 && { scheduleDay2 }),
      ...(scheduleDay3 && { scheduleDay3 })
    } as any))
    
    if (sendDispatch.fulfilled.match(resultAction)) {
      dispatch(sendDispatchSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(sendDispatchFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    const errorMessage = error.message || "Failed to send dispatch"
    dispatch(sendDispatchFailure(errorMessage))
    return { success: false, error: errorMessage }
  }
}
