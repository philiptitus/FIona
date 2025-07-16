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
import { useToast } from "@/components/ui/use-toast"
import type { RootState, AppDispatch } from "@/store/store"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const router = useRouter()

  const { campaigns, isLoading, error } = useSelector((state: RootState) => state.campaigns)

  useEffect(() => {
    dispatch(handleFetchCampaigns())
  }, [dispatch])

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      (campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (date ? new Date(campaign.updated_at).toDateString() === date.toDateString() : true),
  )

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage)
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, date, activeTab])

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your email campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/campaigns/smart-campaign">
                <Plus className="mr-2 h-4 w-4" />
                Smart Campaign
              </Link>
            </Button>
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search campaigns..."
                  className="pl-8 w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Filter by date</span>}
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
              <CardHeader className="p-4">
                <div className="flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                    onCheckedChange={selectAllCampaigns}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                    Select All
                  </label>
                  {selectedCampaigns.length > 0 && (
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
                  ) : paginatedCampaigns.length === 0 ? (
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
                      {paginatedCampaigns.map((campaign) => {
                        const status = getCampaignStatus(campaign)
                        const isLatest = latestCampaign && campaign.id === latestCampaign.id
                        return (
                          <Card
                            key={campaign.id}
                            className="rounded-lg border bg-card shadow-sm hover:scale-[1.01] transition-all group cursor-pointer"
                            onClick={() => router.push(`/campaigns/${campaign.id}`)}
                          >
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CardTitle className="truncate max-w-[60%]" title={campaign.name}>{campaign.name}</CardTitle>
                                {isLatest && <Badge variant="default">Latest</Badge>}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="opacity-70 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
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
                            <CardContent>
                              <div className="text-muted-foreground text-xs truncate max-w-full" title={campaign.description}>
                                {campaign.description || "No description"}
                              </div>
                              <div className="text-muted-foreground text-xs truncate max-w-full" title={campaign.created_at}>
                                Created: {campaign.created_at ? format(new Date(campaign.created_at), "PPP") : "-"}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4">
                <div className="text-sm text-muted-foreground">
                  Showing {paginatedCampaigns.length} of {filteredCampaigns.length} filtered campaigns (Total: {campaigns.length})
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <span className="text-xs">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
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
