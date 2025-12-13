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
import { handleFetchCompanies } from "@/store/actions/companyActions"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { handleFetchContentById } from '@/store/actions/contentActions';
import { handleFetchTemplates } from '@/store/actions/templateActions';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import React from "react"
import AddEmailDialog from "@/components/emails/AddEmailDialog"
import AddCompanyDialog from "@/components/companies/AddCompanyDialog"
import CampaignCopiesPreview from "@/components/campaigns/CampaignCopiesPreview"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Send, Loader2, CheckCircle2, XCircle, Trash2, AlertTriangle, CheckCircle, X, Loader, Eye, Building2 } from "lucide-react"
import { handleSendDispatch } from "@/store/actions/dispatchActions"
import { handleFetchMailboxes } from "@/store/actions/mailboxActions"
import SendCampaignDialog from "@/components/campaigns/SendCampaignDialog"
import { handleDisassociateEmails } from "@/store/actions/emailActions"
import { handleDisassociateCompanies } from "@/store/actions/companyActions"
import { addDispatch } from "@/store/slices/processingDispatchesSlice"
import { pollDispatchStatus } from "@/store/actions/processingDispatchesActions"
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
  const { companies: allCompanies, isLoading: companiesLoading, pagination: companiesPagination } = useSelector((state: RootState) => state.companies)
  const { dispatches } = useSelector((state: RootState) => state.dispatch);
  const campaignId = Number(params.id)
  // Use currentCampaign only when it matches the route id
  const campaign = currentCampaign && currentCampaign.id === campaignId ? currentCampaign : null
  const [triedFetch, setTriedFetch] = React.useState(false)
  const [showAddCompanyDialog, setShowAddCompanyDialog] = React.useState(false)
  const [showAddEmailDialog, setShowAddEmailDialog] = React.useState(false)
  const [sendModalOpen, setSendModalOpen] = React.useState(false)
  const [selectedMailboxIds, setSelectedMailboxIds] = React.useState<number[]>([])
  const [selectedType, setSelectedType] = React.useState<"content" | "template" | "">("")
  const [sendError, setSendError] = React.useState("")
  const { mailboxes, isLoading: isMailboxesLoading } = useSelector((state: RootState) => state.mailbox)
  const [isSending, setIsSending] = React.useState(false)
  const [sendSuccess, setSendSuccess] = React.useState(false)
  const [isScheduled, setIsScheduled] = React.useState(false)
  const [scheduledDate, setScheduledDate] = React.useState<string>("")

  // Compute disabled state and tooltip reason for the Send button
  const sendDisabled = isSending || selectedMailboxIds.length === 0 || !selectedType || (isScheduled && !scheduledDate)
  const sendDisabledReason = (() => {
    if (isSending) return ''
    if (selectedMailboxIds.length === 0) return 'Please select at least one mailbox.'
    if (!selectedType) return 'Please select a type (content or template).'
    if (isScheduled && !scheduledDate) return 'Please select a date to schedule the send.'
    return ''
  })()
  const [showMailboxSelector, setShowMailboxSelector] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedEmails, setSelectedEmails] = React.useState<number[]>([])
  const [selectedCompanies, setSelectedCompanies] = React.useState<number[]>([])
  const [isDisassociating, setIsDisassociating] = React.useState(false)
  const [isDisassociatingCompanies, setIsDisassociatingCompanies] = React.useState(false)
  const [notification, setNotification] = React.useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' })
  const [isLoadingEmails, setIsLoadingEmails] = React.useState(false)
  const [allEmailsList, setAllEmailsList] = React.useState<any[]>([])
  const [availableEmails, setAvailableEmails] = React.useState<any[]>([])
  const [availableCompanies, setAvailableCompanies] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [currentCompanyPage, setCurrentCompanyPage] = React.useState(1)
  const processingDispatches = useSelector((state: RootState) => state.processingDispatches.dispatches)
  
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
      dispatch(handleFetchCompanies({ campaignId, page: currentCompanyPage }) as any)
    }
    // We intentionally do not depend on `campaign` here because we always want to re-query by id
  }, [dispatch, campaignId, currentPage, currentCompanyPage])

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

  // Handle company selection
  const toggleCompanySelection = (companyId: number) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  // Handle select all/none for companies
  const toggleSelectAllCompanies = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies(filteredCompanies.map(company => company.id))
    }
  }

  // Handle disassociating companies
  const handleDisassociateSelectedCompanies = async () => {
    if (selectedCompanies.length === 0 || !campaignId) return
    
    try {
      setIsDisassociatingCompanies(true)
      const result = await dispatch(handleDisassociateCompanies({ campaignId, companyIds: selectedCompanies }) as any)
      
      if (result) {
        showNotification('success', `Removed ${selectedCompanies.length} company(ies) from campaign`)
        setSelectedCompanies([])
        // Refresh the companies list
        await dispatch(handleFetchCompanies({ campaignId }) as any)
      } else {
        throw new Error('Failed to remove companies')
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to remove companies')
    } finally {
      setIsDisassociatingCompanies(false)
    }
  }

  // Filter companies to only show those in the current campaign and match search
  const campaignCompanies = allCompanies.filter(company => company.campaign === campaignId)
  
  const filteredCompanies = campaignCompanies.filter(company => 
    company.company_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (company.company_city?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
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
      setIsScheduled(false)
      setScheduledDate("")
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
    // If scheduling is enabled, ensure a date is selected
    if (isScheduled && !scheduledDate) {
      setIsSending(false)
      setSendError("Please select a date to schedule the send.")
      return
    }
    const result = await dispatch(handleSendDispatch(
      campaign.dispatch_id,
      selectedMailboxIds,
      selectedType as "content" | "template",
      isScheduled,
      scheduledDate || undefined
    ) as any)
    
    setIsSending(false)
    
    // Check if response has token (async processing)
    if (result && result.data && result.data.token) {
      // Async dispatch sending - add to processing queue
      const processingDispatch = {
        id: campaign.dispatch_id,
        campaignId: campaignId,
        token: result.data.token,
        status: isScheduled ? "scheduled" as const : "processing" as const,
        startedAt: Date.now(),
        mailboxIds: selectedMailboxIds,
        dispatchType: selectedType as "content" | "template",
        isScheduled,
        scheduledDate: scheduledDate,
        recipientsCount: result.data.recipients_count
      }
      
      dispatch(addDispatch(processingDispatch))
      dispatch(pollDispatchStatus(campaignId) as any)
      
      // Show success toast for starting the dispatch
      const message = isScheduled 
        ? `📅 Campaign scheduled for ${scheduledDate}! Sending to ${result.data.recipients_count || selectedMailboxIds.length} recipient(s)...`
        : `✉️ Email dispatch started! Sending emails from ${selectedMailboxIds.length} mailbox${selectedMailboxIds.length !== 1 ? 'es' : ''}...`
      showNotification('success', message)
      
      // Close modal immediately - no loading state
      setSendModalOpen(false)
      // Banner will handle polling and redirect when backend is done
    } else if (result && result.success) {
      // Sync response (200 OK) - show success and redirect
      setSendSuccess(true)
      setTimeout(() => {
        setSendModalOpen(false)
        setSendSuccess(false)
        router.push("/sent-emails")
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
                {campaign?.recipient_type && (
                  <Badge className={`text-xs ${
                    campaign.recipient_type === 'email' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                  }`}>
                    {campaign.recipient_type === 'email' ? 'Email Recipients' : 'Company Recipients'}
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
                  {!campaign?.is_finished && campaign?.recipient_type === "email" && (
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
                  {!campaign?.is_finished && campaign?.recipient_type === "company" && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setShowAddCompanyDialog(true)}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Add Companies to Campaign</span>
                      <span className="sm:hidden">Add Companies</span>
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
              
              {/* Inline alert/banner if no recipients */}
              {!emailsLoading && !companiesLoading && campaign?.recipient_type === "email" && campaignEmails.length === 0 && (
                <Alert variant="destructive">
                  <AlertTitle>No Emails Attached</AlertTitle>
                  <AlertDescription>
                    This campaign doesn't have any emails attached yet.
                  </AlertDescription>
                </Alert>
              )}
              {!emailsLoading && !companiesLoading && campaign?.recipient_type === "company" && campaignCompanies.length === 0 && (
                <Alert variant="destructive">
                  <AlertTitle>No Companies Attached</AlertTitle>
                  <AlertDescription>
                    This campaign doesn't have any companies attached yet.
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
            {/* Collapsible Associated Recipients Section - Emails or Companies */}
            {campaign?.recipient_type === "email" && (
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
            )}

            {/* Collapsible Associated Companies Section */}
            {campaign?.recipient_type === "company" && (
            <Accordion type="single" collapsible defaultValue="companies">
              <AccordionItem value="companies">
                <AccordionTrigger className="text-lg font-semibold">Associated Companies ({companiesPagination?.count || campaignCompanies.length})</AccordionTrigger>
                <AccordionContent>
                  {companiesLoading ? (
                    <div>Loading companies...</div>
                  ) : campaignCompanies.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="text-muted-foreground mb-2">No companies associated with this campaign.</div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold">Companies</h2>
                        <div className="relative w-full sm:w-64">
                          <input
                            type="text"
                            placeholder="Search companies..."
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
                            id="select-all-companies"
                            checked={selectedCompanies.length > 0 && selectedCompanies.length === filteredCompanies.length}
                            onCheckedChange={toggleSelectAllCompanies}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label 
                            htmlFor="select-all-companies" 
                            className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer flex-1"
                          >
                            {selectedCompanies.length > 0 
                              ? `Selected ${selectedCompanies.length} company(ies)`
                              : 'Select all'}
                          </label>
                          {selectedCompanies.length > 0 && (
                            <button 
                              onClick={() => setSelectedCompanies([])}
                              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {selectedCompanies.length > 0 && (
                          <div className="flex justify-end">
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={handleDisassociateSelectedCompanies}
                              disabled={isDisassociatingCompanies}
                              className="flex items-center gap-2 text-xs sm:text-sm"
                            >
                              {isDisassociatingCompanies ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="hidden sm:inline">Remove {selectedCompanies.length} selected company(ies)</span>
                              <span className="sm:hidden">Remove ({selectedCompanies.length})</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {filteredCompanies.map((company) => (
                          <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative ${selectedCompanies.includes(company.id) ? 'ring-2 ring-blue-500' : ''}`}
                          >
                            <Card className={`hover:shadow-md transition-shadow ${selectedCompanies.includes(company.id) ? 'border-blue-500' : ''}`}>
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex items-start space-x-2 sm:space-x-3">
                                  <Checkbox 
                                    id={`company-${company.id}`}
                                    checked={selectedCompanies.includes(company.id)}
                                    onCheckedChange={() => toggleCompanySelection(company.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                  />
                                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                                    <div className="flex flex-col space-y-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium text-sm sm:text-base break-all">{company.company_email}</span>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              {company.email_sent ? (
                                                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                              ) : (
                                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                                              )}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {company.email_sent 
                                                ? "Email has been sent successfully" 
                                                : "Email has not been sent yet"}
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-500 font-medium break-words">
                                        {company.company_name}
                                      </div>
                                      {company.industry && (
                                        <div className="text-xs sm:text-sm text-gray-500 break-words">
                                          {company.industry}
                                        </div>
                                      )}
                                      {company.company_city && (
                                        <div className="text-xs text-gray-400">
                                          {company.company_city}{company.company_country ? `, ${company.company_country}` : ''}
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
                                                router.push(`/companies/${company.id}`)
                                              }}
                                            >
                                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>View company</TooltipContent>
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
                      {companiesPagination && companiesPagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Page {companiesPagination.currentPage} of {companiesPagination.totalPages} • {companiesPagination.count} total companies
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentCompanyPage(prev => Math.max(1, prev - 1))}
                              disabled={!companiesPagination.previous || currentCompanyPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentCompanyPage(prev => prev + 1)}
                              disabled={!companiesPagination.next || currentCompanyPage === companiesPagination.totalPages}
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
            )}
            <SendCampaignDialog
              open={sendModalOpen}
              onOpenChange={setSendModalOpen}
              campaign={campaign}
              selectedMailboxIds={selectedMailboxIds}
              onMailboxChange={setSelectedMailboxIds}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              isScheduled={isScheduled}
              onScheduledChange={setIsScheduled}
              scheduledDate={scheduledDate}
              onScheduledDateChange={setScheduledDate}
              isSending={isSending}
              sendSuccess={sendSuccess}
              sendError={sendError}
              mailboxes={mailboxes}
              isMailboxesLoading={isMailboxesLoading}
              onSend={handleSendModal}
              sendDisabled={sendDisabled}
              sendDisabledReason={sendDisabledReason}
            />
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
      <AddCompanyDialog 
        open={showAddCompanyDialog} 
        onOpenChange={setShowAddCompanyDialog} 
        initialCampaignId={campaignId}
        campaign={campaign}
        companies={availableCompanies}
        isLoadingCompanies={companiesLoading}
        onSuccess={() => dispatch(handleFetchCompanies({ campaignId }) as any)}
      />
    </MainLayout>
  );
}
