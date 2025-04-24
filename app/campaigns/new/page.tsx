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
import { useDispatch } from "react-redux"
import { handleCreateCampaign } from "@/store/actions/campaignActions"
import type { AppDispatch } from "@/store/store"

export default function NewCampaignPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
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
      formData.append("name", name)
      formData.append("description", description)

      if (attachment) {
        formData.append("attachment", attachment)
      }

      if (image) {
        formData.append("image", image)
      }

      const success = await dispatch(handleCreateCampaign(formData))

      if (success) {
        toast({
          title: "Campaign created",
          description: "Your campaign has been created successfully.",
        })
        router.push("/campaigns")
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create campaign. Please try again.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-muted-foreground">Set up your email campaign details</p>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Campaign"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
