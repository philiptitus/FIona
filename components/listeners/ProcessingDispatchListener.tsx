"use client"

import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { removeDispatch } from "@/store/slices/processingDispatchesSlice"

/**
 * Global listener component that automatically dismisses processing dispatches
 * when their corresponding Firebase notifications are received.
 * 
 * This component should be placed at the app layout level to work across all pages.
 * It listens for dispatch-related notifications and removes them from the processing queue.
 */
export default function ProcessingDispatchListener() {
  const dispatch = useDispatch()
  const firebaseNotifications = useSelector((state: RootState) => state.firebaseNotifications?.notifications || [])
  const processedNotificationIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (firebaseNotifications.length === 0) return

    const latestNotification = firebaseNotifications[0]
    const dispatchNotificationTypes = ['campaign_sent', 'campaign_partial', 'campaign_failed', 'sequence_scheduled', 'sequence_schedule_failed']
    
    if (
      dispatchNotificationTypes.includes(latestNotification.type) &&
      !processedNotificationIdsRef.current.has(latestNotification.id)
    ) {
      processedNotificationIdsRef.current.add(latestNotification.id)
      
      // Match by token from metadata and dismiss the dispatch float
      const token = latestNotification.metadata?.token
      if (token) {
        dispatch(removeDispatch(token))
      }
    }
  }, [firebaseNotifications, dispatch])

  // This component has no UI, it just manages side effects
  return null
}
