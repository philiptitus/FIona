import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  Place,
  GooglePlaceSearch,
  PaginatedPlaces,
  PaginatedSearches,
  NominatimLocation,
} from '../constants/googlePlacesConstants'
import {
  textSearchPlaces,
  fetchSearches,
  fetchSearchResults,
  enrichPlacesWithEmails,
  fetchLocationSuggestions,
} from '../actions/googlePlacesActions'

interface GooglePlacesState {
  // Text search results (main search page)
  textSearchResults: Place[]
  textSearchMetadata: {
    searchId: number
    textQuery: string
    resultCount: number
    createdAt: string
  } | null
  textSearchNextPageToken: string | null
  textSearchCurrentPageSize: number
  textSearchPagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  // Fetch search results (results page)
  searchResults: Place[]
  currentSearchId: number | null
  searchMetadata: {
    searchId: number
    textQuery: string
    resultCount: number
    createdAt: string
  } | null

  // Search sessions list
  searches: GooglePlaceSearch[]
  totalSearches: number

  // Pagination (for results page)
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  // Enrichment
  enrichmentToken: string | null
  enrichmentStatus: 'idle' | 'processing' | 'completed' | 'failed'
  enrichmentMessage: string | null

  // Text Search Places - separate states
  textSearchLoading: boolean
  textSearchError: string | null
  textSearchSuccess: boolean

  // Fetch Searches - separate states
  fetchSearchesLoading: boolean
  fetchSearchesError: string | null
  fetchSearchesSuccess: boolean

  // Fetch Search Results - separate states
  fetchSearchResultsLoading: boolean
  fetchSearchResultsError: string | null
  fetchSearchResultsSuccess: boolean

  // Enrich Places - separate states
  enrichLoading: boolean
  enrichError: string | null
  enrichSuccess: boolean

  // Location Suggestions (Nominatim) - separate states
  locationSuggestions: NominatimLocation[]
  locationSuggestionsLoading: boolean
  locationSuggestionsError: string | null

  // Legacy states (deprecated, kept for backward compatibility)
  isLoading: boolean
  isSearching: boolean
  isEnriching: boolean
  error: string | null
  searchError: string | null
}

const initialState: GooglePlacesState = {
  textSearchResults: [],
  textSearchMetadata: null,
  textSearchNextPageToken: null,
  textSearchCurrentPageSize: 20,
  textSearchPagination: {
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  searchResults: [],
  currentSearchId: null,
  searchMetadata: null,
  searches: [],
  totalSearches: 0,
  pagination: {
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  enrichmentToken: null,
  enrichmentStatus: 'idle',
  enrichmentMessage: null,
  textSearchLoading: false,
  textSearchError: null,
  textSearchSuccess: false,
  fetchSearchesLoading: false,
  fetchSearchesError: null,
  fetchSearchesSuccess: false,
  fetchSearchResultsLoading: false,
  fetchSearchResultsError: null,
  fetchSearchResultsSuccess: false,
  enrichLoading: false,
  enrichError: null,
  enrichSuccess: false,
  // Location Suggestions
  locationSuggestions: [],
  locationSuggestionsLoading: false,
  locationSuggestionsError: null,
  // Legacy
  isLoading: false,
  isSearching: false,
  isEnriching: false,
  error: null,
  searchError: null,
}

const googlePlacesSlice = createSlice({
  name: 'googlePlaces',
  initialState,
  reducers: {
    // Manual reducers for state management
    clearSearchResults: (state) => {
      state.searchResults = []
      state.textSearchResults = []
      state.currentSearchId = null
      state.searchMetadata = null
      state.textSearchMetadata = null
      state.textSearchError = null
      state.fetchSearchResultsError = null
      state.searchError = null
    },
    clearTextSearchResults: (state) => {
      state.textSearchResults = []
      state.textSearchMetadata = null
      state.textSearchError = null
      state.textSearchNextPageToken = null
    },
    clearError: (state) => {
      state.error = null
      state.searchError = null
      state.textSearchError = null
      state.fetchSearchesError = null
      state.fetchSearchResultsError = null
      state.enrichError = null
    },
    clearTextSearchState: (state) => {
      state.textSearchLoading = false
      state.textSearchError = null
      state.textSearchSuccess = false
    },
    clearFetchSearchesState: (state) => {
      state.fetchSearchesLoading = false
      state.fetchSearchesError = null
      state.fetchSearchesSuccess = false
    },
    clearFetchSearchResultsState: (state) => {
      state.fetchSearchResultsLoading = false
      state.fetchSearchResultsError = null
      state.fetchSearchResultsSuccess = false
    },
    clearEnrichState: (state) => {
      state.enrichLoading = false
      state.enrichError = null
      state.enrichSuccess = false
    },
    resetEnrichment: (state) => {
      state.enrichmentToken = null
      state.enrichmentStatus = 'idle'
      state.enrichmentMessage = null
      state.enrichLoading = false
      state.enrichError = null
      state.enrichSuccess = false
    },
    clearLocationSuggestions: (state) => {
      state.locationSuggestions = []
      state.locationSuggestionsError = null
    },
    setCurrentSearchId: (state, action: PayloadAction<number>) => {
      state.currentSearchId = action.payload
    },
  },
  extraReducers: (builder) => {
    // Text Search Places
    builder
      .addCase(textSearchPlaces.pending, (state) => {
        state.textSearchLoading = true
        state.textSearchError = null
        state.textSearchSuccess = false
        // Keep legacy state for backward compatibility
        state.isSearching = true
        state.searchError = null
      })
      .addCase(
        textSearchPlaces.fulfilled,
        (state, action: PayloadAction<PaginatedPlaces>) => {
          state.textSearchLoading = false
          state.textSearchSuccess = true
          state.textSearchError = null
          state.textSearchResults = action.payload.places
          state.textSearchNextPageToken = action.payload.nextPageToken || null
          state.textSearchMetadata = action.payload.searchMetadata || null
          if (action.payload.searchMetadata) {
            state.currentSearchId = action.payload.searchMetadata.searchId
          }
          if (action.payload.pagination) {
            state.textSearchPagination = action.payload.pagination
          } else {
            // Update pagination based on nextPageToken
            state.textSearchPagination.hasNextPage = !!action.payload.nextPageToken
          }
          // Keep legacy state for backward compatibility
          state.isSearching = false
          state.searchError = null
        }
      )
      .addCase(textSearchPlaces.rejected, (state, action) => {
        state.textSearchLoading = false
        state.textSearchError = action.payload as string
        state.textSearchSuccess = false
        state.textSearchResults = []
        // Keep legacy state for backward compatibility
        state.isSearching = false
        state.searchError = action.payload as string
      })

    // Fetch Searches List
    builder
      .addCase(fetchSearches.pending, (state) => {
        state.fetchSearchesLoading = true
        state.fetchSearchesError = null
        state.fetchSearchesSuccess = false
        // Keep legacy state for backward compatibility
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchSearches.fulfilled,
        (state, action: PayloadAction<PaginatedSearches>) => {
          state.fetchSearchesLoading = false
          state.fetchSearchesSuccess = true
          state.fetchSearchesError = null
          state.searches = action.payload.searches
          state.totalSearches = action.payload.pagination.totalCount
          state.pagination = action.payload.pagination
          // Keep legacy state for backward compatibility
          state.isLoading = false
          state.error = null
        }
      )
      .addCase(fetchSearches.rejected, (state, action) => {
        state.fetchSearchesLoading = false
        state.fetchSearchesError = action.payload as string
        state.fetchSearchesSuccess = false
        state.searches = []
        // Keep legacy state for backward compatibility
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Search Results
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.fetchSearchResultsLoading = true
        state.fetchSearchResultsError = null
        state.fetchSearchResultsSuccess = false
        // Keep legacy state for backward compatibility
        state.isLoading = true
        state.searchError = null
      })
      .addCase(
        fetchSearchResults.fulfilled,
        (state, action: PayloadAction<PaginatedPlaces>) => {
          state.fetchSearchResultsLoading = false
          state.fetchSearchResultsSuccess = true
          state.fetchSearchResultsError = null
          state.searchResults = action.payload.places
          state.searchMetadata = action.payload.searchMetadata
          state.pagination = action.payload.pagination
          // Keep legacy state for backward compatibility
          state.isLoading = false
          state.searchError = null
        }
      )
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.fetchSearchResultsLoading = false
        state.fetchSearchResultsError = action.payload as string
        state.fetchSearchResultsSuccess = false
        state.searchResults = []
        // Keep legacy state for backward compatibility
        state.isLoading = false
        state.searchError = action.payload as string
      })

    // Enrich Places with Emails
    builder
      .addCase(enrichPlacesWithEmails.pending, (state) => {
        state.enrichLoading = true
        state.enrichError = null
        state.enrichSuccess = false
        state.enrichmentStatus = 'processing'
        state.enrichmentMessage = null
        // Keep legacy state for backward compatibility
        state.isEnriching = true
      })
      .addCase(
        enrichPlacesWithEmails.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.enrichLoading = false
          state.enrichSuccess = true
          state.enrichError = null
          state.enrichmentStatus = 'completed'
          state.enrichmentToken = action.payload.token
          state.enrichmentMessage = action.payload.message
          // Keep legacy state for backward compatibility
          state.isEnriching = false
        }
      )
      .addCase(enrichPlacesWithEmails.rejected, (state, action) => {
        state.enrichLoading = false
        state.enrichError = action.payload as string
        state.enrichSuccess = false
        state.enrichmentStatus = 'failed'
        state.enrichmentMessage = action.payload as string
        // Keep legacy state for backward compatibility
        state.isEnriching = false
      })

    // Fetch Location Suggestions (Nominatim)
    builder
      .addCase(fetchLocationSuggestions.pending, (state) => {
        state.locationSuggestionsLoading = true
        state.locationSuggestionsError = null
      })
      .addCase(
        fetchLocationSuggestions.fulfilled,
        (state, action: PayloadAction<NominatimLocation[]>) => {
          state.locationSuggestionsLoading = false
          state.locationSuggestions = action.payload
          state.locationSuggestionsError = null
        }
      )
      .addCase(fetchLocationSuggestions.rejected, (state, action) => {
        state.locationSuggestionsLoading = false
        state.locationSuggestionsError = action.payload as string
        state.locationSuggestions = []
      })
  },
})

export const {
  clearSearchResults,
  clearTextSearchResults,
  clearError,
  clearTextSearchState,
  clearFetchSearchesState,
  clearFetchSearchResultsState,
  clearEnrichState,
  resetEnrichment,
  clearLocationSuggestions,
  setCurrentSearchId,
} = googlePlacesSlice.actions

export default googlePlacesSlice.reducer
