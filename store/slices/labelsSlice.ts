import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Label {
  id: number
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Label[]
}

interface LabelsState {
  labels: Label[]
  isLoading: boolean
  error: string | null
  pagination: {
    count: number
    next: string | null
    previous: string | null
    currentPage: number
    totalPages: number
  }
}

const initialState: LabelsState = {
  labels: [],
  isLoading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 0,
  },
}

const labelsSlice = createSlice({
  name: "labels",
  initialState,
  reducers: {
    fetchLabelsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchLabelsSuccess: (state, action: PayloadAction<PaginatedResponse>) => {
      state.isLoading = false
      state.labels = action.payload.results
      state.pagination = {
        count: action.payload.count,
        next: action.payload.next,
        previous: action.payload.previous,
        currentPage: state.pagination.currentPage,
        totalPages: Math.ceil(action.payload.count / 10),
      }
      state.error = null
    },
    fetchLabelsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setLabelsCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
  },
})

export const { fetchLabelsStart, fetchLabelsSuccess, fetchLabelsFailure, setLabelsCurrentPage } = labelsSlice.actions

export type { Label }

export default labelsSlice.reducer
