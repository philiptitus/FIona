"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Copy, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, Filter, Send } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { handleFetchCampaigns, handleDeleteCampaign, bulkDeleteCampaigns } from "@/store/actions/campaignActions"
import { setCurrentPage, setSearchQuery, setRecipientTypeFilter, setPageSize, setIsScheduledFilter, setIsFinishedFilter, setIsResearchFilter } from "@/store/slices/campaignSlice"
import { removeProcessingCampaign } from "@/store/slices/processingCampaignsSlice"
import { addDispatch } from "@/store/slices/processingDispatchesSlice"
import { useToast } from "@/components/ui/use-toast"
import type { RootState, AppDispatch } from "@/store/store"
import { useRouter } from "next/navigation"
import { deleteExpiredDrafts, getUserDrafts, deleteDraft, type DraftCampaign } from "@/lib/draftStorage"
import { CampaignGeneratingFloat } from "@/components/CampaignGeneratingFloat"
import SendCampaignDialog from "@/components/campaigns/SendCampaignDialog"
import EmailSchedulingFloat from "@/components/EmailSchedulingFloat"
import { handleSendDispatch } from "@/store/actions/dispatchActions"
import { handleFetchMailboxes } from "@/store/actions/mailboxActions"
import { shuffleArray } from "@/lib/utils/shuffle"

export default function CampaignsPage() {
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [drafts, setDrafts] = useState<DraftCampaign[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Batch send dialog state
  const [batchSendDialogOpen, setBatchSendDialogOpen] = useState(false)
  const [selectedMailboxIds, setSelectedMailboxIds] = useState<number[]>([])
  const [selectedType, setSelectedType] = useState<"content" | "template" | "">(
)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>("")
  const [batchSendError, setBatchSendError] = useState("")
  const [isBatchSending, setIsBatchSending] = useState(false)
  
  // Track processed notifications to avoid duplicate refreshes
  const processedNotificationIdsRef = useRef<Set<string>>(new Set())

  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const router = useRouter()

  const { campaigns, isLoading, error, pagination, searchQuery, recipientTypeFilter, pageSize, isScheduledFilter, isFinishedFilter, isResearchFilter } = useSelector((state: RootState) => state.campaigns)
  const auth = useSelector((state: RootState) => state.auth)
  const userId = auth.user?.id?.toString()
  
  // Get Firebase notifications
  const firebaseNotifications = useSelector(
    (state: RootState) => state.firebaseNotifications?.notifications || []
  )
  
  // Get processing campaigns
  const processingCampaigns = useSelector(
    (state: RootState) => state.processingCampaigns?.campaigns || []
  )
  
  // Get mailboxes for batch send
  const { mailboxes, isLoading: isMailboxesLoading } = useSelector((state: RootState) => state.mailbox)

  // Load and cleanup drafts on mount
  useEffect(() => {
    if (!userId) return

    // Delete expired drafts first
    const deletedCount = deleteExpiredDrafts(userId)
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired draft(s)`)
    }

    // Load remaining drafts
    const userDrafts = getUserDrafts(userId)
    setDrafts(userDrafts)
  }, [userId])

  // Initialize page size from sessionStorage (client-side only)
  useEffect(() => {
    const savedPageSize = sessionStorage.getItem("campaignPageSize")
    if (savedPageSize) {
      try {
        const pageSizeValue = parseInt(savedPageSize, 10)
        if (pageSizeValue >= 1 && pageSizeValue <= 100) {
          dispatch(setPageSize(pageSizeValue))
        }
      } catch (e) {
        console.error("Failed to parse saved page size:", e)
      }
    }
    setIsHydrated(true)
  }, [])

  // Fetch campaigns on component mount and when search/pagination/filter changes
  useEffect(() => {
    if (!isHydrated) return
    dispatch(handleFetchCampaigns({ 
      search: searchQuery, 
      page: pagination.currentPage, 
      recipientType: recipientTypeFilter,
      pageSize: pageSize,
      isScheduled: isScheduledFilter,
      isFinished: isFinishedFilter,
      isResearch: isResearchFilter
    }))
  }, [dispatch, searchQuery, pagination.currentPage, recipientTypeFilter, pageSize, isScheduledFilter, isFinishedFilter, isResearchFilter, isHydrated])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput))
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchInput, searchQuery, dispatch])

  // Listen for campaign_completed notification and auto-refresh
  useEffect(() => {
    if (firebaseNotifications.length === 0) return

    const latestNotification = firebaseNotifications[0]
    
    // Check if this is a campaign completion notification and we haven't processed it yet
    if (
      latestNotification.type === 'campaign_completed' &&
      !processedNotificationIdsRef.current.has(latestNotification.id)
    ) {
      // Mark this notification as processed
      processedNotificationIdsRef.current.add(latestNotification.id)
      
      // Clear all processing campaigns to hide the float
      processingCampaigns.forEach((campaign) => {
        dispatch(removeProcessingCampaign(campaign.campaignId))
      })
      
      // Automatically refresh the campaigns list
      const autoRefresh = async () => {
        console.log("[Campaigns Page] Auto-refreshing after campaign_completed notification")
        await dispatch(handleFetchCampaigns({ 
          search: searchQuery, 
          page: pagination.currentPage, 
          recipientType: recipientTypeFilter,
          pageSize: pageSize,
          isScheduled: isScheduledFilter,
          isFinished: isFinishedFilter,
          isResearch: isResearchFilter
        }))
      }
      
      autoRefresh()
    }
  }, [firebaseNotifications, dispatch, searchQuery, pagination.currentPage, recipientTypeFilter, pageSize, isScheduledFilter, isFinishedFilter, isResearchFilter, processingCampaigns])

  // Filter campaigns by date (client-side since backend doesn't support date filtering yet)
  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      date ? new Date(campaign.updated_at).toDateString() === date.toDateString() : true
  )

  const toggleCampaignSelection = (id: number) => {
    setSelectedCampaigns((prev) => (prev.includes(id) ? prev.filter((campaignId) => campaignId !== id) : [...prev, id]))
  }

  const selectAllCampaigns = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([])
    } else {
      setSelectedCampaigns(filteredCampaigns.map((campaign) => campaign.id))
    }
  }

  const handlePageChange = (newPage: number) => {
    dispatch(setCurrentPage(newPage))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setPageSize(newPageSize))
    sessionStorage.setItem("campaignPageSize", newPageSize.toString())
  }

  const handleScheduledFilterChange = (value: boolean | null) => {
    dispatch(setIsScheduledFilter(value))
  }

  const handleFinishedFilterChange = (value: boolean | null) => {
    dispatch(setIsFinishedFilter(value))
  }

  const handleResearchFilterChange = (value: boolean | null) => {
    dispatch(setIsResearchFilter(value))
  }

  const handleDeleteSelected = async () => {
    try {
      const result = await dispatch(bulkDeleteCampaigns(selectedCampaigns)).unwrap()
      toast({
        title: "Campaigns deleted",
        description: `Successfully deleted ${result.response.deleted_count} campaigns.`,
      })
      setSelectedCampaigns([])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error || "Failed to delete campaigns.",
      })
    }
  }

  const handleDeleteSingle = async (id: number) => {
    try {
      await dispatch(handleDeleteCampaign(id))
      toast({
        title: "Campaign deleted",
        description: "Campaign has been successfully deleted.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error || "Failed to delete campaign.",
      })
    }
  }

  const handleDeleteDraft = (draftId: string) => {
    if (!userId) return

    deleteDraft(userId, draftId)
    setDrafts((prev) => prev.filter((d) => d.draftId !== draftId))
    toast({
      title: "Draft deleted",
      description: "Your draft campaign has been removed.",
    })
  }

  const handleBatchSendOpen = async () => {
    // Fetch mailboxes when dialog opens
    await dispatch(handleFetchMailboxes() as any)
    // Reset form
    setSelectedMailboxIds([])
    setSelectedType("")
    setBatchSendError("")
    setIsScheduled(false)
    setScheduledDate("")
    setBatchSendDialogOpen(true)
  }

  const handleBatchSend = async () => {
    if (!selectedMailboxIds.length || !selectedType) {
      setBatchSendError(selectedMailboxIds.length === 0 ? "Please select at least one mailbox." : "Please select a type.")
      return
    }
    if (isScheduled && !scheduledDate) {
      setBatchSendError("Please select a date to schedule the send.")
      return
    }

    setBatchSendError("")
    setIsBatchSending(true)

    try {
      // Get the campaigns to send
      const campaignsToSend = campaigns.filter(c => selectedCampaigns.includes(c.id))
      
      // Loop through each selected campaign and queue them
      for (const campaign of campaignsToSend) {
        if (!campaign.dispatch_id) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `No dispatch found for campaign "${campaign.name}".`,
          })
          continue
        }

        // Send dispatch - don't await, just queue (shuffle mailboxes for load-balancing)
        const result = await dispatch(
          handleSendDispatch(
            campaign.dispatch_id,
            shuffleArray(selectedMailboxIds),
            selectedType as "content" | "template",
            isScheduled,
            scheduledDate || undefined
          ) as any
        )

        // Check if response has token (async processing)
        if (result && result.data && result.data.token) {
          // Add to processing queue
          const processingDispatch = {
            token: result.data.token,
            dispatch_id: campaign.dispatch_id,
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            status: isScheduled ? ("scheduled" as const) : ("processing" as const),
            type: isScheduled ? ("scheduled" as const) : ("immediate" as const),
            started_at: Date.now(),
            scheduled_date: isScheduled ? scheduledDate : undefined,
            recipients_count: result.data.recipients_count,
          }
          dispatch(addDispatch(processingDispatch))
        }
      }

      // Show success toast
      const count = selectedCampaigns.length
      const message = isScheduled
        ? `📅 ${count} campaign(s) scheduled for ${scheduledDate}!`
        : `✉️ Batch send started for ${count} campaign(s)!`
      toast({
        title: "Batch send initiated",
        description: message,
      })

      // Close dialog and reset
      setBatchSendDialogOpen(false)
      setSelectedCampaigns([])
      setIsBatchSending(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to initiate batch send.",
      })
      setIsBatchSending(false)
    }
  }

  const handleEditDraft = (draft: DraftCampaign) => {
    router.push(`/campaigns/smart-campaign?draftId=${draft.draftId}`)
  }

  const handleEdit = (campaign: any) => {
    router.push(`/campaigns/${campaign.id}/edit`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      case "Scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Active":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getRecipientTypeBadge = (recipientType?: string) => {
    switch (recipientType) {
      case "email":
        return { label: "Email", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
      case "company":
        return { label: "Company", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
      default:
        return { label: "Email", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" }
    }
  }

  // Mock function to determine campaign status - in a real app, this would come from the API
  const getCampaignStatus = (campaign: any) => {
    // This is a placeholder - in a real app, you'd use actual data from the API
    const statuses = ["Draft", "Scheduled", "Sent", "In Progress", "Active"]
    const randomIndex = campaign.id % statuses.length
    return statuses[randomIndex]
  }

  // Find the latest campaign by created_at
  const latestCampaign = filteredCampaigns.reduce((latest, c) => {
    if (!latest) return c;
    return new Date(c.created_at) > new Date(latest.created_at) ? c : latest;
  }, null as any)

  return (
    <MainLayout>
      <CampaignGeneratingFloat />
      <div className="flex flex-col gap-4 sm:gap-6 px-4 sm:px-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Create and manage your email campaigns</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/campaigns/smart-campaign">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Smart Campaign</span>
                <span className="sm:hidden">Smart</span>
              </Link>
            </Button>
            {/* <Button asChild className="w-full sm:w-auto">
              <Link href="/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Campaign</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button> */}
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4">
            {/* Filter Bar - Campaign Status and Page Size */}
            <div className="flex flex-col sm:flex-row gap-2 items-center bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {/* Scheduled Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>
                        {isScheduledFilter === null ? "Scheduled: All" : isScheduledFilter ? "Scheduled: Yes" : "Scheduled: No"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleScheduledFilterChange(null)}>
                      All Campaigns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleScheduledFilterChange(true)}>
                      ✓ Scheduled Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleScheduledFilterChange(false)}>
                      ✗ Not Scheduled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Finished Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>
                        {isFinishedFilter === null ? "Finished: All" : isFinishedFilter ? "Finished: Yes" : "Finished: No"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleFinishedFilterChange(null)}>
                      All Campaigns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFinishedFilterChange(true)}>
                      ✓ Finished Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFinishedFilterChange(false)}>
                      ✗ Not Finished
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Research Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>
                        {isResearchFilter === null ? "Research: All" : isResearchFilter ? "Research: Yes" : "Research: No"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleResearchFilterChange(null)}>
                      All Campaigns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleResearchFilterChange(true)}>
                      🔬 Research Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleResearchFilterChange(false)}>
                      ✏️ Manual Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Page Size Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span>Per Page: {pageSize}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePageSizeChange(10)}>
                      {pageSize === 10 && "✓ "}10 per page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePageSizeChange(25)}>
                      {pageSize === 25 && "✓ "}25 per page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePageSizeChange(50)}>
                      {pageSize === 50 && "✓ "}50 per page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePageSizeChange(100)}>
                      {pageSize === 100 && "✓ "}100 per page
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:flex">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
                <TabsTrigger value="drafts" className="text-xs sm:text-sm">Drafts</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm">Done</TabsTrigger>
              </TabsList>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">{date ? format(date, "PPP") : "Filter by date"}</span>
                      <span className="sm:hidden">{date ? format(date, "MMM d") : "Date"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                      <span className="hidden sm:inline">Recipient Type: {recipientTypeFilter === "all" ? "All" : recipientTypeFilter === "email" ? "Email" : "Company"}</span>
                      <span className="sm:hidden">Type: {recipientTypeFilter === "all" ? "All" : recipientTypeFilter === "email" ? "Email" : "Co."}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => dispatch(setRecipientTypeFilter("all"))}>
                      All Recipients
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => dispatch(setRecipientTypeFilter("email"))}>
                      Email Recipients
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => dispatch(setRecipientTypeFilter("company"))}>
                      Company Recipients
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="select-all"
                      checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onCheckedChange={selectAllCampaigns}
                    />
                    <label htmlFor="select-all" className="ml-2 text-xs sm:text-sm font-medium">
                      Select All
                    </label>
                  </div>
                  {selectedCampaigns.length > 0 && (
                    <div className="ml-auto flex gap-1 sm:gap-2">
                      <Button variant="default" size="sm" onClick={handleBatchSendOpen} className="text-xs sm:text-sm px-2 sm:px-3 bg-blue-600 hover:bg-blue-700">
                        <Send className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Batch Send</span>
                        <span className="sm:hidden">Send</span>
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                        <Copy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Duplicate</span>
                        <span className="sm:hidden">Copy</span>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="text-xs sm:text-sm px-2 sm:px-3">
                        <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
                    </div>
                  ) : filteredCampaigns.length === 0 && drafts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground mb-4">No campaigns found</p>
                      <Button asChild>
                        <Link href="/campaigns/smart-campaign">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Campaign
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {/* Render Draft Campaigns First */}
                      {drafts.length > 0 && (
                        <>
                          <div className="px-3 sm:px-6 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
                            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                              Draft Campaigns ({drafts.length})
                            </h3>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                              Not yet submitted to the backend
                            </p>
                          </div>
                          {drafts.map((draft) => (
                            <Card
                              key={draft.draftId}
                              className="rounded-none border-b-0 border-l-4 border-l-amber-400 bg-card shadow-none hover:bg-accent transition-colors group"
                            >
                              <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-6 pb-2 sm:pb-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                  <CardTitle className="text-sm sm:text-base truncate" title={draft.campaignName}>
                                    {draft.campaignName || "Untitled Draft"}
                                  </CardTitle>
                                  <Badge variant="outline" className="text-xs w-fit bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-300">
                                    Draft
                                  </Badge>
                                  {draft.recipientType === "company" && (
                                    <Badge className="text-xs w-fit bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                      Company
                                    </Badge>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="opacity-70 group-hover:opacity-100 h-8 w-8 sm:h-10 sm:w-10" onClick={(e) => e.stopPropagation()}>
                                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditDraft(draft)}>
                                      <Edit className="mr-2 h-4 w-4" /> Continue Editing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteDraft(draft.draftId)} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete Draft
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </CardHeader>
                              <CardContent className="p-3 sm:p-6 pt-0">
                                <div className="text-muted-foreground text-xs sm:text-sm truncate max-w-full mb-1 line-clamp-2" title={draft.campaignType}>
                                  {draft.campaignType || "No description provided"}
                                </div>
                                <div className="text-muted-foreground text-xs truncate max-w-full">
                                  Started: {format(new Date(draft.createdAt), "MMM d, yyyy")} • Expires in{" "}
                                  {Math.ceil((draft.expiresAt - Date.now()) / (1000 * 60 * 60))} hours
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </>
                      )}

                      {/* Render Backend Campaigns */}
                      {filteredCampaigns.length > 0 && (
                        <>
                          {drafts.length > 0 && (
                            <div className="px-3 sm:px-6 py-3 bg-gray-50 dark:bg-gray-950/20 border-b border-gray-200 dark:border-gray-800">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                Submitted Campaigns ({filteredCampaigns.length})
                              </h3>
                            </div>
                          )}
                          {filteredCampaigns.map((campaign) => {
                            const status = getCampaignStatus(campaign)
                            const isLatest = latestCampaign && campaign.id === latestCampaign.id
                            return (
                              <Card
                                key={campaign.id}
                                className="rounded-lg border bg-card shadow-sm hover:scale-[1.01] transition-all group cursor-pointer"
                                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                              >
                                <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-6 pb-2 sm:pb-2 gap-3">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <Checkbox
                                      id={`campaign-${campaign.id}`}
                                      checked={selectedCampaigns.includes(campaign.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          toggleCampaignSelection(campaign.id)
                                        } else {
                                          toggleCampaignSelection(campaign.id)
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mt-1 h-4 w-4"
                                    />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                      <CardTitle className="text-sm sm:text-base truncate" title={campaign.name}>{campaign.name}</CardTitle>
                                      {isLatest && <Badge variant="default" className="text-xs w-fit">Latest</Badge>}
                                      {campaign.is_sequence && <Badge className="text-xs w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300">Sequence</Badge>}
                                      {campaign.recipient_type && (
                                        <Badge className={`text-xs w-fit ${getRecipientTypeBadge(campaign.recipient_type).className}`}>
                                          {getRecipientTypeBadge(campaign.recipient_type).label}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="opacity-70 group-hover:opacity-100 h-8 w-8 sm:h-10 sm:w-10" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => router.push(`/campaigns/${campaign.id}`)}>
                                        <Eye className="mr-2 h-4 w-4" /> View
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(campaign); }}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteSingle(campaign.id); }} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-6 pt-0">
                                  <div className="text-muted-foreground text-xs sm:text-sm truncate max-w-full mb-1" title={campaign.description}>
                                    {campaign.description || "No description"}
                                  </div>
                                  <div className="text-muted-foreground text-xs truncate max-w-full" title={campaign.created_at}>
                                    Created: {campaign.created_at ? format(new Date(campaign.created_at), "MMM d, yyyy") : "-"}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing {filteredCampaigns.length} of {pagination.count}
                  {searchQuery && ` (filtered)`}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(pagination.currentPage - 1)} 
                    disabled={!pagination.previous}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <span className="text-xs px-2">
                    {pagination.currentPage}/{pagination.totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(pagination.currentPage + 1)} 
                    disabled={!pagination.next}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>View and manage your currently active email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">Active campaigns will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Draft Campaigns</CardTitle>
                <CardDescription>Continue working on your draft campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">Draft campaigns will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Campaigns</CardTitle>
                <CardDescription>Review your completed email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">Completed campaigns will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Batch Send Dialog */}
      <SendCampaignDialog
        open={batchSendDialogOpen}
        onOpenChange={setBatchSendDialogOpen}
        campaign={null}
        selectedMailboxIds={selectedMailboxIds}
        onMailboxChange={setSelectedMailboxIds}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        isScheduled={isScheduled}
        onScheduledChange={setIsScheduled}
        scheduledDate={scheduledDate}
        onScheduledDateChange={setScheduledDate}
        isSending={isBatchSending}
        sendSuccess={false}
        sendError={batchSendError}
        mailboxes={mailboxes}
        isMailboxesLoading={isMailboxesLoading}
        onSend={handleBatchSend}
        sendDisabled={isBatchSending || selectedMailboxIds.length === 0 || !selectedType || (isScheduled && !scheduledDate)}
        sendDisabledReason={(() => {
          if (isBatchSending) return ''
          if (selectedMailboxIds.length === 0) return 'Please select at least one mailbox.'
          if (!selectedType) return 'Please select a type (content or template).'
          if (isScheduled && !scheduledDate) return 'Please select a date to schedule the send.'
          return ''
        })()}
      />

      {/* Email Scheduling Float */}
      <EmailSchedulingFloat />
    </MainLayout>
  )
}
