import { createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import {
  fetchCompaniesStart,
  fetchCompaniesSuccess,
  fetchCompaniesFailure,
  fetchCompanyStart,
  fetchCompanySuccess,
  fetchCompanyFailure,
  createCompanyStart,
  createCompanySuccess,
  createCompanyFailure,
  updateCompanyStart,
  updateCompanySuccess,
  updateCompanyFailure,
  deleteCompanyStart,
  deleteCompanySuccess,
  deleteCompanyFailure,
  bulkDeleteCompaniesStart,
  bulkDeleteCompaniesSuccess,
  bulkDeleteCompaniesFailure,
  bulkCreateCompaniesStart,
  bulkCreateCompaniesSuccess,
  bulkCreateCompaniesFailure,
  disassociateCompaniesStart,
  disassociateCompaniesSuccess,
  disassociateCompaniesFailure,
} from "../slices/companySlice"
import type { AppDispatch } from "../store"

// Fetch all companies with search, filters, and pagination
export const fetchCompanies = createAsyncThunk(
  "companies/fetchAll",
  async (
    {
      campaignId,
      search = "",
      page = 1,
      companyEmail = "",
      companyName = "",
      industry = "",
      accountStage = "",
      country = "",
      emailSent,
    }: {
      campaignId?: number
      search?: string
      page?: number
      companyEmail?: string
      companyName?: string
      industry?: string
      accountStage?: string
      country?: string
      emailSent?: boolean
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams()
      if (campaignId) params.append("campaign_id", campaignId.toString())
      if (search) params.append("search", search)
      if (page > 1) params.append("page", page.toString())
      if (companyEmail) params.append("company_email", companyEmail)
      if (companyName) params.append("company_name", companyName)
      if (industry) params.append("industry", industry)
      if (accountStage) params.append("account_stage", accountStage)
      if (country) params.append("country", country)
      if (emailSent !== undefined) params.append("email_sent", emailSent.toString())

      const url = `/mail/companies/${params.toString() ? `?${params.toString()}` : ""}`
      const response = await api.get(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch companies")
    }
  }
)

// Fetch a single company by ID
export const fetchCompanyById = createAsyncThunk(
  "companies/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/mail/companies/${id}/`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch company")
    }
  }
)

// Create a new company
export const createCompany = createAsyncThunk(
  "companies/create",
  async (companyData: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/companies/", companyData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create company")
    }
  }
)

// Update a company (full update)
export const updateCompany = createAsyncThunk(
  "companies/update",
  async ({ id, data }: { id: number; data: Record<string, any> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/mail/companies/${id}/`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update company")
    }
  }
)

// Partial update a company
export const patchCompany = createAsyncThunk(
  "companies/patch",
  async ({ id, data }: { id: number; data: Record<string, any> }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/mail/companies/${id}/`, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update company")
    }
  }
)

// Delete a company
export const deleteCompany = createAsyncThunk(
  "companies/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/mail/companies/${id}/`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete company")
    }
  }
)

// Bulk delete companies
export const bulkDeleteCompanies = createAsyncThunk(
  "companies/bulkDelete",
  async ({ campaignId, companyIds }: { campaignId: number; companyIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/companies/bulk-delete/", {
        campaign_id: campaignId,
        company_ids: companyIds,
      })
      return { ids: companyIds, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete companies")
    }
  }
)

// Bulk create companies (JSON)
export const bulkCreateCompaniesJson = createAsyncThunk(
  "companies/bulkCreateJson",
  async (
    {
      campaignId,
      companies,
      checkUserDuplicates = true,
    }: {
      campaignId: number
      companies: Record<string, any>[]
      checkUserDuplicates?: boolean
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/mail/companies/bulk-create/", {
        campaign_id: campaignId,
        check_user_duplicates: checkUserDuplicates,
        companies,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create companies")
    }
  }
)

// Bulk create companies (CSV file)
export const bulkCreateCompaniesCsv = createAsyncThunk(
  "companies/bulkCreateCsv",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/companies/bulk-create/", formData,
        {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create companies")
    }
  }
)

// Disassociate companies from campaign
export const disassociateCompanies = createAsyncThunk(
  "companies/disassociate",
  async ({ campaignId, companyIds }: { campaignId: number; companyIds: number[] }, { rejectWithValue }) => {
    try {
      const response = await api.post("/mail/companies/disassociate/", {
        campaign_id: campaignId,
        company_ids: companyIds,
      })
      return { ids: companyIds, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to disassociate companies")
    }
  }
)

// Thunk action creators for dispatching regular actions
export const handleFetchCompanies =
  ({
    campaignId,
    search = "",
    page = 1,
    companyEmail = "",
    companyName = "",
    industry = "",
    accountStage = "",
    country = "",
    emailSent,
  }: {
    campaignId?: number
    search?: string
    page?: number
    companyEmail?: string
    companyName?: string
    industry?: string
    accountStage?: string
    country?: string
    emailSent?: boolean
  } = {}) =>
  async (dispatch: AppDispatch) => {
    dispatch(fetchCompaniesStart())
    try {
      const resultAction = await dispatch(
        fetchCompanies({
          campaignId,
          search,
          page,
          companyEmail,
          companyName,
          industry,
          accountStage,
          country,
          emailSent,
        })
      )
      if (fetchCompanies.fulfilled.match(resultAction)) {
        dispatch(fetchCompaniesSuccess(resultAction.payload))
        return true
      } else {
        dispatch(fetchCompaniesFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(fetchCompaniesFailure(error.message || "Failed to fetch companies"))
      return false
    }
  }

export const handleFetchCompanyById = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(fetchCompanyStart())
  try {
    const resultAction = await dispatch(fetchCompanyById(id))
    if (fetchCompanyById.fulfilled.match(resultAction)) {
      dispatch(fetchCompanySuccess(resultAction.payload))
      return true
    } else {
      dispatch(fetchCompanyFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(fetchCompanyFailure(error.message || "Failed to fetch company"))
    return false
  }
}

export const handleCreateCompany =
  (companyData: Record<string, any>) => async (dispatch: AppDispatch) => {
    dispatch(createCompanyStart())
    try {
      const resultAction = await dispatch(createCompany(companyData))
      if (createCompany.fulfilled.match(resultAction)) {
        dispatch(createCompanySuccess(resultAction.payload))
        return true
      } else {
        dispatch(createCompanyFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(createCompanyFailure(error.message || "Failed to create company"))
      return false
    }
  }

export const handleUpdateCompany =
  ({ id, data }: { id: number; data: Record<string, any> }) =>
  async (dispatch: AppDispatch) => {
    dispatch(updateCompanyStart())
    try {
      const resultAction = await dispatch(updateCompany({ id, data }))
      if (updateCompany.fulfilled.match(resultAction)) {
        dispatch(updateCompanySuccess(resultAction.payload))
        return true
      } else {
        dispatch(updateCompanyFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(updateCompanyFailure(error.message || "Failed to update company"))
      return false
    }
  }

export const handleDeleteCompany = (id: number) => async (dispatch: AppDispatch) => {
  dispatch(deleteCompanyStart())
  try {
    const resultAction = await dispatch(deleteCompany(id))
    if (deleteCompany.fulfilled.match(resultAction)) {
      dispatch(deleteCompanySuccess(id))
      return true
    } else {
      dispatch(deleteCompanyFailure(resultAction.payload as string))
      return false
    }
  } catch (error: any) {
    dispatch(deleteCompanyFailure(error.message || "Failed to delete company"))
    return false
  }
}

export const handleBulkDeleteCompanies =
  ({ campaignId, companyIds }: { campaignId: number; companyIds: number[] }) =>
  async (dispatch: AppDispatch) => {
    dispatch(bulkDeleteCompaniesStart())
    try {
      const resultAction = await dispatch(bulkDeleteCompanies({ campaignId, companyIds }))
      if (bulkDeleteCompanies.fulfilled.match(resultAction)) {
        dispatch(bulkDeleteCompaniesSuccess(companyIds))
        return true
      } else {
        dispatch(bulkDeleteCompaniesFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(bulkDeleteCompaniesFailure(error.message || "Failed to delete companies"))
      return false
    }
  }

export const handleBulkCreateCompaniesJson =
  ({
    campaignId,
    companies,
    checkUserDuplicates = true,
  }: {
    campaignId: number
    companies: Record<string, any>[]
    checkUserDuplicates?: boolean
  }) =>
  async (dispatch: AppDispatch) => {
    dispatch(bulkCreateCompaniesStart())
    try {
      const resultAction = await dispatch(
        bulkCreateCompaniesJson({ campaignId, companies, checkUserDuplicates })
      )
      if (bulkCreateCompaniesJson.fulfilled.match(resultAction)) {
        dispatch(bulkCreateCompaniesSuccess(resultAction.payload.created))
        return resultAction.payload
      } else {
        dispatch(bulkCreateCompaniesFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(bulkCreateCompaniesFailure(error.message || "Failed to create companies"))
      return false
    }
  }

export const handleBulkCreateCompaniesCsv =
  (formData: FormData) =>
  async (dispatch: AppDispatch) => {
    dispatch(bulkCreateCompaniesStart())
    try {
      const resultAction = await dispatch(bulkCreateCompaniesCsv(formData))
      if (bulkCreateCompaniesCsv.fulfilled.match(resultAction)) {
        dispatch(bulkCreateCompaniesSuccess(resultAction.payload.created))
        return resultAction.payload
      } else {
        dispatch(bulkCreateCompaniesFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(bulkCreateCompaniesFailure(error.message || "Failed to create companies"))
      return false
    }
  }

export const handleDisassociateCompanies =
  ({ campaignId, companyIds }: { campaignId: number; companyIds: number[] }) =>
  async (dispatch: AppDispatch) => {
    dispatch(disassociateCompaniesStart())
    try {
      const resultAction = await dispatch(disassociateCompanies({ campaignId, companyIds }))
      if (disassociateCompanies.fulfilled.match(resultAction)) {
        dispatch(disassociateCompaniesSuccess(companyIds))
        return true
      } else {
        dispatch(disassociateCompaniesFailure(resultAction.payload as string))
        return false
      }
    } catch (error: any) {
      dispatch(disassociateCompaniesFailure(error.message || "Failed to disassociate companies"))
      return false
    }
  }
