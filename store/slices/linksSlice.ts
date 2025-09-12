import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Links {
  id: number
  user: number
  personal_website: string | null
  linkedin: string | null
  twitter: string | null
  facebook: string | null
  instagram: string | null
  github: string | null
  youtube: string | null
  tiktok: string | null
  medium: string | null
  dribbble: string | null
  behance: string | null
  stackoverflow: string | null
  angel_list: string | null
  created_at: string
  updated_at: string
}

interface LinksState {
  links: Links | null
  isLoading: boolean
  error: string | null
}

const initialState: LinksState = {
  links: null,
  isLoading: false,
  error: null,
}

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    fetchLinksStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchLinksSuccess: (state, action: PayloadAction<Links>) => {
      state.isLoading = false
      state.links = action.payload
      state.error = null
    },
    fetchLinksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    updateLinksStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    updateLinksSuccess: (state, action: PayloadAction<Links>) => {
      state.isLoading = false
      state.links = action.payload
      state.error = null
    },
    updateLinksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    createLinksStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    createLinksSuccess: (state, action: PayloadAction<Links>) => {
      state.isLoading = false
      state.links = action.payload
      state.error = null
    },
    createLinksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
  },
})

export const {
  fetchLinksStart,
  fetchLinksSuccess,
  fetchLinksFailure,
  updateLinksStart,
  updateLinksSuccess,
  updateLinksFailure,
  createLinksStart,
  createLinksSuccess,
  createLinksFailure,
} = linksSlice.actions

export default linksSlice.reducer