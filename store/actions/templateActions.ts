import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchTemplatesStart,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
  fetchTemplateStart,
  fetchTemplateSuccess,
  fetchTemplateFailure,
  createTemplateStart,
  createTemplateSuccess,
  createTemplateFailure,
  updateTemplateStart,
  updateTemplateSuccess,
  updateTemplateFailure,
  deleteTemplateStart,
  deleteTemplateSuccess,
  deleteTemplateFailure,
  bulkDeleteTemplatesStart,
  bulkDeleteTemplatesSuccess,
  bulkDeleteTemplatesFailure,
} from "../slices/templateSlice"
import type { AppDispatch } from "../store"

// Fetch templates for a campaign
export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (campaignId?: number, { rejectWithValue }) => {
    try {
      let url = "/mail/templates/"
      if (campaignId) {
        url += `?campaign_id=${campaignId}`
      }
      const response = await api.get(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch templates")
    }
  },
)

// Fetch a single template by ID
export const fetchTemplateById = createAsyncThunk("templates/fetchById", async (id: number, { rejectWithValue }) => {
  try {
    const response = await api.get(`/mail/templates/${id}/`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch template")
  }
})

// Generate a template with AI
export const generateTemplate = createAsyncThunk(
  "templates/generate",
  async (
    { campaignId, templateName, requirements }: { campaignId: number; templateName?: string; requirements: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(
        "/mail/generate-template/",
        {
          campaign_id: campaignId,
          template_name: templateName,
          requirements,
        },
        { useLambda: true }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to generate template")
    }
  },
)

// Create a template manually
export const createTemplate = createAsyncThunk(
  "templates/create",
  async (templateData: { campaign: number; name: string; html_content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/templates/", templateData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create template")
    }
  },
)

// Create a raw HTML template
export const createRawHtmlTemplate = createAsyncThunk(
  "templates/createRawHtml",
  async (templateData: { campaign_id: number; name: string; html_content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/templates/raw-html/", templateData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create raw HTML template")
    }
  },
)

// Update a template
export const updateTemplate = createAsyncThunk(
  "templates/update",
  async (
    {
      id,
      templateData,
    }: {
      id: number
      templateData: { campaign?: number; name?: string; html_content?: string }
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/mail/templates/${id}/`, templateData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update template")
    }
  },
)

// Update a template with AI
export const updateTemplateWithAI = createAsyncThunk(
  "templates/updateWithAI",
  async ({ id, updateRequirements }: { id: number; updateRequirements: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/mail/templates/${id}/update-with-ai/`,
        { update_requirements: updateRequirements },
        { useLambda: true }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update template with AI")
    }
  },
)

// Delete a template
export const deleteTemplate = createAsyncThunk("templates/delete", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/mail/templates/${id}/`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete template")
  }
})

// Bulk delete templates
export const bulkDeleteTemplates = createAsyncThunk(
  "templates/bulkDelete",
  async ({ campaignId, templateIds }: { campaignId: number; templateIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/templates/bulk-delete/", {
        campaign_id: campaignId,
        template_ids: templateIds,
      })
      return { ids: templateIds, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete templates")
    }
  },
)

// Thunk action creators for dispatching regular actions
export const handleFetchTemplates = (campaignId?: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchTemplatesStart())
  try {
    const resultAction = await dispatch(fetchTemplates(campaignId))
    if (fetchTemplates.fulfilled.match(resultAction)) {
      dispatch(fetchTemplatesSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchTemplatesFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchTemplatesFailure(error.message || "Failed to fetch templates"))
    return false
  }
}

export const handleFetchTemplateById = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchTemplateStart())
  try {
    const resultAction = await dispatch(fetchTemplateById(id))
    if (fetchTemplateById.fulfilled.match(resultAction)) {
      dispatch(fetchTemplateSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchTemplateFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchTemplateFailure(error.message || "Failed to fetch template"))
    return false
  }
}

export const handleGenerateTemplate =
  ({ campaignId, templateName, requirements }: { campaignId: number; templateName?: string; requirements: string }) =>
  async (dispatch: AppDispatch) => {
    dispatch(createTemplateStart())
    try {
      const resultAction = await dispatch(generateTemplate({ campaignId, templateName, requirements }))
      if (generateTemplate.fulfilled.match(resultAction)) {
        dispatch(createTemplateSuccess(resultAction.payload))
        return true
      } else {
        dispatch(createTemplateFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(createTemplateFailure(error.message || "Failed to generate template"))
      return false
    }
  }

export const handleCreateTemplate =
  (templateData: { campaign: number; name: string; html_content: string }) => async (dispatch: AppDispatch) => {
    dispatch(createTemplateStart())
    try {
      const resultAction = await dispatch(createTemplate(templateData))
      if (createTemplate.fulfilled.match(resultAction)) {
        dispatch(createTemplateSuccess(resultAction.payload))
        return true
      } else {
        dispatch(createTemplateFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(createTemplateFailure(error.message || "Failed to create template"))
      return false
    }
  }

export const handleUpdateTemplate =
  ({
    id,
    templateData,
  }: {
    id: number
    templateData: { campaign?: number; name?: string; html_content?: string }
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(updateTemplateStart())
    try {
      const resultAction = await dispatch(updateTemplate({ id, templateData }))
      if (updateTemplate.fulfilled.match(resultAction)) {
        dispatch(updateTemplateSuccess(resultAction.payload))
        return true
      } else {
        dispatch(updateTemplateFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(updateTemplateFailure(error.message || "Failed to update template"))
      return false
    }
  }

export const handleDeleteTemplate = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(deleteTemplateStart())
  try {
    const resultAction = await dispatch(deleteTemplate(id))
    if (deleteTemplate.fulfilled.match(resultAction)) {
      dispatch(deleteTemplateSuccess(id))
      return true
    } else {
      dispatch(deleteTemplateFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(deleteTemplateFailure(error.message || "Failed to delete template"))
    return false
  }
}

export const handleBulkDeleteTemplates =
  ({ campaignId, templateIds }: { campaignId: number; templateIds: number[] }) =>
  async (dispatch: AppDispatch) => {
    dispatch(bulkDeleteTemplatesStart())
    try {
      const resultAction = await dispatch(bulkDeleteTemplates({ campaignId, templateIds }))
      if (bulkDeleteTemplates.fulfilled.match(resultAction)) {
        dispatch(bulkDeleteTemplatesSuccess(templateIds))
        return true
      } else {
        dispatch(bulkDeleteTemplatesFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(bulkDeleteTemplatesFailure(error.message || "Failed to delete templates"))
      return false
    }
  }
