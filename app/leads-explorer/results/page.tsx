"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchSearchResults } from "@/store/actions/googlePlacesActions"
import ResultsList from "@/components/leads-explorer/ResultsList"
import PaginationControls from "@/components/leads-explorer/PaginationControls"
import SearchEnrichmentModal from "@/components/leads-explorer/SearchEnrichmentModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, RotateCw, Zap } from "lucide-react"
import Link from "next/link"
import MainLayout from "@/components/layout/main-layout"
import { useToast } from "@/components/ui/use-toast"
import type { GooglePlaceSearch } from "@/store/constants/googlePlacesConstants"

function ResultsPageContent() {
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const searchId = searchParams.get("search_id")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [enrichmentOpen, setEnrichmentOpen] = useState(false)

  const { searchResults, fetchSearchResultsLoading, fetchSearchResultsError, pagination, searchMetadata } = useAppSelector(
    (state) => state.googlePlaces
  )

  // Build a GooglePlaceSearch object from searchMetadata for the modal
  const searchForEnrich: GooglePlaceSearch | null = searchMetadata
    ? {
        id: searchMetadata.searchId,
        textQuery: searchMetadata.textQuery,
        resultCount: searchMetadata.resultCount ?? searchResults.length,
        hasNextPage: false,
        createdAt: searchMetadata.createdAt,
      }
    : null

  // Fetch results when component mounts or params change
  useEffect(() => {
    if (searchId) {
      dispatch(
        fetchSearchResults({
          searchId: parseInt(searchId),
          page: currentPage,
          pageSize: pageSize,
        }) as any
      )
    }
  }, [dispatch, searchId, currentPage, pageSize])

  const handleRefresh = () => {
    if (searchId) {
      dispatch(
        fetchSearchResults({
          searchId: parseInt(searchId),
          page: currentPage,
          pageSize: pageSize,
        }) as any
      )
    }
  }

  if (!searchId) {
    return (
      <MainLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
          <p className="text-muted-foreground">No search selected</p>
        </div>

        <Card className="p-12 text-center bg-muted/30 border-dashed">
          <p className="text-muted-foreground mb-4">
            Select a search session to view its results
          </p>
          <Link href="/leads-explorer/sessions">
            <Button variant="default">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
        </Card>
      </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Link href="/leads-explorer/sessions">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 ml-2"
              disabled={fetchSearchResultsLoading}
              title="Refresh results"
            >
              <RotateCw className={`h-4 w-4 ${fetchSearchResultsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {searchMetadata && (
            <p className="text-muted-foreground ml-10">
              <span className="font-semibold text-foreground">{pagination.totalCount}</span> results for{" "}
              <span className="font-semibold text-foreground">"{searchMetadata.textQuery}"</span>
            </p>
          )}
        </div>
        {searchForEnrich && (
          <Button
            onClick={() => setEnrichmentOpen(true)}
            disabled={enrichmentOpen}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 flex-shrink-0"
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Enrich Emails
          </Button>
        )}
      </div>

      {/* Results Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            Results ({pagination.totalCount})
          </h2>
        </div>
        <ResultsList
          places={searchResults}
          isLoading={fetchSearchResultsLoading}
          onEnrich={(place) => {
            // Handle enrichment - could open modal or navigate
          }}
        />
      </Card>

      {/* Pagination Controls */}
      {searchResults.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          pageSize={pageSize}
          totalCount={pagination.totalCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* No Results */}
      {!fetchSearchResultsLoading && searchResults.length === 0 && (
        <Card className="p-12 text-center bg-muted/30 border-dashed">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No results found
          </h3>
          <p className="text-muted-foreground mb-4">
            This search returned no results. Try viewing a different session.
          </p>
          <Link href="/leads-explorer/sessions">
            <Button variant="default">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </Link>
        </Card>
      )}

      {/* Enrichment Modal */}
      <SearchEnrichmentModal
        isOpen={enrichmentOpen}
        selectedSearch={searchForEnrich}
        onSuccess={(message) => {
          toast({
            title: "Enrichment Started",
            description: message,
          })
        }}
        onClose={() => setEnrichmentOpen(false)}
      />
    </div>
    </MainLayout>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsPageContent />
    </Suspense>
  )
}
