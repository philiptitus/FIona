import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchWorkflowsStart,
  fetchWorkflowsSuccess,
  fetchWorkflowsFailure,
  setSelectedWorkflow,
} from "../slices/workflowSlice"
import type { AppDispatch } from "../store"

export const fetchWorkflows = createAsyncThunk("workflows/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/mail/workflows/")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch workflows")
  }
})

export const handleFetchWorkflows = () => async (dispatch: AppDispatch) => {
  dispatch(fetchWorkflowsStart())
  try {
    const resultAction = await dispatch(fetchWorkflows())
    if (fetchWorkflows.fulfilled.match(resultAction)) {
      dispatch(fetchWorkflowsSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchWorkflowsFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchWorkflowsFailure(error.message || "Failed to fetch workflows"))
    return false
  }
}

export const selectWorkflow = (workflow: any) => async (dispatch: AppDispatch) => {
  dispatch(setSelectedWorkflow(workflow))
  return true
}
