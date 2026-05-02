"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  textSearchPlaces,
  fetchSearches,
  enrichPlacesWithEmails,
} from "@/store/actions/googlePlacesActions"
import SearchBar from "@/components/leads-explorer/SearchBar"
import LocationSelector, {
  type LocationToken,
} from "@/components/leads-explorer/LocationSelector"
import FiltersBar from "@/components/leads-explorer/FiltersBar"
import FieldMaskSelector from "@/components/leads-explorer/FieldMaskSelector"
import ResultsList from "@/components/leads-explorer/ResultsList"
import GooglePlacesPaginationControls from "@/components/leads-explorer/GooglePlacesPaginationControls"
import SearchEnrichmentModal from "@/components/leads-explorer/SearchEnrichmentModal"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import MainLayout from "@/components/layout/main-layout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Place, GooglePlaceSearch, TextSearchRequest } from "@/store/constants/googlePlacesConstants"

interface FilterState {
  isOpenNow?: boolean
  minRating?: number
  priceLevel?: string[]
  businessType?: string
}

export default function LeadsExplorerPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocations, setSelectedLocations] = useState<LocationToken[]>([])
  const [filters, setFilters] = useState<FilterState>({})
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "places.id",
    "places.displayName.text",
    "places.formattedAddress",
    "places.rating",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "nextPageToken",
  ])
  const [currentPageSize, setCurrentPageSize] = useState(20)
  const [lastRequest, setLastRequest] = useState<TextSearchRequest | null>(null)
  const [hasPreviousPages, setHasPreviousPages] = useState(false)

  // Enrichment state
  const [enrichmentOpen, setEnrichmentOpen] = useState(false)
  const [selectedSearchForEnrich, setSelectedSearchForEnrich] =
    useState<GooglePlaceSearch | null>(null)

  // Redux state
  const {
    textSearchResults,
    textSearchNextPageToken,
    textSearchLoading,
    textSearchError,
    enrichLoading,
  } = useAppSelector((state) => state.googlePlaces)

  // Build search request
  const buildSearchRequest = useCallback((): TextSearchRequest => {
    const textQuery = selectedLocations.length
      ? `${searchQuery} in ${selectedLocations.map((l) => l.text).join(", ")}`
      : searchQuery

    return {
      textQuery,
      pageSize: currentPageSize,
      ...(filters.isOpenNow && { isOpenNow: true }),
      ...(filters.minRating && { minRating: filters.minRating }),
      ...(filters.businessType && { includedType: filters.businessType }),
      ...(filters.priceLevel && { priceLevels: filters.priceLevel }),
      fieldMask:
        selectedFields.length > 0 ? selectedFields.join(",") : undefined,
    }
  }, [searchQuery, selectedLocations, currentPageSize, filters, selectedFields])

  // Search handler - new search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      })
      return
    }

    const request = buildSearchRequest()
    setLastRequest(request)
    setHasPreviousPages(false)

    dispatch(textSearchPlaces({ request }) as any)
  }, [searchQuery, buildSearchRequest, dispatch, toast])

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (!textSearchNextPageToken || !lastRequest) return

    setHasPreviousPages(true)
    dispatch(
      textSearchPlaces({
        request: lastRequest,
        pageToken: textSearchNextPageToken,
      }) as any
    )
  }, [textSearchNextPageToken, lastRequest, dispatch])

  const handleReset = useCallback(() => {
    if (!lastRequest) return

    setHasPreviousPages(false)
    dispatch(textSearchPlaces({ request: lastRequest }) as any)
  }, [lastRequest, dispatch])

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setCurrentPageSize(size)
      
      // If we have a previous search, trigger it with new page size
      if (lastRequest) {
        const newRequest = { ...lastRequest, pageSize: size }
        setLastRequest(newRequest)
        setHasPreviousPages(false)
        dispatch(textSearchPlaces({ request: newRequest }) as any)
      }
    },
    [lastRequest, dispatch]
  )

  // Enrichment handler - triggered from search session
  const handleEnrichSearch = useCallback(
    (campaignId?: number) => {
      if (!selectedSearchForEnrich) {
        toast({
          title: "Error",
          description: "No search selected",
          variant: "destructive",
        })
        return
      }

      dispatch(
        enrichPlacesWithEmails({
          searchId: selectedSearchForEnrich.id,
          campaignId,
        }) as any
      )

      setEnrichmentOpen(false)
      toast({
        title: "Success",
        description: "Email enrichment started for this search",
      })
    },
    [selectedSearchForEnrich, dispatch, toast]
  )

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="space-y-3 pb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Leads Explorer
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover businesses worldwide with  and enrich with AI-powered email mining
          </p>
        </div>

        {/* Info Banner */}
        <Card className="p-5 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/30 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">ℹ</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">FYI</p>
              <p className="text-sm text-blue-600/90 dark:text-blue-400/90">
                Results are fetched page-by-page using tokens. Use <span className="font-semibold">"Next Page"</span> to load more results when available. 
                Configure <span className="font-semibold">"Per page"</span> size (5-20) before searching to control how many results you get per request.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Search Section */}
          <Card className="p-7 space-y-5 bg-gradient-to-br from-primary/[0.07] via-primary/[0.03] to-transparent border-primary/20 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="font-semibold text-xl">Search</h2>
            </div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isLoading={textSearchLoading}
            />

            <LocationSelector
              selectedLocations={selectedLocations}
              onAddLocation={(location) =>
                setSelectedLocations([...selectedLocations, location])
              }
              onRemoveLocation={(id) =>
                setSelectedLocations(
                  selectedLocations.filter((l) => l.id !== id)
                )
              }
            />

            {/* Page Size Selector */}
            <div className="flex items-center gap-4 pt-2 pb-1 border-t border-primary/10">
              <Label htmlFor="page-size" className="text-sm font-semibold text-muted-foreground">
                Results per page:
              </Label>
              <Select
                value={currentPageSize.toString()}
                onValueChange={(value) => setCurrentPageSize(parseInt(value))}
              >
                <SelectTrigger id="page-size" className="w-24 h-10 rounded-lg border-border/60 hover:border-primary/50 transition-colors shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                Configure before searching
              </span>
            </div>
          </Card>

          {/* Filters & Fields Section */}
          <Card className="p-7 space-y-5 bg-card/80 backdrop-blur-sm border-border/60 shadow-md">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-amber-500 rounded-full" />
              <h2 className="font-semibold text-xl">Refine Results</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Filters
                </h3>
                <FiltersBar filters={filters} onFiltersChange={setFilters} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Field Selection
                </h3>
                <FieldMaskSelector
                  selected={selectedFields}
                  onSelectionChange={setSelectedFields}
                />
              </div>
            </div>
          </Card>

          {/* Results Section */}
          {textSearchResults.length > 0 && (
            <Card className="p-7 space-y-5 bg-gradient-to-br from-emerald-500/[0.04] via-card to-card border-emerald-500/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-emerald-500 rounded-full" />
                  <h2 className="font-semibold text-xl">
                    Search Results
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {textSearchNextPageToken && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm">
                      ✓ More Available
                    </span>
                  )}
                  <span className="text-sm px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                    {textSearchResults.length} result{textSearchResults.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <ResultsList
                places={textSearchResults}
                isLoading={textSearchLoading}
              />
              <GooglePlacesPaginationControls
                currentPageSize={currentPageSize}
                hasNextPage={!!textSearchNextPageToken}
                hasPreviousPages={hasPreviousPages}
                resultCount={textSearchResults.length}
                onNextPage={handleNextPage}
                onPreviousPage={handleReset}
                onPageSizeChange={handlePageSizeChange}
                onReset={handleReset}
                isLoading={textSearchLoading}
              />
            </Card>
          )}

          {textSearchError && (
            <Card className="p-5 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 border-destructive/30 shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="text-destructive text-xl font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-destructive">Search Error</p>
                  <p className="text-sm text-destructive/80 mt-0.5">{textSearchError}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Enrichment Modal */}
        <SearchEnrichmentModal
          isOpen={enrichmentOpen}
          selectedSearch={selectedSearchForEnrich}
          isEnriching={enrichLoading}
          onEnrich={handleEnrichSearch}
          onClose={() => {
            setEnrichmentOpen(false)
            setSelectedSearchForEnrich(null)
          }}
        />
      </div>
    </MainLayout>
  )
}
