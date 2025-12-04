import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchWorkflowsStart,
  fetchWorkflowsSuccess,
  fetchWorkflowsFailure,
  setSelectedWorkflow,
  addWorkflow,
  updateWorkflowInList,
  removeWorkflow,
  removeMultipleWorkflows,
  type Workflow,
  type FetchWorkflowsResponse,
} from "../slices/workflowSlice"
import type { AppDispatch } from "../store"

interface FetchWorkflowsParams {
  page?: number
  pageSize?: number
  search?: string
  name?: string
  findleads?: boolean
  attachmentSuggestion?: boolean
  ordering?: string
  noPage?: boolean
}

interface CreateWorkflowParams {
  name: string
  prompt: string
  findleads?: boolean
  attachment_suggestion?: boolean
}

interface UpdateWorkflowParams {
  id: number
  name?: string
  prompt?: string
  findleads?: boolean
  attachment_suggestion?: boolean
}

export const fetchWorkflows = createAsyncThunk(
  "workflows/fetchAll",
  async (params?: FetchWorkflowsParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.pageSize) queryParams.append("page_size", params.pageSize.toString())
      if (params?.search) queryParams.append("search", params.search)
      if (params?.name) queryParams.append("name", params.name)
      if (params?.findleads !== undefined) queryParams.append("findleads", params.findleads.toString())
      if (params?.attachmentSuggestion !== undefined) queryParams.append("attachment_suggestion", params.attachmentSuggestion.toString())
      if (params?.ordering) queryParams.append("ordering", params.ordering)
      if (params?.noPage) queryParams.append("no_page", "true")

      const url = `/mail/workflows/${queryParams.toString() ? "?" + queryParams.toString() : ""}`
      const response = await api.get(url)
      return response.data as FetchWorkflowsResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch workflows")
    }
  }
)

export const createWorkflow = createAsyncThunk(
  "workflows/create",
  async (data: CreateWorkflowParams, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/workflows/", data)
      return response.data as Workflow
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create workflow")
    }
  }
)

export const getWorkflowDetails = createAsyncThunk(
  "workflows/getDetails",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/workflows/${id}/`)
      return response.data as Workflow
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch workflow details")
    }
  }
)

export const updateWorkflow = createAsyncThunk(
  "workflows/update",
  async (params: UpdateWorkflowParams, { rejectWithValue }) => {
    try {
      const { id, ...data } = params
      const response = await api.patch(`/mail/workflows/${id}/`, data)
      return response.data as Workflow
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update workflow")
    }
  }
)

export const deleteWorkflow = createAsyncThunk(
  "workflows/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/mail/workflows/${id}/`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to delete workflow")
    }
  }
)

export const bulkDeleteWorkflows = createAsyncThunk(
  "workflows/bulkDelete",
  async (workflowIds: number[], { rejectWithValue }) => {
    try {
      await api.post("/mail/workflows/bulk-delete/", { workflow_ids: workflowIds })
      return workflowIds
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to delete workflows")
    }
  }
)

export const handleFetchWorkflows = (params?: FetchWorkflowsParams) => async (dispatch: AppDispatch) => {
  dispatch(fetchWorkflowsStart())
  try {
    const resultAction = await dispatch(fetchWorkflows(params))
    if (fetchWorkflows.fulfilled.match(resultAction)) {
      dispatch(
        fetchWorkflowsSuccess({
          workflows: resultAction.payload.results,
          totalCount: resultAction.payload.count,
          page: params?.page || 1,
        })
      )
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

export const handleCreateWorkflow = (data: CreateWorkflowParams) => async (dispatch: AppDispatch) => {
  try {
    const resultAction = await dispatch(createWorkflow(data))
    if (createWorkflow.fulfilled.match(resultAction)) {
      dispatch(addWorkflow(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create workflow" }
  }
}

export const handleGetWorkflowDetails = (id: number) => async (dispatch: AppDispatch) => {
  try {
    const resultAction = await dispatch(getWorkflowDetails(id))
    if (getWorkflowDetails.fulfilled.match(resultAction)) {
      dispatch(setSelectedWorkflow(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch workflow details" }
  }
}

export const handleUpdateWorkflow = (params: UpdateWorkflowParams) => async (dispatch: AppDispatch) => {
  try {
    const resultAction = await dispatch(updateWorkflow(params))
    if (updateWorkflow.fulfilled.match(resultAction)) {
      dispatch(updateWorkflowInList(resultAction.payload))
      return { success: true, data: resultAction.payload }
    } else {
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update workflow" }
  }
}

export const handleDeleteWorkflow = (id: number) => async (dispatch: AppDispatch) => {
  try {
    const resultAction = await dispatch(deleteWorkflow(id))
    if (deleteWorkflow.fulfilled.match(resultAction)) {
      dispatch(removeWorkflow(resultAction.payload))
      return { success: true }
    } else {
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete workflow" }
  }
}

export const handleBulkDeleteWorkflows = (workflowIds: number[]) => async (dispatch: AppDispatch) => {
  try {
    const resultAction = await dispatch(bulkDeleteWorkflows(workflowIds))
    if (bulkDeleteWorkflows.fulfilled.match(resultAction)) {
      dispatch(removeMultipleWorkflows(resultAction.payload))
      return { success: true, deletedCount: resultAction.payload.length }
    } else {
      return { success: false, error: resultAction.payload }
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete workflows" }
  }
}

export const selectWorkflow = (workflow: Workflow) => async (dispatch: AppDispatch) => {
  dispatch(setSelectedWorkflow(workflow))
  return true
}
