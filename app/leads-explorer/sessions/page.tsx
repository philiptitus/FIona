"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchSearches } from "@/store/actions/googlePlacesActions"
import SearchEnrichmentModal from "@/components/leads-explorer/SearchEnrichmentModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Zap, Calendar, ChevronLeft, ChevronRight, RotateCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import MainLayout from "@/components/layout/main-layout"
import type { GooglePlaceSearch } from "@/store/constants/googlePlacesConstants"

const formatDate = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function SessionsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [enrichmentOpen, setEnrichmentOpen] = useState(false)
  const [selectedSearchForEnrich, setSelectedSearchForEnrich] =
    useState<GooglePlaceSearch | null>(null)

  const { searches, fetchSearchesLoading, fetchSearchesError, pagination } = useAppSelector(
    (state) => state.googlePlaces
  )

  useEffect(() => {
    dispatch(
      fetchSearches({
        page: currentPage,
        pageSize: pageSize,
      }) as any
    )
  }, [dispatch, currentPage, pageSize])

  const handleViewResults = (search: GooglePlaceSearch) => {
    // Navigate to results page with search_id in query params
    router.push(`/leads-explorer/results?search_id=${search.id}`)
  }

  const handleRefresh = () => {
    dispatch(
      fetchSearches({
        page: currentPage,
        pageSize: pageSize,
      }) as any
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Search Sessions</h1>
            <p className="text-muted-foreground">
              View and manage your search history. Re-run searches or trigger email enrichment.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            disabled={fetchSearchesLoading}
            title="Refresh sessions list"
          >
            <RotateCw className={`h-4 w-4 ${fetchSearchesLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {(currentPage - 1) * pageSize + 1}
          </span>
          {" – "}
          <span className="font-semibold text-foreground">
            {Math.min(currentPage * pageSize, pagination.totalCount)}
          </span>
          {" of "}
          <span className="font-semibold text-foreground">
            {pagination.totalCount}
          </span>
          {" sessions"}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Per page:</span>
          <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(parseInt(v))}>
            <SelectTrigger className="w-20 h-9 text-sm rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions Grid */}
      {fetchSearchesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : searches.length === 0 ? (
        <Card className="p-12 text-center bg-muted/30 border-dashed">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No search sessions yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Start exploring businesses using the Search tab to build your search history.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searches.map((session) => (
            <Card
              key={session.id}
              className="p-5 hover:shadow-lg hover:border-primary/40 transition-all group flex flex-col gap-4"
            >
              {/* Header */}
              <div>
                <p className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {session.textQuery}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border border-border/50">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Results
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {session.resultCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge
                    variant={session.hasNextPage ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {session.hasNextPage ? "More" : "Complete"}
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(session.createdAt)}
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {session.includedType && (
                  <Badge variant="secondary" className="text-xs">
                    {session.includedType}
                  </Badge>
                )}
                {session.minRating && (
                  <Badge variant="secondary" className="text-xs">
                    ≥{session.minRating}⭐
                  </Badge>
                )}
                {session.isOpenNow && (
                  <Badge variant="secondary" className="text-xs">
                    Open Now
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border/50 mt-auto">
                <Button
                  onClick={() => handleViewResults(session)}
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs h-9"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Button>
                <Button
                  onClick={() => {
                    setSelectedSearchForEnrich(session)
                    setEnrichmentOpen(true)
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-9"
                >
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Enrich
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {searches.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
            <span className="font-semibold text-foreground">
              {pagination.totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-9 w-9 p-0 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages })
                .map((_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .map((page, idx, arr) => (
                  <div key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2 text-xs text-muted-foreground">
                        ...
                      </span>
                    )}
                    <Button
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-9 w-9 p-0 text-xs rounded-lg"
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage >= pagination.totalPages}
              className="h-9 w-9 p-0 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Enrichment Modal */}
      <SearchEnrichmentModal
        isOpen={enrichmentOpen}
        selectedSearch={selectedSearchForEnrich}
        onSuccess={(message) => {
          toast({
            title: "Enrichment Started",
            description: message,
          })
        }}
        onClose={() => {
          setEnrichmentOpen(false)
          setSelectedSearchForEnrich(null)
        }}
      />
      </div>
    </MainLayout>
  )
}
