"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { removeProcessingEmailMiner } from "@/store/slices/processingEmailMinersSlice"
import { Loader2, X } from "lucide-react"

export default function EmailMiningFloat() {
  const dispatch = useDispatch()
  const processingMiners = useSelector((state: RootState) => state.processingEmailMiners?.miners || [])

  if (!processingMiners || processingMiners.length === 0) {
    return null
  }

  const miner = processingMiners[0]

  const handleDismiss = () => {
    dispatch(removeProcessingEmailMiner(miner.token))
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)]">
      <div className="p-4 shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                  Extracting Emails...
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                  {miner.name}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="h-6 w-6 flex-shrink-0 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
              >
                <X className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Processing your CSV file and extracting company emails...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
