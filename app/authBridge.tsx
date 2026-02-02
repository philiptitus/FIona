"use client"

import { useEffect } from "react"
import { useAuth } from "react-oidc-context"
import { authManager } from "@/lib/authManager"

/**
 * Component that bridges react-oidc-context with the authManager
 * so that non-React code (like axios interceptors) can access auth functions
 */
export default function AuthBridge() {
  const auth = useAuth()

  useEffect(() => {
    if (auth.isAuthenticated) {
      // Set up auth functions for the authManager
      authManager.setAuthFunctions(
        () => auth.signinSilent(),
        () => auth.signoutRedirect()
      )
    }

    return () => {
      authManager.clearAuthFunctions()
    }
  }, [auth.isAuthenticated, auth])

  // Set up proactive token refresh before expiry
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user?.expires_at) return

    const expiresAt = auth.user.expires_at * 1000 // Convert to ms
    const now = Date.now()
    const refreshBuffer = 60 * 1000 // Refresh 60 seconds before expiry
    const timeUntilRefresh = expiresAt - now - refreshBuffer

    if (timeUntilRefresh <= 0) {
      // Token already expired or about to expire, refresh now
      auth.signinSilent().catch(console.error)
      return
    }

    // Schedule proactive refresh
    const refreshTimer = setTimeout(async () => {
      try {
        const user = await auth.signinSilent()
        if (user?.id_token) {
          localStorage.setItem("token", user.id_token)
          if (user.refresh_token) {
            localStorage.setItem("refreshToken", user.refresh_token)
          }
          if (user.expires_at) {
            localStorage.setItem("tokenExpiry", String(user.expires_at * 1000))
          }
        }
      } catch (error) {
        console.error("Proactive token refresh failed:", error)
      }
    }, timeUntilRefresh)

    return () => clearTimeout(refreshTimer)
  }, [auth.isAuthenticated, auth.user?.expires_at, auth])

  return null
}
