import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface EmailContent {
  id: number
  campaign: number
  name: string
  content: string
  created_at: string
  updated_at: string
}

interface ContentState {
  contents: EmailContent[]
  currentContent: EmailContent | null
  isLoading: boolean
  error: string | null
}

const initialState: ContentState = {
  contents: [],
  currentContent: null,
  isLoading: false,
  error: null,
}

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    fetchContentsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchContentsSuccess: (state, action: PayloadAction<EmailContent[]>) => {
      state.isLoading = false
      state.contents = action.payload
      state.error = null
    },
    fetchContentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    fetchContentStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchContentSuccess: (state, action: PayloadAction<EmailContent>) => {
      state.isLoading = false
      state.currentContent = action.payload
      state.error = null
    },
    fetchContentFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createContentStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createContentSuccess: (state, action: PayloadAction<EmailContent>) => {
      state.isLoading = false
      state.contents = [...state.contents, action.payload]
      state.currentContent = action.payload
      state.error = null
    },
    createContentFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateContentStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateContentSuccess: (state, action: PayloadAction<EmailContent>) => {
      state.isLoading = false
      state.contents = state.contents.map((content) => (content.id === action.payload.id ? action.payload : content))
      state.currentContent = action.payload
      state.error = null
    },
    updateContentFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    deleteContentStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    deleteContentSuccess: (state, action: PayloadAction<number>) => {
      state.isLoading = false
      state.contents = state.contents.filter((content) => content.id !== action.payload)
      if (state.currentContent && state.currentContent.id === action.payload) {
        state.currentContent = null
      }
      state.error = null
    },
    deleteContentFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    bulkDeleteContentsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    bulkDeleteContentsSuccess: (state, action: PayloadAction<number[]>) => {
      state.isLoading = false
      state.contents = state.contents.filter((content) => !action.payload.includes(content.id))
      if (state.currentContent && action.payload.includes(state.currentContent.id)) {
        state.currentContent = null
      }
      state.error = null
    },
    bulkDeleteContentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    clearCurrentContent: (state) => {
      state.currentContent = null
    },
  },
})

export const {
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
  clearCurrentContent,
} = contentSlice.actions

export default contentSlice.reducer
