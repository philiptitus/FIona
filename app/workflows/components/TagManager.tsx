"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Copy, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TagManagerProps {
  prompt: string
  onInsertTag: (tag: string) => void
}

// Common tags for email/campaign workflows
const COMMON_TAGS = [
  { name: "name", description: "Recipient first name" },
  { name: "full_name", description: "Recipient full name" },
  { name: "email", description: "Recipient email address" },
  { name: "company", description: "Company name" },
  { name: "title", description: "Job title" },
  { name: "industry", description: "Industry" },
  { name: "website", description: "Company website" },
  { name: "phone", description: "Phone number" },
  { name: "location", description: "Company location" },
]

export default function TagManager({ prompt, onInsertTag }: TagManagerProps) {
  const [customTag, setCustomTag] = useState("")
  const [usedTags, setUsedTags] = useState<Set<string>>(new Set())

  // Extract used tags from prompt
  React.useEffect(() => {
    const regex = /{{\s*([^}]+?)\s*}}/g
    const found = new Set<string>()
    let match
    while ((match = regex.exec(prompt)) !== null) {
      found.add(match[1].trim())
    }
    setUsedTags(found)
  }, [prompt])

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      onInsertTag(customTag.trim())
      setCustomTag("")
    }
  }

  const handleInsertTag = (tag: string) => {
    onInsertTag(tag)
  }

  return (
    <div className="space-y-3 p-3 bg-muted/50 rounded-md border">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Quick Add Tags</p>
        
        {/* Common Tags Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_TAGS.map((tag) => (
            <Button
              key={tag.name}
              variant={usedTags.has(tag.name) ? "secondary" : "outline"}
              size="sm"
              onClick={() => handleInsertTag(tag.name)}
              title={tag.description}
              className="text-xs h-auto py-1.5 justify-start gap-1 flex-wrap"
            >
              <span>{`{{${tag.name}}}`}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div className="space-y-2 pt-2 border-t">
        <p className="text-xs font-medium text-muted-foreground">Custom Tag</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., custom_field"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddCustomTag()
              }
            }}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            onClick={handleAddCustomTag}
            disabled={!customTag.trim()}
            className="h-8 gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      </div>

      {/* Used Tags Display */}
      {usedTags.size > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground">Tags in this prompt</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(usedTags).map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {`{{${tag}}}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground pt-1">
        Tags will be replaced with actual values when users apply this workflow to campaigns.
      </p>
    </div>
  )
}
