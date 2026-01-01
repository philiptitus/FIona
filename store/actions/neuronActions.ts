import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchNeuronStart,
  fetchNeuronSuccess,
  fetchNeuronFailure,
  createNeuronStart,
  createNeuronSuccess,
  createNeuronFailure,
  updateNeuronStart,
  updateNeuronSuccess,
  updateNeuronFailure,
  toggleNeuronStart,
  toggleNeuronSuccess,
  toggleNeuronFailure,
  deleteNeuronStart,
  deleteNeuronSuccess,
  deleteNeuronFailure,
  fetchExecutionsStart,
  fetchExecutionsSuccess,
  fetchExecutionsFailure,
  type Neuron,
  type NeuronExecution,
} from "../slices/neuronSlice"
import type { AppDispatch } from "../store"

interface CreateNeuronData {
  workflow: number
  campaign_type: string
  content_preference: "template" | "content" | "both"
  recipient_type: "email" | "company"
  generate_email_lists: boolean
  allow_sequence: boolean
  copies: number
  selected_dynamic_variables: string[]
  selected_links: string[]
  scheduled_time: string
  max_total_campaigns: number
  send_email_notification?: boolean
  notification_mailbox?: number | null
}

interface UpdateNeuronData {
  workflow?: number
  campaign_type?: string
  content_preference?: "template" | "content" | "both"
  recipient_type?: "email" | "company"
  generate_email_lists?: boolean
  allow_sequence?: boolean
  copies?: number
  selected_dynamic_variables?: string[]
  selected_links?: string[]
  scheduled_time?: string
  max_total_campaigns?: number
  send_email_notification?: boolean
  notification_mailbox?: number | null
  is_active?: boolean
}

export const fetchNeuron = createAsyncThunk("neuron/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mail/neuron/")
    return response.data as Neuron
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch neuron")
  }
})

export const createNeuron = createAsyncThunk(
  "neuron/create",
  async (data: CreateNeuronData, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/neuron/create/", data)
      return response.data as Neuron
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.workflow?.[0] || "Failed to create neuron")
    }
  }
)

export const updateNeuron = createAsyncThunk(
  "neuron/update",
  async (data: UpdateNeuronData, { rejectWithValue }) => {
    try {
      const response = await api.put("/mail/neuron/", data)
      return response.data as Neuron
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update neuron")
    }
  }
)

export const toggleNeuron = createAsyncThunk("neuron/toggle", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/mail/neuron/toggle/")
    return response.data as { is_active: boolean; message: string }
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to toggle neuron")
  }
})

export const deleteNeuron = createAsyncThunk("neuron/delete", async (_, { rejectWithValue }) => {
  try {
    await api.delete("/mail/neuron/")
    return true
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete neuron")
  }
})

export const fetchExecutions = createAsyncThunk("neuron/executions", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mail/neuron/executions/")
    return response.data as NeuronExecution[]
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch executions")
  }
})

export const handleFetchNeuron = () => async (dispatch: AppDispatch) => {
  dispatch(fetchNeuronStart())
  try {
    const resultAction = await dispatch(fetchNeuron())
    if (fetchNeuron.fulfilled.match(resultAction)) {
      dispatch(fetchNeuronSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(fetchNeuronFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(fetchNeuronFailure(error.message || "Failed to fetch neuron"))
    return { success: false, error: error.message }
  }
}

export const handleCreateNeuron = (data: CreateNeuronData) => async (dispatch: AppDispatch) => {
  dispatch(createNeuronStart())
  try {
    const resultAction = await dispatch(createNeuron(data))
    if (createNeuron.fulfilled.match(resultAction)) {
      dispatch(createNeuronSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(createNeuronFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(createNeuronFailure(error.message || "Failed to create neuron"))
    return { success: false, error: error.message }
  }
}

export const handleUpdateNeuron = (data: UpdateNeuronData) => async (dispatch: AppDispatch) => {
  dispatch(updateNeuronStart())
  try {
    const resultAction = await dispatch(updateNeuron(data))
    if (updateNeuron.fulfilled.match(resultAction)) {
      dispatch(updateNeuronSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(updateNeuronFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(updateNeuronFailure(error.message || "Failed to update neuron"))
    return { success: false, error: error.message }
  }
}

export const handleToggleNeuron = () => async (dispatch: AppDispatch) => {
  dispatch(toggleNeuronStart())
  try {
    const resultAction = await dispatch(toggleNeuron())
    if (toggleNeuron.fulfilled.match(resultAction)) {
      dispatch(toggleNeuronSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(toggleNeuronFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(toggleNeuronFailure(error.message || "Failed to toggle neuron"))
    return { success: false, error: error.message }
  }
}

export const handleDeleteNeuron = () => async (dispatch: AppDispatch) => {
  dispatch(deleteNeuronStart())
  try {
    const resultAction = await dispatch(deleteNeuron())
    if (deleteNeuron.fulfilled.match(resultAction)) {
      dispatch(deleteNeuronSuccess())
      return { success: true }
    } else {
      dispatch(deleteNeuronFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(deleteNeuronFailure(error.message || "Failed to delete neuron"))
    return { success: false, error: error.message }
  }
}

export const handleFetchExecutions = () => async (dispatch: AppDispatch) => {
  dispatch(fetchExecutionsStart())
  try {
    const resultAction = await dispatch(fetchExecutions())
    if (fetchExecutions.fulfilled.match(resultAction)) {
      dispatch(fetchExecutionsSuccess(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      dispatch(fetchExecutionsFailure(resultAction.payload as string))
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    dispatch(fetchExecutionsFailure(error.message || "Failed to fetch executions"))
    return { success: false, error: error.message }
  }
}
