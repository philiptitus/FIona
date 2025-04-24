"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/store/store"
import { useEffect } from "react"
import { handleFetchCampaignById } from "@/store/actions/campaignActions"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { campaigns, isLoading } = useSelector((state: RootState) => state.campaigns)
  const campaignId = Number(params.id)
  const campaign = campaigns.find((c) => c.id === campaignId)

  useEffect(() => {
    if (!campaign) {
      dispatch(handleFetchCampaignById(campaignId))
    }
  }, [campaign, dispatch, campaignId])

  if (!campaign && !isLoading) {
    router.replace("/campaigns")
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/campaigns")}>{"<-"} Back to Campaigns</Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2">{campaign?.name || "Campaign"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="mb-2"><b>Description:</b> {campaign?.description || "-"}</div>
              <div className="mb-2"><b>Created:</b> {campaign?.created_at || "-"}</div>
              <div className="mb-2"><b>Updated:</b> {campaign?.updated_at || "-"}</div>
              {campaign?.attachment && (
                <div className="mb-2"><b>Attachment:</b> <a href={campaign.attachment} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a></div>
              )}
              {campaign?.image && (
                <div className="mb-2"><b>Image:</b> <img src={campaign.image} alt="Campaign" className="inline-block h-16 rounded" /></div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/campaigns/${campaignId}/edit`)}>Edit</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
