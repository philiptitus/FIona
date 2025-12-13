"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { selectAllDispatches, removeDispatch, updateDispatchStatus } from "@/store/slices/processingDispatchesSlice"
import { pollDispatchStatus } from "@/store/actions/processingDispatchesActions"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock, AlertCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function GlobalDispatchProcessingBanner() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const allDispatches = useSelector((state: RootState) => selectAllDispatches(state))
  const processingDispatches = allDispatches.filter((d) => d.status === "processing" || d.status === "scheduled")
  const [progress, setProgress] = useState<Record<number, number>>({})
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  // Initialize polling when dispatch is added
  useEffect(() => {
    processingDispatches.forEach((dispatchItem) => {
      if (!progress[dispatchItem.campaignId]) {
        // Start polling
        dispatch(pollDispatchStatus(dispatchItem.campaignId) as any)

        // Initialize progress
        setProgress((prev) => ({
          ...prev,
          [dispatchItem.campaignId]: Math.random() * 40 + 10, // 10-50%
        }))
      }
    })
  }, [processingDispatches, dispatch, progress])

  // Simulate progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const updated = { ...prev }
        processingDispatches.forEach((d) => {
          if (updated[d.campaignId] && updated[d.campaignId] < 90) {
            updated[d.campaignId] += Math.random() * 15
          }
        })
        return updated
      })
    }, 2000)

    return () => clearInterval(progressInterval)
  }, [processingDispatches])

  // Handle completion and scheduled status
  useEffect(() => {
    allDispatches.forEach((dispatchItem) => {
      if ((dispatchItem.status === "completed" || dispatchItem.status === "failed") && !dismissedNotifications.has(dispatchItem.campaignId.toString())) {
        // Show toast
        const newDismissed = new Set(dismissedNotifications)
        newDismissed.add(dispatchItem.campaignId.toString())
        setDismissedNotifications(newDismissed)

        // Redirect to sent emails after 1 second
        setTimeout(() => {
          router.push("/sent-emails")
          // Clean up after redirect
          setTimeout(() => {
            dispatch(removeDispatch(dispatchItem.campaignId))
            setProgress((prev) => {
              const updated = { ...prev }
              delete updated[dispatchItem.campaignId]
              return updated
            })
          }, 500)
        }, 1000)
      }
    })
  }, [allDispatches, dismissedNotifications, dispatch, router])

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
                      animate={{ width: `${Math.min(progressValue, 90)}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    />
                  </div>

                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1 flex justify-between">
                    <span>Processing</span>
                    <span>{Math.min(Math.round(progressValue), 90)}%</span>
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
