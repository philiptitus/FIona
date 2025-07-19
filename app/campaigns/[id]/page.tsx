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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import React from "react"
import AddEmailDialog from "@/components/emails/AddEmailDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Send, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { handleSendDispatch } from "@/store/actions/dispatchActions"
import { handleFetchMailboxes } from "@/store/actions/mailboxActions"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { campaigns, isLoading } = useSelector((state: RootState) => state.campaigns)
  const { emails: allEmails, isLoading: emailsLoading } = useSelector((state: RootState) => state.emails)
  const { dispatches } = useSelector((state: RootState) => state.dispatch);
  const campaignId = Number(params.id)
  const campaign = campaigns.find((c: any) => c.id === campaignId)
  const [showAddEmailDialog, setShowAddEmailDialog] = React.useState(false)
  const [sendModalOpen, setSendModalOpen] = React.useState(false)
  const [selectedMailbox, setSelectedMailbox] = React.useState<number | null>(null)
  const [selectedType, setSelectedType] = React.useState<"content" | "template" | "">("")
  const [sendError, setSendError] = React.useState("")
  const { mailboxes, isLoading: isMailboxesLoading } = useSelector((state: RootState) => state.mailbox)
  const [isSending, setIsSending] = React.useState(false)
  const [sendSuccess, setSendSuccess] = React.useState(false)

  React.useEffect(() => {
    if (!campaign) {
      dispatch(handleFetchCampaignById(campaignId) as any)
    }
    dispatch(handleFetchEmails(campaignId) as any)
  }, [campaign, dispatch, campaignId])

  React.useEffect(() => {
    if (sendModalOpen) {
      dispatch(handleFetchMailboxes() as any)
      setSelectedMailbox(null)
      setSelectedType("")
      setSendError("")
    }
  }, [sendModalOpen, dispatch])

  const handleSendModal = async () => {
    if (!campaignId || !selectedMailbox || !selectedType) {
      setSendError("Please select a mailbox and type.")
      return
    }
    if (!campaign?.dispatch_id) {
      setSendError("No dispatch found for this campaign.")
      return
    }
    setSendError("")
    setIsSending(true)
    setSendSuccess(false)
    const result = await dispatch(handleSendDispatch(campaign.dispatch_id, selectedMailbox, selectedType) as any)
    setIsSending(false)
    if (result && result.success >= 0) {
      setSendSuccess(true)
      setTimeout(() => {
        setSendModalOpen(false)
        setSendSuccess(false)
      }, 1800)
    } else {
      setSendError(result?.error || "Failed to send dispatch.")
    }
  }

  const campaignEmails = allEmails.filter((email: any) => email.campaign === campaignId)

  const hasSendable = (campaign?.latest_email_template_id || campaign?.latest_email_content_id) && campaignEmails.length > 0

  if (!campaign && !isLoading) {
    router.replace("/campaigns")
    return null
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
            {/* Inline alert/banner if no emails */}
            {!emailsLoading && campaignEmails.length === 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>No Emails Attached</AlertTitle>
                <AlertDescription>
                  This campaign currently does not have any valid emails attached. To begin sending, add emails to this campaign.
                  <div className="mt-4">
                    <Button
                      variant="default"
                      onClick={() => setShowAddEmailDialog(true)}
                    >
                      Add Emails to Campaign
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <AddEmailDialog open={showAddEmailDialog} onOpenChange={setShowAddEmailDialog} initialCampaignId={campaignId} />
            {/* Collapsible Associated Emails Section */}
            <Accordion type="single" collapsible defaultValue="emails">
              <AccordionItem value="emails">
                <AccordionTrigger className="text-lg font-semibold">Associated Emails ({campaignEmails.length})</AccordionTrigger>
                <AccordionContent>
              {emailsLoading ? (
                <div>Loading emails...</div>
              ) : campaignEmails.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="text-muted-foreground mb-2">No emails associated with this campaign.</div>
                </div>
              ) : (
                    <>
                      <ul className="list-disc pl-6 mt-2 max-h-64 overflow-y-auto">
                        {campaignEmails.map((email: any) => (
                          <li key={email.id} className="mb-1">
                            <span className="font-medium">{email.organization_name}</span>: {email.email}
                            {email.context && <span className="text-muted-foreground"> ({email.context})</span>}
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between items-center mt-6">
                        <Button variant="outline" onClick={() => router.push("/emails")}>You can add more emails here</Button>
                        {hasSendable && (
                          <Button variant="default" className="flex items-center gap-2" onClick={() => setSendModalOpen(true)}>
                            <Send className="w-4 h-4" /> Send Out Emails
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Dispatch</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 min-h-[120px]">
                  {isSending ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="animate-spin w-10 h-10 text-primary mb-2" />
                      <div className="text-primary font-semibold">Sending...</div>
                    </div>
                  ) : sendSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mb-2 animate-pop" />
                      <div className="text-green-600 font-semibold text-lg">Emails sent successfully!</div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block mb-1 font-medium">Select Mailbox</label>
                        {isMailboxesLoading ? (
                          <div>Loading mailboxes...</div>
                        ) : (
                          <select
                            className="w-full border rounded px-3 py-2"
                            value={selectedMailbox || ""}
                            onChange={e => setSelectedMailbox(Number(e.target.value))}
                          >
                            <option value="">Select mailbox...</option>
                            {mailboxes.map((mb: any) => (
                              <option key={mb.id} value={mb.id}>{mb.email} ({mb.provider})</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Type</label>
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={selectedType}
                          onChange={e => setSelectedType(e.target.value as "content" | "template")}
                        >
                          <option value="">Select type...</option>
                          <option value="content">Content (plain text)</option>
                          <option value="template">Template (HTML)</option>
                        </select>
                      </div>
                      {sendError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2 animate-fade-in">
                          <XCircle className="w-5 h-5" />
                          <span>{sendError}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {!isSending && !sendSuccess && (
                  <DialogFooter>
                    <Button onClick={handleSendModal} disabled={isSending}>Send</Button>
                    <Button variant="outline" onClick={() => setSendModalOpen(false)} disabled={isSending}>Cancel</Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
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
    </MainLayout>
  )
}
