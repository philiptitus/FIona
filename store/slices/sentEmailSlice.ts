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
  filters: {
    // Text search
    recipient?: string
    subject?: string
    message_id?: string
    error_message?: string
    
    // Exact match
    status?: string
    is_html?: boolean
    
    // Date range
    sent_at_after?: string
    sent_at_before?: string
    
    // Related objects
    mailbox?: number
    template?: number
    content?: number
    dispatch?: number
    
    // Pagination
    page?: number
    page_size?: number
  }
  
  // Pagination state
  pagination: {
    currentPage: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
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
  filters: {
    page: 1,
    page_size: 20
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalItems: 0
  }
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
    fetchSentEmailsSuccess(state, action: PayloadAction<{ 
      results: SentEmail[]; 
      count: number; 
      next: string | null; 
      previous: string | null;
      currentPage?: number;
      totalPages?: number;
    }>) {
      state.list.isLoading = false;
      state.list.items = action.payload.results;
      state.list.count = action.payload.count;
      state.list.next = action.payload.next;
      state.list.previous = action.payload.previous;
      state.list.error = null;
      
      // Update pagination
      if (action.payload.currentPage) {
        state.list.filters.page = action.payload.currentPage;
        state.list.pagination.currentPage = action.payload.currentPage;
      }
      
      if (action.payload.totalPages) {
        state.list.pagination.totalPages = action.payload.totalPages;
      }
      
      state.list.pagination.totalItems = action.payload.count;
    },
    fetchSentEmailsFailure(state, action: PayloadAction<string>) {
      state.list.isLoading = false
      state.list.error = action.payload
    },
    setSentEmailFilters(state, action: PayloadAction<Partial<SentEmailListState['filters']>>) {
      // Merge new filters with existing ones
      state.list.filters = {
        ...state.list.filters,
        ...action.payload,
        // Ensure page is reset to 1 when filters change
        ...(Object.keys(action.payload).some(key => key !== 'page' && key !== 'page_size') 
          ? { page: 1 } 
          : {})
      };
      
      // Update pagination state if page or page_size changed
      if (action.payload.page_size !== undefined) {
        state.list.pagination.pageSize = action.payload.page_size;
      }
    },
    
    // New action to update pagination
    setPage(state, action: PayloadAction<number>) {
      state.list.filters.page = action.payload;
      state.list.pagination.currentPage = action.payload;
    },
    
    // New action to update page size
    setPageSize(state, action: PayloadAction<number>) {
      state.list.filters.page_size = action.payload;
      state.list.pagination.pageSize = action.payload;
      state.list.filters.page = 1; // Reset to first page
      state.list.pagination.currentPage = 1;
    },
    
    // New action to reset all filters
    resetFilters(state) {
      state.list.filters = {
        page: 1,
        page_size: state.list.pagination.pageSize
      };
      state.list.pagination.currentPage = 1;
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