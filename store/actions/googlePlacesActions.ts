import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'
import axios from 'axios'
import type {
  TextSearchRequest,
  PaginatedPlaces,
  PaginatedSearches,
  EnrichmentRequest,
  EnrichmentResponse,
  NominatimLocation,
} from '../constants/googlePlacesConstants'
import {
  GOOGLE_PLACES_TEXT_SEARCH_API,
  GOOGLE_PLACES_SEARCHES_LIST_API,
  GOOGLE_PLACES_SEARCH_RESULTS_API,
  GOOGLE_PLACES_ENRICH_API,
  NOMINATIM_SEARCH_API,
} from '../constants/googlePlacesConstants'

/**
 * Text search places using Google Places API
 * Executes a text search and returns paginated results
 */
export const textSearchPlaces = createAsyncThunk<
  PaginatedPlaces,
  {
    request: TextSearchRequest
    pageToken?: string
  },
  {
    rejectValue: string
  }
>(
  'googlePlaces/textSearch',
  async ({ request, pageToken }, { rejectWithValue }) => {
    try {
      const payload = {
        ...request,
      }

      // Add pagination token if provided
      if (pageToken) {
        payload.pageToken = pageToken
      }

      const response = await api.post<PaginatedPlaces>(
        GOOGLE_PLACES_TEXT_SEARCH_API,
        payload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Failed to search places'
      )
    }
  }
)

/**
 * Fetch user's search sessions with pagination
 */
export const fetchSearches = createAsyncThunk<
  PaginatedSearches,
  {
    page?: number
    pageSize?: number
  },
  {
    rejectValue: string
  }
>(
  'googlePlaces/fetchSearches',
  async ({ page = 1, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())

      const response = await api.get<PaginatedSearches>(
        `${GOOGLE_PLACES_SEARCHES_LIST_API}?${params.toString()}`
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Failed to fetch searches'
      )
    }
  }
)

/**
 * Fetch results from a specific search session
 */
export const fetchSearchResults = createAsyncThunk<
  PaginatedPlaces,
  {
    searchId: number
    page?: number
    pageSize?: number
  },
  {
    rejectValue: string
  }
>(
  'googlePlaces/fetchSearchResults',
  async ({ searchId, page = 1, pageSize = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())

      const response = await api.get<PaginatedPlaces>(
        `${GOOGLE_PLACES_SEARCH_RESULTS_API(searchId)}?${params.toString()}`
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Failed to fetch search results'
      )
    }
  }
)

/**
 * Enrich Google Places results with emails
 * Creates Company records with extracted emails
 */
export const enrichPlacesWithEmails = createAsyncThunk<
  EnrichmentResponse,
  {
    searchId: number
    campaignId?: number
  },
  {
    rejectValue: string
  }
>(
  'googlePlaces/enrich',
  async ({ searchId, campaignId }, { rejectWithValue }) => {
    try {
      const payload: EnrichmentRequest = {
        search_id: searchId,
      }

      if (campaignId) {
        payload.campaign_id = campaignId
      }

      const response = await api.post<EnrichmentResponse>(
        GOOGLE_PLACES_ENRICH_API,
        payload
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Failed to enrich places'
      )
    }
  }
)

/**
 * Fetch location suggestions from Nominatim OpenStreetMap API
 * Used for location autocomplete in search
 */
export const fetchLocationSuggestions = createAsyncThunk<
  NominatimLocation[],
  {
    query: string
    limit?: number
  },
  {
    rejectValue: string
  }
>(
  'googlePlaces/fetchLocationSuggestions',
  async ({ query, limit = 6 }, { rejectWithValue }) => {
    try {
      if (!query || query.trim().length < 2) {
        return []
      }

      const params = new URLSearchParams()
      params.append('q', query.trim())
      params.append('format', 'json')
      params.append('addressdetails', '1')
      params.append('limit', limit.toString())

      const response = await axios.get<NominatimLocation[]>(
        `${NOMINATIM_SEARCH_API}?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'MyApp/1.0',
          },
        }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          'Failed to fetch location suggestions'
      )
    }
  }
)
