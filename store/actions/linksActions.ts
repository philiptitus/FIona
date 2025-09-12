import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchLinksStart,
  fetchLinksSuccess,
  fetchLinksFailure,
  updateLinksStart,
  updateLinksSuccess,
  updateLinksFailure,
  createLinksStart,
  createLinksSuccess,
  createLinksFailure,
} from "../slices/linksSlice"
import type { AppDispatch } from "../store"

export const fetchLinks = createAsyncThunk("links/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mail/links/")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || "Failed to fetch links")
  }
})

export const createLinks = createAsyncThunk("links/create", async (linksData: any, { rejectWithValue }) => {
  try {
    const response = await api.post("/mail/links/", linksData)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || error.response?.data || "Failed to create links")
  }
})

export const updateLinks = createAsyncThunk("links/update", async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/mail/links/${id}/`, data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || error.response?.data || "Failed to update links")
  }
})

export const handleFetchLinks = () => async (dispatch: AppDispatch) => {
  dispatch(fetchLinksStart())
  try {
    const resultAction = await dispatch(fetchLinks())
    if (fetchLinks.fulfilled.match(resultAction)) {
      dispatch(fetchLinksSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchLinksFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchLinksFailure(error.message || "Failed to fetch links"))
    return false
  }
}

export const handleCreateLinks = (linksData: any) => async (dispatch: AppDispatch) => {
  dispatch(createLinksStart())
  try {
    const resultAction = await dispatch(createLinks(linksData))
    if (createLinks.fulfilled.match(resultAction)) {
      dispatch(createLinksSuccess(resultAction.payload))
      return true
    } else {
      dispatch(createLinksFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(createLinksFailure(error.message || "Failed to create links"))
    return false
  }
}

export const handleUpdateLinks = (id: number, data: any) => async (dispatch: AppDispatch) => {
  dispatch(updateLinksStart())
  try {
    const resultAction = await dispatch(updateLinks({ id, data }))
    if (updateLinks.fulfilled.match(resultAction)) {
      dispatch(updateLinksSuccess(resultAction.payload))
      return true
    } else {
      dispatch(updateLinksFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(updateLinksFailure(error.message || "Failed to update links"))
    return false
  }
}