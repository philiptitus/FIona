"use client"

import React, { useEffect, useState, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import type { AppDispatch, RootState } from "@/store/store"
import { handleFetchResearchList, handleDeleteResearch } from "@/store/actions/researchActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { createNotificationPoller } from "@/store/utils/notificationPolling"
import { Search, CheckCircle2, Clock, AlertCircle, RefreshCw, Sparkles, X, Trash2, MoreVertical } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ResearchSummaryRenderer from "@/components/research/ResearchSummaryRenderer"

const PAGE_SIZE = 10

export default function ResearchPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { researchResults, isLoading, isDeleting, deleteError, pagination } = useSelector(
    (state: RootState) => state.research
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"all" | "processing" | "completed" | "failed">("all")
  const [contactTypeFilter, setContactTypeFilter] = useState<"all" | "emaillist" | "company">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  
  // Selection state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    type: 'single' | 'bulk' | 'all'
    itemId?: number
    itemName?: string
  }>({ isOpen: false, type: 'single' })
  
  // Track if this is the initial load (no data yet)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  
  // Progress tracking for processing items (based on elapsed time)
  const [progressMap, setProgressMap] = useState<Map<number, number>>(new Map())
  
  // Polling state for pending researches
  const [pendingTokens, setPendingTokens] = useState<Map<string, { name: string; startedAt: number }>>(new Map())
  const pollerRef = useRef<ReturnType<typeof createNotificationPoller> | null>(null)

  const fetchResearch = useCallback(async (showFilterLoading = false) => {
    if (showFilterLoading) {
      setIsFiltering(true)
    }
    
    const params = {
      page: currentPage,
      page_size: PAGE_SIZE,
      ...(searchQuery && { search: searchQuery }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(contactTypeFilter !== "all" && { contact_type: contactTypeFilter }),
      ordering: "-created_at",
    }
    
    try {
      await dispatch(handleFetchResearchList(params) as any)
      setHasLoadedOnce(true)
    } finally {
      if (showFilterLoading) {
        setIsFiltering(false)
      }
    }
  }, [dispatch, currentPage, searchQuery, statusFilter, contactTypeFilter])

  useEffect(() => {
    fetchResearch()
  }, [fetchResearch])

  // Set up polling when there are processing items in the list
  useEffect(() => {
    const processingItems = researchResults.filter(r => r.status === "processing")
    
    if (processingItems.length > 0 && !pollerRef.current) {
      pollerRef.current = createNotificationPoller(
        { notificationType: "research_complete_success" },
        {
          interval: 4000,
          onPoll: (notifications) => {
            // Check if any processing research completed
            const completedTokens = notifications
              .filter(n => 
                n.notification_type === "research_complete_success" ||
                n.notification_type === "research_complete_failed"
              )
              .map(n => n.metadata?.token)
              .filter(Boolean)

            if (completedTokens.length > 0) {
              // Research completed - refresh list
              fetchResearch()
              toast({
                title: "✨ Research Updated",
                description: "A research task has completed.",
                duration: 3000,
              })
            }
          },
        }
      )
      pollerRef.current.start()
    } else if (processingItems.length === 0 && pollerRef.current) {
      pollerRef.current.stop()
      pollerRef.current = null
    }

    return () => {
      if (pollerRef.current) {
        pollerRef.current.stop()
        pollerRef.current = null
      }
    }
  }, [researchResults, fetchResearch, toast])

  // Update progress for processing items every 500ms
  useEffect(() => {
    const processingItems = researchResults.filter(r => r.status === "processing")
    
    if (processingItems.length === 0) {
      setProgressMap(new Map())
      return
    }

    const updateProgress = () => {
      const newMap = new Map<number, number>()
      const now = Date.now()
      const EXPECTED_DURATION = 10000 // 10 seconds

      processingItems.forEach(item => {
        const createdAt = new Date(item.created_at).getTime()
        const elapsed = now - createdAt
        // Progress curve: fast at start, slows down approaching 95%
        // Never hits 100% until actually complete
        const progress = Math.min(95, (1 - Math.exp(-elapsed / (EXPECTED_DURATION * 0.5))) * 100)
        newMap.set(item.id, Math.round(progress))
      })
      
      setProgressMap(newMap)
    }

    updateProgress()
    const interval = setInterval(updateProgress, 500)
    
    return () => clearInterval(interval)
  }, [researchResults])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchResearch()
    setIsRefreshing(false)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    // Trigger filter loading for search if query is not empty or we're clearing a search
    if (query.trim() !== '' || searchQuery !== '') {
      // Use setTimeout to allow the state to update first
      setTimeout(() => {
        fetchResearch(true)
      }, 100)
    }
  }

  // Selection management
  const handleSelectItem = (itemId: number, checked: boolean) => {
    const newSelection = new Set(selectedItems)
    if (checked) {
      newSelection.add(itemId)
    } else {
      newSelection.delete(itemId)
    }
    setSelectedItems(newSelection)
    setSelectAll(newSelection.size === researchResults.length && researchResults.length > 0)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(researchResults.map(r => r.id)))
    } else {
      setSelectedItems(new Set())
    }
    setSelectAll(checked)
  }

  // Clear selections when data changes
  useEffect(() => {
    setSelectedItems(new Set())
    setSelectAll(false)
  }, [researchResults])

  // Delete functions
  const handleSingleDelete = (itemId: number, itemName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'single',
      itemId,
      itemName
    })
  }

  const handleBulkDelete = () => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'bulk'
    })
  }

  const handleDeleteAll = () => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'all'
    })
  }

  const confirmDelete = async () => {
    const { type, itemId } = deleteConfirmation
    let deleteParams: any = {}

    switch (type) {
      case 'single':
        deleteParams = { research_id: itemId }
        break
      case 'bulk':
        deleteParams = { research_ids: Array.from(selectedItems) }
        break
      case 'all':
        deleteParams = { delete_all: true }
        break
    }

    const result = await dispatch(handleDeleteResearch(deleteParams) as any)

    if (result.success) {
      const response = result.data
      let message = response.message || `Successfully deleted research result(s)`
      
      if (response.not_found_ids && response.not_found_ids.length > 0) {
        message += `. Note: ${response.not_found_ids.length} item(s) were not found.`
      }
      
      toast({
        title: "Research Deleted",
        description: message,
      })
      
      // Clear selections after successful delete
      setSelectedItems(new Set())
      setSelectAll(false)
      
      // Refresh data to ensure consistency
      await fetchResearch()
    } else {
      toast({
        title: "Delete Failed",
        description: result.error || "Failed to delete research results",
        variant: "destructive",
      })
    }

    setDeleteConfirmation({ isOpen: false, type: 'single' })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "processing":
        return (
          <div className="relative">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
        )
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDetailPageUrl = (contactType: string, contactId: number) => {
    if (contactType === "emaillist") {
      return `/emails/${contactId}`
    } else if (contactType === "company") {
      return `/companies/${contactId}`
    }
    return "#"
  }

  const handleContactNameClick = (contactType: string, contactId: number) => {
    const url = getDetailPageUrl(contactType, contactId)
    router.push(url)
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Research Results</h1>
            <p className="text-muted-foreground">
              View personalized research for contacts and companies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            
            {researchResults.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {isDeleting ? "Deleting..." : "Delete All Research"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedItems.size > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                  disabled={isDeleting}
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isDeleting ? "Deleting..." : "Delete Selected"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by contact name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {researchResults.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  disabled={isDeleting}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Select all
                </label>
              </div>
            )}
            
            <Select
              value={statusFilter}
              onValueChange={(value: any) => {
                setStatusFilter(value)
                setCurrentPage(1)
                // Trigger filter loading
                setTimeout(() => {
                  fetchResearch(true)
                }, 100)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={contactTypeFilter}
              onValueChange={(value: any) => {
                setContactTypeFilter(value)
                setCurrentPage(1)
                // Trigger filter loading
                setTimeout(() => {
                  fetchResearch(true)
                }, 100)
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="emaillist">Email List</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results List */}
        {(isLoading && !hasLoadedOnce) || isFiltering ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <div className="flex gap-4 pt-4 border-t">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : researchResults.length > 0 ? (
          <>
            <div className="space-y-4">
              {researchResults.map((research) => (
                <Card 
                  key={research.id} 
                  className={`hover:shadow-md transition-shadow ${
                    research.status === "processing" 
                      ? "border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20" 
                      : ""
                  } ${
                    selectedItems.has(research.id)
                      ? "ring-2 ring-primary/50 border-primary/50"
                      : ""
                  } ${
                    isDeleting ? "opacity-75" : ""
                  }`}
                >
                  {/* Delete loading overlay */}
                  {isDeleting && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing deletion...</span>
                      </div>
                    </div>
                  )}
                  <CardContent className="pt-6 relative">
                    <div className="space-y-4">
                      {/* Header with selection */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            checked={selectedItems.has(research.id)}
                            onCheckedChange={(checked) => handleSelectItem(research.id, checked as boolean)}
                            disabled={isDeleting}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(research.status)}
                              <h3
                                className="text-lg font-semibold cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                onClick={() =>
                                  handleContactNameClick(research.contact_type, research.contact_id)
                                }
                              >
                                {research.contact_name}
                              </h3>
                              {getStatusBadge(research.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{research.contact_email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mb-2">
                            {research.contact_type === "emaillist" ? "Contact" : "Company"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSingleDelete(research.id, research.contact_name)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title={isDeleting ? "Deleting..." : "Delete research"}
                          >
                            {isDeleting ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Processing indicator */}
                      {research.status === "processing" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                              <Sparkles className="h-4 w-4 animate-pulse" />
                              <span>AI is researching and generating personalized content...</span>
                            </div>
                            <span className="text-xs text-blue-600 dark:text-blue-400 tabular-nums">
                              {progressMap.get(research.id) || 0}%
                            </span>
                          </div>
                          <Progress value={progressMap.get(research.id) || 0} className="h-1.5" />
                        </div>
                      )}

                      {/* Career Field */}
                      {research.career_field && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Field:</strong> {research.career_field}
                        </div>
                      )}

                      {/* Error Message */}
                      {research.error_message && (
                        <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Error:</strong> {research.error_message}
                          </p>
                        </div>
                      )}

                      {/* Research Summary - if completed (render schema-free) */}
                      {research.status === "completed" && research.research_summary && (
                        <div className="w-full">
                          <ResearchSummaryRenderer data={research.research_summary.research || research.research_summary} />
                        </div>
                      )}

                      {/* Footer - Timestamps */}
                      <div className="flex flex-col sm:flex-row gap-4 text-xs text-muted-foreground border-t pt-4">
                        <div>
                          <span className="font-semibold">Created:</span> {formatDate(research.created_at)}
                        </div>
                        {research.completed_at && (
                          <div>
                            <span className="font-semibold">Completed:</span>{" "}
                            {formatDate(research.completed_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, pagination.count)} of {pagination.count}{" "}
                  research results
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          const newPage = Math.max(currentPage - 1, 1)
                          setCurrentPage(newPage)
                          setTimeout(() => {
                            fetchResearch(true)
                          }, 100)
                        }}
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                      const isNearCurrent = Math.abs(page - currentPage) <= 1
                      const isFirstOrLast = page === 1 || page === pagination.totalPages

                      if (!isNearCurrent && !isFirstOrLast) {
                        if (page === 2 && currentPage > 3) return <PaginationEllipsis key={page} />
                        if (page === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2)
                          return <PaginationEllipsis key={page} />
                        return null
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => {
                              setCurrentPage(page)
                              setTimeout(() => {
                                fetchResearch(true)
                              }, 100)
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          const newPage = Math.min(currentPage + 1, pagination.totalPages)
                          setCurrentPage(newPage)
                          setTimeout(() => {
                            fetchResearch(true)
                          }, 100)
                        }}
                        className={
                          currentPage >= pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg">No research yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start researching contacts or companies to generate personalized emails.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => 
        setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isDeleting ? "Deleting..." : "Confirm Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Please wait while we delete your research results...</span>
                </div>
              ) : (
                <>
                  {deleteConfirmation.type === 'single' && (
                    <>Are you sure you want to delete the research for <strong>{deleteConfirmation.itemName}</strong>? This action cannot be undone.</>
                  )}
                  {deleteConfirmation.type === 'bulk' && (
                    <>Are you sure you want to delete <strong>{selectedItems.size}</strong> selected research result{selectedItems.size !== 1 ? 's' : ''}? This action cannot be undone.</>
                  )}
                  {deleteConfirmation.type === 'all' && (
                    <>Are you sure you want to delete <strong>ALL</strong> research results? This will permanently remove all your research data and cannot be undone.</>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  )
}
