"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Globe, MapPin, Phone, Star, ExternalLink } from "lucide-react"
import type { Place } from "@/store/constants/googlePlacesConstants"

interface ResultCardProps {
  place: Place
  onEnrich?: () => void
  onDetails?: () => void
  onSave?: () => void
}

export default function ResultCard({
  place,
  onEnrich,
  onDetails,
  onSave,
}: ResultCardProps) {
  const hasWebsite = !!place.websiteUri
  const hasPhone = !!place.location?.latitude // Mock check

  return (
    <Card className="p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-300 group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
              {place.displayName?.text || "Unknown"}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {place.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{place.rating}</span>
                  {place.userRatingCount && (
                    <span className="text-muted-foreground">
                      ({place.userRatingCount})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-1 flex-wrap justify-end">
            {hasWebsite && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Web
              </Badge>
            )}
            {hasPhone && (
              <Badge variant="secondary" className="text-xs">
                <Phone className="h-3 w-3 mr-1" />
                Phone
              </Badge>
            )}
          </div>
        </div>

        {/* Address */}
        {place.formattedAddress && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {place.formattedAddress}
            </p>
          </div>
        )}

        {/* Contact Info */}
        {(hasWebsite || hasPhone) && (
          <div className="flex flex-wrap gap-2">
            {place.websiteUri && (
              <a
                href={place.websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Globe className="h-3 w-3" />
                Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}


      </div>
    </Card>
  )
}
