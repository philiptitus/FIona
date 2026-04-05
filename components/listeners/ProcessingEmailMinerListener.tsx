"use client"

import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { removeProcessingEmailMiner } from "@/store/slices/processingEmailMinersSlice"

/**
 * Global listener component that automatically dismisses processing email miners
 * when their corresponding Firebase notifications are received.
 * 
 * This component should be placed at the app layout level to work across all pages.
 * It listens for email mining completion notifications and removes them from the processing queue.
 */
export default function ProcessingEmailMinerListener() {
  const dispatch = useDispatch()
  const firebaseNotifications = useSelector((state: RootState) => state.firebaseNotifications?.notifications || [])
  const processedNotificationIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (firebaseNotifications.length === 0) return

    const latestNotification = firebaseNotifications[0]
    
    if (
      latestNotification.type === 'email_mining_complete' &&
      !processedNotificationIdsRef.current.has(latestNotification.id)
    ) {
      processedNotificationIdsRef.current.add(latestNotification.id)
      
      // Match by token from metadata and dismiss the email mining float
      const token = latestNotification.metadata?.token
      if (token) {
        dispatch(removeProcessingEmailMiner(token))
      }
    }
  }, [firebaseNotifications, dispatch])

  // This component has no UI, it just manages side effects
  return null
}
