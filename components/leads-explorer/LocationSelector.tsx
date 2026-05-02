"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, Search, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchLocationSuggestions } from "@/store/actions/googlePlacesActions"
import { clearLocationSuggestions } from "@/store/slices/googlePlacesSlice"
import { cn } from "@/lib/utils"

export interface LocationToken {
  id: string
  text: string
  latitude?: number
  longitude?: number
}

interface LocationSelectorProps {
  selectedLocations: LocationToken[]
  onAddLocation: (location: LocationToken) => void
  onRemoveLocation: (id: string) => void
  placeholder?: string
}

export default function LocationSelector({
  selectedLocations,
  onAddLocation,
  onRemoveLocation,
  placeholder = "Search city, region or country...",
}: LocationSelectorProps) {
  const dispatch = useAppDispatch()
  const { locationSuggestions, locationSuggestionsLoading, locationSuggestionsError } = 
    useAppSelector((state) => state.googlePlaces)

  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced API call
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (input.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        dispatch(fetchLocationSuggestions({ query: input.trim(), limit: 6 }) as any)
      }, 350)
    } else {
      dispatch(clearLocationSuggestions())
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [input, dispatch])

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [locationSuggestions])

  const handleAddLocation = (location: LocationToken) => {
    if (!selectedLocations.find((l) => l.id === location.id)) {
      onAddLocation(location)
      setInput("")
      setShowSuggestions(false)
      dispatch(clearLocationSuggestions())
    }
  }

  const handleSelectSuggestion = (index: number) => {
    const suggestion = locationSuggestions[index]
    if (suggestion) {
      const locationToken: LocationToken = {
        id: suggestion.place_id.toString(),
        text: suggestion.display_name,
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
      }
      handleAddLocation(locationToken)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    const totalResults = locationSuggestions.length

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < totalResults) {
          handleSelectSuggestion(highlightedIndex)
        }
        break
      case "Escape":
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  // Format display name for better readability
  const formatDisplayName = (displayName: string) => {
    const parts = displayName.split(", ")
    const primary = parts.slice(0, 2).join(", ")
    const secondary = parts.slice(2).join(", ")
    return { primary, secondary }
  }

  // Get addresstype badge color
  const getAddressTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "city":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
      case "state":
      case "county":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
      case "country":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      default:
        return "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="relative flex items-center gap-2 bg-background border border-input rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary/50">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay to allow click events on suggestions
              setTimeout(() => setShowSuggestions(false), 200)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          {locationSuggestionsLoading && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>

        {showSuggestions && input.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
            {/* Loading State */}
            {locationSuggestionsLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 border-b last:border-b-0 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="h-5 w-12 bg-muted rounded-full" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Error State */}
            {!locationSuggestionsLoading && locationSuggestionsError && (
              <div className="px-4 py-3 text-sm text-destructive">
                Could not load results. Check your connection.
              </div>
            )}

            {/* Empty State */}
            {!locationSuggestionsLoading && 
             !locationSuggestionsError && 
             locationSuggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No locations found for '{input}'
              </div>
            )}

            {/* Results */}
            {!locationSuggestionsLoading &&
             !locationSuggestionsError &&
             locationSuggestions.length > 0 &&
             locationSuggestions.map((suggestion, index) => {
               const { primary, secondary } = formatDisplayName(suggestion.display_name)
               const isHighlighted = index === highlightedIndex

               return (
                 <button
                   key={suggestion.place_id}
                   onClick={() => handleSelectSuggestion(index)}
                   className={cn(
                     "w-full px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0",
                     isHighlighted ? "bg-primary/10" : "hover:bg-muted/50"
                   )}
                 >
                   <div className="flex items-start gap-3">
                     <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                       <div className="font-semibold text-sm truncate">
                         {primary}
                       </div>
                       {secondary && (
                         <div className="text-xs text-muted-foreground truncate mt-0.5">
                           {secondary}
                         </div>
                       )}
                     </div>
                     <Badge
                       variant="outline"
                       className={cn(
                         "text-xs font-medium border flex-shrink-0",
                         getAddressTypeBadgeVariant(suggestion.addresstype)
                       )}
                     >
                       {suggestion.addresstype}
                     </Badge>
                   </div>
                 </button>
               )
             })}
          </div>
        )}
      </div>

      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <Badge
              key={location.id}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1 rounded-full"
            >
              <MapPin className="h-3 w-3" />
              {location.text}
              <button
                onClick={() => onRemoveLocation(location.id)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
