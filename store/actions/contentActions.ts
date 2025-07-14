import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchContentsStart,
  fetchContentsSuccess,
  fetchContentsFailure,
  fetchContentStart,
  fetchContentSuccess,
  fetchContentFailure,
  createContentStart,
  createContentSuccess,
  createContentFailure,
  updateContentStart,
  updateContentSuccess,
  updateContentFailure,
  deleteContentStart,
  deleteContentSuccess,
  deleteContentFailure,
  bulkDeleteContentsStart,
  bulkDeleteContentsSuccess,
  bulkDeleteContentsFailure,
} from "../slices/contentSlice"
import type { AppDispatch } from "../store"

// Fetch content for a campaign
export const fetchContents = createAsyncThunk("content/fetchAll", async (campaignId?: number, { rejectWithValue }) => {
  try {
    let url = "/mail/email-content/"
    if (campaignId) {
      url += `?campaign_id=${campaignId}`
    }
    const response = await api.get(url)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch content")
  }
})

// Fetch a single content by ID
export const fetchContentById = createAsyncThunk("content/fetchById", async (id: number, { rejectWithValue }) => {
  try {
    const response = await api.get(`/mail/email-content/${id}/`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch content")
  }
})

// Generate content with AI
export const generateContent = createAsyncThunk(
  "content/generate",
  async (
    { campaignId, context, tone = "professional" }: { campaignId: number; context: string; tone?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(
        "/mail/email-content/generate/",
        {
          campaign_id: campaignId,
          context,
          tone,
        },
        { useLambda: true }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to generate content")
    }
  },
)

// Create content manually
export const createContent = createAsyncThunk(
  "content/create",
  async (contentData: { campaign: number; name: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/email-content/", contentData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create content")
    }
  },
)

// Update content
export const updateContent = createAsyncThunk(
  "content/update",
  async (
    { id, contentData }: { id: number; contentData: { campaign?: number; name?: string; content?: string } },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(`/mail/email-content/${id}/`, contentData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update content")
    }
  },
)

// Update content with AI
export const updateContentWithAI = createAsyncThunk(
  "content/updateWithAI",
  async ({ id, updateRequirements }: { id: number; updateRequirements: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/mail/email-content/${id}/update-with-ai/`,
        { update_requirements: updateRequirements },
        { useLambda: true }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update content with AI")
    }
  },
)

// Delete content
export const deleteContent = createAsyncThunk("content/delete", async (id: number, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/mail/email-content/${id}/`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete content")
  }
})

// Bulk delete content
export const bulkDeleteContents = createAsyncThunk(
  "content/bulkDelete",
  async ({ campaignId, contentIds }: { campaignId: number; contentIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/email-content/bulk-delete/", { campaign_id: campaignId, content_ids: contentIds })
      return contentIds
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to bulk delete content")
    }
  },
)

// Thunk action creators for dispatching regular actions
export const handleFetchContents = (campaignId?: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchContentsStart())
  try {
    const result = await dispatch(fetchContents(campaignId))
    if (fetchContents.fulfilled.match(result)) {
      dispatch(fetchContentsSuccess(result.payload))
    } else {
      dispatch(fetchContentsFailure(result.payload as string))
    }
  } catch (error: any) {
    dispatch(fetchContentsFailure(error.message))
  }
}

export const handleFetchContentById = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchContentStart())
  try {
    const result = await dispatch(fetchContentById(id))
    if (fetchContentById.fulfilled.match(result)) {
      dispatch(fetchContentSuccess(result.payload))
    } else {
      dispatch(fetchContentFailure(result.payload as string))
    }
  } catch (error: any) {
    dispatch(fetchContentFailure(error.message))
  }
}

export const handleGenerateContent = ({ campaignId, context, tone }: { campaignId: number; context: string; tone?: string }) => async (dispatch: AppDispatch) => {
  try {
    const result = await dispatch(generateContent({ campaignId, context, tone }))
    // You can dispatch a success action here if needed
    return result
  } catch (error: any) {
    // You can dispatch a failure action here if needed
    throw error
  }
}

export const handleCreateContent = (contentData: { campaign: number; name: string; content: string }) => async (dispatch: AppDispatch) => {
  dispatch(createContentStart())
  try {
    const result = await dispatch(createContent(contentData))
    if (createContent.fulfilled.match(result)) {
      dispatch(createContentSuccess(result.payload))
    } else {
      dispatch(createContentFailure(result.payload as string))
    }
  } catch (error: any) {
    dispatch(createContentFailure(error.message))
  }
}

export const handleUpdateContent = ({ id, contentData }: { id: number; contentData: { campaign?: number; name?: string; content?: string } }) => async (dispatch: AppDispatch) => {
  dispatch(updateContentStart())
  try {
    const result = await dispatch(updateContent({ id, contentData }))
    if (updateContent.fulfilled.match(result)) {
      dispatch(updateContentSuccess(result.payload))
    } else {
      dispatch(updateContentFailure(result.payload as string))
    }
  } catch (error: any) {
    dispatch(updateContentFailure(error.message))
  }
}

export const handleDeleteContent = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(deleteContentStart())
  try {
    const result = await dispatch(deleteContent(id))
    if (deleteContent.fulfilled.match(result)) {
      dispatch(deleteContentSuccess(id))
    } else {
      dispatch(deleteContentFailure(result.payload as string))
    }
  } catch (error: any) {
    dispatch(deleteContentFailure(error.message))
  }
}

export const handleBulkDeleteContents = ({ campaignId, contentIds }: { campaignId: number; contentIds: number[] }) => async (dispatch: AppDispatch) => {
  dispatch(bulkDeleteContentsStart())
  try {
    const result = await dispatch(bulkDeleteContents({ campaignId, contentIds }))
    if (bulkDeleteContents.fulfilled.match(result)) {
      dispatch(bulkDeleteContentsSuccess(contentIds))
    } else {
      dispatch(bulkDeleteContentsFailure(result.payload as string))
    }
  } catch (error: any) {
    dispatch(bulkDeleteContentsFailure(error.message))
  }
}
