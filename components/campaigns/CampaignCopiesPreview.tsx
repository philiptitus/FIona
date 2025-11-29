"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { ChevronDown, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface CopyEmailIds {
  initial_template_id?: number | null
  followup_template_id?: number | null
  final_template_id?: number | null
  initial_content_id?: number | null
  followup_content_id?: number | null
  final_content_id?: number | null
}

interface CampaignCopiesPreviewProps {
  campaign: any
  copies: number
}

export default function CampaignCopiesPreview({ campaign, copies }: CampaignCopiesPreviewProps) {
  const router = useRouter()
  const [selectedCopy, setSelectedCopy] = useState(1)
  const [emailType, setEmailType] = useState<"initial" | "followup" | "final">("initial")

  // Helper function to get email IDs for a specific copy
  const getEmailIdsForCopy = (copyNumber: number): CopyEmailIds => {
    if (copyNumber === 1) {
      return {
        initial_template_id: campaign?.initial_template_id,
        followup_template_id: campaign?.followup_template_id,
        final_template_id: campaign?.final_template_id,
        initial_content_id: campaign?.initial_content_id,
        followup_content_id: campaign?.followup_content_id,
        final_content_id: campaign?.final_content_id,
      }
    } else {
      const suffix = `_${copyNumber}_id`
      return {
        initial_template_id: campaign?.[`initial_template${suffix}`],
        followup_template_id: campaign?.[`followup_template${suffix}`],
        final_template_id: campaign?.[`final_template${suffix}`],
        initial_content_id: campaign?.[`initial_content${suffix}`],
        followup_content_id: campaign?.[`followup_content${suffix}`],
        final_content_id: campaign?.[`final_content${suffix}`],
      }
    }
  }

  const currentCopyIds = getEmailIdsForCopy(selectedCopy)

  // Get available email types for current copy
  const hasInitial = currentCopyIds.initial_template_id || currentCopyIds.initial_content_id
  const hasFollowup = currentCopyIds.followup_template_id || currentCopyIds.followup_content_id
  const hasFinal = currentCopyIds.final_template_id || currentCopyIds.final_content_id

  // Auto-select first available type when copy changes
  React.useEffect(() => {
    if (!hasInitial && hasFollowup) {
      setEmailType("followup")
    } else if (!hasInitial && !hasFollowup && hasFinal) {
      setEmailType("final")
    } else {
      setEmailType("initial")
    }
  }, [selectedCopy, hasInitial, hasFollowup, hasFinal])

  const handleViewTemplate = (templateId: number) => {
    router.push(`/templates/${templateId}`)
  }

  const handleViewContent = (contentId: number) => {
    router.push(`/content/${contentId}`)
  }

  const getCopyStatus = (copyNum: number) => {
    const ids = getEmailIdsForCopy(copyNum)
    const hasAny = ids.initial_template_id || ids.initial_content_id || 
                   ids.followup_template_id || ids.followup_content_id || 
                   ids.final_template_id || ids.final_content_id
    return hasAny
  }

  if (!campaign?.is_sequence && !campaign?.latest_email_template_id && !campaign?.latest_email_content_id) {
    return null
  }

  // Single copy mode (no copies feature used)
  if (copies === 1) {
    return (
      <div className="mb-6">
        <div className="mb-2 font-semibold text-base sm:text-lg">Your Email</div>
        <div className="mb-3 text-muted-foreground text-xs sm:text-sm">
          {campaign?.is_sequence
            ? "View and customize the 3-part email sequence: initial outreach, follow-up, and final reminder."
            : "You can view and customize your campaign's emails. Choose between the HTML Template (for styled emails) or the plain Content (for simple text emails)."}
        </div>
        
        {!campaign?.is_sequence && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {campaign?.latest_email_template_id && (
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleViewTemplate(campaign.latest_email_template_id)}>
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Preview Email Template</span>
                <span className="sm:hidden">Preview Template</span>
              </Button>
            )}
            {campaign?.latest_email_content_id && (
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleViewContent(campaign.latest_email_content_id)}>
                <Eye className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Preview Email Content</span>
                <span className="sm:hidden">Preview Content</span>
              </Button>
            )}
          </div>
        )}

        {campaign?.is_sequence && (
          <SequenceEmailsView campaign={campaign} />
        )}
      </div>
    )
  }

  // Multi-copy mode
  return (
    <div className="mb-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-base sm:text-lg">Email Copies</div>
          <Badge variant="secondary" className="text-xs">
            {copies} {copies === 1 ? "copy" : "copies"} generated
          </Badge>
        </div>
        <div className="text-muted-foreground text-xs sm:text-sm">
          {campaign?.is_sequence
            ? "Preview and compare different variations of your email sequence across all generated copies."
            : "Compare different variations of your generated emails. Each copy has unique messaging to reduce spam rates."}
        </div>
      </div>

      <Tabs defaultValue="copy-1" className="w-full">
        <TabsList className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(80px, 1fr))` }}>
          {Array.from({ length: copies }).map((_, i) => {
            const copyNum = i + 1
            const hasContent = getCopyStatus(copyNum)
            return (
              <TabsTrigger
                key={`copy-${copyNum}`}
                value={`copy-${copyNum}`}
                onClick={() => setSelectedCopy(copyNum)}
                className="relative text-xs sm:text-sm"
              >
                Copy {copyNum}
                {hasContent && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Array.from({ length: copies }).map((_, i) => {
          const copyNum = i + 1
          const copyIds = getEmailIdsForCopy(copyNum)
          const hasInitial = copyIds.initial_template_id || copyIds.initial_content_id
          const hasFollowup = copyIds.followup_template_id || copyIds.followup_content_id
          const hasFinal = copyIds.final_template_id || copyIds.final_content_id

          if (!hasInitial && !hasFollowup && !hasFinal) {
            return (
              <TabsContent key={`copy-${copyNum}-content`} value={`copy-${copyNum}`}>
                <Card className="bg-gray-50 dark:bg-gray-900">
                  <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                    No emails generated for this copy yet.
                  </CardContent>
                </Card>
              </TabsContent>
            )
          }

          return (
            <TabsContent key={`copy-${copyNum}-content`} value={`copy-${copyNum}`}>
              {campaign?.is_sequence ? (
                <SequenceEmailsView campaign={campaign} copyNumber={copyNum} />
              ) : (
                <SingleEmailView emailIds={copyIds} handleViewTemplate={handleViewTemplate} handleViewContent={handleViewContent} />
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

interface SequenceEmailsViewProps {
  campaign: any
  copyNumber?: number
}

function SequenceEmailsView({ campaign, copyNumber = 1 }: SequenceEmailsViewProps) {
  const router = useRouter()
  const suffix = copyNumber === 1 ? "" : `_${copyNumber}`

  const handleViewTemplate = (templateId: number) => {
    router.push(`/templates/${templateId}`)
  }

  const handleViewContent = (contentId: number) => {
    router.push(`/content/${contentId}`)
  }

  const initialTemplateId = campaign?.[`initial_template${suffix}_id`]
  const initialContentId = campaign?.[`initial_content${suffix}_id`]
  const followupTemplateId = campaign?.[`followup_template${suffix}_id`]
  const followupContentId = campaign?.[`followup_content${suffix}_id`]
  const finalTemplateId = campaign?.[`final_template${suffix}_id`]
  const finalContentId = campaign?.[`final_content${suffix}_id`]

  return (
    <div className="space-y-3">
      {/* Initial Email */}
      {(initialTemplateId || initialContentId) && (
        <EmailStageCard
          title="Initial Outreach"
          templateId={initialTemplateId}
          contentId={initialContentId}
          status={campaign?.followup_schedule_days || campaign?.final_schedule_days ? "sent" : "pending"}
          handleViewTemplate={handleViewTemplate}
          handleViewContent={handleViewContent}
        />
      )}

      {/* Follow-up Email */}
      {(followupTemplateId || followupContentId) && (
        <EmailStageCard
          title="Follow-up"
          templateId={followupTemplateId}
          contentId={followupContentId}
          status={campaign?.followup_sent ? "sent" : "scheduled"}
          handleViewTemplate={handleViewTemplate}
          handleViewContent={handleViewContent}
        />
      )}

      {/* Final Email */}
      {(finalTemplateId || finalContentId) && (
        <EmailStageCard
          title="Final Reminder"
          templateId={finalTemplateId}
          contentId={finalContentId}
          status={campaign?.final_sent ? "sent" : "scheduled"}
          handleViewTemplate={handleViewTemplate}
          handleViewContent={handleViewContent}
        />
      )}
    </div>
  )
}

interface EmailStagecardProps {
  title: string
  templateId?: number | null
  contentId?: number | null
  status: "pending" | "scheduled" | "sent"
  handleViewTemplate: (id: number) => void
  handleViewContent: (id: number) => void
}

function EmailStageCard({ title, templateId, contentId, status, handleViewTemplate, handleViewContent }: EmailStagecardProps) {
  const statusConfig = {
    pending: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    scheduled: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
    sent: { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  }

  const config = statusConfig[status]
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">{title}</div>
        <Badge className={config.badge}>
          {statusLabel}
        </Badge>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {templateId && (
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleViewTemplate(templateId)}>
            <Eye className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Preview Template</span>
            <span className="sm:hidden">Template</span>
          </Button>
        )}
        {contentId && (
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleViewContent(contentId)}>
            <Eye className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Preview Content</span>
            <span className="sm:hidden">Content</span>
          </Button>
        )}
      </div>
    </div>
  )
}

interface SingleEmailViewProps {
  emailIds: {
    initial_template_id?: number | null
    initial_content_id?: number | null
    followup_template_id?: number | null
    followup_content_id?: number | null
    final_template_id?: number | null
    final_content_id?: number | null
  }
  handleViewTemplate: (id: number) => void
  handleViewContent: (id: number) => void
}

function SingleEmailView({ emailIds, handleViewTemplate, handleViewContent }: SingleEmailViewProps) {
  return (
    <div className="space-y-2">
      {emailIds.initial_template_id && (
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleViewTemplate(emailIds.initial_template_id!)}>
          <Eye className="mr-2 h-4 w-4" />
          Preview Template
        </Button>
      )}
      {emailIds.initial_content_id && (
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleViewContent(emailIds.initial_content_id!)}>
          <Eye className="mr-2 h-4 w-4" />
          Preview Content
        </Button>
      )}
    </div>
  )
}
