"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import type { AppDispatch, RootState } from "@/store/store"
import MailLoader from '@/components/MailLoader'
import WorkflowPicker from '@/components/WorkflowPicker'
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function SmartCampaignPage() {
  const [campaignName, setCampaignName] = useState("")
  const [campaignType, setCampaignType] = useState("")
  const [contentPreference, setContentPreference] = useState("both")
  const [generateEmailLists, setGenerateEmailLists] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [attachmentSuggested, setAttachmentSuggested] = useState(false)
  const [placeholderText, setPlaceholderText] = useState("")
  const [isTextareaFocused, setIsTextareaFocused] = useState(false)
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  
  const { links } = useSelector((state: RootState) => state.links)

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

  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  
  useEffect(() => {
    dispatch(handleFetchLinks() as any)
  }, [])

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
      formData.append("content_preference", contentPreference)
      formData.append("generate_email_lists", generateEmailLists ? "true" : "false")

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
        // Try multiple known shapes for the response to pick up the campaign id
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
                  onBlur={() => setIsTextareaFocused(false)}
                  rows={3}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Be specific about your campaign goals and target audience for better AI-generated content.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Content Preference</Label>
                <RadioGroup
                  value={contentPreference}
                  onValueChange={setContentPreference}
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
                      <Switch id="generateEmailLists" checked={generateEmailLists} onCheckedChange={setGenerateEmailLists} />
                      <Label htmlFor="generateEmailLists">Allow Fiona to find potential leads relevant for this campaign</Label>
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
