"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Globe, MapPin, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Place } from "@/store/constants/googlePlacesConstants"

interface EnrichmentModalProps {
  isOpen: boolean
  selectedPlace: Place | null
  isEnriching: boolean
  campaigns: Array<{ id: number; name: string }>
  onEnrich: (campaignId?: number) => void
  onClose: () => void
}

export default function EnrichmentModal({
  isOpen,
  selectedPlace,
  isEnriching,
  campaigns,
  onEnrich,
  onClose,
}: EnrichmentModalProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")

  const handleEnrich = () => {
    onEnrich(selectedCampaignId ? parseInt(selectedCampaignId) : undefined)
  }

  if (!selectedPlace) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Enrich Business
          </DialogTitle>
          <DialogDescription>
            Trigger email enrichment for this business to extract contact information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Business Preview */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-bold text-foreground truncate">
              {selectedPlace.displayName?.text}
            </h3>

            {selectedPlace.formattedAddress && (
              <div className="flex gap-2 items-start text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground line-clamp-2">
                  {selectedPlace.formattedAddress}
                </p>
              </div>
            )}

            {selectedPlace.websiteUri && (
              <div className="flex gap-2 items-center text-sm">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href={selectedPlace.websiteUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate text-xs"
                >
                  {selectedPlace.websiteUri}
                </a>
              </div>
            )}

            {/* Status Badges */}
            <div className="flex gap-2 flex-wrap pt-2">
              {selectedPlace.websiteUri && (
                <Badge variant="secondary" className="text-xs">
                  Has Website
                </Badge>
              )}
              {!selectedPlace.websiteUri && (
                <Badge variant="outline" className="text-xs">
                  Missing Website
                </Badge>
              )}
            </div>
          </div>

          {/* Campaign Selection */}
          <div className="space-y-3">
            <Label htmlFor="campaign" className="text-base font-medium">
              Associate with Campaign (Optional)
            </Label>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger id="campaign" className="w-full rounded-lg">
                <SelectValue placeholder="Select campaign..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Skip for now</SelectItem>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p>
              Enrichment will extract contact emails using the email-miner service
              and create a company record.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isEnriching}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnrich}
              disabled={isEnriching}
              className="flex-1"
            >
              {isEnriching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enriching...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Start Enrichment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
