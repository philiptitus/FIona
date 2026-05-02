"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Loader2,
  Zap,
  RotateCw,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Bell,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { handleFetchCampaigns } from "@/store/actions/campaignActions"
import { enrichPlacesWithEmails } from "@/store/actions/googlePlacesActions"
import type { GooglePlaceSearch } from "@/store/constants/googlePlacesConstants"

interface SearchEnrichmentModalProps {
  isOpen: boolean
  selectedSearch: GooglePlaceSearch | null
  onSuccess?: (message: string) => void
  onClose: () => void
}

interface EnrichResult {
  message: string
  token: string
  status: string
  search_id: number
}

export default function SearchEnrichmentModal({
  isOpen,
  selectedSearch,
  onSuccess,
  onClose,
}: SearchEnrichmentModalProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Local state for campaign browser
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [campaignPage, setCampaignPage] = useState(1)
  const [campaignPageSize] = useState(6)

  // Enrichment result states
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null)
  const [enrichError, setEnrichError] = useState<string | null>(null)

  const { campaigns, isLoading: campaignsLoading, pagination: campaignPagination } = useAppSelector(
    (state) => state.campaigns
  )

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCampaignPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadCampaigns = useCallback(() => {
    dispatch(
      handleFetchCampaigns({
        search: debouncedSearch,
        page: campaignPage,
        pageSize: campaignPageSize,
      }) as any
    )
  }, [dispatch, debouncedSearch, campaignPage, campaignPageSize])

  useEffect(() => {
    if (isOpen) {
      loadCampaigns()
    }
  }, [isOpen, loadCampaigns])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCampaignId(null)
      setSearchInput("")
      setDebouncedSearch("")
      setCampaignPage(1)
      setEnrichResult(null)
      setEnrichError(null)
      setIsEnriching(false)
    }
  }, [isOpen])

  const handleEnrich = async () => {
    if (!selectedSearch) return
    setIsEnriching(true)
    setEnrichError(null)
    try {
      const resultAction = await dispatch(
        enrichPlacesWithEmails({
          searchId: selectedSearch.id,
          campaignId: selectedCampaignId ?? undefined,
        }) as any
      )
      if (enrichPlacesWithEmails.fulfilled.match(resultAction)) {
        setEnrichResult(resultAction.payload)
        onSuccess?.(resultAction.payload.message)
      } else {
        setEnrichError(
          (resultAction.payload as string) || "Failed to start enrichment. Please try again."
        )
      }
    } catch (err: any) {
      setEnrichError(err?.message || "Unexpected error. Please try again.")
    } finally {
      setIsEnriching(false)
    }
  }

  const selectedCampaign = campaigns.find((c: any) => c.id === selectedCampaignId)

  if (!selectedSearch) return null

  const totalPages = campaignPagination?.totalPages ?? 1
  const totalCount = campaignPagination?.count ?? 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <Zap className="h-4 w-4 text-violet-500" />
            </div>
            Email Enrichment
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-sm">
            <Bell className="h-3.5 w-3.5" />
            You'll be notified when enrichment completes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* ── SUCCESS STATE ── */}
          {enrichResult ? (
            <div className="space-y-4">
              {/* Success banner */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                    Enrichment Started Successfully
                  </p>
                  <p className="text-sm text-foreground/80">
                    {enrichResult.message}
                  </p>
                </div>
              </div>

              {/* Token info */}
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Job Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {enrichResult.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Search ID</p>
                    <p className="text-sm font-semibold">#{enrichResult.search_id}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tracking Token</p>
                  <p className="text-xs font-mono bg-muted rounded px-2 py-1 break-all">
                    {enrichResult.token}
                  </p>
                </div>
              </div>

              {/* Notification note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/50">
                <Bell className="h-3.5 w-3.5 flex-shrink-0" />
                You'll receive a notification when email extraction is complete.
              </div>

              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          ) : (
            <>
          {/* Search Session Info Banner */}
          <div className="rounded-xl border border-border bg-gradient-to-r from-muted/60 to-muted/30 p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Search Session
            </p>
            <p className="font-bold text-foreground text-sm line-clamp-2">
              {selectedSearch.textQuery}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="text-xs font-semibold">
                {selectedSearch.resultCount} places
              </Badge>
              {selectedSearch.hasNextPage && (
                <Badge variant="outline" className="text-xs">
                  More pages available
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(selectedSearch.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Campaign Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Associate with Campaign
                <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadCampaigns}
                disabled={campaignsLoading}
                className="h-7 px-2 text-xs gap-1"
              >
                <RotateCw className={`h-3 w-3 ${campaignsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Selected campaign chip */}
            {selectedCampaign && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/30">
                <CheckCircle2 className="h-4 w-4 text-violet-500 flex-shrink-0" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300 flex-1 truncate">
                  {selectedCampaign.name}
                </span>
                <button
                  onClick={() => setSelectedCampaignId(null)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search campaigns..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Campaigns Grid */}
            {campaignsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                {debouncedSearch
                  ? `No campaigns matching "${debouncedSearch}"`
                  : "No campaigns yet"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campaigns.map((campaign: any) => {
                  const isSelected = selectedCampaignId === campaign.id
                  return (
                    <button
                      key={campaign.id}
                      onClick={() =>
                        setSelectedCampaignId(isSelected ? null : campaign.id)
                      }
                      className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                        isSelected
                          ? "bg-violet-500/10 border-violet-500/50 ring-1 ring-violet-500/30"
                          : "bg-muted/30 border-border/50 hover:border-violet-400/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{campaign.name}</p>
                          {campaign.recipient_type && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {campaign.recipient_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  Page {campaignPage} of {totalPages}
                  <span className="ml-1">({totalCount} total)</span>
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCampaignPage((p) => Math.max(1, p - 1))}
                    disabled={campaignPage <= 1 || campaignsLoading}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  {Array.from({ length: totalPages })
                    .map((_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - campaignPage) <= 1
                    )
                    .map((page, idx, arr) => (
                      <span key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-xs text-muted-foreground">…</span>
                        )}
                        <Button
                          variant={page === campaignPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCampaignPage(page)}
                          className="h-7 w-7 p-0 text-xs"
                        >
                          {page}
                        </Button>
                      </span>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCampaignPage((p) => Math.min(totalPages, p + 1))}
                    disabled={campaignPage >= totalPages || campaignsLoading}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Create Campaign Link */}
            <Button
              variant="outline"
              onClick={() => {
                router.push("/campaigns/smart-campaign")
                onClose()
              }}
              className="w-full h-9 text-sm border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Campaign
            </Button>
          </div>

          {/* Info note */}
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 border border-border/50">
            The enrichment job runs in the background. It extracts emails from business websites and creates company records. You'll receive a notification once it's complete.
          </p>

          {/* Error state */}
          {enrichError && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{enrichError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isEnriching}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnrich}
              disabled={isEnriching}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
            >
              {isEnriching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Start Enrichment
                </>
              )}
            </Button>
          </div>
          </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
