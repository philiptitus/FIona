import { Middleware } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { loginSuccess, logout } from "../slices/authSlice"

export const authMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Handle successful login
  if (loginSuccess.match(action)) {
    const { token, refreshToken, user, expiresAt } = action.payload
    localStorage.setItem("token", token)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(user))
    // Use Cognito's expiresAt (in seconds) converted to ms, or fallback to 1 hour
    const expiryMs = expiresAt ? expiresAt * 1000 : Date.now() + 60 * 60 * 1000
    localStorage.setItem("tokenExpiry", String(expiryMs))
  }

  // Handle logout
  if (logout.match(action)) {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    localStorage.removeItem("tokenExpiry")
  }

  return next(action)
}
