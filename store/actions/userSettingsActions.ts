import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchUserSettingsStart,
  fetchUserSettingsSuccess,
  fetchUserSettingsFailure,
  updateUserSettingsStart,
  updateUserSettingsSuccess,
  updateUserSettingsFailure,
  type UserSettings,
} from "../slices/userSettingsSlice"
import type { AppDispatch } from "../store"

interface UpdateUserSettingsParams {
  default_email_word_limit?: number
  default_template_word_limit?: number
  sequence_initial?: number
  sequence_followup?: number
  sequence_final?: number
}

export const fetchUserSettings = createAsyncThunk(
  "userSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/mail/user-settings/")
      return response.data as UserSettings
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch user settings")
    }
  }
)

export const updateUserSettings = createAsyncThunk(
  "userSettings/update",
  async (data: UpdateUserSettingsParams, { rejectWithValue }) => {
    try {
      const response = await api.put("/mail/user-settings/", data)
      return response.data as UserSettings
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update user settings")
    }
  }
)

export const handleFetchUserSettings = () => async (dispatch: AppDispatch) => {
  dispatch(fetchUserSettingsStart())
  try {
    const resultAction = await dispatch(fetchUserSettings())
    if (fetchUserSettings.fulfilled.match(resultAction)) {
      dispatch(fetchUserSettingsSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(fetchUserSettingsFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(fetchUserSettingsFailure(error.message || "Failed to fetch user settings"))
    return { success: false, error: error.message }
  }
}

export const handleUpdateUserSettings = (data: UpdateUserSettingsParams) => async (dispatch: AppDispatch) => {
  dispatch(updateUserSettingsStart())
  try {
    const resultAction = await dispatch(updateUserSettings(data))
    if (updateUserSettings.fulfilled.match(resultAction)) {
      dispatch(updateUserSettingsSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(updateUserSettingsFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(updateUserSettingsFailure(error.message || "Failed to update user settings"))
    return { success: false, error: error.message }
  }
}
