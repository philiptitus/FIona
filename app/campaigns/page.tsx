"use client"

import { useState, useEffect } from "react"
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
import { CalendarIcon, Copy, Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { handleFetchCampaigns, handleDeleteCampaign, bulkDeleteCampaigns } from "@/store/actions/campaignActions"
import { setCurrentPage, setSearchQuery } from "@/store/slices/campaignSlice"
import { useToast } from "@/components/ui/use-toast"
import type { RootState, AppDispatch } from "@/store/store"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("all")
  const [searchInput, setSearchInput] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const router = useRouter()

  const { campaigns, isLoading, error, pagination, searchQuery } = useSelector((state: RootState) => state.campaigns)

  // Fetch campaigns on component mount and when search/pagination changes
  useEffect(() => {
    dispatch(handleFetchCampaigns({ search: searchQuery, page: pagination.currentPage }))
  }, [dispatch, searchQuery, pagination.currentPage])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput))
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchInput, searchQuery, dispatch])

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
            <Button asChild className="w-full sm:w-auto">
              <Link href="/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Campaign</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
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
                  ) : filteredCampaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground mb-4">No campaigns found</p>
                      <Button asChild>
                        <Link href="/campaigns/new">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Campaign
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredCampaigns.map((campaign) => {
                        const status = getCampaignStatus(campaign)
                        const isLatest = latestCampaign && campaign.id === latestCampaign.id
                        return (
                          <Card
                            key={campaign.id}
                            className="rounded-lg border bg-card shadow-sm hover:scale-[1.01] transition-all group cursor-pointer"
                            onClick={() => router.push(`/campaigns/${campaign.id}`)}
                          >
                            <CardHeader className="flex flex-row items-start justify-between p-3 sm:p-6 pb-2 sm:pb-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                <CardTitle className="text-sm sm:text-base truncate" title={campaign.name}>{campaign.name}</CardTitle>
                                {isLatest && <Badge variant="default" className="text-xs w-fit">Latest</Badge>}
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
    </MainLayout>
  )
}
