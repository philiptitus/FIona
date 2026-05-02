"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

interface GooglePlacesPaginationControlsProps {
  currentPageSize: number
  hasNextPage: boolean
  hasPreviousPages: boolean
  resultCount: number
  onNextPage: () => void
  onPreviousPage: () => void
  onPageSizeChange: (size: number) => void
  onReset: () => void
  isLoading?: boolean
}

export default function GooglePlacesPaginationControls({
  currentPageSize,
  hasNextPage,
  hasPreviousPages,
  resultCount,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  onReset,
  isLoading = false,
}: GooglePlacesPaginationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-card via-card/95 to-card border border-border/50 rounded-xl shadow-sm">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">{resultCount}</span>{" "}
        result{resultCount !== 1 ? "s" : ""}
        {hasNextPage && (
          <span className="ml-1 text-primary">• More available</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Page Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">
            Per page:
          </span>
          <Select
            value={currentPageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-20 h-9 text-sm rounded-lg border-border/60 hover:border-primary/50 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {/* Reset/Previous Button */}
          {hasPreviousPages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isLoading || !hasPreviousPages}
              className="h-9 px-3 rounded-lg border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          {/* Next Page Button - Only show if nextPageToken exists */}
          {hasNextPage && (
            <Button
              variant="default"
              size="sm"
              onClick={onNextPage}
              disabled={isLoading}
              className="h-9 px-3 rounded-lg transition-all bg-primary hover:bg-primary/90 shadow-sm"
            >
              <span className="hidden sm:inline mr-1.5">Next Page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
