// Auth manager to bridge react-oidc-context with axios interceptor
// This allows non-React code (api.ts) to access auth functions

import type { User } from "oidc-client-ts"

type SigninSilentFn = () => Promise<User | null>
type SignoutRedirectFn = () => Promise<void>

let signinSilent: SigninSilentFn | null = null
let signoutRedirect: SignoutRedirectFn | null = null

export const authManager = {
  setAuthFunctions: (
    silentFn: SigninSilentFn,
    signoutFn: SignoutRedirectFn
  ) => {
    signinSilent = silentFn
    signoutRedirect = signoutFn
  },

  clearAuthFunctions: () => {
    signinSilent = null
    signoutRedirect = null
  },

  refreshToken: async (): Promise<string | null> => {
    if (!signinSilent) {
      console.warn("Auth functions not initialized")
      return null
    }

    try {
      const user = await signinSilent()
      if (user?.id_token) {
        // Update localStorage with new token
        localStorage.setItem("token", user.id_token)
        if (user.refresh_token) {
          localStorage.setItem("refreshToken", user.refresh_token)
        }
        if (user.expires_at) {
          localStorage.setItem("tokenExpiry", String(user.expires_at * 1000))
        }
        return user.id_token
      }
      return null
    } catch (error) {
      console.error("Silent refresh failed:", error)
      return null
    }
  },

  logout: async () => {
    if (signoutRedirect) {
      await signoutRedirect()
    }
  },

  // Check if token is expired or about to expire (within 60 seconds)
  isTokenExpiringSoon: (): boolean => {
    const expiryStr = localStorage.getItem("tokenExpiry")
    if (!expiryStr) return true
    
    const expiryMs = parseInt(expiryStr, 10)
    const now = Date.now()
    const bufferMs = 60 * 1000 // 60 seconds buffer
    
    return now >= expiryMs - bufferMs
  },
}
