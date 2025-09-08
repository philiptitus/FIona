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
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { handleCreateCampaign } from "@/store/actions/campaignActions"
import type { AppDispatch, RootState } from "@/store/store"
import { useEffect } from "react"

export default function NewCampaignPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, currentCampaign } = useSelector((state: RootState) => state.campaigns)

  // Handle success message when campaign is created
  useEffect(() => {
    if (currentCampaign) {
      toast({
        title: "Success!",
        description: "Campaign created successfully.",
        variant: "default",
      })
      router.push("/campaigns")
    }
  }, [currentCampaign, router, toast])

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)

    if (attachment) {
      formData.append("attachment", attachment)
    }

    if (image) {
      formData.append("image", image)
    }

    try {
      await dispatch(handleCreateCampaign(formData)).unwrap()
    } catch (error) {
      // Error is already handled by the error effect
      console.error("Error creating campaign:", error)
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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-muted-foreground">Set up your email campaign details</p>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center gap-4">
          <span className="text-lg">🤔</span>
          <div className="flex-1">
            <span className="font-medium">Does this seem too hard?</span> <span className="text-muted-foreground">Let AI automate your campaign for you!</span>
          </div>
          <Button asChild variant="secondary" className="shrink-0">
            <a href="/campaigns/smart-campaign">Try Smart Campaign</a>
          </Button>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
              <CardDescription>Enter the basic information for your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="Enter campaign name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter campaign description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
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
              <Button
                disabled={isLoading}
                className="w-full"
                type="submit"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
