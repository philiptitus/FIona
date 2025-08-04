"use client"
export const dynamic = "force-dynamic";
import React, { useEffect, useState, Suspense } from "react"
import { useDispatch, useSelector } from "react-redux"
import { sendEmail } from "@/store/actions/mailboxActions"
import { handleFetchContents } from "@/store/actions/contentActions"
import { handleFetchTemplates } from "@/store/actions/templateActions"
import { handleFetchCampaigns } from "@/store/actions/campaignActions"
import { handleFetchMailboxes } from "@/store/actions/mailboxActions"
import { handleFetchEmails } from "@/store/actions/emailActions"
import { RootState, AppDispatch } from "@/store/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Mail, 
  Send, 
  Users, 
  FileText, 
  LayoutTemplate, 
  Inbox, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus,
  Trash2,
  Search,
  Clock,
  Building2,
  User,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import MailLoader from "@/components/MailLoader"
import MainLayout from "@/components/layout/main-layout"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface EmailContent {
  id: number
  campaign: number
  name: string
  content: string
  created_at: string
  updated_at: string
}

interface EmailTemplate {
  id: number
  campaign: number
  name: string
  html_content: string
  created_at: string
  updated_at: string
}

interface EmailListEntry {
  id: number
  campaign: number
  organization_name: string
  email: string
  context?: string
  is_sent: boolean
  created_at: string
  updated_at: string
}

interface Mailbox {
  id: number
  email: string
  provider: string
}

function SendEmailPageContent() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { isLoading: isSending, sendResult, error: sendError, mailboxes, isLoading: isMailboxesLoading, error: mailboxesError } = useSelector((state: RootState) => state.mailbox)
  const { contents, isLoading: isContentsLoading, error: contentsError } = useSelector((state: RootState) => state.content)
  const { templates, isLoading: isTemplatesLoading, error: templatesError } = useSelector((state: RootState) => state.template)
  const { campaigns, isLoading: isCampaignsLoading, error: campaignsError } = useSelector((state: RootState) => state.campaigns)
  const { emails: savedEmails, isLoading: isEmailsLoading, error: emailsError } = useSelector((state: RootState) => state.emails)
  const searchParams = useSearchParams();

  const [type, setType] = useState("content")
  const [id, setId] = useState("")
  const [selectedSavedEmails, setSelectedSavedEmails] = useState<string[]>([])
  const [manualRecipients, setManualRecipients] = useState<string[]>([])
  const [manualInput, setManualInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [localError, setLocalError] = useState("")
  const [mailboxId, setMailboxId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    dispatch<any>(handleFetchContents())
    dispatch<any>(handleFetchTemplates())
    dispatch<any>(handleFetchCampaigns())
    dispatch<any>(handleFetchMailboxes())
    dispatch<any>(handleFetchEmails())
    // Pre-select type and id from query params if present
    const queryType = searchParams.get("type")
    const queryId = searchParams.get("id")
    if (queryType === "content" || queryType === "template") {
      setType(queryType)
    }
    if (queryId) {
      setId(queryId)
    }
  }, [dispatch, searchParams])

  // Helper to get campaign name by id
  const getCampaignName = (campaignId: number) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    return campaign ? campaign.name : "Unknown Campaign"
  }

  const contentOptions = contents.map((c: EmailContent) => ({
    id: c.id,
    name: c.name,
    campaign: c.campaign,
    created_at: c.created_at,
  }))
  const templateOptions = templates.map((t: EmailTemplate) => ({
    id: t.id,
    name: t.name,
    campaign: t.campaign,
    created_at: t.created_at,
  }))
  const options = type === "content" ? contentOptions : templateOptions
  const isOptionsLoading = type === "content" ? isContentsLoading : isTemplatesLoading
  const optionsError = type === "content" ? contentsError : templatesError

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = (email: string) => emailRegex.test(email)

  // Filter saved emails based on search query
  const filteredSavedEmails = savedEmails.filter((email: EmailListEntry) =>
    email.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Suggestions: saved emails not already selected or checked
  const emailSuggestions = filteredSavedEmails
    .map((e: EmailListEntry) => e.email)
    .filter((email) => !manualRecipients.includes(email) && !selectedSavedEmails.includes(email))
    .filter((email, idx, arr) => arr.indexOf(email) === idx) // unique
    .slice(0, 10)

  // Handle manual input change and split on comma, space, or enter
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/[\s,]$/.test(value)) {
      const parts = value.split(/[\s,]+/).filter(Boolean)
      addManualRecipients(parts)
      setManualInput("")
    } else {
      setManualInput(value)
      setShowSuggestions(true)
    }
  }

  // Add manual recipients, filter/validate, remove duplicates
  const addManualRecipients = (emails: string[]) => {
    const cleaned = emails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && !manualRecipients.includes(e) && !selectedSavedEmails.includes(e))
    setManualRecipients((prev) => [...prev, ...cleaned])
    setShowSuggestions(false)
  }

  // Remove a manual recipient
  const removeManualRecipient = (email: string) => {
    setManualRecipients((prev) => prev.filter((e) => e !== email))
  }

  // Remove a saved recipient
  const removeSavedRecipient = (email: string) => {
    setSelectedSavedEmails((prev) => prev.filter((e) => e !== email))
  }

  // Handle suggestion click
  const handleSuggestionClick = (email: string) => {
    addManualRecipients([email])
    setManualInput("")
  }

  // Validate all emails before sending
  const validateAllEmails = () => {
    const all = [...selectedSavedEmails, ...manualRecipients]
    if (all.length === 0) return false
    return all.every(isValidEmail)
  }

  // Handle checkbox change for saved emails
  const handleSavedEmailToggle = (email: string) => {
    setSelectedSavedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    )
  }

  // Combine all recipients for sending
  const allRecipients = [...selectedSavedEmails, ...manualRecipients]

  const handleSend = async (e: any) => {
    e.preventDefault()
    setLocalError("")
    if (!id || !allRecipients.length || !mailboxId) {
      setLocalError("Please select a " + type + ", a mailbox, and at least one valid recipient email.")
      return
    }
    if (!validateAllEmails()) {
      setLocalError("One or more recipient emails are invalid.")
      return
    }
    try {
      await dispatch(
        sendEmail({ type, id: Number(id), recipient: allRecipients, mailbox_id: Number(mailboxId) }) as any
      ).unwrap()
      setManualRecipients([])
      setManualInput("")
      setSelectedSavedEmails([])
      toast({
        title: (
          <span className="flex items-center gap-2 text-lg font-bold text-primary">
            <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
            Fiona, sent your email!
          </span>
        ),
        description: (
          <span className="block text-sm text-muted-foreground mt-1">
            Your message is on its way. Check your outbox for details!
          </span>
        ),
        variant: "default",
      })
    } catch (err: any) {
      setLocalError(err || "Failed to send email.")
    }
  }

  const selectedOption = options.find(opt => opt.id.toString() === id)
  const selectedMailbox = mailboxes.find(mb => mb.id.toString() === mailboxId)

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* ML-Powered Spam Detection Banner */}
        <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-4 shadow-sm dark:from-blue-900/30 dark:to-purple-900/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">ML-Powered Spam Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Your emails are automatically screened by our advanced machine learning system to prevent spam and protect your sender reputation.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Active Protection
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Send Email</h1>
            <p className="text-muted-foreground">Compose and send emails to your contacts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Email Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Type & Content Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Email Content
                </CardTitle>
                <CardDescription>Choose the type and content for your email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Email Type</Label>
                    <Select value={type} onValueChange={(value) => { setType(value); setId("") }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Content (Plain Text)
                          </div>
                        </SelectItem>
                        <SelectItem value="template">
                          <div className="flex items-center gap-2">
                            <LayoutTemplate className="h-4 w-4" />
                            Template (HTML)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Select {type === "content" ? "Content" : "Template"}</Label>
                    {isOptionsLoading || isCampaignsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Loading...
                      </div>
                    ) : optionsError || campaignsError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{optionsError || campaignsError}</AlertDescription>
                      </Alert>
                    ) : (
                      <Select value={id} onValueChange={setId}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${type}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((opt: { id: number; name: string; campaign: number; created_at: string }) => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{opt.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  Campaign: {getCampaignName(opt.campaign)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {selectedOption && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Selected: {selectedOption.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Campaign: {getCampaignName(selectedOption.campaign)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mailbox Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  From Mailbox
                </CardTitle>
                <CardDescription>Choose which mailbox to send from</CardDescription>
              </CardHeader>
              <CardContent>
                {isMailboxesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Loading mailboxes...
                  </div>
                ) : mailboxesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{mailboxesError}</AlertDescription>
                  </Alert>
                ) : (
                  <Select value={mailboxId} onValueChange={setMailboxId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mailbox..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mailboxes.map((mb: Mailbox) => (
                        <SelectItem key={mb.id} value={mb.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{mb.email}</span>
                            <Badge variant="outline" className="text-xs">{mb.provider}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedMailbox && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Sending from: {selectedMailbox.email}</span>
                      <Badge variant="outline">{selectedMailbox.provider}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipients Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recipients
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select from saved emails or add new ones manually. Each recipient will receive a separate copy.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>Choose who will receive this email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="saved" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="saved" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Saved Contacts
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Manual Entry
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="saved" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Search saved emails</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by email or organization..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {isEmailsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Loading saved emails...
                      </div>
                    ) : emailsError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{emailsError}</AlertDescription>
                      </Alert>
                    ) : filteredSavedEmails.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No saved emails found</p>
                        {searchQuery && <p className="text-sm">Try adjusting your search</p>}
                      </div>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {filteredSavedEmails.map((entry: EmailListEntry) => (
                            <div
                              key={entry.email}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                                selectedSavedEmails.includes(entry.email) ? 'bg-primary/5 border-primary/20' : ''
                              }`}
                              onClick={() => handleSavedEmailToggle(entry.email)}
                            >
                              <Checkbox
                                checked={selectedSavedEmails.includes(entry.email)}
                                onChange={() => handleSavedEmailToggle(entry.email)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{entry.email}</div>
                                {entry.organization_name && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {entry.organization_name}
                                  </div>
                                )}
                              </div>
                              {selectedSavedEmails.includes(entry.email) && (
                                <Badge variant="secondary" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add email addresses</Label>
                      <div className="border rounded-lg p-3 bg-background">
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                          {manualRecipients.map((email) => (
                            <Badge 
                              key={email} 
                              variant={isValidEmail(email) ? "secondary" : "destructive"}
                              className="flex items-center gap-1"
                            >
                              {email}
                              <button
                                type="button"
                                className="ml-1 hover:text-destructive"
                                onClick={() => removeManualRecipient(email)}
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          <input
                            type="text"
                            className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm"
                            placeholder={manualRecipients.length === 0 ? "Type emails separated by comma, space, or Enter..." : "Add more..."}
                            value={manualInput}
                            onChange={handleManualInput}
                            onBlur={() => setShowSuggestions(false)}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={e => {
                              if (["Enter", ",", " "].includes(e.key)) {
                                e.preventDefault()
                                if (manualInput.trim()) {
                                  addManualRecipients([manualInput])
                                  setManualInput("")
                                }
                              } else if (e.key === "Backspace" && !manualInput && manualRecipients.length > 0) {
                                removeManualRecipient(manualRecipients[manualRecipients.length - 1])
                              }
                            }}
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      {showSuggestions && emailSuggestions.length > 0 && manualInput && (
                        <div className="border rounded-lg bg-background shadow-lg absolute z-10 mt-1 w-full max-w-md">
                          {emailSuggestions.map((email) => (
                            <div
                              key={email}
                              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm border-b last:border-b-0"
                              onMouseDown={() => handleSuggestionClick(email)}
                            >
                              {email}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Selected Recipients Summary */}
                {allRecipients.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Recipients ({allRecipients.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {allRecipients.map((email) => (
                        <Badge 
                          key={email} 
                          variant={isValidEmail(email) ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {email}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive"
                            onClick={() => 
                              manualRecipients.includes(email) 
                                ? removeManualRecipient(email) 
                                : removeSavedRecipient(email)
                            }
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {(!validateAllEmails() && allRecipients.length > 0) && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>One or more email addresses are invalid.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Send */}
          <div className="space-y-6">
            {/* Send Summary Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Send Summary
                </CardTitle>
                <CardDescription>Review before sending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Type:</span>
                    <Badge variant="outline">
                      {type === "content" ? "Plain Text" : "HTML Template"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Content:</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedOption ? selectedOption.name : "Not selected"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">From:</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedMailbox ? selectedMailbox.email : "Not selected"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recipients:</span>
                    <Badge variant="secondary">{allRecipients.length}</Badge>
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleSend} 
                  disabled={isSending || !id || !allRecipients.length || !mailboxId || !validateAllEmails()}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>

                {!id && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please select email content</AlertDescription>
                  </Alert>
                )}

                {!mailboxId && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please select a mailbox</AlertDescription>
                  </Alert>
                )}

                {!allRecipients.length && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please add at least one recipient</AlertDescription>
                  </Alert>
                )}

                {allRecipients.length > 0 && !validateAllEmails() && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please fix invalid email addresses</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Status Messages */}
            {isSending && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <MailLoader />
                    <div>
                      <p className="font-medium">Sending emails...</p>
                      <p className="text-sm text-muted-foreground">Please wait while we process your request</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {localError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{localError}</AlertDescription>
              </Alert>
            )}

            {sendError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{sendError}</AlertDescription>
              </Alert>
            )}

            {sendResult && sendResult.success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Email sent successfully!</AlertDescription>
              </Alert>
            )}

            {sendResult && sendResult.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{sendResult.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function SendEmailPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SendEmailPageContent />
    </Suspense>
  );
}