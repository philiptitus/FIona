import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface SentEmail {
  id: number
  user: number | null
  mailbox: number | null
  dispatch: number | null
  template: number | null
  content: number | null
  recipient: string
  subject: string
  body: string
  is_html: boolean
  status: string
  sent_at: string
  message_id: string | null
  error_message: string | null
  response_data: any
  created_at: string
  updated_at: string
}

export interface SentEmailListState {
  items: SentEmail[]
  count: number
  next: string | null
  previous: string | null
  isLoading: boolean
  error: string | null
  filters: Record<string, any>
}

export interface SentEmailDetailState {
  item: SentEmail | null
  isLoading: boolean
  error: string | null
}

const initialListState: SentEmailListState = {
  items: [],
  count: 0,
  next: null,
  previous: null,
  isLoading: false,
  error: null,
  filters: {},
}

const initialDetailState: SentEmailDetailState = {
  item: null,
  isLoading: false,
  error: null,
}

const sentEmailSlice = createSlice({
  name: "sentEmail",
  initialState: {
    list: initialListState,
    detail: initialDetailState,
  },
  reducers: {
    fetchSentEmailsStart(state) {
      state.list.isLoading = true
      state.list.error = null
    },
    fetchSentEmailsSuccess(state, action: PayloadAction<{ results: SentEmail[]; count: number; next: string | null; previous: string | null }>) {
      state.list.isLoading = false
      state.list.items = action.payload.results
      state.list.count = action.payload.count
      state.list.next = action.payload.next
      state.list.previous = action.payload.previous
      state.list.error = null
    },
    fetchSentEmailsFailure(state, action: PayloadAction<string>) {
      state.list.isLoading = false
      state.list.error = action.payload
    },
    setSentEmailFilters(state, action: PayloadAction<Record<string, any>>) {
      state.list.filters = action.payload
    },
    fetchSentEmailDetailStart(state) {
      state.detail.isLoading = true
      state.detail.error = null
    },
    fetchSentEmailDetailSuccess(state, action: PayloadAction<SentEmail>) {
      state.detail.isLoading = false
      state.detail.item = action.payload
      state.detail.error = null
    },
    fetchSentEmailDetailFailure(state, action: PayloadAction<string>) {
      state.detail.isLoading = false
      state.detail.error = action.payload
    },
    clearSentEmailDetail(state) {
      state.detail.item = null
      state.detail.error = null
      state.detail.isLoading = false
    },
  },
})

export const {
  fetchSentEmailsStart,
  fetchSentEmailsSuccess,
  fetchSentEmailsFailure,
  setSentEmailFilters,
  fetchSentEmailDetailStart,
  fetchSentEmailDetailSuccess,
  fetchSentEmailDetailFailure,
  clearSentEmailDetail,
} = sentEmailSlice.actions

export default sentEmailSlice.reducer 