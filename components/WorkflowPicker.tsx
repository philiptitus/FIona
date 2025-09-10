"use client"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import MailLoader from "@/components/MailLoader"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { handleFetchWorkflows } from "@/store/actions/workflowActions"
import type { AppDispatch } from "@/store/store"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  setCampaignName: (v: string) => void
  setCampaignType: (v: string) => void
  setGenerateEmailLists: (v: boolean) => void
  setAttachmentSuggested: (v: boolean) => void
}

export default function WorkflowPicker({ setCampaignName, setCampaignType, setGenerateEmailLists, setAttachmentSuggested }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const workflowsState = useSelector((s: any) => s.workflows)

  useEffect(() => {
    // fetch workflows on mount
    dispatch(handleFetchWorkflows())
  }, [dispatch])

  const applyWorkflow = (w: any) => {
    // Autofill fields
    if (w.name) setCampaignName(w.name)
    if (w.prompt) setCampaignType(w.prompt)
    setGenerateEmailLists(Boolean(w.findleads))
    setAttachmentSuggested(Boolean(w.attachment_suggestion))

    // Notify user the workflow was applied; prompt review will happen at create time
    toast({
      title: `Applied workflow: ${w.name}`,
      description: "Workflow applied — review and edit the prompt as needed before creating the campaign.",
    })

    if (w.attachment_suggestion) {
      toast({
        title: "Attachment recommended",
        description: "Fiona recommends attaching supporting documents for this workflow.",
      })
    }
  }

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="outline">Suggested workflows</Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        {workflowsState?.isLoading && (
          <div className="flex items-center justify-center p-4">
            <MailLoader />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {workflowsState?.workflows?.map((w: any) => (
            <Button key={w.id} type="button" size="sm" variant="ghost" onClick={() => applyWorkflow(w)}>
              {w.name}
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
