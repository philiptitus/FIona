"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sparkles, Users } from "lucide-react"

interface BulkResearchConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactCount: number
  contactNames: string[]
  onConfirm: (createCampaign: boolean) => void
  isLoading?: boolean
}

export function BulkResearchConfirmationModal({
  open,
  onOpenChange,
  contactCount,
  contactNames,
  onConfirm,
  isLoading = false,
}: BulkResearchConfirmationModalProps) {
  const [createCampaign, setCreateCampaign] = useState(false)

  const handleConfirm = () => {
    onConfirm(createCampaign)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Start Bulk Research
          </DialogTitle>
          <DialogDescription>
            Generate AI-powered personalized research and emails for {contactCount} contact{contactCount > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <Users className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                Selected Contacts ({contactCount})
              </p>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {contactNames.slice(0, 10).map((name, index) => (
                  <p key={index} className="text-xs text-purple-700 dark:text-purple-300 truncate">
                    • {name}
                  </p>
                ))}
                {contactNames.length > 10 && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                    ... and {contactNames.length - 10} more
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              id="create-campaign"
              checked={createCampaign}
              onCheckedChange={(checked) => setCreateCampaign(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="create-campaign"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Create campaign after research
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically create a campaign with the generated emails
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
            <p>• Research typically takes 30-60 seconds per contact</p>
            <p>• You'll be notified when each research completes</p>
            <p>• Results will appear on the Research page</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Start Research
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
