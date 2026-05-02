"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FieldGroup {
  title: string
  fields: { id: string; label: string; costIndicator: "low" | "medium" | "high" }[]
}

interface FieldMaskSelectorProps {
  selected: string[]
  onSelectionChange: (selected: string[]) => void
}

export default function FieldMaskSelector({
  selected,
  onSelectionChange,
}: FieldMaskSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const fieldGroups: FieldGroup[] = [
    {
      title: "Essential Info",
      fields: [
        { id: "places.id", label: "Place ID", costIndicator: "low" },
        { id: "places.displayName.text", label: "Business Name", costIndicator: "low" },
        { id: "places.formattedAddress", label: "Address", costIndicator: "low" },
        { id: "places.location", label: "Coordinates (Lat/Lng)", costIndicator: "low" },
        { id: "places.rating", label: "Rating", costIndicator: "low" },
        { id: "places.userRatingCount", label: "Review Count", costIndicator: "low" },
      ],
    },
    {
      title: "Contact Details",
      fields: [
        { id: "places.nationalPhoneNumber", label: "Phone Number", costIndicator: "medium" },
        { id: "places.internationalPhoneNumber", label: "International Phone", costIndicator: "medium" },
        { id: "places.websiteUri", label: "Website URL", costIndicator: "medium" },
      ],
    },
    {
      title: "Business Info",
      fields: [
        { id: "places.businessStatus", label: "Business Status", costIndicator: "low" },
        { id: "places.types", label: "Place Types", costIndicator: "low" },
        { id: "places.primaryType", label: "Primary Type", costIndicator: "low" },
        { id: "places.primaryTypeDisplayName.text", label: "Primary Type Display", costIndicator: "low" },
        { id: "places.shortFormattedAddress", label: "Short Address", costIndicator: "low" },
        { id: "places.adrFormatAddress", label: "ADR Address", costIndicator: "low" },
        { id: "places.iconMaskBaseUri", label: "Icon URI", costIndicator: "low" },
        { id: "places.iconBackgroundColor", label: "Icon Color", costIndicator: "low" },
      ],
    },
    {
      title: "Operating Hours",
      fields: [
        { id: "places.currentOpeningHours", label: "Current Hours", costIndicator: "medium" },
        { id: "places.currentSecondaryOpeningHours", label: "Secondary Hours", costIndicator: "medium" },
        { id: "places.regularOpeningHours", label: "Regular Hours", costIndicator: "medium" },
        { id: "places.regularSecondaryOpeningHours", label: "Regular Secondary Hours", costIndicator: "high" },
        { id: "places.utcOffsetMinutes", label: "UTC Offset", costIndicator: "low" },
      ],
    },
    {
      title: "Location Details",
      fields: [
        { id: "places.viewport", label: "Viewport", costIndicator: "low" },
        { id: "places.plusCode", label: "Plus Code", costIndicator: "low" },
        { id: "places.addressComponents", label: "Address Components", costIndicator: "medium" },
        { id: "places.googleMapsUri", label: "Google Maps Link", costIndicator: "low" },
      ],
    },
    {
      title: "Reviews & Photos",
      fields: [
        { id: "places.reviews", label: "User Reviews", costIndicator: "high" },
        { id: "places.photos", label: "Photos", costIndicator: "high" },
        { id: "places.editorialSummary.text", label: "Editorial Summary", costIndicator: "medium" },
      ],
    },
    {
      title: "Pricing & Amenities",
      fields: [
        { id: "places.priceLevel", label: "Price Level", costIndicator: "medium" },
        { id: "places.restroom", label: "Restroom Available", costIndicator: "medium" },
        { id: "places.accessibilityOptions", label: "Accessibility", costIndicator: "medium" },
        { id: "places.parkingOptions", label: "Parking Options", costIndicator: "medium" },
        { id: "places.paymentOptions", label: "Payment Methods", costIndicator: "medium" },
      ],
    },
    {
      title: "Dining Options (Restaurants)",
      fields: [
        { id: "places.takeout", label: "Takeout Available", costIndicator: "medium" },
        { id: "places.delivery", label: "Delivery Available", costIndicator: "medium" },
        { id: "places.dineIn", label: "Dine-In Available", costIndicator: "medium" },
        { id: "places.curbsidePickup", label: "Curbside Pickup", costIndicator: "medium" },
        { id: "places.reservable", label: "Reservations Accepted", costIndicator: "medium" },
        { id: "places.servesBeer", label: "Serves Beer", costIndicator: "medium" },
        { id: "places.servesWine", label: "Serves Wine", costIndicator: "medium" },
        { id: "places.servesBreakfast", label: "Serves Breakfast", costIndicator: "medium" },
        { id: "places.servesLunch", label: "Serves Lunch", costIndicator: "medium" },
        { id: "places.servesDinner", label: "Serves Dinner", costIndicator: "medium" },
        { id: "places.servesBrunch", label: "Serves Brunch", costIndicator: "medium" },
        { id: "places.servesVegetarianFood", label: "Vegetarian Options", costIndicator: "medium" },
      ],
    },
    {
      title: "Attributes",
      fields: [
        { id: "places.outdoorSeating", label: "Outdoor Seating", costIndicator: "medium" },
        { id: "places.liveMusic", label: "Live Music", costIndicator: "medium" },
        { id: "places.menuForChildren", label: "Kids Menu", costIndicator: "medium" },
        { id: "places.servesCocktails", label: "Serves Cocktails", costIndicator: "medium" },
        { id: "places.servesDessert", label: "Serves Dessert", costIndicator: "medium" },
        { id: "places.servesCoffee", label: "Serves Coffee", costIndicator: "medium" },
        { id: "places.goodForChildren", label: "Good for Children", costIndicator: "medium" },
        { id: "places.goodForGroups", label: "Good for Groups", costIndicator: "medium" },
        { id: "places.goodForWatchingSports", label: "Good for Sports", costIndicator: "medium" },
        { id: "places.allowsDogs", label: "Allows Dogs", costIndicator: "medium" },
      ],
    },
    {
      title: "Fuel & EV (Gas Stations)",
      fields: [
        { id: "places.fuelOptions", label: "Fuel Options", costIndicator: "high" },
        { id: "places.evChargeOptions", label: "EV Charging", costIndicator: "high" },
      ],
    },
    {
      title: "Additional Fields",
      fields: [
        { id: "places.attributions", label: "Attributions", costIndicator: "low" },
        { id: "places.websiteUri", label: "Website", costIndicator: "low" },
        { id: "places.pureServiceAreaBusiness", label: "Service Area Only", costIndicator: "low" },
        { id: "nextPageToken", label: "Next Page Token (Required for pagination)", costIndicator: "low" },
      ],
    },
  ]

  const getCostColor = (cost: string) => {
    switch (cost) {
      case "low":
        return "text-green-600 dark:text-green-400"
      case "medium":
        return "text-amber-600 dark:text-amber-400"
      case "high":
        return "text-red-600 dark:text-red-400"
      default:
        return ""
    }
  }

  const costBreakdown = {
    low: selected.filter((s) =>
      fieldGroups
        .flatMap((g) => g.fields)
        .find((f) => f.id === s && f.costIndicator === "low")
    ).length,
    medium: selected.filter((s) =>
      fieldGroups
        .flatMap((g) => g.fields)
        .find((f) => f.id === s && f.costIndicator === "medium")
    ).length,
    high: selected.filter((s) =>
      fieldGroups
        .flatMap((g) => g.fields)
        .find((f) => f.id === s && f.costIndicator === "high")
    ).length,
  }

  const totalCost = costBreakdown.low * 1 + costBreakdown.medium * 3 + costBreakdown.high * 5
  const maxCost = 100
  const costPercentage = (totalCost / maxCost) * 100

  const handleToggleField = (fieldId: string) => {
    const updated = selected.includes(fieldId)
      ? selected.filter((s) => s !== fieldId)
      : [...selected, fieldId]
    onSelectionChange(updated)
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all h-11 shadow-sm"
      >
        <span className="font-semibold text-base flex items-center gap-2">
          Fields: 
          <span className="px-2 py-0.5 bg-primary/15 text-primary rounded-md text-sm font-bold border border-primary/30">
            {selected.length}
          </span>
          selected
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
        <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm">
          {/* Field Groups */}
          <div className="space-y-6">
            {fieldGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/70">
                  {group.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={field.id}
                        checked={selected.includes(field.id)}
                        onCheckedChange={() => handleToggleField(field.id)}
                      />
                      <Label
                        htmlFor={field.id}
                        className="flex-1 cursor-pointer flex items-center gap-2"
                      >
                        {field.label}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Cost: {field.costIndicator}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <span className={`text-xs font-medium ${getCostColor(field.costIndicator)}`}>
                        {field.costIndicator.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cost Indicator */}
          <div className="pt-6 border-t border-border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Estimated Cost Impact</span>
              <span className={`font-semibold ${
                costPercentage < 50
                  ? "text-green-600 dark:text-green-400"
                  : costPercentage < 80
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
              }`}>
                {totalCost > maxCost ? "High" : totalCost > 50 ? "Medium" : "Low"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  costPercentage < 50
                    ? "bg-green-500"
                    : costPercentage < 80
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${Math.min(costPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Preview */}
          {selected.length > 0 && (
            <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
              Selected: {selected.join(", ")}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
