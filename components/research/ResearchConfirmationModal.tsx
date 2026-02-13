"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertCircle, Sparkles } from "lucide-react"
import { useState } from "react"

interface ResearchConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactName: string
  contactType: "emaillist" | "company"
  onConfirm: (createCampaign: boolean) => void
  isLoading?: boolean
}

export default function ResearchConfirmationModal({
  open,
  onOpenChange,
  contactName,
  contactType,
  onConfirm,
  isLoading = false,
}: ResearchConfirmationModalProps) {
  const [createCampaign, setCreateCampaign] = useState(false)

  const handleConfirm = () => {
    onConfirm(createCampaign)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Personalized Research & Email
          </DialogTitle>
          <DialogDescription>
            This will use AI to research and generate a personalized email for{" "}
            <span className="font-semibold text-foreground">{contactName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">What happens next:</p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Deep research on the {contactType === "emaillist" ? "contact" : "company"} will begin</li>
                <li>• AI generates a personalized email based on findings</li>
                <li>• Results appear in your Research dashboard (30-60 seconds)</li>
                <li>• You'll get a notification when ready</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="create-campaign"
              checked={createCampaign}
              onCheckedChange={(checked) => setCreateCampaign(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="create-campaign" className="cursor-pointer">
              Automatically create a campaign for this {contactType === "emaillist" ? "contact" : "company"}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading 
              ? "Starting Research..." 
              : createCampaign 
                ? "Generate Research & Email" 
                : "Generate Research"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
