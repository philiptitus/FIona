"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { removeDispatch } from "@/store/slices/processingDispatchesSlice"
import { Loader2, X, Clock } from "lucide-react"

export default function EmailSchedulingFloat() {
  const dispatch = useDispatch()
  const processingDispatches = useSelector((state: RootState) => state.processingDispatches?.dispatches || [])

  if (!processingDispatches || processingDispatches.length === 0) {
    return null
  }

  // Show first dispatch that is active (processing or scheduled)
  const activeDispatch = processingDispatches.find(
    (d) => d.status === "processing" || d.status === "scheduled"
  )

  if (!activeDispatch) {
    return null
  }

  const handleDismiss = () => {
    dispatch(removeDispatch(activeDispatch.token))
  }

  const isScheduled = activeDispatch.type === "scheduled"
  const title = isScheduled ? "Campaign Scheduled" : "Sending Campaign..."
  const description = isScheduled
    ? `Scheduled for ${activeDispatch.scheduled_date || "upcoming date"}`
    : `Sending to ${activeDispatch.recipients_count || 0} recipient(s)...`

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)]">
      <div className="p-4 shadow-lg border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {isScheduled ? (
              <Clock className="h-5 w-5 text-purple-600 animate-pulse" />
            ) : (
              <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
                  {title}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 truncate">
                  {activeDispatch.campaign_name}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="h-6 w-6 flex-shrink-0 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800 rounded"
              >
                <X className="h-4 w-4 text-purple-600 dark:text-purple-300" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
