"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/store/store"
import { useEffect } from "react"
import { handleFetchCampaignById } from "@/store/actions/campaignActions"
import { handleFetchEmails } from "@/store/actions/emailActions"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { handleFetchContentById } from '@/store/actions/contentActions';
import { handleFetchTemplates } from '@/store/actions/templateActions';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import React from "react"
import AddEmailDialog from "@/components/emails/AddEmailDialog"
import CampaignCopiesPreview from "@/components/campaigns/CampaignCopiesPreview"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Send, Loader2, CheckCircle2, XCircle, Trash2, AlertTriangle, CheckCircle, X, Loader, Eye } from "lucide-react"
import { handleSendDispatch } from "@/store/actions/dispatchActions"
import { handleFetchMailboxes } from "@/store/actions/mailboxActions"
import { handleDisassociateEmails } from "@/store/actions/emailActions"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import MailLoader from '@/components/MailLoader'

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  // Always use currentCampaign from the store (fresh from backend) as the source of truth
  const { isLoading, currentCampaign } = useSelector((state: RootState) => state.campaigns)
  const { emails: allEmails, isLoading: emailsLoading, pagination } = useSelector((state: RootState) => state.emails)
  const { dispatches } = useSelector((state: RootState) => state.dispatch);
  const campaignId = Number(params.id)
  // Use currentCampaign only when it matches the route id
  const campaign = currentCampaign && currentCampaign.id === campaignId ? currentCampaign : null
  const [triedFetch, setTriedFetch] = React.useState(false)
  const [showAddEmailDialog, setShowAddEmailDialog] = React.useState(false)
  const [sendModalOpen, setSendModalOpen] = React.useState(false)
  const [selectedMailboxIds, setSelectedMailboxIds] = React.useState<number[]>([])
  const [selectedType, setSelectedType] = React.useState<"content" | "template" | "">("")
  const [sendError, setSendError] = React.useState("")
  const { mailboxes, isLoading: isMailboxesLoading } = useSelector((state: RootState) => state.mailbox)
  const [isSending, setIsSending] = React.useState(false)
  const [sendSuccess, setSendSuccess] = React.useState(false)
  const [showMoreOptions, setShowMoreOptions] = React.useState(false)
  const [isScheduled, setIsScheduled] = React.useState(false)
  const [scheduleDay1, setScheduleDay1] = React.useState<string>("")
  const [scheduleDay2, setScheduleDay2] = React.useState<string>("")
  const [scheduleDay3, setScheduleDay3] = React.useState<string>("")
  // Weekday options and helper to ensure uniqueness across selects
  const weekdays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ]

  // Keep selections unique: if a change causes duplicates, clear the later fields
  React.useEffect(() => {
    // If day2 equals day1, clear day2
    if (scheduleDay1 && scheduleDay2 && scheduleDay1 === scheduleDay2) {
      setScheduleDay2("")
    }
    // If day3 equals day1 or day2, clear day3
    if (scheduleDay3 && (scheduleDay3 === scheduleDay1 || scheduleDay3 === scheduleDay2)) {
      setScheduleDay3("")
    }
    // Also if day2 equals day3 after changes, clear day3
    if (scheduleDay2 && scheduleDay3 && scheduleDay2 === scheduleDay3) {
      setScheduleDay3("")
    }
  }, [scheduleDay1, scheduleDay2, scheduleDay3])

  // Compute disabled state and tooltip reason for the Send button
  const sendDisabled = isSending || selectedMailboxIds.length === 0 || !selectedType || (showMoreOptions && isScheduled && !(scheduleDay1 || scheduleDay2 || scheduleDay3))
  const sendDisabledReason = (() => {
    if (isSending) return ''
    if (selectedMailboxIds.length === 0) return 'Please select at least one mailbox.'
    if (!selectedType) return 'Please select a type (content or template).'
    if (showMoreOptions && isScheduled && !(scheduleDay1 || scheduleDay2 || scheduleDay3)) return 'Please select at least one day to schedule the send.'
    return ''
  })()
  const [showMailboxSelector, setShowMailboxSelector] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const selectorRef = React.useRef<HTMLDivElement>(null)
  const [selectedEmails, setSelectedEmails] = React.useState<number[]>([])
  const [isDisassociating, setIsDisassociating] = React.useState(false)
  const [notification, setNotification] = React.useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' })
  const [isLoadingEmails, setIsLoadingEmails] = React.useState(false)
  const [allEmailsList, setAllEmailsList] = React.useState<any[]>([])
  const [availableEmails, setAvailableEmails] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // Filter emails that are not already in the campaign
  React.useEffect(() => {
    if (allEmails && campaign) {

      const filtered = allEmails.filter(email => {
        const isInCampaign = email.campaigns?.some((c: any) => c.id === campaign.id);
        return !isInCampaign;
      });
      setAvailableEmails(filtered);
    } else {
      setAvailableEmails(allEmails || []);
    }
  }, [allEmails, campaign])
  
  const handleAddExistingEmailsToCampaign = async (emailIds: number[], skipDuplicates: boolean) => {
    if (!campaign) return { success: false, error: 'No campaign selected' }
    
    try {
      const result = await dispatch(handleAddExistingEmails({
        campaignId: campaign.id,
        emailListIds: emailIds,
        skipDuplicates
      }) as any)
      
      if (result?.payload?.success) {
        // Refresh emails after successful addition
        await dispatch(handleFetchEmails({ campaignId: campaign.id }) as any)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result?.payload?.error || result?.error || 'Failed to add emails' 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error?.message || 'Failed to add emails' 
      }
    }
  }

  React.useEffect(() => {
    // Always fetch the campaign from the backend to ensure fresh data (refresh-safe)
    setTriedFetch(true)
    dispatch(handleFetchCampaignById(campaignId) as any)

    // Always fetch emails for the current campaign id
    if (campaignId) {
      dispatch(handleFetchEmails({ campaignId, page: currentPage }) as any)
    }
    // We intentionally do not depend on `campaign` here because we always want to re-query by id
  }, [dispatch, campaignId, currentPage])

  // Show notification with auto-dismiss
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: '', message: '' }), 4000)
  }

  // Handle email selection
  const toggleEmailSelection = (emailId: number) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  // Handle select all/none
  const toggleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id))
    }
  }

  // Handle disassociating emails
  const handleDisassociateSelected = async () => {
    if (selectedEmails.length === 0 || !campaignId) return
    
    try {
      setIsDisassociating(true)
      const result = await dispatch(handleDisassociateEmails(campaignId, selectedEmails) as any)
      
      if (result?.success) {
        showNotification('success', result?.data?.message || `Removed ${selectedEmails.length} email(s) from campaign`)
        setSelectedEmails([])
        // Refresh the emails list
        await dispatch(handleFetchEmails({ campaignId }) as any)
      } else {
        throw new Error(result?.error || 'Failed to remove emails')
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to remove emails')
    } finally {
      setIsDisassociating(false)
    }
  }

  // Filter emails to only show those in the current campaign and match search
  const campaignEmails = allEmails.filter(email => email.campaign === campaignId)
  
  const filteredEmails = campaignEmails.filter(email => 
    email.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (email.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (email.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (email.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  // Close selector when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowMailboxSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (sendModalOpen) {
      dispatch(handleFetchMailboxes() as any)
      setSelectedMailboxIds([])
      setSelectedType("")
      setSendError("")
      setShowMailboxSelector(false)
      // reset scheduling UI when modal opens
      setShowMoreOptions(false)
      setIsScheduled(false)
      setScheduleDay1("")
      setScheduleDay2("")
      setScheduleDay3("")
      setSearchQuery("")
    }
  }, [sendModalOpen, dispatch])

  const handleSendModal = async () => {
    if (!campaignId || selectedMailboxIds.length === 0 || !selectedType) {
      setSendError(selectedMailboxIds.length === 0 ? "Please select at least one mailbox." : "Please select a type.")
      return
    }
    if (!campaign?.dispatch_id) {
      setSendError("No dispatch found for this campaign.")
      return
    }
    setSendError("")
    setIsSending(true)
    setSendSuccess(false)
    // If scheduling is enabled, ensure at least one day is selected
    if (isScheduled && !(scheduleDay1 || scheduleDay2 || scheduleDay3)) {
      setIsSending(false)
      setSendError("Please select at least one day to schedule the send.")
      return
    }
    const result = await dispatch(handleSendDispatch(
      campaign.dispatch_id,
      undefined,
      selectedMailboxIds,
      selectedType,
      isScheduled,
      scheduleDay1 || undefined,
      scheduleDay2 || undefined,
      scheduleDay3 || undefined,
    ) as any)
    setIsSending(false)
    if (result && result.success) {
      setSendSuccess(true)
      setTimeout(() => {
        setSendModalOpen(false)
        setSendSuccess(false)
      }, 1800)
    } else {
      setSendError(result?.error || "Failed to send dispatch.")
    }
  }

  const allEmailsSent = campaignEmails.length > 0 && campaignEmails.every(email => email.is_sent);
  const hasSendable = !allEmailsSent && (campaign?.latest_email_template_id || campaign?.latest_email_content_id) && campaignEmails.length > 0

  useEffect(() => {
    // Only redirect if we've attempted to fetch the campaign and it's still missing
    if (triedFetch && !campaign && !isLoading) {
      router.replace("/campaigns")
    }
  }, [campaign, isLoading, router, triedFetch])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
          <MailLoader />
        </div>
      </MainLayout>
    );
  }

  // Only show 'Campaign not found' after we've attempted a fetch and loading is finished
  if (triedFetch && !isLoading && !campaign) {
    return (
      <MainLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
          <Button onClick={() => router.push('/campaigns')}>Back to Campaigns</Button>
        </div>
      </MainLayout>
    );
  }

  const handleViewTemplate = async (id: number) => {
    await dispatch(handleFetchTemplates() as any);
    router.push(`/templates/${id}`);
  };
  const handleViewContent = async (id: number) => {
    await dispatch(handleFetchContentById(id) as any);
    router.push(`/content/${id}`);
  };

  return (
    <MainLayout>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification.type && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-4 right-4 z-50 max-w-md w-full p-4 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              )}
              <span>{notification.message}</span>
              <button 
                onClick={() => setNotification({ type: '', message: '' })}
                className="ml-auto p-1 hover:bg-opacity-20 hover:bg-gray-500 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/campaigns")}>{"<-"} Back to Campaigns</Button>
        <Card className="shadow-xl border-2 border-primary/10 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b p-4 sm:p-6">
            {campaign?.image ? (
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src={campaign.image} alt="Campaign" />
                <AvatarFallback>{campaign.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarFallback>{campaign?.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 break-words">{campaign?.name || "Campaign"}</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <Badge variant="secondary" className="text-xs">ID: {campaign?.id}</Badge>
                <Badge variant="outline" className="text-xs">Created: {campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString() : "-"}</Badge>
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">Updated: {campaign?.updated_at ? new Date(campaign.updated_at).toLocaleDateString() : "-"}</Badge>
                {campaign?.is_sequence && (
                  <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300">
                    Sequence
                  </Badge>
                )}
                {campaign?.is_finished && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Finished
                  </Badge>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => router.push(`/campaigns/${campaignId}/edit`)}>Edit</Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-6 space-y-2">
              <div className="text-sm sm:text-base lg:text-lg break-words"><b>Description:</b> {campaign?.description || <span className="text-muted-foreground">No description</span>}</div>
              {campaign?.attachment && (
                <div className="text-sm sm:text-base"><b>Attachment:</b> <a href={campaign.attachment} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a></div>
              )}
            </div>
            {/* Email Preview Section - Handles both single and multi-copy campaigns */}
            {campaign && (
              <CampaignCopiesPreview campaign={campaign} copies={campaign?.copies || 1} />
            )}
            
            {/* Email List Header */}
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{campaign?.name || 'Campaign Details'}</h1>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  {!campaign?.is_finished && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setShowAddEmailDialog(true)}
                    >
                      <span className="hidden sm:inline">Add Emails to Campaign</span>
                      <span className="sm:hidden">Add Emails</span>
                    </Button>
                  )}
                  {!campaign?.is_finished && (
                    <Button size="sm" className="w-full sm:w-auto" onClick={() => setSendModalOpen(true)}>
                      <Send className="mr-2 h-4 w-4" /> 
                      <span className="hidden sm:inline">Send Campaign</span>
                      <span className="sm:hidden">Send</span>
                    </Button>
                  )}
                  {campaign?.is_finished && (
                    <Badge variant="secondary" className="px-3 py-1">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Campaign Finished
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Inline alert/banner if no emails */}
              {!emailsLoading && campaignEmails.length === 0 && (
                <Alert variant="destructive">
                  <AlertTitle>No Emails Attached</AlertTitle>
                  <AlertDescription>
                    This campaign doesn't have any emails attached yet.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* <div className="flex flex-col space-y-4">
                {selectedEmails.length > 0 && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium text-blue-700">
                          {selectedEmails.length} email{selectedEmails.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedEmails([])}
                          className="border-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={handleDisassociateSelected}
                          disabled={isDisassociating}
                          className="flex items-center gap-2"
                        >
                          {isDisassociating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Remove Selected
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div> */}
            </div>
            {/* Collapsible Associated Emails Section */}
            <Accordion type="single" collapsible defaultValue="emails">
              <AccordionItem value="emails">
                <AccordionTrigger className="text-lg font-semibold">Associated Emails ({pagination?.count || campaignEmails.length})</AccordionTrigger>
                <AccordionContent>
                  {emailsLoading ? (
                    <div>Loading emails...</div>
                  ) : campaignEmails.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="text-muted-foreground mb-2">No emails associated with this campaign.</div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold">Emails</h2>
                        <div className="relative w-full sm:w-64">
                          <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 sm:gap-4 p-2 bg-gray-50 rounded-lg">
                          <Checkbox 
                            id="select-all"
                            checked={selectedEmails.length > 0 && selectedEmails.length === filteredEmails.length}
                            onCheckedChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label 
                            htmlFor="select-all" 
                            className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer flex-1"
                          >
                            {selectedEmails.length > 0 
                              ? `Selected ${selectedEmails.length} email(s)`
                              : 'Select all'}
                          </label>
                          {selectedEmails.length > 0 && (
                            <button 
                              onClick={() => setSelectedEmails([])}
                              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {selectedEmails.length > 0 && (
                          <div className="flex justify-end">
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={handleDisassociateSelected}
                              disabled={isDisassociating}
                              className="flex items-center gap-2 text-xs sm:text-sm"
                            >
                              {isDisassociating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">Remove {selectedEmails.length} selected email{selectedEmails.length !== 1 ? 's' : ''}</span>
                              <span className="sm:hidden">Remove ({selectedEmails.length})</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {filteredEmails.map((email) => (
                          <motion.div
                            key={email.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative ${selectedEmails.includes(email.id) ? 'ring-2 ring-blue-500' : ''}`}
                          >
                            <Card className={`hover:shadow-md transition-shadow ${selectedEmails.includes(email.id) ? 'border-blue-500' : ''}`}>
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                  <Checkbox 
                                    id={`email-${email.id}`}
                                    checked={selectedEmails.includes(email.id)}
                                    onCheckedChange={() => toggleEmailSelection(email.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                  />
                                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                                    <div className="flex flex-col space-y-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-sm sm:text-base break-all">{email.email}</span>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              {email.is_sent ? (
                                                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                              ) : (
                                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                                              )}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {email.is_sent 
                                                ? "Email has been sent successfully" 
                                                : "Email has not been sent yet"}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      {(email.first_name || email.last_name) && (
                                        <div className="text-xs sm:text-sm text-gray-500">
                                          {email.first_name} {email.last_name}
                                        </div>
                                      )}
                                      {email.organization_name && (
                                        <div className="text-xs sm:text-sm text-gray-500 break-words">
                                          {email.organization_name}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 sm:h-10 sm:w-10"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                router.push(`/emails/${email.id}`)
                                              }}
                                            >
                                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>View contact</TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      {/* Pagination Controls */}
                      {pagination && pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Page {pagination.currentPage} of {pagination.totalPages} • {pagination.count} total emails
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={!pagination.previous || currentPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => prev + 1)}
                              disabled={!pagination.next || currentPage === pagination.totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
              <DialogContent className="w-[95vw] max-w-[560px] rounded-xl border shadow-2xl flex flex-col max-h-[85vh]">
                  <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Send Campaign</DialogTitle>
                </DialogHeader>
                  <div className="flex-1 overflow-auto flex flex-col gap-4 min-h-[120px]">
                  {!isSending && !sendSuccess && (
                    <div className="rounded-lg bg-gradient-to-r from-primary/10 to-purple-200/20 p-4 border">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                          <Send className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">Finalize and send your campaign</div>
                          <div className="text-xs text-muted-foreground">Choose mailboxes, select content type, and launch</div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded-full bg-background border">1. Mailboxes</span>
                          <span className="px-2 py-1 rounded-full bg-background border">2. Type</span>
                          <span className="px-2 py-1 rounded-full bg-background border">3. Send</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {isSending ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="animate-spin w-10 h-10 text-primary mb-2" />
                      <div className="text-primary font-semibold">{isScheduled ? 'Scheduling your campaign…' : 'Sending your campaign…'}</div>
                      <div className="text-xs text-muted-foreground">{isScheduled ? 'Queueing the send according to selected weekday(s).' : 'Distributing messages across selected mailboxes'}</div>
                    </div>
                  ) : sendSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mb-2 animate-pop" />
                      <div className="text-green-600 font-semibold text-lg">{isScheduled ? 'Send scheduled' : 'Emails sent successfully!'}</div>
                      {isScheduled && (
                        <div className="text-sm text-muted-foreground mt-1">Your campaign was scheduled for the selected weekday(s).</div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="bg-muted/40 rounded-lg p-3 border">
                        <label className="block mb-1 font-medium">Select Mailboxes</label>
                        {isMailboxesLoading ? (
                          <div>Loading mailboxes...</div>
                        ) : (
                          <div className="relative" ref={selectorRef}>
                            <div 
                              className="w-full border rounded px-3 py-2 min-h-10 flex flex-wrap gap-2 cursor-pointer items-center"
                              onClick={() => setShowMailboxSelector(!showMailboxSelector)}
                            >
                              {selectedMailboxIds.length === 0 ? (
                                <span className="text-muted-foreground">Select mailboxes...</span>
                              ) : (
                                selectedMailboxIds.slice(0, 2).map(mailboxId => {
                                  const mailbox = mailboxes.find((mb: any) => mb.id === mailboxId)
                                  return mailbox ? (
                                    <Badge key={mailbox.id} className="flex items-center gap-1">
                                      {mailbox.email} ({mailbox.provider})
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedMailboxIds(selectedMailboxIds.filter(id => id !== mailbox.id))
                                        }}
                                        className="ml-1 hover:text-destructive"
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ) : null
                                })
                              )}
                              {selectedMailboxIds.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{selectedMailboxIds.length - 2} more
                                </Badge>
                              )}
                            </div>
                            
                            {showMailboxSelector && (
                              <div className="absolute z-10 mt-1 w-full bg-card border rounded shadow-lg p-2 max-h-60 overflow-y-auto">
                                <input
                                  type="text"
                                  placeholder="Search mailboxes..."
                                  className="w-full p-2 mb-2 border rounded"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="space-y-1">
                                  {mailboxes
                                    .filter((mb: any) => 
                                      mb.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      mb.provider.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((mb: any) => (
                                      <div 
                                        key={mb.id} 
                                        className="flex items-center p-2 hover:bg-accent rounded cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedMailboxIds(prev => 
                                            prev.includes(mb.id)
                                              ? prev.filter(id => id !== mb.id)
                                              : [...prev, mb.id]
                                          )
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedMailboxIds.includes(mb.id)}
                                          className="mr-2 h-4 w-4"
                                          onChange={() => {}} // Required for React controlled component
                                        />
                                        <span>{mb.email} ({mb.provider})</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {selectedMailboxIds.length} mailbox{selectedMailboxIds.length !== 1 ? 'es' : ''} selected · Load-balanced sending for deliverability
                            </div>
                          </div>
                        )}
                      </div>
                      {campaign?.latest_email_content_id || campaign?.latest_email_template_id ? (
                        <div className="bg-muted/40 rounded-lg p-3 border">
                          <label className="block mb-1 font-medium">Type</label>
                          <select
                            className="w-full border rounded px-3 py-2"
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value as "content" | "template")}
                          >
                            <option value="">Select type...</option>
                            {campaign?.latest_email_content_id && (
                              <option value="content">Content (plain text)</option>
                            )}
                            {campaign?.latest_email_template_id && (
                              <option value="template">Template (HTML)</option>
                            )}
                          </select>
                          <p className="text-xs text-muted-foreground mt-1">Templates are styled HTML; content is simple, personal text.</p>
                        </div>
                      ) : (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>No content available</AlertTitle>
                          <AlertDescription>
                            Please create or assign content or a template to this campaign before sending.
                          </AlertDescription>
                        </Alert>
                      )}
                      {/* More options: scheduling - only for non-sequence campaigns */}
                      {!campaign?.is_sequence && (
                        <div className="mt-3">
                          <button
                            className="text-sm text-primary hover:underline"
                            onClick={() => setShowMoreOptions(prev => !prev)}
                          >
                            {showMoreOptions ? 'Hide more options' : 'More options'}
                          </button>
                          {showMoreOptions && (
                            <div className="mt-2 bg-muted/30 border rounded p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" id="schedule-toggle" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} />
                                  <label htmlFor="schedule-toggle" className="text-sm font-medium">Schedule this send</label>
                                </div>
                                <div className="text-xs text-muted-foreground">Optional</div>
                              </div>
                              {isScheduled && (
                                <div className="w-full">
                                  <select className="w-full border rounded px-2 py-1" value={scheduleDay1} onChange={e => setScheduleDay1(e.target.value)}>
                                    <option value="">Select day...</option>
                                    {weekdays.map(d => (
                                      <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">If scheduled, the send will be queued and dispatched on the chosen weekday.</div>
                            </div>
                          )}
                        </div>
                      )}
                      {sendError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-fade-in">
                          <XCircle className="w-5 h-5" />
                          <span>{sendError}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {!isSending && !sendSuccess && (
                  <DialogFooter className="mt-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendModal();
                      }} 
                      disabled={sendDisabled}
                      title={sendDisabledReason}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {showMoreOptions && isScheduled ? 'Schedule Send' : 'Send Campaign Now'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSendModalOpen(false)} 
                      disabled={isSending}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s;
        }
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.4s;
        }
      `}</style>
      <AddEmailDialog 
        open={showAddEmailDialog} 
        onOpenChange={setShowAddEmailDialog} 
        initialCampaignId={campaignId}
        campaign={campaign}
        emails={availableEmails}
        onAddExistingEmails={handleAddExistingEmailsToCampaign}
        isLoadingEmails={emailsLoading}
        onSuccess={() => dispatch(handleFetchEmails({ campaignId }) as any)}
      />
    </MainLayout>
  );
}
