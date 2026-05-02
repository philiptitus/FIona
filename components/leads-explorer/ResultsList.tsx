"use client"

import ResultCard from "./ResultCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { Place } from "@/store/constants/googlePlacesConstants"

interface ResultsListProps {
  places: Place[]
  isLoading: boolean
  onEnrich?: (place: Place) => void
  onDetails?: (place: Place) => void
}

export default function ResultsList({
  places,
  isLoading,
  onEnrich,
  onDetails,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[600px] overflow-y-auto pr-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-center">
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query or filters
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[600px] overflow-y-auto pr-2">
      {places.map((place) => (
        <ResultCard
          key={place.id}
          place={place}
          onEnrich={() => onEnrich?.(place)}
          onDetails={() => onDetails?.(place)}
        />
      ))}
    </div>
  )
}
