import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EmailListEntry {
  id: number
  campaign: number | null
  organization_name: string
  email: string
  context?: string
  is_sent: boolean
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
  title?: string
  company_name_for_emails?: string
  email_status?: string
  primary_email_source?: string
  email_confidence?: string
  primary_email_catch_all_status?: string
  primary_email_last_verified_at?: string
  seniority?: string
  departments?: string
  contact_owner?: string
  work_direct_phone?: string
  home_phone?: string
  mobile_phone?: string
  corporate_phone?: string
  other_phone?: string
  stage?: string
  lists?: string
  last_contacted?: string
  account_owner?: string
  num_employees?: number
  industry?: string
  keywords?: string
  person_linkedin_url?: string
  website?: string
  company_linkedin_url?: string
  facebook_url?: string
  twitter_url?: string
  city?: string
  state?: string
  country?: string
  company_address?: string
  company_city?: string
  company_state?: string
  company_country?: string
  company_phone?: string
  technologies?: string
  annual_revenue?: number
  total_funding?: number
  latest_funding?: string
  latest_funding_amount?: number
  last_raised_at?: string
  subsidiary_of?: string
  email_sent?: boolean
  email_open?: boolean
  email_bounced?: boolean
  replied?: boolean
  demoed?: boolean
  number_of_retail_locations?: number
  apollo_contact_id?: string
  apollo_account_id?: string
  secondary_email?: string
  secondary_email_source?: string
  tertiary_email?: string
  tertiary_email_source?: string
}

interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
  currentPage: number
  totalPages: number
}

interface EmailState {
  emails: EmailListEntry[]
  sentEmails: EmailListEntry[]
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo | null
  // For backward compatibility - will be removed in future
  isLegacyMode: boolean
}

const initialState: EmailState = {
  emails: [],
  sentEmails: [],
  isLoading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1
  },
  isLegacyMode: false
}

const emailSlice = createSlice({
  name: "emails",
  initialState,
  reducers: {
    fetchEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchEmailsSuccess: (state, action: PayloadAction<{ results?: EmailListEntry[], emails?: EmailListEntry[], count?: number, next?: string | null, previous?: string | null, currentPage?: number, totalPages?: number }>) => {
      state.isLoading = false
      state.error = null
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(action.payload.results)) {
        // New paginated response
        state.emails = action.payload.results
        state.pagination = {
          count: action.payload.count || 0,
          next: action.payload.next || null,
          previous: action.payload.previous || null,
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1
        }
        state.isLegacyMode = false
      } else if (Array.isArray(action.payload.emails)) {
        // Legacy response for backward compatibility
        state.emails = action.payload.emails
        state.isLegacyMode = true
      } else if (Array.isArray(action.payload)) {
        // Fallback for very old response format
        state.emails = action.payload
        state.isLegacyMode = true
      }
    },
    fetchEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchSentEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchSentEmailsSuccess: (state, action: PayloadAction<EmailListEntry[]>) => {
      state.isLoading = false
      state.sentEmails = action.payload
      state.error = null
    },
    fetchSentEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createEmailStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createEmailSuccess: (state, action: PayloadAction<EmailListEntry>) => {
      state.isLoading = false
      state.emails = [...state.emails, action.payload]
      state.error = null
    },
    createEmailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkCreateEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkCreateEmailsSuccess: (state, action: PayloadAction<EmailListEntry[]>) => {
      state.isLoading = false
      state.emails = [...state.emails, ...action.payload]
      state.error = null
    },
    bulkCreateEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateEmailStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateEmailSuccess: (state, action: PayloadAction<EmailListEntry>) => {
      state.isLoading = false
      state.emails = state.emails.map((email) => (email.id === action.payload.id ? action.payload : email))
      state.error = null
    },
    updateEmailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    deleteEmailStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteEmailSuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false
      state.emails = state.emails.filter((email) => email.id !== action.payload)
      state.error = null
    },
    deleteEmailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkDeleteEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkDeleteEmailsSuccess: (state, action: PayloadAction<number[]>) => {
      state.isLoading = false
      state.emails = state.emails.filter((email) => !action.payload.includes(email.id))
      state.error = null
    },
    bulkDeleteEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    smartCreateEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    smartCreateEmailsSuccess: (state, action: PayloadAction<EmailListEntry[]>) => {
      state.isLoading = false
      state.emails = [...state.emails, ...action.payload]
      state.error = null
    },
    smartCreateEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    addExistingEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    addExistingEmailsSuccess: (state, action: PayloadAction<EmailListEntry[]>) => {
      state.isLoading = false
      state.emails = [...state.emails, ...action.payload]
      state.error = null
    },
    addExistingEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    disassociateEmailsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    disassociateEmailsSuccess: (state, action: PayloadAction<{emailIds: number[], campaignId: number}>) => {
      state.isLoading = false
      // Update emails by removing the campaign association
      state.emails = state.emails.map(email => {
        if (action.payload.emailIds.includes(email.id)) {
          const { campaign, ...rest } = email
          return { ...rest, campaign: null }
        }
        return email
      })
      state.error = null
    },
    disassociateEmailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
  },
})

export const {
  fetchEmailsStart,
  fetchEmailsSuccess,
  fetchEmailsFailure,
  fetchSentEmailsStart,
  fetchSentEmailsSuccess,
  fetchSentEmailsFailure,
  createEmailStart,
  createEmailSuccess,
  createEmailFailure,
  bulkCreateEmailsStart,
  bulkCreateEmailsSuccess,
  bulkCreateEmailsFailure,
  updateEmailStart,
  updateEmailSuccess,
  updateEmailFailure,
  deleteEmailStart,
  deleteEmailSuccess,
  deleteEmailFailure,
  bulkDeleteEmailsStart,
  bulkDeleteEmailsSuccess,
  bulkDeleteEmailsFailure,
  smartCreateEmailsStart,
  smartCreateEmailsSuccess,
  smartCreateEmailsFailure,
  addExistingEmailsStart,
  addExistingEmailsSuccess,
  addExistingEmailsFailure,
  disassociateEmailsStart,
  disassociateEmailsSuccess,
  disassociateEmailsFailure,
} = emailSlice.actions

export default emailSlice.reducer
