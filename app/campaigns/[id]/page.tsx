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

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { campaigns, isLoading } = useSelector((state: RootState) => state.campaigns)
  const { emails: allEmails, isLoading: emailsLoading } = useSelector((state: RootState) => state.emails)
  const campaignId = Number(params.id)
  const campaign = campaigns.find((c) => c.id === campaignId)

  useEffect(() => {
    if (!campaign) {
      dispatch(handleFetchCampaignById(campaignId))
    }
    dispatch(handleFetchEmails(campaignId))
  }, [campaign, dispatch, campaignId])

  if (!campaign && !isLoading) {
    router.replace("/campaigns")
    return null
  }

  const campaignEmails = allEmails.filter((email) => email.campaign === campaignId)

  const handleViewTemplate = async (id: number) => {
    await dispatch(handleFetchTemplates());
    router.push(`/templates/${id}`);
  };
  const handleViewContent = async (id: number) => {
    await dispatch(handleFetchContentById(id));
    router.push(`/content/${id}`);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/campaigns")}>{"<-"} Back to Campaigns</Button>
        <Card className="shadow-xl border-2 border-primary/10 bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center gap-4 border-b">
            {campaign?.image ? (
              <Avatar className="h-16 w-16">
                <AvatarImage src={campaign.image} alt="Campaign" />
                <AvatarFallback>{campaign.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-16 w-16">
                <AvatarFallback>{campaign?.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold mb-1">{campaign?.name || "Campaign"}</CardTitle>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary">ID: {campaign?.id}</Badge>
                <Badge variant="outline">Created: {campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString() : "-"}</Badge>
                <Badge variant="outline">Updated: {campaign?.updated_at ? new Date(campaign.updated_at).toLocaleDateString() : "-"}</Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => router.push(`/campaigns/${campaignId}/edit`)}>Edit</Button>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <div className="text-lg"><b>Description:</b> {campaign?.description || <span className="text-muted-foreground">No description</span>}</div>
              {campaign?.attachment && (
                <div><b>Attachment:</b> <a href={campaign.attachment} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a></div>
              )}
            </div>
            {/* Email Options Section */}
            {(campaign?.latest_email_template_id || campaign?.latest_email_content_id) && (
              <div className="mb-6">
                <div className="mb-2 font-semibold text-lg">Email Options</div>
                <div className="mb-3 text-muted-foreground text-sm">
                  You can view and customize your campaign's emails. Choose between the HTML <b>Template</b> (for styled emails) or the plain <b>Content</b> (for simple text emails).
                </div>
                <div className="flex gap-4">
                  {campaign?.latest_email_template_id && (
                    <Button variant="outline" onClick={() => handleViewTemplate(campaign.latest_email_template_id)}>
                      View Email Template
                    </Button>
                  )}
                  {campaign?.latest_email_content_id && (
                    <Button variant="outline" onClick={() => handleViewContent(campaign.latest_email_content_id)}>
                      View Email Content
                    </Button>
                  )}
                </div>
              </div>
            )}
            {/* Collapsible Associated Emails Section */}
            <Accordion type="single" collapsible defaultValue="emails">
              <AccordionItem value="emails">
                <AccordionTrigger className="text-lg font-semibold">Associated Emails ({campaignEmails.length})</AccordionTrigger>
                <AccordionContent>
              {emailsLoading ? (
                <div>Loading emails...</div>
              ) : campaignEmails.length === 0 ? (
                <div className="text-muted-foreground">No emails associated with this campaign.</div>
              ) : (
                    <ul className="list-disc pl-6 mt-2 max-h-64 overflow-y-auto">
                  {campaignEmails.map((email) => (
                    <li key={email.id} className="mb-1">
                      <span className="font-medium">{email.organization_name}</span>: {email.email}
                      {email.context && <span className="text-muted-foreground"> ({email.context})</span>}
                    </li>
                  ))}
                </ul>
              )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
