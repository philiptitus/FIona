"use client"

import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
// @ts-ignore
import { getAuth, signInWithCustomToken, type Auth } from "firebase/auth"
// @ts-ignore
import { getDatabase, ref, onValue, off, type Database, type DataSnapshot } from "firebase/database"
import { firebaseApp } from "@/lib/firebaseConfig"
import api from "@/lib/api"
import {
  setConnecting,
  setConnected,
  setError,
} from "@/store/slices/firebaseAuthSlice"
import { addFirebaseNotification } from "@/store/slices/firebaseNotificationsSlice"
import type { FirebaseNotification } from "@/store/slices/firebaseNotificationsSlice"
import { fetchNotificationById } from "@/store/actions/notificationActions"

export const useFirebaseNotifications = () => {
  const dispatch = useDispatch()
  const firebaseAuthStatus = useSelector((state: any) => state.firebaseAuth?.status)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Only initialize once
    if (firebaseAuthStatus !== "idle") return

    const initializeFirebase = async () => {
      try {
        console.log("[Firebase] Starting initialization...")
        dispatch(setConnecting())

        // Step 1: Get Firebase token from backend
        console.log("[Firebase] Fetching token from backend...")
        const response = await api.post("/access/firebase-token/")
        const { firebaseToken } = response.data

        if (!firebaseToken) {
          throw new Error("No Firebase token received from backend")
        }
        console.log("[Firebase] Token received successfully")

        // Step 2: Sign in to Firebase with custom token
        console.log("[Firebase] Signing in with custom token...")
        const auth = getAuth(firebaseApp)
        const userCredential = await signInWithCustomToken(auth, firebaseToken)
        const userId = userCredential.user.uid
        console.log("[Firebase] ✓ Successfully connected as user:", userId)

        // Step 3: Update Redux state
        dispatch(setConnected(userId))

        // Step 4: Set up real-time listener for notifications
        console.log("[Firebase] Setting up real-time listener for:", `notifications/${userId}`)
        const database = getDatabase(firebaseApp)
        const notificationsRef = ref(database, `notifications/${userId}`)

        onValue(
          notificationsRef,
          async (snapshot: DataSnapshot) => {
            const data = snapshot.val()
            console.log("[Firebase] Received data from listener:", data)
            if (data) {
              // Handle both object and array of notifications
              const notificationsArray = Array.isArray(data)
                ? data
                : Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...(value as Record<string, any>),
                  }))

              console.log("[Firebase] Processing", notificationsArray.length, "notification(s)")
              notificationsArray.forEach(async (notification: Record<string, any>) => {
                const notificationId = notification.id || Math.random().toString()
                console.log("[Firebase] Fetching full notification details for ID:", notificationId)
                // Fetch full notification from backend
                try {
                  const response = await api.get(`/mail/notifications/${notificationId}/`)
                  const fullNotification = response.data.notification
                  console.log("[Firebase] ✓ Received full notification:", fullNotification)
                  
                  // Convert to FirebaseNotification and add to state
                  const firebaseNotif: FirebaseNotification = {
                    id: String(fullNotification.id),
                    title: fullNotification.title || "Notification",
                    message: fullNotification.message || "",
                    type: fullNotification.notification_type || "info",
                    timestamp: new Date(fullNotification.created_at).getTime(),
                    read: fullNotification.is_read || false,
                  }
                  console.log("[Firebase] Adding to firebaseNotifications store:", firebaseNotif)
                  dispatch(addFirebaseNotification(firebaseNotif))
                } catch (error: any) {
                  console.error("[Firebase] ✗ Failed to fetch notification:", notificationId, error)
                }
              })
            } else {
              console.log("[Firebase] No data in notifications path")
            }
          },
          (error: Error) => {
            console.error("[Firebase] ✗ Listener error:", error)
            dispatch(setError(error.message))
          }
        )

        // Store cleanup function
        unsubscribeRef.current = () => {
          off(notificationsRef)
        }
      } catch (error: any) {
        console.error("[Firebase] ✗ Initialization error:", error)
        dispatch(setError(error.message || "Failed to connect to Firebase"))
      }
    }

    initializeFirebase()

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [dispatch, firebaseAuthStatus])
}
