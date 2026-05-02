// Google Places API Endpoints
export const GOOGLE_PLACES_TEXT_SEARCH_API = '/data/places/text-search/'
export const GOOGLE_PLACES_SEARCHES_LIST_API = '/data/places/searches/'
export const GOOGLE_PLACES_SEARCH_RESULTS_API = (searchId: number) =>
  `/data/places/search/${searchId}/`
export const GOOGLE_PLACES_ENRICH_API = '/data/places/enrich/'

// Nominatim API for location autocomplete
export const NOMINATIM_SEARCH_API = 'https://nominatim.openstreetmap.org/search'

// Types for Nominatim API
export interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  state?: string
  county?: string
  country: string
  country_code: string
  'ISO3166-2-lvl4'?: string
}

export interface NominatimLocation {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  class: string
  type: string
  place_rank: number
  importance: number
  addresstype: string
  name: string
  display_name: string
  address: NominatimAddress
  boundingbox: [string, string, string, string]
}

// Types for Google Places API
export interface LocationCoordinate {
  latitude: number
  longitude: number
}

export interface Circle {
  center: LocationCoordinate
  radius: number
}

export interface LocationBias {
  circle: Circle
}

export interface LocationRestriction {
  circle: Circle
}

export interface EVChargingOptions {
  minimumChargingRateKw?: number
  connectorTypes?: string[]
}

export interface TextSearchRequest {
  textQuery: string
  pageSize?: number
  pageToken?: string
  languageCode?: string
  regionCode?: string
  rankPreference?: 'RELEVANCE' | 'DISTANCE'
  includedType?: string
  excludedPrimaryTypes?: string[]
  useStrictTypeFiltering?: boolean
  isOpenNow?: boolean
  minRating?: number
  priceLevels?: string[]
  locationBias?: LocationBias
  locationRestriction?: LocationRestriction
  evOptions?: EVChargingOptions
  includePureServiceAreaBusinesses?: boolean
  includeFutureOpeningBusinesses?: boolean
  fieldMask?: string
}

export interface PlaceLocation {
  latitude: number
  longitude: number
}

export interface DisplayName {
  text: string
}

export interface Place {
  id: string
  displayName: DisplayName
  websiteUri?: string
  formattedAddress?: string
  location?: PlaceLocation
  rating?: number
  userRatingCount?: number
  [key: string]: any
}

export interface GooglePlaceSearch {
  id: number
  textQuery: string
  includedType?: string
  regionCode?: string
  languageCode?: string
  rankPreference?: string
  minRating?: number
  isOpenNow?: boolean
  priceLevels?: string[]
  locationBias?: LocationBias | null
  locationRestriction?: LocationRestriction | null
  pageSize?: number
  resultCount: number
  hasNextPage: boolean
  createdAt: string
}

export interface SearchMetadata {
  searchId: number
  textQuery: string
  resultCount: number
  createdAt: string
}

export interface PaginatedPlaces {
  places: Place[]
  nextPageToken?: string
  searchMetadata?: SearchMetadata
  pagination?: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface PaginatedSearches {
  searches: GooglePlaceSearch[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface EnrichmentRequest {
  search_id: number
  campaign_id?: number
}

export interface EnrichmentResponse {
  code: string
  status: string
  token: string
  message: string
  search_id: number
}
