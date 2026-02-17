"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { selectAllDispatches, removeDispatch, updateDispatchStatus } from "@/store/slices/processingDispatchesSlice"
import { useRouter } from "next/navigation"
import { Clock, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createNotificationPoller } from "@/store/utils/notificationPolling"

export default function GlobalDispatchProcessingBanner() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const allDispatches = useSelector((state: RootState) => selectAllDispatches(state))
  const processingDispatches = useMemo(() => 
    allDispatches.filter((d) => d.status === "processing" || d.status === "scheduled"),
  [allDispatches])
  const [progress, setProgress] = useState<Record<number, number>>({})
  const pollerRef = useRef<ReturnType<typeof createNotificationPoller> | null>(null)
  const processingDispatchesRef = useRef(processingDispatches)

  // Keep ref in sync with state for the poller callback
  useEffect(() => {
    processingDispatchesRef.current = processingDispatches
  }, [processingDispatches])

  // Initialize progress when dispatch is added
  useEffect(() => {
    processingDispatches.forEach((dispatchItem) => {
      if (progress[dispatchItem.campaignId] === undefined) {
        // Initialize progress
        setProgress((prev) => ({
          ...prev,
          [dispatchItem.campaignId]: 10, // Start at 10%
        }))
      }
    })
  }, [processingDispatches, dispatch, progress])

  // Notification Polling
  useEffect(() => {
    if (processingDispatches.length > 0) {
      if (!pollerRef.current) {
        pollerRef.current = createNotificationPoller(
          { notificationType: "campaign_sent" },
          {
            interval: 3000,
            onPoll: (notifications) => {
              const currentDispatches = processingDispatchesRef.current
              currentDispatches.forEach((dispatchItem) => {
                // Check for matching notification
                const match = notifications.find((n) => 
                  n.notification_type === "campaign_sent" && 
                  (
                    (n.metadata?.campaign_id && Number(n.metadata.campaign_id) === dispatchItem.campaignId) || 
                    (n.metadata?.token && n.metadata.token === dispatchItem.token)
                  )
                )

                if (match) {
                  dispatch(updateDispatchStatus({
                    campaignId: dispatchItem.campaignId,
                    status: "completed"
                  }))
                  // Force progress to 100%
                  setProgress((prev) => ({
                    ...prev,
                    [dispatchItem.campaignId]: 100
                  }))

                  // Navigate and cleanup after a brief delay
                  setTimeout(() => {
                    router.push("/sent-emails")
                    setTimeout(() => {
                      dispatch(removeDispatch(dispatchItem.campaignId))
                    }, 500)
                  }, 1000)
                }
              })
            }
          }
        )
        pollerRef.current.start()
      }
    } else {
      if (pollerRef.current) {
        pollerRef.current.stop()
        pollerRef.current = null
      }
    }

    return () => {
      if (pollerRef.current) {
        pollerRef.current.stop()
        pollerRef.current = null
      }
    }
  }, [processingDispatches, dispatch, router])

  if (processingDispatches.length === 0) return null

  return (
    <AnimatePresence>
      {processingDispatches.map((dispatchItem) => {
        const progressValue = progress[dispatchItem.campaignId] || 0
        const isScheduled = dispatchItem.status === "scheduled"
        const displayText = isScheduled
          ? `📅 Campaign scheduled for ${dispatchItem.scheduleDay || 'next'} - ${dispatchItem.recipientsCount || 0} recipients`
          : `✉️ Sending emails from ${dispatchItem.mailboxIds.length} mailbox${dispatchItem.mailboxIds.length !== 1 ? "es" : ""}...`

        return (
          <motion.div
            key={dispatchItem.campaignId}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-4 left-4 z-40 max-w-sm bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/30 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  <div className="mt-0.5 flex-shrink-0">
                    {isScheduled ? (
                      <div className="text-2xl">📅</div>
                    ) : (
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-200">{displayText}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {dispatchItem.dispatchType === "content" ? "Plain text content" : "HTML template"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    dispatch(removeDispatch(dispatchItem.campaignId))
                    setProgress((prev) => {
                      const updated = { ...prev }
                      delete updated[dispatchItem.campaignId]
                      return updated
                    })
                  }}
                  className="flex-shrink-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar - only show for processing, not scheduled */}
              {!isScheduled && (
                <>
                  <div className="mt-2 bg-blue-200 dark:bg-blue-800/40 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-full rounded-full"
                      animate={{ width: `${Math.min(progressValue, 100)}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}
