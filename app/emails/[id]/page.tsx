"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/store/store"
import { handleDeleteEmail, handleFetchEmails } from "@/store/actions/emailActions"
import { handleStartResearch } from "@/store/actions/researchActions"
import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Mail, Phone, Building2, Globe, Linkedin, Facebook, Twitter, User, MapPin, CheckCircle2, Eye, XCircle, Reply, Sparkles } from "lucide-react"
import EditEmailDialog from "@/components/emails/EditEmailDialog"
import ResearchConfirmationModal from "@/components/research/ResearchConfirmationModal"
import { useToast } from "@/components/ui/use-toast"

export default function EmailDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { emails, isLoading } = useSelector((state: RootState) => state.emails)
  const emailId = Number(params.id)
  const email = emails.find(e => e.id === emailId)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showResearchModal, setShowResearchModal] = useState(false)
  const [researchLoading, setResearchLoading] = useState(false)

  useEffect(() => {
    if (!email) {
      dispatch(handleFetchEmails())

    }
  }, [email, dispatch])

  if (!email && !isLoading) {
    // If not found after fetching, redirect to emails list
    router.replace("/emails")
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/emails")}>{"<-"} Back to Emails</Button>
        <Card className="rounded-2xl shadow-xl p-0 overflow-hidden">
          <CardHeader className="flex flex-col items-center bg-gradient-to-r from-primary/10 to-secondary/10 py-8">
            <Avatar className="h-20 w-20 mb-2">
              <AvatarFallback>{email?.first_name?.[0] || email?.organization_name?.[0] || "E"}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold mb-1">{email?.first_name || email?.organization_name} {email?.last_name}</CardTitle>
            <div className="text-muted-foreground text-lg mb-1">{email?.title} {email?.company_name_for_emails && <>@ {email.company_name_for_emails}</>}</div>
            <div className="flex gap-2 mb-2">
              {email?.email_sent && <TooltipProvider><Tooltip><TooltipTrigger><CheckCircle2 className="text-green-600 h-6 w-6" /></TooltipTrigger><TooltipContent>Email Sent</TooltipContent></Tooltip></TooltipProvider>}
              {email?.email_open && <TooltipProvider><Tooltip><TooltipTrigger><Eye className="text-blue-600 h-6 w-6" /></TooltipTrigger><TooltipContent>Email Opened</TooltipContent></Tooltip></TooltipProvider>}
              {email?.email_bounced && <TooltipProvider><Tooltip><TooltipTrigger><XCircle className="text-red-600 h-6 w-6" /></TooltipTrigger><TooltipContent>Bounced</TooltipContent></Tooltip></TooltipProvider>}
              {email?.replied && <TooltipProvider><Tooltip><TooltipTrigger><Reply className="text-purple-600 h-6 w-6" /></TooltipTrigger><TooltipContent>Replied</TooltipContent></Tooltip></TooltipProvider>}
              {email?.demoed && <TooltipProvider><Tooltip><TooltipTrigger><Sparkles className="text-yellow-500 h-6 w-6" /></TooltipTrigger><TooltipContent>Demoed</TooltipContent></Tooltip></TooltipProvider>}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {email?.stage && <Badge variant="outline">{email.stage}</Badge>}
              {email?.seniority && <Badge variant="outline">{email.seniority}</Badge>}
              {email?.industry && <Badge variant="outline">{email.industry}</Badge>}
              {email?.city && <Badge variant="secondary">{email.city}</Badge>}
              {email?.country && <Badge variant="secondary">{email.country}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="py-8 px-6">
            <Tabs defaultValue="contact" className="w-full">
              <TabsList className="mb-4 grid grid-cols-4">
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
              <TabsContent value="contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Mail className="inline mr-2" /> <b>Email:</b> {email?.email}</div>
                  {email?.secondary_email && <div><Mail className="inline mr-2" /> <b>Secondary:</b> {email.secondary_email}</div>}
                  {email?.tertiary_email && <div><Mail className="inline mr-2" /> <b>Tertiary:</b> {email.tertiary_email}</div>}
                  {email?.work_direct_phone && <div><Phone className="inline mr-2" /> <b>Work Phone:</b> {email.work_direct_phone}</div>}
                  {email?.mobile_phone && <div><Phone className="inline mr-2" /> <b>Mobile:</b> {email.mobile_phone}</div>}
                  {email?.home_phone && <div><Phone className="inline mr-2" /> <b>Home:</b> {email.home_phone}</div>}
                  {email?.corporate_phone && <div><Phone className="inline mr-2" /> <b>Corporate:</b> {email.corporate_phone}</div>}
                  {email?.other_phone && <div><Phone className="inline mr-2" /> <b>Other:</b> {email.other_phone}</div>}
                  {email?.person_linkedin_url && <div><Linkedin className="inline mr-2" /> <a href={email.person_linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a></div>}
                  {email?.facebook_url && <div><Facebook className="inline mr-2" /> <a href={email.facebook_url} target="_blank" rel="noopener noreferrer">Facebook</a></div>}
                  {email?.twitter_url && <div><Twitter className="inline mr-2" /> <a href={email.twitter_url} target="_blank" rel="noopener noreferrer">Twitter</a></div>}
                </div>
              </TabsContent>
              <TabsContent value="company">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {email?.company_name_for_emails && <div><Building2 className="inline mr-2" /> <b>Company:</b> {email.company_name_for_emails}</div>}
                  {email?.company_address && <div><MapPin className="inline mr-2" /> <b>Address:</b> {email.company_address}</div>}
                  {email?.company_city && <div><MapPin className="inline mr-2" /> <b>City:</b> {email.company_city}</div>}
                  {email?.company_state && <div><MapPin className="inline mr-2" /> <b>State:</b> {email.company_state}</div>}
                  {email?.company_country && <div><MapPin className="inline mr-2" /> <b>Country:</b> {email.company_country}</div>}
                  {email?.company_phone && <div><Phone className="inline mr-2" /> <b>Phone:</b> {email.company_phone}</div>}
                  {email?.website && <div><Globe className="inline mr-2" /> <a href={email.website} target="_blank" rel="noopener noreferrer">Website</a></div>}
                  {email?.company_linkedin_url && <div><Linkedin className="inline mr-2" /> <a href={email.company_linkedin_url} target="_blank" rel="noopener noreferrer">Company LinkedIn</a></div>}
                  {email?.industry && <div><Badge variant="outline">{email.industry}</Badge></div>}
                  {email?.num_employees && <div><b>Employees:</b> {email.num_employees}</div>}
                  {email?.annual_revenue && <div><b>Annual Revenue:</b> ${email.annual_revenue.toLocaleString()}</div>}
                  {email?.total_funding && <div><b>Total Funding:</b> ${email.total_funding.toLocaleString()}</div>}
                  {email?.latest_funding && <div><b>Latest Funding:</b> {email.latest_funding}</div>}
                  {email?.latest_funding_amount && <div><b>Latest Funding Amount:</b> ${email.latest_funding_amount.toLocaleString()}</div>}
                  {email?.last_raised_at && <div><b>Last Raised At:</b> {email.last_raised_at}</div>}
                  {email?.subsidiary_of && <div><b>Subsidiary Of:</b> {email.subsidiary_of}</div>}
                  {email?.number_of_retail_locations && <div><b>Retail Locations:</b> {email.number_of_retail_locations}</div>}
                </div>
              </TabsContent>
              <TabsContent value="status">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><b>Email Status:</b> {email?.email_status}</div>
                  <div><b>Primary Source:</b> {email?.primary_email_source}</div>
                  <div><b>Confidence:</b> {email?.email_confidence}</div>
                  <div><b>Catch-all Status:</b> {email?.primary_email_catch_all_status}</div>
                  <div><b>Last Verified:</b> {email?.primary_email_last_verified_at}</div>
                  <div><b>Lists:</b> {email?.lists}</div>
                  <div><b>Account Owner:</b> {email?.account_owner}</div>
                  <div><b>Contact Owner:</b> {email?.contact_owner}</div>
                  <div><b>Stage:</b> {email?.stage}</div>
                  <div><b>Departments:</b> {email?.departments}</div>
                  <div><b>Technologies:</b> {email?.technologies}</div>
                  <div><b>Apollo Contact Id:</b> {email?.apollo_contact_id}</div>
                  <div><b>Apollo Account Id:</b> {email?.apollo_account_id}</div>
                </div>
              </TabsContent>
              <TabsContent value="other">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><b>Context:</b> {email?.context}</div>
                  <div><b>Keywords:</b> {email?.keywords}</div>
                  <div><b>Created At:</b> {email?.created_at}</div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex gap-2 mt-8 justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowResearchModal(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Research & Email
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Use AI to research this contact and generate a personalized email
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button onClick={() => setShowEditDialog(true)}>Edit</Button>
              <Button variant="destructive" onClick={async () => {
                await dispatch(handleDeleteEmail(emailId))
                router.push("/emails")
              }}>Delete</Button>
            </div>
            <EditEmailDialog open={showEditDialog} onOpenChange={setShowEditDialog} email={email} onSuccess={() => dispatch(handleFetchEmails())} />

            <ResearchConfirmationModal
              open={showResearchModal}
              onOpenChange={setShowResearchModal}
              contactName={email?.first_name ? `${email.first_name} ${email.last_name || ""}` : email?.organization_name || "Contact"}
              contactType="emaillist"
              isLoading={researchLoading}
              onConfirm={async () => {
                setResearchLoading(true)
                try {
                  const result = await dispatch(
                    handleStartResearch({
                      contact_id: emailId,
                      contact_type: "emaillist",
                    })
                  )
                  if (result.success) {
                    setShowResearchModal(false)
                    toast({
                      title: "✨ Research Started!",
                      description: `AI is researching ${email?.first_name || "this contact"}. You'll be notified when ready.`,
                    })
                    router.push("/dashboard")
                  } else {
                    toast({
                      title: "Error",
                      description: result.error || "Failed to start research",
                      variant: "destructive",
                    })
                  }
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to start research",
                    variant: "destructive",
                  })
                } finally {
                  setResearchLoading(false)
                }
              }}
            />

          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
