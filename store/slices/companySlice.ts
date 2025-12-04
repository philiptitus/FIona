import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Company {
  id: number
  campaign: number
  company_name: string
  company_name_for_emails: string
  company_email: string
  company_phone?: string
  company_street?: string
  company_city?: string
  company_state?: string
  company_country?: string
  company_postal_code?: string
  company_address?: string
  account_stage?: string
  industry?: string
  keywords?: string
  short_description?: string
  website?: string
  number_of_employees?: number
  annual_revenue?: string
  number_of_retail_locations?: number
  total_funding?: string
  latest_funding?: string
  latest_funding_amount?: string
  last_raised_at?: string
  founded_year?: number
  technologies?: string
  sic_codes?: string
  naics_codes?: string
  company_linkedin_url?: string
  facebook_url?: string
  twitter_url?: string
  logo_url?: string
  subsidiary_of?: string | null
  account_owner?: string
  apollo_account_id?: string
  email_sent: boolean
  replied: boolean
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Company[]
}

interface CompanyState {
  companies: Company[]
  currentCompany: Company | null
  isLoading: boolean
  error: string | null
  pagination: {
    count: number
    next: string | null
    previous: string | null
    currentPage: number
    totalPages: number
  }
  searchQuery: string
  selectedCampaignId: number | null
}

const initialState: CompanyState = {
  companies: [],
  currentCompany: null,
  isLoading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 0,
  },
  searchQuery: "",
  selectedCampaignId: null,
}

const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    fetchCompaniesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchCompaniesSuccess: (state, action: PayloadAction<PaginatedResponse>) => {
      state.isLoading = false
      state.companies = action.payload.results
      state.pagination = {
        count: action.payload.count,
        next: action.payload.next,
        previous: action.payload.previous,
        currentPage: state.pagination.currentPage,
        totalPages: Math.ceil(action.payload.count / 10),
      }
      state.error = null
    },
    fetchCompaniesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchCompanyStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.isLoading = false
      state.currentCompany = action.payload
      state.error = null
    },
    fetchCompanyFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createCompanyStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.isLoading = false
      state.companies = [...state.companies, action.payload]
      state.currentCompany = action.payload
      state.error = null
    },
    createCompanyFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateCompanyStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.isLoading = false
      state.companies = state.companies.map((company) =>
        company.id === action.payload.id ? action.payload : company,
      )
      state.currentCompany = action.payload
      state.error = null
    },
    updateCompanyFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    deleteCompanyStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteCompanySuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false
      state.companies = state.companies.filter((company) => company.id !== action.payload)
      state.currentCompany = null
      state.error = null
    },
    deleteCompanyFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkDeleteCompaniesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkDeleteCompaniesSuccess: (state, action: PayloadAction<number[]>) => {
      state.isLoading = false
      state.companies = state.companies.filter((company) => !action.payload.includes(company.id))
      state.error = null
    },
    bulkDeleteCompaniesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkCreateCompaniesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkCreateCompaniesSuccess: (state, action: PayloadAction<Company[]>) => {
      state.isLoading = false
      state.companies = [...state.companies, ...action.payload]
      state.error = null
    },
    bulkCreateCompaniesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    disassociateCompaniesStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    disassociateCompaniesSuccess: (state, action: PayloadAction<number[]>) => {
      state.isLoading = false
      state.companies = state.companies.filter((company) => !action.payload.includes(company.id))
      state.error = null
    },
    disassociateCompaniesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearCurrentCompany: (state) => {
      state.currentCompany = null
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.pagination.currentPage = 1
    },
    setSelectedCampaignId: (state, action: PayloadAction<number | null>) => {
      state.selectedCampaignId = action.payload
    },
  },
})

export const {
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
  clearCurrentCompany,
  setCurrentPage,
  setSearchQuery,
  setSelectedCampaignId,
} = companySlice.actions

export default companySlice.reducer
