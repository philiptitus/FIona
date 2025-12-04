"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Workflow {
  id: number
  name: string
  prompt: string
  findleads: boolean
  attachment_suggestion: boolean
  created_at: string
  updated_at: string
}

interface WorkflowListProps {
  workflows: Workflow[]
  selectedWorkflows: Set<number>
  onToggleSelect: (id: number) => void
  onToggleSelectAll: () => void
  onEdit: (workflow: Workflow) => void
  onDelete: (id: number) => void
}

export default function WorkflowList({
  workflows,
  selectedWorkflows,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
}: WorkflowListProps) {
  const { toast } = useToast()

  const extractTags = (prompt: string) => {
    const regex = /{{\s*([^}]+?)\s*}}/g
    const tags = []
    let match
    while ((match = regex.exec(prompt)) !== null) {
      tags.push(match[1].trim())
    }
    return [...new Set(tags)]
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="divide-y">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 items-center p-4 bg-muted/50 font-semibold text-sm sticky top-0">
        <div className="col-span-1 flex items-center justify-center">
          <Checkbox
            checked={selectedWorkflows.size === workflows.length && workflows.length > 0}
            onCheckedChange={onToggleSelectAll}
            aria-label="Select all workflows"
          />
        </div>
        <div className="col-span-3">Name</div>
        <div className="col-span-4">Tags</div>
        <div className="col-span-2">Options</div>
        <div className="col-span-2">Created</div>
      </div>

      {/* Rows */}
      <div>
        {workflows.map((workflow) => {
          const tags = extractTags(workflow.prompt)
          const isSelected = selectedWorkflows.has(workflow.id)

          return (
            <div
              key={workflow.id}
              className={cn(
                "grid grid-cols-12 gap-4 items-start p-4 hover:bg-muted/30 transition-colors",
                isSelected && "bg-muted/50"
              )}
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center justify-center pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(workflow.id)}
                  aria-label={`Select ${workflow.name}`}
                />
              </div>

              {/* Name */}
              <div className="col-span-3">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{workflow.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {workflow.findleads && (
                      <Badge variant="outline" className="text-xs">
                        Lead Generation
                      </Badge>
                    )}
                    {workflow.attachment_suggestion && (
                      <Badge variant="outline" className="text-xs">
                        Attachment Suggested
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="col-span-4">
                <div className="flex flex-wrap gap-1">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {`{{${tag}}}`}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(workflow)}
                  className="h-8 w-8 p-0"
                  title="Edit workflow"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(workflow.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Delete workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Created Date */}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">
                  {formatDate(workflow.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Prompt Preview in Expandable Row (Optional - for mobile) */}
      <div className="text-xs text-muted-foreground p-4 bg-muted/30 border-t">
        <p>Click on a workflow row to view the full prompt or use the menu to edit/delete.</p>
      </div>
    </div>
  )
}
