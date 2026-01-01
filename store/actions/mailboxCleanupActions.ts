import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchSettingsStart,
  fetchSettingsSuccess,
  fetchSettingsFailure,
  updateSettingsStart,
  updateSettingsSuccess,
  updateSettingsFailure,
  type MailboxCleanupSettings,
} from "../slices/mailboxCleanupSlice"
import type { AppDispatch } from "../store"

interface UpdateSettingsData {
  enable_mailbox_cleanup?: boolean
  cleanup_scheduled_time?: string | null
}

export const fetchCleanupSettings = createAsyncThunk(
  "mailboxCleanup/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/access/mailbox-cleanup-settings/")
      return response.data as MailboxCleanupSettings
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch cleanup settings")
    }
  }
)

export const updateCleanupSettings = createAsyncThunk(
  "mailboxCleanup/updateSettings",
  async (data: UpdateSettingsData, { rejectWithValue }) => {
    try {
      const method = data.enable_mailbox_cleanup !== undefined ? "post" : "put"
      const response = await api[method]("/access/mailbox-cleanup-settings/", data)
      return response.data as MailboxCleanupSettings
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.cleanup_scheduled_time?.[0] || 
        error.response?.data?.error || 
        "Failed to update cleanup settings"
      )
    }
  }
)

export const handleFetchCleanupSettings = () => async (dispatch: AppDispatch) => {
  dispatch(fetchSettingsStart())
  try {
    const resultAction = await dispatch(fetchCleanupSettings())
    if (fetchCleanupSettings.fulfilled.match(resultAction)) {
      dispatch(fetchSettingsSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(fetchSettingsFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(fetchSettingsFailure(error.message || "Failed to fetch cleanup settings"))
    return { success: false, error: error.message }
  }
}

export const handleUpdateCleanupSettings = (data: UpdateSettingsData) => async (dispatch: AppDispatch) => {
  dispatch(updateSettingsStart())
  try {
    const resultAction = await dispatch(updateCleanupSettings(data))
    if (updateCleanupSettings.fulfilled.match(resultAction)) {
      dispatch(updateSettingsSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(updateSettingsFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(updateSettingsFailure(error.message || "Failed to update cleanup settings"))
    return { success: false, error: error.message }
  }
}