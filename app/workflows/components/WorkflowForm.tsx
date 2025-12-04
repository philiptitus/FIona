"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogFooter } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import TagManager from "./TagManager"

interface WorkflowFormProps {
  workflow?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function WorkflowForm({ workflow, onSubmit, onCancel }: WorkflowFormProps) {
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [findleads, setFindleads] = useState(false)
  const [attachmentSuggestion, setAttachmentSuggestion] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (workflow) {
      setName(workflow.name)
      setPrompt(workflow.prompt)
      setFindleads(workflow.findleads)
      setAttachmentSuggestion(workflow.attachment_suggestion)
    }
  }, [workflow])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Workflow name is required"
    } else if (name.length > 255) {
      newErrors.name = "Name must be 255 characters or less"
    }

    if (!prompt.trim()) {
      newErrors.prompt = "Prompt is required"
    } else if (prompt.length < 20) {
      newErrors.prompt = "Prompt must be at least 20 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        prompt,
        findleads,
        attachment_suggestion: attachmentSuggestion,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workflow Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Lead Qualification, Follow-up Campaign"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) {
              setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.name
                return newErrors
              })
            }
          }}
          disabled={isSubmitting}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt *</Label>
        <p className="text-xs text-muted-foreground">Use tags like name to create dynamic prompts that will be personalized when campaigns are created.</p>
        <div className="space-y-2">
          <textarea
            id="prompt"
            placeholder="Enter your AI prompt here. Use names, companies, emails, etc. for personalization..."
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              if (errors.prompt) {
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  delete newErrors.prompt
                  return newErrors
                })
              }
            }}
            disabled={isSubmitting}
            className={`w-full rounded-md border bg-background px-3 py-2 text-sm font-mono min-h-[120px] resize-none ${errors.prompt ? "border-destructive" : ""}`}
          />
          {errors.prompt && <p className="text-sm text-destructive">{errors.prompt}</p>}
        </div>

        <TagManager
          prompt={prompt}
          onInsertTag={(tag) => {
            setPrompt(prompt + ` {{${tag}}}`)
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="findleads" checked={findleads} onCheckedChange={(checked) => setFindleads(checked as boolean)} disabled={isSubmitting} />
          <Label htmlFor="findleads" className="font-normal cursor-pointer">
            Generate email lists (Find leads automatically)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="attachment" checked={attachmentSuggestion} onCheckedChange={(checked) => setAttachmentSuggestion(checked as boolean)} disabled={isSubmitting} />
          <Label htmlFor="attachment" className="font-normal cursor-pointer">
            Suggest attachments when using this workflow
          </Label>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Workflows help create consistent, personalized campaigns using AI. Tags will be filled in when users apply this workflow.</AlertDescription>
      </Alert>

      <DialogFooter className="flex gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : workflow ? "Update Workflow" : "Create Workflow"}
        </Button>
      </DialogFooter>
    </div>
  )
}
