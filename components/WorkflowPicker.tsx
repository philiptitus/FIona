"use client"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import MailLoader from "@/components/MailLoader"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  const user = useSelector((s: any) => s.auth?.user)
  const [open, setOpen] = React.useState(false)
  const [placeholderDialogOpen, setPlaceholderDialogOpen] = React.useState(false)
  const [placeholderKeys, setPlaceholderKeys] = React.useState<string[]>([])
  const [placeholderValues, setPlaceholderValues] = React.useState<Record<string, string>>({})
  const [originalPrompt, setOriginalPrompt] = React.useState<string>("")

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

  // Helper to extract placeholders like {{YOUR_NAME}} from a prompt
  const extractPlaceholders = (text: string) => {
    const re = /{{\s*([^}]+?)\s*}}/g
    const found: string[] = []
    let m
    // eslint-disable-next-line no-cond-assign
    while ((m = re.exec(text)) !== null) {
      const key = m[1].trim()
      if (key && !found.includes(key)) found.push(key)
    }
    return found
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>Suggested workflows</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Suggested workflows</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {workflowsState?.isLoading ? (
              <div className="flex items-center justify-center p-4">
                <MailLoader />
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                {workflowsState?.workflows?.length ? (
                  workflowsState.workflows.map((w: any) => (
                    <Button
                      key={w.id}
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        // If the workflow has a prompt with placeholders, open the placeholder dialog
                        if (w.prompt) {
                          const keys = extractPlaceholders(w.prompt)
                          if (keys.length > 0) {
                            setOriginalPrompt(w.prompt)
                            setPlaceholderKeys(keys)
                            const initialValues: Record<string, string> = {}
                            // Prefill common placeholders from authenticated user when available
                            keys.forEach(k => {
                              let val = ""
                              try {
                                const norm = k.replace(/[^A-Z0-9]/gi, "").toUpperCase()
                                if (user) {
                                  if (norm === "YOURNAME" || norm === "YOUR_NAME" || norm === "NAME" || norm === "FULLNAME" || norm === "FULL_NAME" || norm === "FIRSTNAME" || norm === "FIRST_NAME") {
                                    // Prefer first_name, fallback to username
                                    val = (user.first_name && user.first_name !== "") ? user.first_name : (user.username || "")
                                  } else if (norm === "YOUREMAIL" || norm === "YOUR_EMAIL" || norm === "EMAIL") {
                                    val = user.email || ""
                                  } else if (norm === "USERNAME") {
                                    val = user.username || ""
                                  }
                                }
                              } catch (e) {
                                // defensive: if user shape is unexpected, leave blank
                                val = ""
                              }
                              initialValues[k] = val
                            })
                            setPlaceholderValues(initialValues)
                            setPlaceholderDialogOpen(true)
                          }
                        }
                        applyWorkflow(w)
                        setOpen(false)
                      }}
                    >
                      {w.name}
                    </Button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-4">No suggested workflows available.</div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Placeholder replacement dialog */}
      <Dialog open={placeholderDialogOpen} onOpenChange={setPlaceholderDialogOpen}>
        {/* Constrain dialog height and make body scrollable to avoid vertical overflow on small screens */}
        <DialogContent className="w-[95vw] max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Fill placeholders</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3 overflow-auto pr-2" style={{ maxHeight: 'calc(80vh - 120px)' }}>
            <p className="text-sm text-muted-foreground">Replace the placeholders below to personalize the prompt.</p>
            {placeholderKeys.map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium">{`{{${key}}}`}</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={placeholderValues[key] || ''}
                  onChange={(e) => setPlaceholderValues(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={key.replace(/_/g, ' ')}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaceholderDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              // Replace placeholders in originalPrompt
              let newPrompt = originalPrompt
              placeholderKeys.forEach(k => {
                const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g')
                newPrompt = newPrompt.replace(re, placeholderValues[k] || `{{${k}}}`)
              })
              // Update the campaign type field with the replaced prompt
              setCampaignType(newPrompt)
              setPlaceholderDialogOpen(false)
            }}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
