import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchCampaignsStart,
  fetchCampaignsSuccess,
  fetchCampaignsFailure,
  fetchCampaignStart,
  fetchCampaignSuccess,
  fetchCampaignFailure,
  createCampaignStart,
  createCampaignSuccess,
  createCampaignFailure,
  updateCampaignStart,
  updateCampaignSuccess,
  updateCampaignFailure,
  deleteCampaignStart,
  deleteCampaignSuccess,
  deleteCampaignFailure,
} from "../slices/campaignSlice"
import type { AppDispatch } from "../store"

// Fetch all campaigns with search and pagination
export const fetchCampaigns = createAsyncThunk(
  "campaigns/fetchAll", 
  async (
    { search = "", page = 1 }: { search?: string; page?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (page > 1) params.append("page", page.toString())
      
      const url = `/mail/campaigns/${params.toString() ? `?${params.toString()}` : ""}`
      const response = await api.get(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch campaigns")
    }
  }
)

// Fetch a single campaign by ID
export const fetchCampaignById = createAsyncThunk("campaigns/fetchById", async (id: number, { rejectWithValue }) => {
  try {
    const response = await api.get(`/mail/campaigns/${id}/`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to fetch campaign")
  }
})

// Create a new campaign
export const createCampaign = createAsyncThunk("campaigns/create", async (formData: FormData, { rejectWithValue }) => {
  try {
    const response = await api.post("/mail/campaigns/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to create campaign")
  }
})

// Create a smart campaign
export const createSmartCampaign = createAsyncThunk(
  "campaigns/createSmart",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/mail/campaigns/smart/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          useLambda: true,
        }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create smart campaign")
    }
  },
)

// Update a campaign
export const updateCampaign = createAsyncThunk(
  "campaigns/update",
  async ({ id, formData }: { id: number; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/mail/campaigns/${id}/update/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update campaign")
    }
  },
)

// Delete a campaign
export const deleteCampaign = createAsyncThunk("campaigns/delete", async (id: number, { rejectWithValue }) => {
  try {
    await api.delete(`/mail/campaigns/${id}/`)
    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to delete campaign")
  }
})

// Bulk delete campaigns
export const bulkDeleteCampaigns = createAsyncThunk(
  "campaigns/bulkDelete",
  async (campaignIds: number[], { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/campaigns/bulk-delete/", { campaign_ids: campaignIds })
      return { ids: campaignIds, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete campaigns")
    }
  },
)

// Duplicate a campaign
export const duplicateCampaign = createAsyncThunk(
  "campaigns/duplicate",
  async ({ campaignId, numDuplicates = 1 }: { campaignId: number; numDuplicates?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/campaigns/duplicate/", {
        campaign_id: campaignId,
        num_duplicates: numDuplicates,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to duplicate campaign")
    }
  },
)

// Delete associated campaign data (templates and/or content)
export const deleteAssociatedData = createAsyncThunk(
  "campaigns/deleteAssociated",
  async (
    {
      campaignId,
      deleteContent,
      deleteTemplates,
    }: { campaignId: number; deleteContent: boolean; deleteTemplates: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(`/mail/campaigns/${campaignId}/delete-associated/`, {
        delete_content: deleteContent,
        delete_templates: deleteTemplates,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete associated data")
    }
  },
)

// Delete all campaign data
export const deleteAllCampaignData = createAsyncThunk(
  "campaigns/deleteAllData",
  async (campaignId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/mail/campaigns/${campaignId}/delete-all-data/`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete all campaign data")
    }
  },
)

// Fetch completed campaigns
export const fetchCompletedCampaigns = createAsyncThunk(
  "campaigns/fetchCompleted",
  async (
    {
      search,
      startDate,
      endDate,
      page,
      pageSize,
    }: { search?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number },
    { rejectWithValue },
  ) => {
    try {
      let url = "/mail/campaigns/completed/"
      const params = new URLSearchParams()

      if (search) params.append("search", search)
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      if (page) params.append("page", page.toString())
      if (pageSize) params.append("page_size", pageSize.toString())

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await api.get(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch completed campaigns")
    }
  },
)

// Thunk action creators for dispatching regular actions
export const handleFetchCampaigns = (
  { search = "", page = 1 }: { search?: string; page?: number } = {}
) => async (dispatch: AppDispatch) => {
  dispatch(fetchCampaignsStart())
  try {
    const resultAction = await dispatch(fetchCampaigns({ search, page }))
    if (fetchCampaigns.fulfilled.match(resultAction)) {
      dispatch(fetchCampaignsSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchCampaignsFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchCampaignsFailure(error.message || "Failed to fetch campaigns"))
    return false
  }
}

export const handleFetchCampaignById = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchCampaignStart())
  try {
    const resultAction = await dispatch(fetchCampaignById(id))
    if (fetchCampaignById.fulfilled.match(resultAction)) {
      dispatch(fetchCampaignSuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchCampaignFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchCampaignFailure(error.message || "Failed to fetch campaign"))
    return false
  }
}

export const handleCreateCampaign = (formData: FormData) => async (dispatch: AppDispatch) => {
  dispatch(createCampaignStart())
  try {
    const resultAction = await dispatch(createCampaign(formData))
    if (createCampaign.fulfilled.match(resultAction)) {
      dispatch(createCampaignSuccess(resultAction.payload))
      return true
    } else {
      dispatch(createCampaignFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(createCampaignFailure(error.message || "Failed to create campaign"))
    return false
  }
}

export const handleUpdateCampaign =
  ({ id, formData }: { id: number; formData: FormData }) =>
  async (dispatch: AppDispatch) => {
    dispatch(updateCampaignStart())
    try {
      const resultAction = await dispatch(updateCampaign({ id, formData }))
      if (updateCampaign.fulfilled.match(resultAction)) {
        dispatch(updateCampaignSuccess(resultAction.payload))
        return true
      } else {
        dispatch(updateCampaignFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(updateCampaignFailure(error.message || "Failed to update campaign"))
      return false
    }
  }

export const handleDeleteCampaign = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(deleteCampaignStart())
  try {
    const resultAction = await dispatch(deleteCampaign(id))
    if (deleteCampaign.fulfilled.match(resultAction)) {
      dispatch(deleteCampaignSuccess(id))
      return true
    } else {
      dispatch(deleteCampaignFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(deleteCampaignFailure(error.message || "Failed to delete campaign"))
    return false
  }
}
