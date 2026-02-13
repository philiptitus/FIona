"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, X, AlertCircle } from "lucide-react"

interface BulkResearchFloatingBarProps {
  selectedCount: number
  maxCount: number
  onResearchClick: () => void
  onClearClick: () => void
}

export function BulkResearchFloatingBar({
  selectedCount,
  maxCount,
  onResearchClick,
  onClearClick,
}: BulkResearchFloatingBarProps) {
  if (selectedCount === 0) return null

  const isOverLimit = selectedCount > maxCount
  const isDisabled = selectedCount === 0 || isOverLimit

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
      <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/90 dark:to-indigo-950/90 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">
              {selectedCount}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-purple-900 dark:text-purple-100">
                {selectedCount} contact{selectedCount !== 1 ? "s" : ""} selected
              </p>
              {isOverLimit && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Maximum {maxCount} contacts allowed
                </p>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-purple-300 dark:bg-purple-700" />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClearClick}
              className="h-9"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={onResearchClick}
              disabled={isDisabled}
              className="h-9 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Research Selected
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
