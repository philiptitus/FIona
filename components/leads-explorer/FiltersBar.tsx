"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, X } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FilterState {
  isOpenNow?: boolean
  minRating?: number
  priceLevel?: string[]
  businessType?: string
}

interface FiltersBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFilterCount = [
    filters.isOpenNow,
    filters.minRating && filters.minRating > 0,
    filters.priceLevel && filters.priceLevel.length > 0,
    filters.businessType,
  ].filter(Boolean).length

  const handleRemoveFilter = (key: keyof FilterState) => {
    const updated = { ...filters }
    if (key === "minRating") {
      updated.minRating = undefined
    } else if (key === "priceLevel") {
      updated.priceLevel = undefined
    } else if (key === "businessType") {
      updated.businessType = undefined
    } else if (key === "isOpenNow") {
      updated.isOpenNow = undefined
    }
    onFiltersChange(updated)
  }

  return (
    <div className="space-y-3">
      {/* Filter Chips Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {filters.isOpenNow && (
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
            <span>Open Now</span>
            <button
              onClick={() => handleRemoveFilter("isOpenNow")}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {filters.minRating && filters.minRating > 0 && (
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
            <span>Rating ≥ {filters.minRating}⭐</span>
            <button
              onClick={() => handleRemoveFilter("minRating")}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {filters.priceLevel && filters.priceLevel.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
            <span>Price: {filters.priceLevel.length} selected</span>
            <button
              onClick={() => handleRemoveFilter("priceLevel")}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {filters.businessType && (
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
            <span>{filters.businessType}</span>
            <button
              onClick={() => handleRemoveFilter("businessType")}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm h-9"
        >
          <ChevronDown
            className={`h-4 w-4 mr-2 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
          <span className="font-medium">
            Filters {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </span>
        </Button>
      </div>

      {/* Expanded Filters Panel */}
      {isExpanded && (
        <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm">
          {/* Open Now Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="open-now" className="text-base font-medium cursor-pointer">
              Open Now
            </Label>
            <Switch
              id="open-now"
              checked={filters.isOpenNow || false}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, isOpenNow: checked })
              }
            />
          </div>

          {/* Rating Slider */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Minimum Rating: {filters.minRating || 0}⭐
            </Label>
            <Slider
              value={[filters.minRating || 0]}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, minRating: value[0] })
              }
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Price Levels */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Price Levels</Label>
            <div className="flex flex-wrap gap-2">
              {["$", "$$", "$$$", "$$$$"].map((level) => (
                <Badge
                  key={level}
                  variant={
                    filters.priceLevel?.includes(level) ? "default" : "outline"
                  }
                  className="cursor-pointer px-4 py-2 text-sm font-medium"
                  onClick={() => {
                    const current = filters.priceLevel || []
                    const updated = current.includes(level)
                      ? current.filter((p) => p !== level)
                      : [...current, level]
                    onFiltersChange({
                      ...filters,
                      priceLevel: updated.length > 0 ? updated : undefined,
                    })
                  }}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          {/* Business Type */}
          <div className="space-y-3">
            <Label htmlFor="business-type" className="text-base font-medium">
              Business Type
            </Label>
            <Select
              value={filters.businessType || ""}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  businessType: value ? value : undefined,
                })
              }
            >
              <SelectTrigger id="business-type" className="w-full rounded-lg">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="cafe">Cafe</SelectItem>
                <SelectItem value="gym">Gym</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}
    </div>
  )
}
