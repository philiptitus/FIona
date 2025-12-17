"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { createSmartCampaign } from "@/store/actions/campaignActions"
import { handleFetchLinks } from "@/store/actions/linksActions"
import { handleFetchWorkflows } from "@/store/actions/workflowActions"
import type { AppDispatch, RootState } from "@/store/store"
import MailLoader from '@/components/MailLoader'
import WorkflowPicker from '@/components/WorkflowPicker'
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { addProcessingCampaign } from "@/store/slices/processingCampaignsSlice"
import { useDraftCampaign } from "@/hooks/use-draft-campaign"

export default function SmartCampaignPage() {
  const [campaignName, setCampaignName] = useState("")
  const [campaignType, setCampaignType] = useState("")
  const [contentPreference, setContentPreference] = useState("content")
  const [recipientType, setRecipientType] = useState("email")
  const [generateEmailLists, setGenerateEmailLists] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [attachmentSuggested, setAttachmentSuggested] = useState(false)
  const [placeholderText, setPlaceholderText] = useState("")
  const [isTextareaFocused, setIsTextareaFocused] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  const [allowSequence, setAllowSequence] = useState(false)
  const [selectedDynamicVariables, setSelectedDynamicVariables] = useState<string[]>([])
  const [copies, setCopies] = useState(1)
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const draftLoadedRef = useRef<boolean>(false)
  
  const { links } = useSelector((state: RootState) => state.links)
  const workflowsState = useSelector((state: any) => state.workflows)
  const auth = useSelector((state: RootState) => state.auth)
  const userId = auth.user?.id?.toString()
  
  const draftCampaign = useDraftCampaign({ userId })

  const AVAILABLE_DYNAMIC_VARIABLES = [
    { value: 'organization_name', label: 'Organization Name' },
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name', label: 'Last Name' },
    { value: 'title', label: 'Job Title' },
    { value: 'industry', label: 'Industry' },
    { value: 'keywords', label: 'Keywords' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'country', label: 'Country' },
    { value: 'company_name_for_emails', label: 'Company Name (for emails)' },
    { value: 'seniority', label: 'Seniority Level' },
    { value: 'departments', label: 'Departments' },
    { value: 'website', label: 'Website' },
    { value: 'num_employees', label: 'Number of Employees' },
    { value: 'annual_revenue', label: 'Annual Revenue' },
    { value: 'technologies', label: 'Technologies' }
  ]

  const COMPANY_DYNAMIC_VARIABLES = [
    { value: 'company_name', label: 'Company Name' },
    { value: 'company_email', label: 'Company Email' },
    { value: 'company_phone', label: 'Company Phone' },
    { value: 'industry', label: 'Industry' },
    { value: 'company_city', label: 'City' },
    { value: 'company_state', label: 'State' },
    { value: 'company_country', label: 'Country' },
    { value: 'website', label: 'Website' },
    { value: 'number_of_employees', label: 'Number of Employees' },
    { value: 'annual_revenue', label: 'Annual Revenue' },
    { value: 'founded_year', label: 'Founded Year' },
    { value: 'technologies', label: 'Technologies' },
    { value: 'account_stage', label: 'Account Stage' },
    { value: 'total_funding', label: 'Total Funding' },
    { value: 'latest_funding', label: 'Latest Funding' },
    { value: 'sic_codes', label: 'SIC Codes' }
  ]

  // Rotating, typed placeholders to guide users
  useEffect(() => {
    const examples = [
      "I am inviting my friends to a pink themed anime watch party with cosplay trivia and a small gift raffle",
      "I need a cold outreach campaign to pitch our AI-driven analytics tool to CFOs at mid-sized fintech companies in Kenya",
      "I'm applying for product manager roles and want a warm intro campaign to former colleagues and recruiters on LinkedIn",
      "I want to re-engage inactive newsletter subscribers with a 3-part educational series about sustainable fashion",
      "Announce a new feature launch for our SaaS with a sequence to existing customers segmented by plan tier",
      "Set up a campus event invite for the university developer club's hackathon with RSVP tracking",
      "Create a B2B partnership outreach to podcast hosts in the tech/AI niche for sponsorship opportunities",
      "Plan a donor appreciation and update series for a non-profit highlighting impact stories and upcoming events",
    ]

    if (isTextareaFocused) {
      return
    }

    let exampleIndex = 0
    let charIndex = 0
    let typingTimer: number | undefined
    let pauseTimer: number | undefined

    const typeNextChar = () => {
      const current = examples[exampleIndex]
      if (charIndex <= current.length) {
        setPlaceholderText(current.slice(0, charIndex))
        charIndex += 1
        typingTimer = window.setTimeout(typeNextChar, 40)
      } else {
        // Pause on full example, then clear and move to next
        pauseTimer = window.setTimeout(() => {
          setPlaceholderText("")
          charIndex = 0
          exampleIndex = (exampleIndex + 1) % examples.length
          typingTimer = window.setTimeout(typeNextChar, 250)
        }, 1400)
      }
    }

    typingTimer = window.setTimeout(typeNextChar, 250)
    return () => {
      if (typingTimer) window.clearTimeout(typingTimer)
      if (pauseTimer) window.clearTimeout(pauseTimer)
    }
  }, [isTextareaFocused])

  // Load draft on page mount if draftId provided in search params
  useEffect(() => {
    if (!userId || draftLoadedRef.current) {
      setIsLoadingDraft(false)
      setIsLoadingInitial(false)
      return
    }

    const draftId = searchParams.get("draftId")
    
    if (draftId) {
      // Load existing draft
      const draft = draftCampaign.loadDraft(draftId)
      if (draft) {
        draftLoadedRef.current = true
        setCampaignName(draft.campaignName)
        setCampaignType(draft.campaignType)
        setContentPreference(draft.contentPreference)
        setRecipientType(draft.recipientType)
        setGenerateEmailLists(draft.generateEmailLists)
        setAllowSequence(draft.allowSequence)
        setCopies(draft.copies)
        setSelectedLinks(draft.selectedLinks)
        setSelectedDynamicVariables(draft.selectedDynamicVariables)
      }
    }
    
    setIsLoadingDraft(false)
    setIsLoadingInitial(false)
  }, [userId])

  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  
  useEffect(() => {
    dispatch(handleFetchLinks() as any)
    dispatch(handleFetchWorkflows() as any)
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // check for placeholders like {{FIELD}} in campaignType or campaignName
    const placeholderRegex = /{{\s*[A-Z0-9_]+\s*}}/i
    const hasPlaceholder = placeholderRegex.test(campaignType) || placeholderRegex.test(campaignName)

    if (hasPlaceholder) {
      // ask confirmation before proceeding
      const proceed = window.confirm(
        'It looks like your campaign contains placeholders (e.g., {{FIELD}}). Are you sure you want to proceed with placeholder data?'
      )
      if (!proceed) return
    }

    if (attachmentSuggested && !attachment) {
      const attachProceed = window.confirm('This workflow recommends attaching supporting documents. Do you want to continue without an attachment?')
      if (!attachProceed) return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", campaignName)
      formData.append("campaign_type", campaignType)
      formData.append("recipient_type", recipientType)
      formData.append("content_preference", contentPreference)
      formData.append("generate_email_lists", generateEmailLists ? "true" : "false")
      formData.append("allow_sequence", allowSequence ? "true" : "false")
      formData.append("copies", copies.toString())
      
      if (selectedDynamicVariables.length > 0) {
        formData.append("selected_dynamic_variables", JSON.stringify(selectedDynamicVariables))
      }

      if (attachment) {
        formData.append("attachment", attachment)
      }

      if (image) {
        formData.append("image", image)
      }
      
      if (selectedLinks.length > 0) {
        formData.append("selected_links", JSON.stringify(selectedLinks))
      }

      const resultAction = await dispatch(createSmartCampaign(formData))

      if (createSmartCampaign.fulfilled.match(resultAction)) {
        const payload: any = resultAction.payload
        
        // Check if this is an async response (202 Accepted)
        if (payload?.status === "processing" && payload?.token && payload?.campaign_id) {
          // Async campaign creation
          const campaignId = payload.campaign_id
          const token = payload.token
          const campaignName = payload.campaign?.name || campaignName
          
          // Add to processing campaigns tracker
          dispatch(addProcessingCampaign({
            campaignId,
            token,
            name: campaignName,
            status: "processing",
            startedAt: Date.now(),
            lastPolled: Date.now(),
            retryCount: 0,
          }))
          
          // Delete draft after successful submission
          handleDeleteDraftAfterSuccess()
          
          // Show success toast for starting the process
          toast({
            title: "✨ Campaign Creation Started!",
            description: "AI is generating your campaign content. You'll be notified when it's ready (30-60 seconds).",
          })
          
          // Redirect to dashboard
          router.push("/dashboard")
          return
        }
        
        // Legacy synchronous response (fallback for old behavior)
        let campaignId: number | string | undefined = undefined
        if (payload?.dispatch?.campaign?.id) campaignId = payload.dispatch.campaign.id
        else if (payload?.campaign?.id) campaignId = payload.campaign.id
        else if (payload?.id) campaignId = payload.id

        // If payload is a string (edge-case), try parsing JSON to extract id
        if (!campaignId && typeof payload === 'string') {
          try {
            const parsed = JSON.parse(payload)
            if (parsed?.dispatch?.campaign?.id) campaignId = parsed.dispatch.campaign.id
            else if (parsed?.campaign?.id) campaignId = parsed.campaign.id
            else if (parsed?.id) campaignId = parsed.id
          } catch (e) {
            // ignore parse errors
          }
        }

        toast({
          title: "Smart campaign created",
          description: "Your AI-powered campaign has been created successfully. You can click on 'View Template' or 'View Content' to visit your email and customize.",
        })

        // Delete draft after successful submission
        handleDeleteDraftAfterSuccess()

        if (campaignId) {
          // Navigate to the newly created campaign's detail page when id is available
          router.push(`/campaigns/${campaignId}`)
          return
        } else {
          router.push("/campaigns")
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: (resultAction.payload as string) || "Failed to create smart campaign. Please try again.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  /**
   * Auto-save draft to localStorage with debouncing
   * Called on field blur to persist form state
   */
  const handleAutoSaveDraft = () => {
    if (!userId || isLoadingInitial) return

    // Clear existing debounce timer
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current)
    }

    // Set new debounce timer - save immediately after user leaves field
    saveDebounceRef.current = setTimeout(() => {
      draftCampaign.saveDraftData({
        campaignName,
        campaignType,
        contentPreference: contentPreference as any,
        recipientType: recipientType as any,
        generateEmailLists,
        allowSequence,
        copies,
        selectedLinks,
        selectedDynamicVariables,
      })
    }, 300) // Small debounce to catch rapid field changes
  }

  /**
   * Handle successful submit - delete draft after backend confirms
   */
  const handleDeleteDraftAfterSuccess = () => {
    draftCampaign.deleteDraftData()
  }

  return (
    <MainLayout>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
          <MailLoader />
        </div>
      )}
      <div className="flex flex-col gap-6 px-2 md:px-0 min-h-screen pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Smart Campaign</h1>
          <p className="text-muted-foreground">Let AI help you create a complete email campaign</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Smart Campaign Setup</CardTitle>
              <CardDescription>
                Our AI will generate content, templates, and email lists based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <WorkflowPicker
                  setCampaignName={setCampaignName}
                  setCampaignType={setCampaignType}
                  setGenerateEmailLists={setGenerateEmailLists}
                  setAttachmentSuggested={setAttachmentSuggested}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  placeholder="Enter a name for your campaign"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  onBlur={handleAutoSaveDraft}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignType">Tell Fiona More About your campaign</Label>
                <Textarea
                  id="campaignType"
                  placeholder={placeholderText}
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  onFocus={() => setIsTextareaFocused(true)}
                  onBlur={() => {
                    setIsTextareaFocused(false)
                    handleAutoSaveDraft()
                  }}
                  rows={3}
                  required
                />
                {workflowsState?.workflows?.length === 0 ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-900 dark:text-amber-200 mb-2">
                      💡 <strong>Tip:</strong> Create reusable workflows to save time on future campaigns. Workflows let you define prompt templates that can be applied instantly.
                    </p>
                    <Link href="/workflows" className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline font-medium">
                      Create your first workflow →
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-200 mb-2">
                      ✨ You have workflows available! Click <strong>"Suggested workflows"</strong> above to apply one of your saved templates, or describe your campaign goals below for a custom prompt.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      Be specific about your campaign goals and target audience for better AI-generated content.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Content Preference</Label>
                <RadioGroup
                  value={contentPreference}
                  onValueChange={(value) => {
                    setContentPreference(value)
                    handleAutoSaveDraft()
                  }}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template" id="template" />
                    <Label htmlFor="template">Generate HTML Template Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="content" id="content" />
                    <Label htmlFor="content">Generate Email Content Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Generate Both Template and Content</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Recipient Type *</Label>
                <RadioGroup
                  value={recipientType}
                  onValueChange={(value) => {
                    setRecipientType(value)
                    handleAutoSaveDraft()
                  }}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-recipient" />
                    <Label htmlFor="email-recipient" className="font-normal">Email - Send to individual email addresses</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company-recipient" />
                    <Label htmlFor="company-recipient" className="font-normal">Company - Send to company email addresses</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 'Generate email lists' option moved into 'More tools' collapsible for a cleaner UI */}

              <div className="space-y-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline">More tools</Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="attachment">Attachment (PDF, max 5MB)</Label>
                      <Input id="attachment" type="file" accept=".pdf" onChange={handleAttachmentChange} />
                      {attachment && <p className="text-sm text-muted-foreground">Selected: {attachment.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Image (JPEG, PNG, max 2MB)</Label>
                      <Input id="image" type="file" accept=".jpg,.jpeg,.png" onChange={handleImageChange} />
                      {image && <p className="text-sm text-muted-foreground">Selected: {image.name}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="generateEmailLists" 
                        checked={generateEmailLists} 
                        onCheckedChange={(value) => {
                          setGenerateEmailLists(value)
                          handleAutoSaveDraft()
                        }} 
                      />
                      <Label htmlFor="generateEmailLists">Allow Fiona to find potential leads relevant for this campaign</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="allowSequence" 
                          checked={allowSequence} 
                          onCheckedChange={(value) => {
                            setAllowSequence(value)
                            handleAutoSaveDraft()
                          }} 
                        />
                        <Label htmlFor="allowSequence">Generate Email Sequence</Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        Create a 3-email sequence: an initial outreach, follow-up, and final reminder. This increases engagement by giving recipients multiple touchpoints.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/20 dark:to-cyan-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <Label className="text-base font-semibold text-indigo-900 dark:text-indigo-200">
                            Generate Multiple Copies
                          </Label>
                          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                            AI will generate multiple variations of your email content with different messaging approaches and angles. This significantly reduces spam detection rates by ensuring each recipient receives a unique, contextually-relevant message rather than identical copy.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-md p-4 border border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="copies" className="text-sm font-medium">
                            Number of Copies
                          </Label>
                          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{copies}</span>
                        </div>
                        <input
                          id="copies"
                          type="range"
                          min="1"
                          max="10"
                          value={copies}
                          onChange={(e) => {
                            setCopies(parseInt(e.target.value))
                          }}
                          onMouseUp={handleAutoSaveDraft}
                          onTouchEnd={handleAutoSaveDraft}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span>1 copy</span>
                          <span>10 copies</span>
                        </div>
                        <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded border border-indigo-100 dark:border-indigo-800">
                          <p className="text-xs text-indigo-800 dark:text-indigo-300">
                            💡 <strong>Tip:</strong> Start with 3-5 copies to balance personalization with authenticity. More copies = better deliverability but may take longer to generate.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <Label className="text-base font-semibold text-purple-900 dark:text-purple-200">
                            AI Dynamic Variables (Optional)
                          </Label>
                          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                            {recipientType === "email" 
                              ? "Let AI personalize each email by automatically inserting recipient-specific information like their name, company, or job title. This makes your outreach feel more personal and increases engagement."
                              : "Let AI personalize each email by automatically inserting company-specific information like company name, industry, or funding. This makes your outreach feel more personal and increases engagement."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-md p-3 border border-purple-200 dark:border-purple-700">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ✨ How it works: Select fields below, and AI will naturally weave them into your emails
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {recipientType === "email"
                            ? "Example: \"Hi [first_name], I noticed [organization_name] is in the [industry] space...\""
                            : "Example: \"Hi, I've been following [company_name]'s growth in the [industry] space. With [number_of_employees] employees and...\""
                          }
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {(recipientType === "email" ? AVAILABLE_DYNAMIC_VARIABLES : COMPANY_DYNAMIC_VARIABLES).map(({ value, label }) => (
                            <div key={value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`dynamic-${value}`}
                                checked={selectedDynamicVariables.includes(value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedDynamicVariables([...selectedDynamicVariables, value])
                                  } else {
                                    setSelectedDynamicVariables(selectedDynamicVariables.filter(v => v !== value))
                                  }
                                }}
                              />
                              <Label 
                                htmlFor={`dynamic-${value}`} 
                                className="text-xs font-medium cursor-pointer hover:text-purple-700 dark:hover:text-purple-300"
                              >
                                {label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        
                        {selectedDynamicVariables.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                              ✓ Selected ({selectedDynamicVariables.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {selectedDynamicVariables.map(varValue => {
                                const allVars = recipientType === "email" ? AVAILABLE_DYNAMIC_VARIABLES : COMPANY_DYNAMIC_VARIABLES
                                const varLabel = allVars.find(v => v.value === varValue)?.label
                                return (
                                  <span 
                                    key={varValue} 
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                                  >
                                    {varLabel}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedDynamicVariables(selectedDynamicVariables.filter(v => v !== varValue))}
                                      className="hover:text-purple-900 dark:hover:text-purple-100"
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Include Your Links (Optional)</Label>
                      <p className="text-sm text-muted-foreground">Select links to include in your campaign for better personalization</p>
                      
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        <p className="text-blue-800 mb-2">💡 Want to add your social media and profile links?</p>
                        <Link href="/settings" className="text-blue-600 hover:text-blue-800 underline">
                          Add your links in Settings →
                        </Link>
                      </div>
                      
                      {links && (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'personal_website', label: 'Personal Website' },
                            { key: 'linkedin', label: 'LinkedIn' },
                            { key: 'twitter', label: 'Twitter' },
                            { key: 'github', label: 'GitHub' },
                            { key: 'facebook', label: 'Facebook' },
                            { key: 'instagram', label: 'Instagram' },
                            { key: 'youtube', label: 'YouTube' },
                            { key: 'medium', label: 'Medium' },
                            { key: 'dribbble', label: 'Dribbble' },
                            { key: 'behance', label: 'Behance' },
                            { key: 'stackoverflow', label: 'Stack Overflow' },
                            { key: 'angel_list', label: 'AngelList' }
                          ].map(({ key, label }) => {
                            const url = links[key as keyof typeof links] as string
                            if (!url || !url.trim()) return null
                            
                            return (
                              <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={key}
                                  checked={selectedLinks.includes(key)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedLinks([...selectedLinks, key])
                                    } else {
                                      setSelectedLinks(selectedLinks.filter(link => link !== key))
                                    }
                                  }}
                                />
                                <Label htmlFor={key} className="text-sm">{label}</Label>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/campaigns")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Smart Campaign..." : "Create Smart Campaign"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
