"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch } from "react-redux"
import { createSmartCampaign } from "@/store/actions/campaignActions"
import type { AppDispatch } from "@/store/store"
import MailLoader from '@/components/MailLoader'

export default function SmartCampaignPage() {
  const [campaignName, setCampaignName] = useState("")
  const [campaignType, setCampaignType] = useState("")
  const [contentPreference, setContentPreference] = useState("both")
  const [generateEmailLists, setGenerateEmailLists] = useState(true)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      const resultAction = await dispatch(createSmartCampaign(formData))

      if (createSmartCampaign.fulfilled.match(resultAction)) {
        const campaignId = resultAction.payload?.dispatch?.campaign?.id || resultAction.payload?.id
        toast({
          title: "Smart campaign created",
          description: "Your AI-powered campaign has been created successfully. You can click on 'View Template' or 'View Content' to visit your email and customize.",
        })
        if (campaignId) {
          router.push(`/campaigns/${campaignId}`)
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
      {isLoading && <MailLoader />}
      <div className="flex flex-col gap-6 max-h-[100vh] overflow-y-auto px-2 md:px-0" style={{ minHeight: '0' }}>
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
                <Label htmlFor="campaignType">Campaign Type</Label>
                <Textarea
                  id="campaignType"
                  placeholder="Describe your campaign type (e.g., 'Product Launch', 'Newsletter', 'Promotional Offer')"
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
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

              <div className="flex items-center space-x-2">
                <Switch id="generateEmailLists" checked={generateEmailLists} onCheckedChange={setGenerateEmailLists} />
                <Label htmlFor="generateEmailLists">Generate sample email lists</Label>
              </div>

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
