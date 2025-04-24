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
export const sendDispatch = createAsyncThunk("dispatches/send", async (dispatchId: number, { rejectWithValue }) => {
  try {
    const response = await api.post(`/mail/dispatches/${dispatchId}/send/`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to send dispatch")
  }
})

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
    const resultAction = await dispatch(fetchDispatches())
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
    const resultAction = await dispatch(fetchDispatchByCampaignId(campaignId))
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
    const resultAction = await dispatch(createDispatch(campaignId))
    if (createDispatch.fulfilled.match(resultAction)) {
      dispatch(createDispatchSuccess(resultAction.payload))
      return true
    } else {
      dispatch(createDispatchFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(createDispatchFailure(error.message || "Failed to create dispatch"))
    return false
  }
}

export const handleVerifyDispatch = (dispatchId: number) => async (dispatch: AppDispatch) => {
  dispatch(verifyDispatchStart())
  try {
    const resultAction = await dispatch(verifyDispatch(dispatchId))
    if (verifyDispatch.fulfilled.match(resultAction)) {
      dispatch(verifyDispatchSuccess(resultAction.payload))
      return true
    } else {
      dispatch(verifyDispatchFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(verifyDispatchFailure(error.message || "Failed to verify dispatch"))
    return false
  }
}

export const handleSendDispatch = (dispatchId: number) => async (dispatch: AppDispatch) => {
  dispatch(sendDispatchStart())
  try {
    const resultAction = await dispatch(sendDispatch(dispatchId))
    if (sendDispatch.fulfilled.match(resultAction)) {
      dispatch(sendDispatchSuccess())
      return resultAction.payload
    } else {
      dispatch(sendDispatchFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(sendDispatchFailure(error.message || "Failed to send dispatch"))
    return false
  }
}
