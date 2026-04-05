import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchPresetStart,
  fetchPresetSuccess,
  fetchPresetFailure,
  updatePresetStart,
  updatePresetSuccess,
  updatePresetFailure,
} from "../slices/presetSlice"
import type { AppDispatch } from "../store"
import type { EmailSendingPreset } from "../slices/presetSlice"

// Fetch the user's email sending preset
export const fetchPreset = createAsyncThunk(
  "preset/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/mail/email-sending-preset/")
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch preset")
    }
  }
)

// Update the user's email sending preset
export const updatePreset = createAsyncThunk(
  "preset/update",
  async (
    presetData: Partial<EmailSendingPreset>,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch("/mail/email-sending-preset/", presetData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update preset")
    }
  }
)

// Thunk action creators for dispatching regular actions
export const handleFetchPreset = () => async (dispatch: AppDispatch) => {
  dispatch(fetchPresetStart())
  try {
    const resultAction = await dispatch(fetchPreset())
    if (fetchPreset.fulfilled.match(resultAction)) {
      dispatch(fetchPresetSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchPresetFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchPresetFailure(error.message || "Failed to fetch preset"))
    return false
  }
}

export const handleUpdatePreset = (presetData: Partial<EmailSendingPreset>) => async (dispatch: AppDispatch) => {
  dispatch(updatePresetStart())
  try {
    const resultAction = await dispatch(updatePreset(presetData))
    if (updatePreset.fulfilled.match(resultAction)) {
      dispatch(updatePresetSuccess(resultAction.payload))
      return true
    } else {
      dispatch(updatePresetFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(updatePresetFailure(error.message || "Failed to update preset"))
    return false
  }
}
