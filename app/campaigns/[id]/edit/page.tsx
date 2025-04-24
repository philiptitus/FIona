"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/store/store"
import { useEffect, useState } from "react"
import { handleUpdateCampaign, handleFetchCampaignById } from "@/store/actions/campaignActions"

export default function EditCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const campaignId = Number(params.id)
  const { campaigns, isLoading } = useSelector((state: RootState) => state.campaigns)
  const campaign = campaigns.find((c) => c.id === campaignId)

  const [form, setForm] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!campaign) {
      dispatch(handleFetchCampaignById(campaignId))
    } else {
      setForm({ name: campaign.name, description: campaign.description })
    }
  }, [campaign, campaignId, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("name", form.name)
    formData.append("description", form.description)
    await dispatch(handleUpdateCampaign({ id: campaignId, formData }))
    setIsSubmitting(false)
    router.push(`/campaigns/${campaignId}`)
  }

  if (!campaign && !isLoading) {
    router.replace("/campaigns")
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/campaigns/${campaignId}`)}>{"<-"} Back to Campaign</Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">Edit Campaign</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <Input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Description</label>
                <Textarea name="description" value={form.description} onChange={handleChange} rows={4} />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/campaigns/${campaignId}`)}>Cancel</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
